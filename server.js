import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import { DodoPayments } from 'dodopayments';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("No Groq API Key found in environment variables.");
    }
    return new Groq({ apiKey });
};

const dodoPayments = new DodoPayments({
    apiKey: process.env.DODO_PAYMENTS_API_KEY,
    endpoint: process.env.DODO_PAYMENTS_ENDPOINT || 'https://test.dodopayments.com' // Use test endpoint by default
});

const MODEL = "llama-3.1-8b-instant"; // Best balance of performance and high TPM limits

// --- RESEARCH HELPERS ---

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

async function scrapeDuckDuckGo(query) {
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);
        const results = [];
        $('.result__body').each((i, el) => {
            if (i < 5) { // Limit to 5 results for better context
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
        // Reddit is strict with User-Agents and often requires a specific format
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
        console.log(`Reddit signals for "${query}": ${posts.length}`);
        return posts;
    } catch (err) {
        console.warn("Reddit Fetch Error (likely 403):", err.message);
        return [];
    }
}

async function collectMarketSignals(idea) {
    console.log(`\n--- Researching: ${idea} ---`);

    const [searchSignals, competitionSignals, redditSignals] = await Promise.all([
        scrapeDuckDuckGo(idea),
        scrapeDuckDuckGo(`${idea} competitors alternative`),
        fetchRedditSignals(idea)
    ]);

    return {
        searchSignals: { organicResults: searchSignals },
        trendSignals: { evidenceCount: searchSignals.length },
        problemSignals: { redditDiscussions: redditSignals },
        competitionSignals: { links: competitionSignals.map(c => c.domain) },
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

        const webSignals = await collectMarketSignals(idea);

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
    const { productId, userEmail, userId, metadata } = req.body;

    try {
        if (!process.env.DODO_PAYMENTS_API_KEY) {
            throw new Error("Dodo Payments API Key is not configured.");
        }

        const session = await dodoPayments.checkout.create({
            product_id: productId,
            customer: {
                email: userEmail,
            },
            billing: {
                city: metadata?.city || 'Unknown',
                country: metadata?.country || 'US',
                state: metadata?.state || 'Unknown',
                street: metadata?.street || 'Unknown',
                zip: metadata?.zip || '00000',
            },
            metadata: {
                userId: userId,
                ...metadata
            },
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/project?payment=success`,
        });

        res.json({ checkout_url: session.checkout_url });
    } catch (err) {
        console.error("DODO CHECKOUT ERROR:", err.message);
        res.status(500).json({ error: "Failed to create checkout session", details: err.message });
    }
});

app.post('/api/webhook/dodo', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['x-dodo-signature'];
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    try {
        if (!webhookSecret) {
            console.warn("Dodo Webhook Secret not configured. Skipping verification.");
        }

        // Note: SDK should have a verify method, but for now we'll handle the event
        // If the signature is provided, you should verify it.
        const event = JSON.parse(req.body);

        console.log(`Dodo Webhook received: ${event.type}`);

        switch (event.type) {
            case 'subscription.created':
            case 'subscription.updated':
                const subscription = event.data;
                const userId = subscription.metadata?.userId;
                if (userId) {
                    console.log(`Updating subscription for user: ${userId}`);
                    // TODO: Update Supabase user profile with subscription status
                    // Example: await supabase.from('profiles').update({ is_pro: true, dodo_subscription_id: subscription.id }).eq('id', userId);
                }
                break;
            case 'subscription.cancelled':
                // Handle cancellation
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("DODO WEBHOOK ERROR:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});


// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
// In Express 5, the directory-style wildcard syntax has changed.
// Using a Regular Expression to catch all routes safely.
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});

export default app;
