"use client";

import { useState } from "react";
import Section from "@/components/utils/Section";
import StepOne from "@/components/HRW/StepOne";
import StepTwo from "@/components/HRW/StepTwo";
import StepThree from "@/components/HRW/StepThree";

// TK-438: client island — the three "how it works" steps share activeStep.
// The hero and MoreQuestions around it stay in the Server Component page.
export default function StepsClient() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Section>
      <StepOne activeStep={activeStep} setActiveStep={setActiveStep} />
      <br />
      <br />
      <StepTwo activeStep={activeStep} setActiveStep={setActiveStep} />
      <br />
      <br />
      <StepThree activeStep={activeStep} setActiveStep={setActiveStep} />
    </Section>
  );
}
