const fs = require('fs');
const path = 'c:\\Users\\Admin\\OneDrive\\Desktop\\capable\\src\\pages\\HomePage.jsx';
let content = fs.readFileSync(path, 'utf8');
// Replace the replacement character with an em-dash or dash
content = content.replace(/\ufffd/g, ' — ');
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed characters in HomePage.jsx');
