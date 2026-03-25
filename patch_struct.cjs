const fs = require('fs');
const content = fs.readFileSync('c:/Users/Admin/OneDrive/Desktop/capable/api/index.js', 'utf8');

const oldStructure = `          TASK:
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
          }`;

const newStructure = `          TASK:
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
            "day_titles": ["Title Day 1", "Title Day 2", "Title Day 3", ... "Title Day 60"]
          }`;

if (content.includes(oldStructure)) {
    const updated = content.replace(oldStructure, newStructure);
    fs.writeFileSync('c:/Users/Admin/OneDrive/Desktop/capable/api/index.js', updated);
    console.log("SUCCESSFULLY UPDATED API STRUCTURE");
} else {
    console.log("MATCH FAILED. Content sample:");
    console.log(content.substring(content.indexOf('TASK:'), content.indexOf('TASK:') + 500));
}
