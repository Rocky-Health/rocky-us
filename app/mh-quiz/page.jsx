import MentalHealthQuestionnaire from "@/components/MentalHealthQuestionnaire/MentalHealthQuestionnaire";
import { cookies } from "next/headers";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default async function MHConsultationPage() {
  const cookieStore = await cookies();
  const pn = cookieStore.get("pn")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;
  const province = cookieStore.get("province")?.value;

  return (
    <main className="min-h-screen">
      <MentalHealthQuestionnaire
        pn={pn}
        userName={userName}
        userEmail={userEmail}
        province={province}
        dob={cookieStore.get("dob")?.value}
      />
    </main>
  );
}
