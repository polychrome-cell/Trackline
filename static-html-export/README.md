# Trackline Sim - Standalone HTML / CSS / JS Production Build

Welcome to **Trackline Sim**!

## Why did opening `main.html` directly show a blank screen?
In web development, the source code (`src/App.tsx`, `components.tsx`, etc.) is written in TypeScript and React JSX, and uses modern ES modules (`import`/`export`). 
Browsers like Microsoft Edge or Google Chrome:
1. **Cannot run raw `.tsx` or TypeScript files directly**.
2. **Block local ES module loading (`file:///C:/...`)** for security reasons (CORS policy).

---

## Two Easy Ways to Play "Trackline Sim" on Your Computer

### Option 1: Play Directly (Zero Setup, No Server Needed)
Double-click:
👉 **`Trackline-Play-Directly.html`**
This is a single self-contained file containing all styling, logic, maps, and simulations inlined. It runs directly when opened in Microsoft Edge, Chrome, Firefox, or Safari without needing Node.js or any local server!

### Option 2: Run a Quick Local Server
If you prefer standard modular files (`index.html`, `style.css`, `app.js`):
- **On Windows:** Double-click `start-windows-server.bat`.
- **Using Python (if installed):**
  ```bash
  python -m http.server 8080
  ```
  Then open `http://localhost:8080` in your browser.
- **Using Node / npx:**
  ```bash
  npx serve . -p 8080
  ```

---

## Deploying Online (Publishing to the Web)
To publish **Trackline Sim** so anyone with a link can play:
- **GitHub Pages:** Upload these files to a GitHub repository and turn on Pages in repository settings.
- **Netlify:** Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag and drop this folder. Your game will be live in 5 seconds with a free public URL!
- **Vercel:** Run `vercel deploy` or import your GitHub repository.
- **Cloudflare Pages:** Connect your GitHub repo or drag-and-drop into Cloudflare Pages.
