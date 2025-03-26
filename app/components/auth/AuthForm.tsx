"use client";

import { useState } from "react";
import Link from "next/link";
import "./auth.css";

interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  alternativeText: string;
  alternativeLink: string;
  alternativeLinkText: string;
  fields: FormField[];
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  submitButtonText: string;
}

export default function AuthForm({
  title,
  subtitle,
  alternativeText,
  alternativeLink,
  alternativeLinkText,
  fields,
  onSubmit,
  submitButtonText,
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm transform space-y-6 bg-transparent p-6">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">{alternativeText} </span>
            <Link
              href={alternativeLink}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {alternativeLinkText}
            </Link>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.id} className="group relative">
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  required={field.required}
                  className="peer block w-full border-0 border-b-2 border-gray-300 bg-transparent p-2 text-gray-900 placeholder-transparent focus:border-indigo-600 focus:outline-none focus:ring-0"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
                <label
                  htmlFor={field.id}
                  className="absolute -top-3.5 left-0 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-indigo-600"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>

          {error && (
            <div className="animate-shake text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full transform items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  処理中...
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
