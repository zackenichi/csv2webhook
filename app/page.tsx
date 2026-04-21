'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import FailedRows from '@/app/components/FailedRows';
import FlowCard from '@/app/components/FlowCard';
import StepMapping from '@/app/components/StepMapping';
import StepUpload from '@/app/components/StepUpload';
import StepWebhook from '@/app/components/StepWebhook';
import { buildMapping, parseCSV } from '@/app/lib/csv';
import type { FailedRow, MappingRow } from '@/app/lib/types';

export default function Home() {
  const [csvName, setCsvName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<MappingRow[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [error, setError] = useState('');
  const [lastError, setLastError] = useState('');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);
  const cancelRef = useRef(false);
  const dragDepthRef = useRef(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const rowCount = rows.length;
  const includedCount = mapping.filter((item) => item.enabled).length;
  const failCount = failedRows.length;

  const normalizeWebhookUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const normalizedWebhookUrl = normalizeWebhookUrl(webhookUrl);

  const isValidWebhookUrl = (value: string) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const webhookValid = isValidWebhookUrl(normalizedWebhookUrl);

  const examplePayload = useMemo(() => {
    if (!rows.length || !mapping.length) return null;
    const payload: Record<string, string> = {};
    mapping.forEach((item, index) => {
      if (!item.enabled) return;
      if (item.source === 'static') {
        payload[item.key] = item.value ?? '';
        return;
      }
      payload[item.key] = rows[0]?.[index] ?? '';
    });
    return payload;
  }, [mapping, rows]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError('');
    setLastError('');
    setSentCount(0);
    setFailedRows([]);

    const text = await file.text();
    const parsed = parseCSV(text);
    if (!parsed.length) {
      setError("We couldn't find any rows in that CSV.");
      return;
    }
    if (parsed[0].length === 0) {
      setError('Your CSV header row looks empty.');
      return;
    }
    const sanitizedHeaders = parsed[0].map((header) => header.trim());
    const dataRows = parsed.slice(1);
    setCsvName(file.name);
    setHeaders(sanitizedHeaders);
    setRows(dataRows);
    setMapping(buildMapping(sanitizedHeaders, dataRows[0] ?? []));
    setStep(2);
  };

  const updateMapping = (index: number, updates: Partial<MappingRow>) => {
    setMapping((current) =>
      current.map((item, position) =>
        position === index ? { ...item, ...updates } : item,
      ),
    );
  };

  const addStaticField = (field: { key: string; value: string }) => {
    setMapping((current) => [
      ...current,
      {
        header: `Static value ${current.filter((item) => item.source === 'static').length + 1}`,
        key: field.key,
        enabled: true,
        sample: '',
        source: 'static',
        value: field.value,
      },
    ]);
  };

  const resetFlow = () => {
    cancelRef.current = false;
    setCsvName('');
    setHeaders([]);
    setRows([]);
    setMapping([]);
    setWebhookUrl('');
    setError('');
    setLastError('');
    setSentCount(0);
    setFailedRows([]);
    setStep(1);
  };

  const buildPayloadForRow = (row: string[]) => {
    const payload: Record<string, string> = {};
    mapping.forEach((item, index) => {
      if (!item.enabled) return;
      if (item.source === 'static') {
        payload[item.key] = item.value ?? '';
        return;
      }
      payload[item.key] = row?.[index] ?? '';
    });
    return payload;
  };

  const delay = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const sendPayload = async (
    payload: Record<string, string>,
    rowIndex: number,
  ) => {
    const response = await fetch('/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: normalizedWebhookUrl, payload }),
    });

    if (!response.ok) {
      throw new Error(
        `Row ${rowIndex + 1} failed with ${response.status} ${response.statusText}`,
      );
    }
  };

  const sendToWebhook = async () => {
    cancelRef.current = false;
    if (!webhookUrl.trim()) {
      setError('Add a webhook URL to continue.');
      return;
    }
    if (!webhookValid) {
      setError('Enter a valid webhook URL or domain.');
      return;
    }
    if (!rows.length) {
      setError('Your CSV has no data rows to send.');
      return;
    }
    if (!includedCount) {
      setError('Include at least one field before sending.');
      return;
    }

    setError('');
    setLastError('');
    setSending(true);
    setSentCount(0);
    setFailedRows([]);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      if (cancelRef.current) {
        setLastError(`Stopped after ${rowIndex} row(s).`);
        break;
      }
      const row = rows[rowIndex];
      const payload = buildPayloadForRow(row);
      let attempt = 0;
      let success = false;
      let lastMessage = '';

      while (attempt < 3 && !success && !cancelRef.current) {
        try {
          attempt += 1;
          await sendPayload(payload, rowIndex);
          success = true;
        } catch (err) {
          lastMessage =
            err instanceof Error
              ? err.message
              : 'Row failed with a network error';
          setLastError(lastMessage);
          console.error('Webhook request failed', {
            row: rowIndex + 1,
            attempt,
            error: err,
          });
          if (attempt < 3) {
            await delay(750);
          }
        }
      }

      if (!success) {
        setFailedRows((current) => [
          ...current,
          {
            index: rowIndex,
            payload,
            error: lastMessage || 'Row failed after 3 attempts.',
          },
        ]);
      }

      setSentCount((count) => count + 1);
    }

    setSending(false);
    if (!cancelRef.current) {
      setLastError("");
    }
  };

  const stopSending = () => {
    cancelRef.current = true;
  };

  const retryFailed = async () => {
    if (!failedRows.length) return;
    cancelRef.current = false;
    setSending(true);
    setLastError('');

    const remaining: FailedRow[] = [];

    for (let i = 0; i < failedRows.length; i += 1) {
      if (cancelRef.current) {
        remaining.push(...failedRows.slice(i));
        break;
      }
      const item = failedRows[i];
      let attempt = 0;
      let success = false;
      let lastMessage = item.error;

      while (attempt < 3 && !success && !cancelRef.current) {
        try {
          attempt += 1;
          await sendPayload(item.payload, item.index);
          success = true;
        } catch (err) {
          lastMessage =
            err instanceof Error
              ? err.message
              : 'Row failed with a network error';
          setLastError(lastMessage);
          console.error('Webhook retry failed', {
            row: item.index + 1,
            attempt,
            error: err,
          });
          if (attempt < 3) {
            await delay(750);
          }
        }
      }

      if (!success) {
        remaining.push({ ...item, error: lastMessage });
      }
    }

    setFailedRows(remaining);
    setSending(false);
    if (!cancelRef.current) {
      setLastError("");
    }
  };

  const removeFailed = (index: number) => {
    setFailedRows((current) => current.filter((item) => item.index !== index));
  };

  useEffect(() => {
    if (step !== 1) {
      dragDepthRef.current = 0;
      setIsDraggingFile(false);
      return;
    }

    const preventBrowserDrop = (event: globalThis.DragEvent) => {
      if (!event.dataTransfer?.types.includes('Files')) return;
      event.preventDefault();
    };

    window.addEventListener('dragover', preventBrowserDrop);
    window.addEventListener('drop', preventBrowserDrop);

    return () => {
      window.removeEventListener('dragover', preventBrowserDrop);
      window.removeEventListener('drop', preventBrowserDrop);
    };
  }, [step]);

  const handleDragEnter = () => {
    dragDepthRef.current += 1;
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    void handleFile(file);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,217,148,0.45),transparent_55%),radial-gradient(circle_at_20%_30%,rgba(141,199,255,0.35),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(255,168,168,0.35),transparent_55%),linear-gradient(180deg,#e9e6df,#dde3ee)] px-6 py-12 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
              CSV → Webhook
            </span>
            <span className="text-sm text-slate-500">
              No server required · We never store your CSV on our servers
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="flex flex-col gap-4">
              <h1 className="text-balance text-4xl font-(--font-fraunces) leading-tight text-slate-900 sm:text-5xl">
                Map any CSV to clean webhook payloads in three quick steps.
              </h1>
              <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                Upload a CSV, confirm the field mapping, then send each row in
                order to your webhook. Remove anything you do not want to
                forward.
              </p>
            </div>
            <FlowCard
              step={step}
              sending={sending}
              headersCount={headers.length}
              mappingCount={mapping.length}
              onStepChange={setStep}
            />
          </div>
        </header>

        {step === 1 ? (
          <StepUpload
            csvName={csvName}
            headersCount={headers.length}
            rowCount={rowCount}
            isDragging={isDraggingFile}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFile={handleFile}
            onReset={resetFlow}
          />
        ) : null}

        {step === 2 ? (
          <StepMapping
            mapping={mapping}
            includedCount={includedCount}
            examplePayload={examplePayload}
            onUpdateMapping={updateMapping}
            onAddStaticField={addStaticField}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        ) : null}

        {step === 3 ? (
          <StepWebhook
            webhookUrl={webhookUrl}
            rowCount={rowCount}
            includedCount={includedCount}
            sending={sending}
            sentCount={sentCount}
            failCount={failCount}
            error={error}
            lastError={lastError}
            failedRows={failedRows}
            webhookValid={webhookValid}
            onWebhookChange={setWebhookUrl}
            onSend={sendToWebhook}
            onStop={stopSending}
            onBack={() => setStep(2)}
            onReset={resetFlow}
          />
        ) : null}

        {step === 3 ? (
          <FailedRows
            rows={failedRows}
            sending={sending}
            onRetry={retryFailed}
            onRemove={removeFailed}
          />
        ) : null}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row">
          <a className="hover:text-slate-700" href="/privacy-policy">
            Privacy Policy
          </a>
          <a
            className="hover:text-slate-700"
            href="https://www.zacsalazar.com/"
            target="_blank"
            rel="noreferrer"
          >
            © {new Date().getFullYear()} Zac Salazar
          </a>
        </footer>
      </main>
    </div>
  );
}
