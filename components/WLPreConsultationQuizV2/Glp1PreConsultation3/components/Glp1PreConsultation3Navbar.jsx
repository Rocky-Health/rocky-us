import Logo from "@/components/Navbar/Logo";
import CustomImage from "@/components/utils/CustomImage";

const Glp1PreConsultation3Navbar = () => {
    return (
        <header
            className="questionnaire-header w-full py-3 bg-[#F5F4EF]"
            suppressHydrationWarning={true}
        >
            <div className="mx-auto flex min-h-[44px] w-full max-w-4xl items-center px-4 md:px-6 relative">
                <div className="flex w-full items-center justify-center gap-4">
                    <div className="shrink-0 flex items-center [&>div]:!py-0 [&>div]:flex [&>div]:items-center">
                        <Logo hardNavigateToHome />
                    </div>
                    <div className="shrink-0 flex items-center relative w-[200px] h-[16px]">
                        <CustomImage
                            fill
                            className="w-full h-full object-contain object-right"
                            src="/glp-3-quiz/tp-score2.png"
                            alt="Excellent 4.6 — customer reviews"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Glp1PreConsultation3Navbar;
