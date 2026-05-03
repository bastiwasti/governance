"use client";

import { useState } from "react";
import type { Service } from "@/lib/types";

const emptyForm = {
  name: "",
  slug: "",
  url: "",
  internal_url: "",
  type: "app" as "app" | "infra" | "cli",
  repo: "",
  health_endpoint: "/api/health",
  stats_endpoint: "",
  status: "active" as "active" | "maintenance" | "deprecated",
  notes: "",
};

export function RegistryForm({
  existing,
  onSaved,
  onCancel,
}: {
  existing?: Service;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    ...emptyForm,
    ...(existing
      ? {
          name: existing.name,
          slug: existing.slug,
          url: existing.url ?? "",
          internal_url: existing.internal_url ?? "",
          type: existing.type,
          repo: existing.repo ?? "",
          health_endpoint: existing.health_endpoint ?? "/api/health",
          stats_endpoint: existing.stats_endpoint ?? "",
          status: existing.status,
          notes: existing.notes ?? "",
        }
      : {}),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      ...form,
      url: form.url || null,
      internal_url: form.internal_url || null,
      repo: form.repo || null,
      health_endpoint: form.health_endpoint || null,
      stats_endpoint: form.stats_endpoint || null,
      notes: form.notes || null,
    };

    try {
      const res = await fetch(
        existing ? `/api/services/${existing.id}` : "/api/services",
        {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fehler beim Speichern");
        return;
      }

      if (!existing) {
        setForm({ ...emptyForm });
      }
      onSaved();
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
            required
            disabled={!!existing}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            URL (öffentlich)
          </label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://karten.eventig.app"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Internal URL
          </label>
          <input
            value={form.internal_url}
            onChange={(e) => setForm({ ...form, internal_url: e.target.value })}
            placeholder="http://karten:3002"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Typ</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as "app" | "infra" | "cli" })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          >
            <option value="app">App</option>
            <option value="infra">Infra</option>
            <option value="cli">CLI</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Repo</label>
          <input
            value={form.repo}
            onChange={(e) => setForm({ ...form, repo: e.target.value })}
            placeholder="bastiwasti/karten"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Health Endpoint
          </label>
          <input
            value={form.health_endpoint}
            onChange={(e) => setForm({ ...form, health_endpoint: e.target.value })}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Stats Endpoint
          </label>
          <input
            value={form.stats_endpoint}
            onChange={(e) => setForm({ ...form, stats_endpoint: e.target.value })}
            placeholder="/api/stats"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as "active" | "maintenance" | "deprecated",
              })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Notizen</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
        >
          {loading ? "..." : existing ? "Speichern" : "Hinzufügen"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-700"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
