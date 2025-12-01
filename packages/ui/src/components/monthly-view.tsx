"use client";

import React, { useState } from "react";

interface MonthlyViewProps {
  onMonthSelect?: (year: number, month: number) => void;
  selectedDate?: Date;
  className?: string;
}

export function MonthlyView({
  onMonthSelect,
  selectedDate,
  className = "",
}: MonthlyViewProps) {
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() || new Date().getFullYear()
  );

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // 월 이름 배열
  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  // 이전 년도로 이동
  const goToPreviousYear = () => {
    setViewYear((prev) => prev - 1);
  };

  // 다음 년도로 이동
  const goToNextYear = () => {
    setViewYear((prev) => prev + 1);
  };

  // 올해로 이동
  const goToCurrentYear = () => {
    setViewYear(currentYear);
  };

  // 월 클릭 핸들러 - 해당 월의 첫 주로 이동
  const handleMonthClick = (monthIndex: number) => {
    if (onMonthSelect) {
      onMonthSelect(viewYear, monthIndex);
    }
  };

  // 현재 월인지 확인
  const isCurrentMonth = (monthIndex: number) => {
    return viewYear === currentYear && monthIndex === currentMonth;
  };

  // 선택된 월인지 확인
  const isSelectedMonth = (monthIndex: number) => {
    if (!selectedDate) return false;
    return (
      viewYear === selectedDate.getFullYear() &&
      monthIndex === selectedDate.getMonth()
    );
  };

  return (
    <div
      className={`max-h-[calc(100vh-150px)] flex flex-col w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={goToPreviousYear}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="이전 년도"
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

        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {viewYear}년
          </h2>
          <button
            onClick={goToCurrentYear}
            className="px-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            올해
          </button>
        </div>

        <button
          onClick={goToNextYear}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="다음 년도"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 월 그리드 */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {months.map((month, index) => {
            const isCurrent = isCurrentMonth(index);
            const isSelected = isSelectedMonth(index);

            return (
              <button
                key={index}
                onClick={() => handleMonthClick(index)}
                className={`
                  p-6 rounded-xl text-center transition-all duration-200
                  hover:scale-105 hover:shadow-md
                  ${
                    isSelected
                      ? "bg-blue-500 text-white shadow-lg"
                      : isCurrent
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }
                `}
              >
                <span className="text-lg font-semibold">{month}</span>
                {isCurrent && !isSelected && (
                  <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    현재
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 안내 텍스트 */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          월을 선택하면 해당 월의 첫 주로 이동합니다
        </p>
      </div>
    </div>
  );
}
