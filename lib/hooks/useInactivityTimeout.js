/**
 * useInactivityTimeout Hook
 * Tracks user inactivity and triggers logout after specified timeout period
 * Monitors mouse, keyboard, scroll, and touch events to determine activity
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { INACTIVITY_CONFIG } from "./inactivityTimeoutConfig";

// Import configuration constants
const {
  INACTIVITY_TIMEOUT,
  WARNING_THRESHOLD,
  CHECK_INTERVAL,
  ACTIVITY_DEBOUNCE,
  STORAGE_KEY,
} = INACTIVITY_CONFIG;

/**
 * Get cookie value by name (client-side)
 */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

/**
 * Check if user is authenticated by checking for auth cookies
 */
function isAuthenticated() {
  if (typeof document === "undefined") return false;
  const authToken = getCookie("authToken");
  const userId = getCookie("userId");
  return !!(authToken && userId);
}

/**
 * Get the loginTime cookie stamped by the auth API routes at login
 */
function getLoginTime() {
  const raw = getCookie("loginTime");
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Get last activity time from localStorage.
 * Timestamps older than the current login are leftovers from a previous
 * session and must not count as inactivity, so they read as null.
 */
function getLastActivityTime() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const timestamp = parseInt(stored, 10);
    if (Number.isNaN(timestamp)) return null;
    const loginTime = getLoginTime();
    if (loginTime && timestamp < loginTime) return null;
    return timestamp;
  } catch (error) {
    logger.error("Error reading lastActivityTime from localStorage:", error);
    return null;
  }
}

/**
 * Set last activity time in localStorage
 */
function setLastActivityTime(timestamp) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY, timestamp.toString());
  } catch (error) {
    logger.error("Error writing lastActivityTime to localStorage:", error);
  }
}

/**
 * Hook to monitor user inactivity and trigger logout
 * @param {Object} options - Configuration options
 * @param {Function} options.onWarning - Callback when warning threshold is reached
 * @param {Function} options.onTimeout - Callback when timeout is reached
 * @param {boolean} options.enabled - Whether the timeout is enabled (default: true)
 */
export function useInactivityTimeout(options = {}) {
  const { onWarning = null, onTimeout = null, enabled = true } = options;

  const [timeoutState, setTimeoutState] = useState({
    isWarning: false,
    isTimedOut: false,
    secondsRemaining: INACTIVITY_TIMEOUT / 1000,
    isAuthenticated: false,
  });

  const debounceTimerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const warningFiredRef = useRef(false);
  const timeoutFiredRef = useRef(false);

  /**
   * Update last activity time with debouncing
   */
  const updateActivity = useCallback(() => {
    if (!enabled || !isAuthenticated()) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      const now = Date.now();
      setLastActivityTime(now);

      // Reset warning and timeout flags when user is active
      warningFiredRef.current = false;
      timeoutFiredRef.current = false;

      logger.log("User activity detected, timeout reset");
    }, ACTIVITY_DEBOUNCE);
  }, [enabled]);

  /**
   * Check inactivity status
   */
  const checkInactivity = useCallback(() => {
    if (!enabled) return;

    const authenticated = isAuthenticated();

    if (!authenticated) {
      setTimeoutState({
        isWarning: false,
        isTimedOut: false,
        secondsRemaining: INACTIVITY_TIMEOUT / 1000,
        isAuthenticated: false,
      });
      return;
    }

    const lastActivity = getLastActivityTime();
    const now = Date.now();

    // If no last activity time, set it now
    if (!lastActivity) {
      setLastActivityTime(now);
      return;
    }

    const timeSinceActivity = now - lastActivity;
    const secondsRemaining = Math.max(
      0,
      Math.floor((INACTIVITY_TIMEOUT - timeSinceActivity) / 1000)
    );

    const isTimedOut = timeSinceActivity >= INACTIVITY_TIMEOUT;
    const isWarning = timeSinceActivity >= WARNING_THRESHOLD && !isTimedOut;

    // Update state
    setTimeoutState({
      isWarning,
      isTimedOut,
      secondsRemaining,
      isAuthenticated: authenticated,
    });

    // Fire warning callback once
    if (isWarning && !warningFiredRef.current && !timeoutFiredRef.current) {
      warningFiredRef.current = true;
      logger.warn(
        `Inactivity warning: ${secondsRemaining} seconds remaining`
      );
      if (onWarning) {
        onWarning(secondsRemaining);
      }
    }

    // Fire timeout callback once
    if (isTimedOut && !timeoutFiredRef.current) {
      timeoutFiredRef.current = true;
      logger.warn("Inactivity timeout reached, logging out user");
      if (onTimeout) {
        onTimeout();
      }
    }
  }, [enabled, onWarning, onTimeout]);

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    const now = Date.now();
    setLastActivityTime(now);
    warningFiredRef.current = false;
    timeoutFiredRef.current = false;

    // Immediately check inactivity to update state
    checkInactivity();

    logger.log("Inactivity timer manually reset");
  }, [checkInactivity]);

  /**
   * Set up activity listeners
   */
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Activity events to monitor
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, updateActivity]);

  /**
   * Set up inactivity check interval
   */
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Initial check on mount
    const authenticated = isAuthenticated();

    if (authenticated) {
      const lastActivity = getLastActivityTime();
      const now = Date.now();

      // Check if last activity was more than timeout period ago
      if (lastActivity) {
        const timeSinceActivity = now - lastActivity;
        if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
          logger.warn(
            "User was inactive for more than timeout period, triggering logout"
          );
          timeoutFiredRef.current = true;
          if (onTimeout) {
            onTimeout();
          }
          return;
        }
      } else {
        // No previous activity recorded, set it now
        setLastActivityTime(now);
      }
    }

    // Check inactivity immediately
    checkInactivity();

    // Set up interval to check inactivity
    checkIntervalRef.current = setInterval(checkInactivity, CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, checkInactivity, onTimeout]);

  return {
    ...timeoutState,
    resetTimer,
  };
}
