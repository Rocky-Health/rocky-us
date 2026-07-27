import BrimaryButton from "@/components/ui/buttons/BrimaryButton";
import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";


const homeBlog = [
  {
    videoSrc:
      "https://rockywp.s3.ca-central-1.amazonaws.com/wp-content/uploads/video/Rockyhealth-Ad-V1.mp4",
    title: "All Things Men Blog",
    subtitle: "A men’s lifestyle blog connecting you with issues that matter.",
    buttonText: "Read Our Blog",
    buttonLink: "/blog"
  }
];

const RockyBlog = ({ blog }) => {
  const dataToUse = blog && blog.length > 0 ? blog : homeBlog;

  return (
    <>
      {dataToUse.map((blog, index) => (
        <section
          key={index}
          className="md:relative w-full h-100 md:h-screen bg-black"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="relative md:absolute inset-0 w-full h-100 md:h-full object-cover"
          >
            <source src={blog.videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="hidden relative z-10 md:flex flex-col justify-end items-center text-center text-[#FFFFFF] h-full px-4 py-12">
            <h2 className="text-[48px] leading-[55.2px] tracking-[-0.02em]  font-[550] headers-font">
              {blog.title}
            </h2>
            <p className="text-[20px] leading-[28px] mt-4 ">{blog.subtitle}</p>
            {/* <Link
              href={blog.buttonLink}
              className="mt-[32px] bg-transparent flex items-center justify-center w-[189px] h-[44px] border border-[#FFFFFF] text-[#FFFFFF] py-3 rounded-[64px] text-[14px] leading-[19.6px] duration-100 hover:text-black hover:bg-gray-200"
            >
              <span>{blog.buttonText}</span>
              <FaLongArrowAltRight className="ml-2" />
            </Link> */}
            <BrimaryButton href={blog.buttonLink}
              arrowIcon={true}
              className="mt-[32px] bg-transparent flex items-center justify-center gap-2 w-[189px] h-[44px] border border-[#FFFFFF] text-[#FFFFFF] py-3 rounded-[64px] text-[14px] leading-[19.6px] duration-100 hover:text-black hover:bg-gray-200" >
              {blog.buttonText}
            </BrimaryButton>
          </div>

          <div className="hidden md:block absolute inset-0 bg-black opacity-50"></div>

          <div className="flex md:hidden bg-[#F5F4EF] flex-col justify-end items-center text-center h-full text-black px-5 pt-6 pb-14">
            <h2 className="text-[32px] leading-[36.8px] font-[550]  tracking-[-0.01em]">
              {blog.title}
            </h2>
            {blog.subtitle && (
              <p className="text-[18px] leading-[25.2px] mt-4 text-center">
                {blog.subtitle}
              </p>
            )}
            <Link
              href={blog.buttonLink}
              className="mt-[24px] flex items-center justify-center bg-transparent border border-[#000000] text-[#000] py-3 rounded-[64px] w-full text-[14px] leading-[19.6px] font-[500] hover:bg-gray-200"
            >
              <span>{blog.buttonText}</span>
              <FaLongArrowAltRight className="ml-2" />
            </Link>
          </div>
        </section>
      ))}
    </>
  );
};

export default RockyBlog;
