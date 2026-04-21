import type { DragEvent } from 'react';

type StepUploadProps = {
  csvName: string;
  headersCount: number;
  rowCount: number;
  isDragging: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onFile: (file: File | null) => void;
  onReset: () => void;
};

export default function StepUpload({
  csvName,
  headersCount,
  rowCount,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFile,
  onReset,
}: StepUploadProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Upload a CSV</h2>
        <p className="mt-2 text-sm text-slate-600">
          We only read headers and rows locally in your browser. Nothing is
          uploaded until you choose a webhook, and we never store your CSV on
          our servers.
        </p>
        <label
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition ${
            isDragging
              ? 'border-slate-500 bg-slate-900/5 shadow-[0_0_0_6px_rgba(15,23,42,0.06)]'
              : 'border-slate-300/80 bg-white/80 hover:border-slate-400'
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          />
          <div className="text-3xl">📄</div>
          <div className="text-sm text-slate-700">
            {isDragging ? 'Release to upload your CSV' : 'Drop a CSV or click to browse'}
          </div>
          <div className="text-xs text-slate-500">
            {isDragging
              ? 'Drop the file anywhere inside this area'
              : csvName
                ? `Loaded: ${csvName}`
                : 'Max size depends on browser'}
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
