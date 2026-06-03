/**
 * Reads the same browser cookies the longevity quiz API uses server-side
 * (`app/api/longevity-quiz/route.js`) so every POST can include CRM form keys
 * in the JSON body (130_3, 130_6, 131, 132, 158, 161_4) plus `entrykey` only
 * (no bio_age_entrykey / nad_entrykey field names in the payload).
 */

function readClientCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length < 2) return "";
  const raw = parts.pop().split(";").shift() || "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function genderToSexLabel(g) {
  const v = (g && String(g).trim()) || "";
  if (!v) return "";
  const s = v.toLowerCase();
  if (["male", "m", "man", "1"].includes(s)) return "Male";
  if (["female", "f", "woman", "2"].includes(s)) return "Female";
  return v;
}

/**
 * @param {string} entrykeyField - cookie name only (e.g. bio_age_entrykey), not sent as a JSON key
 * @returns {{ [key: string]: string }}
 */
export function getLongevityQuizRequestContext(entrykeyField) {
  if (typeof document === "undefined") return {};

  const fName = readClientCookie("displayName").trim();
  const email = readClientCookie("userEmail").trim();
  const phone = readClientCookie("phone") || readClientCookie("pn");
  const dob = readClientCookie("DOB") || readClientCookie("dob");
  const province = readClientCookie("province").trim();

  const lastNameCookie = readClientCookie("lastName").trim();
  const userName = readClientCookie("userName").trim();
  let lName = lastNameCookie;
  if (!lName && userName) {
    const nameParts = userName.split(/\s+/).filter(Boolean);
    if (nameParts.length > 1) {
      lName = nameParts.slice(1).join(" ");
    }
  }

  const entrykey = readClientCookie(entrykeyField).trim();
  const sex =
    genderToSexLabel(readClientCookie("sex")) ||
    genderToSexLabel(readClientCookie("gender"));

  const out = {};
  if (entrykey) out.entrykey = entrykey;
  if (fName) out["130_3"] = fName;
  if (lName) out["130_6"] = lName;
  if (email) out["131"] = email;
  if (phone) out["132"] = phone;
  if (dob) out["158"] = dob;
  if (province) out["161_4"] = province;
  if (sex) out.sex = sex;

  return out;
}
