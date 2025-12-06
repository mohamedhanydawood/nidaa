import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

export function createTray() {
  const iconPath = process.platform === 'darwin'
    ? path.join(process.cwd(), 'public/icon.icns')
    : process.platform === 'linux'
    ? path.join(process.cwd(), 'public/icon.png')
    : path.join(process.cwd(), 'public/icon.ico');
  const icon = nativeImage.createFromPath(iconPath);
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

export function createWindow(preloadPath: string, startUrl: string): BrowserWindow {
  const iconPath = process.platform === 'darwin'
    ? path.join(process.cwd(), 'public/icon.icns')
    : process.platform === 'linux'
    ? path.join(process.cwd(), 'public/icon.png')
    : path.join(process.cwd(), 'public/icon.ico');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(startUrl);
  
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
