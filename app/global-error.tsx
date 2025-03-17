"use client";

import Link from "next/link";

export default function GlobalError() {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              エラーが発生しました
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              申し訳ありませんが、問題が発生しました
            </p>
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
