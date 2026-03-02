const HomeHeading = ({
    blackText = "",
    accentText = "",
    blackTextAfter = "",
    accentColor = "#AE7E56",
    className = "",
    id = "",
    blackTextAfterClass = "",
}) => {
    return (
        <h2
            id={id}
            className={`md:text-[42px] text-[24px] font-[400] leading-[114.9%] tracking-[1px]  mb-[32px] md:mb-[48px] subheaders-font ${className}`}
        >
            <span className="text-black subheaders-font">{blackText}</span>{" "}
            <span
                style={{ color: accentColor }}
                className="font-[600] subheaders-font"
            >
                {accentText}
            </span>
            {blackTextAfter && (
                <>
                    {" "}
                    <span
                        className={`text-black subheaders-font ${blackTextAfterClass}`}
                    >
                        {blackTextAfter}
                    </span>
                </>
            )}
        </h2>
    );
};

export default HomeHeading;
