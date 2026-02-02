import { useState } from "react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-400"
      >
        <span className="h-8 w-8 rounded-full bg-gray-100 text-center text-sm font-semibold text-gray-600 dark:bg-white/5">
          0
        </span>
        Notifications
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 dark:text-white/90">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            Notifications
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No new notifications yet.
          </p>
        </div>
      )} */}
    </div>
  );
}
