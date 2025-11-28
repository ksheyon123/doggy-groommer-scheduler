"use client";

import { Calendar } from "@repo/ui";
import { useState } from "react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log("선택된 날짜:", date);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950 p-8">
      <main className="w-full max-w-4xl">
        <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
      </main>
    </div>
  );
}
