export type MappingRow = {
  header: string;
  key: string;
  enabled: boolean;
  sample: string;
};

export type FailedRow = {
  index: number;
  payload: Record<string, string>;
  error: string;
};
