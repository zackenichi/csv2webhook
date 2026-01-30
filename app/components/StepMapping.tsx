import type { MappingRow } from "@/app/lib/types";

type StepMappingProps = {
  mapping: MappingRow[];
  includedCount: number;
  examplePayload: Record<string, string> | null;
  onUpdateMapping: (index: number, updates: Partial<MappingRow>) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepMapping({
  mapping,
  includedCount,
  examplePayload,
  onUpdateMapping,
  onNext,
  onBack,
}: StepMappingProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Mapping preview</h2>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 transition hover:border-slate-400"
            onClick={onBack}
          >
            Back to upload
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          We auto-suggest field keys using common standards. Rename or remove
          anything before you send.
        </p>
        <div className="mt-4 space-y-3">
          {mapping.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-8 text-center text-sm text-slate-600">
              Upload a CSV to generate your mapping.
            </div>
          ) : (
            mapping.map((item, index) => (
              <div
                key={`${item.header}-${index}`}
                className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Header
                  </div>
                  <div className="mt-1 text-sm text-slate-900">
                    {item.header}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Sample: {item.sample || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Mapped key
                  </div>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                    value={item.key}
                    onChange={(event) =>
                      onUpdateMapping(index, { key: event.target.value })
                    }
                    placeholder="mappedField"
                  />
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      item.enabled
                        ? "border border-rose-400/60 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border border-slate-200/70 bg-white/80 text-slate-500"
                    }`}
                    onClick={() =>
                      onUpdateMapping(index, { enabled: !item.enabled })
                    }
                  >
                    {item.enabled ? "Remove" : "Removed"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Included {includedCount} of {mapping.length} fields
          </span>
          <button
            type="button"
            className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 transition hover:border-slate-400 disabled:opacity-40"
            onClick={onNext}
            disabled={mapping.length === 0}
          >
            Continue to webhook
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Example payload</h2>
        <p className="mt-2 text-sm text-slate-600">
          This is what we will send for the first row. Each row is sent as its
          own request.
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-900 p-4 text-xs text-emerald-200">
          <pre className="whitespace-pre-wrap">
            {examplePayload ? JSON.stringify(examplePayload, null, 2) : "{ }"}
          </pre>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Tip: Remove any field you do not want to forward, or rename keys to
          match your webhook schema.
        </div>
      </div>
    </section>
  );
}
