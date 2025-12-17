import { logger } from "@/utils/devLogger";

function getHeaders() {
  // Only include Authorization header on server-side
  if (typeof window === "undefined") {
    return {
      Accept: "application/json",
      Authorization: process.env.ADMIN_TOKEN,
    };
  }
  // Client-side: no Authorization header needed
  return {
    Accept: "application/json",
  };
}

export const blogService = {
  async getBlogs(page = 1, categories = null) {
    try {
      const isServerSide = typeof window === "undefined";
      let url;

      if (isServerSide) {
        // Server-side: Call WordPress API directly
        const baseUrl = process.env.BASE_URL || "https://www.myrocky.com";
        url = `${baseUrl}/wp-json/wp/v2/posts?page=${page}&per_page=12&_embed=true`;
        if (categories && categories !== "0") {
          url += `&categories=${categories}`;
        }
      } else {
        // Client-side: Call Next.js API route
        url = `/api/blogs?page=${page}&_embed`;
        if (categories && categories !== "0") {
          url += `&categories=${categories}`;
        }
      }

      const res = await fetch(url, {
        cache: "no-store",
        headers: getHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Authentication error: Please check your API credentials"
          );
        } else if (res.status === 404) {
          throw new Error("API endpoint not found: Please check your BASE_URL");
        } else if (res.status >= 500) {
          throw new Error(
            "Server error: The WordPress server is experiencing issues"
          );
        } else {
          throw new Error(`API request failed with status ${res.status}`);
        }
      }

      const data = await res.json();

      // Check if data is an array or object with blogs property
      const blogsArray = Array.isArray(data) ? data : data.blogs || [];

      const totalPages =
        parseInt(res.headers.get("TotalPages")) ||
        parseInt(res.headers.get("X-Total-Pages")) ||
        parseInt(res.headers.get("x-total-pages")) ||
        parseInt(res.headers.get("x-wp-totalpages")) ||
        data.totalPages ||
        1;

      return {
        blogs: blogsArray,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      logger.error("Error fetching blogs:", error);
      throw error;
    }
  },

  async getAllPageBlogs(currentPage = 1, categories = null) {
    try {
      // Always fetch categories first
      const categoriesData = await this.getBlogCategories();

      const isServerSide = typeof window === "undefined";
      let url;

      if (isServerSide) {
        // Server-side: Call WordPress API directly
        const baseUrl = process.env.BASE_URL || "https://www.myrocky.com";
        url = `${baseUrl}/wp-json/wp/v2/posts?page=${currentPage}&per_page=12&_embed=true`;
        if (categories && categories !== "0") {
          url += `&categories=${categories}`;
        }
      } else {
        // Client-side: Call Next.js API route
        url = `/api/blogs?page=${currentPage}`;
        if (categories && categories !== "0") {
          url += `&categories=${categories}`;
        }
      }

      const res = await fetch(url, {
        cache: "no-store",
        headers: getHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Authentication error: Please check your API credentials"
          );
        } else if (res.status === 404) {
          throw new Error("API endpoint not found: Please check your BASE_URL");
        } else if (res.status >= 500) {
          throw new Error(
            "Server error: The WordPress server is experiencing issues"
          );
        } else {
          throw new Error(`API request failed with status ${res.status}`);
        }
      }

      const data = await res.json();

      // Check if data is an array or object with blogs property
      const blogsArray = Array.isArray(data) ? data : data.blogs || [];

      // Create page numbers array like in BlogsPage.jsx
      const totalPagesCount = parseInt(res.headers.get("TotalPages")) ||
        parseInt(res.headers.get("X-Total-Pages")) ||
        parseInt(res.headers.get("x-total-pages")) ||
        parseInt(res.headers.get("x-wp-totalpages")) ||
        1;

      const pageNumbers = Array.from(
        { length: totalPagesCount },
        (_, index) => index + 1
      );

      return {
        blogs: blogsArray,
        categories: categoriesData,
        totalPages: pageNumbers,
        totalPagesCount: totalPagesCount,
        currentPage: currentPage,
      };
    } catch (error) {
      logger.error("Error fetching all page blogs:", error);
      throw error;
    }
  },

  async getBlogsByCategory(categorySlug, page = 1) {
    try {
      // Get all categories
      const categories = await this.getBlogCategories();
      const category = categories.find((cat) => cat.slug === categorySlug);

      if (!category) {
        throw new Error("Category not found");
      }

      // Fetch blogs for that category
      return await this.getBlogs(page, category.id);
    } catch (error) {
      logger.error("Error fetching blogs by category:", error);
      throw error;
    }
  },

  async getBlogBySlug(slug) {
    try {
      // Direct WordPress API call instead of going through our API route
      const url = `${process.env.BASE_URL || "https://www.myrocky.com"
        }/wp-json/wp/v2/posts?slug=${slug}&_embed=true`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Authorization: process.env.ADMIN_TOKEN || "",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Authentication error: Please check your API credentials"
          );
        } else if (res.status === 404) {
          throw new Error("Blog not found: Please check the slug");
        } else if (res.status >= 500) {
          throw new Error(
            "Server error: The WordPress server is experiencing issues"
          );
        } else {
          throw new Error(`API request failed with status ${res.status}`);
        }
      }

      const data = await res.json();

      // WordPress returns an array, we want the first (and only) item
      if (!data || data.length === 0) {
        throw new Error("Blog not found: Please check the slug");
      }

      return data[0];
    } catch (error) {
      logger.error("Error fetching blog by slug:", error);
      throw error;
    }
  },

  async getBlogCategories() {
    try {
      const isServerSide = typeof window === "undefined";
      let url;

      if (isServerSide) {
        // Server-side: Call WordPress API directly
        const baseUrl = process.env.BASE_URL || "https://www.myrocky.com";
        url = `${baseUrl}/wp-json/wp/v2/categories?per_page=100`;
      } else {
        // Client-side: Call Next.js API route
        url = `/api/BlogCategories`;
      }

      const res = await fetch(url, {
        cache: "no-store",
        headers: getHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Authentication error: Please check your API credentials"
          );
        } else if (res.status === 404) {
          throw new Error("API endpoint not found: Please check your BASE_URL");
        } else if (res.status >= 500) {
          throw new Error(
            "Server error: The WordPress server is experiencing issues"
          );
        } else {
          throw new Error(`API request failed with status ${res.status}`);
        }
      }

      return await res.json();
    } catch (error) {
      logger.error("Error fetching blog categories:", error);
      throw error;
    }
  },
};
