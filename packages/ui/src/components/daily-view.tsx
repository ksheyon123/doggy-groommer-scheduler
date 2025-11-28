"use client";

import { useMemo } from "react";

// 미용선생님 타입
export interface Groomer {
  id: number;
  name: string;
  color: string;
}

// 예약 타입
export interface Appointment {
  id: number;
  groomerId: number;
  startTime: string; // "09:00" 형식
  endTime: string;
  dogName: string;
  serviceName: string;
}

export interface DailyViewProps {
  date: Date;
  groomers?: Groomer[];
  appointments?: Appointment[];
  onTimeSlotClick?: (groomerId: number, time: string) => void;
}

// 더미 미용선생님 데이터
const defaultGroomers: Groomer[] = [
  { id: 1, name: "김미용", color: "bg-pink-100 border-pink-300" },
  { id: 2, name: "이가위", color: "bg-blue-100 border-blue-300" },
  { id: 3, name: "박샴푸", color: "bg-green-100 border-green-300" },
  { id: 4, name: "최드라이", color: "bg-purple-100 border-purple-300" },
];

// 더미 예약 데이터
const defaultAppointments: Appointment[] = [
  {
    id: 1,
    groomerId: 1,
    startTime: "09:00",
    endTime: "10:00",
    dogName: "몽이",
    serviceName: "전체 미용",
  },
  {
    id: 2,
    groomerId: 1,
    startTime: "11:00",
    endTime: "12:00",
    dogName: "초코",
    serviceName: "목욕",
  },
  {
    id: 3,
    groomerId: 2,
    startTime: "10:00",
    endTime: "11:30",
    dogName: "뽀삐",
    serviceName: "부분 미용",
  },
  {
    id: 4,
    groomerId: 3,
    startTime: "14:00",
    endTime: "15:00",
    dogName: "코코",
    serviceName: "발톱 정리",
  },
  {
    id: 5,
    groomerId: 4,
    startTime: "09:30",
    endTime: "10:30",
    dogName: "백구",
    serviceName: "전체 미용",
  },
];

// 시간 슬롯 생성 (09:00 ~ 18:00)
const timeSlots = Array.from({ length: 19 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

export function DailyView({
  date,
  groomers = defaultGroomers,
  appointments = defaultAppointments,
  onTimeSlotClick,
}: DailyViewProps) {
  // 시간 문자열을 분으로 변환
  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  // 예약이 특정 시간 슬롯에 해당하는지 확인
  const getAppointmentForSlot = (groomerId: number, time: string) => {
    const slotMinutes = timeToMinutes(time);
    return appointments.find((apt) => {
      if (apt.groomerId !== groomerId) return false;
      const startMinutes = timeToMinutes(apt.startTime);
      const endMinutes = timeToMinutes(apt.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // 예약 시작 슬롯인지 확인
  const isAppointmentStart = (groomerId: number, time: string) => {
    return appointments.some(
      (apt) => apt.groomerId === groomerId && apt.startTime === time
    );
  };

  // 예약의 슬롯 수 계산
  const getAppointmentSlotCount = (appointment: Appointment) => {
    const startMinutes = timeToMinutes(appointment.startTime);
    const endMinutes = timeToMinutes(appointment.endTime);
    return Math.ceil((endMinutes - startMinutes) / 30);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* 날짜 헤더 */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {formatDate(date)}
        </h2>
      </div>

      {/* 미용선생님 + 시간대 그리드 */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* 미용선생님 헤더 */}
          <div className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
              시간
            </div>
            {groomers.map((groomer) => (
              <div
                key={groomer.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 text-center border-l border-zinc-200 dark:border-zinc-700"
              >
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {groomer.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  미용사
                </div>
              </div>
            ))}
          </div>

          {/* 시간 슬롯 */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[80px_repeat(4,1fr)] min-h-[48px]"
              >
                {/* 시간 라벨 */}
                <div className="p-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/50 flex items-center justify-center">
                  {time}
                </div>

                {/* 각 미용선생님의 슬롯 */}
                {groomers.map((groomer) => {
                  const appointment = getAppointmentForSlot(groomer.id, time);
                  const isStart = isAppointmentStart(groomer.id, time);

                  return (
                    <div
                      key={`${groomer.id}-${time}`}
                      className="border-l border-zinc-100 dark:border-zinc-800 relative"
                      onClick={() => onTimeSlotClick?.(groomer.id, time)}
                    >
                      {appointment && isStart ? (
                        <div
                          className={`absolute inset-x-1 top-1 ${groomer.color} border rounded-md p-2 z-10 cursor-pointer hover:shadow-md transition-shadow`}
                          style={{
                            height: `calc(${getAppointmentSlotCount(appointment) * 100}% - 8px)`,
                          }}
                        >
                          <div className="text-xs font-semibold text-zinc-800 truncate">
                            {appointment.dogName}
                          </div>
                          <div className="text-xs text-zinc-600 truncate">
                            {appointment.serviceName}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                        </div>
                      ) : !appointment ? (
                        <div className="absolute inset-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors" />
                      ) : null}
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
