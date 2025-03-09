"use client";

import { useState } from "react";
import { ReportStatus } from "@/app/types/report";

interface ReportFormData {
  title: string;
  date: string;
  content: string;
  status: ReportStatus;
}

interface ReportEditorProps {
  initialData?: ReportFormData;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onSaveDraft: (data: ReportFormData) => Promise<void>;
}

interface FormField {
  id: keyof ReportFormData;
  label: string;
  type: "text" | "date" | "textarea";
  required?: boolean;
  rows?: number;
}

const formFields: FormField[] = [
  {
    id: "title",
    label: "タイトル",
    type: "text",
    required: true,
  },
  {
    id: "date",
    label: "日付",
    type: "date",
    required: true,
  },
  {
    id: "content",
    label: "内容",
    type: "textarea",
    required: true,
    rows: 10,
  },
];

export default function ReportEditor({
  initialData,
  onSubmit,
  onSaveDraft,
}: ReportEditorProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    title: initialData?.title || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    content: initialData?.content || "",
    status: initialData?.status || ReportStatus.DRAFT,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (isDraft) {
        await onSaveDraft({ ...formData, status: ReportStatus.DRAFT });
      } else {
        await onSubmit({ ...formData, status: ReportStatus.SUBMITTED });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof ReportFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = ({ id, label, type, required, rows }: FormField) => {
    const commonProps = {
      id,
      value: formData[id],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleFieldChange(id, e.target.value),
      className:
        "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
      required,
      disabled: submitting,
    };

    return (
      <div key={id}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {type === "textarea" ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input type={type} {...commonProps} />
        )}
      </div>
    );
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {formFields.map(renderField)}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {submitting ? "保存中..." : "下書き保存"}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {submitting ? "送信中..." : "提出"}
        </button>
      </div>
    </form>
  );
}
