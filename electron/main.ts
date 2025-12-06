import { app, protocol } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { createWindow, createTray, setQuitting } from "./window.js";
import { registerIpcHandlers } from "./ipcHandlers.js";

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
  
  const startUrl = isDev
    ? "http://localhost:3000"
    : "app://index.html";

  const mainWindow = createWindow(preloadPath, startUrl);
  createTray();
  
  // Register all IPC handlers
  await registerIpcHandlers(mainWindow);
});

app.on("window-all-closed", () => {
  // Do nothing - allow app to run in background via tray
});

app.on('before-quit', () => {
  setQuitting(true);
});
