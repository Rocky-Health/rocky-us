"use client";
import Image from "next/image";
import { useState } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CustomImage = ({ src, alt = "Image", className, ...props }) => {
  const [isLoading, setLoading] = useState(true);

  // Priority images are LCP candidates: skip the blur-in transition so the
  // paint isn't delayed waiting for hydration + onLoad (PSI measured ~770ms
  // element render delay from this effect). Final appearance is identical —
  // only the loading transition is dropped.
  if (props.priority) {
    return (
      <Image
        src={src}
        alt={alt}
        className={cn(
          "object-cover duration-500 ease-in-out scale-100 blur-0 sepia-0",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={cn(
        "object-cover duration-500 ease-in-out",
        isLoading ? "scale-110 blur-3xl sepia" : "scale-100 blur-0 sepia-0",
        className // Merge additional styles from props
      )}
      onLoad={() => setLoading(false)}
      {...props}
    />
  );
};

export default CustomImage;
