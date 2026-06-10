import { logger } from "@/utils/devLogger";

const CRON_ENDPOINT = `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-cron.php`;
const COOLDOWN_PERIOD = 120000; // 2 minutes in milliseconds
const STORAGE_KEY = "lastCronHit";
const ERROR_STORAGE_KEY = "cronErrorTimestamp";

/**
 * Checks if enough time has passed since the last cron hit
 * @returns {boolean} True if cooldown period has passed
 */
const isCooldownPassed = () => {
  try {
    const lastHit = localStorage.getItem(STORAGE_KEY);
    const lastError = localStorage.getItem(ERROR_STORAGE_KEY);

    logger.log(
      "Last cron hit:",
      lastHit ? new Date(parseInt(lastHit)).toISOString() : "Never"
    );

    // If there was an error, don't retry
    if (lastError) {
      logger.log("Previous error detected, skipping cron execution");
      return false;
    }

    if (!lastHit) {
      logger.log("No previous cron hit found, allowing execution");
      return true;
    }

    const timeSinceLastHit = Date.now() - parseInt(lastHit);
    const canExecute = timeSinceLastHit >= COOLDOWN_PERIOD;
    logger.log(
      `Time since last hit: ${timeSinceLastHit}ms, Cooldown period: ${COOLDOWN_PERIOD}ms, Can execute: ${canExecute}`
    );
    return canExecute;
  } catch (error) {
    logger.error("Error checking cooldown:", error);
    return false; // Don't allow execution if there's an error
  }
};

/**
 * Updates the last hit timestamp in localStorage
 */
const updateLastHitTimestamp = () => {
  try {
    const timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, timestamp.toString());
    logger.log(
      "Updated last hit timestamp:",
      new Date(timestamp).toISOString()
    );
  } catch (error) {
    logger.error("Error updating timestamp:", error);
  }
};

/**
 * Records an error timestamp to prevent future retries
 */
const recordError = () => {
  try {
    const timestamp = Date.now();
    localStorage.setItem(ERROR_STORAGE_KEY, timestamp.toString());
    logger.log("Recorded error timestamp:", new Date(timestamp).toISOString());
  } catch (error) {
    logger.error("Error recording error timestamp:", error);
  }
};

/**
 * Hits the cron endpoint with cooldown mechanism
 * @returns {Promise<void>}
 */
export const hitCronEndpoint = async () => {
  logger.log("Attempting to hit cron endpoint...");

  // try {
  //   if (!isCooldownPassed()) {
  //     logger.log(
  //       "Cron hit skipped: Cooldown period not passed or previous error exists"
  //     );
  //     return;
  //   }

  //   logger.log("Making request to cron endpoint:", CRON_ENDPOINT);

  //   // Create a form data object to simulate a POST request
  //   const formData = new FormData();
  //   formData.append("doing_wp_cron", "true");

  //   const response = await fetch(CRON_ENDPOINT, {
  //     method: "POST",
  //     body: formData,
  //     headers: {
  //       Accept: "application/json",
  //       "Cache-Control": "no-cache",
  //     },
  //     credentials: "include", // Include cookies
  //     mode: "cors", // Enable CORS
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   updateLastHitTimestamp();
  //   logger.log("Cron endpoint hit successfully");
  // } catch (error) {
  //   logger.error("Error hitting cron endpoint:", error);
  //   recordError(); // Record the error to prevent future retries
  // }
};
