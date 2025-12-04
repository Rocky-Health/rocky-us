import Link from "next/link";
import React, { useState, useEffect } from "react";
import SignInLink from "./SignInLink";
import StickyButton from "./StickyButton";

const RadioQuestion = ({ config, userData, onSelect }) => {
  const [selected, setSelected] = useState(
    userData ? userData[config.field] ?? null : null
  );

  useEffect(() => {
    if (userData && typeof config?.field !== "undefined") {
      setSelected(userData[config.field] ?? null);
    }
  }, [userData, config.field]);

  return (
    <>
      <div className="space-y-4 pb-24">
        {config.options.map((option, key) => (
          <button
            key={option.id}
            className={`w-full text-left ${config.options.length -1 == key ? 'mb-60' : ''} px-4 py-4 md:py-4 border-[1px] rounded-lg flex items-center gap-3 ${
              selected === option.id
                ? "border-[#A7885A] bg-[#FFFBF7]"
                : "border-[#E2E2E1]"
            }`}
            // only set local selection on click; sticky button will submit
            onClick={() => setSelected(option.id)}
          >
            <div
              className={`w-5 h-5 rounded-full border flex justify-center items-center ${
                selected === option.id
                  ? "border-[#A7885A] bg-[#A7885A]"
                  : "border-gray-300"
              }`}
            >
              {selected === option.id && (
                <div className="w-3 h-3 bg-white rounded-full m-[3px]"></div>
              )}
            </div>
            <div className="flex-1">
              <span className="text-[14px] md:text-[16px] font-medium leading-[140%] tracking-[0%] text-black">
                {option.label}
              </span>
              {option.metadata && (
                <div className="text-[12px] text-gray-500 mt-1">
                  {option.metadata}
                </div>
              )}
            </div>
          </button>
        ))}

         {config.showSignIn && <SignInLink className="!mt-[30px]" />}

        {/* Privacy text - WL style */}
        <div className="text-[10px] my-6  text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%] mb-64">
          We respect your privacy. All of your information is securely stored on
          our PIPEDA Compliant server.
        </div>
      </div>
      
      <StickyButton
        text="Continue"
        onClick={() => {
          const opt = config.options.find((o) => o.id === selected);
          onSelect(selected, opt);
        }}
        disabled={selected == null}
      />
    </>
  );
};

export default RadioQuestion;
