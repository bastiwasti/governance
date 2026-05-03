"use client";

import { useState } from "react";
import { RegistryForm } from "./registry-form";
import type { Service } from "@/lib/types";

export function RegistryClient({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data);
  }

  async function handleDelete(id: number) {
    if (!confirm("Service wirklich löschen?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Service Registry
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Services verwalten und konfigurieren
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          {showForm ? "Formular ausblenden" : "+ Neuer Service"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            {editing ? "Service bearbeiten" : "Neuer Service"}
          </h2>
          <RegistryForm
            existing={editing ?? undefined}
            onSaved={() => {
              load();
              setShowForm(false);
              setEditing(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {services.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-500">
            Keine Services registriert. Klicke auf &quot;+ Neuer
            Service&quot; um zu beginnen.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Slug</th>
                <th className="pb-3 pr-4 font-medium">Typ</th>
                <th className="pb-3 pr-4 font-medium">URL</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-800/50 text-zinc-300"
                >
                  <td className="py-3 pr-4 font-medium text-zinc-200">
                    {s.name}
                  </td>
                  <td className="py-3 pr-4 text-zinc-500">{s.slug}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-500">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-zinc-300"
                      >
                        {s.url.replace("https://", "")}
                      </a>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        s.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : s.status === "maintenance"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-zinc-700/50 text-zinc-500"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(s);
                          setShowForm(true);
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-xs text-red-500/60 hover:text-red-400"
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
