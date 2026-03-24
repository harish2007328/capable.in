import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import { DodoPayments } from 'dodopayments';
import { createClient } from '@insforge/sdk';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// oauth2client is instantiated dynamically inside routes now

const getInsForgePassword = (sub, customSalt = '__DEFAULT_SALT__') => {
    // If explicit null or empty string, use NO salt (raw hash or raw string)
    if (customSalt === null || customSalt === '') {
        return sub; // Return raw sub if no salt is intended (for recovery)
    }
    const salt = customSalt === '__DEFAULT_SALT__' ? (process.env.AUTH_SALT || 'capable-auth-salt') : customSalt;
    return crypto.createHmac('sha256', salt)
        .update(sub)
        .digest('hex');
};

app.use(express.static(path.join(__dirname, 'dist')));

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("No Groq API Key found in environment variables.");
    }
    return new Groq({ apiKey });
};

let dodoPayments;
try {
    if (process.env.DODO_PAYMENTS_API_KEY) {
        dodoPayments = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY,
            environment: process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode'
        });
        console.log("✅ Dodo SDK initialized");
    } else {
        console.warn("⚠️ Dodo API Key missing. Checkout will be disabled.");
    }
} catch (e) {
    console.error("❌ Dodo Initialization Error:", e.message);
}

console.log("Dodo SDK initialized on:", process.env.DODO_PAYMENTS_MODE === 'live' ? 'LIVE' : 'TEST');
if (process.env.DODO_PAYMENTS_API_KEY) {
    console.log("Key prefix:", process.env.DODO_PAYMENTS_API_KEY.substring(0, 5) + "...");
}

const insforge = createClient({
    baseUrl: process.env.VITE_INSFORGE_URL,
    anonKey: process.env.VITE_INSFORGE_ANON_KEY
});

const MODEL = "llama-3.1-8b-instant"; // Best balance of performance and high TPM limits

// --- RESEARCH HELPERS ---

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

async function scrapeDuckDuckGo(query, location = null) {
    try {
        // Map common country names to DuckDuckGo kl codes
        const klMap = {
            'india': 'in-en',
            'united states': 'us-en',
            'usa': 'us-en',
            'united kingdom': 'uk-en',
            'uk': 'uk-en',
            'canada': 'ca-en',
            'australia': 'au-en',
            'germany': 'de-de',
            'france': 'fr-fr',
            'china': 'cn-zh',
            'japan': 'jp-jp',
            'brazil': 'br-pt'
        };

        let kl = '';
        if (location && typeof location === 'object') {
            const country = location.country?.toLowerCase();
            kl = klMap[country] || '';
        }

        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}${kl ? `&kl=${kl}` : ''}`;
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);
        const results = [];
        $('.result__body').each((i, el) => {
            if (i < 8) { // Increased for better signals
                results.push({
                    title: $(el).find('.result__title').text().trim(),
                    description: $(el).find('.result__snippet').text().trim(),
                    domain: $(el).find('.result__url').text().trim()
                });
            }
        });
        console.log(`DDG results for "${query}": ${results.length}`);
        return results;
    } catch (err) {
        console.error("DDG Scrape Error:", err.message);
        return [];
    }
}

async function fetchRedditSignals(query) {
    try {
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=2&sort=relevance`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'CAPABLE-Audit-Bot/1.0.0',
                'Accept': 'application/json'
            }
        });
        const posts = data.data?.children?.map(child => ({
            title: child.data.title,
            text: child.data.selftext?.substring(0, 200) || ""
        })) || [];
        return posts;
    } catch (err) {
        return [];
    }
}

async function collectMarketSignals(idea, location = null) {
    const locStr = location ? ` in ${location.city || ''} ${location.country || ''}`.trim() : "";
    console.log(`\n--- Researching: ${idea}${locStr} ---`);

    const [searchSignals, competitionSignals, redditSignals, newsSignals] = await Promise.all([
        scrapeDuckDuckGo(`${idea}${locStr}`, location),
        scrapeDuckDuckGo(`${idea} competitors alternative ${locStr}`, location),
        fetchRedditSignals(idea),
        scrapeDuckDuckGo(`${idea} trends news 2024 2025`, location)
    ]);

    return {
        searchSignals: { organicResults: searchSignals },
        trendSignals: { evidenceCount: searchSignals.length + newsSignals.length, news: newsSignals },
        problemSignals: { redditDiscussions: redditSignals },
        competitionSignals: { links: competitionSignals.map(c => ({ title: c.title, domain: c.domain })) },
        location: location,
        timestamp: new Date().toISOString()
    };
}

// --- UTILS ---
async function withRetry(fn, retries = 2, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (err.status === 429 && i < retries - 1) {
                console.log(`Rate limit reached. Retrying mission control in ${delay * 5}ms...`);
                await new Promise(res => setTimeout(res, delay * 5));
                continue;
            }
            throw err;
        }
    }
}

