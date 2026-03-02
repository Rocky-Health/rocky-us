import { memo } from "react";
import Image from "next/image";

const HeroSection = memo(() => (
  <div
    className="
      relative flex justify-center
      w-full h-[460px]
      md:w-[800px] md:h-[720px] md:-ml-16 lg:-ml-32 xl:-ml-40 2xl:-ml-56 
      z-10
    "
  >
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Image
        src="/pre_ed/hero_sec1.png"
        alt="MyRocky treatment package"
        fill
        className="object-cover object-center"
        priority
      />
    </div>
    <div className="relative z-10 text-white max-w-md px-5 lg:px-0 pt-8 lg:pt-14 text-center">
      <h1 className="text-3xl lg:text-5xl font-bold mb-4 headers-font ">
        Trusted Treatments For Better Sex
      </h1>
      <p className="text-lg mb-6">
        Personalised ED treatment options approved by licensed
        providers—delivered discreetly.
      </p>
    </div>
  </div>
));
HeroSection.displayName = "HeroSection";

export default HeroSection;
