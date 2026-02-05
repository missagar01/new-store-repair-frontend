import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
          {user?.user_name?.charAt(0).toUpperCase() || "U"}
        </span>
        <span className="block mr-1 font-medium text-theme-sm">
          {user?.user_name || "User"}
        </span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-4 w-48 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 z-50">
          <p className="font-semibold">{user?.user_name || "User"}</p>
          {user?.employee_id && (
            <p className="mb-1 text-xs text-gray-500">ID: {user.employee_id}</p>
          )}
          <p className="mb-3 text-xs text-gray-500">Role: {user?.role || "User"}</p>
          <Link
            to="/profile"
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium mb-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Go to profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