// --- AUTH SESSION VERIFICATION ---
app.get('/api/auth/sessions/current', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ error: "No token provided" });
        }

        try {
            const response = await axios.get(`${process.env.VITE_INSFORGE_URL}/api/auth/sessions/current`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            res.json(response.data.user || response.data);
        } catch (insforgeErr) {
            console.error("InsForge Session Verification Failed:", insforgeErr.response?.data || insforgeErr.message);
            res.status(401).json({ error: "Invalid session token" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/google', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const trueHost = req.headers['x-forwarded-host'] || req.headers.host;
    const cleanHost = trueHost ? trueHost.replace(/^www\./, '') : 'localhost:3001';
    
    // Explicit production override to guarantee Google Console compliance
    // Even on Vercel Preview URLs, this forces OAuth to route safely through the whitelisted domain.
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
    const finalHost = (isProduction && cleanHost.includes('vercel.app')) ? 'capable.website' : cleanHost;

    const dynamicRedirectUri = `${protocol}://${finalHost}/api/auth/google/callback`;

    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        dynamicRedirectUri
    );

    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        prompt: 'consent'
    });
    res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const trueHost = req.headers['x-forwarded-host'] || req.headers.host;
        const cleanHost = trueHost ? trueHost.replace(/^www\./, '') : 'localhost:3001';
        
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
        const finalHost = (isProduction && cleanHost.includes('vercel.app')) ? 'capable.website' : cleanHost;

        const dynamicRedirectUri = `${protocol}://${finalHost}/api/auth/google/callback`;

        const client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            dynamicRedirectUri
        );

        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];

        const password = getInsForgePassword(googleId);
        let authData = null;

        // Step 1: Try login
        try {
            const { data } = await insforge.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (data?.accessToken) authData = data;
        } catch (err) {}

        // Step 2: Try signup or repair
        if (!authData) {
            const apiKey = process.env.INSFORGE_API_KEY;
            
            const verifyEmailAndLogin = async () => {
                try {
                    await axios.post(`${process.env.VITE_INSFORGE_URL}/api/admin/sql`, {
                        query: `UPDATE auth.users SET email_verified = true WHERE email = $1`,
                        params: [email]
                    }, { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } });
                } catch (e) {}
                
                try {
                    const { data } = await insforge.auth.signInWithPassword({ email, password });
                    if (data?.accessToken) return data;
                } catch (e) {}
                return null;
            };

            const { data: signUpData, error: signUpError } = await insforge.auth.signUp({
                email: email, password: password, name: name
            });

            if (signUpData?.accessToken) {
                authData = signUpData;
            } else if (signUpData?.requireEmailVerification) {
                authData = await verifyEmailAndLogin();
            } else if (signUpError && (signUpError.statusCode === 409 || signUpError.message?.includes('exists'))) {
                // Delete and recreate existing unlinked user exactly like in server.js
                if (apiKey) {
                    try {
                        const listRes = await axios.get(
                            `${process.env.VITE_INSFORGE_URL}/api/auth/users?search=${encodeURIComponent(email)}&limit=1`,
                            { headers: { 'x-api-key': apiKey } }
                        );
                        const users = listRes.data?.data || listRes.data?.users || [];
                        const existingUser = Array.isArray(users) ? users.find(u => u.email === email) : null;
                        
                        if (existingUser) {
                            await axios.delete(`${process.env.VITE_INSFORGE_URL}/api/auth/users`, {
                                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                                data: { userIds: [existingUser.id] }
                            });
                            await new Promise(r => setTimeout(r, 1000));
                            
                            const { data: newData } = await insforge.auth.signUp({
                                email: email, password: password, name: name
                            });
                            
                            if (newData?.accessToken) {
                                authData = newData;
                            } else if (newData?.requireEmailVerification) {
                                authData = await verifyEmailAndLogin();
                            }
                        }
                    } catch (e) {
                        console.error('Re-create user failed', e.message);
                    }
                }
            }
        }

        if (!authData || !authData.accessToken) {
            throw new Error("Authentication failed.");
        }

        const accessToken = authData.accessToken;
        
        // Update profile
        if (picture || name) {
            try {
                if (authData.user?.id) {
                    await axios.patch(`${process.env.VITE_INSFORGE_URL}/api/auth/profiles/current`, {
                        profile: { avatar_url: picture, name: name }
                    }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
                }
            } catch (e) {}
        }

        let frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        if ((process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') && !process.env.FRONTEND_URL) {
            frontendBaseUrl = `${protocol}://${finalHost}`;
        }
        res.redirect(`${frontendBaseUrl}/auth/callback?access_token=${accessToken}`);
    } catch (err) {
        console.error("GOOGLE AUTH ERROR:", err.message);
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const trueHost = req.headers['x-forwarded-host'] || req.headers.host;
        let frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        if ((process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') && !process.env.FRONTEND_URL) {
            frontendBaseUrl = `${protocol}://${trueHost}`;
        }
        res.redirect(`${frontendBaseUrl}/login?error=auth_failed`);
    }
});

// --- API ENDPOINTS ---

app.post('/api/enhance-idea', async (req, res) => {
    const { idea } = req.body;
    try {
        const prompt = `
            ROLE: Expert Business Consultant.
            INPUT IDEA: "${idea}"
            
            TASK:
            Rewrite this business idea into ONE or TWO short, punchy sentence.
            Keep it strictly under 10 words. No fluff.
            
            OUTPUT:
            Just the refined text.
        `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "Output only the refined idea text. Max 2 sentences." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            max_tokens: 60,
        }));

        const enhancedIdea = completion.choices[0].message.content.trim();
        res.json({ enhancedIdea });
    } catch (err) {
        console.error("ENHANCE FAILED:", err.message);
        res.status(500).json({ error: "Enhancement failed" });
    }
});

