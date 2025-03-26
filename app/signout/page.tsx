"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Loading spinner component with proper accessibility
 */
function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center" role="alert" aria-live="polite">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"
          aria-hidden="true"
        />
        <p className="mt-4 text-gray-600">サインアウト中...</p>
      </div>
    </div>
  );
}

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = useCallback(() => {
    if (!isLoading) {
      router.back();
    }
  }, [isLoading, router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLoading, handleCancel]);

  const handleSignOut = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const baseUrl = window.location.origin;
      await signOut({
        redirect: true,
        callbackUrl: `${baseUrl}/login`,
      });
    } catch (err) {
      setIsLoading(false);
      setError("サインアウトに失敗しました。もう一度お試しください。");
      console.error("Sign out error:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-50"
      role="dialog"
      aria-labelledby="signout-title"
      aria-describedby="signout-description"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2
          id="signout-title"
          className="mb-4 text-center text-2xl font-bold text-gray-900"
        >
          サインアウトの確認
        </h2>
        <p id="signout-description" className="mb-6 text-center text-gray-600">
          本当にサインアウトしますか？
        </p>
        {error && (
          <p className="mb-4 text-center text-red-500" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            サインアウト
          </button>
        </div>
      </div>
    </div>
  );
}
