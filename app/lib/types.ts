export type MappingRow = {
  header: string;
  key: string;
  enabled: boolean;
  sample: string;
  source: "csv" | "static";
  value?: string;
};

export type WebhookHeader = {
  key: string;
  value: string;
  enabled: boolean;
};

export type FailedRow = {
  index: number;
  payload: Record<string, string>;
  error: string;
};
