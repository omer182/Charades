const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const sharp = require("sharp");

const DIFFICULTY_PATH = path.resolve(__dirname, "../src/data/difficulty.json");
const LEVELS = ["easy", "medium", "hard"];

async function loadDifficulty() {
  if (await fs.pathExists(DIFFICULTY_PATH)) {
    const data = await fs.readJson(DIFFICULTY_PATH);
    const cleaned = { ...data };
    LEVELS.forEach((level) => {
      if (!Array.isArray(cleaned[level])) cleaned[level] = [];
    });
    return cleaned;
  }
  return { easy: [], medium: [], hard: [] };
}

function buildLookup(data) {
  const lookup = {};
  LEVELS.forEach((level) => {
    (data[level] || []).forEach((name) => { lookup[name] = level; });
  });
  return lookup;
}

async function saveDifficulty(data) {
  await fs.writeJson(DIFFICULTY_PATH, data, { spaces: 2 });
}

function makeAsk() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, (ans) => res(ans)));
  const close = () => rl.close();
  return { ask, close };
}

async function promptDifficulty(ask, name) {
  while (true) {
    const ans = (await ask(`Difficulty for "${name}"? [e]asy / [m]edium / [h]ard: `)).trim().toLowerCase();
    if (ans === "e" || ans === "easy") return "easy";
    if (ans === "m" || ans === "medium") return "medium";
    if (ans === "h" || ans === "hard") return "hard";
    console.log("  Please enter e, m, or h.");
  }
}

async function addTextToImages(inputFolder) {
  const { ask, close } = makeAsk();
  try {
    const inputPath = path.resolve(inputFolder);
    const outputPath = path.resolve(__dirname, "../pictures/result");

    await fs.ensureDir(outputPath);

    const difficulty = await loadDifficulty();
    const lookup = buildLookup(difficulty);

    const files = await fs.readdir(inputPath);

    for (const file of files) {
      const filePath = path.join(inputPath, file);
      const outputFilePath = path.join(outputPath, file);

      if (!file.match(/\.(jpg|jpeg|png|webp|bmp|tiff)$/i)) {
        console.log(`Skipping non-image file: ${file}`);
        continue;
      }

      const imageName = path.basename(file, path.extname(file));
      const metadata = await sharp(filePath).metadata();

      const newWidth = Math.round(metadata.width * 1.5);
      const newHeight = Math.round(metadata.height * 1.5);
      const rectHeight = Math.round(newHeight * 0.2);

      const svgText = `
      <svg width="${newWidth}" height="${newHeight}">
        <rect x="0" y="${newHeight - rectHeight}" width="${newWidth}" height="${rectHeight}" fill="rgba(0, 0, 0, 0.5)"/>
        <text x="${newWidth / 2}" y="${newHeight - rectHeight / 2 + 10}"
              font-size="${Math.round(rectHeight * 0.8)}" fill="white" text-anchor="middle"
              font-family="Arial, sans-serif">${imageName}</text>
      </svg>`;

      const svgBuffer = Buffer.from(svgText);

      await sharp(filePath)
        .resize(newWidth, newHeight)
        .composite([{ input: svgBuffer, top: 0, left: 0 }])
        .toFile(outputFilePath);

      console.log(`Processed: ${file}`);

      if (!lookup[imageName]) {
        const level = await promptDifficulty(ask, imageName);
        difficulty[level].push(imageName);
        lookup[imageName] = level;
        await saveDifficulty(difficulty);
        console.log(`  -> recorded "${imageName}" as ${level}`);
      } else {
        console.log(`  -> already classified as ${lookup[imageName]}`);
      }
    }

    console.log(`All images processed. Output folder: ${outputPath}`);
    console.log(`Difficulty map updated at: ${DIFFICULTY_PATH}`);
  } catch (err) {
    console.error("Error processing images:", err);
  } finally {
    close();
  }
}

const folderPath = path.resolve(__dirname, "../pictures/new");
addTextToImages(folderPath);
