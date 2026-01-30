type StepUploadProps = {
  csvName: string;
  headersCount: number;
  rowCount: number;
  onFile: (file: File | null) => void;
  onReset: () => void;
};

export default function StepUpload({
  csvName,
  headersCount,
  rowCount,
  onFile,
  onReset,
}: StepUploadProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Upload a CSV</h2>
        <p className="mt-2 text-sm text-slate-600">
          We only read headers and rows locally in your browser. Nothing is
          uploaded until you choose a webhook.
        </p>
        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300/80 bg-white/80 px-6 py-10 text-center transition hover:border-slate-400">
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          />
          <div className="text-3xl">📄</div>
          <div className="text-sm text-slate-700">
            Drop a CSV or click to browse
          </div>
          <div className="text-xs text-slate-500">
            {csvName ? `Loaded: ${csvName}` : "Max size depends on browser"}
          </div>
        </label>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 transition hover:border-slate-400"
            type="button"
            onClick={onReset}
          >
            Reset flow
          </button>
          {rowCount > 0 ? (
            <span className="text-xs text-slate-500">
              Detected {headersCount} headers · {rowCount} rows
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-slate-900">What happens?</h2>
        <p className="mt-2 text-sm text-slate-600">
          We will pull the header row, suggest field mappings, and let you
          remove anything before sending to a webhook.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-6 text-sm text-slate-600">
          Step 1: Upload your CSV to unlock mapping.
        </div>
      </div>
    </section>
  );
}
