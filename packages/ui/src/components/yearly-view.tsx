"use client";

import React from "react";

interface YearlyViewProps {
  onYearSelect?: (year: number) => void;
  selectedDate?: Date;
  className?: string;
}

export function YearlyView({
  onYearSelect,
  selectedDate,
  className = "",
}: YearlyViewProps) {
  const currentYear = new Date().getFullYear();
  const selectedYear = selectedDate?.getFullYear();

  // 올해부터 10년 전까지의 연도 배열 (올해가 마지막)
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);

  // 연도 클릭 핸들러 - 해당 연도의 월별 뷰로 이동
  const handleYearClick = (year: number) => {
    if (onYearSelect) {
      onYearSelect(year);
    }
  };

  // 현재 연도인지 확인
  const isCurrentYear = (year: number) => {
    return year === currentYear;
  };

  // 선택된 연도인지 확인
  const isSelectedYear = (year: number) => {
    return selectedYear === year;
  };

  return (
    <div
      className={`max-h-[calc(100vh-150px)] flex flex-col w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-center p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          연도 선택
        </h2>
      </div>

      {/* 연도 그리드 */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {years.map((year) => {
            const isCurrent = isCurrentYear(year);
            const isSelected = isSelectedYear(year);

            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
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
                <span className="text-lg font-semibold">{year}년</span>
                {isCurrent && !isSelected && (
                  <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    올해
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
          연도를 선택하면 해당 연도의 월별 뷰로 이동합니다
        </p>
      </div>
    </div>
  );
}
