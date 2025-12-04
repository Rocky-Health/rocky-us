import DOBInput from "@/components/shared/DOBInput";
import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import SignInLink from "./SignInLink";
import StickyButton from "./StickyButton";

const DateQuestion = ({ config, userData, setUserData, onContinue }) => {
  // Get initial value from userData if available
  const initialDate =
    userData && userData[config.field] ? String(userData[config.field]) : "";
  logger.log(userData);
  const [dateOfBirth, setDateOfBirth] = useState(initialDate);

  // Always keep userData in sync with selected date, but only if not empty
  useEffect(() => {
    if (typeof setUserData === "function" && dateOfBirth) {
      let formattedDate = dateOfBirth;
      // If dateOfBirth is a native Date string, format as DD/MM/YYYY
      if (dateOfBirth.match(/^[A-Za-z]{3} /)) {
        const d = new Date(dateOfBirth);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        formattedDate = `${day}/${month}/${year}`;
      }
      setUserData((prev) => ({
        ...prev,
        [config.field]: formattedDate,
      }));
    }
  }, [dateOfBirth, setUserData, config.field]);

  // Sync local state with userData when navigating back
  useEffect(() => {
    if (userData && userData[config.field]) {
      setDateOfBirth(String(userData[config.field]));
    }
  }, [userData, config.field]);

  const handleDateChange = (value) => {
    setDateOfBirth(value);
  };

  const handleContinue = () => {
    if (dateOfBirth && isValidAge()) {
      if (typeof setUserData === "function") {
        let formattedDate = dateOfBirth;
        if (dateOfBirth.match(/^[A-Za-z]{3} /)) {
          const d = new Date(dateOfBirth);
          const day = d.getDate();
          const month = d.getMonth() + 1;
          const year = d.getFullYear();
          formattedDate = `${day}/${month}/${year}`;
        }
        setUserData((prev) => ({
          ...prev,
          [config.field]: formattedDate,
        }));
      }
      onContinue();
    }
  };

  // Check if user is 18 or older as of today
  const isValidAge = () => {
    let dobStr = dateOfBirth;
    if (!dobStr) return false;

    let birthDate;
    // If dobStr is a native Date string, parse it
    if (dobStr.match(/^[A-Za-z]{3} /)) {
      birthDate = new Date(dobStr);
    } else if (dobStr.includes("-")) {
      // YYYY-MM-DD
      birthDate = new Date(dobStr);
    } else if (dobStr.includes("/")) {
      // MM/DD/YYYY
      const parts = dobStr.split("/");
      birthDate = new Date(
        parseInt(parts[2]),
        parseInt(parts[0]) - 1,
        parseInt(parts[1])
      );
    }
    if (!birthDate || isNaN(birthDate.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18;
  };

  const isValid = dateOfBirth && dateOfBirth !== "" && isValidAge();

  return (
    <div className="w-full md:w-[520px] mx-auto px-0 flex flex-col min-h-screen ">
      <div className="flex-grow mt-6 ">
        <div className="mb-6">
          <label className="text-[14px] mb-[8px] font-medium leading-[140%]">
            {config.label}
          </label>
          <DOBInput
            value={dateOfBirth}
            onChange={handleDateChange}
            className="block w-[100%] rounded-[8px] h-[48px] md:h-[52px] text-[16px] border-[1px] border-[#E2E2E1] px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent pr-10 bg-white"
            placeholder="MM/DD/YYYY"
            minAge={18}
            required
          />
        </div>

        <div className="text-[10px] mt-6 text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%]">
          We respect your privacy. All of your information is securely stored on
          our PIPEDA Compliant server.
        </div>
      </div>

      <StickyButton
        text="Continue"
        onClick={handleContinue}
        disabled={!isValid}
        showSignIn={config.showSignIn}
      />
    </div>
  );
};

export default DateQuestion;
