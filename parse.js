const fs = require('fs');
const path = require('path');
const https = require('https');

// List of books to fetch
const books = [
  {
    id: 'pride_and_prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    url: 'https://www.gutenberg.org/files/1342/1342-0.txt'
  },
  {
    id: 'sherlock_holmes',
    title: 'Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    url: 'https://www.gutenberg.org/files/1661/1661-0.txt'
  },
  {
    id: 'alice_wonderland',
    title: 'Alice’s Adventures in Wonderland',
    author: 'Lewis Carroll',
    url: 'https://www.gutenberg.org/files/11/11-0.txt'
  },
  {
    id: 'moby_dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    url: 'https://www.gutenberg.org/files/2701/2701-0.txt'
  },
  {
    id: 'tom_sawyer',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    url: 'https://www.gutenberg.org/files/74/74-0.txt'
  }
];

const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');

// Ensure directories exist
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Helper to fetch book text
const fetchBook = (book) =>
  new Promise((resolve, reject) => {
    const filePath = path.join(inputDir, `${book.id}.txt`);
    const file = fs.createWriteStream(filePath);

    https.get(book.url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(filePath));
      });
    }).on('error', (err) => reject(err));
  });

// Parse plain text into JSON
const parseBook = (filePath, book) => {
  const rawText = fs.readFileSync(filePath, 'utf-8');

  // Split into chapters based on "Chapter" keyword
  const chapterRegex = /(chapter\s+\w+|CHAPTER\s+\w+)\b/g;
  const chapters = [];
  let match;
  let lastIndex = 0;

  const allMatches = [...rawText.matchAll(chapterRegex)];

  if (allMatches.length === 0) {
    chapters.push({
      title: 'Content',
      paragraphs: rawText.split('\n').filter(line => line.trim() !== '')
    });
  } else {
    allMatches.forEach((m, i) => {
      const start = m.index;
      if (i > 0) {
        const prev = allMatches[i - 1];
        const content = rawText.slice(prev.index, start).trim();
        chapters.push({
          title: rawText.slice(prev.index, prev.index + prev[0].length).trim(),
          paragraphs: content.split('\n').filter(line => line.trim() !== '')
        });
      }
      lastIndex = start;
    });
    // last chapter
    const lastChapterContent = rawText.slice(lastIndex).trim();
    chapters.push({
      title: rawText.slice(lastIndex, lastIndex + allMatches[allMatches.length-1][0].length).trim(),
      paragraphs: lastChapterContent.split('\n').filter(line => line.trim() !== '')
    });
  }

  const jsonBook = {
    id: book.id,
    title: book.title,
    author: book.author,
    source: 'Project Gutenberg',
    license: 'Public Domain',
    chapters
  };

  const outputPath = path.join(outputDir, `${book.id}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(jsonBook, null, 2), 'utf-8');
  console.log(`✅ Converted ${book.title} → JSON`);
};

// Main
(async () => {
  for (let book of books) {
    try {
      const filePath = await fetchBook(book);
      parseBook(filePath, book);
    } catch (err) {
      console.error(`❌ Failed for ${book.title}:`, err);
    }
  }
})();
