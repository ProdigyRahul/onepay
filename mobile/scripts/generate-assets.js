const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const SIZES = {
  icon: 1024,
  splash: 2048,
  adaptive: 1024,
  favicon: 196,
};

function createPlaceholderImage(size, text, bgColor = '#007AFF', textColor = '#FFFFFF') {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${size / 8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OnePay', size / 2, size / 2);

  return canvas.toBuffer();
}

// Ensure directories exist
const assetsDir = './assets';
const imagesDir = path.join(assetsDir, 'images');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Generate assets
Object.entries(SIZES).forEach(([name, size]) => {
  const buffer = createPlaceholderImage(size, name);
  const filePath = path.join(imagesDir, `${name}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${name}.png in images directory`);
}); 