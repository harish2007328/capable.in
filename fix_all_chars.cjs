const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('c:/Users/Admin/OneDrive/Desktop/capable/src/pages/**/*.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('\ufffd')) {
        content = content.replace(/\ufffd/g, ' — ');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed characters in ${file}`);
    }
});
