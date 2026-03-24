const fs = require('fs');

let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(/await withRetry\(\(\) => getGroqClient\(req\)\.chat\.completions\.create\(\{\r?\n\s*messages: \[{ role: "system", content: "Output valid JSON only\." \}, \{ role: "user", content: prompt \}\],\r?\n\s*model: "llama-3\.1-8b-instant",\r?\n\s*response_format: \{ type: "json_object" \},\r?\n\s*\}\)\);/, `await getGroqClient(req).chat.completions.create({\r\n            messages: [{ role: "system", content: "Output valid JSON only." }, { role: "user", content: prompt }],\r\n            model: "llama-3.1-8b-instant",\r\n            response_format: { type: "json_object" },\r\n        });`);

fs.writeFileSync('server.js', c);
console.log('Fixed server.js');
