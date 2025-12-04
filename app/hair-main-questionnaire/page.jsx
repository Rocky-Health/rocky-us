import HairConsultation from "@/components/HairQuestionnaire/HairConsultationQuiz";
import { cookies } from "next/headers";

export default async function HairConsultationPage() {
  const cookieStore = await cookies();
  const pn = cookieStore.get("pn")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;
  const province = cookieStore.get("province")?.value;
  const dob = cookieStore.get("dob")?.value;

  return (
    <main className="min-h-screen">
      <HairConsultation
        pn={pn}
        userName={userName}
        userEmail={userEmail}
        province={province}
        dob={dob}
      />
    </main>
  );
}
