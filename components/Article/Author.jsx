"use client";
import { useState } from "react";

const Author = ({
  name,
  date = "",
  readTime = "",
  avatarUrl,
  avatarSize = "h-16 w-16",
  full_show = false,
  desc = ""
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const defaultAvatar = "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

  const handleAvatarError = (e) => {
    setAvatarError(true);
  };

  // Normalize avatar URL: accept either a string or an object { url, url2x }
  const normalizedPrimary =
    avatarUrl && typeof avatarUrl === "object"
      ? avatarUrl.url || avatarUrl.url2x
      : avatarUrl;
  const normalized2x =
    avatarUrl && typeof avatarUrl === "object"
      ? avatarUrl.url2x || avatarUrl.url
      : undefined;

  const avatarSrc = avatarError || !normalizedPrimary ? defaultAvatar : normalizedPrimary;
  const avatarSrcSet =
    !avatarError && normalized2x && normalized2x !== normalizedPrimary
      ? `${normalizedPrimary} 1x, ${normalized2x} 2x`
      : undefined;

  return (
    <div className="flex items-center justify-center lg:justify-start w-full lg:w-[770px] mt-4 mb-[40px] gap-4 border border-gray-200 rounded-2xl p-4 lg:p-6">
      <div className={`flex-shrink-0 ${avatarSize}`}>
        <img
          src={avatarSrc}
          srcSet={avatarSrcSet}
          alt={name}
          className="rounded-full h-full w-full object-cover"
          onError={handleAvatarError}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
        </div>

       {full_show ? (<div className="text-gray-500 mt-3 text-sm w-full">
          <span>
            {desc}
          </span>
          
        </div>) : ( <div className="text-gray-500 text-sm">
          <span>
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {readTime && <span> • {readTime}</span>}
        </div>)}
      </div>
    </div>
  );
};

export default Author;
