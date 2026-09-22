/**
 * Inactivity Timeout Configuration
 * Centralized configuration for timeout periods
 */

import { logger } from "@/utils/devLogger";

export const INACTIVITY_CONFIG = {
  // Main timeout period (30 minutes)
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // milliseconds

  // Warning threshold (29 minutes - shows warning 1 minute before logout)
  WARNING_THRESHOLD: 29 * 60 * 1000, // milliseconds

  // How often to check inactivity status
  CHECK_INTERVAL: 1000, // 1 second

  // Debounce period for activity updates
  ACTIVITY_DEBOUNCE: 500, // milliseconds

  // localStorage key for last activity timestamp
  STORAGE_KEY: "lastActivityTime",
};

/**
 * Helper function to convert milliseconds to human-readable format
 */
export function formatTimeout(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}${
      remainingSeconds > 0
        ? ` ${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`
        : ""
    }`;
  }
  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}

/**
 * Log current configuration
 */
export function logConfig() {
  if (typeof console !== "undefined") {
    logger.log("=== Inactivity Timeout Configuration ===");
    logger.log(
      `Timeout Period: ${formatTimeout(INACTIVITY_CONFIG.INACTIVITY_TIMEOUT)}`
    );
    logger.log(
      `Warning Threshold: ${formatTimeout(INACTIVITY_CONFIG.WARNING_THRESHOLD)}`
    );
    logger.log(
      `Check Interval: ${formatTimeout(INACTIVITY_CONFIG.CHECK_INTERVAL)}`
    );
    logger.log(
      `Activity Debounce: ${formatTimeout(INACTIVITY_CONFIG.ACTIVITY_DEBOUNCE)}`
    );
    logger.log("=======================================");
  }
}
