const fs = require('fs');

function updateApiAndServer() {
  const files = ['api/index.js', 'server.js'];
  for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');

    // 1. Update `/api/generate-plan-structure`
    const oldStructPrompt = `          JSON SCHEMA:
          {
            "short_title": "3-5 word concise mission name",
            "phases": [
                { "id": 1, "name": "Deep Research", "color": "#8B5CF6", "range": "1-15" },
                { "id": 2, "name": "Local Validation", "color": "#3B82F6", "range": "16-30" },
                { "id": 3, "name": "Minimum Build", "color": "#10B981", "range": "31-45" },
                { "id": 4, "name": "Launch & Feedback", "color": "#F59E0B", "range": "46-60" }
            ]
          }`;
    const newStructPrompt = `          Generate the HIGH-LEVEL STRUCTURE for a 60-Day Execution Roadmap.
          Divide 60 days into 4 logical PHASES (approx 15 days each).
          Crucially, you MUST also generate EXACTLY 60 short titles for every single day.
          
          JSON SCHEMA:
          {
            "short_title": "3-5 word concise mission name",
            "phases": [
                { "id": 1, "name": "Deep Research", "color": "#8B5CF6", "range": "1-15" },
                { "id": 2, "name": "Local Validation", "color": "#3B82F6", "range": "16-30" },
                { "id": 3, "name": "Minimum Build", "color": "#10B981", "range": "31-45" },
                { "id": 4, "name": "Launch & Feedback", "color": "#F59E0B", "range": "46-60" }
            ],
            "day_titles": [
                "Title for Day 1",
                "Title for Day 2"
                // ... exactly 60 titles total
            ]
          }`;
          
    // Using simple replacement for structure prompt
    if (content.includes('Divide 60 days into 4 logical PHASES (approx 15 days each).')) {
        content = content.replace(/TASK:[\s\S]*?JSON SCHEMA:[\s\S]*?\]\s*\}/, `TASK:
${newStructPrompt}`);
    }

    // 2. Add predefined_titles to `/api/generate-phase-tasks`
    content = content.replace(
      "const { idea, report, answers, phase, allPreviousTasks = [] } = req.body;",
      "const { idea, report, answers, phase, allPreviousTasks = [], predefined_titles = [] } = req.body;"
    );

    // Update the phase prompt to use predefined titles
    const oldPhasePrompt = "Generate EXACTLY ${dayCount} tactical daily tasks FOR EVERY SINGLE DAY from Day ${start} to Day ${end} INCLUSIVE.\\n      You MUST NOT skip any days. Output an array of exactly ${dayCount} items.";
    const newPhasePrompt = "Generate EXACTLY ${dayCount} tactical daily tasks FOR EVERY SINGLE DAY from Day ${start} to Day ${end} INCLUSIVE.\\n      You MUST NOT skip any days. Output an array of exactly ${dayCount} items.\\n      \\n      CRITICAL INSTRUCTION: You MUST use these exact predefined titles for these specific days:\\n      ${predefined_titles.map((t, i) => \`Day \${start + i}: \${t}\`).join('\\n      ')}";
    
    // Fallback if the previous string replacement script changed it mildly
    const promptRegex = /Generate EXACTLY \$\{dayCount\} tactical daily tasks[\s\S]*?RULES:/g;
    content = content.replace(promptRegex, `Generate EXACTLY \$\{dayCount\} tactical daily tasks FOR EVERY SINGLE DAY from Day \$\{start\} to Day \$\{end\} INCLUSIVE.
      You MUST NOT skip any days. Output an array of exactly \$\{dayCount\} items.
      
      CRITICAL INSTRUCTION: You MUST use these exact predefined titles for these specific days:
      \$\{predefined_titles.map((t, i) => \`Day \$\{start + i}: \$\{t\}\`).join('\\n')\}
      
      RULES:`);

    fs.writeFileSync(f, content);
  }
}

// 3. Update VenturePage.jsx 
function updateFrontend() {
  const f = 'src/pages/VenturePage.jsx';
  let content = fs.readFileSync(f, 'utf8');

  // Change BATCH_SIZE from 5 to 15 (Single phase)
  content = content.replace("const BATCH_SIZE = 5;", "const BATCH_SIZE = 15; // User requested single-shot phases");

  // Inskeleton plan, map the day titles 
  const skeletonRegex = /title: \`Task \$\{i \+ 1\}\.\.\.\`,/g;
  content = content.replace(skeletonRegex, "title: (structure.day_titles && structure.day_titles[i]) ? structure.day_titles[i] : `Task ${i + 1}...`,");

  // In generatePhaseTasks call, pass the predefined titles
  const genPhaseRegex = /currentFullPlan\.days\.filter\(d => !d\.isPlaceholder\)/g;
  content = content.replace(genPhaseRegex, `currentFullPlan.days.filter(d => !d.isPlaceholder),\n                        currentFullPlan.days.slice(batchStart - 1, batchEnd).map(d => d.title)`);
  
  fs.writeFileSync(f, content);
}

function updateAiJs() {
  const f = 'src/services/ai.js';
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace("export const generatePhaseTasks = async (idea, report, answers, phase, allPreviousTasks) => {", "export const generatePhaseTasks = async (idea, report, answers, phase, allPreviousTasks, predefined_titles) => {");
  content = content.replace("allPreviousTasks", "allPreviousTasks,\n            predefined_titles");
  fs.writeFileSync(f, content);
}

try {
  updateApiAndServer();
  updateFrontend();
  updateAiJs();
  console.log("Successfully patched frontend and backend logic to utilize single-shot predefined title roadmapping.");
} catch(e) {
  console.error("Patching failed:", e);
}
