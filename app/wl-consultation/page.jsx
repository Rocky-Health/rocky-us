import NewBOWLConsultationQuiz from "@/components/WeightQuestionnaire/BOWeightConsultationQuiz";
import { cookies } from "next/headers";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Separate route dedicated ONLY for new BO flows
// This is completely independent from /wl-consultation
export default async function NewBOWLConsultationPage() {
  const cookieStore = await cookies();
  const pn = cookieStore.get("pn")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;
  const province = cookieStore.get("province")?.value;
  const dob = cookieStore.get("dob")?.value;

  return (
    <main className="min-h-screen">
      <NewBOWLConsultationQuiz
        pn={pn}
        userName={userName}
        userEmail={userEmail}
        province={province}
        dob={dob}
      />
    </main>
  );
}
