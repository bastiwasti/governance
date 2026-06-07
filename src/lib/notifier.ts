import { getDb } from "./db";
import type { Service } from "./types";

interface WebhookRow {
  id: number;
  url: string;
  label: string | null;
  events: string;
  is_active: number;
}

function getActiveWebhooks(): WebhookRow[] {
  return getDb()
    .prepare("SELECT * FROM webhooks WHERE is_active = 1")
    .all() as WebhookRow[];
}

function shouldFire(webhook: WebhookRow, event: string): boolean {
  const webhookEvents = webhook.events.split(",").map((e) => e.trim());
  const [prefix, type] = event.split(".");
  if (prefix === "service") return webhookEvents.includes(type);
  if (prefix === "backup") return webhookEvents.includes(`backup_${type}`);
  return false;
}

function buildNtfyPayload(
  service: Service,
  event: string
): { headers: Record<string, string>; body: string } {
  const isDown = event === "service.down";
  const isDegraded = event === "service.degraded";
  const title = isDown
    ? `${service.name} ist DOWN`
    : isDegraded
      ? `${service.name} ist DEGRADED`
      : `${service.name} wieder UP`;

  return {
    headers: {
      Title: title,
      Priority: isDown ? "high" : isDegraded ? "default" : "default",
      Tags: isDown ? "rotating_light" : isDegraded ? "warning" : "white_check_mark",
    },
    body: `${service.name} (${service.url ?? "keine URL"}) — Status: ${event.split(".")[1]}`,
  };
}

function buildGenericPayload(service: Service, event: string) {
  return {
    event,
    service: service.slug,
    service_name: service.name,
    service_url: service.url,
    timestamp: new Date().toISOString(),
  };
}

function buildDiscordPayload(service: Service, event: string) {
  const isDown = event === "service.down";
  const isDegraded = event === "service.degraded";
  const emoji = isDown ? "🔴" : isDegraded ? "🟡" : "🟢";
  const label = event.split(".")[1].toUpperCase();

  return {
    content: `${emoji} **${service.name}** ist ${label}`,
  };
}

async function sendWebhook(
  webhook: WebhookRow,
  service: Service,
  event: string
): Promise<void> {
  try {
    const isNtfy = webhook.url.includes("ntfy.sh");
    const isDiscord =
      webhook.url.includes("discord.com") || webhook.url.includes("discordapp.com");

    if (isNtfy) {
      const { headers, body } = buildNtfyPayload(service, event);
      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain", ...headers },
        body,
        signal: AbortSignal.timeout(5000),
      });
    } else if (isDiscord) {
      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildDiscordPayload(service, event)),
        signal: AbortSignal.timeout(5000),
      });
    } else {
      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGenericPayload(service, event)),
        signal: AbortSignal.timeout(5000),
      });
    }
  } catch (err) {
    console.error(`Webhook failed (${webhook.url}):`, err);
  }
}

export async function sendNotifications(
  service: Service,
  event: string
): Promise<void> {
  const webhooks = getActiveWebhooks();
  const relevant = webhooks.filter((w) => shouldFire(w, event));

  await Promise.allSettled(
    relevant.map((w) => sendWebhook(w, service, event))
  );
}

async function sendBackupWebhook(
  webhook: WebhookRow,
  status: string,
  message: string
): Promise<void> {
  try {
    const isNtfy = webhook.url.includes("ntfy.sh");
    const isDiscord =
      webhook.url.includes("discord.com") || webhook.url.includes("discordapp.com");

    if (isNtfy) {
      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Title: status === "failed" ? "Backup FEHLGESCHLAGEN" : "Backup WARNUNG",
          Priority: status === "failed" ? "high" : "default",
          Tags: status === "failed" ? "rotating_light" : "warning",
        },
        body: message,
        signal: AbortSignal.timeout(5000),
      });
    } else if (isDiscord) {
      const emoji = status === "failed" ? "🔴" : "🟡";
      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${emoji} **Backup ${status === "failed" ? "FEHLGESCHLAGEN" : "WARNUNG"}**: ${message}`,
        }),
        signal: AbortSignal.timeout(5000),
      });
    } else {
      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: `backup.${status}`,
          message,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5000),
      });
    }
  } catch (err) {
    console.error(`Backup webhook failed (${webhook.url}):`, err);
  }
}

export async function sendBackupNotification(
  status: string,
  message: string
): Promise<void> {
  const webhooks = getActiveWebhooks();
  const event = `backup.${status}`;
  const relevant = webhooks.filter((w) => shouldFire(w, event));

  await Promise.allSettled(
    relevant.map((w) => sendBackupWebhook(w, status, message))
  );
}
