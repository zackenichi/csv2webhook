export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <a className="text-xs uppercase tracking-[0.3em] text-slate-500 hover:text-slate-700" href="/">
            ← Back to app
          </a>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Privacy Policy
          </p>
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-sm text-slate-600">Last updated: January 30, 2026</p>
        </header>

        <section className="space-y-4 text-sm text-slate-700">
          <p>
            We do not store your CSV files on our servers. CSV data is processed
            in your browser, and only sent to the webhook URL you provide.
          </p>
          <p>
            When you use the webhook feature, your browser or our server may
            transmit the data you choose to send to the destination webhook.
            That destination is controlled by you, and its privacy practices
            apply.
          </p>
          <p>
            We may collect basic, aggregated analytics about usage of the app
            (for example, page views) to improve the product. We do not sell
            personal data.
          </p>
          <p>
            If you have questions about this policy, please contact us via the
            website linked below.
          </p>
        </section>
      </main>
    </div>
  );
}
