import Image from "next/image";
import Link from "next/link";

const Glp2OfferHeader = ({ ctaHref = "/glp2-pre-consultation" }) => {
  return (
    <header className="w-full bg-[#F4F3EF] border-b border-[#e8e6df]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Rocky home">
          <Image
            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
            alt="MyRocky"
            width={110}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* CTA */}
        <Link
          href={ctaHref}
          className="bg-[#0a0a0a] text-white text-[13px] md:text-[14px] px-5 py-2 rounded-full hover:bg-[#222] transition-colors leading-none"
        >
          GET STARTED
        </Link>
      </div>
    </header>
  );
};

export default Glp2OfferHeader;
