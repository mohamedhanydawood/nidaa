import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ping: () => "pong",
  settings: {
    get: async () => ipcRenderer.invoke("settings:get"),
    set: async (cfg: unknown) => ipcRenderer.invoke("settings:set", cfg),
  },
});
