import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import https from "https";
import axios from "axios";

const crmApi = axios.create({
  baseURL: process.env.CRM_HOST || "https://crm.myrocky.com",
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { wp_entry_id, token, patient_token } = body;

    if (!wp_entry_id || !token || !patient_token) {
      return NextResponse.json(
        { error: true, msg: "Missing wp_entry_id, token, or patient_token" },
        { status: 400 }
      );
    }

    const response = await crmApi.post(
      "api/user/consultations/questionnaire-filled-answers",
      { wp_entry_id, token },
      {
        headers: {
          Authorization: `Bearer ${patient_token}`,
          "is-patient-portal": "true",
        },
      }
    );

    // The CRM body is the patient's filled answers, so log shape only.
    logger.log("[questionnaire-filled-answers] Backend - CRM response:", {
      status: response.status,
      has_data: !!response.data,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    logger.error("[questionnaire-filled-answers] Error:", {
      message: error?.message,
      status: error?.response?.status,
    });
    return NextResponse.json(
      { error: true, msg: error?.response?.data?.message || error?.message },
      { status: error?.response?.status || 500 }
    );
  }
}
