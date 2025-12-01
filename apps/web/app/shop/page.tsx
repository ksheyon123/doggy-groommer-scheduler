"use client";

import { useState, useEffect } from "react";
import { useAuth, getAccessToken } from "@/lib/auth";
import { useShop } from "@/lib/shop";
import { useRouter } from "next/navigation";
import { Paginator } from "@repo/ui";

// 매장 타입
interface Shop {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

// API 응답 타입
interface GroomingAppointment {
  id: number;
  shop_id: number;
  dog_id: number;
  created_by_user_id: number;
  assigned_user_id: number | null;
  grooming_type: string | null;
  memo: string | null;
  amount: number | null;
  appointment_at: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  dog?: {
    id: number;
    name: string;
    breed: string | null;
  };
  shop?: {
    id: number;
    name: string;
  };
  createdByUser?: {
    id: number;
    name: string;
    email: string;
  };
  assignedUser?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

// 화면 표시용 타입
interface GroomingRecord {
  id: number;
  dogName: string;
  groomingType: string;
  cost: number;
  date: string;
  timeSlot: string;
  assignedUser: string;
  status: "완료" | "예약" | "대기중";
}

// Pagination 타입
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API 상태를 화면 표시용 상태로 변환
const convertStatus = (apiStatus: string): "완료" | "예약" | "대기중" => {
  switch (apiStatus) {
    case "completed":
      return "완료";
    case "settled":
    case "scheduled":
      return "예약";
    case "cancelled":
    default:
      return "대기중";
  }
};

// 시간 포맷 변환 (HH:mm:ss -> HH:mm)
const formatTime = (time: string | null): string => {
  if (!time) return "";
  return time.substring(0, 5); // HH:mm 형식으로 변환
};

// API 응답을 화면 표시용 데이터로 변환
const convertToRecord = (appointment: GroomingAppointment): GroomingRecord => {
  const startTime = formatTime(appointment.start_time);
  const endTime = formatTime(appointment.end_time);
  const timeSlot =
    startTime && endTime
      ? `${startTime} ~ ${endTime}`
      : startTime || endTime || "-";

  return {
    id: appointment.id,
    dogName: appointment.dog?.name || "알 수 없음",
    groomingType: appointment.grooming_type || "미정",
    cost: appointment.amount || 0,
    date: appointment.appointment_at || "",
    timeSlot: timeSlot,
    assignedUser: appointment.assignedUser?.name || "-",
    status: convertStatus(appointment.status),
  };
};

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 날짜를 YYYY-MM-DD 형식으로 포맷
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 주간 기본 날짜 계산 (오늘 기준 7일 전 ~ 오늘)
const getWeeklyDateRange = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6); // 오늘 포함 7일
  return {
    start: formatDate(weekAgo),
    end: formatDate(today),
  };
};

