
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// ---------------------- CONFIG ----------------------
const coversDir = path.join(__dirname, 'covers');
const indexPath = path.join(__dirname, 'index.json');
const WIDTH = 600;
const HEIGHT = 900;
const PLACEHOLDER_TEXT = "Quotely\nE-Books";
const FORCE_OVERWRITE = false; // set true if you want to regenerate all PNGs

// Load current index.json
const indexData = fs.readJsonSync(indexPath);
const books = indexData.books;

// Function to sanitize text for SVG
const sanitize = (str) => str.replace(/&/g, '&amp;');

// ---------------------- COVER GENERATION ----------------------
async function generateCovers() {
  for (const book of books) {
    try {
      const svgPath = path.join(coversDir, `${book.id}_cover.svg`);
      const pngPath = path.join(coversDir, `${book.id}_cover.png`);

      // Skip if PNG exists
      if (!FORCE_OVERWRITE && fs.existsSync(pngPath)) {
        console.log(`✅ PNG already exists for "${book.title}", skipping.`);
        book.image = `https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/covers/${book.id}_cover.png`;
        continue;
      }

      // Check SVG exists
      if (!fs.existsSync(svgPath)) {
        console.log(`⚠️ SVG missing for "${book.title}", using placeholder.`);
        book.image = `https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/covers/placeholder_cover.png`;
        continue;
      }

      // Convert SVG -> PNG
      const buffer = await sharp(svgPath)
        .resize(WIDTH, HEIGHT)
        .png()
        .toBuffer();

      // Adjust font size dynamically based on title length
      let fontSize = 48;
      if (book.title.length > 20) fontSize = 36;
      if (book.title.length > 35) fontSize = 28;

      // Create SVG overlay with text
      const textSvg = `
        <svg width="${WIDTH}" height="${HEIGHT}">
          <rect x="0" y="${HEIGHT - 150}" width="${WIDTH}" height="150" fill="rgba(0,0,0,0.45)"/>
          <text x="50%" y="${HEIGHT - 75}" font-size="${fontSize}" fill="#ffffff"
            text-anchor="middle" font-family="Arial" font-weight="bold">
            ${sanitize(book.title)}
          </text>
        </svg>
      `;

      // Merge text overlay
      await sharp(buffer)
        .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
        .toFile(pngPath);

      // Update index.json
      book.image = `https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/covers/${book.id}_cover.png`;

      console.log(`✅ Generated PNG for "${book.title}"`);
    } catch (err) {
      console.error(`❌ Error processing "${book.title}":`, err);
      // fallback to placeholder if error
      book.image = `https://raw.githubusercontent.com/kakooza-cyber/quotely-ebooks1/main/covers/placeholder_cover.png`;
    }
  }

  // Save updated index.json
  fs.writeJsonSync(indexPath, { books }, { spaces: 2 });
  console.log('✅ All covers processed and index.json updated!');
}

// Run the script
generateCovers();