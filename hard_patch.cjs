const fs = require('fs');
const content = fs.readFileSync('c:/Users/Admin/OneDrive/Desktop/capable/api/index.js', 'utf8');

const anchor = "app.post('/api/generate-plan-structure', async (req, res) => {";
const startIdx = content.indexOf(anchor);

if (startIdx === -1) {
    console.log("Anchor not found");
} else {
    const endAnchor = "});";
    const chunkStart = content.indexOf("const prompt =", startIdx);
    const chunkEnd = content.indexOf("model: \"llama-3.1-8b-instant\"", chunkStart);
    
    if (chunkStart !== -1 && chunkEnd !== -1) {
        const originalText = content.substring(chunkStart, chunkEnd);
        const replacement = `const prompt = \`
          ROLE: Elite Startup Operations Expert.
          IDEA: "\${idea}"
          REPORT TOPICS: \${reportSummary}
          
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
        \`;

        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: "system", content: "Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            `;
        
        const finalContent = content.substring(0, chunkStart) + replacement + content.substring(chunkEnd);
        fs.writeFileSync('c:/Users/Admin/OneDrive/Desktop/capable/api/index.js', finalContent);
        console.log("HARD PATCH SUCCESSFUL");
    } else {
        console.log("Chunk identification failed");
    }
}
