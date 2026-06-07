"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, FileText, FolderOpen } from "lucide-react";
import type { BackupFile, BackupCheck } from "@/lib/types";

interface Props {
  initialFiles: BackupFile[];
  initialChecks: BackupCheck[];
  initialError: string | null;
}

export function BackupBrowser({ initialFiles, initialChecks, initialError }: Props) {
  const [files, setFiles] = useState(initialFiles);
  const [checks, setChecks] = useState(initialChecks);
  const [error, setError] = useState(initialError);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState("all");

  async function refresh() {
    setChecking(true);
    try {
      const res = await fetch("/api/backups");
      const data = await res.json();
      setFiles(data.files);
      setChecks(data.checks);
      setError(data.error ?? null);
    } catch (err) {
      setError(String(err));
    }
    setChecking(false);
  }

  async function runManualCheck() {
    setChecking(true);
    try {
      const res = await fetch("/api/backups", { method: "POST" });
      if (res.ok) {
        await refresh();
        return;
      }
    } catch {}
    setChecking(false);
  }

  const filteredFiles =
    filter === "all"
      ? files
      : filter === "today"
        ? files.filter((f) => f.is_today)
        : files.filter((f) => f.database === filter);

  const databases = [...new Set(files.map((f) => f.database).filter(Boolean))];
  const latestCheck = checks[0];

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Backups</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tägliche PostgreSQL-Backups um 03:00 Uhr
          </p>
        </div>
        <button
          onClick={runManualCheck}
          disabled={checking}
          className="flex items-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Prüfe..." : "Jetzt prüfen"}
        </button>
      </div>

      {latestCheck && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            latestCheck.status === "success"
              ? "border-emerald-900 bg-emerald-950/30"
              : latestCheck.status === "warning"
                ? "border-amber-900 bg-amber-950/30"
                : "border-red-900 bg-red-950/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {latestCheck.status === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : latestCheck.status === "warning" ? (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <span className="text-sm font-medium text-zinc-200">
              Letzter Check: {formatDate(latestCheck.check_time)} —{" "}
              {latestCheck.status === "success"
                ? "Alle Backups OK"
                : latestCheck.status === "warning"
                  ? "Teilweise fehlgeschlagen"
                  : "Fehlgeschlagen"}
            </span>
          </div>
          {latestCheck.message && (
            <p className="mt-1 text-sm text-zinc-400">{latestCheck.message}</p>
          )}
        </div>
      )}

      {error && !files.length && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 p-4">
          <p className="text-sm text-red-400">Fehler beim Laden: {error}</p>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-200">
              Backup-Dateien
            </h2>
            <span className="text-xs text-zinc-600">
              ({filteredFiles.length} Dateien)
            </span>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="all">Alle</option>
              <option value="today">Heute</option>
              {databases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Keine Dateien gefunden.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Datei</th>
                  <th className="pb-2 pr-4">Datenbank</th>
                  <th className="pb-2 pr-4">Größe</th>
                  <th className="pb-2 pr-4">Geändert</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, i) => (
                  <tr
                    key={`${file.name}-${i}`}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-600" />
                        <span className="text-zinc-300 break-all">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-zinc-500">
                      {file.database || "—"}
                    </td>
                    <td className="py-2 pr-4 text-zinc-400">
                      {file.size_human}
                    </td>
                    <td className="py-2 pr-4 text-zinc-500">
                      {formatDate(file.modified)}
                    </td>
                    <td className="py-2">
                      {file.is_today ? (
                        <span className="rounded bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">
                          Heute
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                          Älter
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {checks.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Check-Verlauf
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                  <th className="pb-2 pr-4">Zeitpunkt</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr
                    key={check.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="py-2 pr-4 text-zinc-400">
                      {formatDate(check.check_time)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          check.status === "success"
                            ? "bg-emerald-900/50 text-emerald-400"
                            : check.status === "warning"
                              ? "bg-amber-900/50 text-amber-400"
                              : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {check.status === "success"
                          ? "OK"
                          : check.status === "warning"
                            ? "Warnung"
                            : "Fehler"}
                      </span>
                    </td>
                    <td className="py-2 text-zinc-500">
                      {check.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
