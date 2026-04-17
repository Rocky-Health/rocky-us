import Image from "next/image";
import Link from "next/link";

const Logo = ({ hardNavigateToHome = false }) => {
  const imageBlock = (
    <div className="h-[35px] w-[100px] relative ml-[0]">
      <Image
        src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
        alt="MyRocky Logo"
        fill
        className="object-contain"
      />
    </div>
  );

  return (
    <div className="text-2xl py-4 font-bold text-gray-800 flex justify-center">
      {hardNavigateToHome ? (
        <a href="/" aria-label="MyRocky Homepage">
          {imageBlock}
        </a>
      ) : (
        <Link href="/" aria-label="MyRocky Homepage">
          {imageBlock}
        </Link>
      )}
    </div>
  );
};

export default Logo;
