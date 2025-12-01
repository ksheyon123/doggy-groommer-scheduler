"use client";

import {
  Calendar,
  DailyView,
  WeeklyView,
  ViewModeDropdown,
  LoginModal,
  AppointmentFormModal,
  type ViewMode,
  type DogSearchItem,
  type AppointmentFormData,
  type GroomingTypeItem,
  type GroomerItem,
  type DogRegisterData,
  type Groomer as DailyGroomer,
  type Appointment as DailyAppointment,
  type WeeklyAppointment,
} from "@repo/ui";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, useAuth } from "@/lib/auth";
import { useShop } from "@/lib/shop";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Shop 타입
interface Shop {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

// API에서 받아온 예약 데이터 타입
interface ApiAppointment {
  id: number;
  shop_id: number;
  dog_id: number;
  created_by_user_id: number;
  assigned_user_id?: number; // 담당 미용사 ID
  grooming_type: string;
  memo?: string;
  amount?: number;
  appointment_at: string;
  start_time: string;
  end_time: string;
  status: string;
  dog?: {
    id: number;
    name: string;
    breed: string;
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
  };
  shop?: {
    id: number;
    name: string;
  };
}

// 선택된 미용사 타입
interface SelectedGroomer {
  id: number;
  name: string;
  color: string;
}

// 미용사 색상 배열
const GROOMER_COLORS = [
  "bg-pink-100 border-pink-300",
  "bg-blue-100 border-blue-300",
  "bg-green-100 border-green-300",
  "bg-purple-100 border-purple-300",
  "bg-yellow-100 border-yellow-300",
  "bg-orange-100 border-orange-300",
  "bg-cyan-100 border-cyan-300",
  "bg-rose-100 border-rose-300",
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  // 전역 샵 상태 사용
  const { shops, selectedShop, setSelectedShop, refreshShops } = useShop();

  // 예약 모달 상태
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentInitialDate, setAppointmentInitialDate] = useState("");
  const [appointmentInitialTime, setAppointmentInitialTime] = useState("");
  const [selectedGroomer, setSelectedGroomer] =
    useState<SelectedGroomer | null>(null);
  const [groomingTypes, setGroomingTypes] = useState<GroomingTypeItem[]>([]);
  const [groomers, setGroomers] = useState<GroomerItem[]>([]);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);

  // 예약 수정 모달 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAppointmentData, setEditAppointmentData] = useState<{
    id: number;
    dog_id: number;
    dogName: string;
    dogBreed?: string;
    ownerName?: string;
    assigned_user_id: number | null;
    appointment_at: string;
    start_time: string;
    end_time: string;
    memo: string;
    grooming_type: string;
    amount: number | null;
  } | null>(null);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // 날짜를 YYYY-MM-DD 형식으로 포맷
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 매장 목록 가져오기 (전역 상태 사용)
  useEffect(() => {
    if (isAuthenticated) {
      refreshShops();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 미용 종류 가져오기
  useEffect(() => {
    const fetchGroomingTypes = async () => {
      if (!selectedShop) return;

      const accessToken = getAccessToken();
      if (!accessToken) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/shops/${selectedShop.id}/grooming-types`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setGroomingTypes(data.data);
        }
      } catch (error) {
        console.error("미용 종류 조회 실패:", error);
      }
    };

    fetchGroomingTypes();
  }, [selectedShop]);

  // 직원(미용사) 목록 가져오기
  useEffect(() => {
    const fetchGroomers = async () => {
      if (!selectedShop) return;

      const accessToken = getAccessToken();
      if (!accessToken) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/employees/shop/${selectedShop.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.success) {
          // Employee 데이터를 GroomerItem 형태로 변환
          const groomerList: GroomerItem[] = data.data.map((emp: any) => ({
            id: emp.id,
            user_id: emp.user_id,
            name: emp.user?.name || "이름 없음",
            role: emp.role,
          }));
          setGroomers(groomerList);
        }
      } catch (error) {
        console.error("직원 목록 조회 실패:", error);
      }
    };

    fetchGroomers();
  }, [selectedShop]);

  // 예약 목록 가져오기
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedShop) return;

      const accessToken = getAccessToken();
      if (!accessToken) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/appointments/shop/${selectedShop.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setAppointments(data.data);
        }
      } catch (error) {
        console.error("예약 목록 조회 실패:", error);
      }
    };

    fetchAppointments();
  }, [selectedShop]);

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

  // 날짜 선택 시 (캘린더에서)
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setAppointmentInitialDate(formatDateForInput(date));
    setAppointmentInitialTime("");
    setSelectedGroomer(null);
    setIsAppointmentModalOpen(true);
  };

  // 시간 슬롯 클릭 시 (일일 뷰에서)
  const handleTimeSlotClick = (groomerId: number, time: string) => {
    // groomerId는 user_id이므로 user_id로 찾기
    const groomer = groomers.find((g) => g.user_id === groomerId);

    setAppointmentInitialDate(formatDateForInput(selectedDate));
    setAppointmentInitialTime(time);
    setSelectedGroomer(
      groomer
        ? {
            id: groomer.user_id,
            name: groomer.name,
            color:
              GROOMER_COLORS[groomers.indexOf(groomer) % GROOMER_COLORS.length],
          }
        : null
    );
    setIsAppointmentModalOpen(true);
  };

  // DailyView용 groomers 변환 (user_id를 id로 사용하여 appointments와 매칭)
  // "미배정" 그루머를 먼저 추가하고, 실제 직원들을 추가
  const dailyGroomers: DailyGroomer[] = [
    {
      id: 0, // 미배정 ID
      name: "미배정",
      color: "bg-gray-100 border-gray-300",
    },
    ...groomers.map((g, index) => ({
      id: g.user_id, // user_id를 사용하여 appointments의 assigned_user_id와 매칭
      name: g.name,
      color: GROOMER_COLORS[index % GROOMER_COLORS.length],
    })),
  ];

  // 시간 형식 변환 (HH:MM:SS -> HH:MM)
  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "09:00";
    // "HH:MM:SS" 형식에서 "HH:MM"만 추출
    return time.substring(0, 5);
  };

  // 날짜 문자열 비교 (YYYY-MM-DD 형식)
  const isSameDate = (dateStr: string, targetDate: Date): boolean => {
    const targetDateStr = formatDateForInput(targetDate);
    return dateStr === targetDateStr;
  };

  // DailyView용 appointments 변환
  const dailyAppointments: DailyAppointment[] = appointments
    .filter((apt) => isSameDate(apt.appointment_at, selectedDate))
    .map((apt) => {
      // assigned_user_id가 있고 해당 직원이 존재하면 그 ID 사용, 없으면 0(미배정)
      let groomerId = 0; // 기본값: 미배정
      if (apt.assigned_user_id) {
        // assigned_user_id가 dailyGroomers에 있는지 확인
        const groomerExists = groomers.some(
          (g) => g.user_id === apt.assigned_user_id
        );
        if (groomerExists) {
          groomerId = apt.assigned_user_id;
        }
      }
      return {
        id: apt.id,
        groomerId: groomerId,
        startTime: formatTime(apt.start_time),
        endTime: formatTime(apt.end_time),
        dogName: apt.dog?.name || "이름 없음",
        serviceName: apt.grooming_type || "미용",
      };
    });

  // WeeklyView용 appointments 변환
  const weeklyAppointments: WeeklyAppointment[] = appointments.map((apt) => {
    // assigned_user_id가 있으면 담당 미용사, 없으면 created_by_user_id 사용
    const assignedUserId = apt.assigned_user_id || apt.created_by_user_id;
    const groomerIndex = groomers.findIndex(
      (g) => g.user_id === assignedUserId
    );
    const groomer = groomers[groomerIndex];
    // DATEONLY 형식 파싱 (YYYY-MM-DD)
    const [year, month, day] = apt.appointment_at.split("-").map(Number);
    return {
      id: apt.id,
      groomerId: assignedUserId,
      groomerName: groomer?.name || "미정",
      date: new Date(year, month - 1, day), // 로컬 시간으로 생성
      startTime: formatTime(apt.start_time),
      endTime: formatTime(apt.end_time),
      dogName: apt.dog?.name || "이름 없음",
      serviceName: apt.grooming_type || "미용",
      color:
        groomerIndex >= 0
          ? GROOMER_COLORS[groomerIndex % GROOMER_COLORS.length]
              .replace("100", "200")
              .replace("300", "400")
          : "bg-gray-200 border-gray-400",
    };
  });

  // 강아지 검색 API
  const handleSearchDog = async (query: string): Promise<DogSearchItem[]> => {
    if (!selectedShop) return [];

    const accessToken = getAccessToken();
    if (!accessToken) return [];

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dogs/search?name=${encodeURIComponent(query)}&shopId=${selectedShop.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("강아지 검색 실패:", error);
      return [];
    }
  };

  // 강아지 등록 API
  const handleRegisterDog = async (
    dogData: DogRegisterData
  ): Promise<DogSearchItem> => {
    if (!selectedShop) {
      throw new Error("매장 정보가 없습니다.");
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const response = await fetch(`${API_BASE_URL}/api/dogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        shop_id: selectedShop.id,
        name: dogData.name,
        breed: dogData.breed,
        owner_name: dogData.owner_name,
        owner_phone_number: dogData.owner_phone_number,
        note: dogData.note,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "강아지 등록에 실패했습니다.");
    }

    // DogSearchItem 형태로 반환
    return {
      id: data.data.id,
      name: data.data.name,
      owner_name: data.data.owner_name,
      breed: data.data.breed,
    };
  };

  // 예약 목록 새로고침
  const refreshAppointments = async () => {
    if (!selectedShop) return;

    const accessToken = getAccessToken();
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/shop/${selectedShop.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error("예약 목록 조회 실패:", error);
    }
  };

  // 예약 등록/수정 API
  const handleAppointmentSubmit = async (
    formData: AppointmentFormData
  ): Promise<void> => {
    if (!selectedShop || !user) {
      throw new Error("매장 또는 사용자 정보가 없습니다.");
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    // 수정 모드
    if (isEditMode && formData.id) {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${formData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            assigned_user_id: formData.assigned_user_id,
            grooming_type: formData.grooming_type,
            memo: formData.memo,
            amount: formData.amount,
            appointment_at: formData.appointment_at,
            start_time: formData.start_time,
            end_time: formData.end_time,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "예약 수정에 실패했습니다.");
      }

      // 예약 목록 새로고침
      await refreshAppointments();
      return;
    }

    // 등록 모드
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        shop_id: selectedShop.id,
        dog_id: formData.dog_id,
        created_by_user_id: user.id,
        assigned_user_id: formData.assigned_user_id || selectedGroomer?.id,
        grooming_type: formData.grooming_type,
        memo: formData.memo,
        amount: formData.amount,
        appointment_at: formData.appointment_at,
        start_time: formData.start_time,
        end_time: formData.end_time,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "예약 등록에 실패했습니다.");
    }

    // 예약 목록 새로고침
    await refreshAppointments();
  };

  // 예약 삭제 API
  const handleAppointmentDelete = async (id: number): Promise<void> => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "예약 삭제에 실패했습니다.");
    }

    // 예약 목록 새로고침
    await refreshAppointments();
  };

  // 예약 클릭 시 수정 모달 열기 (Weekly View)
  const handleWeeklyAppointmentClick = (appointment: WeeklyAppointment) => {
    // 원본 API 데이터에서 해당 예약 찾기
    const apiAppointment = appointments.find(
      (apt) => apt.id === appointment.id
    );
    if (!apiAppointment) return;

    setIsEditMode(true);
    setEditAppointmentData({
      id: apiAppointment.id,
      dog_id: apiAppointment.dog_id,
      dogName: apiAppointment.dog?.name || "",
      dogBreed: apiAppointment.dog?.breed,
      ownerName: undefined, // Dog 모델에 owner_name이 없으므로 undefined
      assigned_user_id: apiAppointment.assigned_user_id || null,
      appointment_at: apiAppointment.appointment_at,
      start_time: formatTime(apiAppointment.start_time),
      end_time: formatTime(apiAppointment.end_time),
      memo: apiAppointment.memo || "",
      grooming_type: apiAppointment.grooming_type || "",
      amount: apiAppointment.amount || null,
    });
    setIsAppointmentModalOpen(true);
  };

  // 예약 클릭 시 수정 모달 열기 (Daily View)
  const handleDailyAppointmentClick = (appointment: DailyAppointment) => {
    // 원본 API 데이터에서 해당 예약 찾기
    const apiAppointment = appointments.find(
      (apt) => apt.id === appointment.id
    );
    if (!apiAppointment) return;

    setIsEditMode(true);
    setEditAppointmentData({
      id: apiAppointment.id,
      dog_id: apiAppointment.dog_id,
      dogName: apiAppointment.dog?.name || "",
      dogBreed: apiAppointment.dog?.breed,
      ownerName: undefined,
      assigned_user_id: apiAppointment.assigned_user_id || null,
      appointment_at: apiAppointment.appointment_at,
      start_time: formatTime(apiAppointment.start_time),
      end_time: formatTime(apiAppointment.end_time),
      memo: apiAppointment.memo || "",
      grooming_type: apiAppointment.grooming_type || "",
      amount: apiAppointment.amount || null,
    });
    setIsAppointmentModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsAppointmentModalOpen(false);
    setIsEditMode(false);
    setEditAppointmentData(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal || (!isLoading && !isAuthenticated)}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 예약 등록/수정 모달 */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAppointmentSubmit}
        onDelete={handleAppointmentDelete}
        onSearchDog={handleSearchDog}
        onRegisterDog={handleRegisterDog}
        groomingTypes={groomingTypes}
        groomers={groomers}
        initialDate={appointmentInitialDate}
        initialTime={appointmentInitialTime}
        groomerId={selectedGroomer?.id}
        groomerName={selectedGroomer?.name}
        editMode={isEditMode}
        editData={editAppointmentData || undefined}
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
                          router.push("/customer");
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        고객 관리
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/shop/settings");
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
        {viewMode === "daily" && (
          <DailyView
            date={selectedDate}
            groomers={dailyGroomers}
            appointments={dailyAppointments}
            onBackToWeekly={() => setViewMode("weekly")}
            onTimeSlotClick={handleTimeSlotClick}
            onAppointmentClick={handleDailyAppointmentClick}
          />
        )}
        {viewMode === "weekly" && (
          <WeeklyView
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            appointments={weeklyAppointments}
            onDayClick={(date) => {
              setSelectedDate(date);
              setViewMode("daily");
            }}
            onAppointmentClick={handleWeeklyAppointmentClick}
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
