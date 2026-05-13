"use client";
import { useState, useEffect } from "react";

export default function MedViFlashGuard() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 500);
  }, []);

  if (isReady) return null;
  return <div className="fixed inset-0 z-[9999999] w-full h-full bg-white" />;
}
