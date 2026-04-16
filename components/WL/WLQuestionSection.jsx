import Image from "next/image";
import Link from "next/link";
import Popup from "./Popup";

const WLQuestionSection = () => {
  return (
    <div className="max-w-[1184px] mx-auto px-5 py-8 md:py-12 sectionWidth:px-0">
      <Link href="/" aria-label="MyRocky Homepage">
        <Image
          src="/ed-prelander-5/rocky-logo.png"
          alt="MyRocky Logo"
          width={81}
          height={30}
          className="mb-3"
        />
      </Link>
      <div className="flex flex-col md:items-center md:flex-row md:justify-between relative">
        {/* Desktop: Image with text overlay */}
        <div className="w-1/2">
          <div className="hidden md:block">
            <div className="w-full relative">
              <img src="/WL/WLhero.jpg" className="rounded-2xl w-[100%]" />
              <div className="absolute bottom-5 right-5 lg:right-10">
                <Popup></Popup>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Reordered - Text, then Age verification, then Image */}
        <div className="flex flex-col justify-center md:hidden">
          <h1 className="font-semibold ">
            Achieve your ideal weight with a breakthrough approach –{" "}
            <span className="text-emerald-500">
              your transformation starts today.
            </span>
          </h1>
          <div className="mb-6 w-full">
            <h3 className="text-[26px] font-[550] text-start">
              Are you over 21?
            </h3>

            <div className="flex flex-col gap-2 mt-6">
              <button className="px-4 py-3 w-full font-medium text-gray-700 rounded-full border border-gray-200 transition duration-200 hover:bg-gray-100">
                Yes
              </button>
              <button className="px-4 py-3 w-full font-medium text-gray-700 rounded-full border border-gray-200 transition duration-200 hover:bg-gray-100">
                No
              </button>
            </div>
          </div>

          <div className="relative w-full">
            <div className="flex items-end justify-end lg:w-1/2 sm:w-full">
              <div className="w-full relative">
                <img
                  src="/WL/WLhero.jpg"
                  className="rounded-2xl mx-auto w-[100%] max-h-full"
                />
                <div className="absolute bottom-[-20px] left-0 right-0 m-auto  w-[297px]">
                  <Popup></Popup>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Age verification section - desktop only */}
        <div className="hidden md:block w-full max-w-md md:w-[400px] md:self-center md:flex-1">
          <h1 className="font-semibold absolute top-0">
            Achieve your ideal weight with a breakthrough approach –{" "}
            <span className="text-emerald-500">
              your transformation starts today.
            </span>
          </h1>

          <div>
            <div className="py-4 border-t border-gray-200 md:border-t-0">
              <h3 className="text-[34px] font-[550]">Are you over 21?</h3>
            </div>

            <div className="mt-6 space-y-3">
              <button className="px-4 py-3 w-full font-medium text-white bg-emerald-500 rounded-full transition duration-200 hover:bg-emerald-600">
                Yes
              </button>
              <button className="px-4 py-3 w-full font-medium text-gray-700 rounded-full border border-gray-200 transition duration-200 hover:bg-gray-100">
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WLQuestionSection;
