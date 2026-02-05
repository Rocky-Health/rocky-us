const DoctorTrustedSolutionsCards = [
  {
    title: "Private Care, 100% Online",
    titleHighlight: "100% Online",
    description: "No judgement, no waiting lines, no in-person visit needed. Privacy guaranteed.",
    desktopImage: "/wl-offer/private-dis.jpg",
    mobileImage: "/wl-offer/private.jpg",
  },
  {
    title: "Doctor-Trusted Treatment Plans",
    titleHighlight: "Treatment Plans",
    description: "360 care, completely personalized for you.",
    desktopImage: "/wl-offer/Doctor-Trusted-Treatment-Plans-Desktop.jpg",
    mobileImage: "/wl-offer/Doctor-Trusted-Treatment-Plans-Mobile.jpg",
  },
  {
    title: "Access To Vetted Medical Experts",
    titleHighlight: "Vetted Medical Experts",
    description: "Programs developed by industry specialists with decades of experience in weight loss.",
    desktopImage: "/wl-offer/Access-to-Vetted-Medical-Experts-Desktop.jpg",
    mobileImage: "/wl-offer/Access-to-Vetted-Medical-Experts-Mobile.jpg",
  },
];

const DoctorTrustedSolutions = () => {
  return (
    <>
      <h2 
        className="text-[32px] md:text-[48px]  md:font-[550] leading-[115%] capitalize tracking-[-0.64px] md:tracking-[-0.96px] mb-[32px] md:mb-[48px] max-w-[300px] md:max-w-none headers-font"
      
      >
        Exceptional Care Delivered
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DoctorTrustedSolutionsCards &&
          DoctorTrustedSolutionsCards.map((card, index) => {
            const baseClasses =
              "relative w-[100%] h-[408px] md:w-[592px] rounded-[20px] overflow-hidden flex flex-col items-start self-stretch";
            const heightClasses = index === 2 ? "md:h-[736px]" : "md:h-[360px]";
            const positionClasses =
              index === 2
                ? "md:col-start-2 md:row-start-1 md:row-span-2"
                : "md:col-start-1";

            return (
              <div
                key={index}
                className={`${baseClasses} ${heightClasses} ${positionClasses}`}
              >
                <div
                  className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat rounded-[20px] z-0"
                  style={{
                    backgroundImage: `url(${encodeURI(card.mobileImage)})`,
                  }}
                />
                <div
                  className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat rounded-[20px] z-0"
                  style={{
                    backgroundImage: `url(${encodeURI(card.desktopImage)})`,
                  }}
                />
                <div className="relative z-20 p-5 md:p-8 flex flex-col items-start h-full w-full">
                  <h3 
                    className="text-[24px] md:text-[32px] font-medium leading-[120%] mb-4 capitalize tracking-[-0.48px] md:tracking-[-0.64px]"
                    style={{
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    <span>
                      {card.title.split(card.titleHighlight)[0]}
                    </span>
                    <span style={{ color: '#AE7E56' }}>
                      {index === 0 ? (
                        <>
                          <br className="hidden md:block" />
                          {card.titleHighlight}
                        </>
                      ) : (
                        <>
                          <br />
                          {card.titleHighlight}
                        </>
                      )}
                    </span>
                  </h3>
                  <p 
                    className={`text-[16px] md:text-[18px] font-normal leading-normal w-[90%] ${
                      index === 0 ? 'md:w-[288px]' : index === 1 ? 'md:w-[278px]' : 'md:w-[323px]'
                    }`}
                    style={{
                      color: 'rgba(0, 0, 0, 0.85)',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};
export default DoctorTrustedSolutions;
