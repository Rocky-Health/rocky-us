import Image from "next/image";
import Link from "next/link";

const Logo = ({ hardNavigateToHome = false }) => {
  const imageBlock = (
    <div className="h-[32px] w-[130px] relative ml-[0]">
      <Image
        src="/home/Homepage/Logo.svg"
        alt="MyRocky Logo"
        fill
        sizes="130px"
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
