import CustomContainImage from "@/components/utils/CustomContainImage";

const ProudPartner = ({
  section = false,
  bg = "bg-white",
  hideMapleLeaf = false,
}) => {
  const rockyLogoSize = "h-[28px] w-[72px]";
  const nbaLogoSize = "w-[16px] h-[36px]";
  const blueJaysLogoSize = "w-[45px] h-[38px]";
  const mapleLeafsLogoSize = "w-[34px] h-[38px]";
  const argonautsLogoSize = "w-[34px] h-[38px]";

  // Handle arbitrary values like bg-[#F4F3EF] for responsive
  const desktopBg = bg.includes("[") ? bg.replace("bg-", "md:bg-") : `md:${bg}`;
  const rowWidthClass = hideMapleLeaf ? "w-full md:w-fit" : "w-full";

  return (
    <div
      className={`flex flex-row items-center justify-center bg-transparent ${desktopBg} w-[285.1812px] h-[40px] overflow-hidden`}
    >
      <div
        className={`flex flex-row items-center gap-[15px] justify-center ${rowWidthClass}`}
      >
        <div className="text-center flex flex-col items-center justify-center">
          <div className={`relative overflow-hidden ${rockyLogoSize}`}>
            <CustomContainImage
              src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
              alt="MyRocky Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="leading-[100%] font-[600] text-[8px] mt-0.5">
            proud partner
          </p>
        </div>

        <div className="self-stretch w-px bg-gray-300" />

        <div className="flex items-center gap-[15px] justify-center">
          <div className={`relative overflow-hidden ${nbaLogoSize}`}>
            <CustomContainImage
              src="/nab.png"
              alt="NBA"
              fill
              className="object-contain"
            />
          </div>
          <div className={`relative overflow-hidden ${blueJaysLogoSize}`}>
            <CustomContainImage
              src="https://myrocky.b-cdn.net/WP%20Images/proud-logo/TBJ.png"
              alt="Toronto Blue Jays"
              fill
              className="object-contain"
            />
          </div>
          {!hideMapleLeaf && (
            <div className={`relative overflow-hidden ${mapleLeafsLogoSize}`}>
              <CustomContainImage
                src="https://myrocky.b-cdn.net/partner-1.png"
                alt="Toronto Maple Leafs Logo"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProudPartner;
