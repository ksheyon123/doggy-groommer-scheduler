"use client";

import React, { useState } from "react";

// 예약 타입
export interface WeeklyAppointment {
  id: number;
  groomerId: number;
  groomerName: string;
  date: Date;
  startTime: string; // "09:00" 형식
  endTime: string;
  dogName: string;
  serviceName: string;
  amount?: number; // 비용
  color: string;
}

interface WeeklyViewProps {
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (date: Date, hour: number) => void;
  onAppointmentClick?: (appointment: WeeklyAppointment) => void;
  onDayClick?: (date: Date) => void;
  onWeekChange?: (date: Date) => void;
  selectedDate?: Date;
  appointments?: WeeklyAppointment[];
  className?: string;
}

export function WeeklyView({
  onDateSelect,
  onTimeSlotSelect,
  onAppointmentClick,
  onDayClick,
  onWeekChange,
  selectedDate,
  appointments: propAppointments,
  className = "",
}: WeeklyViewProps) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 ~ 22:00

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getWeekDates = (date: Date) => {
    const weekStart = getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(viewDate);
  const appointments = propAppointments || [];

  const goToPreviousWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() - 7);
    setViewDate(newDate);
    onWeekChange?.(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + 7);
    setViewDate(newDate);
    onWeekChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onWeekChange?.(today);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  // 특정 날짜와 시간에 해당하는 예약들 찾기
  const getAppointmentsForSlot = (date: Date, hour: number) => {
    const slotStart = hour * 60;
    const slotEnd = (hour + 1) * 60;

    return appointments.filter((apt) => {
      if (!isSameDay(apt.date, date)) return false;
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);
      return aptStart < slotEnd && aptEnd > slotStart;
    });
  };

  // 예약이 특정 시간에 시작하는지 확인
  const appointmentStartsAtHour = (apt: WeeklyAppointment, hour: number) => {
    const aptStartMinutes = timeToMinutes(apt.startTime);
    return aptStartMinutes >= hour * 60 && aptStartMinutes < (hour + 1) * 60;
  };

  // 예약 높이 계산 (시간 기준)
  const getAppointmentHeight = (apt: WeeklyAppointment) => {
    const startMinutes = timeToMinutes(apt.startTime);
    const endMinutes = timeToMinutes(apt.endTime);
    const durationHours = (endMinutes - startMinutes) / 60;
    return durationHours * 48; // 48px per hour
  };

  // 예약 상단 오프셋 계산
  const getAppointmentTop = (apt: WeeklyAppointment, hour: number) => {
    const startMinutes = timeToMinutes(apt.startTime);
    const hourStartMinutes = hour * 60;
    const offsetMinutes = startMinutes - hourStartMinutes;
    return (offsetMinutes / 60) * 48;
  };

  const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;
  const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const formatDateWithYear = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const weekRangeText = `${formatDateWithYear(weekStart)} - ${formatDateWithYear(weekEnd)}`;

  return (
    <div
      className={`max-h-[calc(100vh-150px)] flex flex-col w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg ${className}`}
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
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-20">
            <div className="p-3 border-r border-zinc-200 dark:border-zinc-800" />
            {weekDates.map((date, index) => {
              const isToday = isSameDay(date, today);
              return (
                <div
                  key={index}
                  className={`p-3 text-center border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${isToday ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30" : ""}`}
                  onClick={() => onDayClick?.(date)}
                >
                  <div
                    className={`text-sm font-medium ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-zinc-600 dark:text-zinc-400"}`}
                  >
                    {weekDays[index]}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 ${isToday ? "text-blue-600" : index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-zinc-900 dark:text-zinc-50"}`}
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
                className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800"
              >
                {/* 시간 열 */}
                <div className="p-2 text-right pr-3 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-12">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {formatHour(hour)}
                  </span>
                </div>

                {/* 각 요일의 시간 슬롯 */}
                {weekDates.map((date, dayIndex) => {
                  const isToday = isSameDay(date, today);
                  const slotAppointments = getAppointmentsForSlot(date, hour);
                  const startingAppointments = slotAppointments.filter((apt) =>
                    appointmentStartsAtHour(apt, hour)
                  );

                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`relative h-12 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 ${isToday ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                      onClick={() => {
                        if (onTimeSlotSelect) onTimeSlotSelect(date, hour);
                        if (onDateSelect) {
                          const selectedDateTime = new Date(date);
                          selectedDateTime.setHours(hour, 0, 0, 0);
                          onDateSelect(selectedDateTime);
                        }
                      }}
                    >
                      {/* 예약 카드들 */}
                      {startingAppointments.map((apt, aptIndex) => {
                        const totalOverlapping = startingAppointments.length;
                        const width =
                          totalOverlapping > 1
                            ? `${100 / totalOverlapping}%`
                            : "100%";
                        const left =
                          totalOverlapping > 1
                            ? `${(aptIndex / totalOverlapping) * 100}%`
                            : "0";

                        return (
                          <div
                            key={apt.id}
                            className={`absolute ${apt.color} border rounded-md p-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10`}
                            style={{
                              top: getAppointmentTop(apt, hour),
                              height: getAppointmentHeight(apt),
                              width: `calc(${width} - 4px)`,
                              left: `calc(${left} + 2px)`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick?.(apt);
                            }}
                          >
                            <div className="text-xs font-semibold text-zinc-800 truncate">
                              {apt.dogName}
                            </div>
                            <div className="text-xs text-zinc-600 truncate">
                              {apt.groomerName}
                            </div>
                            {apt.serviceName && (
                              <div className="text-xs text-zinc-600 truncate">
                                {apt.serviceName}
                              </div>
                            )}

                            {apt.amount !== undefined && (
                              <div className="text-xs text-zinc-600 font-medium truncate">
                                {apt.amount.toLocaleString()}원
                              </div>
                            )}
                            <div className="text-xs text-zinc-500">
                              {apt.startTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
