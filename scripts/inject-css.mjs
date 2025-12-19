import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../docs/dist');

const cssLink = '<link type="text/css" rel="stylesheet" href="custom-styles.css">';

function injectCss(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip directories for now as docdash usually keeps html flat
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('custom-styles.css')) {
        // Inject before the closing head tag
        content = content.replace('</head>', `    ${cssLink}\n</head>`);
        fs.writeFileSync(filePath, content);
        console.log(`✓ Injected custom-styles.css into ${file}`);
      }
    }
  });
}

console.log('Injecting custom styles into documentation...');
injectCss(distDir);
