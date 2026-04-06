import express from 'express';
import helmet from 'helmet';
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
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
    'https://www.capable.website',
    'https://capable.website',
    'https://capable-website.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "https:", "data:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://vercel.live", "blob:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://capable.website", "https://www.capable.website", "https://capable-website.onrender.com", "https://4aqgz7mw.us-east.insforge.app", "https://api.groq.com", "https://checkout.dodopayments.com", "https://api.dodopayments.com", "https://www.google-analytics.com", "https://www.googleapis.com", "https://overbridgenet.com", "https://vercel.live", "wss://*.pusher.com", "https://*.pusher.com"],
            frameSrc: ["'self'", "https://vercel.live"]
        }
    }
}));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// oauth2client is instantiated dynamically inside routes now

app.use(cookieParser());

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

const rootPath = path.join(__dirname, '..');
app.use(express.static(path.join(rootPath, 'dist')));

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("No Groq API Key found in environment variables.");
    }
    return new Groq({ apiKey });
};

let dodoPayments;
const getDodoPayments = () => {
    if (dodoPayments) return dodoPayments;
    if (process.env.DODO_PAYMENTS_API_KEY) {
        try {
            dodoPayments = new DodoPayments({
                bearerToken: process.env.DODO_PAYMENTS_API_KEY,
                environment: process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode'
            });
            console.log("✅ Dodo SDK initialized dynamically on:", process.env.DODO_PAYMENTS_MODE === 'live' ? 'LIVE' : 'TEST');
            console.log("Key prefix:", process.env.DODO_PAYMENTS_API_KEY.substring(0, 5) + "...");
        } catch (e) {
            console.error("❌ Dodo Initialization Error:", e.message);
        }
    }
    return dodoPayments;
};

// Initial attempt
getDodoPayments();

const insforge = createClient({
    baseUrl: process.env.VITE_INSFORGE_URL,
    anonKey: process.env.VITE_INSFORGE_ANON_KEY
});

const MODEL = "qwen/qwen3-32b"; // Highest RPM (60) and best strategic reasoning
const SAFETY_MODEL = "llama-prompt-guard-2-86m"; // Dedicated safety model

