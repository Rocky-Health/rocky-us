import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import { randomBytes } from "crypto";
import https from "https";
import axios from "axios";

/** Maps `action` from the client to the entrykey cookie name for that quiz. */
const LONGEVITY_ACTION_TO_ENTRYKEY_FIELD = {
  longevity_bio_age: "bio_age_entrykey",
  longevity_bio_age_nad: "bio_age_nad_entrykey",
  longevity_nad: "nad_entrykey",
};

const LONGEVITY_ENTRYKEY_COOKIE_NAMES = Object.values(
  LONGEVITY_ACTION_TO_ENTRYKEY_FIELD,
);

const crmApi = axios.create({
  baseURL: "https://crm.myrocky.com/api",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 60000,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

function strOrEmpty(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function entrykeyFieldFromAction(action) {
  const a = strOrEmpty(action);
  return LONGEVITY_ACTION_TO_ENTRYKEY_FIELD[a] || "";
}

function genderToSexLabel(g) {
  const v = strOrEmpty(g);
  if (!v) return "";
  const s = v.toLowerCase();
  if (["male", "m", "man", "1"].includes(s)) return "Male";
  if (["female", "f", "woman", "2"].includes(s)) return "Female";
  return v;
}

function generateLongevityEntrykeyValue() {
  return `lq-${randomBytes(8).toString("hex")}`;
}

function resolveCrmUserIds({ cookieUserId, isCreate }) {
  const cu = Number.isFinite(cookieUserId) ? cookieUserId : 0;
  void isCreate;
  if (cu === 0) return {};
  return { wp_user_id: cu, created_by: cu };
}

async function getEntrykey(entrykeyField, clientFallback = "") {
  try {
    const cookieStore = await cookies();
    const existingCookie = strOrEmpty(cookieStore.get(entrykeyField)?.value);
    const fromClient = strOrEmpty(clientFallback);
    return (
      existingCookie || fromClient || generateLongevityEntrykeyValue()
    );
  } catch (error) {
    logger.warn("Longevity quiz cookie reading error:", error);
    const fromClient = strOrEmpty(clientFallback);
    return fromClient || generateLongevityEntrykeyValue();
  }
}

async function getUserId() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");
    return userId?.value ? parseInt(userId.value, 10) : 887;
  } catch (error) {
    logger.warn("Longevity quiz error getting user ID from cookies:", error);
    return 887;
  }
}

async function getUserDataFromCookies() {
  try {
    const cookieStore = await cookies();

    const fName = cookieStore.get("displayName")?.value || "";
    const email = cookieStore.get("userEmail")?.value
      ? decodeURIComponent(cookieStore.get("userEmail").value)
      : "";
    const phone =
      cookieStore.get("phone")?.value || cookieStore.get("pn")?.value || "";
    const dob =
      cookieStore.get("DOB")?.value || cookieStore.get("dob")?.value || "";
    const province = cookieStore.get("province")?.value || "";

    const lastNameCookie = cookieStore.get("lastName")?.value || "";
    const userName = cookieStore.get("userName")?.value || "";
    let lName = lastNameCookie;
    if (!lName && userName) {
      const nameParts = userName.split(" ");
      if (nameParts.length > 1) {
        lName = nameParts.slice(1).join(" ");
      }
    }

    let gender = "";
    try {
      const authToken = cookieStore.get("authToken")?.value;
      const userId = cookieStore.get("userId")?.value;

      if (authToken && userId && process.env.BASE_URL) {
        const response = await fetch(
          `${process.env.BASE_URL}/wp-json/rockyhealth/v1/user-profile`,
          {
            headers: { Authorization: authToken },
          },
        );

        if (response.ok) {
          const profileData = await response.json();
          if (profileData.success && profileData.custom_meta?.gender) {
            gender = profileData.custom_meta.gender;
          }
        }
      }
    } catch (genderError) {
      logger.warn(
        "Longevity quiz could not fetch gender from profile:",
        genderError.message,
      );
    }

    return { fName, lName, email, phone, dob, province, gender };
  } catch (error) {
    logger.warn("Longevity quiz error getting user data from cookies:", error);
    return {
      fName: "",
      lName: "",
      email: "",
      phone: "",
      dob: "",
      province: "",
      gender: "",
    };
  }
}

function cookieOptions() {
  const opts = {
    path: "/",
    expires: new Date(Date.now() + 1800 * 1000),
    httpOnly: false,
    sameSite: "lax",
  };
  if (process.env.NODE_ENV !== "development") {
    opts.domain = "myrocky.com";
  }
  return opts;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const entrykeyField = entrykeyFieldFromAction(action);
    if (!entrykeyField) {
      return NextResponse.json(
        { error: true, msg: "Missing or invalid action" },
        { status: 400 },
      );
    }

    const entrykey = await getEntrykey(entrykeyField);
    const response = NextResponse.json({
      message: "Success",
      entrykey,
    });
    response.cookies.set(entrykeyField, entrykey, cookieOptions());
    return response;
  } catch (error) {
    logger.error("Longevity quiz GET error:", error);
    return NextResponse.json(
      { error: true, msg: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: true,
          msg: "File uploads should be handled via frontend S3 upload",
        },
        { status: 400 },
      );
    }

    const rawData = await req.json();
    if (!rawData || Object.keys(rawData).length === 0) {
      return NextResponse.json(
        { error: true, msg: "Blank Data" },
        { status: 400 },
      );
    }

    const entrykeyField = entrykeyFieldFromAction(rawData.action);
    if (!entrykeyField) {
      return NextResponse.json(
        { error: true, msg: "Missing or invalid action" },
        { status: 400 },
      );
    }

    const entrykey = await getEntrykey(entrykeyField, rawData.entrykey);
    const userId = await getUserId();
    const userData = await getUserDataFromCookies();

    const data = {
      form: {},
      entrykey,
      timestamp: Math.floor(Date.now() / 1000),
      entry_saved: false,
      form_id: rawData.form_id ?? 12,
      error: false,
      id: rawData.id || "",
      token: rawData.token || "",
      stage: rawData.stage || "consultation-after-checkout",
      page_step: rawData.page_step || 1,
      completion_state: rawData.completion_state || "Partial",
      completion_percentage: rawData.completion_percentage ?? 10,
      source_site: rawData.source_site || "https://myrocky.com",
      wp_user_id: userId,
      created_by: userId,
    };

    if (
      (data.stage === "consultation-after-checkout" ||
        data.stage === "consultation-before-checkout") &&
      !data.id &&
      !data.token
    ) {
      data.id = generateUniqueId();
    }

    const excludedKeys = [
      "form_id",
      "action",
      "entrykey_field",
      "entrykey",
      "id",
      "token",
      "stage",
      "page_step",
      "completion_state",
      "completion_percentage",
      "source_site",
      ...LONGEVITY_ENTRYKEY_COOKIE_NAMES,
    ];

    for (const [key, value] of Object.entries(rawData)) {
      if (
        !excludedKeys.includes(key) &&
        value !== undefined &&
        value !== null
      ) {
        data.form[key] = value;
      }
    }

    const pick = (fromCookie, fromBody) =>
      strOrEmpty(fromCookie) || strOrEmpty(fromBody);

    const first = pick(userData.fName, rawData["130_3"]);
    if (first) data.form["130_3"] = first;

    const last = pick(userData.lName, rawData["130_6"]);
    if (last) data.form["130_6"] = last;

    const email = pick(userData.email, rawData["131"]);
    if (email) data.form["131"] = email;

    const phone = pick(userData.phone, rawData["132"]);
    if (phone) data.form["132"] = phone;

    const dob = pick(userData.dob, rawData["158"]);
    if (dob) data.form["158"] = dob;

    const province = pick(userData.province, rawData["161_4"]);
    if (province) data.form["161_4"] = province;

    const genderVal = pick(userData.gender, rawData["1"]);
    if (genderVal) data.form[1] = genderVal;

    const sexVal =
      strOrEmpty(rawData.sex) ||
      strOrEmpty(data.form.sex) ||
      genderToSexLabel(genderVal);
    if (sexVal) data.form.sex = sexVal;

    try {
      const crmResult = await postLongevityToCRM(data);
      Object.assign(data, crmResult);
    } catch (crmError) {
      logger.error("Longevity quiz CRM submission error:", crmError);
      data.error = true;
      data.error_message = crmError.message || "CRM submission failed";
    }

    delete data[entrykeyField];

    const response = NextResponse.json(data);
    response.cookies.set(entrykeyField, entrykey, cookieOptions());
    return response;
  } catch (error) {
    logger.error("Longevity quiz POST error:", error);
    return NextResponse.json(
      { error: true, msg: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

async function postLongevityToCRM(data) {
  const crmUrlCreate = "/get-wp-gravity-forms-data";
  const crmUrlPartial = "/get-wp-gravity-forms-partial-entry-data";

  let apiEndpoint = crmUrlCreate;
  if (data.id && data.token) {
    apiEndpoint = crmUrlPartial;
  }

  const currentUserId = data.wp_user_id || (await getUserId());
  const entrykeyValue = strOrEmpty(data.entrykey);
  const isCreate = !(data.id && data.token);

  const postData = {
    timestamp: Math.floor(Date.now() / 1000),
    entry_saved: false,
    form_id: data.form_id || 12,
    error: false,
    stage: data.stage || "consultation-after-checkout",
    page_step: parseInt(data.page_step, 10) || 1,
    completion_state: data.completion_state || "Partial",
    completion_percentage: parseInt(data.completion_percentage, 10) || 10,
    source_site: data.source_site || "https://myrocky.com",
    ...resolveCrmUserIds({ cookieUserId: currentUserId, isCreate }),
    entrykey: entrykeyValue,
  };

  if (data.id) postData.id = data.id;

  if (data.id && data.token) {
    postData.token = data.token;
    postData.sync = "Partial";
  } else {
    postData.sync = "Create";
  }

  if (data.form) {
    for (const [key, value] of Object.entries(data.form)) {
      const transformedKey = key.replace(/_/g, ".");
      if (value !== undefined && value !== null && value !== "") {
        postData[transformedKey] = value;
      }
    }
  }

  try {
    logger.log(
      "Longevity quiz CRM payload:",
      JSON.stringify(postData, null, 2),
    );
    const response = await crmApi.post(apiEndpoint, postData, {
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    });
    logger.log(
      "Longevity quiz CRM response:",
      JSON.stringify(response.data, null, 2),
    );

    if (response.data && response.data.success) {
      return {
        crm_db_id: response.data.data?.crm_db_id || null,
        entry_saved: true,
        id: response.data.data?.wp_entry_id || data.id || "",
        token: response.data.data?.token || data.token || "",
        entrykey: entrykeyValue,
        crm_post_response_message:
          response.data.message || "Submission successful",
      };
    }
    throw new Error(response.data?.message || "Unknown CRM submission error");
  } catch (error) {
    logger.error("Longevity quiz CRM API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(`CRM Submission Failed: ${error.message}`);
  }
}

function generateUniqueId() {
  const OFFSET = 182000000000;
  let id = (Date.now() + OFFSET).toString();
  if (id.length < 16) {
    id =
      id +
      Math.floor(Math.random() * Math.pow(10, 16 - id.length))
        .toString()
        .padStart(16 - id.length, "0");
  } else if (id.length > 16) {
    id = id.slice(0, 16);
  }
  return id;
}
