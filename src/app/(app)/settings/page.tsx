import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { Settings } from "lucide-react";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={Settings}
        title="Settings"
        subtitle="Manage your notifications, security, password, account preferences, and authorized devices."
      />
      <SettingsClient user={user} />
    </div>
  );
}
