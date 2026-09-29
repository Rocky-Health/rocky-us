import { NextResponse } from "next/server";
import axios from "axios";
import { logger, redactSensitive } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;

export async function GET(request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { success: true, data: [], total: 0 },
      { status: 200 }
    );
  }

  try {
    const headers = { Authorization: process.env.ADMIN_TOKEN };

    const searchResponse = await axios.get(`${BASE_URL}/wp-json/wp/v2/search`, {
      params: {
        search: query,
        per_page: 100,
        _embed: true,
      },
      headers,
    });

    const resultsMap = new Map();
    searchResponse.data.forEach((item) => {
      resultsMap.set(item.id, {
        ...item,
        object_type: item.subtype || item.type,
      });
    });

    const contentTypeIds = {
      post: searchResponse.data
        .filter((item) => item.subtype === "post")
        .map((item) => item.id),
      page: searchResponse.data
        .filter((item) => item.subtype === "page")
        .map((item) => item.id),
      product: searchResponse.data
        .filter((item) => item.subtype === "product")
        .map((item) => item.id),
    };

    const fetchPromises = [];

    if (contentTypeIds.post.length > 0) {
      fetchPromises.push(
        axios
          .get(`${BASE_URL}/wp-json/wp/v2/posts`, {
            params: {
              include: contentTypeIds.post.join(","),
              _embed: true,
              per_page: contentTypeIds.post.length,
            },
            headers,
          })
          .then((response) => {
            response.data.forEach((post) => {
              if (resultsMap.has(post.id)) {
                let imageUrl = null;

                if (post._embedded?.["wp:featuredmedia"]?.[0]) {
                  const featuredMedia = post._embedded["wp:featuredmedia"][0];
                  if (featuredMedia.source_url) {
                    imageUrl = featuredMedia.source_url;
                  } else if (featuredMedia.media_details?.sizes) {
                    const sizes = featuredMedia.media_details.sizes;
                    imageUrl =
                      sizes.medium?.source_url || sizes.full?.source_url;
                  }
                }

                if (!imageUrl && post.content?.rendered) {
                  const imgMatch = post.content.rendered.match(
                    /<img[^>]+src="([^">]+)"/
                  );
                  if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                  }
                }

                resultsMap.set(post.id, {
                  ...resultsMap.get(post.id),
                  ...post,
                  image: imageUrl,
                });
              }
            });
          })
          .catch((error) => logger.error("Error fetching post details:", error))
      );
    }

    if (contentTypeIds.page.length > 0) {
      fetchPromises.push(
        axios
          .get(`${BASE_URL}/wp-json/wp/v2/pages`, {
            params: {
              include: contentTypeIds.page.join(","),
              _embed: true,
              per_page: contentTypeIds.page.length,
            },
            headers,
          })
          .then((response) => {
            if (response.data.length > 0) {
              logger.log(
                "Page data example:",
                JSON.stringify(redactSensitive(response.data[0])).substring(
                  0,
                  500
                )
              );
            }

            response.data.forEach((page) => {
              if (resultsMap.has(page.id)) {
                let imageUrl = null;

                if (page._embedded?.["wp:featuredmedia"]?.[0]) {
                  const featuredMedia = page._embedded["wp:featuredmedia"][0];
                  if (featuredMedia.source_url) {
                    imageUrl = featuredMedia.source_url;
                  } else if (featuredMedia.media_details?.sizes) {
                    const sizes = featuredMedia.media_details.sizes;
                    imageUrl =
                      sizes.medium?.source_url || sizes.full?.source_url;
                  }
                }

                if (!imageUrl && page.content?.rendered) {
                  const imgMatch = page.content.rendered.match(
                    /<img[^>]+src="([^">]+)"/
                  );
                  if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                  }
                }

                resultsMap.set(page.id, {
                  ...resultsMap.get(page.id),
                  ...page,
                  image: imageUrl,
                });
              }
            });
          })
          .catch((error) => logger.error("Error fetching page details:", error))
      );
    }

    if (contentTypeIds.product.length > 0) {
      fetchPromises.push(
        axios
          .get(`${BASE_URL}/wp-json/wc/v3/products`, {
            params: {
              include: contentTypeIds.product.join(","),
              per_page: contentTypeIds.product.length,
            },
            headers,
          })
          .then((response) => {
            if (response.data.length > 0) {
              logger.log(
                "Product data example:",
                JSON.stringify(redactSensitive(response.data[0])).substring(
                  0,
                  500
                )
              );
            }

            response.data.forEach((product) => {
              if (resultsMap.has(product.id)) {
                resultsMap.set(product.id, {
                  ...resultsMap.get(product.id),
                  ...product,
                  image: product.images?.[0]?.src || null,
                });
              }
            });
          })
          .catch((error) =>
            logger.error("Error fetching product details:", error)
          )
      );
    }

    await Promise.all(fetchPromises);

    const enhancedResults = searchResponse.data.map((item) =>
      resultsMap.get(item.id)
    );
    logger.log(
      `Enhanced ${enhancedResults.length} results, ${
        enhancedResults.filter((r) => r.image).length
      } with images`
    );

    return NextResponse.json({
      success: true,
      data: enhancedResults,
      total: enhancedResults.length,
    });
  } catch (error) {
    logger.error("Error searching:", error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error:
          error.response?.data?.message || "Search failed. Please try again.",
      },
      { status: error.response?.status || 500 }
    );
  }
}
