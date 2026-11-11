import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// 1. Run production build
console.log('Building app with Vite...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');

const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Could not find bundled JS or CSS files in dist/assets!');
  process.exit(1);
}

const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

// Single file bundle with inlined CSS and inlined Module Script
const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Trackline Sim - Asian & Global Railway Operations</title>
    <meta name="description" content="Manage high-speed and commuter rail corridors, fleet procurement across international manufacturers, custom liveries, dynamic weather and regional economics in Trackline Sim." />
    <meta property="og:title" content="Trackline Sim" />
    <meta property="og:description" content="High-fidelity railway management and network expansion simulator." />
    <style>
${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>`;

// Write to Trackline-Play-Directly.html and main.html
fs.writeFileSync('Trackline-Play-Directly.html', standaloneHtml, 'utf8');
fs.writeFileSync('main.html', standaloneHtml, 'utf8');

// Also update static-html-export
if (!fs.existsSync('static-html-export')) {
  fs.mkdirSync('static-html-export', { recursive: true });
}
fs.writeFileSync(path.join('static-html-export', 'index.html'), standaloneHtml, 'utf8');
fs.writeFileSync(path.join('static-html-export', 'main.html'), standaloneHtml, 'utf8');

// Create standalone tar.gz for easy extraction
execSync('tar -czf trackline-sim-standalone.tar.gz dist/ Trackline-Play-Directly.html main.html', { stdio: 'inherit' });

console.log('Successfully generated Trackline-Play-Directly.html and main.html!');
