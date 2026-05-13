"use client"
import Link from "next/link";
import { FaArrowRightLong, FaPlay, FaPause } from "react-icons/fa6";
import { useRef, useState } from "react";
import ProudPartner from "../ProudPartner";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const VideoCover = ({ data }) => {

    const [isPlaying, setIsPlaying] = useState(true); // Default to playing since autoplay is true
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-20 items-center">
      <div>
        <h6 className="text-[16px] md:text-[20px] leading-[16px] md:leading-[30px] md:tracking-[-0.02em] mb-2 font-[400] font-poppins">
          {data.title}
        </h6>
        <h1 className="md:max-w-[300px] text-[32px] lg:text-[48px] headers-font leading-[36.8px] md:leading-[53.52px] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] mb-4 md:mb-8 capitalize">
          {data.subtitle}
        </h1>
        {data.note && (
          <div
            className="text-[14px] md:text-[16px] md:tracking-[-0.02em] mb-[24px] md:mb-[40px] w-[300px] md:w-[390px] h-[58px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.note) }}
          ></div>
        )}
        <div className="flex flex-col lg:flex-row gap-2">
          {data.buttons.map((button, index) => (
            <Link
              key={index}
              href={button.href}
              className={`h-11 md:px-[24px] py-3 md:py-[11.5px] rounded-[64px] flex items-center space-x-2 transition justify-center w-full ${
                button.width
              }  ${
                button.primary
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-white border-solid border border-black text-black hover:bg-gray-100"
              }`}
            >
              <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
                {button.text}
              </span>
              <FaArrowRightLong />
            </Link>
          ))}
        </div>


         <div className="hidden md:block">
          {data.proudPartner && (
            <>
              <br />
              <br />
              <ProudPartner section />
            </>
          )}
        </div>
      </div>
      <div
        className={`relative overflow-hidden rounded-[16px] w-full h-[375px] ${
          data.videoHeight || "md:h-[460px]"
        } `}
      >
       <video
          ref={videoRef}
          loop
          muted
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-[16px]"
        >
          <source src={data.url} type="video/mp4" />
        </video>
        {/* <button
          onClick={togglePlay}
          className="absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
        </button> */}
      </div>
    </div>
  );
};

export default VideoCover;
