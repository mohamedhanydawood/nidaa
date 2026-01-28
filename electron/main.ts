import { app, protocol } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { createWindow, createTray, setQuitting } from "./window.js";
import { registerIpcHandlers } from "./ipcHandlers.js";
import { getSettings } from "./store.js";
import { initAutoUpdater } from "./autoUpdater.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get MIME type based on file extension
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Set app name for notifications
app.setName("نداء");

// For Windows notifications to show app name correctly
if (process.platform === 'win32') {
  app.setAppUserModelId("com.nidaa.app");
}

app.whenReady().then(async () => {
  const isDev = !app.isPackaged;
  
  // Register custom app protocol for loading local files in production
  if (!isDev) {
    protocol.handle('app', async (request) => {
      try {
        const appPath = app.getAppPath();
        const outPath = path.join(appPath, 'out');
        
        // Parse the URL to get the pathname
        const url = new URL(request.url);
        let filePath = decodeURIComponent(url.pathname);
        
        // Remove leading slash from pathname
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }
        
        // Handle root path
        if (filePath === '' || filePath === '/') {
          filePath = 'index.html';
        }
        
        // All paths are relative to the out directory
        filePath = path.join(outPath, filePath);
        
        const data = await readFile(filePath);
        const mimeType = getMimeType(filePath);
        
        return new Response(data, {
          headers: { 'Content-Type': mimeType }
        });
      } catch {
        return new Response('File not found', { status: 404 });
      }
    });
  }
  
  const preloadPath = isDev
    ? path.join(__dirname, "preload.cjs")
    : path.join(__dirname, "preload.cjs");
  
  // Check if this is first time user
  const settings = getSettings();
  const isFirstTime = !settings.guideCompleted;
  
  // Check if app was launched with --hidden flag (from Windows startup)
  const shouldStartHidden = process.argv.includes('--hidden');
  
  // Log auto-start status on app launch (for debugging)
  console.log("=== App Launch Info ===");
  console.log("Auto-start enabled:", settings.autoStart);
  console.log("Login item settings:", app.getLoginItemSettings());
  console.log("First time user:", isFirstTime);
  console.log("Should start hidden:", shouldStartHidden);
  console.log("======================");
  
  const startUrl = isDev
    ? (isFirstTime ? "http://localhost:3000/guide" : "http://localhost:3000")
    : (isFirstTime ? "app://guide.html" : "app://index.html");

  const mainWindow = createWindow(preloadPath, startUrl, shouldStartHidden);
  createTray();
  
  // Initialize auto-updater
  initAutoUpdater(mainWindow);
  
  // Register all IPC handlers
  await registerIpcHandlers(mainWindow);
  
  // Initialize prayer scheduler on startup (CRITICAL for notifications)
  const { startScheduler } = await import("./ipcHandlers.js");
  if (settings && settings.city && settings.country) {
    await startScheduler(settings);
    console.log("[Electron] Prayer scheduler initialized on app startup");
  }
});

app.on("window-all-closed", () => {
  // Do nothing - allow app to run in background via tray
});

app.on('before-quit', () => {
  setQuitting(true);
});
