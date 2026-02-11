const CardTitle = ({
    blackText = "",
    accentText = "",
    blackTextAfter = "",
    accentColor = "#AE7E56",
    className = "",
    id = "",
}) => {
    return (
        <h3
            id={id}
            className={`font-[500] text-black mb-1 text-[18px] md:text-[26px] headers-font leading-[114.9%] tracking-[-2%] ${className} `}
        >
            <span className="text-black group-hover:text-white transition-colors duration-300">
                {blackText}
            </span>
            {accentText && (
                <>
                    {" "}
                    <span
                        style={{ color: accentColor }}
                        className="group-hover:!text-white transition-colors duration-300"
                    >
                        {accentText}
                    </span>
                </>
            )}
            {blackTextAfter && (
                <>
                    {" "}
                    <span className="text-black group-hover:text-white transition-colors duration-300">
                        {blackTextAfter}
                    </span>
                </>
            )}
        </h3>
    );
};

export default CardTitle;
