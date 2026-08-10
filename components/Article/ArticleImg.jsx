"use client";
import Image from "next/image";
import { useState } from "react";

const defaultImage =
  "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

// Only hosts present in next.config.mjs images.remotePatterns may go through
// the optimizer; anything unexpected renders unoptimized instead of throwing.
const isOptimizable = (src) => {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return (
      host === "myrocky.com" ||
      host.endsWith(".myrocky.com") ||
      host === "myrocky.b-cdn.net" ||
      host === "www.shutterstock.com"
    );
  } catch {
    return false;
  }
};

const ArticleImg = ({ src, loading = false, alt }) => {
  const [failed, setFailed] = useState(false);
  const finalSrc = failed || !src ? defaultImage : src;

  return (
    <div className=" w-full mt-10 mb-[56px] lg:h-[666px] sm:h-[250px] rounded-[12px] sm:rounded-[20px] lg:rounded-[35px] overflow-hidden">
      {loading ? (
        <div className="h-60 bg-gray-200 animate-pulse w-full"></div>
      ) : (
        <Image
          src={finalSrc}
          width={1200}
          height={675}
          priority
          sizes="(max-width: 1024px) 100vw, 1184px"
          unoptimized={!isOptimizable(finalSrc)}
          className="w-full h-full object-cover rounded-[12px] sm:rounded-[20px] lg:rounded-[35px]"
          onError={() => setFailed(true)}
          alt={alt || "Blog featured image"}
        />
      )}
    </div>
  );
};

export default ArticleImg;
