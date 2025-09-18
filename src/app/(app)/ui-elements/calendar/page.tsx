"use client";

import { useState } from "react";
import { UIElementCard } from "@/components/ui-element-card";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UIElementCard
        title="Calendar"
        description="A date picker component."
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </UIElementCard>
    </div>
  );
}