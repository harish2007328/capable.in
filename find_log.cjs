const { execSync } = require('child_process');
const output = execSync('git log -p').toString('utf8');
const lines = output.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('/api/research')) {
        console.log("FOUND AT LINE " + i);
        console.log(lines.slice(i-5, i+15).join('\n'));
        break;
    }
}
