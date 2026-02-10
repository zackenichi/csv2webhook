export type MappingRow = {
  header: string;
  key: string;
  enabled: boolean;
  sample: string;
  source: "csv" | "static";
  value?: string;
};

export type FailedRow = {
  index: number;
  payload: Record<string, string>;
  error: string;
};