app.post('/api/research', async (req, res) => {
    const { idea, location } = req.body;
    try {
        const webSignals = await collectMarketSignals(idea, location);

        // Strip all descriptions/text to stay under Rate Limits
        const optimizedSignals = {
            ...webSignals,
            searchSignals: {
                organicResults: webSignals.searchSignals.organicResults.map(r => ({
                    title: r.title,
                    domain: r.domain
                }))
            },
            problemSignals: {
                redditDiscussions: webSignals.problemSignals.redditDiscussions.map(p => ({
                    title: p.title
                }))
            }
        };

        const locationContext = location ? `\n      USER LOCATION: ${location.city}, ${location.state}, ${location.country}` : "";

        const prompt = `
      IDEA: "${idea}"${locationContext}
      RESEARCH DATA: ${JSON.stringify(optimizedSignals)}

            TASK:
       You are a precise Strategic Onboarding Specialist.
       Your goal is to extract deep, unique insights about this specific idea through a targeted interview.
       
       CRITICAL INSTRUCTIONS:
       - TOTAL QUESTIONS: You must generate EXACTLY 10 to 12 questions. NO more, NO less.
       - REPETITION: Do NOT repeat questions. Every question must explore a DIFFERENT angle of the idea (Operations, Target User, Logistics, Monetization, USP, Tech, Scale, Local challenges).
       - WORD COUNT: Each question text MUST be between 8 and 15 words long. Ensure they are meaningful and professional sentences.
       - STRICT RELEVANCE: Every single question must be STICKLY based on the provided idea. No generic template questions.
       - OPTIONS: Provide 3 high-quality, SPECIFIC options per question. Never use generic labels like "Option 1" or "Standard". The options must represent actual tactical choices.
       - NO JARGON: Use simple, effective language that an entrepreneur can easily navigate.
       
       MANDATORY TOPICS TO COVER (Strictly based on idea):
       1. Core Mechanics: How does the primary service/product function?
       2. Market Gap: Why is this better than current local alternatives?
       3. Distribution: How will you reach your first 100 users?
       4. Capital Allocation: What is the primary use of the initial funds?
       5. Scaling: What is the biggest hurdle to growing this in 6 months?
       6. Location Strategy: How does the specific city/country context influence the startup?
       7. Tech Requirements: What specific technological stack or physical infrastructure is needed?
       8. Revenue Model: How exactly will the money be made (Subscription, commission, ads)?
       
       JSON SCHEMA:
       {
         "project_title": "Descriptive Simple Title (e.g. 'Cafe Project' or 'Blind Navigation App')",
         "project_description": "ONE precise sentence (max 15 words) describing the mission.",
         "questions": [
           { 
             "text": "The full question text (must be 8-15 words long)?", 
             "options": ["Specific Tactical Choice A", "Specific Tactical Choice B", "Specific Tactical Choice C"], 
             "theme": "Operational Focus" 
           }
         ]
       }
    `;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "You are a startup scout focusing on operations and market fit. Output valid JSON." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
        }));

        const content = completion.choices[0].message.content;
        console.log("Research AI Answered Successfully.");
        const parsed = JSON.parse(content);
        res.json({
            webSignals,
            questions: parsed.questions,
            projectTitle: parsed.project_title,
            projectDescription: parsed.project_description
        });
    } catch (err) {
        console.error("Research Phase ERROR:", err.message);
        if (err.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment and try again." });
        }
        res.status(500).json({ error: "Research phase failed", details: err.message });
    }
});

