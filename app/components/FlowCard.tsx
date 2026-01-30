type FlowCardProps = {
  step: 1 | 2 | 3;
  sending: boolean;
  headersCount: number;
  mappingCount: number;
  onStepChange: (step: 1 | 2 | 3) => void;
};

export default function FlowCard({
  step,
  sending,
  headersCount,
  mappingCount,
  onStepChange,
}: FlowCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/60 p-6 shadow-[0_18px_50px_rgba(100,116,139,0.18)] backdrop-blur">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>Flow</span>
        <span>Step {step} / 3</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <button
          type="button"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300"
          onClick={() => onStepChange(1)}
        >
          <span>1. Upload CSV</span>
          <span className="text-emerald-500">
            {step >= 2 ? "Done" : "In progress"}
          </span>
        </button>
        <button
          type="button"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 disabled:opacity-50"
          onClick={() => onStepChange(2)}
          disabled={headersCount === 0}
        >
          <span>2. Map fields</span>
          <span className="text-emerald-500">
            {step >= 3 ? "Done" : step === 2 ? "In progress" : "Waiting"}
          </span>
        </button>
        <button
          type="button"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 disabled:opacity-50"
          onClick={() => onStepChange(3)}
          disabled={mappingCount === 0}
        >
          <span>3. Send webhook</span>
          <span className="text-emerald-500">
            {sending ? "Sending" : step === 3 ? "Open" : "Waiting"}
          </span>
        </button>
      </div>
    </div>
  );
}
