import Image from "next/image";
import Link from "next/link";

const AdContainer = ({
  className = "",
  src = "/2-in-1-Growth-Plan.webp",
  title = "Get Obvious Results Within 3 Weeks",
  desc = "Lorem ipsum dolor sit amet consectetur.",
  url_btn = "/",
}) => {
  return (
    <>
      <div
        className={
          `bg-[#E2DCD5] p-8 rounded-xl shadow-md max-w-md mx-auto` + className
        }
      >
       <div className="h-[250px] lg:h-[190px]  w-full text-center mx-auto mb-4 ">
       {/* width/height = intrinsic dimensions of the default asset; Tailwind
           preflight (max-w-full h-auto) keeps the rendered size identical to
           the previous raw <img>. Lazy-loaded by default (below the fold). */}
       <Image
         src={src}
         alt={title}
         width={800}
         height={533}
         className="object-cover"
       />
       </div>

        <h2 className="text-xl font-bold text-black mb-2">{title}</h2>
        <p className="text-gray-500 mb-8">{desc}</p>

        <Link
          href={url_btn}
          className="bg-black hover:bg-gray-800 w-[100%] block text-center rounded-full text-white font-semibold py-2 px-6  transition duration-300"
        >
          Get Started →
        </Link>
      </div>
    </>
  );
};

export default AdContainer;
