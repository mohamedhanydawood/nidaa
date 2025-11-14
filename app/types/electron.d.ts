export {};

declare global {
  interface Window {
    electron?: {
      ping?: () => string;
      settings?: {
        get: () => Promise<{
          city: string;
          country: string;
          method: number;
          madhab: number;
          preAlertMinutes: number;
          autoPauseAtAdhan: boolean;
          autoResumeAfterMs: number | null;
          timeFormat?: "12" | "24";
        }>;
        set: (cfg: Partial<{
          city: string;
          country: string;
          method: number;
          madhab: number;
          preAlertMinutes: number;
          autoPauseAtAdhan: boolean;
          autoResumeAfterMs: number | null;
          timeFormat?: "12" | "24";
        }>) => Promise<any>;
      };
    };
  }
}



