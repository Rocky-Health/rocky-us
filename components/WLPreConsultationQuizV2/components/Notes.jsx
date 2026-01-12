"use client";

import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";

export default function Notes({ type, message }) {
  let IconComponent = null;
  let Color = "";
  let ColorCode = "";
  let BackgroundColor = "";

  switch (type) {
    case "error":
      IconComponent = FaExclamationCircle;
      Color = "text-red-600";
      ColorCode = "#dc2626";
      BackgroundColor = "bg-red-100";
      break;
    case "warning":
      IconComponent = FaExclamationCircle;
      Color = "text-[#919104]";
      ColorCode = "#919104";
      BackgroundColor = "bg-[#FFFBD6]";
      break;
    case "info":
      IconComponent = FaInfoCircle;
      Color = "text-blue-600";
      ColorCode = "#2563eb";
      BackgroundColor = "bg-blue-100";
      break;
    case "success":
      IconComponent = FaCheckCircle;
      Color = "text-green-600";
      ColorCode = "#16a34a";
      BackgroundColor = "bg-green-100";
      break;
    default:
      IconComponent = null;
      Color = "";
      ColorCode = "";
      BackgroundColor = "";
  }

  return (
    <div
      className={`note rounded-2xl ${type}  ${BackgroundColor} flex justify-center items-center gap-[24px] p-4`}
    >
      <div className="flex justify-center items-center p-1">
        {IconComponent && (
          <IconComponent
            className={`text-[24px]`}
            style={{ fill: "none", stroke: ColorCode, strokeWidth: 25 }}
          />
        )}
      </div>
      <span className="text-[12px] leading-[140%]">{message}</span>
    </div>
  );
}
