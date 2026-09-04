import Image from "next/image";
import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";
import BrimaryButton from "./ui/buttons/BrimaryButton";

const homeBlog = [
    {
        imageSrc:
            "https://myrocky.b-cdn.net/Other%20Images/Measure-your-age-Then-reverse-it-Bottom.jpg.jpeg",
        title: "All things health blog",
        subtitle: "A lifestyle blog connecting you with issues that matter",
        buttonText: "Read our Blog",
        buttonLink: "/blog",
    },
];

const RockyBlog = ({ blog }) => {
    const dataToUse = blog && blog.length > 0 ? blog : homeBlog;

    return (
        <>
            {dataToUse.map((blog, index) => (
                <section
                    key={index}
                    className="relative w-full px-1  h-[365px] md:h-screen bg-black overflow-hidden"
                >
                    {blog.imageSrc ? (
                        <Image
                            src={blog.imageSrc}
                            alt={blog.title || "Blog Background"}
                            fill
                            sizes="100vw"
                            className="absolute inset-0 object-cover"
                        />
                    ) : (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-[365px] md:h-100 md:h-full object-cover"
                        >
                            <source src={blog.videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}

                    <div className="relative z-10 flex flex-col justify-center items-center text-center text-[#FFFFFF] h-full px-4 py-12">
                        <h2 className=" text-[36px] md:text-[45px] leading-[114.9%] tracking-[1px]  font-[600] subheaders-font">
                            {blog.title}
                        </h2>
                        <p className="text-[18px] md:text-[18px] leading-[100%] tracking-[0%] font-[400]  mt-0 md:mt-4 ">
                            {blog.subtitle}
                        </p>
                        {/* <Link
              href={blog.buttonLink}
              className="mt-[32px] bg-transparent flex items-center justify-center w-[189px] h-[44px] border border-[#FFFFFF] text-[#FFFFFF] py-3 rounded-[64px] text-[14px] leading-[19.6px] duration-100 hover:text-black hover:bg-gray-200"
            >
              <span>{blog.buttonText}</span>
              <FaLongArrowAltRight className="ml-2" />
            </Link> */}
                        <BrimaryButton
                            href={blog.buttonLink}
                            arrowIcon={true}
                            className="mt-[32px] bg-transparent flex items-center justify-center gap-2 w-full md:w-[189px] h-[44px] border border-[#FFFFFF] text-[#FFFFFF] py-3 rounded-[64px] text-[14px] leading-[140%] tracking-[0%] font-[500] duration-100 hover:text-black hover:bg-gray-200"
                        >
                            {blog.buttonText}
                        </BrimaryButton>
                    </div>

                    <div className="block absolute inset-0 bg-black opacity-70"></div>
                </section>
            ))}
        </>
    );
};

export default RockyBlog;
