import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logger, redactSensitive } from "@/utils/devLogger";

export async function GET(req) {
  try {
    logger.log("API: Starting portal URL fetch process");

    // Check if user is logged in
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      logger.log("API: User not logged in, no userId found in cookies");
      return NextResponse.json(
        { success: false, error: "User not logged in" },
        { status: 401 }
      );
    }

    logger.log("API: User is logged in with ID:", userId);

    // CRM and Portal URLs from environment variables
    const crmHostUrl = process.env.CRM_HOST;
    const portalHostUrl = process.env.PORTAL_HOST;

    logger.log("API: Environment variables check:", {
      crmHostUrl: crmHostUrl ? "✓ Set" : "✗ Missing",
      portalHostUrl: portalHostUrl ? "✓ Set" : "✗ Missing",
    });

    // If environment variables are not set, return an error
    if (!crmHostUrl || !portalHostUrl) {
      const missingVars = [];
      if (!crmHostUrl) missingVars.push("CRM_HOST");
      if (!portalHostUrl) missingVars.push("PORTAL_HOST");

      const errorMsg = `Missing required environment variables: ${missingVars.join(
        ", "
      )}`;
      logger.error("API:", errorMsg);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const authTokenFromUrl = url.searchParams.get("authToken");

    const authToken = authTokenFromUrl || cookieStore.get("authToken")?.value;
    if (!authToken) {
      logger.error("API: authToken not found in URL params or cookies");
      return NextResponse.json(
        { success: false, error: "User authentication token not found" },
        { status: 401 }
      );
    }

    // Decode the user's Basic auth token into email and password
    let apiUsername, apiPassword;
    try {
      const base64Credentials = authToken.startsWith("Basic ")
        ? authToken.substring(6)
        : authToken;
      const credentials = Buffer.from(base64Credentials, "base64").toString();
      // Split on the first colon only, passwords may contain colons
      const sepIndex = credentials.indexOf(":");
      const username = sepIndex > 0 ? credentials.slice(0, sepIndex) : "";
      const password = sepIndex > 0 ? credentials.slice(sepIndex + 1) : "";
      if (!username || !password) {
        throw new Error("Invalid credentials format");
      }
      apiUsername = username;
      apiPassword = password;
      logger.log("API: Successfully extracted credentials from authToken", {
        hasUsername: !!apiUsername,
        hasPassword: !!apiPassword,
      });
    } catch (decodeError) {
      logger.error("API: Failed to decode authToken:", decodeError);
      return NextResponse.json(
        { success: false, error: "Failed to decode authentication token" },
        { status: 401 }
      );
    }

    // Extract query parameters, redirectPath wins over redirectPage
    const redirectPath = url.searchParams.get("redirectPath");
    const redirectPage = url.searchParams.get("redirectPage") || "dashboard";
    const redirectValue =
      redirectPath != null && redirectPath !== "" ? redirectPath : redirectPage;
    logger.log(
      "API: Redirect set to:",
      redirectValue,
      redirectPath != null ? "(full path)" : "(page)"
    );

    logger.log("API: Attempting CRM authentication");
    logger.log(`API: CRM endpoint: ${crmHostUrl}/api/crm-user/login`);

    // Step 1: Authenticate with CRM API as the actual user
    let loginResponse;
    try {
      loginResponse = await fetch(`${crmHostUrl}/api/crm-user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "is-patient-portal": "true",
        },
        body: JSON.stringify({
          email: apiUsername,
          password: apiPassword,
        }),
      });

      logger.log("API: CRM auth response status:", loginResponse.status);

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        logger.error("API: CRM authentication failed:", errorText);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to authenticate with CRM: ${loginResponse.status} ${loginResponse.statusText}`,
            details: errorText,
          },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      logger.error("API: CRM fetch error:", fetchError.message);
      return NextResponse.json(
        {
          success: false,
          error: `Error connecting to CRM: ${fetchError.message}`,
        },
        { status: 500 }
      );
    }

    let loginData;
    try {
      loginData = await loginResponse.json();
      logger.log(
        "API: CRM authentication response received",
        loginData.status ? "successfully" : "with errors"
      );
    } catch (jsonError) {
      logger.error("API: Failed to parse CRM response:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to parse CRM response: ${jsonError.message}`,
        },
        { status: 500 }
      );
    }

    if (!loginData?.status || !loginData?.token) {
      logger.error(
        "API: CRM authentication token not found",
        redactSensitive(loginData)
      );
      return NextResponse.json(
        {
          success: false,
          error: "CRM authentication token not found",
          details: loginData,
        },
        { status: 500 }
      );
    }

    const token = loginData.token;
    const wpUserId = loginData.data.wp_user_id;
    const crmUserId = loginData.data.crm_user_id;

    cookieStore.set("userId", wpUserId.toString());
    cookieStore.set("crm_user_id", crmUserId.toString());

    logger.log("API: Successfully obtained CRM auth token");

    // Step 2: Get auto-login link for the portal
    logger.log("API: Requesting portal auto-login link");
    logger.log(
      `API: Portal endpoint: ${portalHostUrl}/api/user/auto-login-link`
    );

    let portalResponse;
    try {
      // Construct query parameters for GET request
      const queryParams = new URLSearchParams({
        wp_user_id: wpUserId,
        crm_user_id: crmUserId,
        expiration_hour: 1,
        redirect: redirectValue,
      });

      portalResponse = await fetch(
        `${portalHostUrl}/api/user/auto-login-link?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CRM-User-ID": crmUserId.toString(),
          },
        }
      );

      logger.log("API: Portal auth response status:", portalResponse.status);

      if (!portalResponse.ok) {
        const errorText = await portalResponse.text();
        logger.error("API: Portal auto-login failed:", errorText);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to get portal auto-login link: ${portalResponse.status} ${portalResponse.statusText}`,
            details: errorText,
          },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      logger.error("API: Portal fetch error:", fetchError.message);
      return NextResponse.json(
        {
          success: false,
          error: `Error connecting to portal: ${fetchError.message}`,
        },
        { status: 500 }
      );
    }

    let portalData;
    try {
      portalData = await portalResponse.json();
      logger.log(
        "API: Portal auto-login response received",
        portalData.success ? "successfully" : "with errors"
      );
    } catch (jsonError) {
      logger.error("API: Failed to parse portal response:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to parse portal response: ${jsonError.message}`,
        },
        { status: 500 }
      );
    }

    if (!portalData.success || !portalData.data?.link) {
      logger.error(
        "API: Portal auto-login link not found",
        redactSensitive(portalData)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Portal auto-login link not found",
          details: portalData,
        },
        { status: 500 }
      );
    }

    // Verify that the returned user ID matches the current user
    if (
      portalData.data.wp_user_id &&
      portalData.data.wp_user_id.toString() !== wpUserId.toString()
    ) {
      logger.error("API: User ID mismatch", {
        expected: wpUserId,
        received: portalData.data.wp_user_id,
      });
      return NextResponse.json(
        {
          success: false,
          error: "User ID mismatch",
          details: {
            expected: wpUserId,
            received: portalData.data.wp_user_id,
          },
        },
        { status: 500 }
      );
    }

    logger.log("API: Successfully obtained portal auto-login URL");

    // Force the returned link onto the portal host and append auth params
    const portalLink = portalData.data.link;
    const portalBase = new URL(portalHostUrl);
    const parsedLink = new URL(portalLink, portalBase.origin);
    const pathAndSearch =
      parsedLink.pathname + parsedLink.search + (parsedLink.hash || "");
    const portalUrl = new URL(pathAndSearch, portalBase.origin);
    portalUrl.searchParams.set("crm_user_id", crmUserId.toString());
    portalUrl.searchParams.set("wp_user_id", wpUserId.toString());
    portalUrl.searchParams.set("token", token);
    const finalUrl = portalUrl.toString();

    // Return the auto-login URL
    return NextResponse.json({
      success: true,
      url: finalUrl,
    });
  } catch (error) {
    logger.error("API: Error in portal login API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
