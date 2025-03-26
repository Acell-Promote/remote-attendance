"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/auth/AuthForm";

const registerFields = [
  {
    id: "name",
    label: "名前",
    type: "text",
    placeholder: "名前",
    required: true,
    autoComplete: "name",
  },
  {
    id: "email",
    label: "メールアドレス",
    type: "email",
    placeholder: "メールアドレス",
    required: true,
    autoComplete: "email",
  },
  {
    id: "password",
    label: "パスワード",
    type: "password",
    placeholder: "パスワード",
    required: true,
    autoComplete: "new-password",
  },
  {
    id: "confirmPassword",
    label: "パスワード（確認）",
    type: "password",
    placeholder: "パスワード（確認）",
    required: true,
    autoComplete: "new-password",
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (formData: Record<string, string>) => {
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      throw new Error("パスワードが一致しません");
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "登録に失敗しました");
    }

    // Wait a moment before redirecting to login
    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.push("/login");
  };

  return (
    <AuthForm
      title="リモート勤怠システム"
      subtitle="新規アカウントを作成して始めましょう"
      alternativeText="既にアカウントをお持ちの方は"
      alternativeLink="/login"
      alternativeLinkText="こちらからログイン"
      fields={registerFields}
      onSubmit={handleSubmit}
      submitButtonText="アカウント作成"
    />
  );
}
