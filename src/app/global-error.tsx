"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-neutral-900 text-white flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">حدث خطأ عام في النظام</h2>
        <pre className="bg-black/50 p-4 rounded text-xs text-left max-w-xl overflow-auto mb-4">
          {error.message}
        </pre>
        <button
          onClick={() => reset()}
          className="bg-amber-500 text-black font-bold px-4 py-2 rounded"
        >
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
