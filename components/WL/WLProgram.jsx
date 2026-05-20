import Image from "next/image";
import Link from "next/link";
import Section from "../utils/Section";
import WLProgramItem from "./WLProgramItem";
import CustomImage from "../utils/CustomImage";

const WLProgram = ({ ProgramWorksData = [] }) => {
  return (
    <>
      <Section>
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-3">
            How our Weight Loss Program works
          </h1>
          <p className="text-xl">
            Digital Healthcare without the long wait times
          </p>

          <div className="flex mt-20 flex-col sm:flex-row">
            <div className="lg:w-1/2 w-full text-left">
              {ProgramWorksData.map((item, index) => (
                <WLProgramItem Item={item} key={item.id} />
              ))}
            </div>
            <div className="lg:w-1/2 w-full">
              {/* Image  */}
              <div className="bg-gray-200 flex content-start items-center w-full overflow-hidden  lg:h-[500px] sm:flex-row">
                <div className="w-full">
                  <Link href="/" aria-label="MyRocky Homepage">
                    <Image
                      height="100"
                      width="100"
                      src="/ed-prelander-5/rocky-logo.png"
                      className="lg:mt-64 mt-24 mb-4 px-auto mx-auto"
                      alt="MyRocky logo"
                      quality="100"
                    />
                  </Link>
                  <CustomImage
                    height="250"
                    width="250"
                    src="/WL/mobile.webp"
                    alt="mobile image"
                    className="w-[160%] lg:w-[70%] mx-auto lg:pl-[65px] pl-[35px]"
                    quality="100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default WLProgram;
