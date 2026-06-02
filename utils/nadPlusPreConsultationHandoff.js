const ESSENTIAL_CONSUL_KEY = "nad-plus-essential-consul";

export function buildNadPlusPreHandoff(userData) {
  if (!userData || typeof userData !== "object") return {};
  const out = {};
  if (userData.sex === "male" || userData.sex === "female") {
    out.sex = userData.sex;
  }
  if (userData.dateOfBirth) {
    out.dateOfBirth = userData.dateOfBirth;
  }
  return out;
}

export function getNadPlusPreHandoff() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ESSENTIAL_CONSUL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return buildNadPlusPreHandoff(parsed);
  } catch {
    return {};
  }
}

function formatDob(dateOfBirth) {
  if (!dateOfBirth) return "";
  if (typeof dateOfBirth === "string") return dateOfBirth;
  if (
    typeof dateOfBirth === "object" &&
    dateOfBirth.year &&
    dateOfBirth.month &&
    dateOfBirth.day
  ) {
    return `${dateOfBirth.year}-${String(dateOfBirth.month).padStart(2, "0")}-${String(dateOfBirth.day).padStart(2, "0")}`;
  }
  return "";
}

/** CRM keys for pre-consultation handoff (sex + DOB only). */
export function formatPreHandoffForCrm(handoff) {
  const out = {};
  if (!handoff || typeof handoff !== "object") return out;

  if (handoff.sex === "male") out.sex = "Male";
  if (handoff.sex === "female") out.sex = "Female";

  const dob = formatDob(handoff.dateOfBirth);
  if (dob) out["158"] = dob;

  return out;
}

export function clearNadPlusPreHandoff() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ESSENTIAL_CONSUL_KEY);
  } catch {
    // ignore
  }
}

export { ESSENTIAL_CONSUL_KEY };
