const fs = require('fs');

function repairAPI() {
    let content = fs.readFileSync('api/index.js', 'utf8');

    // Mutilated block starts at `app.post('/api/enhance-idea', async (req, res) => {`
    // Ends just before `app.post('/api/generate-report-structure', async (req, res) => {`
    
    const blockStart = "app.post('/api/enhance-idea', async (req, res) => {";
    const blockEnd = "app.post('/api/generate-report-structure', async (req, res) => {";
    
    const startIndex = content.indexOf(blockStart);
    const endIndex = content.indexOf(blockEnd);
    
    if (startIndex === -1 || endIndex === -1) {
        console.error("Could not find blocks to patch.");
        return;
    }
    
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    const REPAIRED_BLOCK = `app.post('/api/enhance-idea', async (req, res) => {
    const { idea } = req.body;
    try {
        const prompt = \`
            ROLE: Expert Business Consultant.
            INPUT IDEA: "\${idea}"
            
            TASK: Shorten and punchify this business idea into a professional 1-sentence value proposition.
            JSON SCHEMA: { "enhanced_idea": "The punched up sentence" }
        \`;

        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output valid JSON." }, { role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        }));

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/research', async (req, res) => {
    const { idea, location } = req.body;
    try {
        const webSignals = await collectMarketSignals(idea, location);
        const signalsSummary = JSON.stringify(webSignals).substring(0, 800);
        
        const prompt = \`
            ROLE: Expert Business Strategy Consultant.
            IDEA: "\${idea}"
            CONTEXT: \${signalsSummary}
            
            TASK: Generate 10-12 highly specific, profound discovery questions to ask the founder.
            Also generate a working project title and 1-paragraph project description.
            
            JSON SCHEMA:
            {
               "project_title": "Cool startup name",
               "project_description": "A 1-paragraph description",
               "questions": [
                 { "id": 1, "text": "A deep question...", "type": "text" }
               ]
            }
        \`;
        
        const completion = await withRetry(() => getGroqClient().chat.completions.create({
            messages: [{ role: "system", content: "Output JSON." }, { role: "user", content: prompt }],
            model: MODEL,
            response_format: { type: "json_object" }
        }));
        
        const parsed = JSON.parse(completion.choices[0].message.content);
        console.log("Research AI Answered Successfully.");
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

`;

    fs.writeFileSync('api/index.js', before + REPAIRED_BLOCK + after);
    console.log("RESTORED ENHANCE-IDEA AND RESEARCH API ROUTES IN API/INDEX.JS!");
}

repairAPI();
