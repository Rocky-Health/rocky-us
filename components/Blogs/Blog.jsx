"use client";
import CustomImage from "@/components/utils/CustomImage";
import Link from "next/link";
import { useState } from "react";

// SSR-safe plain-text extraction. Runs during server render/prerender too, so
// it must not touch `document`. Strip HTML tags with a regex and decode the
// handful of entities WordPress emits in titles/excerpts.
function getText(html) {
  if (!html) return "";
  // Browser: use the DOM for accurate entity/tag handling.
  if (typeof document !== "undefined") {
    var divContainer = document.createElement("div");
    divContainer.innerHTML = html;
    return divContainer.textContent || divContainer.innerText || "";
  }
  // Server (SSR): strip tags and decode common entities without the DOM.
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const Blog = ({ blog }) => {
  const [imageError, setImageError] = useState(false);
  const defaultImage = "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

  // Extract reading time from Twitter meta data if available
  const getReadingTime = () => {
    if (blog.yoast_head_json?.twitter_misc?.["Est. reading time"]) {
      return blog.yoast_head_json.twitter_misc["Est. reading time"] + " read";
    }
    return "4 mins read"; // Default fallback
  };

  // Get featured image URL
  const getFeaturedImageUrl = () => {
    if (imageError) {
      return defaultImage;
    }

    if (
      blog._embedded &&
      blog._embedded["wp:featuredmedia"] &&
      blog._embedded["wp:featuredmedia"][0] &&
      blog._embedded["wp:featuredmedia"][0].source_url
    ) {
      return blog._embedded["wp:featuredmedia"][0].source_url;
    }

    // Check for image in yoast_head_json as fallback
    if (
      blog.yoast_head_json?.og_image &&
      blog.yoast_head_json.og_image[0]?.url
    ) {
      return blog.yoast_head_json.og_image[0].url;
    }

    return defaultImage; // Default fallback
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get the category name
  const getCategory = () => {
    if (blog.class_list && blog.class_list[7]) {
      return blog.class_list[7].replace("category-", "").replace(/-/g, " ");
    }
    return "";
  };

  return (
    <div
      className="max-w-sm rounded-2xl overflow-hidden bg-white"
      key={blog.id}
    >
      <div className="relative w-full h-60">
        <CustomImage
          src={getFeaturedImageUrl()}
          alt={blog.title?.rendered || "Article thumbnail"}
          className="rounded-xl"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          priority={false}
          onError={handleImageError}
        />
        <span className="absolute top-2 left-2 bg-white text-black text-xs px-3 py-1 rounded-full shadow z-10">
          {getCategory()}
        </span>
      </div>
      <div className="py-4">
        <p className="text-gray-500 text-sm mb-2">
          {new Date(blog.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          • {getReadingTime()}
        </p>
        <Link href={`/blog/` + blog.slug}>
          <h2 className="text-lg font-semibold leading-snug mb-2">
            {getText(blog.title.rendered)}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm">
          {getText(blog.content.rendered).slice(0, 75) +
            (getText(blog.content.rendered).length > 75 ? "..." : "")}
        </p>
      </div>
    </div>
  );
};

export default Blog;