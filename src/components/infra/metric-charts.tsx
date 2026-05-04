"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { InfraMetric } from "@/lib/types";

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

interface ChartProps {
  metrics: InfraMetric[];
  metricType: string;
  valueKey: string;
  label: string;
  unit: string;
  domainMax?: number;
  timeFormatter?: (ts: string) => string;
}

function MetricChart({
  metrics,
  metricType,
  valueKey,
  label,
  unit,
  domainMax,
  timeFormatter = formatTime,
}: ChartProps) {
  const dockerHost = metrics
    .filter((m) => m.host === "docker-host" && m.metric_type === metricType)
    .map((m) => {
      const val = JSON.parse(m.value_json);
      return {
        time: timeFormatter(m.timestamp),
        docker_host: val[valueKey],
      };
    });

  const devVm = metrics
    .filter((m) => m.host === "dev-vm" && m.metric_type === metricType)
    .map((m) => {
      const val = JSON.parse(m.value_json);
      return {
        time: timeFormatter(m.timestamp),
        dev_vm: val[valueKey],
      };
    });

  const timeSet = new Set([...dockerHost.map((d) => d.time), ...devVm.map((d) => d.time)]);
  const times = [...timeSet];

  const data = times.map((time) => {
    const dh = dockerHost.find((d) => d.time === time);
    const dv = devVm.find((d) => d.time === time);
    return {
      time,
      "docker-host": dh?.docker_host ?? null,
      "dev-vm": dv?.dev_vm ?? null,
    };
  });

  return (
    <div className="h-64 w-full">
      <h3 className="mb-2 text-sm font-medium text-zinc-400">{label}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            tick={{ fill: "#71717a", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domainMax ? [0, domainMax] : undefined}
            tick={{ fill: "#71717a", fontSize: 11 }}
            width={40}
            tickFormatter={(v: number) => `${v}${unit}`}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => `${value}${unit}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#71717a" }}
          />
          <Line
            type="monotone"
            dataKey="docker-host"
            stroke="#6366f1"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="dev-vm"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CpuChart({ metrics }: { metrics: InfraMetric[] }) {
  return (
    <MetricChart
      metrics={metrics}
      metricType="cpu"
      valueKey="total_pct"
      label="CPU-Auslastung (24h)"
      unit="%"
      domainMax={100}
    />
  );
}

export function MemoryChart({ metrics }: { metrics: InfraMetric[] }) {
  return (
    <MetricChart
      metrics={metrics}
      metricType="memory"
      valueKey="percent"
      label="RAM-Auslastung (24h)"
      unit="%"
      domainMax={100}
    />
  );
}

export function DiskChart({ metrics }: { metrics: InfraMetric[] }) {
  return (
    <MetricChart
      metrics={metrics}
      metricType="disk"
      valueKey="percent"
      label="Disk-Auslastung (7 Tage)"
      unit="%"
      domainMax={100}
      timeFormatter={formatDate}
    />
  );
}