// --- AI RESPONSE HELPERS ---
const cleanJSONResponse = (rawContent) => {
    // Strip reasoning <think> tags completely
    let content = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    // Strip markdown code blocks if the model wrapped the JSON in them
    if (content.startsWith("```json")) {
        content = content.replace(/^```json\n?/, '');
        content = content.replace(/```\n?$/, '');
    } else if (content.startsWith("```")) {
        content = content.replace(/^```\w*\n?/, '');
        content = content.replace(/```\n?$/, '');
    }
    
    return JSON.parse(content.trim());
};

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
            headers: { 'User-Agent': USER_AGENT },
            timeout: 5000 // 5 second timeout to prevent hangs
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
            },
            timeout: 5000 // 5 second timeout
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

    // Sequential collection to avoid multiple simultaneous timeouts/hangs
    const searchSignals = await scrapeDuckDuckGo(`${idea}${locStr}`, location);
    const competitionSignals = await scrapeDuckDuckGo(`${idea} competitors alternative ${locStr}`, location);
    const redditSignals = await fetchRedditSignals(idea);
    const newsSignals = await scrapeDuckDuckGo(`${idea} trends news 2024 2025`, location);

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
async function withRetry(fn, retries = 4, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            // Groq 429 or general timeout/error
            if ((err.status === 429 || err.code === 'json_validate_failed') && i < retries - 1) {
                const waitTime = delay * (i + 1) * 2; // Exponential backoff: 4s, 8s, 12s
                console.log(`AI busy or failed. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(res => setTimeout(res, waitTime));
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

    // Use hardcoded production URL to match Google Console exactly
    const dynamicRedirectUri = protocol === 'https'
        ? 'https://capable.website/api/auth/google/callback'
        : `http://${cleanHost}/api/auth/google/callback`;

    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        dynamicRedirectUri
    );

    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    });
    res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const trueHost = req.headers['x-forwarded-host'] || req.headers.host;
        const cleanHost = trueHost ? trueHost.replace(/^www\./, '') : 'localhost:3001';

        // Match the LOGIN REDIRECT logic exactly
        const dynamicRedirectUri = protocol === 'https'
            ? 'https://capable.website/api/auth/google/callback'
            : `http://${cleanHost}/api/auth/google/callback`;

        const client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            dynamicRedirectUri
        );

        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        console.log("Google token exchange keys:", Object.keys(tokens));
        console.log("id_token present:", typeof tokens.id_token, tokens.id_token ? `length:${tokens.id_token.length}` : 'MISSING');
        console.log("access_token present:", !!tokens.access_token);

        let googleId, email, name, picture;

        if (tokens.id_token && typeof tokens.id_token === 'string' && tokens.id_token.length > 10) {
            // Primary path: verify ID token
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            googleId = payload['sub'];
            email = payload['email'];
            name = payload['name'];
            picture = payload['picture'];
        } else if (tokens.access_token) {
            // Fallback path: use access_token to fetch user info from Google directly
            console.log("No valid id_token, falling back to Google userinfo API...");
            const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            const userInfo = userInfoRes.data;
            googleId = userInfo.id;
            email = userInfo.email;
            name = userInfo.name;
            picture = userInfo.picture;
        } else {
            console.error("Google Auth Error: Neither id_token nor access_token returned.");
            return res.redirect(`${protocol}://${cleanHost}/login?error=auth_failed_no_token`);
        }

        const password = getInsForgePassword(googleId);
        let authData = null;

        // Step 1: Try login
        try {
            const { data } = await insforge.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (data?.accessToken) authData = data;
        } catch (err) { }

        // Step 2: Try signup or repair
        if (!authData) {
            const apiKey = process.env.INSFORGE_API_KEY;

            const verifyEmailAndLogin = async () => {
                try {
                    await axios.post(`${process.env.VITE_INSFORGE_URL}/api/admin/sql`, {
                        query: `UPDATE auth.users SET email_verified = true WHERE email = $1`,
                        params: [email]
                    }, { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } });
                } catch (e) { }

                try {
                    const { data } = await insforge.auth.signInWithPassword({ email, password });
                    if (data?.accessToken) return data;
                } catch (e) { }
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
            } catch (e) { }
        }

        // Set httpOnly auth cookie for persistent login (30 days)
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('capable_auth', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/'
        });

        let redirectHost = cleanHost;
        if (cleanHost.includes('localhost:3001') || cleanHost.includes('localhost:3000')) {
            redirectHost = 'localhost:5173';
        }
        // Final Redirect: Send user back to the frontend on the correct dev server or prod host
        res.redirect(`${protocol}://${redirectHost}/auth/callback?access_token=${accessToken}`);
    } catch (err) {
        console.error("GOOGLE AUTH ERROR:", err.message);
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const trueHost = req.headers['x-forwarded-host'] || req.headers.host;
        const cleanHost = trueHost ? trueHost.replace(/^www\./, '') : 'localhost:3001';
        let errorRedirectHost = cleanHost;
        if (cleanHost.includes('localhost:3001') || cleanHost.includes('localhost:3000')) {
            errorRedirectHost = 'localhost:5173';
        }
        res.redirect(`${protocol}://${errorRedirectHost}/login?error=auth_failed`);
    }
});

// --- AUTH COOKIE ENDPOINTS ---

