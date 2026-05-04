"use client";

import { useState } from "react";
import type { Webhook } from "@/lib/types";

export function WebhookManager({ webhooks: initial }: { webhooks: Webhook[] }) {
  const [webhooks, setWebhooks] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [events, setEvents] = useState("down,up");
  const [testing, setTesting] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function addWebhook() {
    setError("");
    if (!url.trim()) return;

    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), label: label.trim() || null, events }),
    });

    if (!res.ok) {
      setError("Fehler beim Speichern");
      return;
    }

    const webhook = await res.json();
    setWebhooks([webhook, ...webhooks]);
    setUrl("");
    setLabel("");
    setEvents("down,up");
    setShowForm(false);
  }

  async function deleteWebhook(id: number) {
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    setWebhooks(webhooks.filter((w) => w.id !== id));
  }

  async function toggleWebhook(id: number, isActive: number) {
    await fetch(`/api/webhooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
    });
    setWebhooks(
      webhooks.map((w) => (w.id === id ? { ...w, is_active: isActive ? 0 : 1 } : w))
    );
  }

  async function testWebhook(id: number) {
    setTesting(id);
    setError("");
    try {
      const res = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_id: id }),
      });
      if (!res.ok) {
        setError("Test fehlgeschlagen");
      }
    } catch {
      setError("Test fehlgeschlagen");
    }
    setTesting(null);
  }

  function detectProvider(url: string): string {
    if (url.includes("ntfy.sh")) return "ntfy.sh";
    if (url.includes("discord.com") || url.includes("discordapp.com")) return "Discord";
    return "Generic Webhook";
  }

  return (
    <div className="space-y-4">
      {webhooks.length === 0 && !showForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-500">
            Keine Webhooks konfiguriert.
          </p>
        </div>
      )}

      {webhooks.map((w) => (
        <div
          key={w.id}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-200">
                  {w.label || detectProvider(w.url)}
                </p>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                  {detectProvider(w.url)}
                </span>
                {!w.is_active && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-600">
                    Inaktiv
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500 break-all">{w.url}</p>
              <p className="mt-1 text-xs text-zinc-600">
                Events: {w.events}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => testWebhook(w.id)}
                disabled={testing === w.id}
                className="rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
              >
                {testing === w.id ? "..." : "Test"}
              </button>
              <button
                onClick={() => toggleWebhook(w.id, w.is_active)}
                className="rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                {w.is_active ? "Deaktivieren" : "Aktivieren"}
              </button>
              <button
                onClick={() => deleteWebhook(w.id)}
                className="rounded bg-zinc-800 px-3 py-1 text-xs text-red-400 hover:bg-zinc-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ntfy.sh/mein-topic"
              className="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ntfy Alerts"
              className="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Events</label>
            <select
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              className="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="down,up">Down + Up</option>
              <option value="down">Nur Down</option>
              <option value="down,degraded,up">Down + Degraded + Up</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={addWebhook}
              className="rounded bg-zinc-700 px-4 py-1.5 text-sm text-zinc-200 hover:bg-zinc-600"
            >
              Speichern
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="rounded bg-zinc-800 px-4 py-1.5 text-sm text-zinc-400 hover:bg-zinc-700"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
        >
          + Webhook hinzufügen
        </button>
      )}
    </div>
  );
}
