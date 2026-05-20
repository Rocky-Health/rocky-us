const OurTeamBrief = () => {
  return (
    <>
      <div className="flex-col justify-start items-center gap-4 flex">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-[#AE7E56] text-[12px] md:text-[14px] font-[500] uppercase mb-1 md:mb-2">
            Focus
          </div>
          <div className="text-[32px] md:text-[48px] tracking-[-0.01em] md:tracking-[-0.02em] leading-[115%] md:leading-[100%] max-w-[684px] capitalize headers-font mb-3 md:mb-4">
            A dedicated team with you every step of the way.
          </div>
          <div className="text-[16px] font-[400] leading-[140%] w-[307px] md:hidden">
            Behind MyRocky is a team of healthcare professionals who have you covered at every step. With expertise across medicine, pharmacy, and mental health, our team works together to provide comprehensive solutions tailored to your needs.
          </div>
          <div className="text-[18px] font-[400] leading-[140%] max-w-[632px] hidden md:block ">
            Behind MyRocky is a team of healthcare professionals who have you covered at every step. With expertise across medicine, pharmacy, and mental health, our team works together to provide comprehensive solutions tailored to your needs.
          </div>
        </div>
      </div>
    </>
  );
};

export default OurTeamBrief;
