const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Final-submit guard for questionnaires: block submissions missing a real name/email.
export const getQuizUserInfoError = (formData = {}) => {
  const firstName = String(formData["130_3"] || "").trim();
  const email = String(formData["131"] || "").trim();

  if (!firstName) {
    return "Please provide your name before submitting.";
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return "Please provide a valid email address before submitting.";
  }
  return null;
};
