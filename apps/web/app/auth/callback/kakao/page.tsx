"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleKakaoCallback, useAuth } from "@/lib/auth";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("인증 코드가 없습니다.");
      return;
    }

    const handleCallback = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback/kakao`;
        const result = await handleKakaoCallback(code, redirectUri);
        login(result.user);
        router.push("/");
      } catch (err) {
        console.error("Kakao 로그인 실패:", err);
        setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg max-w-md mx-4">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            로그인 실패
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-[#FEE500] text-[#191919] rounded-lg hover:bg-[#e6cf00] transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEE500] mx-auto mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400">
          카카오 로그인 처리 중...
        </p>
      </div>
    </div>
  );
}
