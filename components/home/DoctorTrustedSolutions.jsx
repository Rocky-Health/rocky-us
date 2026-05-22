import CustomImage from "@/components/utils/CustomImage";
import HomeHeading from "./HomeHeading";

const DoctorTrustedSolutionsCards = [
    {
        DesktopImage:
            "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/DoctorTrustedSolutionsCards-DSA-1.png",
        MobileImage:
            "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/DoctorTrustedSolutionsCards-MS-1.png",
    },
    {
        DesktopImage:
            "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/DoctorTrustedSolutionsCards-D-2-V2.png",
        MobileImage:
            "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/DoctorTrustedSolutionsCards-M-2-V2.png",
    },
    {
        DesktopImage:
            "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/DoctorTrustedSolutionsCards-D-3.svg",
        MobileImage:
            "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/DoctorTrustedSolutionsCards-MSA-3.png",
    },
];
const DoctorTrustedSolutions = () => {
    return (
        <>
            <HomeHeading
                blackText="Doctor-trusted solutions,"
                accentText="personalized to you"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {DoctorTrustedSolutionsCards &&
                    DoctorTrustedSolutionsCards.map((card, index) => {
                        const baseClasses =
                            "relative w-[100%] h-[300px] md:w-[592px] rounded-[20px] overflow-hidden";
                        const heightClasses =
                            index === 2 ? "md:h-[736px]" : "md:h-[360px]";
                        const positionClasses =
                            index === 2
                                ? "md:col-start-2 md:row-start-1 md:row-span-2"
                                : "md:col-start-1";

                        return (
                            <div
                                key={card.DesktopImage}
                                className={`${baseClasses} ${heightClasses} ${positionClasses}`}
                            >
                                <CustomImage
                                    src={card.MobileImage}
                                    alt="Doctor trusted solution"
                                    fill
                                    className="md:hidden"
                                />
                                <CustomImage
                                    src={card.DesktopImage}
                                    alt="Doctor trusted solution"
                                    fill
                                    className="hidden md:block"
                                />
                            </div>
                        );
                    })}
            </div>
        </>
    );
};
export default DoctorTrustedSolutions;
