import Image from "next/image";
import Link from "next/link";

const PreLanderQSection = ({ img, h2, p, UpText = true, question }) => {
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
      <div className="flex flex-col md:items-center md:flex-row md:justify-between">
        {/* Desktop: Image with text overlay */}
        <div className="hidden md:block relative w-[584px] h-[696px]">
          <Image
            src={img}
            alt="MyRocky product"
            fill
            className="object-cover rounded-2xl"
          />
          <div
            className={
              UpText
                ? `absolute right-0 left-0  text-center text-white top-[56px]`
                : `absolute right-0 left-0  text-center text-white bottom-[56px]`
            }
          >
            <h2 className="text-[40px] font-[550]">{h2}</h2>
            <p className="text-[40px] font-[550]">{p}</p>
          </div>
        </div>

        {/* Mobile: Reordered - Text, then Age verification, then Image */}
        <div className="flex flex-col justify-center md:hidden">
          <div className="mb-6 w-full">
            <h3 className="text-[26px] font-[550] text-start">{question}</h3>

            <div className="flex flex-col gap-2 mt-6">
              <button className="px-4 py-3 w-full font-medium text-gray-700 rounded-full border border-gray-200 transition duration-200 hover:bg-gray-100">
                Yes
              </button>
              <button className="px-4 py-3 w-full font-medium text-gray-700 rounded-full border border-gray-200 transition duration-200 hover:bg-gray-100">
                No
              </button>
            </div>
          </div>

          <div className="relative w-full h-[335px]">
            <Image
              src={img}
              alt="MyRocky product"
              fill
              className="object-cover rounded-2xl"
            />
            <div
              className={
                UpText
                  ? `absolute right-0 left-0 top-[22px] text-center text-[#FFFFFFF2]`
                  : `absolute right-0 left-0 bottom-[22px] text-center text-[#FFFFFFF2]`
              }
            >
              <h2 className="text-xl font-semibold">{h2}</h2>
              <p className="text-xl font-semibold">{p}</p>
            </div>
          </div>
        </div>

        {/* Age verification section - desktop only */}
        <div className="hidden md:block w-full max-w-md md:w-[400px] md:self-center md:flex-1">
          <div className="py-4 border-t border-gray-200 md:border-t-0">
            <h3 className="text-[34px] font-[550]">{question}</h3>
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
  );
};

export default PreLanderQSection;
