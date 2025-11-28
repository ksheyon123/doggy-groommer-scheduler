"use client";

import React, { useState } from "react";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (date: Date, hour: number) => void;
  selectedDate?: Date;
  className?: string;
}

export function Calendar({
  onDateSelect,
  onTimeSlotSelect,
  selectedDate,
  className = "",
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 요일 배열 (일요일부터 시작)
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 시간 배열 (00:00 ~ 24:00)
  const hours = Array.from({ length: 25 }, (_, i) => i);

  // 현재 주의 시작일(일요일) 구하기
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // 현재 주의 날짜들 구하기
  const getWeekDates = (date: Date) => {
    const weekStart = getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(viewDate);

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() - 7);
    setViewDate(newDate);
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + 7);
    setViewDate(newDate);
  };

  // 오늘로 이동
  const goToToday = () => {
    setViewDate(new Date());
  };

  // 날짜가 같은지 확인
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // 시간 슬롯 클릭 핸들러
  const handleTimeSlotClick = (date: Date, hour: number) => {
    if (onTimeSlotSelect) {
      onTimeSlotSelect(date, hour);
    }
    if (onDateSelect) {
      const selectedDateTime = new Date(date);
      selectedDateTime.setHours(hour, 0, 0, 0);
      onDateSelect(selectedDateTime);
    }
  };

  // 시간 포맷팅
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 주 범위 표시
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const weekRangeText = `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;

  return (
    <div
      className={`w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={goToPreviousWeek}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="이전 주"
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
            {weekRangeText}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            오늘
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="다음 주"
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

      {/* 캘린더 그리드 */}
      <div className="overflow-auto max-h-[600px]">
        <div className="min-w-[800px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
            {/* 시간 열 헤더 (빈 셀) */}
            <div className="p-3 border-r border-zinc-200 dark:border-zinc-800" />

            {/* 요일 헤더 */}
            {weekDates.map((date, index) => {
              const isToday = isSameDay(date, today);
              const dayOfWeek = index;

              return (
                <div
                  key={index}
                  className={`p-3 text-center border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 ${
                    isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      dayOfWeek === 0
                        ? "text-red-500 dark:text-red-400"
                        : dayOfWeek === 6
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {weekDays[dayOfWeek]}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 ${
                      isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : dayOfWeek === 0
                          ? "text-red-500 dark:text-red-400"
                          : dayOfWeek === 6
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {formatDate(date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 시간 그리드 */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
              >
                {/* 시간 열 */}
                <div className="p-2 text-right pr-3 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {formatHour(hour)}
                  </span>
                </div>

                {/* 각 요일의 시간 슬롯 */}
                {weekDates.map((date, dayIndex) => {
                  const isToday = isSameDay(date, today);

                  return (
                    <button
                      key={`${dayIndex}-${hour}`}
                      onClick={() => handleTimeSlotClick(date, hour)}
                      className={`
                        h-12 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0
                        hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                        ${isToday ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}
                      `}
                      aria-label={`${formatDate(date)} ${formatHour(hour)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
