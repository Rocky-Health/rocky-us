/**
 * InactivityTimeoutHandler Component
 * Monitors user inactivity and handles automatic logout
 * Handles session expiry after timeout period
 */

"use client";

import { useState, useCallback } from "react";
import { useInactivityTimeout } from "@/lib/hooks/useInactivityTimeout";
import SessionExpiredModal from "./SessionExpiredModal";
import { logout } from "@/utils/logout";
import { logger } from "@/utils/devLogger";

export default function InactivityTimeoutHandler() {
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  /**
   * Handle timeout reached (after inactivity period)
   */
  const handleTimeout = useCallback(async () => {
    logger.warn("Inactivity timeout reached");

    // Prevent multiple logout calls
    if (hasLoggedOut) {
      return;
    }

    setHasLoggedOut(true);
    setShowExpiredModal(true);

    // Wait a moment to show the modal, then logout and redirect
    setTimeout(async () => {
      await logout({
        reason: "inactivity",
        redirect: true,
        preserveCurrentUrl: true, // Preserve current URL so user can return to same page after login
      });
    }, 2000); // Show modal for 2 seconds before redirect
  }, [hasLoggedOut]);

  /**
   * Use the inactivity timeout hook
   */
  const { isAuthenticated } = useInactivityTimeout({
    onTimeout: handleTimeout,
    enabled: true,
  });

  /**
   * Handle modal confirm (redirect to login)
   */
  const handleConfirmExpired = useCallback(() => {
    setShowExpiredModal(false);
    // Logout will handle the redirect
    logout({
      reason: "inactivity",
      redirect: true,
      preserveCurrentUrl: true, // Preserve current URL so user can return to same page after login
    });
  }, []);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Expired Modal - Shows after timeout */}
      <SessionExpiredModal
        isOpen={showExpiredModal}
        onConfirm={handleConfirmExpired}
        reason="inactivity"
      />
    </>
  );
}
