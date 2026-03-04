// tools/generate-gallery.js
// Script para generar automáticamente un index.json con todas las imágenes
// que haya en el directorio ./assets/gallery

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(ROOT, 'assets', 'gallery');
const OUTPUT_FILE = path.join(GALLERY_DIR, 'index.json');

function isImageFile(file) {
  return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(file);
}

function main() {
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error('La carpeta assets/gallery no existe:', GALLERY_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(GALLERY_DIR)
    .filter(isImageFile)
    .sort();

  const entries = files.map((file) => ({
    src: `./assets/gallery/${file}`,
    alt: path.basename(file, path.extname(file))
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`Generado ${OUTPUT_FILE} con ${entries.length} imágenes.`);
}

main();
