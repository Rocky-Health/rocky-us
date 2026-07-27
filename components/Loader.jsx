"use client";
import { DotsLoader } from "react-loaders-kit";

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-50">
      <div className="absolute backdrop-blur-[1px] flex items-center justify-center left-0 right-0 top-0 bottom-0 z-50">
        <DotsLoader size={50} loading={true} color={"#fff"} />
      </div>
    </div>
  );
};

export default Loader;
