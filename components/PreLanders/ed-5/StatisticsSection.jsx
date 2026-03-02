import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

const StatisticsSection = memo(() => {
  return (
    <div className="my-20">
      <div className="relative rounded-lg overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://mycdn.myrocky.com/wp-content/uploads/20250408140715/bg-individual.jpg"
            alt="Water droplets on skin"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-16 flex flex-col items-start">
          <div className="text-white">
            <h2 className="text-7xl md:text-8xl font-bold mb-4">
              87<span className="text-5xl align-top">%</span>
            </h2>
            <p className="text-lg md:text-xl max-w-md">
              of users feel more confident knowing they can perform every time
              after starting with MyRocky.
            </p>
          </div>

          <Link
            href="/ed-prequiz"
            className="mt-8 py-3 px-6 rounded-full text-white bg-[#00B67A] hover:bg-[#00A06D] font-medium text-lg transition-colors"
          >
            Get Started
          </Link>

          <p className="text-xs text-white mt-8 max-w-md">
            *Individual results may vary. Based on survey responses of 74 MyRocky
            treatments users.
          </p>
        </div>
      </div>
    </div>
  );
});
StatisticsSection.displayName = "StatisticsSection";

export default StatisticsSection;
