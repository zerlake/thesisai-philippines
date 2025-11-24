"use client";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className = "" }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > 99 ? "99+" : count;

  return (
    <div
      className={`
        absolute top-0 right-0 translate-x-1 -translate-y-1
        bg-red-600 text-white text-xs font-bold
        rounded-full w-5 h-5 flex items-center justify-center
        ${className}
      `}
    >
      {displayCount}
    </div>
  );
}
