import pkg from "electron-updater";
const { autoUpdater } = pkg;
import { app, BrowserWindow, dialog } from "electron";
import logPkg from "electron-log";
const log = logPkg;

// Configure logging
autoUpdater.logger = log;
(autoUpdater.logger as typeof log).transports.file.level = "info";

// Disable auto-download - we'll ask user first
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let updateCheckInterval: NodeJS.Timeout | null = null;

export function initAutoUpdater(mainWindow: BrowserWindow) {
  // Skip in development
  if (!app.isPackaged) {
    console.log("⚠️ Auto-updater disabled in development mode");
    console.log("💡 To test updates, build the app with 'npm run dist:win' and install it");
    return;
  }

  console.log("🔄 Auto-updater initialized");
  console.log("📦 Current version:", app.getVersion());
  console.log("🌐 Update feed:", autoUpdater.getFeedURL());

  // Check for updates on startup (after 10 seconds)
  setTimeout(() => {
    console.log("🔍 Checking for updates (startup check)...");
    checkForUpdates(mainWindow, false); // Silent check
  }, 10000);

  // Check every 4 hours
  updateCheckInterval = setInterval(() => {
    console.log("🔍 Checking for updates (periodic check)...");
    checkForUpdates(mainWindow, false); // Silent check
  }, 4 * 60 * 60 * 1000);

  // Event: Update available
  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info);
    console.log("✅ Update available:", info.version);
    mainWindow.webContents.send("update:available", {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  // Event: Update not available
  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info);
    console.log("ℹ️ No updates available - you're on the latest version");
    mainWindow.webContents.send("update:not-available");
  });

  // Event: Download progress
  autoUpdater.on("download-progress", (progressInfo) => {
    log.info("Download progress:", progressInfo);
    mainWindow.webContents.send("update:download-progress", {
      percent: progressInfo.percent,
      transferred: progressInfo.transferred,
      total: progressInfo.total,
    });
  });

  // Event: Update downloaded
  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info);
    mainWindow.webContents.send("update:downloaded", {
      version: info.version,
    });
  });

  // Event: Error
  autoUpdater.on("error", (error) => {
    log.error("Auto-updater error:", error);
    mainWindow.webContents.send("update:error", {
      message: error.message,
    });
  });
}

export function checkForUpdates(
  mainWindow: BrowserWindow,
  showNoUpdateDialog = false
) {
  if (!app.isPackaged) {
    if (showNoUpdateDialog) {
      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "التحديثات",
        message: "التحديثات التلقائية غير متاحة في وضع التطوير",
        buttons: ["حسناً"],
      });
    }
    return;
  }

  autoUpdater
    .checkForUpdates()
    .then((result) => {
      if (!result?.updateInfo) {
        if (showNoUpdateDialog) {
          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "لا توجد تحديثات",
            message: "أنت تستخدم أحدث إصدار من التطبيق",
            buttons: ["حسناً"],
          });
        }
      }
    })
    .catch((error) => {
      log.error("Error checking for updates:", error);
      if (showNoUpdateDialog) {
        dialog.showMessageBox(mainWindow, {
          type: "error",
          title: "خطأ",
          message: "فشل التحقق من التحديثات. يرجى المحاولة لاحقاً.",
          buttons: ["حسناً"],
        });
      }
    });
}

export function downloadUpdate() {
  if (!app.isPackaged) {
    return;
  }
  autoUpdater.downloadUpdate();
}

export function quitAndInstall() {
  if (!app.isPackaged) {
    return;
  }
  autoUpdater.quitAndInstall(false, true);
}

export function cleanupAutoUpdater() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}
