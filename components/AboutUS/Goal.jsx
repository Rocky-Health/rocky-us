import CustomImage from "../utils/CustomImage";

const Goal = ({ title, description, imageSrc }) => {
    return (
        <>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20 ">
                <div className="max-w-[552px]">
                    <div className="text-[#AE7E56] text-[12px] md:text-[14px] font-[500] uppercase mb-1 md:mb-2">
                        Goal
                    </div>
                    <div className="text-[32px] md:text-[48px] tracking-[-0.01em] md:tracking-[-0.02em] leading-[115%] md:leading-[100%] max-w-[684px] capitalize headers-font mb-4">
                        {title ||
                            "A patient-centred approach where you come first."}
                    </div>
                    <div className="text-[16px] md:text-[18px] font-[400] leading-[140%] md:max-w-[591px] ">
                        {description ||
                            "Our goal is simple: to put patients at the centre of everything we do. From first consultation to ongoing support, we focus on building trust, delivering personalized care, and ensuring that every patient feels heard and supported."}
                    </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden w-full h-[335px] md:w-[552px] md:h-[640px]">
                    <CustomImage
                        fill
                        src={
                            imageSrc ||
                            "https://myrocky.b-cdn.net/WP%20Images/ultra-thin.webp"
                        }
                    />
                </div>
            </div>
        </>
    );
};

export default Goal;
