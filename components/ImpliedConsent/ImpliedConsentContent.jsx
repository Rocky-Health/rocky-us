import Section from "@/components/utils/Section";
import MoreQuestions from "@/components/MoreQuestions";

const ImpliedConsentContent = () => {
  return (
    <Section>
      <div className="flex flex-col items-center">
        <div className="mb-10 md:mb-14 w-full md:w-[784px]">
          <h1 className="text-[40px] md:text-[60px] leading-[115%] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] mb-3 md:mb-4 headers-font text-center">
            Consent to Telehealth
          </h1>
        </div>

        <div className="w-full md:w-[784px]">
          <div className="text-[16px] md:text-[18px] leading-[160%] mb-10 md:mb-14">
            <p className="mb-6">
              We provide websites and applications through which you can obtain
              an online visit with an independent, licensed health care
              professional (a “Provider”), and mail order pharmacy services for
              any medications prescribed to you (collectively, the “Services”).
              The Services constitute a form of telehealth, which involves the
              delivery of health care services using electronic communications
              between a health care provider and a patient who is not in the
              same physical location. We believe that telehealth has the
              potential to provide a number of benefits, including convenience,
              discreetness, and affordable care. Telehealth may be used for
              diagnosis, treatment, follow-up, and/or patient education.
              Telehealth may include, but is not limited to:
            </p>

            <ul className="list-disc list-outside mb-6 space-y-2 pl-6 ml-4">
              <li>
                Electronic transmission of medical records, photo images,
                personal health information or other data between a patient and
                a Provider;
              </li>
              <li>
                Interactions between a patient and a Provider via audio, video
                and/or asynchronous data communications, such as secure
                messaging and email; and
              </li>
              <li>
                Use of data from remote monitoring devices, medical devices, and
                sound or video files.
              </li>
            </ul>

            <p className="mb-6">
              The websites, applications, and information systems used in the
              Services incorporate network and software security protocols to
              protect the privacy, security, and integrity of your health
              information.
            </p>
          </div>

          {/* Potential Benefits of Telehealth */}
          <div id="potential-benefits-of-telehealth" className="mb-10 md:mb-14">
            <div className="text-[32px] md:text-[40px] leading-[115%] tracking-[-0.01em] md:tracking-[-0.02em] mb-6 headers-font">
              Potential Benefits of Telehealth
            </div>
            <ul className="list-disc list-outside space-y-4 mb-6 pl-6 ml-4">
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                Telehealth can make accessing medical care services easier, more
                efficient, and less expensive.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                You can obtain medical care and treatment at times that are
                convenient for you.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                You can interact with providers without the necessity of an
                in-office appointment.
              </li>
            </ul>
          </div>

          {/* Possible Limitations of Telehealth */}
          <div
            id="possible-limitations-of-telehealth"
            className="mb-10 md:mb-14"
          >
            <div className="text-[32px] md:text-[40px] leading-[115%] tracking-[-0.01em] md:tracking-[-0.02em] mb-6 headers-font">
              Possible Limitations of Telehealth
            </div>
            <ul className="list-disc list-outside space-y-4 mb-6 pl-6 ml-4">
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                Information transmitted to your Provider may not be sufficient
                to allow for appropriate medical decision making or your
                Provider may not be able to provide medical treatment for your
                condition via telehealth, and you may be required to seek
                alternative care.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                The inability of your Provider to conduct certain tests or
                assess vital signs in person may in some cases prevent the
                Provider from diagnosing or treating you or identifying that you
                need urgent medical care or treatment.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                Your medical care or treatment could be delayed due to
                technological failures that interrupt the Services.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                Data security protocols or safeguards could fail and cause a
                breach of your identified health information.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                Due to the nature of the Services and regulatory requirements in
                certain jurisdictions, your treatment options, especially
                pertaining to certain prescriptions, may be limited and may
                result in judgment errors.
              </li>
            </ul>
          </div>

          {/* Your Acknowledgements */}
          <div id="your-acknowledgements" className="mb-10 md:mb-14">
            <div className="text-[32px] md:text-[40px] leading-[115%] tracking-[-0.01em] md:tracking-[-0.02em] mb-6 headers-font">
              Your Acknowledgements
            </div>
            <p className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9] mb-6">
              By Clicking the “Agree,” box, you accept this Consent to
              Telehealth, and you acknowledge your understanding and agreement
              with respect to the following:
            </p>

            <ul className="list-disc list-outside space-y-4 mb-6 pl-6 ml-4">
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I have read this Consent to Telehealth carefully and understand
                the risks and benefits of the use of telehealth in my medical
                care and treatment.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I give my informed consent to receive medical care and
                treatment, by telehealth from Providers affiliated with Rocky
                Health USA LLC.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that the delivery of health care services via
                telehealth is an evolving field, and that the use of telehealth
                in my medical care and treatment may include uses of technology
                not specifically described in this consent.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that while the use of telehealth may provide
                potential benefits to me, as with any medical care service, no
                such benefits or specific results can be guaranteed. My
                condition may not be cured or improved, and in some cases, it
                may get worse.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that I have a duty to answer questions about my
                health, and medical history honestly and accurately, and to keep
                all of my health care providers, including my Provider,
                up-to-date on any changes in my health, symptoms, treatments, or
                medications.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that withholding or providing inaccurate
                information about my health and medical history in order to
                obtain treatment may result in harm to me, including, in some
                cases, death.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that my Provider may determine in his or her sole
                discretion that my condition is not suitable for treatment using
                telehealth, and that I may need to seek care and treatment from
                a specialist or other healthcare provider, outside of such
                telehealth technology.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that the Services enable coordination and
                communication with a Provider and do not replace my relationship
                with any existing health care provider.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that I cannot obtain emergency care through the
                Services, and I should call 9-1-1 and seek immediate medical
                treatment if I am experiencing a medical emergency.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that my information, including my identified health
                information, will be collected, used, shared, and protected as
                described in the Privacy Policy.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that I have access to all of my health and wellness
                information pertaining to my telehealth consultation with my
                Provider in accordance with applicable laws and regulations.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that I can have my telehealth record sent to my
                other health care providers by emailing Rocky Health USA LLC at
                contact@myrocky.com and providing my consent along with my
                health care provider’s name, address, and phone number. .
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that a technical failure affecting the Services may
                result in the loss of my information and/or interrupt my online
                visit. In addition to any disclaimers that I agreed to by
                accepting the Terms of Use, I agree to hold Rocky Health USA LLC
                harmless for any loss of information or delay in care resulting
                from a technical failure.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I understand that I can withhold or withdraw this consent at any
                time by emailing Rocky Health USA LLC at contact@myrocky.com
                with such instruction. Otherwise, this consent will be
                considered renewed upon each new telehealth consultation with a
                Provider. Any withdrawal of your consent will be effective upon
                receipt of written notice to your Providers, except that such
                withdrawal will not have any effect on any action taken by Rocky
                Health USA LLC or your Provider in reliance on this Consent to
                Telehealth before it received your written notice of withdrawal.
              </li>
              <li className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
                I agree and authorize Rocky Health USA LLC and my Providers to
                collect, use, and share my information, including my identified
                health information and other information regarding the
                telehealth exam, as described in Rocky Health USA LLC’s Privacy
                Policy and for any other purposes permitted by law, including
                for treatment, payment, and health care operations purposes.
              </li>
            </ul>
          </div>

          {/* Definitions */}
          <div id="definitions" className="mb-10 md:mb-14">
            <p className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9]">
              All capitalized terms used in this Consent to Telehealth but not
              defined herein have the meanings assigned to them in the Terms of
              Use. For avoidance of any doubt, the terms “myrocky“, “we“, “us“,
              or “our” refers to Rocky Health USA LLC and the terms “you” and
              “yours” refer to the person using the Services.
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <MoreQuestions buttonText="Start Free Consultation" />
      </div>
    </Section>
  );
};

export default ImpliedConsentContent;
