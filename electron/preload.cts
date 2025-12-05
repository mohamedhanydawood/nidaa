/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (settings: unknown) =>
    ipcRenderer.invoke("settings:set", settings),

  // Prayer times
  getPrayerTimes: () => ipcRenderer.invoke("prayer:get"),
  markPrayerDone: (prayerName: string) =>
    ipcRenderer.invoke("prayer:mark", prayerName),

  // Events
  onPrayerTimesUpdated: (callback: (data: unknown) => void) => {
    ipcRenderer.on("prayer:updated", (_event: any, data: any) => callback(data));
  },
  onPrayerMarked: (callback: (data: unknown) => void) => {
    ipcRenderer.on("prayer:marked", (_event: any, data: any) => callback(data));
  },
});
