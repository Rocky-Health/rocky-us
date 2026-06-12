import CustomContainImage from "./utils/CustomContainImage";

const ProudPartner = ({ section = false, bg = "bg-white" }) => {
  const rockyLogoSize = section
    ? "h-[35px] w-[90px]"
    : "h-[40px] w-[96px] md:h-[42px] md:w-[115px]";

  const containerHeight = section
    ? "gap-3 py-3 md:py-0 md:h-[60px] md:justify-start"
    : "gap-3 md:gap-6 py-3 md:py-0 md:h-[88px]";

  const nbaLogoSize = "w-[20px] h-[46px] md:w-[26px] md:h-[60px]";
  const blueJaysLogoSize = "w-[56px] h-[48px] md:w-[74px] md:h-[64px]";
  const mapleLeafsLogoSize = "w-[43px] h-[48px] md:w-[57px] md:h-[64px]";
  const argonautsLogoSize = "w-[43px] h-[48px] md:w-[57px] md:h-[64px]";

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-center ${bg} ${containerHeight}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
        <div className="text-center">
          <div className={`relative overflow-hidden mx-auto ${rockyLogoSize}`}>
            <CustomContainImage
              src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
              alt="MyRocky Logo"
              fill
              sizes="115px"
            />
          </div>
          <p className="leading-[140%] font-[600] text-[10px]">
            proud partner
          </p>
        </div>

        <div className="self-stretch w-px bg-gray-300 hidden md:block" />

        <div className="flex items-center gap-3 md:gap-6 justify-center md:justify-start">
          <div className={`relative overflow-hidden ${nbaLogoSize}`}>
            <CustomContainImage
              src="/nab.png"
              alt="NBA"
              fill
              sizes="26px"
            />
          </div>
          <div className={`relative overflow-hidden ${blueJaysLogoSize}`}>
            <CustomContainImage
              src="https://myrocky.b-cdn.net/WP%20Images/proud-logo/TBJ.png"
              alt="Toronto Blue Jays"
              fill
              sizes="74px"
            />
          </div>
          <div className={`relative overflow-hidden ${mapleLeafsLogoSize}`}>
            <CustomContainImage
              src="https://myrocky.b-cdn.net/partner-1.png"
              alt="Toronto Maple Leafs Logo"
              fill
              sizes="57px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProudPartner;
