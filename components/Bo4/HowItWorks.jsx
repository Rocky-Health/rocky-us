import React from 'react';
import CustomImage from '@/components/utils/CustomImage';
import BrimaryButton from '@/components/ui/buttons/BrimaryButton';

const HowItWorks = ({ consultationHref = "/wl-offer-pre-consultation/" }) => {

  const steps = [
    {
      step: "Step 1",
      title: "Tell Us About Your Health",
      description: "Answer a few simple questions about your health, symptoms and history. It only takes a few minutes.",
      image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Tell-us-about-your-health.jpg"
    },
    {
      step: "Step 2",
      title: "Receive A Treatment Plan",
      description: "A licensed medical experts will build a personalized plan just for you, if eligible.",
      image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Receive-a-Treatment-Plan.jpg"
    },
    {
      step: "Step 3",
      title: "Medication Delivered Right To Your Doorstep",
      description: "Your medication will ship to you for free, in discreet packaging.",
      image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Medication-Delivered-Right-to-your-Doorstep.jpg"
    },
    {
      step: "Step 4",
      title: "Ongoing Care & Support",
      description: "Connect with your healthcare provider any time you need them. Regular check-ins included. 100% online.",
      image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Ongoing-Care-Support.jpg"
    }
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-[32px] md:text-[48px]  md:font-[550] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] capitalize headers-font text-black mb-4">
          How It Works
        </h2>
        <p className="text-base md:text-[18px] text-black font-normal leading-[140%]">
          Get started in 4 simple steps:
        </p>
      </div>

      {/* Steps */}
      <div className="relative max-w-6xl mx-auto">
        {/* Steps List */}
        <div className="space-y-12 md:space-y-20">
          {steps.map((stepItem, index) => {
            const isEven = index % 2 === 0;
            const isFirstStep = index === 0;
            
            return (
              <div
                key={index}
                className="relative"
              >
                {/* Gold dots - vertical dotted line with circle at top, only for first step */}
                {/* Gold circle and line for first step */}
                {isFirstStep && (
                  <>
                    {/* Mobile version - on the left */}
                    <div className="md:hidden absolute left-0 top-0 bottom-0 z-0" style={{
                      width: '2px',
                      backgroundImage: 'repeating-linear-gradient(to bottom, #AE7E56 0px, #AE7E56 4px, transparent 4px, transparent 8px)'
                    }}>
                      {/* Circle at top of line */}
                      <div className="absolute left-1/2 top-0 w-6 h-6 rounded-full bg-white border-4 border-[#AE7E56] -translate-x-1/2 flex-shrink-0" style={{ aspectRatio: '1/1' }}></div>
                    </div>
                    {/* Desktop version - centered */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-0" style={{
                      width: '2px',
                      backgroundImage: 'repeating-linear-gradient(to bottom, #AE7E56 0px, #AE7E56 4px, transparent 4px, transparent 8px)'
                    }}>
                      {/* Circle at top of line */}
                      <div className="absolute left-1/2 top-0 w-6 h-6 rounded-full bg-white border-4 border-[#AE7E56] -translate-x-1/2 flex-shrink-0" style={{ aspectRatio: '1/1' }}></div>
                    </div>
                  </>
                )}

                {/* Gray circle and line for steps 2-4 */}
                {!isFirstStep && (
                  <>
                    {/* Mobile version - on the left */}
                    <div className="md:hidden absolute left-0 top-0 bottom-0 z-0" style={{
                      width: '2px',
                      backgroundImage: 'repeating-linear-gradient(to bottom, #E5E7EB 0px, #E5E7EB 4px, transparent 4px, transparent 8px)'
                    }}>
                      {/* Circle at top of line */}
                      <div className="absolute left-1/2 top-0 w-6 h-6 rounded-full bg-gray-200 border-4 border-gray-200 -translate-x-1/2 flex-shrink-0" style={{ aspectRatio: '1/1' }}></div>
                    </div>
                    {/* Desktop version - centered */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-0" style={{
                      width: '2px',
                      backgroundImage: 'repeating-linear-gradient(to bottom, #E5E7EB 0px, #E5E7EB 4px, transparent 4px, transparent 8px)'
                    }}>
                      {/* Circle at top of line */}
                      <div className="absolute left-1/2 top-0 w-6 h-6 rounded-full bg-gray-200 border-4 border-gray-200 -translate-x-1/2 flex-shrink-0" style={{ aspectRatio: '1/1' }}></div>
                    </div>
                  </>
                )}

                {/* Content Grid - Alternating layout */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                  {/* Text Column */}
                  <div className={`pl-[24px] ${isEven ? 'md:order-1 md:pr-[12px]' : 'md:order-2 md:pl-[12px]'}`}>
                    {/* Step Number - positioned at top left above title */}
                    <div className="mb-2">
                      <span className="text-[#A9764B] text-base font-medium leading-[140%] tracking-[-1px] md:tracking-[0]">
                       <div className='bg-[#EEEEEE] w-[24px] h-[24px] rouneded-full inline md:hidden'></div> {stepItem.step}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 
                      className="text-[24px] md:text-[40px]  md:font-[550] text-black mb-2 md:mb-4 leading-[115%] tracking-[-0.24px] md:tracking-[-0.8px] capitalize headers-font"
                    >
                      {stepItem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-[#212121] font-normal leading-[140%]">
                      {stepItem.description}
                    </p>
                  </div>

                  {/* Image Column */}
                  <div className={`pl-[24px] ${isEven ? 'md:order-2 md:pl-[12px]' : 'md:order-1 md:pr-[12px]'}`}>
                    <div className="relative w-[299px] h-[224px] md:w-[524px] md:h-[393px] rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300" style={{ aspectRatio: '295/221' }}>
                      {stepItem.image ? (
                        <CustomImage
                          src={stepItem.image}
                          alt={stepItem.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-gray-400 text-sm text-center px-4">
                            {stepItem.title} Image
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action Button */}
      <div className="flex justify-center mt-12 md:mt-16">
        <BrimaryButton
          href={consultationHref}
          arrowIcon={true}
          className="flex h-[48px]  md:px-[32px] justify-center items-center gap-2 rounded-[64px] bg-[#000] text-white w-[335px] md:w-auto"
        >
          Start Your FREE Weight Loss Journey
        </BrimaryButton>
      </div>
    </div>
  );
};

export default HowItWorks;
