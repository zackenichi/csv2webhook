import type { FailedRow } from "@/app/lib/types";

type StepWebhookProps = {
  webhookUrl: string;
  rowCount: number;
  includedCount: number;
  sending: boolean;
  sentCount: number;
  failCount: number;
  error: string;
  lastError: string;
  failedRows: FailedRow[];
  onWebhookChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onBack: () => void;
  onReset: () => void;
};

export default function StepWebhook({
  webhookUrl,
  rowCount,
  includedCount,
  sending,
  sentCount,
  failCount,
  error,
  lastError,
  failedRows,
  onWebhookChange,
  onSend,
  onStop,
  onBack,
  onReset,
}: StepWebhookProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Webhook delivery
          </h2>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 transition hover:border-slate-400"
            onClick={onBack}
          >
            Back to mapping
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          After mapping is ready, add your webhook URL. We will POST each row in
          order.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <input
            className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            placeholder="https://hooks.example.com/..."
            value={webhookUrl}
            onChange={(event) => onWebhookChange(event.target.value)}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onSend}
              disabled={sending}
            >
              {sending
                ? `Sending ${sentCount}/${rowCount}`
                : `Send ${rowCount || ""} rows`}
            </button>
            {sending ? (
              <button
                type="button"
                className="flex-1 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                onClick={onStop}
              >
                Stop sending
              </button>
            ) : null}
          </div>
          {error ? (
            <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          ) : null}
          {lastError ? (
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {lastError}
            </div>
          ) : null}
          {sentCount > 0 && !sending ? (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Sent {sentCount} rows · {failCount} failed
            </div>
          ) : null}
          {failedRows.length ? (
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {failedRows.length} rows failed after retries. Review or retry
              below.
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Sending checklist
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Double-check the essentials before you fire.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
            {rowCount || "No"} rows ready to send
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
            {includedCount || "No"} fields included in payload
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
            Webhook: {webhookUrl ? "Ready" : "Add a URL"}
          </div>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-300/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
            onClick={onReset}
            disabled={sending}
          >
            Reset flow
          </button>
        </div>
      </div>
    </section>
  );
}
