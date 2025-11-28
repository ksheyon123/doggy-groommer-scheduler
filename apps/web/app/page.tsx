"use client";

import {
  Calendar,
  DailyView,
  WeeklyView,
  ViewModeDropdown,
  useModal,
  type ViewMode,
} from "@repo/ui";
import { useState } from "react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  const { showModal } = useModal();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    // Modal 사용 예시
    showModal(
      {
        header: "예약 확인",
        body: (onConfirm, onReject, onClose) => (
          <div className="space-y-3">
            <p>
              <strong>{date.toLocaleDateString("ko-KR")}</strong>에 예약을
              추가하시겠습니까?
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
      {/* 헤더 */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐕</span>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  멍멍 미용실
                </h1>
              </div>
            </div>
            <ViewModeDropdown value={viewMode} onChange={setViewMode} />
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
