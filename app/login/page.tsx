"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthForm from "@/app/components/auth/AuthForm";

const loginFields = [
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
    autoComplete: "current-password",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (formData: Record<string, string>) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      throw new Error("メールアドレスまたはパスワードが無効です");
    }

    router.push("/dashboard");
  };

  return (
    <AuthForm
      title="リモート勤怠システム"
      subtitle="アカウントにサインイン"
      alternativeText="アカウントをお持ちでない方は"
      alternativeLink="/register"
      alternativeLinkText="今すぐ新規登録"
      fields={loginFields}
      onSubmit={handleSubmit}
      submitButtonText="サインイン"
    />
  );
}
