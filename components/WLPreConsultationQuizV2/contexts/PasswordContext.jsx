"use client";
import React, { createContext, useContext, useState } from 'react';

/**
 * Password Context - Stores password in memory only (React state)
 * This password is NOT persisted to localStorage and will be cleared on page refresh
 * Perfect for temporary multi-step flows where security is important
 */
const PasswordContext = createContext(undefined);

export const PasswordProvider = ({ children }) => {
  const [password, setPassword] = useState('');

  const clearPassword = () => {
    setPassword('');
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
    throw new Error('usePassword must be used within a PasswordProvider');
  }
  return context;
};