app.post('/api/generate-report-structure', async (req, res) => {
    const { idea, webSignals } = req.body;
    try {
        const prompt = `
          IDEA: "${idea}"
          MARKET SIGNALS: ${JSON.stringify(webSignals)}
          
          TASK:
          Define the HIGH-LEVEL identity for a Strategic Analysis Report.
          You must provide a generic project name (descriptive summary) and list 4 standard section titles.
          
          CRITICAL: You MUST use the exact IDs: "executive", "market", "technical", "risk".
          
          JSON SCHEMA:
          {
            "project_name": "Descriptive Project Name",
            "pages": [
              { "id": "executive", "title": "Highly creative title for Executive summary", "isPlaceholder": true },
              { "id": "market", "title": "Highly creative title for Market analysis", "isPlaceholder": true },
              { "id": "technical", "title": "Highly creative title for Tech/Product model", "isPlaceholder": true },
              { "id": "risk", "title": "Highly creative title for Risk/Strategy", "isPlaceholder": true }
            ]
          }
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON only." }, { role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-report-section', async (req, res) => {
    const { idea, webSignals, answers, sectionId, sectionTitle } = req.body;
    try {
        const signalsSummary = JSON.stringify(webSignals || {}).substring(0, 800);
        const answersSummary = typeof answers === 'string' ? answers.substring(0, 600) : JSON.stringify(answers).substring(0, 600);
        const prompt = `
          ROLE: Elite Strategic Analyst.
          IDEA: "${idea}"
          CONTEXT: ${signalsSummary}
          ANSWERS: ${answersSummary}
          
          TASK: Generate the COMPLETE content for the section: "${sectionTitle}" (ID: ${sectionId}).
          BE VERBOSE and insightful. Include data projections and deep tactical advice.
          
          CRITICAL: Return ONLY the raw data object fields. DO NOT wrap the response in a top-level key like "${sectionId}" or "content".
          Example of WRONG format: { "${sectionId}": { ... } }
          Example of CORRECT format: { "field_1": "...", "field_2": "..." }
          
          Return ONLY the data object following the exact schema for this ID.
          
          ID-SPECIFIC SCHEMAS (MANDATORY FIELDS):
          - If "executive": { 
              "explanation": "Deep 2-paragraph summary", 
              "target_user": "Specific demographics/psychographics", 
              "value_prop": "Unique selling point", 
              "market_demand": { "score": 8, "analysis": "Reasoning" }, 
              "chart_data": [{"label": "Month 1", "value": 10}, {"label": "Month 3", "value": 40}, {"label": "Month 6", "value": 75}, {"label": "Month 12", "value": 100}]
            }
          - If "market": { 
              "competitors": [{"name": "Brand", "analysis": "Detailed assessment", "weakness_to_exploit": "Specific gap"}], 
              "competitiveness_score": 7, 
              "the_gap": "Market opportunity depth", 
              "differentiation": "The moat strategy", 
              "chart_data": [{"label": "Competitor A", "value": 40}, {"label": "Competitor B", "value": 35}, {"label": "You", "value": 25}]
            }
          - If "technical": { 
              "viability_score": 8, 
              "suggested_stack": "Comma, separated, technologies", 
              "architecture": "High-level schematic description", 
              "complexity": "Feasibility thesis and challenges", 
              "est_mvp_cost": "$X,XXX - $XX,XXX", 
              "chart_data": [{"label": "Infra", "value": 20}, {"label": "Dev", "value": 50}, {"label": "AI", "value": 30}]
            }
          - If "risk": { 
              "risks": { "market": "...", "technical": "...", "financial": "...", "legal": "..." }, 
              "mentor_advice": { "appreciate": "...", "criticize": "...", "advice": "..." }, 
              "immediate_actions": ["Must-do 1", "Must-do 2", "Must-do 3"], 
              "chart_data": [
                { "label": "Market", "value": 5 },
                { "label": "Technical", "value": 5 },
                { "label": "Financial", "value": 5 },
                { "label": "Operational", "value": 5 },
                { "label": "Regulatory", "value": 5 }
              ]
            }
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON only." }, { role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        console.error(`Section generation failed for ${sectionId}:`, err.message, err.status || '');
        if (err.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment." });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-plan-structure', async (req, res) => {
    const { idea, report, answers } = req.body;
    try {
        let reportSummary = ''; try { const parsed = typeof report === 'string' ? JSON.parse(report) : report; if (parsed && parsed.pages) { reportSummary = parsed.pages.map(function(p) { return p.title; }).join(', '); } else { reportSummary = JSON.stringify(parsed).substring(0, 600); } } catch (e) { reportSummary = String(report).substring(0, 600); }
        const prompt = `
          ROLE: Elite Startup Operations Expert.
          IDEA: "${idea}"
          REPORT TOPICS: ${reportSummary}
          
          TASK:
          Generate the HIGH-LEVEL STRUCTURE for a 60-Day Execution Roadmap.
          Divide 60 days into 4 logical PHASES (approx 15 days each).
          
          JSON SCHEMA:
          {
            "short_title": "3-5 word concise mission name",
            "phases": [
                { "id": 1, "name": "Deep Research", "color": "#8B5CF6", "range": "1-15" },
                { "id": 2, "name": "Local Validation", "color": "#3B82F6", "range": "16-30" },
                { "id": 3, "name": "Minimum Build", "color": "#10B981", "range": "31-45" },
                { "id": 4, "name": "Launch & Feedback", "color": "#F59E0B", "range": "46-60" }
            ]
          }
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        console.error('Plan structure generation failed:', err.message, err.status || '');
        if (err.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment." });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-phase-tasks', async (req, res) => {
    const { idea, report, answers, phase, allPreviousTasks = [] } = req.body;
    try {
        const [start, end] = phase.range.split('-').map(Number);
        const dayCount = end - start + 1;

        // Trim report to just key info (titles only) to reduce input tokens
        let reportSummary = '';
        try {
            const parsed = typeof report === 'string' ? JSON.parse(report) : report;
            if (parsed?.pages) {
                reportSummary = parsed.pages.map(p => p.title).join(', ');
            } else {
                reportSummary = JSON.stringify(parsed).substring(0, 600);
            }
        } catch { reportSummary = String(report).substring(0, 600); }

        // Trim answers
        const answersSummary = typeof answers === 'string' 
            ? answers.substring(0, 500) 
            : JSON.stringify(answers).substring(0, 500);

        // Only include last 10 previous task titles
        const prevSummary = allPreviousTasks.slice(-10).map(t => `Day ${t.day}: ${t.title}`).join('\n');

        const prompt = `
      ROLE: Startup Operations Expert.
      IDEA: "${idea}"
      REPORT TOPICS: ${reportSummary}
      CONTEXT: ${answersSummary}
      PHASE: "${phase.name}" (Days ${phase.range})
      PREVIOUS: ${prevSummary || 'None'}

      Generate EXACTLY ${dayCount} tactical daily tasks.
      
      RULES:
      - No day references inside descriptions (no "Day 1" etc.)
      - Suggest specific tools (Canva, Trello, Vercel, etc.)
      - 3-5 actionable sub-steps per day
      - Location-aware registrations if context available
      - IMPACT: exactly "Low", "Medium", or "High"
      - EST_TIME: realistic (e.g., "4-6 hours")

      JSON SCHEMA:
      {
        "days": [
          { 
            "day": ${start}, 
            "phase_id": ${phase.id},
            "title": "5-word action name",
            "task": "2-3 sentences on WHAT and WHY.", 
            "deliverable": "Tangible output",
            "details": ["Step 1", "Step 2", "Step 3"],
            "impact": "High",
            "est_time": "Time estimate"
          }
        ]
      }
    `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "You are a startup operations mentor. Return only valid JSON. Each task must be unique and specific to the business idea." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            max_tokens: 3500
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        console.error(`Phase tasks generation failed for days ${phase?.range}:`, err.message, err.status || '');
        if (err.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment and try again." });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/analyze', async (req, res) => {
    const { idea, webSignals, answers } = req.body;
    console.log(`\n--- FINAL ANALYSIS REQUEST ---`);

    try {
        const signalsSummary = JSON.stringify(webSignals || {}).substring(0, 1000);
        const answersSummary = typeof answers === 'string' ? answers.substring(0, 800) : JSON.stringify(answers).substring(0, 800);
        const prompt = `
      ROLE: Elite Strategic Co-founder & Market Analyst.
      USER IDEA: "${idea}"
      MARKET RESEARCH CONTEXT: ${signalsSummary}
      USER INTERVIEW SUMMARY: ${answersSummary}

      TASK:
      Generate an Investor-Ready Strategic Report based ONLY on the User Interview and Market Research.
      
      REQUIRED SECTIONS (STRICT SCHEMA):
      1. Idea Summary: Clear explanation, target user, core value proposition.
      2. Market Demand Analysis: Demand score (1-10) based on URGENCY (High=Hair on fire, Low=Nice to have) and justification.
      3. Competitive Landscape: List STRICTLY 2 known competitors with Strengths/Weaknesses and a Competitiveness Score (1-10) where 10=Blue Ocean/Unique and 1=Red Ocean/Saturated.
      4. Market Gap & Differentiation: Specific gap and why this idea is meaningfully different.
      5. Risk Analysis: STRICTLY 4 points (Market, Execution, Adoption, Financial).
      6. Feasibility Analysis: Feasibility Score (1-10) where 10=MVP in weeks, 1=Requires Millions/R&D.
      7. Mentor / Investor Perspective: CRITICAL & REALISTIC feedback. What they would appreciate, criticize, and advise.
      8. Strategic Next Steps: STRICTLY 3 Immediate actions and things to avoid.

      STRICT RULES:
      - BE CRITICAL AND REALISTIC. Do not be overly optimistic.
      - NEVER mention specific website names or source URLs. Use "market signals" or "internet research".
      - NEVER hallucinate competitors as facts. Use "Potential competitors in this space" if unknown.
      - COMPETITOR NAMES: You must provide specific names (e.g., "Slack", "Discord") or distinct categories (e.g., "Traditional Spreadsheets"). NEVER use "Potential competitors in this space" or "Rival 1" as a name.
      - Scores must be integers from 1-10.
      - Format: Return ONLY valid JSON.

      JSON SCHEMA:
      {
        "project_name": "Short clean name",
        "explanation": "Clear explanation of the idea",
        "target_user": "Primary persona",
        "value_prop": "Core value proposition",
        "market_demand": { 
          "score": 8, 
          "justification": "Why this score? (based on size, urgency, signals)" 
        },
        "competitors": [
          { "name": "Competitor 1", "what_they_do": "Brief desc", "strengths": "...", "weaknesses": "..." }
        ],
        "competitiveness_score": 6,
        "market_gap": "The gap being addressed",
        "differentiation": "Why this is different",
        "risks": {
          "market": "Risk detail",
          "execution": "Risk detail",
          "adoption": "Risk detail",
          "financial": "Risk detail"
        },
        "feasibility": {
          "score": 7,
          "analysis": "Analysis based on resources/skills"
        },
        "mentor_perspective": {
          "appreciate": "Positive point",
          "criticize": "Critical point",
          "advice": "Next move advice"
        },
        "next_steps": {
          "immediate": ["Step 1", "Step 2", "Step 3"],
          "avoid": ["Pitfall 1", "Pitfall 2"]
        }
      }
    `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "You are a world-class mentor. You provide pithy, actionable, and data-backed advice. Output valid JSON. If user answers are vague, focus on helping them gain clarity." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 8000, // Increased for full editorial reports
        }));

        const report = JSON.parse(completion.choices[0].message.content);
        res.json(report);
    } catch (err) {
        console.error("ANALYSIS FAILED:", err.message);
        res.status(500).json({ error: "Analysis failed", details: err.message });
    }
});

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/generate-plan', async (req, res) => {
    const { idea, report, answers } = req.body;
    try {
        const prompt = `
      ROLE: Elite Startup Operations Expert.
      IDEA: "${idea}"
      LOCATION: ${answers.includes('Country') ? answers : 'Global'}
      STRATEGIC ASSESSMENT: ${JSON.stringify(report)}
      USER INTERVIEW: ${answers}

      TASK:
      Generate a HYPER-PERSONALIZED 60-Day Execution Calendar. 
      Every day must have a UNIQUE, non-repetitive task tailored to the specific market, location, and product.
      
      STRUCTURE:
      1. Divide 60 days into logical PHASES (e.g., Week 1: Groundwork, Week 2: Local Validation, etc.).
      2. For EVERY DAY (1 to 60), provide:
         - A specific task (high-leverage).
         - A clear deliverable (to check off).
         - The phase it belongs to (for color coding).

      STRICT RULES:
      - TASKS must be tactical. e.g., "Visit 3 competitors in [Location]", "Setup landing page for [Idea]".
      - PHASES should group days together (e.g., Days 1-7 = Phase 1).
      - NO REPETITION. No "Continue working on...". Every day is a new step.
      - Use location data to define specific local tasks.

      JSON SCHEMA:
      {
        "short_title": "3-5 word concise mission name",
        "phases": [
            { "id": 1, "name": "Research", "color": "#8B5CF6", "range": "1-7" },
            { "id": 2, "name": "Local Validation", "color": "#3B82F6", "range": "8-21" },
            { "id": 3, "name": "Minimum Build", "color": "#10B981", "range": "22-45" },
            { "id": 4, "name": "Launch and Feedback", "color": "#F59E0B", "range": "46-60" }
        ],
        "days": [
          { 
            "day": 1, 
            "phase_id": 1,
            "title": "Short 3-5 word action name (e.g. 'Competitor Price Analysis')",
            "task": "Detailed objective sentence (e.g. 'Visit 3 local competitors to document their pricing tiers and identifying gaps.')", 
            "deliverable": "Specific proof of work",
            "details": ["Tactical sub-step 1", "Tactical sub-step 2", "Tactical sub-step 3"],
            "impact": "High",
            "est_time": "2-4 hours"
          }
          // ... up to 60
        ]
      }
    `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "You are an operations-focused mentor. Provide a 60-day sequence of high-leverage actions. Output valid JSON. Ensure exactly 60 days are generated." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 8000,
        }));

        const plan = JSON.parse(completion.choices[0].message.content);
        res.json(plan);
    } catch (err) {
        console.error("PLAN GENERATION FAILED:", err);
        res.status(500).json({ error: "Plan generation failed" });
    }
});

app.post('/api/chat', async (req, res) => {
    const { idea, plan, messages, completedDays = [], currentTaskId = null } = req.body;

    try {
        const lastUserMessage = messages[messages.length - 1]?.content || "";

        // Parse @mentions (e.g., @5) AND natural language references (e.g., "task 5", "step 12")
        const mentionRegex = /@(\d+)|(?:task|step)\s+(\d+)/gi;
        const mentionedTaskIds = [];
        let match;
        while ((match = mentionRegex.exec(lastUserMessage)) !== null) {
            // match[1] is for @1, match[2] is for "task 1"
            mentionedTaskIds.push(parseInt(match[1] || match[2]));
        }

        // Remove duplicates
        const uniqueTaskIds = [...new Set(mentionedTaskIds)];

        const mentionedTasks = uniqueTaskIds.length > 0
            ? plan.days.filter(d => uniqueTaskIds.includes(d.day))
            : (currentTaskId ? plan.days.filter(d => d.day === currentTaskId) : []);

        // Detect edit intent
        const editPatterns = [
            /edit\s*(task|step)?\s*@?(\d+)/i,
            /change\s*(task|step)?\s*@?(\d+)/i,
            /update\s*(task|step)?\s*@?(\d+)/i,
            /modify\s*(task|step)?\s*@?(\d+)/i,
            /replace\s*(the)?\s*(task|deliverable|objective)/i
        ];
        const hasEditIntent = editPatterns.some(p => p.test(lastUserMessage));

        // Detect web search need - BROADENED for aggressive research
        const needsWebSearch = /\b(compare|vs|list|market|price|cost|competitor|trend|growth|stat|data|how to|what is|explain|clarify|example|template|guide|tutorial|search|find)\b/i.test(lastUserMessage) || lastUserMessage.includes("?") || lastUserMessage.length > 10;

        let webContext = "";
        if (needsWebSearch) {
            try {
                const searchQuery = lastUserMessage.replace(/@\d+/g, '').trim();
                const searchResults = await scrapeDuckDuckGo(searchQuery + " " + idea + " business data");
                if (searchResults.length > 0) {
                    webContext = `\n\n🔎 **WEB RESEARCH RESULTS (REAL-TIME DATA):**\n${searchResults.map(r => `- [${r.title}](${r.domain}): ${r.description}`).join("\n")}\n\n**INSTRUCTION: Cite these sources using Markdown links if you use their data.**\n`;
                }
            } catch (e) {
                console.warn("Chat web search failed:", e.message);
            }
        }

        const systemPrompt = `
ROLE: **Human-like Startup Mentor & Strategy Partner**. 
Your tone is **warm, punchy, and ultra-professional**. Think "Silicon Valley mentor" - friendly but focused on results.

TONE & STYLE:
- **Be Human**: Avoid repeating task names verbatim if possible. Reference them as @dayNumber (e.g., "On @1, focus on...").
- **Punchy & Precise**: Skip the robot-speak like "WELCOME: Your startup". Just say "Hey! Great to see you're on @1."
- **Visual Impact**: Use **bolding**, \`data\`, and Markdown Tables (using | pipes) for structured info.

CONTEXT: User is building: "${idea}"

📊 **PROGRESS**:
- **History**: ${completedDays.length} done: [${completedDays.join(", ")}].
- **Focus**: Currently on @${currentTaskId}.

${mentionedTasks.length > 0 ? `
🎯 **CONTEXT**:
${mentionedTasks.map(t => `@${t.day}: ${t.task}`).join("\n")}
` : ""}

${webContext}

🧠 **RULES (STRICT):**
1. **No Repetition**: NEVER say "Task Task 1". Just say "Task @1" or "Step @1".
2. **Sandwich Content**: Start with a warm focus check, provide data/comparison in a **TABLE**, and end with a tactical tip.
3. **Markdown Tables**: Use standard | pipes for all data.
4. **Interactive**: Use @dayNumber frequently to link your advice to the roadmap.
5. **Concise**: Under 120 words.

🛠️ **CAPABILITIES:**
1. **Edit Tasks**: [EDIT_TASK:@taskNumber] ... [/EDIT_TASK]
2. **Add Tasks**: [ADD_TASKS] JSON [/ADD_TASKS]
3. **Replace Plan**: [REPLACE_TASKS] JSON [/REPLACE_TASKS]

OFF-TOPIC REJECTION:
If unrelated to "${idea}", reply ONLY: "🎯 Let's stay focused on **${idea}**! Ask me about tasks, competitors, or next steps."

EXCEPTION: Warmly greet "hello/hi" and then pivot back.

[ADD_TASKS] FORMAT:
[ADD_TASKS]
{ "phase": "Phase Name", "tasks": [{ "task": "...", "deliverable": "...", "details": ["..."] }] }
[/ADD_TASKS]

[REPLACE_TASKS] FORMAT:
[REPLACE_TASKS]
{ "phases": [...], "tasks": [...] }
[/REPLACE_TASKS]
`;

        // Sanitize messages - only keep role and content (Groq API requirement)
        const sanitizedMessages = messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
        }));

        // Detect strong intents to override/guide the AI
        const lastMsg = messages[messages.length - 1].content.toLowerCase();
        let forcedSystemInstruction = "";

        // precise intent detection logic
        const hasDeleteIntent = lastMsg.includes("delete all") || lastMsg.includes("remove all") || lastMsg.includes("clear all");
        const hasCreateIntent = lastMsg.includes("create") || lastMsg.includes("make") || lastMsg.includes("generate") || lastMsg.includes("redo") || lastMsg.includes("new plan");

        if (hasCreateIntent) {
            // Creation/Replacement intent takes priority (it implies replacing the old plan)
            if (lastMsg.includes("task") || lastMsg.includes("plan")) {
                forcedSystemInstruction = "\n\nSYSTEM OVERRIDE: User wants to GENERATE A NEW PLAN. You MUST output the [REPLACE_TASKS] JSON block now. Ignore the delete command since replace overwrites everything. Output the JSON block immediately.";
            }
        } else if (hasDeleteIntent) {
            // Only purely delete if no creation intent
            forcedSystemInstruction = "\n\nSYSTEM OVERRIDE: User wants to delete everything. Output ONLY: [DELETE_ALL]";
        }

        const groq = getGroqClient(req);
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...sanitizedMessages,
                ...(forcedSystemInstruction ? [{ role: "system", content: forcedSystemInstruction }] : [])
            ],
            model: MODEL,
            max_tokens: 4000,
        });

        const aiResponse = completion.choices[0].message.content;

        // Parse for task edits - more robust regex to find ID even if tag has extra text
        const editMatch = aiResponse.match(/\[EDIT_TASK:[\s\S]*?(\d+)[\s\S]*?\]([\s\S]*?)\[\/EDIT_TASK\]/);
        let taskEdit = null;

        if (editMatch) {
            const taskId = parseInt(editMatch[1]);
            const editContent = editMatch[2];

            // Parse the edit content
            const taskMatch = editContent.match(/task:\s*"([^"]+)"/i);
            const deliverableMatch = editContent.match(/deliverable:\s*"([^"]+)"/i);
            const detailsMatch = editContent.match(/details:\s*\[([\s\S]*?)\]/i);

            taskEdit = {
                taskId,
                newTask: taskMatch ? taskMatch[1] : null,
                newDeliverable: deliverableMatch ? deliverableMatch[1] : null,
                newDetails: detailsMatch ? detailsMatch[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) : null
            };
        }

        // Parse for single task deletion
        const deleteMatch = aiResponse.match(/\[DELETE_TASK:@?(\d+)\][\s\S]*?\[\/DELETE_TASK\]/);
        let taskDelete = null;

        if (deleteMatch) {
            taskDelete = {
                taskId: parseInt(deleteMatch[1])
            };
        }

        // Parse for DELETE ALL
        let isDeleteAll = false;
        if (aiResponse.includes("[DELETE_ALL]") || aiResponse.includes("[DELETE ALL]") || aiResponse.includes("[RESET_PLAN]")) {
            isDeleteAll = true;
        }

        // Parse for ADD_TASKS (append to existing plan)
        const addTasksMatch = aiResponse.match(/\[ADD_TASKS\]([\s\S]*?)\[\/ADD_TASKS\]/);
        let tasksAdd = null;

        if (addTasksMatch) {
            try {
                const jsonStr = addTasksMatch[1].trim();
                const parsed = JSON.parse(jsonStr);
                if (parsed.tasks && Array.isArray(parsed.tasks)) {
                    tasksAdd = {
                        phase: parsed.phase || "Development & Execution",
                        tasks: parsed.tasks.map(t => ({
                            task: t.task || "New Task",
                            deliverable: t.deliverable || "Complete task",
                            details: t.details || []
                        }))
                    };
                }
            } catch (e) {
                console.warn("Failed to parse ADD_TASKS JSON:", e.message);
            }
        }

        // Parse for task replacement (bulk replace all tasks)
        // Try strict tags first, then fallback to finding specific JSON structure
        let replaceMatch = aiResponse.match(/\[REPLACE_TASKS\]([\s\S]*?)\[\/REPLACE_TASKS\]/);
        let usedFallback = false;

        if (!replaceMatch) {
            // Fallback: search for JSON object starting with phases and containing tasks
            const rawMatch = aiResponse.match(/(\{[\s\r\n]*"phases"[\s\r\n]*:[\s\S]*?"tasks"[\s\r\n]*:[\s\S]*?\})/);
            if (rawMatch) {
                replaceMatch = rawMatch;
                usedFallback = true;
            }
        }

        let tasksReplace = null;

        if (replaceMatch) {
            try {
                // Clean up the JSON content - remove newlines and extra spaces
                let jsonContent = replaceMatch[1]
                    .trim()
                    .replace(/\n/g, '')
                    .replace(/\r/g, '')
                    .replace(/\s+/g, ' ');

                const parsed = JSON.parse(jsonContent);
                if (parsed.tasks && Array.isArray(parsed.tasks)) {
                    const tasks = parsed.tasks.map((t, idx) => ({
                        day: idx + 1,
                        task: t.task,
                        deliverable: t.deliverable,
                        details: t.details || ["Complete this task", "Review deliverable", "Move to next step"]
                    }));

                    // FIXED 4 PHASES - Always use these regardless of what AI generates
                    const taskCount = tasks.length;
                    const phaseSize = Math.ceil(taskCount / 4);

                    const FIXED_PHASES = [
                        { name: "Deep Research", color: "#8B5CF6", id: "phase-1" },
                        { name: "Local Validation", color: "#3B82F6", id: "phase-2" },
                        { name: "Minimum Build", color: "#10B981", id: "phase-3" },
                        { name: "Launch & Feedback", color: "#F59E0B", id: "phase-4" }
                    ];

                    // Calculate ranges for each phase
                    const phases = FIXED_PHASES.map((p, idx) => {
                        const start = idx * phaseSize + 1;
                        const end = idx === 3 ? taskCount : Math.min((idx + 1) * phaseSize, taskCount);
                        return {
                            ...p,
                            range: `${start} - ${end} `
                        };
                    }).filter(p => {
                        const [start] = p.range.split('-').map(Number);
                        return start <= taskCount;
                    });

                    // Assign tasks to phases
                    const enrichedTasks = tasks.map(t => {
                        const day = t.day;
                        const matchingPhase = phases.find(p => {
                            const [start, end] = p.range.split('-').map(Number);
                            return day >= start && day <= end;
                        });
                        return {
                            ...t,
                            phase_id: matchingPhase ? matchingPhase.id : phases[0].id
                        };
                    });

                    tasksReplace = { tasks: enrichedTasks, phases };
                }
            } catch (e) {
                console.warn("Failed to parse REPLACE_TASKS JSON:", e.message);
            }
        }

        // Clean the response - remove EDIT, DELETE, REPLACE, and ADD blocks
        let cleanedMessage = aiResponse
            .replace(/\[EDIT_TASK:[\s\S]*?\][\s\S]*?\[\/EDIT_TASK\]/g, '')
            .replace(/\[DELETE_TASK:[\s\S]*?\][\s\S]*?\[\/DELETE_TASK\]/g, '')
            .replace(/\[REPLACE_TASKS\][\s\S]*?\[\/REPLACE_TASKS\]/g, '')
            .replace(/\[ADD_TASKS\][\s\S]*?\[\/ADD_TASKS\]/g, '')
            .replace(/\[DELETE_ALL\]/g, '')
            .replace(/\[DELETE ALL\]/g, '');

        if (usedFallback && replaceMatch) {
            // Remove the raw JSON we found
            cleanedMessage = cleanedMessage.replace(replaceMatch[0], '');
        }

        cleanedMessage = cleanedMessage
            .replace(/\s*(?:Here is|Below is|I'll provide|I'll use|Following is|structure|plan)[:\s]*$/i, '')
            .trim();

        res.json({
            message: cleanedMessage,
            taskEdit,
            taskDelete,
            tasksReplace,
            tasksAdd,
            isDeleteAll,
            mentionedTasks: mentionedTaskIds,
            hasWebContext: !!webContext
        });
    } catch (err) {
        console.error("CHAT FAILED:", err);
        res.status(500).json({ error: "Chat failed", details: err.message });
    }
});


