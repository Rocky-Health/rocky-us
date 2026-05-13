"use client";

import { useState } from "react";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export default function BlogContent({
  title,
  author,
  category,
  content,
  featuredImage,
  excerpt,
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const renderImage = () => {
    if (featuredImage && !imageError) {
      return (
        <div className="relative mb-6">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse aspect-video"></div>
          )}

          <img
            src={featuredImage}
            alt={title}
            className={`w-full rounded-lg transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        </div>
      );
    }

    return (
      <div className="bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-mono text-sm aspect-video mb-6">
        16:9
      </div>
    );
  };

  const renderContent = () => {
    if (!content) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No content available</p>
        </div>
      );
    }

    // For now, we'll render the HTML content as-is
    // In a production app, you might want to sanitize this HTML
    return (
      <div
        className="wordpress-content max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  };

  return (
    <article className="bg-white rounded-lg">
      {/* Featured Image */}
      {renderImage()}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {title}
      </h1>

      {/* Meta Information */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
        <span>Written by {author}</span>
        <span>•</span>
        <span>in {category}</span>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700">{excerpt}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="wordpress-content max-w-none">{renderContent()}</div>
    </article>
  );
}
