import { FaCheckCircle } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";
import Section from "../utils/Section";

const Comprehensive = () => {
  return (
    <Section>
      <h2 className="text-center text-[32px] md:text-[48px] leading-[115%] tracking-tight font-[550] headers-font mb-[16px]">
        <span className="text-[#AE7E56] md:block">
          {" "}
          A comprehensive GLP-1 program
        </span>
        With Unmatched Results
      </h2>

      <p className="text-[16px] md:text-[18px] leading-[140%] max-w-[900px] mx-auto text-center">
        Our holistic approach goes beyond medication alone. With expert-led
        care, personalized treatments, and continuous support, you'll achieve
        faster, safer, and lasting results.
      </p>

      <div className="hidden md:grid grid-cols-2 justify-between mt-[48px] gap-[16px]">
        <div className="bg-[#F0EEEA] relative rounded-[16px] h-[460px]">
          <div className="ml-[132px] mt-[60px]">
            <div className="flex justify-start items-center gap-[6px]">
              <CustomImage
                src={`/bo4/chatAvatar.png`}
                width={25}
                height={25}
                alt=""
                className="rounded-full"
              />
              <span className="text-[12px] leading-[140%] text-[#000000B2]">
                Dr. Mariah Siddiq
              </span>
            </div>
            <div className="ml-[30px] relative bg-white p-[10px] w-[260px] h-[54px] rounded-b-[10px] rounded-r-[10px]">
              <p className="text-[12px] leading-[140%] ">
                Hey, just checking in — how is the current treatment going?
              </p>
              <p className="absolute bottom-1 right-1 text-[#A7A7A7] text-[8px]">
                10:05
              </p>
            </div>
            <div className="ml-[60px] relative bg-[#A9764B] mt-[12px] p-[10px] w-[260px] h-[71px] rounded-[10px]">
              <p className="text-[12px] leading-[140%] text-white ">
                Hey, so far so good! I’m feeling better and things seem to be
                going in the right direction.
              </p>
              <p className="absolute bottom-1 right-1 text-[#FFFFFF80] text-[8px]">
                10:05
              </p>
            </div>
          </div>
          <CustomImage
            src={`/bo4/manWphone.webp`}
            width={300}
            height={200}
            alt=""
            className="rounded-[16px]  absolute bottom-0 right-0"
          />

          <div className="px-[35px] mt-[67px]">
            <h2 className="text-[24px] md:text-[32px] mb-[16px] leading-[115%] tracking-tight subheaders-font mt-[16px]">
              Unlimited Medical Support
            </h2>

            <div className="flex justify-start items-center mb-[8px]">
              <FaCheckCircle className="text-[#9D6A3F] mr-[8px]" />
              <p className="text-[16px] leading-[140%]">
                Chat with your medical provider at any time
              </p>
            </div>

            <div className="flex justify-start items-center mb-[8px]">
              <FaCheckCircle className="text-[#9D6A3F] mr-[8px]" />
              <p className="text-[16px] leading-[140%]">
                Lifestyle coaching and nutrition advice
              </p>
            </div>

            <div className="flex justify-start items-center mb-[8px]">
              <FaCheckCircle className="text-[#9D6A3F] mr-[8px]" />
              <p className="text-[16px] leading-[140%]">
                Ongoing care & check-ins, 100% online
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#F0EEEA] relative rounded-[16px] h-[584px]">
          <CustomImage src={`/bo4/analysis.webp`} width={400} height={270} alt="" className="rounded-[16px] mx-auto mt-[69px]" />
<div className="px-[35px] mt-[67px]">
            <h2 className="text-[24px] md:text-[32px] mb-[16px] leading-[115%] tracking-tight subheaders-font mt-[16px]">
              Plans Tailored to Your Biology
            </h2>

            <div className="flex justify-start items-center mb-[8px]">
              <FaCheckCircle className="text-[#9D6A3F] mr-[8px]" />
              <p className="text-[16px] leading-[140%]">
                We use lab data to personalize your treatment plan
              </p>
            </div>

            <div className="flex justify-start items-center mb-[8px]">
              <FaCheckCircle className="text-[#9D6A3F] mr-[8px]" />
              <p className="text-[16px] leading-[140%]">
                A range of FDA-approved medications available
              </p>
            </div>

            <div className="flex justify-start items-center mb-[8px]">
              <FaCheckCircle className="text-[#9D6A3F] mr-[8px]" />
              <p className="text-[16px] leading-[140%]">
                Regular dose adjustments
              </p>
            </div>
          </div>


          </div>
      </div>
    </Section>
  );
};

export default Comprehensive;
