import Image from "next/image";
import React from "react";

const PodcastHeader = () => {
  return (
    <header className="flex flex-col gap-4 items-center">
      <h1 className="text-[#000000] text-[32px] md:text-6xl headers-font font-[550] leading-[115%] headers-font">
        Useful Health Podcasts
      </h1>
      <p className="text-[#000000] text-base md:text-xl">
        Actionable health insights helping Americans live stronger, healthier, happier
        lives.
      </p>
      <button
        className="px-24 py-3 w-full text-sm font-medium text-white bg-black rounded-full transition-all md:w-fit md:block hover:bg-opacity-90"
        aria-label="Listen to podcasts now"
      >
        Listen Now
      </button>
      <p className="text-base text-black md:text-xl">Available on</p>
      <div className="flex gap-4">
        <Image
          src="/podcast/spotify.png"
          alt="Spotify"
          width={32}
          height={32}
        />
        <Image src="/podcast/radio.png" alt="Spotify" width={32} height={32} />
        <Image
          src="/podcast/podcast-icon.png"
          alt="Spotify"
          width={32}
          height={32}
        />
        <Image
          src="/podcast/soundcloud.png"
          alt="Spotify"
          width={32}
          height={32}
        />
      </div>
    </header>
  );
};

export default PodcastHeader;
