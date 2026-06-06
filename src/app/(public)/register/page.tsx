import type { Metadata } from "next";
import { getSession, getRedirectUrl } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register — KWD" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(getRedirectUrl(session.role));
  }

  return <RegisterForm />;
}
