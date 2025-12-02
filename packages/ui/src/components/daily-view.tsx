"use client";

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
  onAppointmentClick?: (appointment: Appointment) => void;
  onBackToWeekly?: () => void;
  onDateChange?: (date: Date) => void;
}

// 시간 슬롯 생성 (06:00 ~ 22:00, 1시간 단위)
const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 ~ 22:00

export function DailyView({
  date,
  groomers = [],
  appointments = [],
  onBackToWeekly,
  onTimeSlotClick,
  onAppointmentClick,
  onDateChange,
}: DailyViewProps) {
  // 그리드 열 수 계산 (최소 1개)
  const gridColCount = Math.max(groomers.length, 1);

  // 시간 문자열을 분으로 변환
  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  // 특정 미용사와 시간에 해당하는 예약들 찾기
  const getAppointmentsForSlot = (groomerId: number, hour: number) => {
    const slotStart = hour * 60;
    const slotEnd = (hour + 1) * 60;

    return appointments.filter((apt) => {
      if (apt.groomerId !== groomerId) return false;
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);
      return aptStart < slotEnd && aptEnd > slotStart;
    });
  };

  // 예약이 특정 시간에 시작하는지 확인
  const appointmentStartsAtHour = (apt: Appointment, hour: number) => {
    const aptStartMinutes = timeToMinutes(apt.startTime);
    return aptStartMinutes >= hour * 60 && aptStartMinutes < (hour + 1) * 60;
  };

  // 예약 높이 계산 (시간 기준)
  const getAppointmentHeight = (apt: Appointment) => {
    const startMinutes = timeToMinutes(apt.startTime);
    const endMinutes = timeToMinutes(apt.endTime);
    const durationHours = (endMinutes - startMinutes) / 60;
    return durationHours * 48; // 48px per hour
  };

  // 예약 상단 오프셋 계산
  const getAppointmentTop = (apt: Appointment, hour: number) => {
    const startMinutes = timeToMinutes(apt.startTime);
    const hourStartMinutes = hour * 60;
    const offsetMinutes = startMinutes - hourStartMinutes;
    return (offsetMinutes / 60) * 48;
  };

  const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  // 이전 날짜로 이동
  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    onDateChange?.(newDate);
  };

  // 다음 날짜로 이동
  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    onDateChange?.(newDate);
  };

  // 오늘로 이동
  const goToToday = () => {
    onDateChange?.(new Date());
  };

  return (
    <div className="max-h-[calc(100vh-150px)] flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* 날짜 헤더 */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <button
          onClick={goToPreviousDay}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="이전 날"
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {formatDate(date)}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            오늘
          </button>
          {onBackToWeekly && (
            <button
              onClick={onBackToWeekly}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors flex items-center gap-1"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              주간 뷰
            </button>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="다음 날"
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

      {/* 미용선생님 + 시간대 그리드 */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div
          className="inline-block"
          style={{
            minWidth: `${80 + gridColCount * 100}px`,
          }}
        >
          {/* 미용선생님 헤더 */}
          <div
            className="grid border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-20"
            style={{
              gridTemplateColumns: `80px repeat(${gridColCount}, 100px)`,
            }}
          >
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-700">
              시간
            </div>
            {groomers.map((groomer) => (
              <div
                key={groomer.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 text-center border-r border-zinc-200 dark:border-zinc-700"
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
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-zinc-200 dark:border-zinc-800"
                style={{
                  gridTemplateColumns: `80px repeat(${gridColCount}, 100px)`,
                }}
              >
                {/* 시간 라벨 */}
                <div className="p-2 text-right pr-3 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-12">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {formatHour(hour)}
                  </span>
                </div>

                {/* 각 미용선생님의 슬롯 */}
                {groomers.map((groomer) => {
                  const slotAppointments = getAppointmentsForSlot(
                    groomer.id,
                    hour
                  );
                  const startingAppointments = slotAppointments.filter((apt) =>
                    appointmentStartsAtHour(apt, hour)
                  );

                  return (
                    <div
                      key={`${groomer.id}-${hour}`}
                      className="relative h-12 border-r border-zinc-200 dark:border-zinc-800"
                      onClick={() =>
                        onTimeSlotClick?.(groomer.id, formatHour(hour))
                      }
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
                            className={`absolute ${groomer.color} border rounded-md p-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10`}
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
                              {apt.serviceName}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {apt.startTime} - {apt.endTime}
                            </div>
                          </div>
                        );
                      })}

                      {/* 빈 슬롯 호버 효과 */}
                      {slotAppointments.length === 0 && (
                        <div className="absolute inset-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors" />
                      )}
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
