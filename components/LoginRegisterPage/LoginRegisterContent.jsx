"use client";

import { useState, useEffect, Suspense } from "react";
import { logger } from "@/utils/devLogger";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Login from "./Login";
import Register from "./Register";
import {
  QUESTIONNAIRE_PREFILL_PATHS,
  getPrefillStorageKey,
} from "@/lib/questionnairePrefillConfig";

const LoginRegisterContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [logoutProcessed, setLogoutProcessed] = useState(false);

  useEffect(() => {
    const viewShow = searchParams.get("viewshow");
    if (viewShow === "register") {
      setActiveTab("register");
    } else if (viewShow === "login") {
      setActiveTab("login");
    }

    // Patient portal prefill: cache filled answers before the user logs in
    const redirectTo = searchParams.get("redirect_to");
    const id = searchParams.get("id");
    const token = searchParams.get("token");
    const patientToken = searchParams.get("patient-token");
    if (
      redirectTo &&
      id &&
      token &&
      patientToken &&
      QUESTIONNAIRE_PREFILL_PATHS.some((p) => redirectTo.includes(p))
    ) {
      const pathname = redirectTo.startsWith("/")
        ? redirectTo.split("?")[0]
        : `/${redirectTo.split("?")[0]}`;
      const storageKey = getPrefillStorageKey(pathname);
      (async () => {
        try {
          const res = await fetch("/api/questionnaire-filled-answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wp_entry_id: id,
              token,
              patient_token: patientToken,
            }),
          });
          const data = await res.json();
          if (data?.data && typeof window !== "undefined") {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ id, token, data })
            );
            logger.log("[LoginRegister] Cached questionnaire prefill for", pathname);
          }
        } catch (err) {
          logger.error("[LoginRegister] Questionnaire prefill fetch error:", err);
        }
      })();
    }

    // Check for patient portal logout parameter
    const ppLogout = searchParams.get("pp-logout");
    const refSource = searchParams.get("ref");

    // Handle patient portal logout
    if (ppLogout === "1" && !logoutProcessed) {
      const handlePatientPortalLogout = async () => {
        try {
          // Call our specialized patient portal logout API
          const response = await fetch("/api/patient-portal-logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (response.ok && data.success) {
            // Show the success message for patient portal logout
            toast.success("You are successfully logged out of patient portal");

            // Clear localStorage items related to authentication
            localStorage.removeItem("userDetails");
            localStorage.removeItem("userProfileData");
            localStorage.removeItem("cartItems");

            // Mark logout as processed to prevent multiple calls
            setLogoutProcessed(true);

            // Trigger a cart updated event to refresh the cart display
            const cartUpdatedEvent = new CustomEvent("cart-updated");
            document.dispatchEvent(cartUpdatedEvent);

            // Force a complete page refresh to update all components
            // This ensures navbar and cart items are properly updated
            setTimeout(() => {
              window.location.href = "/";
            }, 1500); // Small delay to ensure the toast message is visible
          } else {
            logger.error(
              "Error during patient portal logout:",
              data.error || response.statusText
            );
          }
        } catch (error) {
          logger.error("Exception during patient portal logout:", error);
        }
      };

      handlePatientPortalLogout();
    }
  }, [searchParams, logoutProcessed, router]);

  if (activeTab === "register") {
    return <Register />;
  }

  if (activeTab === "login") {
    return <Login />;
  }

  return <Register />;
};

export default function LoginRegisterWrapper() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginRegisterContent />
      </Suspense>
    </div>
  );
}
