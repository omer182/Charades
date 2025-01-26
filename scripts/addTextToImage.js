const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

async function addTextToImages(inputFolder) {
  try {
    const inputPath = path.resolve(inputFolder);
    const outputPath = path.resolve('../pictures/result');
    
    // Ensure the output folder exists
    await fs.ensureDir(outputPath);

    const files = await fs.readdir(inputPath);

    for (const file of files) {
      const filePath = path.join(inputPath, file);
      const outputFilePath = path.join(outputPath, file);

      // Check if the file is an image
      if (!file.match(/\.(jpg|jpeg|png|webp|bmp|tiff)$/i)) {
        console.log(`Skipping non-image file: ${file}`);
        continue;
      }

      const imageName = path.basename(file, path.extname(file));
      const metadata = await sharp(filePath).metadata();

      // Enlarge dimensions by 50%
      const newWidth = Math.round(metadata.width * 1.5);
      const newHeight = Math.round(metadata.height * 1.5);

    // Calculate the height of the rectangle (20% of the image height)
    const rectHeight = Math.round(newHeight * 0.2);

    // Define the text SVG
    const svgText = `
      <svg width="${newWidth}" height="${newHeight}">
        <rect x="0" y="${newHeight - rectHeight}" width="${newWidth}" height="${rectHeight}" fill="rgba(0, 0, 0, 0.5)"/>
        <text x="${newWidth / 2}" y="${newHeight - rectHeight / 2 + 10}" 
              font-size="${Math.round(rectHeight * 0.8)}" fill="white" text-anchor="middle" 
              font-family="Arial, sans-serif">${imageName}</text>
      </svg>`;

      const svgBuffer = Buffer.from(svgText);

      // Enlarge the image and composite the text
      await sharp(filePath)
        .resize(newWidth, newHeight) // Enlarge image by 50%
        .composite([{ input: svgBuffer, top: 0, left: 0 }]) // Add the text overlay
        .toFile(outputFilePath);

      console.log(`Processed: ${file}`);
    }

    console.log(`All images processed. Output folder: ${outputPath}`);
  } catch (err) {
    console.error("Error processing images:", err);
  }
}

// Replace this with your folder path
const folderPath = "../pictures/raw";
addTextToImages(folderPath);