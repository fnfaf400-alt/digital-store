"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4">
      <h2 className="text-xl font-bold text-red-400">حدث خطأ في تحميل الصفحة</h2>
      <p className="text-sm text-paper/70 font-mono bg-black/40 p-4 rounded-xl max-w-xl text-left overflow-auto">
        {error.message || "خطأ غير معروف"}
      </p>
      <button
        onClick={() => reset()}
        className="btn-gold px-6 py-2 rounded-lg"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
