import { useEffect, useState } from "react";
import type { FailedRow } from "@/app/lib/types";

type StepWebhookProps = {
  headers: string[];
  rows: string[][];
  webhookUrl: string;
  startRow: string;
  rowsToSend: number;
  concurrency: string;
  concurrencyValue: number;
  includedCount: number;
  startRowPreview: Record<string, string> | null;
  includedFields: Array<{
    header: string;
    key: string;
    source: "csv" | "static";
    value?: string;
  }>;
  sending: boolean;
  sentCount: number;
  failCount: number;
  error: string;
  lastError: string;
  failedRows: FailedRow[];
  webhookValid: boolean;
  onWebhookChange: (value: string) => void;
  onStartRowChange: (value: string) => void;
  onConcurrencyChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onBack: () => void;
  onReset: () => void;
};

export default function StepWebhook({
  headers,
  rows,
  webhookUrl,
  startRow,
  rowsToSend,
  concurrency,
  concurrencyValue,
  includedCount,
  startRowPreview,
  includedFields,
  sending,
  sentCount,
  failCount,
  error,
  lastError,
  failedRows,
  webhookValid,
  onWebhookChange,
  onStartRowChange,
  onConcurrencyChange,
  onSend,
  onStop,
  onBack,
  onReset,
}: StepWebhookProps) {
  const [showRowsModal, setShowRowsModal] = useState(false);
  const [showStartRowModal, setShowStartRowModal] = useState(false);
  const [showIncludedFieldsModal, setShowIncludedFieldsModal] = useState(false);
  const [rowsPageSize, setRowsPageSize] = useState(100);
  const [rowsPage, setRowsPage] = useState(1);
  const startRowNumber = Number.parseInt(startRow, 10);
  const firstRowIndex = Number.isNaN(startRowNumber)
    ? 0
    : Math.max(0, startRowNumber - 1);
  const sendableRows = rows.slice(firstRowIndex);
  const totalPages = Math.max(1, Math.ceil(sendableRows.length / rowsPageSize));
  const currentPage = Math.min(rowsPage, totalPages);
  const visibleRows = sendableRows.slice(
    (currentPage - 1) * rowsPageSize,
    currentPage * rowsPageSize,
  );
  const rangeStart = sendableRows.length === 0
    ? 0
    : (currentPage - 1) * rowsPageSize + 1;
  const rangeEnd = Math.min(currentPage * rowsPageSize, sendableRows.length);

  useEffect(() => {
    if (!showIncludedFieldsModal && !showStartRowModal && !showRowsModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowIncludedFieldsModal(false);
        setShowStartRowModal(false);
        setShowRowsModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIncludedFieldsModal, showStartRowModal, showRowsModal]);

  return (
    <>
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
          order when concurrency is set to 1.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <input
            className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            placeholder="https://hooks.example.com/..."
            value={webhookUrl}
            onChange={(event) => onWebhookChange(event.target.value)}
          />
          <div className="grid gap-2">
            <label
              htmlFor="start-row"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
            >
              Start from row
            </label>
            <input
              id="start-row"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              placeholder="1"
              value={startRow}
              onChange={(event) => onStartRowChange(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="concurrency"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
            >
              Concurrency
            </label>
            <input
              id="concurrency"
              type="number"
              min="1"
              max="20"
              step="1"
              inputMode="numeric"
              className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              placeholder="1"
              value={concurrency}
              onChange={(event) => onConcurrencyChange(event.target.value)}
            />
            <div className="text-xs text-slate-500">
              {concurrencyValue === 1
                ? 'Rows are sent one at a time in order.'
                : `Up to ${concurrencyValue} rows send at once. Delivery order is not guaranteed.`}
            </div>
          </div>
          {webhookUrl && !webhookValid ? (
            <div className="text-xs text-rose-600">
              Enter a valid URL or domain. We&apos;ll assume https:// if it&apos;s missing.
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onSend}
              disabled={sending || !webhookValid}
            >
              {sending
                ? `Sending ${sentCount}/${rowsToSend}`
                : `Send ${rowsToSend || ""} rows`}
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
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-left transition hover:border-slate-300 disabled:cursor-default disabled:hover:border-slate-200/70"
            onClick={() => {
              setRowsPage(1);
              setShowRowsModal(true);
            }}
            disabled={sendableRows.length === 0}
          >
            {rowsToSend || "No"} rows ready to send
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-left transition hover:border-slate-300 disabled:cursor-default disabled:hover:border-slate-200/70"
            onClick={() => setShowStartRowModal(true)}
            disabled={!startRowPreview}
          >
            Start from row {startRow || "1"}
          </button>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
            Concurrency {concurrencyValue}
          </div>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-left transition hover:border-slate-300 disabled:cursor-default disabled:hover:border-slate-200/70"
            onClick={() => setShowIncludedFieldsModal(true)}
            disabled={includedFields.length === 0}
          >
            {includedCount || "No"} fields included in payload
          </button>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
            Webhook:{" "}
            {webhookUrl ? (webhookValid ? "Ready" : "Invalid URL") : "Add a URL"}
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

      {showIncludedFieldsModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          onClick={() => setShowIncludedFieldsModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Fields included in payload
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  These are the fields that will be sent with each webhook request.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                onClick={() => setShowIncludedFieldsModal(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-900 p-4 text-xs text-emerald-200">
              <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap font-mono leading-6">
                {`{\n${includedFields
                  .map((field) => {
                    const details =
                      field.source === "static"
                        ? `static: ${field.value || "—"}`
                        : `csv: ${field.header}`;

                    return `  "${field.key}": "${details}"`;
                  })
                  .join(",\n")}\n}`}
              </pre>
            </div>
          </div>
        </div>
      ) : null}

      {showRowsModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          onClick={() => setShowRowsModal(false)}
        >
          <div
            className="flex h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Rows ready to send
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Showing rows from {firstRowIndex + 1} onward.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                onClick={() => setShowRowsModal(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-600">
              <div>
                Showing {rangeStart}-{rangeEnd} of {sendableRows.length} row
                {sendableRows.length === 1 ? "" : "s"}
              </div>
              <label className="flex items-center gap-2">
                <span>Page size</span>
                <select
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  value={rowsPageSize}
                  onChange={(event) => {
                    setRowsPageSize(Number(event.target.value));
                    setRowsPage(1);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-slate-200/70">
              <div className="h-full overflow-auto">
                <table className="min-w-full border-collapse text-sm text-slate-700">
                  <thead className="sticky top-0 bg-slate-100/95 backdrop-blur">
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">
                        Row
                      </th>
                      {headers.map((header, index) => (
                        <th
                          key={`${header}-${index}`}
                          className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-900"
                        >
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, rowIndex) => (
                      <tr
                        key={`${currentPage}-${rowIndex}`}
                        className="odd:bg-white even:bg-slate-50/60"
                      >
                        <td className="border-b border-slate-100 px-4 py-2 align-top font-medium text-slate-500">
                          {firstRowIndex + (currentPage - 1) * rowsPageSize + rowIndex + 1}
                        </td>
                        {headers.map((header, columnIndex) => (
                          <td
                            key={`${header}-${columnIndex}`}
                            className="border-b border-slate-100 px-4 py-2 align-top text-slate-700"
                          >
                            {row[columnIndex] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setRowsPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setRowsPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showStartRowModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          onClick={() => setShowStartRowModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Start row preview
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  This is the payload for row {startRow || "1"}.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                onClick={() => setShowStartRowModal(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-900 p-4 text-xs text-emerald-200">
              <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap font-mono leading-6">
                {startRowPreview
                  ? JSON.stringify(startRowPreview, null, 2)
                  : "{ }"}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
