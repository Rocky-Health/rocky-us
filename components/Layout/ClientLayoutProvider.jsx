"use client";

import { Suspense } from "react";
import LayoutDetector from "./LayoutDetector";
import AttributionTracker from "./AttributionTracker";
import SessionInit from "./SessionInit";

const ClientLayoutProvider = ({ children }) => {
  return (
    <>
      <LayoutDetector />
      <SessionInit />
      <Suspense fallback={null}>
        <AttributionTracker />
      </Suspense>
      {children}
    </>
  );
};

export default ClientLayoutProvider;
