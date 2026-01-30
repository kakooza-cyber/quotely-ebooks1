const fs = require('fs-extra');
const path = require('path');

const INDEX_PATH = './index.json';
const COVERS_DIR = './covers';

const WIDTH = 600;
const HEIGHT = 900;

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  }[c]));
}

function createSVG(title) {
  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"
     xmlns="http://www.w3.org/2000/svg">

  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfcf8"/>
      <stop offset="100%" stop-color="#e6e2d8"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}"
        rx="24" ry="24"
        fill="none" stroke="#c2b280" stroke-width="6"/>

  <text x="50%" y="280"
        font-size="48"
        font-family="serif"
        fill="#2b2b2b"
        text-anchor="middle"
        dominant-baseline="middle"
        font-weight="700">
    ${escapeXml(title)}
  </text>

  <text x="50%" y="${HEIGHT - 240}"
        font-size="24"
        font-family="serif"
        fill="#666"
        text-anchor="middle">
    Public Domain
  </text>

  <text x="50%" y="${HEIGHT - 170}"
        font-size="20"
        font-family="sans-serif"
        fill="#222"
        text-anchor="middle"
        font-weight="bold"
        letter-spacing="2">
    QUOTELY
  </text>

</svg>`;
}

async function run() {
  await fs.ensureDir(COVERS_DIR);
  const index = await fs.readJSON(INDEX_PATH);

  for (const book of index.books) {
    const fileName = `${book.id}_cover.svg`;
    const filePath = path.join(COVERS_DIR, fileName);

    const svg = createSVG(book.title);
    await fs.writeFile(filePath, svg, 'utf8');

    book.image =
      `https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/covers/${fileName}`;

    console.log(`✅ Generated ${fileName}`);
  }

  await fs.writeJSON(INDEX_PATH, index, { spaces: 2 });

  console.log('\n🎉 All SVG covers generated successfully!');
}

run().catch(console.error);
