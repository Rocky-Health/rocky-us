import { logger } from "@/utils/devLogger";

export async function getPosts() {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/wp-json/wp/v2/posts?_embed`,
      {
        headers: {
          Authorization: process.env.ADMIN_TOKEN,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Authentication error: Please check your API credentials"
        );
      } else if (response.status === 404) {
        throw new Error("API endpoint not found: Please check your BASE_URL");
      } else if (response.status >= 500) {
        throw new Error(
          "Server error: The WordPress server is experiencing issues"
        );
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error fetching posts:", error);
    throw error;
  }
}

// Fetch a single published post by slug (server-side). Returns the post
// object, null when no post matches the slug, or throws on a transport error.
export async function getPostBySlug(slug) {
  if (!slug) {
    return null;
  }

  const response = await fetch(
    `${process.env.BASE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed=true`,
    {
      headers: {
        Authorization: process.env.ADMIN_TOKEN,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0];
}

// Fetch related posts for a category (server-side). Falls back to an empty
// array on any error so the article still renders without related content.
export async function getRelatedPosts({ category, perPage = 6 } = {}) {
  try {
    const params = new URLSearchParams({
      _embed: "true",
      per_page: String(perPage),
    });

    if (category != null && category !== "") {
      params.set("categories", category);
    }

    const response = await fetch(
      `${process.env.BASE_URL}/wp-json/wp/v2/posts?${params.toString()}`,
      {
        headers: {
          Authorization: process.env.ADMIN_TOKEN,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logger.error("Error fetching related posts:", error);
    return [];
  }
}
