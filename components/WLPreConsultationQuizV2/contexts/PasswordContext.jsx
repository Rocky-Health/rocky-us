"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  clearStoredPasswordSecurely,
  restorePasswordSecurely,
  storePasswordSecurely,
} from "@/utils/quizPasswordVault";

const PasswordContext = createContext(undefined);

export const PasswordProvider = ({ children }) => {
  const [password, setPasswordState] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const restored = await restorePasswordSecurely();
      if (mounted && restored) {
        setPasswordState(restored);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setPassword = async (nextPassword) => {
    const value = typeof nextPassword === "string" ? nextPassword : "";
    setPasswordState(value);
    await storePasswordSecurely(value);
  };

  const clearPassword = () => {
    setPasswordState("");
    clearStoredPasswordSecurely();
  };

  return (
    <PasswordContext.Provider value={{ password, setPassword, clearPassword }}>
      {children}
    </PasswordContext.Provider>
  );
};

export const usePassword = () => {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error("usePassword must be used within a PasswordProvider");
  }
  return context;
};
