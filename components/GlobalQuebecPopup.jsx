"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const QuebecRestrictionPopup = dynamic(
  () => import("./Popups/QuebecRestrictionPopup"),
  { ssr: false }
);

// Registration sets the localStorage flags then router.push()es away, so the
// flag is re-checked on route changes instead of polling on an interval. The
// popup chunk only loads when the flag is actually set.
const GlobalQuebecPopup = () => {
  const pathname = usePathname();
  const [showQuebecPopup, setShowQuebecPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const checkFlag = () => {
      const shouldShowPopup = localStorage.getItem("showQuebecPopup");
      const message = localStorage.getItem("quebecPopupMessage");
      if (shouldShowPopup !== "true" || !message) return null;
      return setTimeout(() => {
        setShowQuebecPopup(true);
        setPopupMessage(message);
        localStorage.removeItem("showQuebecPopup");
        localStorage.removeItem("quebecPopupMessage");
      }, 1000);
    };

    let timer = checkFlag();

    // Cross-tab case: another tab sets the flag
    const handleStorageChange = (e) => {
      if (e.key === "showQuebecPopup" && e.newValue === "true") {
        if (timer) clearTimeout(timer);
        timer = checkFlag();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pathname]);

  if (!showQuebecPopup) return null;

  return (
    <QuebecRestrictionPopup
      isOpen={showQuebecPopup}
      onClose={() => setShowQuebecPopup(false)}
      message={popupMessage}
    />
  );
};

export default GlobalQuebecPopup;
