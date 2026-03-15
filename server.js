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
import session from 'express-session';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    const oldStatus = res.status;
    res.status = function(code) {
        if (code === 401) {
            console.log(`⚠️ SERVER SENDING 401 for ${req.method} ${req.url}`);
        }
        return oldStatus.apply(res, arguments);
    };
    next();
});
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'capable-secret-key-123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));



// --- AUTH UTILS ---
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NODE_ENV === 'production' 
        ? `${process.env.FRONTEND_URL}/api/auth/google/callback`
        : `http://localhost:3001/api/auth/google/callback`
);

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
            if (i < 8) { // Increased to 8 for better signals
                results.push({
                    title: $(el).find('.result__title').text().trim(),
                    description: $(el).find('.result__snippet').text().trim(),
                    domain: $(el).find('.result__url').text().trim()
                });
            }
        });
        console.log(`DDG results for "${query}" (kl=${kl}): ${results.length}`);
        return results;
    } catch (err) {
        console.error("DDG Scrape Error:", err.message);
        return [];
    }
}

async function fetchRedditSignals(query) {
    try {
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5&sort=relevance`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'CAPABLE-Audit-Bot/1.0.0',
                'Accept': 'application/json'
            }
        });
        const posts = data.data?.children?.map(child => ({
            title: child.data.title,
            text: child.data.selftext?.substring(0, 300) || "",
            subreddit: child.data.subreddit_name_prefixed
        })) || [];
        console.log(`Reddit signals for "${query}": ${posts.length}`);
        return posts;
    } catch (err) {
        console.warn("Reddit Fetch Error (likely 403):", err.message);
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

// --- CONTENT MODERATION ---

const BLOCKED_KEYWORDS = [
    // Drugs & illegal substances
    'drug dealing', 'drug trafficking', 'sell drugs', 'selling drugs', 'meth lab', 'cocaine',
    'heroin', 'fentanyl', 'illegal drugs', 'drug cartel', 'narcotics trafficking',
    // Weapons & violence
    'illegal weapons', 'gun trafficking', 'bomb making', 'explosives', 'sell guns illegally',
    'arms dealing', 'child exploitation', 'human trafficking', 'sex trafficking',
    // Fraud & financial crimes
    'money laundering', 'ponzi scheme', 'pyramid scheme', 'counterfeit money', 'counterfeit currency',
    'identity theft', 'credit card fraud', 'bank fraud', 'tax evasion scheme', 'wire fraud',
    'insurance fraud',
    // Cybercrime
    'hacking service', 'ransomware', 'phishing', 'sell stolen data', 'ddos attack',
    'malware', 'spyware', 'keylogger service', 'dark web marketplace',
    // Gambling & illegal betting (unlicensed)
    'illegal gambling', 'match fixing', 'rigged betting',
    // Other illegal activities
    'prostitution ring', 'illegal organ', 'poaching', 'ivory trading',
    'child labor', 'sweatshop', 'slave labor', 'terrorism', 'terrorist',
    'assassination', 'hitman', 'contract killing',
    // Explicit harmful content
    'deepfake porn', 'revenge porn', 'child porn', 'csam'
];

/**
 * Content Moderation Gate
 * Checks if an idea involves illegal or harmful activities.
 * Returns { blocked: boolean, reason: string }
 */
async function moderateContent(idea) {
    const normalized = idea.toLowerCase().trim();

    // Level 1: Instant keyword check (fast, no API call)
    for (const keyword of BLOCKED_KEYWORDS) {
        if (normalized.includes(keyword)) {
            console.log(`⛔ BLOCKED by keyword: "${keyword}" in idea: "${idea.substring(0, 50)}..."`);
            return {
                blocked: true,
                reason: "This idea involves activities that may be illegal or harmful. We can't assist with this."
            };
        }
    }

    // Level 2: AI-powered safety check for ambiguous cases
    try {
        const groq = getGroqClient();
        const check = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a content safety classifier. Your ONLY job is to determine if a business idea involves CLEARLY ILLEGAL or HARMFUL activities.

BLOCK these categories:
- Drug manufacturing/trafficking/dealing
- Weapons trafficking or manufacturing illegal weapons
- Human trafficking, exploitation, or slavery
- Financial fraud, scams, Ponzi/pyramid schemes
- Cybercrime (hacking, ransomware, phishing, stolen data)
- Terrorism or violence
- Child exploitation of any kind
- Counterfeit goods or currency
- Any activity that is clearly illegal in most jurisdictions

DO NOT BLOCK:
- Legal businesses even if controversial (alcohol, tobacco, gambling where legal, adult entertainment where legal)
- Competitive intelligence, market research, or business strategy
- Legitimate security services (penetration testing, cybersecurity)
- Ideas that are unusual but legal
- Ideas that mention regulated industries (cannabis where legal, firearms dealers where legal)

Respond with ONLY valid JSON: {"safe": true} or {"safe": false, "category": "brief reason"}`
                },
                {
                    role: "user",
                    content: `Business idea: "${idea}"`
                }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 50,
        });

        const result = JSON.parse(check.choices[0].message.content);

        if (!result.safe) {
            console.log(`⛔ BLOCKED by AI: category="${result.category}" idea="${idea.substring(0, 50)}..."`);
            return {
                blocked: true,
                reason: "This idea involves activities that may be illegal or harmful. We can't assist with this."
            };
        }
    } catch (err) {
        // If safety check fails, allow through (fail-open for legitimate users)
        // The keyword check above already caught obvious cases
        console.warn("Safety check API call failed, allowing through:", err.message);
    }

    return { blocked: false };
}

