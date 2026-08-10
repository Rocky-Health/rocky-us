"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toBackupHost } from "@/utils/blogImageFallback";

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
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  // Once we fall back to the backup host, load it directly (unoptimized) so a
  // flaky image optimizer can't 502 on it a second time.
  const [useBackup, setUseBackup] = useState(false);
  const triedBackup = useRef(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
    setUseBackup(false);
    triedBackup.current = false;
  }, [src]);

  const handleError = () => {
    const backup = toBackupHost(imgSrc);
    if (!triedBackup.current && backup && backup !== imgSrc) {
      triedBackup.current = true;
      setUseBackup(true);
      setImgSrc(backup);
      return;
    }
    setFailed(true);
  };

  const finalSrc = failed || !imgSrc ? defaultImage : imgSrc;

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
          unoptimized={useBackup || !isOptimizable(finalSrc)}
          className="w-full h-full object-cover rounded-[12px] sm:rounded-[20px] lg:rounded-[35px]"
          onError={handleError}
          alt={alt || "Blog featured image"}
        />
      )}
    </div>
  );
};

export default ArticleImg;
