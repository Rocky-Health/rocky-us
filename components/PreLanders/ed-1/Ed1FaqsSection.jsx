import Ed1FaqsSectionLayout from "@/components/PreLanders/ed-1/Ed1FaqsSectionLayout";
import Section from "@/components/utils/Section";

/**
 * FAQ copy for `/ed-1` only — edit questions, answers, and headings here.
 */
const ED_1_FAQ_ITEMS = [
  {
    question: "If the blue pill didn't work for me, could DirectMax?",
    answer: `<p>Many men who haven't gotten the results they wanted from a single-ingredient ED medication still respond well to a different approach.</p>
<p>DirectMax isn't one molecule in a standard tablet — it's a physician-designed formula that combines sildenafil, tadalafil, and apomorphine to work on performance from multiple angles. It dissolves under the tongue and absorbs directly into the bloodstream, which can behave differently than pills you swallow.</p>
<p>Our licensed physicians review your history and tailor strength and dosing to you. While no treatment works for everyone, this level of personalization is how we aim to improve on what you've tried before.</p>`,
  },
  {
    question: "How quickly does DirectMax start working?",
    answer: `<p>Unlike traditional tablets that must pass through the digestive system, DirectMax dissolves under the tongue and absorbs directly into the bloodstream. By bypassing the liver and stomach, it's able to begin working fast — typically within 15 minutes or less.</p>
<p>For peak performance, we recommend taking DirectMax about 30 minutes before intimacy.</p>`,
  },
  {
    question: "How long do the effects last?",
    answer: `<p>DirectMax is built for endurance — not just speed.</p>
<p>Most patients experience effects lasting 24–36 hours, giving you a wider window of confidence instead of a narrow, high-pressure timeframe.</p>
<p>That means less planning.</p>
<p>Less rushing.</p>
<p>More natural spontaneity.</p>
<p>Because DirectMax includes long-acting ingredients, its duration may vary depending on your metabolism and overall health. If you have liver or kidney conditions — or take certain medications — the effects may last longer. Our licensed physicians review your medical history carefully to ensure safe, personalized dosing.</p>
<p>Elite performance should feel controlled — not unpredictable. That's why every prescription is tailored specifically to you.</p>`,
  },
  {
    question: "What about some of the common side effects?",
    answer: `<p>As with all prescription medications, DirectMax may cause side effects in some patients. The most commonly reported include:</p>
<ul class="list-disc pl-5 mt-2 mb-4 space-y-1">
<li>Headache</li>
<li>Flushing</li>
<li>Nasal congestion</li>
<li>Mild indigestion</li>
<li>Dizziness</li>
<li>Back or muscle discomfort</li>
<li>Nausea</li>
<li>Temporary vision changes (such as a blue tint or mild blurring)</li>
<li>Mild irritation under the tongue (due to the sublingual formula)</li>
</ul>
<p>Most side effects, when they occur, are temporary and mild.</p>
<p>Because DirectMax combines multiple active ingredients, our licensed physicians carefully review your medical history and customize your dosage to help minimize unwanted effects while maximizing performance.</p>
<p>Your safety comes first. Your results come next. And we work to optimize both.</p>`,
  },
  {
    question: "How much does DirectMax cost?",
    answer: `<p>DirectMax pricing is based on your selected strength, pack size, and delivery preference — with doses starting at approximately $9 per dose.</p>
<p>Each strength is packaged in a standard 6-dose pack, with larger quantities available (up to 20 doses) for added convenience and value.</p>
<p>Standard per-dose pricing:</p>
<ul class="list-disc pl-5 mt-2 mb-4 space-y-1">
<li>Low Strength: $8.78 per dose</li>
<li>Medium Strength: $9.28 per dose</li>
<li>High Strength: $10.78 per dose</li>
</ul>
<p>From time to time, we offer limited promotions where introductory pricing may start as low as $7.45 per dose!</p>
<p>To see your exact total — including any eligible savings — simply complete the secure online medical questionnaire. Your personalized pricing will be displayed before checkout.</p>
<p>For patients who choose a membership option, plans can be canceled anytime directly through your Direct Meds Patient Portal.</p>
<p>Premium care. Transparent pricing. No surprises.</p>`,
  },
  {
    question: "How do I contact support?",
    answer: `<p>You can reach our friendly discreet support team by emailing <a href="mailto:help@directmeds.com" class="underline font-medium text-gray-900 hover:text-gray-700">help@directmeds.com</a> or calling us at <a href="tel:+18886967176" class="underline font-medium text-gray-900 hover:text-gray-700">(888) 696-7176</a>. For faster service, visit our Patient Services page to submit a message, request a refill, or check order status. We're here to help!</p>`,
  },
];

export default function Ed1FaqsSection() {
  return (
    <Section bg="bg-[#F5F4EF]" containerClassName="max-w-[1440px] mx-auto">
      <Ed1FaqsSectionLayout
        faqs={ED_1_FAQ_ITEMS}
        title={
          <>
            DirectMax <span className="text-[#AE7E56]">FAQ&apos;s</span>
          </>
        }
        subtitle="We've got your back."
        name={
          <>
            Remember, you will always have full access to our{" "}
            <span className="font-medium text-[#AE7E56]">discreet doctors</span>{" "}
            and nursing staff to answer any questions you have at any time.
          </>
        }
      />
    </Section>
  );
}
