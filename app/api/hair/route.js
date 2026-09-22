import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import { randomBytes } from "crypto";
import https from "https";
import axios from "axios";

const crmApi = axios.create({
  baseURL: "https://crm.myrocky.com/api",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 60000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

async function getEntrykey() {
  try {
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get("hair_entrykey");
    return existingCookie?.value || `hairq-${randomBytes(8).toString("hex")}`;
  } catch (error) {
    logger.warn("Cookie reading error:", error);
    return `hairq-${randomBytes(8).toString("hex")}`;
  }
}

// New helper function to get user ID from cookies
async function getUserId() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");
    return userId?.value ? parseInt(userId.value) : 887; // Fallback to 887 if no user ID in cookies
  } catch (error) {
    logger.warn("Error getting user ID from cookies:", error);
    return 887; // Fallback to 887 if there's an error
  }
}

async function getUserDataFromCookies() {
  try {
    const cookieStore = await cookies();
    const fName = cookieStore.get("displayName")?.value || "";
    const lName = cookieStore.get("lastName")?.value || "";
    const email = cookieStore.get("userEmail")?.value
      ? decodeURIComponent(cookieStore.get("userEmail").value)
      : "";
    const phone = cookieStore.get("phone")?.value || "";
    const dob = cookieStore.get("DOB")?.value || "";
    const province = cookieStore.get("province")?.value || "";

    return {
      fName,
      lName,
      email,
      phone,
      dob,
      province,
    };
  } catch (error) {
    logger.warn("Error getting user data from cookies:", error);
    return {
      fName: "",
      lName: "",
      email: "",
      phone: "",
      dob: "",
      province: "",
    };
  }
}

export async function GET() {
  const entrykey = await getEntrykey();

  const data = { message: "Success", entrykey };

  const response = NextResponse.json(data);
  response.cookies.set("hair_entrykey", entrykey, {
    domain: "myrocky.com",
    path: "/",
    expires: new Date(Date.now() + 1800 * 1000),
    httpOnly: false,
    sameSite: "Lax",
  });

  return response;
}

export async function POST(req) {
  try {
    const entrykey = await getEntrykey();
    const userId = await getUserId();
    const userData = await getUserDataFromCookies();

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: true,
          msg: "File uploads should be handled via frontend S3 upload",
        },
        { status: 400 }
      );
    }

    const rawData = await req.json();

    if (Object.keys(rawData).length === 0) {
      return NextResponse.json(
        { error: true, msg: "Blank Data" },
        { status: 400 }
      );
    }

    const data = {
      form: {},
      hair_entrykey: entrykey,
      timestamp: Math.floor(Date.now() / 1000),
      entry_saved: false,
      form_id: rawData.form_id || 1,
      error: false,
      id: rawData.id || "",
      token: rawData.token || "",
      stage: rawData.stage || "consultation-after-checkout",
      page_step: rawData.page_step || 1,
      completion_state: rawData.completion_state || "Partial",
      completion_percentage: rawData.completion_percentage || 10,
      source_site: rawData.source_site || process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
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
      "hair_entrykey",
      "id",
      "token",
      "stage",
      "page_step",
      "completion_state",
      "source_site",
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

    if (userData.fName) data.form["130_3"] = userData.fName;
    if (userData.lName) data.form["130_6"] = userData.lName;
    if (userData.email) data.form[131] = userData.email;
    if (userData.phone) data.form[132] = userData.phone;
    if (userData.dob) data.form[158] = userData.dob;
    if (userData.province) data.form["161_4"] = userData.province;

    try {
      const crmResult = await postHairQuestionnaireDataToCRM(data);
      Object.assign(data, crmResult);
    } catch (crmError) {
      logger.error("CRM Submission Error:", crmError);
      data.error = true;
      data.error_message = crmError.message || "CRM submission failed";
    }

    const response = NextResponse.json(data);
    response.cookies.set("hair_entrykey", entrykey, {
      domain: "myrocky.com",
      path: "/",
      expires: new Date(Date.now() + 1800 * 1000),
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    logger.error("API route error:", error);
    return NextResponse.json(
      {
        error: true,
        msg: "Internal server error",
      },
      { status: 500 }
    );
  }
}

async function postHairQuestionnaireDataToCRM(data) {
  const crmUrlCreate = "/get-wp-gravity-forms-data";
  const crmUrlPartial = "/get-wp-gravity-forms-partial-entry-data";

  let apiEndpoint = crmUrlCreate;
  if (data.id && data.token) {
    apiEndpoint = crmUrlPartial;
  }

  const postData = {
    timestamp: Math.floor(Date.now() / 1000),
    entry_saved: false,
    form_id: data.form_id || 1,
    error: false,
    stage: data.stage || "consultation-after-checkout",
    page_step: parseInt(data.page_step) || 1,
    completion_state: data.completion_state || "Partial",
    completion_percentage: parseInt(data.completion_percentage) || 10,
    source_site: data.source_site || process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
    wp_user_id: data.wp_user_id || (await getUserId()),
    created_by: data.created_by || (await getUserId()),
    hair_entrykey: data.hair_entrykey || "",
  };

  if (data.id) {
    postData.id = data.id;
  }

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
    // Metadata only. The payload is the patient's questionnaire answers.
    logger.log("CRM Submission Payload:", {
      endpoint: apiEndpoint,
      sync: postData.sync,
      form_id: postData.form_id,
      stage: postData.stage,
      completion_state: postData.completion_state,
      field_count: Object.keys(postData).length,
      has_entry_id: !!postData.id,
    });

    const response = await crmApi.post(apiEndpoint, postData, {
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    });

    logger.log("CRM Response:", {
      status: response.status,
      success: !!response.data?.success,
      has_entry_id: !!response.data?.data?.wp_entry_id,
    });

    if (response.data && response.data.success) {
      return {
        crm_db_id: response.data.data?.crm_db_id || null,
        entry_saved: true,
        id: response.data.data?.wp_entry_id || data.id || "",
        token: response.data.data?.token || data.token || "",
        hair_entrykey: data.hair_entrykey,
        crm_post_response_message:
          response.data.message || "Submission successful",
      };
    }

    throw new Error(response.data?.message || "Unknown CRM submission error");
  } catch (error) {
    logger.error("CRM API fetch error:", {
      message: error.message,
      name: error.name,
      status: error.response?.status,
      crm_message: error.response?.data?.message,
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
