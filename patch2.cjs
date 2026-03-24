const fs = require('fs');

function fixFiles(filepath) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf-8');

    // 1. Fix the "(1-10)" missing quotes issue in the schemas for the chunked approach
    content = content.replace(/"score": \(1-10\)/g, '"score": 8');
    content = content.replace(/"competitiveness_score": \(1-10\)/g, '"competitiveness_score": 7');
    content = content.replace(/"viability_score": \(1-10\)/g, '"viability_score": 8');

    // 2. Fix /api/analyze to not dump massive JSON directly
    // Look for: MARKET RESEARCH CONTEXT: ${JSON.stringify(webSignals, null, 2)}
    // And trim it before injecting into prompt
    if (content.includes('MARKET RESEARCH CONTEXT: ${JSON.stringify(webSignals, null, 2)}')) {
        const analyzeStart = content.indexOf('app.post(\'/api/analyze\'');
        const tryStart = content.indexOf('try {', analyzeStart);
        
        // Add Summary variables right inside try
        const updatedTry = `try {
        const signalsSummary = JSON.stringify(webSignals || {}).substring(0, 1000);
        const answersSummary = typeof answers === 'string' ? answers.substring(0, 800) : JSON.stringify(answers).substring(0, 800);`;
        
        content = content.substring(0, tryStart) + updatedTry + content.substring(tryStart + 5);

        content = content.replace('MARKET RESEARCH CONTEXT: ${JSON.stringify(webSignals, null, 2)}', 'MARKET RESEARCH CONTEXT: ${signalsSummary}');
        content = content.replace('USER INTERVIEW SUMMARY: ${answers}', 'USER INTERVIEW SUMMARY: ${answersSummary}');
    }

    fs.writeFileSync(filepath, content);
    console.log('Fixed', filepath);
}

fixFiles('api/index.js');
fixFiles('server.js');
