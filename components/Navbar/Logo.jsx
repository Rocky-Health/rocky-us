import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <div className="text-2xl py-4 font-bold text-gray-800 flex justify-center">
      <Link href="/" aria-label="MyRocky Homepage">
        <div className="h-[35px] w-[100px] relative ml-[0]">
          <Image
            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
            alt="MyRocky Logo"
            fill
            className="object-contain"
          />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
