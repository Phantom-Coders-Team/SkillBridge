import { redirect } from "next/navigation";
import { get2faPendingSession } from "@/lib/auth";
import { Verify2faForm } from "./Verify2faForm";

export const metadata = {
  title: "Two-Factor Verification | SkillBridge",
  description: "Secure sign-in with Google Authenticator or TOTP app",
};

export default async function Verify2faPage() {
  const pendingUser = await get2faPendingSession();

  if (!pendingUser) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Verify2faForm email={pendingUser.email} />
      </div>
    </main>
  );
}
