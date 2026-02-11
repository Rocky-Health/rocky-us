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
            className={`md:text-[45px] text-[24px] font-[400] leading-[114.9%] tracking-[-3%]  mb-[32px] md:mb-[48px] headers-font ${className}`}
        >
            <span className="text-black">{blackText}</span>{" "}
            <span style={{ color: accentColor }} className="font-[600]">
                {accentText}
            </span>
            {blackTextAfter && (
                <>
                    {" "}
                    <span className={`text-black ${blackTextAfterClass}`}>
                        {blackTextAfter}
                    </span>
                </>
            )}
        </h2>
    );
};

export default HomeHeading;
