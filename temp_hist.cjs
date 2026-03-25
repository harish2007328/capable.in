const { execSync } = require('child_process');
const output = execSync('git log -p api/index.js').toString('utf8');
const fs = require('fs');
fs.writeFileSync('c:\\Users\\Admin\\OneDrive\\Desktop\\capable\\api_history.txt', output);
