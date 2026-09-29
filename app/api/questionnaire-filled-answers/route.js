import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import axios from "axios";

const crmApi = axios.create({
  baseURL: process.env.CRM_HOST || "https://crm.myrocky.com",
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

    logger.log("[questionnaire-filled-answers] Backend - CRM response:", {
      status: response.status,
      ok: response.ok,
      data: response.data,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    logger.error(
      "[questionnaire-filled-answers] Error:",
      error?.response?.data || error?.message || error
    );
    return NextResponse.json(
      { error: true, msg: error?.response?.data?.message || error?.message },
      { status: error?.response?.status || 500 }
    );
  }
}
