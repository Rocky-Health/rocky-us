"use client";

import Image from "next/image";
import Link from "next/link";

const NAVIGATION_ITEMS = [
  { text: "Goals", isActive: true },
  { text: "Medical", isActive: false },
  { text: "Plans", isActive: false },
  { text: "Checkout", isActive: false },
];

const NavigationTab = ({ text, isActive }) => (
  <div
    className={`pb-4 pt-4 border-b ${
      isActive ? "border-b-2 border-[#C19A6B]" : "border-gray-200"
    }`}
  >
    <span className={`${isActive ? "text-gray-900" : "text-gray-500"}`}>
      {text}
    </span>
  </div>
);

export default function WeightLossLanding() {
  return (
    <div className="min-h-screen bg-white max-w-[1184px] mx-auto px-5">
      <div className="my-4">
        <Link href="/" className="flex justify-center">
          <Image
            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
            alt="MyRocky"
            width={80}
            height={30}
            className="mx-auto"
            priority
          />
        </Link>
      </div>

      <div className="flex justify-center px-6 lg:px-8 gap-4 md:gap-8">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationTab key={item.text} {...item} />
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-lg md:text-4xl font-bold text-gray-800 mb-4">
          MyRocky creates long-term weight loss
        </h1>

        <p className="text-xs md:text-sm text-[#212121] mb-8 max-w-2xl mx-auto">
          By combining FDA approved medications and custom support so you can
          lose weight for good— without restrictive diets.
        </p>

        <p className="text-sm md:text-sm text-[#212121] mb-12">
          Simply answer a few quick questions, and find a treatment that works
          for you.
        </p>

        <div className="relative max-w-lg mx-auto mb-8">
          <Image
            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl-test-img-1.png"
            alt="Weight Loss Comparison"
            width={600}
            height={240}
            className="w-full h-auto"
            priority
          />
        </div>

        <p className="text-xs text-gray-500 mb-8">
          *On average, MyRocky members lose 15-25% of their bodyweight in the
          first 6 months.
        </p>

        <Link
          href="/wl-pre-cf1/?start_test=true"
          className="inline-block bg-[#00B67A] hover:bg-[#00A06D] text-white font-medium px-16 md:px-48 py-3 rounded-full transition-colors duration-200 text-sm md:text-lg"
        >
          Continue
        </Link>
      </main>
    </div>
  );
}
