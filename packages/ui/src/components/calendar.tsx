"use client";

import React, { useState } from "react";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
}

export function Calendar({
  onDateSelect,
  selectedDate,
  className = "",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 현재 달의 첫날과 마지막 날 구하기
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  );

  // 달력 시작 요일 (일요일 = 0)
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // 총 날짜 수
  const daysInMonth = lastDayOfMonth.getDate();

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    const now = new Date();
    setViewDate(now);
    setCurrentDate(now);
    if (onDateSelect) {
      onDateSelect(now);
    }
  };

  // 날짜 선택
  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(selected);
    if (onDateSelect) {
      onDateSelect(selected);
    }
  };

  // 날짜가 같은지 확인
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // 요일 배열
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 달력 날짜 배열 생성
  const calendarDays = [];

  // 빈 칸 추가 (이전 달의 마지막 날들)
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // 현재 달의 날짜들 추가
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div
      className={`w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="이전 달"
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
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            오늘
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="다음 달"
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

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0
                ? "text-red-500 dark:text-red-400"
                : index === 6
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            day
          );
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, currentDate);
          const dayOfWeek = index % 7;

          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : isToday
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }
                ${
                  dayOfWeek === 0 && !isSelected && !isToday
                    ? "text-red-500 dark:text-red-400"
                    : ""
                }
                ${
                  dayOfWeek === 6 && !isSelected && !isToday
                    ? "text-blue-500 dark:text-blue-400"
                    : ""
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜 표시 */}
      {currentDate && (
        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            선택된 날짜
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월{" "}
            {currentDate.getDate()}일
          </p>
        </div>
      )}
    </div>
  );
}
