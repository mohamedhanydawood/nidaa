import { app } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { createWindow, createTray, setQuitting } from "./window.js";
import { registerIpcHandlers } from "./ipcHandlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.whenReady().then(async () => {
  const isDev = !app.isPackaged;
  const preloadPath = isDev
    ? path.join(__dirname, "preload.cjs")
    : path.join(process.resourcesPath, "build-electron", "preload.cjs");
  
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(process.resourcesPath, "out", "index.html")}`;

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
