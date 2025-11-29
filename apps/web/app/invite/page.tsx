"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, getAccessToken } from "@/lib/auth";
import { LoginModal } from "@repo/ui";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 초대 정보 타입
interface InvitationInfo {
  email: string;
  role: string;
  expires_at: string;
  shop: {
    id: number;
    name: string;
  };
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [acceptResult, setAcceptResult] = useState<{
    success: boolean;
    message: string;
    shopName?: string;
  } | null>(null);

  // 초대 정보 조회
  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 초대 링크입니다.");
      setIsLoading(false);
      return;
    }

    const fetchInvitationInfo = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/invitations/token/${token}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setInvitationInfo(data.data);
        } else {
          setError(data.message || "초대 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("초대 정보 조회 실패:", err);
        setError("초대 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitationInfo();
  }, [token]);

  // 초대 수락
  const handleAcceptInvitation = async () => {
    if (!token || !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setShowLoginModal(true);
      return;
    }

    setIsAccepting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/token/${token}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setAcceptResult({
          success: true,
          message: "초대를 수락했습니다!",
          shopName: data.data.shop.name,
        });
      } else {
        setAcceptResult({
          success: false,
          message: data.message || "초대 수락에 실패했습니다.",
        });
      }
    } catch (err) {
      console.error("초대 수락 실패:", err);
      setAcceptResult({
        success: false,
        message: "초대 수락 중 오류가 발생했습니다.",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // role 한글 변환
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "소유자";
      case "manager":
        return "매니저";
      case "staff":
        return "직원";
      default:
        return role;
    }
  };

  // 로딩 중
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            초대를 확인할 수 없습니다
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  // 수락 완료
  if (acceptResult) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full text-center">
          <div
            className={`w-16 h-16 ${acceptResult.success ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            {acceptResult.success ? (
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {acceptResult.success ? "환영합니다!" : "초대 수락 실패"}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">
            {acceptResult.message}
          </p>
          {acceptResult.success && acceptResult.shopName && (
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-6">
              {acceptResult.shopName}의 직원이 되었습니다
            </p>
          )}
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  // 초대 정보 표시
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal || (!isAuthLoading && !isAuthenticated)}
        onClose={() => setShowLoginModal(false)}
        returnUrl={token ? `/invite?token=${token}` : undefined}
      />

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 max-w-md w-full">
        {/* 헤더 아이콘 */}
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>

        {/* 초대 메시지 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            직원 초대
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {invitationInfo?.shop.name}
            </span>
            에서 당신을 초대했습니다
          </p>
        </div>

        {/* 초대 정보 */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 dark:text-zinc-400">역할</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {getRoleLabel(invitationInfo?.role || "staff")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 dark:text-zinc-400">
              초대 이메일
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {invitationInfo?.email}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 dark:text-zinc-400">만료일</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {invitationInfo?.expires_at
                ? new Date(invitationInfo.expires_at).toLocaleDateString(
                    "ko-KR"
                  )
                : "-"}
            </span>
          </div>
        </div>

        {/* 로그인 상태에 따른 안내 */}
        {!isAuthenticated ? (
          <div className="text-center mb-6">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-2">
              초대를 수락하려면 먼저 로그인해주세요
            </p>
          </div>
        ) : user?.email?.toLowerCase() !==
          invitationInfo?.email.toLowerCase() ? (
          <div className="text-center mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
              초대받은 이메일({invitationInfo?.email})과 <br />
              로그인한 계정({user?.email})이 다릅니다
            </p>
          </div>
        ) : null}

        {/* 수락 버튼 */}
        <button
          onClick={handleAcceptInvitation}
          disabled={
            isAccepting ||
            !isAuthenticated ||
            user?.email?.toLowerCase() !== invitationInfo?.email.toLowerCase()
          }
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isAccepting ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
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
              수락 중...
            </>
          ) : !isAuthenticated ? (
            "로그인 후 수락하기"
          ) : (
            "초대 수락하기"
          )}
        </button>

        {/* 취소 링크 */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
