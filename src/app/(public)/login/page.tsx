import type { Metadata } from "next";
import { getSession, getRedirectUrl } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log In — KWD" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(getRedirectUrl(session.role));
  }

  return <LoginForm />;
}

