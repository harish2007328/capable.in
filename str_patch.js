const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(
  'Generate EXACTLY ${dayCount} tactical daily tasks.\n      \n      RULES:\n      - No day references inside descriptions (no "Day 1" etc.)\n      - Suggest specific tools (Canva, Trello, Vercel, etc.)\n      - 3-5 actionable sub-steps per day\n      - Location-aware registrations if context available\n      - IMPACT: exactly "Low", "Medium", or "High"\n      - EST_TIME: realistic (e.g., "4-6 hours")',
  'Generate EXACTLY ${dayCount} tactical daily tasks FOR EVERY SINGLE DAY from Day ${start} to Day ${end} INCLUSIVE.\n      You MUST NOT skip any days. Output an array of exactly ${dayCount} items.\n      \n      RULES:\n      - Start with day ${start} and go sequentially.\n      - No day references inside descriptions (no "Day 1" etc.)\n      - Suggest specific tools (Canva, Trello, Vercel, etc.)\n      - 3-5 actionable sub-steps per day\n      - Location-aware registrations if context available\n      - IMPACT: exactly "Low", "Medium", or "High"\n      - EST_TIME: realistic (e.g., "4-6 hours")'
);

fs.writeFileSync('server.js', c);
