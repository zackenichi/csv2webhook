import type { FailedRow } from "@/app/lib/types";

type FailedRowsProps = {
  rows: FailedRow[];
  sending: boolean;
  onRetry: () => void;
  onRemove: (index: number) => void;
};

export default function FailedRows({
  rows,
  sending,
  onRetry,
  onRemove,
}: FailedRowsProps) {
  if (!rows.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Failed rows</h3>
          <p className="text-sm text-slate-600">
            These rows were skipped after 3 attempts. Retry or remove them.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 transition hover:border-slate-400 disabled:opacity-40"
          onClick={onRetry}
          disabled={sending}
        >
          Retry failed
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((item) => (
          <div
            key={item.index}
            className="flex flex-col gap-2 rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Row {item.index + 1}</span>
              <button
                type="button"
                className="rounded-full border border-rose-300 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-100"
                onClick={() => onRemove(item.index)}
                disabled={sending}
              >
                Remove
              </button>
            </div>
            <div className="text-xs text-rose-600">{item.error}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
