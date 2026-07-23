"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/utils/Section";
import {
  PHASE_1_STATES,
  PHASE_2_STATES,
  PHASE_3_STATES,
  getStateLabel,
} from "@/lib/constants/usStates";
import { MdLocationOn, MdSchedule } from "react-icons/md";

export default function ServiceCoverageClient() {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState(1);

  return (
    <>
      {/* Header Section */}
      <Section>
        <div className="max-w-[800px] mx-auto text-center">
          <div className="text-[#AE7E56] text-[12px] md:text-[14px] font-[500] uppercase mb-1 md:mb-2">
            Service Availability
          </div>
          <h1 className="text-[32px] md:text-[48px] tracking-[-0.01em] md:tracking-[-0.02em] leading-[115%] md:leading-[100%] headers-font mb-4">
            Where We Serve
          </h1>
          <p className="text-[16px] md:text-[18px] font-[400] leading-[140%] text-gray-600 mb-8">
            We're expanding across the United States to bring you convenient,
            professional healthcare. Here's where we currently serve and our
            expansion plans.
          </p>
          <div className="inline-flex items-center justify-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActivePhase(1)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activePhase === 1
                  ? "bg-white text-black shadow"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Phase 1
            </button>
            <button
              onClick={() => setActivePhase(2)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activePhase === 2
                  ? "bg-white text-black shadow"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Phase 2
            </button>
          </div>
        </div>
      </Section>

      {/* Current Coverage Section */}
      {activePhase === 1 && (
        <Section bg="bg-[#F8F7F5]">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#AE7E56] bg-opacity-10 text-[#AE7E56] px-4 py-2 rounded-full mb-4">
                <MdLocationOn size={20} />
                <span className="font-medium">Currently Available</span>
              </div>
              <h2 className="text-[24px] md:text-[32px] headers-font font-medium mb-4">
                Phase 1
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {PHASE_1_STATES.map((stateCode) => (
                <div
                  key={stateCode}
                  className="bg-white rounded-lg p-4 text-center shadow-sm border border-[#AE7E56] border-opacity-20 hover:shadow-md hover:border-[#AE7E56] hover:border-opacity-40 transition-all"
                >
                  <div className="text-[#AE7E56] font-medium text-sm md:text-base">
                    {getStateLabel(stateCode)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stateCode}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Coming Soon Section */}
      <Section>
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full mb-4">
              <MdSchedule size={20} />
              <span className="font-medium">Coming Soon</span>
            </div>
            <h2 className="text-[24px] md:text-[32px] headers-font font-medium mb-4">
              Phase 2
            </h2>
            <p className="text-gray-600 mb-6">
              We're expanding to these {PHASE_2_STATES.length} states, covering
              an additional 7% of the target population.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {PHASE_2_STATES.map((stateCode) => (
              <div
                key={stateCode}
                className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="text-gray-600 font-medium text-sm md:text-base">
                  {getStateLabel(stateCode)}
                </div>
                <div className="text-xs text-gray-500 mt-1">{stateCode}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Call to Action Section */}
      <Section>
        <div className="max-w-[600px] mx-auto text-center">
          <h3 className="text-[24px] md:text-[32px] headers-font font-medium mb-4">
            Want to be notified when we launch in your state?
          </h3>
          <p className="text-gray-600 mb-8">
            We're working hard to expand our services. Stay updated on our
            expansion plans and be the first to know when we're available in
            your area.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/login-register")}
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push("/contact-us")}
              className="bg-white border border-black text-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors font-medium"
            >
              Contact Us
            </button>
          </div>
        </div>
      </Section>

      {/* Footer Note */}
      <Section bg="bg-gray-50">
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-sm text-gray-500">
            Coverage may vary by service type. Please contact us for specific
            availability in your state. We're committed to providing safe,
            secure, and professional healthcare services.
          </p>
        </div>
      </Section>
    </>
  );
}
