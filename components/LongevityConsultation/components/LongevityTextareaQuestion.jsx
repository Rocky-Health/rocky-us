import React from "react";

const LongevityTextareaQuestion = ({ config, userData, setUserData }) => {
  const value = userData[config.field] || "";

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) =>
          setUserData((prev) => ({ ...prev, [config.field]: e.target.value }))
        }
        placeholder={config.placeholder || ""}
        rows={5}
        className="w-full p-4 border border-[#E2E2E1] rounded-lg text-[14px] md:text-[16px] focus:outline-none focus:border-[#A7885A] resize-none leading-[140%]"
      />
    </div>
  );
};

export default LongevityTextareaQuestion;
