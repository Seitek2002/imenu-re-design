"use client";

import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Configures native StatusBar for Capacitor apps:
 * - Disables WebView overlay so content starts below the status bar
 * - Sets status bar icon/text style
 * - Sets background color on Android
 */
export default function StatusBarConfig() {
  useEffect(() => {
    (async () => {
      try {
        // Ensure system status bar does not overlay the WebView content
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // no-op (web / non-capacitor)
      }

      try {
        // Prefer dark icons on light backgrounds
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // no-op
      }

      try {
        // Android only: set a light background similar to app's base bg
        await StatusBar.setBackgroundColor({ color: "#F5F5F5" });
      } catch {
        // no-op
      }
    })();
  }, []);

  return null;
}
