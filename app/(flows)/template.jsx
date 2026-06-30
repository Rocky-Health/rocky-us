// Template for flows that works within the root layout structure
// This adapts to work within the existing HTML structure

import "../globals.css";
import LoadingOverlay from "@/components/utils/LoadingBar";

export default function FlowsTemplate({ children }) {
  return (
    <div className="flows-template">
      <LoadingOverlay />
      {children}
    </div>
  );
}
