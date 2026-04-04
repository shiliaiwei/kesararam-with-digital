import type { Metadata } from "next";
import { getSession, getRedirectUrl } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log In — KWD" };

export default async function LoginPage() {
  try {
    const session = await getSession();
    if (session) {
      redirect(getRedirectUrl(session.role));
    }

    return <LoginForm />;
  } catch (e: any) {
    return <div style={{ color: "red", padding: "20px" }}>
      <h1>Internal Server Error (Caught)</h1>
      <pre>{e.message}</pre>
      <pre>{e.stack}</pre>
    </div>;
  }
}
