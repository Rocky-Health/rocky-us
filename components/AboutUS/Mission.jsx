const Mission = ({ title, description, videoRef, videoSrc }) => {
    return (
        <>
            <section className="max-w-[1184px] mx-auto">
                <div className="px-5 sectionWidth:px-0 py-6 md:pt-16 md:pb-14 ">
                    <div className="text-[#AE7E56] text-[12px] md:text-[14px] font-[500] uppercase mb-1 md:mb-2">
                        Mission
                    </div>
                    <div className="text-[32px] md:text-[48px] tracking-[-0.01em] md:tracking-[-0.02em] leading-[115%] md:leading-[100%] max-w-[684px] capitalize headers-font mb-3 md:mb-4">
                        {title ||
                            "Breaking the stigma and redefining health for everyone."}
                    </div>
                    <div className="text-[16px] md:text-[18px] font-[400] leading-[140%] md:max-w-[591px] ">
                        {description ||
                            "At myRocky, we're on a mission to normalize everyday health concerns and remove the stigma that keeps too many from seeking care. By creating a safe, accessible, and frictionless platform, we empower you to take control of your health and start conversations that matter."}
                    </div>
                </div>
                <div className="relative overflow-hidden md:rounded-[16px] w-full h-[214px] md:h-[665px] md:pb-24 ">
                    <video
                        ref={videoRef}
                        loop
                        muted
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover md:rounded-[16px]"
                    >
                        <source
                            src={`${videoSrc || "https://rockywp.s3.ca-central-1.amazonaws.com/wp-content/uploads/video/Rockyhealth-Ad-V1.mp4"}`}
                            type="video/mp4"
                        />
                    </video>
                </div>
            </section>
        </>
    );
};

export default Mission;