export default function ShopManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const weeklyRange = getWeeklyDateRange();
  const [startDate, setStartDate] = useState(weeklyRange.start);
  const [endDate, setEndDate] = useState(weeklyRange.end);
  const [records, setRecords] = useState<GroomingRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const ITEMS_PER_PAGE = 10;
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  // 전역 샵 상태 사용
  const {
    shops,
    selectedShop: globalSelectedShop,
    isLoadingShops,
    refreshShops,
  } = useShop();

  // 로컬 선택 상태 (전역 상태를 기본값으로 사용)
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  // 전역 상태가 변경되면 로컬 상태에 반영 (초기화 시)
  useEffect(() => {
    if (globalSelectedShop && selectedShopId === null) {
      setSelectedShopId(globalSelectedShop.id);
    }
  }, [globalSelectedShop, selectedShopId]);

  // 선택된 매장 정보
  const selectedShop = shops.find((shop) => shop.id === selectedShopId);

  // 컴포넌트 마운트 시 매장 목록 조회
  useEffect(() => {
    refreshShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 알림 모달 표시
  const showAlert = (title: string, message: string) => {
    setAlertModal({ isOpen: true, title, message });
  };

  // 알림 모달 닫기
  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "" });
  };

  // 매장 등록
  const handleRegisterShop = async () => {
    if (!shopName.trim()) {
      showAlert("알림", "매장명을 입력해주세요.");
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      showAlert("알림", "로그인이 필요합니다.");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/shops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: shopName.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShopName("");
        setIsRegisterModalOpen(false);
        showAlert("알림", "등록되었습니다.");
        // 매장 목록 새로고침
        refreshShops();
      } else {
        showAlert("알림", data.message || "매장 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("매장 등록 실패:", error);
      showAlert("알림", "매장 등록 중 오류가 발생했습니다.");
    } finally {
      setIsRegistering(false);
    }
  };

  // 예약 내역 조회
  const fetchAppointments = async (
    shopId: number,
    page: number = 1,
    start: string = startDate,
    end: string = endDate
  ) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.log("로그인이 필요합니다.");
      return;
    }

    setIsLoadingRecords(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/shop/${shopId}?page=${page}&limit=${ITEMS_PER_PAGE}&startDate=${start}&endDate=${end}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        const convertedRecords = data.data.map(convertToRecord);
        setRecords(convertedRecords);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setRecords([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("예약 내역 조회 실패:", error);
      setRecords([]);
      setPagination(null);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // 매장 선택 시 예약 내역 조회
  useEffect(() => {
    if (selectedShopId) {
      setCurrentPage(1);
      fetchAppointments(selectedShopId, 1, startDate, endDate);
    } else {
      setRecords([]);
      setPagination(null);
    }
  }, [selectedShopId]);

  // 기간 조회
  const handleSearch = () => {
    if (selectedShopId) {
      setCurrentPage(1);
      fetchAppointments(selectedShopId, 1, startDate, endDate);
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (selectedShopId) {
      fetchAppointments(selectedShopId, page, startDate, endDate);
    }
  };

  // 정산 합계 계산
  const totalAmount = records.reduce((sum, record) => sum + record.cost, 0);
  const completedAmount = records
    .filter((r) => r.status === "예약")
    .reduce((sum, record) => sum + record.cost, 0);
  const pendingAmount = records
    .filter((r) => r.status !== "예약")
    .reduce((sum, record) => sum + record.cost, 0);

  // 상태별 배지 색상
  const getStatusBadge = (status: GroomingRecord["status"]) => {
    switch (status) {
      case "완료":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "예약":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "대기중":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 알림 모달 */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAlert();
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {alertModal.title}
              </h3>
            </div>

            {/* 모달 본문 */}
            <div className="px-6 py-6">
              <p className="text-zinc-700 dark:text-zinc-300">
                {alertModal.message}
              </p>
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={closeAlert}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 매장 등록 모달 */}
      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRegisterModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                매장 등록
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-zinc-500"
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
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                매장명
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="매장명을 입력하세요"
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRegisterShop();
                }}
                autoFocus
              />
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRegisterShop}
                disabled={isRegistering || !shopName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
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
                    등록 중...
                  </>
                ) : (
                  "등록"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  매장 관리
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  미용 내역 및 정산 관리
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              매장 등록
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-8">
        {/* 매장 선택 섹션 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              매장 선택
            </h2>
            <div className="relative w-full max-w-md">
              {isLoadingShops ? (
                <div className="flex items-center gap-2 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    로딩 중...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedShopId || ""}
                  onChange={(e) =>
                    setSelectedShopId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  {shops.length > 0 ? (
                    <>
                      <option value="" disabled>
                        매장을 선택하세요
                      </option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      등록된 매장이 없습니다
                    </option>
                  )}
                </select>
              )}
              {!isLoadingShops && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-zinc-400"
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
                </div>
              )}
            </div>
            {selectedShop && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                선택된 매장의 정산 내역을 조회합니다
              </p>
            )}
          </div>
        </div>

        {/* 기간 조회 섹션 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              기간 조회
            </h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 dark:bg-zinc-700 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
              >
                조회
              </button>
            </div>
          </div>
        </div>

        {/* 정산 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              총 매출
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalAmount.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              정산 완료
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedAmount.toLocaleString()}원
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              정산 대기
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingAmount.toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 미용 내역 테이블 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              미용 내역
            </h2>
          </div>
          {isLoadingRecords ? (
            <div className="px-6 py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-zinc-500 dark:text-zinc-400">
                로딩 중...
              </span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        날짜
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        시간대
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        강아지명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        미용 타입
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        담당자
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        비용
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        정산 상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {record.timeSlot}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {record.dogName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {record.groomingType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {record.assignedUser}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-zinc-900 dark:text-zinc-100">
                          {record.cost.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {records.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {selectedShopId
                      ? "조회된 내역이 없습니다."
                      : "매장을 선택해주세요."}
                  </p>
                </div>
              )}
              {pagination && records.length > 0 && (
                <Paginator
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
