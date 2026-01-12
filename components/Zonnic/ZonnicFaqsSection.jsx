import FaqsSection from "@/components/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
const faqs = [
    {
        question: "What are the potential side effects of using ZONNIC?",
        answer: `
      <div class="pb-4 text-gray-700">
        <ul class="list-disc list-inside ml-2 mb-5">
          <li>A burning sensation at the placement site inside the lip</li>
          <li>Mouth/tongue tingling</li>
          <li>Tingling/burning after the pouch is removed from inside the lip</li>
        </ul>
        <p>Patients should stop using an NRT product and seek medical advice if any of the following symptoms arise:</p>
        <ul class="list-disc list-inside ml-2 my-5">
          <li>Irregular heartbeat</li>
          <li>Allergic reaction</li>
          <li>Feeling faint, dizziness</li>
          <li>Nausea; vomiting, stomach upset, abdominal pain, severe heartburn</li>
          <li>Fatigue or weakness</li>
          <li>Headache</li>
          <li>Cold sweats, mental confusion, palpitations, chest pain and/or leg pain</li>
          <li>Blurred vision</li>
          <li>Seizures</li>
        </ul>
        <p>ZONNIC may not be suitable for patients who:</p>
        <ul class="list-disc list-inside ml-2 mb-5">
          <li>Have or have had heart, thyroid, circulation, stomach, or throat or mouth problems, high blood pressure, diabetes, seizures</li>
          <li>Are taking insulin or any prescription medicine</li>
          <li>Are pregnant or nursing</li>
        </ul>
        <p>NRTs are not recommended for occasional smokers, non-smokers, or non-nicotine users.</p>
      </div>
    `,
    },
    {
        question: "Are there any precautions to take before using ZONNIC?",
        answer: `
      <div class="pb-4 text-gray-700">
        <p>ZONNIC is not recommended for:</p>
        <ul class="list-disc list-inside ml-2 mb-5">
          <li>Individuals under 18 years old</li>
          <li>Pregnant or breastfeeding women</li>
          <li>Non-smokers</li>
          <li>Those with specific medical conditions</li>
        </ul>
        <p>Consult your healthcare provider before use, especially if you have:</p>
        <ul class="list-disc list-inside ml-2 mb-5">
          <li>Heart conditions</li>
          <li>High blood pressure</li>
          <li>Stomach or digestive issues</li>
          <li>Other ongoing medical conditions</li>
        </ul>
      </div>
    `,
    },
    {
        question:
            "How do ZONNIC pouches compare to other Nicotine Replacement Therapy (NRT) options like lozenges, gums, or sprays?",
        answer: `
      <div class="pb-4 text-gray-700">
        <p>Among the various Nicotine Replacement Therapy (NRT) products available in US, ZONNIC is unique as the only pouch format approved by FDA-Approved. Similar to lozenges and gums, ZONNIC provides nicotine via oral absorption, offering temporary relief from cravings and withdrawal symptoms.</p>
      </div>
    `,
    },
    {
        question: "What ingredients are in ZONNIC pouches?",
        answer: `
      <div class="pb-4 text-gray-700">
        <p class="font-400"> Mint Flavour (grey)</p>
        <p class="font-[400]"><span class="font-[600]">Medicinal:</span> 4mg nicotine per pouch</p>
        <p class="font-[400] mb-5"><span class="font-[600]">Non-medicinal:</span> nicotine, mint flavour, microcrystalline cellulose, propylene glycol, sodium alginate, sodium bicarbonate, sodium chloride, sucralose, water, xylitol.</p>
      
        <p class="font-400"> Spearmint Flavour (green)</p>
        <p class="font-[400]"><span class="font-[600]">Medicinal:</span> 4mg nicotine per pouch</p>
        <p class="font-[400] mb-5"><span class="font-[600]">Non-medicinal:</span> nicotine, spearmint flavour, microcrystalline cellulose, propylene glycol, sodium alginate, sodium bicarbonate, sodium chloride, sucralose, water, xylitol.</p>
      
        <p class="font-400">Peppermint Flavour (blue)</p>
        <p class="font-[400]"><span class="font-[600]">Medicinal:</span> 4mg nicotine per pouch</p>
        <p class="font-[400] mb-5"><span class="font-[600]">Non-medicinal:</span> nicotine, peppermint flavour, microcrystalline cellulose, propylene glycol, sodium alginate, sodium bicarbonate, sodium chloride, sucralose, water, xylitol.</p>
      

        
      </div>
    `,
    },
    {
        question: "Is ZONNIC similar to smokeless tobacco?",
        answer: `
      <div class="pb-4 text-gray-700">
        <p>No, ZONNIC does not contain tobacco. Unlike smokeless tobacco products available in US, ZONNIC is approved by FDA-Approved as a recognized Nicotine Replacement Therapy.</p>
      </div>
    `,
    },
    {
        question: "What is the recommended dosing schedule for ZONNIC?",
        answer: `
      <div class="pb-4 text-gray-700">
        <ul class="list-disc list-inside ml-2 mb-5">
          <li><strong>Month 1:</strong> 1 pouch every 1-2 hours (up to 15 pouches a day).</li>
          <li><strong>Month 2:</strong> 1 pouch every 2-4 hours</li>
          <li><strong>Month 3:</strong> 1 pouch every 4-8 hours</li>
        </ul>
        <p>Users should not exceed 15 pouches in a 24-hour period.</p>
      </div>
    `,
    },
    {
        question:
            "What additional information can I offer my patients on ZONNIC?",
        answer: `
      <div class="pb-4 text-gray-700">
        <ul class="list-disc list-inside ml-2 mb-5">
          <li>Place the nicotine pouch inside the upper lip; do not chew or swallow it</li>
          <li>Repeat the nicotine pouch dose with a new pouch when the urge to smoke is felt</li>
          <li>Use one pouch at a time</li>
          <li>Store nicotine pouches in their original packaging in a dry place at room temperature</li>
          <li>Check the expiry date on the product</li>
          <li>Avoid drinking acidic beverages (coffee, tea, soft drinks, alcohol) while using ZONNIC</li>
          <li>Dispose of ZONNIC responsibly; each container features a receptacle under the lid for disposing of used pouches</li>
          <li>Keep nicotine pouches out of the reach of children and pets</li>
        </ul>
      </div>
    `,
    },
];

const ZonnicFaqsSection = () => {
    return (
        <div className="mx-auto">
            <FaqsSection
                faqs={faqs}
                title="Your Questions, Answered"
                subtitle="Frequently asked questions"
                name="Meet ZONNIC"
            />
            <MoreQuestions link="/faqs/" />
        </div>
    );
};

export default ZonnicFaqsSection;
