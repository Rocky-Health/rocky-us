"use client";

import { useEffect, useState, Suspense } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter, useSearchParams } from "next/navigation";
import Typewriter from "@/components/ui/Typewriter";

function MyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const healthInfo = [
    "your prescriptions",
    "your consultations",
    "doctor's notes",
    "treatment plans",
    "telehealth records",
    "your medications",
    "refill history",
    "dosage instructions",
    "pharmacy notes",
    "lab results",
  ];

  // Randomize messages on each visit
  const messages = [...healthInfo].sort(() => 0.5 - Math.random()).slice(0, 5);

  useEffect(() => {
    const fetchPortalUrl = async () => {
      try {
        logger.log("Fetching portal URL...");
        const redirectPath = searchParams.get("redirectPath");
        const redirectPage = searchParams.get("redirectPage");
        const params = new URLSearchParams();
        if (redirectPath != null && redirectPath !== "")
          params.set("redirectPath", redirectPath);
        if (redirectPage != null && redirectPage !== "")
          params.set("redirectPage", redirectPage);
        const query = params.toString();
        const apiUrl = query
          ? `/api/my-account-url?${query}`
          : "/api/my-account-url";
        const response = await fetch(apiUrl);
        // Fall back to {} if the response isn't JSON (e.g. an HTML error page)
        // so the response.ok / data.success check below runs cleanly.
        const data = await response.json().catch(() => ({}));

        // Log result for debugging with full details
        logger.log("API response:", data);

        if (response.ok && data.success && data.url) {
          logger.log(
            "Successfully received portal URL, redirecting to:",
            data.url
          );

          // Redirect as soon as the portal URL is ready. Keep a short grace
          // period so the typewriter doesn't hard-flash.
          setTimeout(() => {
            window.location.href = data.url;
          }, 400);
        } else {
          // Display more detailed error information
          logger.error("Error getting portal URL:", data);
          if (data.details) {
            logger.error("Error details:", data.details);
          }

          setError(
            data.error ||
              "Unable to access your account portal. Please try again later."
          );

          // Redirect to home after showing error
          setTimeout(() => {
            router.push("/");
          }, 5000); // Increased to 5 seconds to give more time to see the error
        }
      } catch (err) {
        logger.error("Exception during portal URL fetch:", err);
        setError("Connection error. Please try again later.");

        // Redirect to home after showing error
        setTimeout(() => {
          router.push("/");
        }, 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortalUrl();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F3EF] px-4">
      <div className="max-w-3xl w-full">
        <div className="text-3xl flex items-start justify-center p-8 md:p-12">
          <p className="whitespace-pre-wrap">
            <span className="text-center">
              {"Hold on tight, we're gathering "}
            </span>
            <Typewriter
              text={messages}
              speed={70}
              className="text-[#AE7E56] font-medium"
              waitTime={1500}
              deleteSpeed={40}
              cursorChar={"_"}
            />
          </p>
        </div>

        {error && (
          <div className="mt-8 text-center">
            <p className="text-red-500 text-xl">{error}</p>
            <p className="mt-2 text-gray-600">
              Redirecting you to home page...
            </p>
          </div>
        )}

        <div className="mt-12 text-center opacity-70">
          <p>Securely connecting to your patient portal...</p>
        </div>
      </div>
    </div>
  );
}

export default function MyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F3EF] px-4">
          <div className="max-w-3xl w-full text-center">
            <p className="text-lg">Loading your account...</p>
          </div>
        </div>
      }
    >
      <MyAccountContent />
    </Suspense>
  );
}
