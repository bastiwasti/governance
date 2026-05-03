"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import type { UptimeCheck } from "@/lib/types";

function formatTime(ts: string): string {
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusToValue(s: string): number {
  if (s === "up") return 1;
  if (s === "degraded") return 0.5;
  return 0;
}

export function UptimeChart({ checks }: { checks: UptimeCheck[] }) {
  const data = checks.map((c) => ({
    time: formatTime(c.timestamp),
    status: statusToValue(c.status),
  }));

  return (
    <div className="h-48 w-full">
      <h3 className="mb-2 text-sm font-medium text-zinc-400">
        Uptime (30 Tage)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.5, 1]}
            tickFormatter={(v: number) =>
              v === 1 ? "up" : v === 0.5 ? "degraded" : "down"
            }
            width={70}
            tick={{ fill: "#71717a", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) =>
              value === 1 ? "up" : value === 0.5 ? "degraded" : "down"
            }
          />
          <Area
            type="stepAfter"
            dataKey="status"
            stroke="#10b981"
            fill="#10b98120"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResponseTimeChart({ checks }: { checks: UptimeCheck[] }) {
  const data = checks
    .filter((c) => c.response_ms !== null)
    .map((c) => ({
      time: formatTime(c.timestamp),
      ms: c.response_ms,
    }));

  return (
    <div className="h-48 w-full">
      <h3 className="mb-2 text-sm font-medium text-zinc-400">
        Response Time (ms)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => `${value}ms`}
          />
          <Line
            type="monotone"
            dataKey="ms"
            stroke="#6366f1"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
