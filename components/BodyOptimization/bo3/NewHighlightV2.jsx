import Image from "next/image";

import { features } from "@/components/SkinCare/data/features";

const NewHighlightV2 = () => {
  return (
    <section className="w-full ">
      <div className=" w-[90%] md:w-full h-[184px] max-w-[1168px] mx-auto bg-[rgba(255,255,255,0.30)] backdrop-blur-[20px] border border-solid border-[#E2E2E1] rounded-2xl px-[24px] py-[20px] md:px-0 md:py-0 md:h-[72px]">
        <div className="overflow-hidden  md:py-4  md:h-[72px]  flex items-center justify-center">
          <div className="flex flex-col md:flex-row md:whitespace-nowrap justify-center md:justify-around gap-[16px] md:gap-10 text-[16px] font-[400] md:px-4">
            {features.map((item, i) => (
              <div
                key={i}
                className="flex md:items-center gap-2 text-black font-[400] text-[16px] shrink-0 justify-start md:justify-start"
              >
                <Image src={item.icon} alt={item.text} width={24} height={24} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHighlightV2;
