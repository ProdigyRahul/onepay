const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const SIZES = {
  icon: 1024,
  splash: 2048,
  adaptive: 1024,
  favicon: 196,
  logo: 512,
};

const COLORS = {
  primary: '#007AFF',
  white: '#FFFFFF',
};

function createLogoImage(size, bgColor = COLORS.primary, textColor = COLORS.white) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = textColor;
  const fontSize = size / 6;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw "One" slightly above center
  ctx.fillText('One', size / 2, size / 2 - fontSize / 2);

  // Draw "Pay" slightly below center
  ctx.fillText('Pay', size / 2, size / 2 + fontSize / 2);

  // Optional: Add a simple icon or symbol
  const circleRadius = size / 8;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, circleRadius, 0, Math.PI * 2);
  ctx.strokeStyle = textColor;
  ctx.lineWidth = size / 64;
  ctx.stroke();

  return canvas.toBuffer();
}

// Ensure directories exist
const assetsDir = path.join(__dirname, '../src/assets');
const imagesDir = path.join(assetsDir, 'images');
const iconsDir = path.join(assetsDir, 'icons');

[assetsDir, imagesDir, iconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate assets
Object.entries(SIZES).forEach(([name, size]) => {
  const buffer = createLogoImage(size);

  // Save to both images and icons directories
  const imagePath = path.join(imagesDir, `${name}.png`);
  const iconPath = path.join(iconsDir, `${name}.png`);

  fs.writeFileSync(imagePath, buffer);
  fs.writeFileSync(iconPath, buffer);

  console.log(`Generated ${name}.png (${size}x${size}px)`);
});