// --- API ENDPOINTS ---

app.post('/api/enhance-idea', async (req, res) => {
    const { idea } = req.body;
    try {
        // Content moderation gate
        const moderation = await moderateContent(idea);
        if (moderation.blocked) {
            return res.status(403).json({ error: moderation.reason, blocked: true });
        }

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
        // Content moderation gate
        const moderation = await moderateContent(idea);
        if (moderation.blocked) {
            return res.status(403).json({ error: moderation.reason, blocked: true });
        }

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

      SAFETY GUARDRAIL:
      If the idea involves ANY illegal activity (drug dealing, weapons trafficking, fraud, scams, hacking, human trafficking, terrorism, etc.),
      DO NOT generate questions. Instead return: { "blocked": true, "reason": "This idea involves illegal activities." }

      TASK:
      You are a friendly, down-to-earth Co-founder helping a new entrepreneur.
      Your goal is to understand their idea fully so we can build a business plan.
      
      CRITICAL INSTRUCTION:
      - Use SIMPLE, LAYMAN language. No business jargon. Speak like you're talking to a friend.
      - If the user's idea ALREADY explains a specific point (e.g., they said "I have $50k"), DO NOT ASK that question.

      COMPULSORY QUESTIONS (Ask these UNLESS already answered):
      1. Precise Problem: What specific pain point are they solving?
      2. The Gap: Why do current solutions fail?
      3. Investment: How much initial capital do they have? (Range options)
      4. Funding Source: Where is the money coming from? (Savings, Loan, Investors, etc.)
      5. Location: Ask "Where are you initially focusing?". (This is mandatory)
      6. Contextual: One dynamic question specific to their domain/idea.

      QUESTION ANALYSIS:
      For each question, include a brief "why" field explaining why you're asking this question.
      This helps the user understand the reasoning behind each question.

      STRICT RULES:
      - Total questions: Give BETWEEN 5 and 10 questions. Never always give exactly 5.
      - Question Format: Return EXACTLY the question text alone. NEVER add tags, prefixes, or headers like "Specific milk problem: " or "Topic: ".
      - Options per question: EXACTLY 3 simple options.
      - Format: Return ONLY valid JSON.
      - Questions must be simple and easy to answer for a beginner.
      - Project Title: Generate a "project_title" that is STRICTLY TWO WORDS representing the essence of the idea (e.g., "Solar Bloom", "Quick Craft").
      - Project Description: Generate a "project_description" that is STRICTLY ONE SENTENCE (max 15 words) describing the business core.
      
      JSON SCHEMA:
      {
        "project_title": "Two Words",
        "project_description": "One sentence description.",
        "questions": [
          { "text": "Question text?", "options": ["Option 1", "Option 2", "Option 3"], "theme": "Theme Name", "why": "Brief reason why this question matters" }
        ]
      }
    `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "You are a startup scout focusing on operations and market fit. Output valid JSON. IMPORTANT: If the idea involves any illegal or harmful activity, return {\"blocked\": true, \"reason\": \"explanation\"}. Never assist with illegal business ideas." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
        }));

        const content = completion.choices[0].message.content;
        console.log("Research AI Answered Successfully.");
        const parsed = JSON.parse(content);

        // Check if AI flagged the idea
        if (parsed.blocked) {
            return res.status(403).json({
                error: parsed.reason || "This idea involves activities that cannot be supported.",
                blocked: true
            });
        }

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

app.post('/api/analyze', async (req, res) => {
    const { idea, webSignals, answers } = req.body;
    console.log(`\n--- FINAL ANALYSIS REQUEST ---`);

    // Content moderation gate (post-questions check)
    try {
        const moderation = await moderateContent(idea);
        if (moderation.blocked) {
            return res.status(403).json({ error: moderation.reason, blocked: true });
        }
    } catch (e) {
        console.warn('Moderation check failed at analysis stage:', e.message);
    }

    try {
        const prompt = `
      ROLE: Elite Strategic Co-founder & Market Analyst.
      USER IDEA: "${idea}"
      MARKET RESEARCH CONTEXT: ${JSON.stringify(webSignals, null, 2)}
      USER INTERVIEW SUMMARY: ${answers}

      TASK:
      Generate an exhaustive, 4-page Strategic Blueprint. Break down the content into 4 distinct, highly detailed sections (pages). 
      BE VERBOSE: Provide deep tactical insight, data-backed projections, and industry-specific metrics.

      PAGE STRUCTURE:
      1. Executive Manifesto & Market Urgency: 
         - Deep explanation of why this works NOW.
         - Target Persona breakdown (demographics, psychographics).
         - Core Value Proposition and specific "Magic Moment".
         - Market Demand Score with 2-3 paragraph justification.

      2. Competitive Deep-Dive & Market Gap:
         - Minimum 3 specific competitors from research.
         - Detailed SWAT (Strengths, Weaknesses, Opportunities, Threats) for each.
         - Identification of the "Structural Gap" in the current market.
         - Specific Differentiation Strategy (The "Moat").

      3. Technical Blueprint & Feasibility:
         - Technical Viability score.
         - Suggested Tech Stack (Backend, Frontend, AI/Data tools).
         - High-level architecture suggestion.
         - Development Complexity Analysis.
         - Preliminary Cost Estimate (MVP).

      4. Execution Strategy & Risk Mitigation:
         - Strategic Roadmap (High level).
         - Deep Risk Analysis (Market, Execution, Financial, Legal/Compliance).
         - Mentor's Brutal Perspective (Appreciation, Criticism, Pivot Advice).
         - Immediate Tactical Directives.

      STRICT RULES:
      - Total length should be approx 1500-2000 words across all pages.
      - USE DATA: Reference search trends, reddit sentiment, and user location context.
      - COMPETITOR NAMES: You MUST use real, specific brand names found in the MARKET RESEARCH CONTEXT. 
      - DO NOT use generic placeholders like "Competitor A", "Competitor B", or "Brand X". This is a CRITICAL REQUIREMENT.
      - Format: Return ONLY valid JSON matching the schema below.
      - Scores must be integers 1-10.

      JSON SCHEMA:
      {
        "project_name": "Brand Name",
        "pages": [
          {
            "id": "executive",
            "title": "Executive Manifesto",
            "content": {
               "explanation": "...",
               "target_user": "...",
               "value_prop": "...",
               "market_demand": { "score": 8, "analysis": "..." },
               "chart_data": [
                 { "label": "Month 1", "value": 10 },
                 { "label": "Month 3", "value": 35 },
                 { "label": "Month 6", "value": 65 },
                 { "label": "Month 12", "value": 100 }
               ]
            }
          },
          {
            "id": "market",
            "title": "Competitive Deep-Dive",
            "content": {
               "competitors": [
                  { "name": "REAL_BRAND_NAME_1", "analysis": "...", "weakness_to_exploit": "..." },
                  { "name": "REAL_BRAND_NAME_2", "analysis": "...", "weakness_to_exploit": "..." },
                  { "name": "REAL_BRAND_NAME_3", "analysis": "...", "weakness_to_exploit": "..." }
               ],
               "competitiveness_score": 7,
               "the_gap": "...",
               "differentiation": "...",
               "chart_data": [
                  { "label": "REAL_BRAND_1", "value": 45 },
                  { "label": "REAL_BRAND_2", "value": 30 },
                  { "label": "You (Projected)", "value": 25 }
               ]
            }
          },
          {
            "id": "technical",
            "title": "Technical Blueprint",
            "content": {
               "viability_score": 9,
               "suggested_stack": "...",
               "architecture": "...",
               "complexity": "...",
               "est_mvp_cost": "...",
               "chart_data": [
                  { "label": "Infrastructure", "value": 20 },
                  { "label": "Development", "value": 50 },
                  { "label": "AI Engine", "value": 30 }
               ]
            }
          },
          {
            "id": "risk",
            "title": "Strategy & Risk",
            "content": {
               "risks": { "market": "...", "technical": "...", "financial": "...", "legal": "..." },
               "mentor_advice": { "appreciate": "...", "criticize": "...", "advice": "..." },
               "immediate_actions": ["...", "...", "..."],
                "chart_data": [
                  { "label": "Market", "value": 4 },
                  { "label": "Technical", "value": 6 },
                  { "label": "Financial", "value": 3 },
                  { "label": "Operational", "value": 7 },
                  { "label": "Regulatory", "value": 5 }
                ]
            }
          }
        ]
      }
    `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "You are a world-class strategic consultant. You provide exhaustive, data-backed analysis. Output ONLY valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            max_tokens: 8000, 
        }));

        const report = JSON.parse(completion.choices[0].message.content);
        res.json(report);

    } catch (err) {
        console.error("ANALYSIS FAILED:", err.message);
        res.status(500).json({ error: "Analysis failed", details: err.message });
    }
});

// --- CHUNKED REPORT GENERATION ---

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

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON only." }, { role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
        }));

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-report-section', async (req, res) => {
    const { idea, webSignals, answers, sectionId, sectionTitle } = req.body;
    try {
        const prompt = `
          ROLE: Elite Strategic Analyst.
          IDEA: "${idea}"
          CONTEXT: ${JSON.stringify(webSignals)}
          ANSWERS: ${answers}
          
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
              "market_demand": { "score": (1-10), "analysis": "Reasoning" }, 
              "chart_data": [{"label": "Month 1", "value": 10}, {"label": "Month 3", "value": 40}, {"label": "Month 6", "value": 75}, {"label": "Month 12", "value": 100}]
            }
          - If "market": { 
              "competitors": [{"name": "Brand", "analysis": "Detailed assessment", "weakness_to_exploit": "Specific gap"}], 
              "competitiveness_score": (1-10), 
              "the_gap": "Market opportunity depth", 
              "differentiation": "The moat strategy", 
              "chart_data": [{"label": "Competitor A", "value": 40}, {"label": "Competitor B", "value": 35}, {"label": "You", "value": 25}]
            }
          - If "technical": { 
              "viability_score": (1-10), 
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
                { "label": "Market", "value": 1-10 },
                { "label": "Technical", "value": 1-10 },
                { "label": "Financial", "value": 1-10 },
                { "label": "Operational", "value": 1-10 },
                { "label": "Regulatory", "value": 1-10 }
              ]
            }
        `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON only." }, { role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        }));

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




app.post('/api/generate-plan-structure', async (req, res) => {
    const { idea, report, answers } = req.body;
    try {
        const prompt = `
      ROLE: Elite Startup Operations Expert.
      IDEA: "${idea}"
      STRATEGIC ASSESSMENT: ${JSON.stringify(report)}
      
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

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
        }));

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-phase-tasks', async (req, res) => {
    const { idea, report, answers, phase, allPreviousTasks = [] } = req.body;
    try {
        const [start, end] = phase.range.split('-').map(Number);
        const dayCount = end - start + 1;

        const prompt = `
      ROLE: Elite Startup Operations Expert & Silicon Valley Builder.
      IDEA: "${idea}"
      STRATEGIC ASSESSMENT: ${JSON.stringify(report)}
      USER ANSWERS (LOCATION/CONTEXT): ${JSON.stringify(answers)}
      PHASE: "${phase.name}" (Days ${phase.range})
      
      PREVIOUS TASKS SUMMARY:
      ${allPreviousTasks.map(t => `Day ${t.day}: ${t.title}`).join('\n')}

      TASK:
      Generate EXACTLY ${dayCount} ULTRA-DETAILED, tactical tasks for this phase.
      
      CRITICAL INSTRUCTIONS FOR DEPTH:
      - MAXIMIZE OUTPUT: Use roughly 300-500 words of tactical advice per day if needed. 
      - NO INTERNAL DAY MENTIONS: Strictly avoid phrases like "Day 1", "Day 2", or "In the first two days" inside the details or task description. Refer to them only as "tasks".
      - NO GENERIC STEPS: Instead of "Analyze competitors", say "Go to snov.io or builtwith.com to identify the tech stack of [Competitor Name from report] and check their LinkedIn 'People' tab to see their hiring velocity."
      - TOOL RECOMMENDATIONS: Suggest specific free tools, templates, or platforms (e.g. Canva, Trello, MailerLite, Vercel).
      - ACTION STEPS: Provide exactly 5-7 granular sub-steps for every single day.
      - DOCUMENTATION & LEGAL: Integrate tasks for business documentation (SOPs, contract templates, financial trackers).
      - BUSINESS SUITABILITY: In Phase 1 or 2, allocate tasks to evaluate which business structure (e.g., Sole Proprietorship, LLC, Pvt Ltd) suits this specific idea and location.
      - LOCATION SPECIFIC: Use the user's location from the answers (if available) to suggest specific local registrations (e.g., GST in India, EIN in US, Companies House in UK).
      - IMPACT: Must be exactly "Low", "Medium", or "High" only. Strictly avoid any bracketed explanations or extra words.
      - EST_TIME: Be realistic (e.g., "4-6 hours").

      JSON SCHEMA:
      {
        "days": [
          { 
            "day": ${start}, 
            "phase_id": ${phase.id},
            "title": "Punchy 5-word action name",
            "task": "A 2-3 sentence deep-dive into exactly WHAT needs to be achieved and WHY it is critical for this specific ${idea}.", 
            "deliverable": "A tangible, verifiable output (e.g. 'A CSV of 50 local leads with verified emails')",
            "details": [
                "Granular step 1 with tool recommendation",
                "Granular step 2 with specific target or metric",
                "Granular step 3 with 'How-to' shortcut",
                "Granular step 4 focusing on a specific risk",
                "Granular step 5 focusing on documentation",
                "Granular step 6 (Optional/Pro tip)"
            ],
            "impact": "High",
            "est_time": "Real-world time estimate"
          }
          // ... up to Day ${end}
        ]
      }
    `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "You are an obsessive operations mentor. You hate fluff and love data. Provide massive value in your JSON. Ensure every task is unique and deeply connected to the business idea." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            max_tokens: 8000
        }));

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-plan', async (req, res) => {
    // Legacy support or fallback
    const { idea, report, answers } = req.body;
    try {
        const prompt = `
      ROLE: Elite Startup Operations Expert.
      IDEA: "${idea}"
      STRATEGIC ASSESSMENT: ${JSON.stringify(report)}

      TASK:
      Generate a 60-Day Execution Calendar. 
      JSON SCHEMA:
      {
        "short_title": "Concise mission name",
        "phases": [...],
        "days": [...]
      }
    `;

        const completion = await withRetry(() => getGroqClient(req).chat.completions.create({
            messages: [
                { role: "system", content: "Output valid JSON. Ensure exactly 60 days are generated." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            response_format: { type: "json_object" },
            max_tokens: 8000,
        }));

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
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
2. **Step Context**: If the user mentions a specific **Step** (e.g. "@Day 5 Step 2"), give **ultra-granular, tactical advice** specifically for that sub-task.
3. **Sandwich Content**: Start with a warm focus check, provide data/comparison in a **TABLE**, and end with a tactical tip.
4. **Markdown Tables**: Use standard | pipes for all data.
5. **Interactive**: Use @dayNumber frequently to link your advice to the roadmap.
6. **Concise**: Under 120 words.

🛠️ **CAPABILITIES:**
1. **Edit Tasks**: [EDIT_TASK:@taskNumber] ... [/EDIT_TASK]
2. **Add Tasks**: [ADD_TASKS] JSON [/ADD_TASKS]
3. **Replace Plan**: [REPLACE_TASKS] JSON [/REPLACE_TASKS]

OFF-TOPIC REJECTION:
If unrelated to "${idea}", reply ONLY: "🎯 Let's stay focused on **${idea}**! Ask me about tasks, competitors, or next steps."

ILLEGAL CONTENT REJECTION:
If the user asks about illegal activities (drugs, weapons, fraud, hacking, trafficking, etc.), reply ONLY: "⚠️ I can't assist with activities that may be illegal. Let's keep building something great with **${idea}**!"

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
    console.log("🚀 Incoming checkout request:", req.body);
    const { productId, quantity = 1, userEmail, userId, metadata, planType } = req.body;

    try {
        if (!process.env.DODO_PAYMENTS_API_KEY) {
            throw new Error("Dodo Payments API Key is not configured.");
        }

        const targetProductId = productId || process.env.DODO_PAYMENTS_PRODUCT_ID;

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
        console.error("--- DODO CHECKOUT ERROR DETAILS ---");
        console.log("Error status:", err.status || err.statusCode);
        console.log("Error message:", err.message);
        if (err.response) {
            console.log("Response data:", JSON.stringify(err.response.data, null, 2));
        }
        res.status(err.status || 500).json({
            error: "Failed to create checkout session",
            details: err.message,
            code: err.status
        });
    }
});

app.get('/api/checkout/verify/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        if (!dodoPayments) throw new Error("Dodo SDK not initialized");
        const session = await dodoPayments.checkoutSessions.retrieve(sessionId);
        res.json(session);
    } catch (err) {
        console.error("Verification failed:", err.message);
        res.status(500).json({ error: err.message });
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
            // Verification logic placeholder
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
                        // Attempt to find existing profile
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

// --- AUTH SESSION VERIFICATION ---
// This endpoint is the bridge. Frontend sends a token, we ask InsForge who it belongs to.
app.get('/api/auth/sessions/current', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ error: "No token provided" });
        }

        // Verify with InsForge
        try {
            const response = await axios.get(`${process.env.VITE_INSFORGE_URL}/api/auth/sessions/current`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Return user data directly
            res.json(response.data.user || response.data);
        } catch (insforgeErr) {
            console.error("InsForge Session Verification Failed:", insforgeErr.response?.data || insforgeErr.message);
            res.status(401).json({ error: "Invalid session token" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GOOGLE CUSTOM AUTH ENDPOINTS ---

app.get('/api/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        prompt: 'consent'
    });
    console.log("Redirecting to Google Auth:", url);
    res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch User Info from Google
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];

        console.log(`🔐 Google Callback: ${email} (${googleId})`);

        // 1. Try to Login to InsForge with even more aggressive fallback salts & identifiers
        // We try both GoogleId and Email as the Basis for the password (since it might have changed)
        const basisToTry = [googleId, email];
        const saltsToTry = [
            '__DEFAULT_SALT__',              // 1. Current salt from .env logic
            'capable-auth-salt',            // 2. Previous default
            'capable-app-salt',             // 3. Alternative common salt
            '',                             // 4. No salt (raw basis)
            null,                           // 5. Explicit null (raw basis)
            process.env.SESSION_SECRET       // 6. Session secret as salt
        ].filter((s, i, a) => a.indexOf(s) === i); 

        let authData = null;
        let successfulPassword = null;

        for (const basis of basisToTry) {
            for (const salt of saltsToTry) {
                const testPassword = getInsForgePassword(basis, salt);
                try {
                    console.log(`Attempting SDK login for ${email} [Basis: ${basis === googleId ? 'GoogleId' : 'Email'}, Salt: ${salt === '__DEFAULT_SALT__' ? 'Env' : (salt || 'None')}]`);
                    
                    const { data, error } = await insforge.auth.signInWithPassword({
                        email: email,
                        password: testPassword
                    });
                    
                    if (data?.accessToken) {
                        authData = data;
                        successfulPassword = testPassword;
                        console.log(`✅ SDK Login SUCCESS for ${email}`);
                        break;
                    }
                } catch (err) {
                    continue; // SDK usually returns {data, error} but we catch just in case
                }
            }
            if (authData) break;
        }

        // 2. If all loop logins failed, try SignUp or Recovery Login
        if (!authData) {
            console.log(`User ${email} not found with any known configuration. Attempting final SDK SignUp/Recovery...`);
            const finalPassword = getInsForgePassword(googleId); // Current default
            
            const { data: signUpData, error: signUpError } = await insforge.auth.signUp({
                email: email,
                password: finalPassword,
                name: name
            });

            if (signUpData?.accessToken) {
                authData = signUpData;
                console.log(`✅ New SDK account established for ${email}`);
            } else if (signUpError?.statusCode === 409) {
                // RECOVERY: If SignUp 409, it means user EXISTS. Since Loop failed, something is weird.
                // Try one last login with the current generation.
                console.log(`⚠️ User exists but login loop failed. Forcing SDK login with current generation for ${email}`);
                const { data: finalData } = await insforge.auth.signInWithPassword({
                    email: email,
                    password: finalPassword
                });
                
                if (finalData?.accessToken) {
                    authData = finalData;
                } else {
                    console.error("❌ SDK RECOVERY FAILED. User exists but password is unknown.");
                    throw new Error("Account exists with unknown password hash. Please reset in InsForge dashboard.");
                }
            } else if (signUpError) {
                console.error("InsForge SDK SignUp Error:", signUpError);
                throw new Error("Failed to create and login to InsForge account via SDK");
            }
        }

        const accessToken = authData.accessToken || authData.access_token || authData.token;
        
        if (!accessToken) {
            console.error("❌ NO TOKEN IN INSFORGE RESPONSE:", loginResponse.data);
            throw new Error("Login succeeded but no access token was provided.");
        }

        // Redirect to Frontend with the token
        const frontendRedirect = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?access_token=${accessToken}`;
        console.log("✅ Success! Token secured. Redirecting...");
        res.redirect(frontendRedirect);

    } catch (err) {
        console.error("GOOGLE AUTH ERROR:", err.message);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
});

// --- ADMIN API --- (Basic fetch for dashboard)
const ADMIN_EMAILS = ['harish2007328@gmail.com'];

app.get('/api/admin/users', async (req, res) => {
    try {
        // Simple verification for the demo
        const authHeader = req.headers.authorization;
        const { data: sessionData } = await insforge.auth.getCurrentSession(authHeader?.split(' ')[1]);
        if (!sessionData?.session?.user || !ADMIN_EMAILS.includes(sessionData.session.user.email)) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { data, error } = await insforge.from('profiles').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/projects', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const { data: sessionData } = await insforge.auth.getCurrentSession(authHeader?.split(' ')[1]);
        if (!sessionData?.session?.user || !ADMIN_EMAILS.includes(sessionData.session.user.email)) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { data, error } = await insforge.from('projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
