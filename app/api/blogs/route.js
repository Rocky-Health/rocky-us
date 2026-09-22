import https from "https";
import axios from "axios";
import { logger } from "@/utils/devLogger";

export async function GET(req) {
  try {
    logger.log("API: Blogs endpoint called");
    logger.log("API: BASE_URL exists:", !!process.env.BASE_URL);
    logger.log("API: ADMIN_TOKEN exists:", !!process.env.ADMIN_TOKEN);

    const page = req.nextUrl.searchParams.get("page");
    const categories = req.nextUrl.searchParams.get("categories");
    const per_page = req.nextUrl.searchParams.get("per_page");

    logger.log(
      "API: Request params - page:",
      page,
      "categories:",
      categories,
      "per_page:",
      per_page
    );

    var params = {
      _embed: true,
      per_page: per_page == undefined ? 12 : per_page,
      page: page == undefined ? 1 : page,
    };

    if (categories != undefined) {
      params["categories"] = categories;
    }

    logger.log("API: WordPress API params:", params);

    if (!process.env.BASE_URL) {
      logger.error("API: BASE_URL not configured");
      return new Response(
        JSON.stringify({ error: "BASE_URL not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.ADMIN_TOKEN) {
      logger.error("API: ADMIN_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "ADMIN_TOKEN not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiUrl = process.env.BASE_URL + "/wp-json/wp/v2/posts";
    logger.log("API: Calling WordPress API:", apiUrl);

    const blogs = await axios.get(apiUrl, {
      params: params,
      headers: {
        Authorization: process.env.ADMIN_TOKEN,
      },
      timeout: 10000, // 10 second timeout
    });

    logger.log("API: WordPress response status:", blogs.status);
    logger.log("API: WordPress response headers:", blogs.headers);
    logger.log("API: WordPress response data length:", blogs.data?.length);
    logger.log("API: First blog:", blogs.data?.[0] ? "exists" : "missing");

    const totalPages = blogs.headers["x-wp-totalpages"] || blogs.headers["X-WP-TotalPages"] || "1";
    logger.log("API: Total pages:", totalPages);

    return new Response(JSON.stringify(blogs.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        TotalPages: totalPages,
        "X-Total-Pages": totalPages,
      },
    });
  } catch (error) {
    logger.error("API: Error in blogs endpoint:", error);
    logger.error("API: Error message:", error.message);
    logger.error("API: Error response:", error.response?.data);
    logger.error("API: Error status:", error.response?.status);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch blogs",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
