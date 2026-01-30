// generate-index.js
const fs = require('fs');
const path = require('path');

// Paths
const outputDir = path.join(__dirname, 'output');
const coverBase = 'https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/covers/';
const jsonBase = 'https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/output/';

// Read all JSON files in output/
const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

// Generate index
const index = files.map(file => {
  const id = path.basename(file, '.json');
  const title = id
    .split(/[-_]/)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  return {
    id,
    title,
    image: `${coverBase}${id}_cover.png`,
    dataUrl: `${jsonBase}${file}`,
    locked: false // mark true for premium books if needed
  };
});

// Save index.json
fs.writeFileSync(path.join(__dirname, 'index.json'), JSON.stringify(index, null, 2));
console.log('✅ index.json created with', index.length, 'books');
