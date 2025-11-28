"use client";

import React from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

// OAuth URL 생성 함수들
const getGoogleOAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const redirectUri = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback/google`;
  const scope = "email profile";
  const responseType = "code";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const getKakaoOAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "";
  const redirectUri = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback/kakao`;
  const responseType = "code";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

const getNaverOAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "";
  const redirectUri = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback/naver`;
  const responseType = "code";
  const state = Math.random().toString(36).substring(7); // CSRF 방지용 state

  // state를 sessionStorage에 저장 (콜백에서 검증용)
  if (typeof window !== "undefined") {
    sessionStorage.setItem("naver_oauth_state", state);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    state: state,
  });

  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    const url = getGoogleOAuthUrl();
    if (url) {
      window.location.href = url;
    }
  };

  const handleNaverLogin = () => {
    const url = getNaverOAuthUrl();
    if (url) {
      window.location.href = url;
    }
  };

  const handleKakaoLogin = () => {
    const url = getKakaoOAuthUrl();
    if (url) {
      window.location.href = url;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-6 text-center border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🐕</span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              멍멍 미용실
            </h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            소셜 계정으로 간편하게 로그인하세요
          </p>
        </div>

        {/* Body - 소셜 로그인 버튼들 */}
        <div className="px-6 py-6 space-y-3">
          {/* Google 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-200 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google로 계속하기</span>
          </button>

          {/* Naver 로그인 버튼 */}
          <button
            onClick={handleNaverLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] rounded-lg hover:bg-[#02b351] transition-colors text-white font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
            </svg>
            <span>네이버로 계속하기</span>
          </button>

          {/* Kakao 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-lg hover:bg-[#e6cf00] transition-colors text-[#191919] font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.648 1.758 4.974 4.403 6.316-.144.522-.926 3.354-.962 3.583 0 0-.019.163.084.227.104.064.226.029.226.029.298-.042 3.449-2.268 3.997-2.648.724.104 1.476.159 2.252.159 5.523 0 10-3.463 10-7.666C22 6.463 17.523 3 12 3z" />
            </svg>
            <span>카카오로 계속하기</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
            로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
