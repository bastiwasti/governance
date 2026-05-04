import { getDb } from "@/lib/db";
import { WebhookManager } from "@/components/webhook-manager";
import type { Webhook } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const db = getDb();
  const webhooks = db
    .prepare("SELECT * FROM webhooks ORDER BY created_at DESC")
    .all() as Webhook[];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Webhooks &amp; Benachrichtigungen
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-lg font-medium text-zinc-200">Webhooks</h2>
          <p className="mb-4 text-sm text-zinc-500">
            Bei Statuswechseln wird ein POST an alle aktiven Webhooks gesendet.
            Unterstützt ntfy.sh, Discord und generische Webhooks.
          </p>
          <WebhookManager webhooks={webhooks} />
        </div>
      </div>
    </>
  );
}
