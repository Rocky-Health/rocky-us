"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const InactivityTimeoutHandler = dynamic(
  () => import("./InactivityTimeoutHandler"),
  { ssr: false }
);

// Keeps the inactivity handler (listeners, polling, modal chunk) out of guest
// page loads; it only mounts once the auth cookies exist.
export default function InactivityTimeoutGate() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(
      document.cookie.includes("authToken=") &&
        document.cookie.includes("userId=")
    );
  }, [pathname]);

  return isAuthed ? <InactivityTimeoutHandler /> : null;
}
