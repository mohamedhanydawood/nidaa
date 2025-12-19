"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { toast } from "sonner";

type UpdateInfo = {
  version: string;
  available: boolean;
  downloaded: boolean;
  downloading: boolean;
  downloadProgress: number;
};

const UpdateContext = createContext<UpdateInfo | null>(null);

export function useUpdateInfo() {
  return useContext(UpdateContext);
}

export default function UpdateNotifier({ children }: { children?: React.ReactNode }) {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    version: "",
    available: false,
    downloaded: false,
    downloading: false,
    downloadProgress: 0,
  });

  useEffect(() => {
    if (!window.electron) return;

    // Update available
    window.electron.onUpdateAvailable((info) => {
      console.log("Update available:", info);
      setUpdateInfo({
        version: info.version,
        available: true,
        downloaded: false,
        downloading: false,
        downloadProgress: 0,
      });
    });

    // Update not available
    window.electron.onUpdateNotAvailable(() => {
      console.log("No updates available");
    });

    // Download progress
    window.electron.onUpdateDownloadProgress((progress) => {
      console.log("Download progress:", progress.percent);
      const percent = Math.round(progress.percent);
      setDownloadProgress(percent);
      setUpdateInfo(prev => ({
        ...prev,
        downloading: true,
        downloadProgress: percent,
      }));
    });

    // Update downloaded
    window.electron.onUpdateDownloaded((info) => {
      console.log("Update downloaded:", info);
      setIsDownloading(false);
      setDownloadProgress(0);
      setUpdateInfo({
        version: info.version,
        available: true,
        downloaded: true,
        downloading: false,
        downloadProgress: 100,
      });
      
      // Auto-install after 2 seconds
      setTimeout(() => {
        window.electron?.installUpdate();
      }, 2000);
    });

    // Update error
    window.electron.onUpdateError((error) => {
      console.error("Update error:", error);
      setIsDownloading(false);
      toast.error("فشل في التحقق من التحديثات");
    });
  }, []);

  // Show download progress toast
  useEffect(() => {
    if (isDownloading && downloadProgress > 0) {
      // Progress is shown in the banner now
    } else if (!isDownloading && downloadProgress > 0) {
      // No need to dismiss toast
    }
  }, [isDownloading, downloadProgress]);

  return (
    <UpdateContext.Provider value={updateInfo}>
      {children}
    </UpdateContext.Provider>
  );
}
