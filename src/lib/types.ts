export interface Service {
  id: number;
  name: string;
  slug: string;
  url: string | null;
  internal_url: string | null;
  type: "app" | "infra" | "cli";
  repo: string | null;
  health_endpoint: string | null;
  stats_endpoint: string | null;
  status: "active" | "maintenance" | "deprecated";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UptimeCheck {
  id: number;
  service_id: number;
  timestamp: string;
  status: "up" | "degraded" | "down";
  response_ms: number | null;
  http_status_code: number | null;
  app_status: string | null;
  version: string | null;
  error_message: string | null;
}

export interface StatsSnapshot {
  id: number;
  service_id: number;
  collected_at: string;
  endpoint_available: number;
  data_json: string | null;
}

export interface InfraMetric {
  id: number;
  host: string;
  metric_type: string;
  value_json: string;
  timestamp: string;
}

export type ServiceCreateInput = Omit<
  Service,
  "id" | "created_at" | "updated_at"
>;

export interface Incident {
  id: number;
  service_id: number;
  status: "open" | "resolved";
  severity: "down" | "degraded";
  started_at: string;
  resolved_at: string | null;
  duration_minutes: number | null;
  trigger_check_id: number | null;
  resolve_check_id: number | null;
}

export interface Webhook {
  id: number;
  url: string;
  label: string | null;
  events: string;
  is_active: number;
  created_at: string;
}

export type WebhookCreateInput = Omit<Webhook, "id" | "created_at">;

export type ServiceUpdateInput = Partial<ServiceCreateInput>;

export interface ServiceWithLatestCheck extends Service {
  latest_status: "up" | "degraded" | "down" | "unknown";
  latest_response_ms: number | null;
  latest_check_time: string | null;
  uptime_24h: number | null;
  stats_available: boolean;
  open_incident: number;
}
