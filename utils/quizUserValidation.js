const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Final-submit guard for questionnaires: block submissions missing real user info.
export const getQuizUserInfoError = (formData = {}) => {
  const firstName = String(formData["130_3"] || "").trim();
  const email = String(formData["131"] || "").trim();
  const phoneDigits = String(formData["132"] || "").replace(/\D/g, "");
  const dob = String(formData["158"] || "").trim();

  if (!firstName) {
    return "Please provide your name before submitting.";
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return "Please provide a valid email address before submitting.";
  }
  if (phoneDigits.length < 10 || /^0+$/.test(phoneDigits)) {
    return "We are missing your phone number. Please log out and back in, or update your profile, then try again.";
  }
  if (!dob) {
    return "We are missing your date of birth. Please log out and back in, or update your profile, then try again.";
  }
  return null;
};
