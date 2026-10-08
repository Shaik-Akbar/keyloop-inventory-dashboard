type LogEvent =
  | "inventory_loaded"
  | "inventory_load_failed"
  | "filter_applied"
  | "page_changed"
  | "action_logged"
  | "action_log_failed"
  | "api_error";

export function correlationId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function log(event: LogEvent, data: Record<string, unknown> = {}): void {
  // Structured client logging: one line per event, machine-parseable.
  // In production this would ship to Azure App Insights / New Relic
  // instead of console, keyed by the same correlationId the API client injects.
  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  );
}
