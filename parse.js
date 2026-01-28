const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "input", "book.txt");
const OUTPUT_FILE = path.join(__dirname, "output", "book.json");

let text = fs.readFileSync(INPUT_FILE, "utf8");

// Remove Gutenberg header & footer
const start = text.indexOf("*** START");
const end = text.indexOf("*** END");

if (start !== -1 && end !== -1) {
  text = text.slice(start, end);
}

// Normalize spacing
text = text.replace(/\r\n/g, "\n");
text = text.replace(/\n{3,}/g, "\n\n");

// Split chapters
const chapterRegex = /(CHAPTER\s+[IVXLCDM]+|Chapter\s+\d+)/g;
const parts = text.split(chapterRegex).filter(Boolean);

const chapters = [];

for (let i = 0; i < parts.length; i += 2) {
  const title = parts[i].trim();
  const body = parts[i + 1] || "";

  const paragraphs = body
    .split("\n\n")
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(p => p.length > 40);

  if (paragraphs.length) {
    chapters.push({ title, paragraphs });
  }
}

const json = {
  id: "sample_book",
  title: "Sample Book",
  author: "Public Domain Author",
  source: "Project Gutenberg",
  license: "Public Domain",
  chapters,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json, null, 2), "utf8");

console.log("✅ Book converted successfully!");
