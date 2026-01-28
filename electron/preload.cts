/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  // Translations
  getTranslations: (language: string, namespace: string) =>
    ipcRenderer.invoke("translations:get", language, namespace),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke("app:version"),
  
  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (settings: unknown) =>
    ipcRenderer.invoke("settings:set", settings),

  // Prayer times
  getPrayerTimes: () => ipcRenderer.invoke("prayer:get"),
  markPrayerDone: (prayerName: string) =>
    ipcRenderer.invoke("prayer:mark", prayerName),

  // Statistics
  getStatistics: () => ipcRenderer.invoke("statistics:get"),
  getWeekRecords: () => ipcRenderer.invoke("records:getWeek"),

  // Test notifications
  testPreAlertNotification: () => ipcRenderer.invoke("notification:testPreAlert"),
  testAdhanNotification: () => ipcRenderer.invoke("notification:testAdhan"),

  // Auto-update
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  downloadUpdate: () => ipcRenderer.invoke("update:download"),
  installUpdate: () => ipcRenderer.invoke("update:install"),
  onUpdateAvailable: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update:available", (_event: any, info: any) => callback(info));
  },
  onUpdateNotAvailable: (callback: () => void) => {
    ipcRenderer.on("update:not-available", () => callback());
  },
  onUpdateDownloadProgress: (callback: (progress: unknown) => void) => {
    ipcRenderer.on("update:download-progress", (_event: any, progress: any) => callback(progress));
  },
  onUpdateDownloaded: (callback: (info: unknown) => void) => {
    ipcRenderer.on("update:downloaded", (_event: any, info: any) => callback(info));
  },
  onUpdateError: (callback: (error: unknown) => void) => {
    ipcRenderer.on("update:error", (_event: any, error: any) => callback(error));
  },

  // Events
  onPrayerTimesUpdated: (callback: (data: unknown) => void) => {
    ipcRenderer.on("prayer:updated", (_event: any, data: any) => callback(data));
  },
  onPrayerMarked: (callback: (data: unknown) => void) => {
    ipcRenderer.on("prayer:marked", (_event: any, data: any) => callback(data));
  },
});
