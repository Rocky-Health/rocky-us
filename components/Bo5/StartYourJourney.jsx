import BrimaryButton from "../ui/buttons/BrimaryButton";
import CustomImage from "../utils/CustomImage";

const StartYourJourney = () => {
  return (
    <div className="w-full md:h-[440px] flex justify-between items-center md:flex-row flex-col px-3 pt-5 gap-[8px] md:px-[100px] bg-[#F5F4EF] rounded-[16px]">
      <div className="text-center">
        <h2 className="text-[40px] md:text-[48px] font-[550] headers-font tracking-[-2%] leading-[115%] text-black">
          Lose Weight 
        </h2>
        <h2 className="text-[40px] md:text-[48px] font-[550] headers-font tracking-[-2%] leading-[115%] text-[#AE7E56] mb-[24px]">
          For The Last Time
        </h2>

        <BrimaryButton
          arrowIcon={true}
          href="/wl-pre-consultation"
          className="flex h-[48px]  justify-center items-center gap-2 rounded-[64px] bg-[#000] text-white "
        
        >
          Start your journey
        </BrimaryButton>
      </div>
    <div >
          <CustomImage
        src={`/bo4/ladyBO.png`}
        width={398}
        height={499}
        alt="Start Your Journey"
        className={`relative bottom-0 md:top-[-39px] top-0 md:w-[389px] md:h-[499] w-[271px] h-[340px] `}
      />
      
    </div>
    </div>
  );
};

export default StartYourJourney;
