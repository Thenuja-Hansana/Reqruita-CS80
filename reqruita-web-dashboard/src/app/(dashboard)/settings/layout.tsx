import Link from "next/link";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Settings</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              Manage your account, security, and notification preferences for
              the Reqruita admin dashboard.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            Back to Home
          </Link>
        </div>
      </section>

      {children}
    </div>
  );
}
