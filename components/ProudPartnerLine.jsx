import CustomContainImage from "./utils/CustomContainImage";

const ProudPartnerLine = ({
    section = false,
    bg = "bg-white",
    sectionClassName = "",
    isCover = false,
}) => {
    const rockyLogoSize = section
        ? "h-[28px] w-[75px] md:w-[91px] md:h-[35px]"
        : "h-[40px] w-[96px] md:h-[42px] md:w-[115px]";

    const containerHeight = section
        ? `gap-3 py-3 md:py-0 md:h-[60px] md:justify-start ${sectionClassName}`
        : "gap-3 md:gap-6 py-3 md:py-0 md:h-[88px]";

    const nbaLogoSize = isCover
        ? "w-[16.25px] h-[36px]"
        : "w-[16.25px] h-[36px] md:w-[19px] md:h-[44px]";
    const blueJaysLogoSize = isCover
        ? "w-[46px] h-[39px] "
        : "w-[46px] h-[39px] md:w-[55.5px] md:h-[47px]";
    const mapleLeafsLogoSize = isCover
        ? "w-[35px] h-[39px]"
        : "w-[35px] h-[39px] md:w-[42px] md:h-[47px]";
    const argonautsLogoSize = isCover
        ? "w-[35px] h-[40px]"
        : "w-[35px] h-[40px] md:w-[42px] md:h-[48px]";

    return (
        <div
            className={`flex flex-row items-center justify-center ${bg} ${containerHeight}`}
        >
            <div className="flex flex-row items-center gap-1 md:gap-6 w-full md:w-auto justify-center">
                <div className="text-center">
                    <div
                        className={`relative overflow-hidden mx-auto ${rockyLogoSize}`}
                    >
                        <CustomContainImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
                            alt="MyRocky Logo"
                            fill
                            sizes="128px"
                        />
                    </div>
                    <p className="leading-[140%] font-[600] text-[10px]">
                        proud partner
                    </p>
                </div>

                <div
                    className={`self-stretch w-px bg-[#E2E2E1] mx-[15px]  ${isCover ? "md:mx-[5px]" : "md:mx-[20px]"}`}
                />

                <div className="flex items-center gap-4 md:gap-8 justify-center md:justify-start">
                    <div
                        className={`relative overflow-hidden scale-125 ${nbaLogoSize}`}
                    >
                        <CustomContainImage src="/nab.png" alt="NBA" fill sizes="24px" />
                    </div>
                    <div
                        className={`relative overflow-hidden scale-125 ${blueJaysLogoSize}`}
                    >
                        <CustomContainImage
                            src="https://myrocky.b-cdn.net/WP%20Images/proud-logo/TBJ.png"
                            alt="Toronto Blue Jays"
                            fill
                            sizes="70px"
                        />
                    </div>
                    <div
                        className={`relative overflow-hidden scale-125 ${mapleLeafsLogoSize}`}
                    >
                        <CustomContainImage
                            src="https://myrocky.b-cdn.net/partner-1.png"
                            alt="Toronto Maple Leafs Logo"
                            fill
                            sizes="53px"
                        />
                    </div>
                   
                </div>
            </div>
        </div>
    );
};

export default ProudPartnerLine;
