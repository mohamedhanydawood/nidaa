import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

export function createTray() {
  const isDev = !app.isPackaged;
  // In dev: read from project assets folder
  // In production: extraResources are in process.resourcesPath/assets
  const assetsPath = isDev
    ? path.join(process.cwd(), 'assets')
    : path.join(process.resourcesPath, 'assets');
  
  const iconPath = process.platform === 'darwin'
    ? path.join(assetsPath, 'icon.icns')
    : process.platform === 'linux'
    ? path.join(assetsPath, 'icon.png')
    : path.join(assetsPath, 'icon.ico');
  
  const icon = nativeImage.createFromPath(iconPath);
  
  // Debug: log icon path and status
  console.log('[Tray] Icon path:', iconPath);
  console.log('[Tray] Icon isEmpty:', icon.isEmpty());
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'إظهار النافذة',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'إخفاء النافذة',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'إنهاء التطبيق',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('نداء - مواقيت الصلاة');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

export function createWindow(preloadPath: string, startUrl: string, shouldStartHidden = false): BrowserWindow {
  const isDev = !app.isPackaged;
  // In dev: read from project assets folder
  // In production: extraResources are in process.resourcesPath/assets
  const assetsPath = isDev
    ? path.join(process.cwd(), 'assets')
    : path.join(process.resourcesPath, 'assets');
  
  const iconPath = process.platform === 'darwin'
    ? path.join(assetsPath, 'icon.icns')
    : process.platform === 'linux'
    ? path.join(assetsPath, 'icon.png')
    : path.join(assetsPath, 'icon.ico');
  
  // Debug: log icon path and status
  console.log('[Window] Icon path:', iconPath);
  const testIcon = nativeImage.createFromPath(iconPath);
  console.log('[Window] Icon isEmpty:', testIcon.isEmpty());
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: iconPath,
    title: 'نداء',
    show: !shouldStartHidden, // Don't show window if starting hidden
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(startUrl);
  
  // If should start hidden, ensure window is hidden after load
  if (shouldStartHidden) {
    mainWindow.once('ready-to-show', () => {
      // Don't show - keep hidden in background
      console.log('[Window] Started hidden in background (system tray mode)');
    });
  }
  
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
  
  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function setQuitting(value: boolean) {
  isQuitting = value;
}

export function flashTaskbar() {
  if (mainWindow && process.platform === 'win32') {
    mainWindow.flashFrame(true);
    // Stop flashing after 5 seconds
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.flashFrame(false);
      }
    }, 5000);
  }
}
