import ImageWithList from "@/components/ImageWithList";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

const EmpoweringMentalHealth = () => {
    return (
        <ImageWithList
            image="https://myrocky.b-cdn.net/WP%20Images/mental-health.webp"
            imagePosition="left"
            mobileImagePosition="bottom"
        >
            {/* Heading */}
            <div className="w-full">
                <div>
                    <p className="text-[32px] md:text-[48px] text-[000000D9] leading-[35.68px] md:leading-[53.52px] tracking-[-0.01em] md:tracking-[-0.02em] mb-[24px] h-[74px] md:h-[117px] headers-font">
                        Empowering you against Mental Health:
                    </p>
                    <p className="text-[20px] leading-[24px] md:leading-[30px] text-[#535353] md:text-[#000000A6] tracking-[-0.02em] md:h[142px] mb-[24px] md:mb-[45px] md:h-[123px] md:w-[551px] subheaders-font md:poppins-font">
                        Manage your anxiety or depression with the dedicated
                        support of our licensed healthcare practitioners. At
                        MyRocky, we'll help you find the right treatment to
                        regain control over your life.
                    </p>
                </div>
                {/* Button */}
                <div>
                    <Link
                        href="/mh-pre-quiz/"
                        className="h-11 md:px-[24px] py-3 md:py-[11.5px] rounded-[64px] flex items-center space-x-2 transition justify-center w-full md:w-fit  bg-black text-white hover:bg-gray-800"
                    >
                        <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
                            Get Treatment
                        </span>
                        <FaArrowRightLong />
                    </Link>
                </div>
            </div>
        </ImageWithList>
    );
};

export default EmpoweringMentalHealth;