// Get session from cookie (for auto-login on page load)
app.get('/api/auth/session', async (req, res) => {
    try {
        const token = req.cookies?.capable_auth;
        if (!token) {
            return res.json({ authenticated: false });
        }

        // Validate the token against InsForge
        const response = await axios.get(`${process.env.VITE_INSFORGE_URL}/api/auth/sessions/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200 && response.data) {
            return res.json({ authenticated: true, accessToken: token, user: response.data.user || response.data });
        }

        // Token invalid 
        if (response.status === 401) {
            const isProd = process.env.NODE_ENV === 'production';
            res.clearCookie('capable_auth', { path: '/' });
        }
        return res.json({ authenticated: false });
    } catch (err) {
        // Only clear the cookie on explicit unauthorized errors, not network drops
        if (err.response && err.response.status === 401) {
            const isProduction = process.env.NODE_ENV === 'production';
            res.clearCookie('capable_auth', { path: '/' });
        }
        return res.json({ authenticated: false, error: err.message });
    }
});

// Set cookie after email/password login
app.post('/api/auth/set-cookie', (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        return res.status(400).json({ error: 'Missing accessToken' });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('capable_auth', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/'
    });

    res.json({ success: true });
});

// Clear cookie on logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('capable_auth', { path: '/' });
    res.json({ success: true });
});

// --- API ENDPOINTS ---

app.post('/api/enhance-idea', async (req, res) => {
    const { idea } = req.body;
    try {
        const prompt = `
            ROLE: Expert Business Consultant.
            INPUT IDEA: "${idea}"
            
            TASK: Shorten and punchify this business idea into a professional 1-sentence value proposition.
            JSON SCHEMA: { "enhanced_idea": "The punched up sentence" }
        `;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON." }, { role: "user", content: prompt }],
            model: MODEL,
            response_format: { type: "json_object" }
        }));

        res.json(cleanJSONResponse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/research', async (req, res) => {
    const { idea, location } = req.body;
    try {
        const webSignals = await collectMarketSignals(idea, location);
        const signalsSummary = JSON.stringify(webSignals).substring(0, 800);
        const generateQuestions = async (attempt = 1) => {
            const prompt = `
                BUSINESS IDEA: "${idea}"
                
                TASK: Generate exactly 10 high-impact multiple-choice questions (3 options each) to diagnose this idea.
                
                COMBINED STRATEGIC FRAMEWORK (MANDATORY TOPICS):
                1. WHO is my starving crowd? (Psychographics, Target niche)
                2. WHAT painful problem am I solving? (The 'Pain Point' / Why now?)
                3. WHY should they choose me? (The 'Offer' vs competition / Differentiation)
                4. HOW will I get customers consistently? (Lead generation / Growth)
                5. HOW do I make more money per customer? (Monetization / LTV / Upselling)
                6. LOCATION: Where is this primarily situated? (Triggers custom Location UI)
                7. CURRENT PHASE: Where is the idea now? (Concept, Prototype, Live)
                8. TEAM & RESOURCES: What is the current set-up or missing skill?
                9. BIGGEST RISK: What could kill this business? (Risk mitigation)
                10. TECHNICAL CHALLENGE: What is the 'how' behind the build? (Execution)
                
                STRICT RULE: TYPE MUST BE "select" ONLY. OPTIONS MUST HAVE EXACTLY 3 CHOICES.
                The question about Location/Country must include "Location" or "Country" in the text to trigger the specialized UI.
                
                FORMAT:
                {
                  "project_title": "Short Branding Name",
                  "project_description": "15-word punchy description",
                  "questions": [
                    {
                      "id": 1,
                      "text": "Strategic question about WHO / Problem / Offer...",
                      "type": "select",
                      "options": ["Strategic Opt 1", "Strategic Opt 2", "Strategic Opt 3"]
                    }
                  ]
                }
            `;

            const completion = await withRetry(() => getGroqClient().chat.completions.create({
                messages: [
                    { role: "system", content: "You only output JSON. You only use type: 'select'. You never use text or number. Every question must have 3 options." },
                    { role: "user", content: prompt }
                ],
                model: MODEL,
                response_format: { type: "json_object" }
            }));

            const parsed = cleanJSONResponse(completion.choices[0].message.content);
            const rawQuestions = parsed.questions || [];

            const validQuestions = rawQuestions.filter(q =>
                q.type === 'select' &&
                Array.isArray(q.options) &&
                q.options.length === 3
            );

            // If we don't have exactly what we asked for (e.g. some are text), we RE-RUN the whole AI call
            if (validQuestions.length < 5 && attempt < 5) {
                console.log(`AI returned invalid types (attempt ${attempt}/5). Re-generating entire set...`);
                return await generateQuestions(attempt + 1);
            }

            parsed.questions = validQuestions;
            return parsed;
        };

        const result = await generateQuestions();
        console.log("Research AI Answered Successfully.");
        res.json({
            webSignals,
            questions: result.questions || [],
            projectTitle: result.project_title || "New Venture",
            projectDescription: result.project_description || "Ready for discovery."
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
          Define the HIGH-LEVEL identity for a Startup Idea Report.
          Think of this like a napkin sketch that convinces investors — honest, clear, directional.
          
          You must provide a project name and list 4 section titles.
          Each title should be creative but clear — NOT corporate jargon.
          
          CRITICAL: You MUST use the exact IDs: "overview", "market", "execution", "reality".
          
          JSON SCHEMA:
          {
            "project_name": "Short punchy project name",
            "pages": [
              { "id": "overview", "title": "Creative title about the spark/idea/vision", "isPlaceholder": true },
              { "id": "market", "title": "Creative title about opportunity/audience/demand", "isPlaceholder": true },
              { "id": "execution", "title": "Creative title about the build/how/engine", "isPlaceholder": true },
              { "id": "reality", "title": "Creative title about reality check/risks/next steps", "isPlaceholder": true }
            ]
          }
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON only." }, { role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
        });

        res.json(cleanJSONResponse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-report-section', async (req, res) => {
    const { idea, webSignals, answers, sectionId, sectionTitle } = req.body;
    try {
        const signalsSummary = JSON.stringify(webSignals || {}).substring(0, 800);
        const answersSummary = typeof answers === 'string' ? answers.substring(0, 800) : JSON.stringify(answers).substring(0, 800);
        const prompt = `
          ROLE: You are a brutally honest startup advisor who builds napkin pitches that convince investors. 
          Be specific to THIS idea — no generic advice. Write like a sharp founder, not a consultant.
          
          IDEA: "${idea}"
          MARKET SIGNALS: ${signalsSummary}
          FOUNDER ANSWERS: ${answersSummary}
          
          TASK: Generate the COMPLETE content for: "${sectionTitle}" (ID: ${sectionId}).
          
          CRITICAL: Return ONLY the raw data object fields. DO NOT wrap in "${sectionId}" or "content" key.
          
          ID-SPECIFIC SCHEMAS:

          ${sectionId === 'overview' ? `
          Return this EXACT structure:
          {
            "elevator_pitch": "One powerful sentence that captures the entire idea — like a tweet",
            "problem": "2-3 sentences. Make it emotional + real. Who faces this? Why is it painful? Be specific, not vague.",
            "solution": "2-3 sentences in plain language. How does it solve the problem? What makes it different?",
            "target_users": [
              { "segment": "Primary user group name", "description": "Age, situation, location, behavior — be specific" },
              { "segment": "Secondary user group", "description": "Specific demographics" }
            ],
            "why_now": "2-3 sentences on what makes this timely — trend, tech shift, market gap, cultural moment",
            "chart_data": [{"label": "Month 1", "value": 10}, {"label": "Month 3", "value": 30}, {"label": "Month 6", "value": 60}, {"label": "Month 12", "value": 100}]
          }` : ''}

          ${sectionId === 'market' ? `
          Return this EXACT structure:
          {
            "market_size": "1-2 sentences on how many people need this. Use logic, not just numbers. Is the market growing?",
            "growth_signals": ["Signal 1 — specific trend or data point", "Signal 2", "Signal 3"],
            "competitors": [
              { "name": "Competitor name", "what_they_do": "Brief description", "weakness": "Specific gap you can exploit" },
              { "name": "Competitor 2", "what_they_do": "Brief", "weakness": "Gap" },
              { "name": "Competitor 3", "what_they_do": "Brief", "weakness": "Gap" }
            ],
            "unique_edge": "2-3 sentences. Why will people choose YOUR solution? What's the moat?",
            "differentiation": "The single biggest thing that sets you apart — one clear sentence",
            "chart_data": [{"label": "Competitor A", "value": 35}, {"label": "Competitor B", "value": 30}, {"label": "Competitor C", "value": 20}, {"label": "Your Opportunity", "value": 15}]
          }` : ''}

          ${sectionId === 'execution' ? `
          Return this EXACT structure:
          {
            "how_it_works": [
              { "step": 1, "action": "User does X" },
              { "step": 2, "action": "System does Y" },
              { "step": 3, "action": "Result Z happens" },
              { "step": 4, "action": "Value delivered" }
            ],
            "business_model": "2-3 sentences explaining how you make money. Be specific — subscription? Freemium? B2B?",
            "revenue_streams": ["Revenue source 1", "Revenue source 2", "Revenue source 3"],
            "feasibility": "2-3 sentences — honest gut-check. What resources, skills, or tech would this need? What's obviously hard?",
            "est_mvp_cost": "$X,XXX - $XX,XXX range",
            "est_timeline": "X-Y months to MVP",
            "tech_needs": ["Key technology 1", "Key technology 2", "Key technology 3", "Key technology 4"],
            "chart_data": [{"label": "Development", "value": 40}, {"label": "Marketing", "value": 25}, {"label": "Operations", "value": 20}, {"label": "Infrastructure", "value": 15}]
          }` : ''}

          ${sectionId === 'reality' ? `
          Return this EXACT structure:
          {
            "risks": [
              { "category": "Risk category", "description": "What could go wrong — be specific", "severity": "High/Medium/Low" },
              { "category": "Risk 2", "description": "Specific concern", "severity": "High/Medium/Low" },
              { "category": "Risk 3", "description": "Specific concern", "severity": "High/Medium/Low" },
              { "category": "Risk 4", "description": "Specific concern", "severity": "High/Medium/Low" }
            ],
            "open_questions": [
              "Question 1 — something you don't know yet that would determine if this is worth pursuing",
              "Question 2 — an unknown that needs answering before committing",
              "Question 3 — a critical assumption to validate",
              "Question 4 — a market question that needs real data",
              "Question 5 — a feasibility question"
            ],
            "validation_plan": [
              { "step": 1, "action": "Smallest action to validate or kill this idea — be specific" },
              { "step": 2, "action": "Next concrete step with a real deliverable" },
              { "step": 3, "action": "Third validation step" }
            ],
            "future_scope": ["Where this could go in Year 2+", "Expansion possibility", "Dream bigger vision"],
            "chart_data": [
              { "label": "Market Risk", "value": 6 },
              { "label": "Technical Risk", "value": 5 },
              { "label": "Financial Risk", "value": 7 },
              { "label": "Competition", "value": 5 },
              { "label": "Execution Risk", "value": 6 }
            ]
          }` : ''}
        `;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON only. Be specific to the business idea. No generic advice. Write like a sharp, honest startup advisor." }, { role: "user", content: prompt }],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 4000
        });

        res.json(cleanJSONResponse(completion.choices[0].message.content));
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
        let reportSummary = ''; try { const parsed = typeof report === 'string' ? JSON.parse(report) : report; if (parsed && parsed.pages) { reportSummary = parsed.pages.map(function (p) { return p.title; }).join(', '); } else { reportSummary = JSON.stringify(parsed).substring(0, 600); } } catch (e) { reportSummary = String(report).substring(0, 600); }
        const prompt = `
          ROLE: Elite Startup Operations Expert.
          IDEA: "${idea}"
          REPORT TOPICS: ${reportSummary}
          
          TASK:
          Generate the HIGH-LEVEL STRUCTURE for a 60-Day Execution Roadmap.
          Divide 60 days into 4 logical PHASES (approx 15 days each).
          Crucially, you MUST also generate EXACTLY 60 short task titles for every single day.
          
          JSON SCHEMA:
          {
            "short_title": "3-5 word concise mission name",
            "phases": [
                { "id": 1, "name": "Deep Research", "color": "#8B5CF6", "range": "1-15" },
                { "id": 2, "name": "Local Validation", "color": "#3B82F6", "range": "16-30" },
                { "id": 3, "name": "Minimum Build", "color": "#10B981", "range": "31-45" },
                { "id": 4, "name": "Launch & Feedback", "color": "#F59E0B", "range": "46-60" }
            ],
            "day_titles": ["Title Day 1", "Title Day 2", "Title Day 3", "Title Day 4", "Title Day 5", "Title Day 6", "Title Day 7", "Title Day 8", "Title Day 9", "Title Day 10", "Title Day 11", "Title Day 12", "Title Day 13", "Title Day 14", "Title Day 15", "Title Day 16", "Title Day 17", "Title Day 18", "Title Day 19", "Title Day 20", "Title Day 21", "Title Day 22", "Title Day 23", "Title Day 24", "Title Day 25", "Title Day 26", "Title Day 27", "Title Day 28", "Title Day 29", "Title Day 30", "Title Day 31", "Title Day 32", "Title Day 33", "Title Day 34", "Title Day 35", "Title Day 36", "Title Day 37", "Title Day 38", "Title Day 39", "Title Day 40", "Title Day 41", "Title Day 42", "Title Day 43", "Title Day 44", "Title Day 45", "Title Day 46", "Title Day 47", "Title Day 48", "Title Day 49", "Title Day 50", "Title Day 51", "Title Day 52", "Title Day 53", "Title Day 54", "Title Day 55", "Title Day 56", "Title Day 57", "Title Day 58", "Title Day 59", "Title Day 60"]
          }
        `;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
        }));

        const content = completion.choices[0].message.content;
        res.json(cleanJSONResponse(content));
    } catch (err) {
        console.error('Plan structure generation failed:', err.message, err.status || '');
        if (err.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment." });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-phase-tasks', async (req, res) => {
    const { idea, report, answers, phase, allPreviousTasks = [], predefined_titles = [] } = req.body;
    try {
        const [start, end] = phase.range.split('-').map(Number);
        const dayCount = end - start + 1;

        // Trim report to just key info (titles only) to reduce input tokens
        let reportSummary = '';
        try {
            const parsed = typeof report === 'string' ? JSON.parse(report) : report;
            if (parsed?.pages) {
                reportSummary = parsed.pages.map(p => `${p.title}: ${p.content?.explanation?.substring(0, 120) || ''}`).join('\n');
            } else {
                reportSummary = JSON.stringify(parsed).substring(0, 800);
            }
        } catch { reportSummary = String(report).substring(0, 800); }

        // Trim answers — keep more context for better task quality
        const answersSummary = typeof answers === 'string'
            ? answers.substring(0, 700)
            : JSON.stringify(answers).substring(0, 700);

        // Include last 15 previous task titles for continuity  
        const prevSummary = allPreviousTasks.slice(-15).map(t => `Day ${t.day}: ${t.title}`).join('\n');

        // Build per-day phase mapping instructions
        const dayPhaseMap = phase.dayPhaseMap || [];
        const phaseNames = phase.phases || [];
        const phaseInstructions = dayPhaseMap.length > 0
            ? dayPhaseMap.map(m => `Day ${m.day} → phase_id: "${m.phase_id}" (${m.phase_name})`).join('\n')
            : Array.from({ length: dayCount }, (_, i) => `Day ${start + i} → phase_id: "${phase.id || 1}"`).join('\n');

        const phaseDescriptions = phaseNames.length > 0
            ? phaseNames.map(p => `• "${p.name}" (Days ${p.range}): ${p.name === 'Deep Research' ? 'Market analysis, competitor intel, regulatory research, customer discovery, data collection' : p.name === 'Local Validation' ? 'Customer interviews, prototype testing, pricing experiments, partnership outreach, community feedback' : p.name.includes('Build') ? 'MVP development, operations setup, hiring, equipment procurement, systems integration' : 'Soft launch, customer feedback loops, marketing execution, performance optimization, iteration'}`).join('\n')
            : `• "${phase.name}" (Days ${phase.range})`;

        const prompt = `
      ROLE: You are an elite startup execution strategist with deep domain expertise. You create ACTIONABLE, SPECIFIC tasks that reference real tools, frameworks, data sources, and measurable outcomes.

      BUSINESS IDEA: "${idea}"
      
      STRATEGIC CONTEXT:
      ${reportSummary}
      
      FOUNDER PROFILE & ANSWERS:
      ${answersSummary}

      PHASES IN THIS BATCH:
      ${phaseDescriptions}
      
      PREVIOUSLY COMPLETED TASKS:
      ${prevSummary || 'This is the starting batch — no previous tasks.'}

      ASSIGNMENT:
      Generate exactly ${dayCount} high-quality task objects for Day ${start} through Day ${end}.

      PREDEFINED TITLES (USE EXACTLY):
      ${predefined_titles.map((t, i) => `Day ${start + i}: ${t}`).join('\n')}

      CORRECT PHASE_ID FOR EACH DAY:
      ${phaseInstructions}

      QUALITY STANDARDS:
      • Each "task" field must be 2-4 sentences of SPECIFIC strategic direction (not vague advice). Reference the business idea directly.
      • Each "details" array must have EXACTLY 3 granular action steps. Each step should name a SPECIFIC tool (Google Sheets, Canva, Trello, Figma, Instagram, LinkedIn, SurveyMonkey, Typeform, Notion, Airtable, SketchUp, QuickBooks, etc.) or methodology (Porter's Five Forces, SWOT, Jobs-to-be-Done, etc.).
      • Each "deliverable" must be a CONCRETE output (e.g., "Competitor pricing matrix spreadsheet with 7+ local shops" not "Research document").
      • "impact" must be "Low", "Medium", or "High" based on how directly the task drives revenue or reduces risk.
      • "est_time" must be realistic (e.g., "2-4 hours", "3-5 hours", "4-6 hours").
      • Tasks must PROGRESS logically — later days should build on earlier days' outputs.
      • NEVER repeat the same task concept across different days.

      JSON SCHEMA (output ONLY this):
      {
        "days": [
          { 
            "day": ${start}, 
            "phase_id": "use the EXACT phase_id from CORRECT PHASE_ID list above",
            "title": "Use the EXACT predefined title",
            "task": "2-4 specific strategic sentences referencing the business idea.", 
            "deliverable": "Concrete, measurable output",
            "details": ["Specific action with named tool/method", "Second specific action", "Third specific action"],
            "impact": "High",
            "est_time": "2-4 hours"
          }
        ]
      }

      CRITICAL RULES:
      1. Output ONLY valid JSON with a single "days" array of exactly ${dayCount} items.
      2. Each day must have a UNIQUE "day" number from ${start} to ${end} — no duplicates, no gaps.
      3. Use the EXACT predefined titles provided above.
      4. Use the EXACT phase_id values from the mapping above — DO NOT make up phase IDs.
      5. Every task must be deeply relevant to "${idea}" — generic startup advice is UNACCEPTABLE.
    `;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "You are a world-class startup execution planner. You output ONLY valid JSON. Your tasks are deeply specific, reference real tools and methodologies, and build on each other progressively. The 'days' array must contain every single requested day in a single flat list. Always use the exact phase_id provided for each day." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 8000
        }));

        res.json(cleanJSONResponse(completion.choices[0].message.content));
    } catch (err) {
        console.error(`Phase tasks generation failed:`, err.message);
        if (err.status === 429) {
            return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment." });
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
      
      REQUIRED SECTIONS:
      1. Idea Summary
      2. Market Demand Analysis
      3. Competitive Landscape
      4. Market Gap & Differentiation
      5. Risk Analysis
      6. Feasibility Analysis
      7. Mentor / Investor Perspective
      8. Strategic Next Steps

      STRICT RULES:
      - BE CRITICAL AND REALISTIC.
      - NEVER mention specific website names or source URLs.
      - COMPETITOR NAMES: Provide specific names.
      - Scores must be integers from 1-10.

      JSON SCHEMA:
      {
        "project_name": "Short clean name",
        "explanation": "Clear explanation",
        "target_user": "Primary persona",
        "value_prop": "Core value proposition",
        "market_demand": { "score": 8, "justification": "..." },
        "competitors": [{ "name": "...", "what_they_do": "...", "strengths": "...", "weaknesses": "..." }],
        "competitiveness_score": 6,
        "market_gap": "...",
        "differentiation": "...",
        "risks": { "market": "...", "execution": "...", "adoption": "...", "financial": "..." },
        "feasibility": { "score": 7, "analysis": "..." },
        "mentor_perspective": { "appreciate": "...", "criticize": "...", "advice": "..." },
        "next_steps": { "immediate": ["Step 1", "Step 2", "Step 3"], "avoid": ["Pitfall 1", "Pitfall 2"] }
      }
    `;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "You are a world-class mentor. Output valid JSON." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 4000
        }));

        res.json(cleanJSONResponse(completion.choices[0].message.content));
    } catch (err) {
        console.error("ANALYSIS FAILED:", err.message);
        res.status(500).json({ error: "Analysis failed", details: err.message });
    }
});

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
      - TASKS must be EXTREMELY practical, actionable, and specific to the industry/location.
      - AVOID GENERIC advice. Instead of "Do market research", say "Visit 3 local competitors in [Location] to check if they sell ₹15 or ₹20 tea/products".
      - DOCUMENTATION & COMPLIANCE: You MUST dedicate specific tasks in the Research/Validation phases strictly for legal, registration, and paperwork needed for this exact idea and LOCATION (e.g., FSSAI for food in India, Shop & Establishment Act, specific local permits).
      - PHASES should group days together (e.g., Days 1-7 = Phase 1).
      - NO REPETITION. No "Continue working on...". Every day is exactly one new concrete step.
      - INTEGRATE REAL TOOLS: Mention specific tools where helpful (Canva, Google My Business, WhatsApp).

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
        ]
      }
    `;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "You are an operations-focused mentor. Provide a 60-day sequence of high-leverage actions. Output valid JSON. Ensure exactly 60 days are generated." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 8000,
        }));

        const plan = cleanJSONResponse(completion.choices[0].message.content);
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
6. **No Internal Reasoning**: NEVER output <think>, </think>, or any chain-of-thought tags. Only output your final polished response.

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
            .replace(/\[DELETE ALL\]/g, '')
            // Strip chain-of-thought <think> tags from reasoning models
            .replace(/<think>[\s\S]*?<\/think>/gi, '');

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
    const { productId, quantity = 1, userEmail, userId, metadata, planType, returnUrl } = req.body;

    try {
        const dp = getDodoPayments();
        if (!dp) {
            throw new Error("Dodo Payments is not configured (missing API key).");
        }

        // Fallback sequentially: provided > server env > hardcoded default
        const targetProductId = productId || process.env.DODO_PAYMENTS_PRODUCT_ID || "pdt_0Na6mITO06djfopBpp1zr";

        if (!targetProductId) {
            return res.status(400).json({ error: "No product ID configured. Please set DODO_PAYMENTS_PRODUCT_ID." });
        }
        
        const baseUrl = returnUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await dp.checkoutSessions.create({
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
            return_url: `${baseUrl}/checkout-result?session_id={checkout_session_id}`,
        });

        res.json({ checkout_url: session.checkout_url });
    } catch (err) {
        console.error("DODO CHECKOUT ERROR:", err.message);
        res.status(500).json({ error: "Failed to create checkout session", details: err.message });
    }
});

app.get('/api/checkout/verify', async (req, res) => {
    try {
        const { session_id, subscription_id } = req.query;
        const dp = getDodoPayments();
        if (!dp) return res.status(500).json({ error: "Dodo Payments not configured" });

        let session;
        if (subscription_id && subscription_id !== '{subscription_id}') {
            session = await dp.subscriptions.retrieve(subscription_id);
        } else if (session_id && session_id !== '{checkout_session_id}') {
            session = await dp.checkoutSessions.retrieve(session_id);
        } else {
            return res.status(400).json({ error: "No valid tracking ID provided" });
        }
        
        // Eagerly update database if succeeded (failsafe for slow or missing webhooks)
        if (session.status === 'succeeded' || session.status === 'active' || session.payment_status === 'succeeded') {
            const userId = session.metadata?.userId;
            const planType = session.metadata?.planType || 'pro';
            if (userId) {
                const adminKey = process.env.INSFORGE_API_KEY || process.env.VITE_INSFORGE_ANON_KEY;
                const baseUrl = process.env.VITE_INSFORGE_URL;

                try {
                    await axios.post(`${baseUrl}/api/admin/sql`, {
                        query: `INSERT INTO public.profiles (id, email, subscription_status, dodo_customer_id) 
                                VALUES ($1, $2, $3, $4) 
                                ON CONFLICT (id) 
                                DO UPDATE SET subscription_status = EXCLUDED.subscription_status, dodo_customer_id = EXCLUDED.dodo_customer_id, updated_at = NOW()`,
                        params: [userId, session.customer?.email || '', planType, session.customer?.id || session.customer_id]
                    }, {
                        headers: { 'Content-Type': 'application/json', 'x-api-key': adminKey }
                    });
                } catch (e) {
                    console.warn("Eager DB update failed:", e.message);
                }
            }
        }
        res.json(session);
    } catch (err) {
        console.error("Session verification error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/webhook/dodo', (req, res) => {
    res.status(200).send("Dodo Webhook endpoint is active. Use POST to send webhooks.");
});

app.post('/api/webhook/dodo', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        // Fix: req.body might already be parsed by express.json() globally
        const event = typeof req.body === 'string' || Buffer.isBuffer(req.body) 
            ? JSON.parse(req.body.toString()) 
            : req.body;
            
        console.log(`✅ Dodo Webhook: ${event.type}`, event.data?.id || '');

        switch (event.type) {
            case 'payment.succeeded':
            case 'subscription.active':
            case 'subscription.renewed':
                const data = event.data;
                const userId = data.metadata?.userId;
                const planType = data.metadata?.planType || 'pro';

                if (userId) {
                    try {
                        const adminKey = process.env.INSFORGE_API_KEY || process.env.VITE_INSFORGE_ANON_KEY;
                        const baseUrl = process.env.VITE_INSFORGE_URL;

                        await axios.post(`${baseUrl}/api/admin/sql`, {
                            query: `INSERT INTO public.profiles (id, email, subscription_status, dodo_customer_id) 
                                    VALUES ($1, $2, $3, $4) 
                                    ON CONFLICT (id) 
                                    DO UPDATE SET subscription_status = EXCLUDED.subscription_status, dodo_customer_id = EXCLUDED.dodo_customer_id, updated_at = NOW()`,
                            params: [userId, event.data.customer?.email || '', planType, event.data.customer?.id]
                        }, {
                            headers: { 'Content-Type': 'application/json', 'x-api-key': adminKey }
                        });
                        console.log(`✅ Profile updated to PRO for user ${userId}`);
                    } catch (dbErr) {
                        console.warn("DB fulfillment failure:", dbErr.message);
                    }
                }
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
        const dp = getDodoPayments();
        if (!dp) {
            throw new Error("Dodo Payments is not configured.");
        }
        const session = await dp.customerPortalSessions.create({
            customer_id: customerId,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`
        });
        res.json({ portal_url: session.portal_url });
    } catch (err) {
        console.error("DODO PORTAL ERROR:", err.message);
        res.status(500).json({ error: "Failed to create portal session" });
    }
});

// --- SERVE FRONTEND (Restored for Render) ---
app.get(/.*/, (req, res) => {
    const rootPath = path.join(__dirname, '..');
    res.sendFile(path.join(rootPath, 'dist', 'index.html'));
});

// Only start the server if not running in a serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`🚀 Capable Server active on port ${port}`);
    });
}

export default app;
