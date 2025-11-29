"use client";

import {
  Calendar,
  DailyView,
  WeeklyView,
  ViewModeDropdown,
  LoginModal,
  useModal,
  type ViewMode,
} from "@repo/ui";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, useAuth } from "@/lib/auth";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Shop 타입
interface Shop {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // 매장 목록 가져오기
  useEffect(() => {
    const fetchShops = async () => {
      if (!isAuthenticated) return;

      const accessToken = getAccessToken();
      if (!accessToken) {
        console.log("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/shops`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setShops(data.data);
          // 첫 번째 매장을 기본 선택
          if (data.data.length > 0 && !selectedShop) {
            setSelectedShop(data.data[0]);
          }
        }
      } catch (error) {
        console.error("매장 목록 조회 실패:", error);
      }
    };

    fetchShops();
  }, [isAuthenticated]);

  // 사용자 메뉴 및 매장 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsShopDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const { showModal } = useModal();

  // 날짜를 YYYY/MM/DD 형식으로 포맷
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    // Modal 사용 예시
    showModal(
      {
        header: "예약 확인",
        body: (onConfirm, onReject, onClose) => (
          <div className="space-y-3">
            <p>
              <strong>{formatDate(date)}</strong>에 예약을 추가하시겠습니까?
            </p>
            <p className="text-sm text-zinc-500">
              예약을 추가하면 해당 날짜에 미용 일정이 등록됩니다.
            </p>
          </div>
        ),
        footer: (onConfirm, onReject, onClose) => (
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              나중에
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              예약 추가
            </button>
          </div>
        ),
      },
      () => {
        console.log("예약 확인됨:", date);
        // 여기에 예약 추가 로직
      },
      () => {
        console.log("예약 취소됨");
      }
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal || (!isLoading && !isAuthenticated)}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 헤더 */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 매장 선택 드롭다운 */}
              {isAuthenticated && shops.length > 0 && (
                <div className="relative ml-4" ref={shopDropdownRef}>
                  <button
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-zinc-600 dark:text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {selectedShop?.name || "매장 선택"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isShopDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 매장 드롭다운 목록 */}
                  {isShopDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                          매장 선택
                        </p>
                      </div>
                      {shops.map((shop) => (
                        <button
                          key={shop.id}
                          onClick={() => {
                            setSelectedShop(shop);
                            setIsShopDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                            selectedShop?.id === shop.id
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {selectedShop?.id === shop.id && (
                            <svg
                              className="w-4 h-4"
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
                          )}
                          <span
                            className={
                              selectedShop?.id === shop.id ? "" : "ml-6"
                            }
                          >
                            {shop.name}
                          </span>
                        </button>
                      ))}
                      {shops.length === 0 && (
                        <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                          등록된 매장이 없습니다
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ViewModeDropdown value={viewMode} onChange={setViewMode} />

              {/* 사용자 메뉴 */}
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name || "사용자"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block">
                      {user?.name || user?.email?.split("@")[0]}
                    </span>
                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {user?.name || "사용자"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/shop");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        매장 관리
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/employee");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        직원 관리
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          // TODO: 매장 설정 페이지로 이동
                          console.log("매장 설정");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        매장 설정
                      </button>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="w-full max-w-4xl mx-auto p-8">
        {viewMode === "daily" && <DailyView date={selectedDate} />}
        {viewMode === "weekly" && (
          <WeeklyView
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        )}
        {(viewMode === "monthly" || viewMode === "yearly") && (
          <Calendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        )}
      </main>
    </div>
  );
}
