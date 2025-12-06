import Store from "electron-store";
import { AppSettings, defaultSettings } from "./types.js";

export const store = new Store<{ settings: AppSettings; records: unknown }>({
  name: 'config-v2'
});

export function getSettings(): AppSettings {
  return store.get("settings", defaultSettings) as AppSettings;
}

export function saveSettings(settings: AppSettings): void {
  console.log("[Store] Saving settings:", settings);
  store.set("settings", settings);
  console.log("[Store] Settings saved successfully. Verifying:", store.get("settings"));
}

export function getRecords(): Record<string, Record<string, boolean>> {
  return (store.get("records") as Record<string, Record<string, boolean>>) || {};
}

export function saveRecords(records: Record<string, Record<string, boolean>>): void {
  store.set("records", records);
}