// --- DODO PAYMENTS ENDPOINTS ---

app.post('/api/checkout', async (req, res) => {
    const { productId, quantity = 1, userEmail, userId, metadata, planType } = req.body;

    try {
        if (!dodoPayments) {
            throw new Error("Dodo Payments is not configured (missing API key).");
        }

        const targetProductId = productId || process.env.DODO_PAYMENTS_PRODUCT_ID;

        // Use product_cart as recommended by Dodo
        const session = await dodoPayments.checkoutSessions.create({
            product_cart: [{
                product_id: targetProductId,
                quantity: quantity
            }],
            customer: {
                email: userEmail,
            },
            metadata: {
                userId: userId,
                planType: planType,
                ...metadata
            },
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout-result?session_id={checkout_session_id}`,
        });

        res.json({ checkout_url: session.checkout_url });
    } catch (err) {
        console.error("DODO CHECKOUT ERROR:", err.message);
        res.status(500).json({ error: "Failed to create checkout session", details: err.message });
    }
});

app.get('/api/webhook/dodo', (req, res) => {
    res.status(200).send("Dodo Webhook endpoint is active. Use POST to send webhooks.");
});

app.post('/api/webhook/dodo', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['x-dodo-signature'];
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    try {
        if (webhookSecret && sig) {
            // TODO: In production, verify the signature here
            // console.log("Verifying webhook signature...");
        }

        const event = JSON.parse(req.body);
        console.log(`✅ Dodo Webhook: ${event.type}`, event.data?.id || '');

        switch (event.type) {
            case 'payment.succeeded':
            case 'subscription.active':
            case 'subscription.renewed':
                const data = event.data;
                const userId = data.metadata?.userId;
                const planType = data.metadata?.planType || 'pro';

                if (userId) {
                    console.log(`💰 FULFILLING: User ${userId} -> Plan: ${planType}`);
                    try {
                        const { data: profile, error: fetchError } = await insforge.database.from('profiles').select('id').eq('id', userId).single();

                        if (fetchError || !profile) {
                            console.log(`Creating new profile for user ${userId}`);
                            const { error: insertError } = await insforge.database.from('profiles').insert([{
                                id: userId,
                                email: event.data.customer?.email,
                                subscription_status: 'pro',
                                dodo_customer_id: event.data.customer?.id
                            }]);
                            if (insertError) console.error("Profile Insert Error:", insertError.message);
                            else console.log(`✅ Profile created for user ${userId}.`);
                        } else {
                            const { error: updateError } = await insforge.database.from('profiles').update({
                                subscription_status: 'pro',
                                dodo_customer_id: event.data.customer?.id,
                                updated_at: new Date()
                            }).eq('id', userId);

                            if (updateError) console.error("Profile Update Error:", updateError.message);
                            else console.log(`✅ User ${userId} profile updated to Pro.`);
                        }
                    } catch (dbErr) {
                        console.warn("DB fulfillment check failure:", dbErr.message);
                    }
                }
                break;
            case 'subscription.cancelled':
            case 'subscription.expired':
                console.log(`🚫 REVOKING: User ${event.data?.metadata?.userId} subscription ended`);
                break;
            default:
                console.log(`ℹ️ Dodo Info: Received ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("DODO WEBHOOK ERROR:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

app.post('/api/portal', async (req, res) => {
    const { customerId } = req.body;
    try {
        if (!dodoPayments) {
            throw new Error("Dodo Payments is not configured.");
        }
        const session = await dodoPayments.customerPortalSessions.create({
            customer_id: customerId,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`
        });
        res.json({ portal_url: session.portal_url });
    } catch (err) {
        console.error("DODO PORTAL ERROR:", err.message);
        res.status(500).json({ error: "Failed to create portal session" });
    }
});

// --- SERVE FRONTEND (Removed for Vercel Serverless) ---
// Vercel handles static file serving via the Build Output API automatically.

export default app;
