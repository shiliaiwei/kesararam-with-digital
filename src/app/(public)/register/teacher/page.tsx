import { redirect } from "next/navigation";

export default async function TeacherApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string }>;
}) {
  const sp = await searchParams;
  const plan = sp.plan || "teacher_pro";
  const cycle = sp.cycle || "yearly";
  redirect(`/register?plan=${plan}&cycle=${cycle}`);
}
