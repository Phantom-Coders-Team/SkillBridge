import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction} className="w-full">
      <button
        type="submit"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.99] dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
      >
        <LogOut className="size-3.5" />
        <span>Sign Out</span>
      </button>
    </form>
  );
}
