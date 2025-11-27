'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { z } from 'zod';
import type { CalendarWidgetSchema } from '@/lib/dashboard/widget-schemas';

type CalendarData = z.infer<typeof CalendarWidgetSchema>;

interface CalendarWidgetProps {
  data?: CalendarData;
}

export function CalendarWidget({ data }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!data) return null;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const eventMap = new Map(data.events?.map((e) => [new Date(e.date).getDate(), e]) || []);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-32 text-center">
            {currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const event = eventMap.get(day);
          return (
            <div
              key={day}
              className={`p-2 text-center rounded text-sm ${
                event
                  ? 'bg-pink-100 text-pink-900 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              {day}
              {event && <div className="w-1 h-1 bg-pink-600 rounded-full mx-auto mt-1" />}
            </div>
          );
        })}
      </div>

      {data.events && data.events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Upcoming Events
          </p>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {data.events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="text-xs p-2 bg-gray-50 rounded border border-gray-200"
              >
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-gray-600">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
