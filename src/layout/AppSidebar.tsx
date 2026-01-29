import { useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { UserCircleIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
// import Logo from "../asset/Logo.jpeg";

const storeAdminSubItems = [
  { name: "Dashboard", path: "/store/dashboard" },
  { name: "Create PO", path: "/store/create-po" },
  { name: "Approve Indents", path: "/store/approve-indent" },
  { name: "Approve Indent Data", path: "/store/approve-indent-data" },
  { name: "Pending Indents", path: "/store/pending-indents" },
  { name: "Pending POs", path: "/store/pending-pos" },
  { name: "Store Out Approval", path: "/store/store-out-approval" },
  { name: "Completed Items", path: "/store/completed-items" },
  { name: "Inventory", path: "/store/inventory" },
  { name: "Item Issue", path: "/store/item-issue" },
  { name: "Receive Items", path: "/store/receive-items" },
  { name: "Rate Approval", path: "/store/rate-approval" },
  { name: "Vendor Update", path: "/store/vendor-update" },
  { name: "User Indent List", path: "/store/user-indent-list" },
  { name: "User Indent Details", path: "/store/user-indent-list-indent" },
  { name: "User Requisitions", path: "/store/user-requisition" },
  { name: "Repair Gate Pass - Pending", path: "/store/repair-gate-pass" },
  { name: "Repair Gate Pass - History", path: "/store/repair-gate-pass/history" },
  { name: "Administration", path: "/store/administration" },
  { name: "Repair Follow Up", path: "/store/repair-followup" },
  { name: "Settings", path: "/store/settings" },
];

// Admin store pages (as per StoreFMS main.tsx)
const storeAdminLimitedSubItems = [
  { name: "Dashboard", path: "/store/dashboard" },
  { name: "Indent", path: "/store/approve-indent" },
  { name: "Purchase Order", path: "/store/pending-indents" },
  // { name: "Administration", path: "/store/administration" },
  { name: "Inventory", path: "/store/inventory" },
  { name: "Repair Gate Pass", path: "/store/repair-gate-pass" },
  { name: "Repair Follow Up", path: "/store/repair-followup" },
  { name: "Store GRN", path: "/store/store-grn" },
  // { name: "Store GRN Admin Approval", path: "/store/store-grn-admin" },
  { name: "Store GRN GM Approval", path: "/store/store-grn-gm" },
  { name: "Store GRN Close", path: "/store/store-grn-close" },
  { name: "Settings", path: "/store/settings" },

];

const storeUserSubItems = [
  { name: "My Indent", path: "/store/user-indent-list-indent" },
  { name: "Requisition", path: "/store/user-requisition" },
  { name: "Create Indent", path: "/store/user-indent" },
];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen, } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleSidebarLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };


  // Build store menu based on role/employee (mirrors StoreFMS logic)
  const employeeId = (user?.employee_id || "").toUpperCase();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const isStoreOutOnly = employeeId === "S07632" || employeeId === "S08088";
  const isApproveIndentOnly = employeeId === "S00116";
  const hideUserProfileSection = location.pathname === "/store/dashboard";

  const storeAccessList = useMemo(() => {
    return (user?.store_access || "")
      .split(",")
      .map(v => v.trim().toUpperCase())
      .filter(Boolean);
  }, [user?.store_access]);

  const userExtraAdminItems = useMemo(() => {
    if (!storeAccessList.length) return [];

    return storeAdminLimitedSubItems.filter(item =>
      storeAccessList.includes(item.name.toUpperCase())
    );
  }, [storeAccessList]);


  const storeMenuItems = useMemo(() => {
    if (isStoreOutOnly) {
      return storeAdminSubItems.filter(
        item =>
          item.path === "/store/store-out-approval" ||
          item.path === "/store/completed-items"
      );
    }

    if (isApproveIndentOnly) {
      return storeAdminSubItems.filter(
        item => item.path === "/store/approve-indent-data"
      );
    }

    if (isAdmin) {
      return storeAdminLimitedSubItems;
    }

    // 👇 USER ROLE WITH STORE ACCESS
    return [
      ...storeUserSubItems,
      ...userExtraAdminItems,
    ];
  }, [
    isAdmin,
    isStoreOutOnly,
    isApproveIndentOnly,
    userExtraAdminItems,
  ]);


  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-700 shadow-lg
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`${isExpanded || isHovered || isMobileOpen ? "py-3 -mx-5 px-5" : "py-4"} flex ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/store/dashboard" className={`flex items-center ${isExpanded || isHovered || isMobileOpen ? "w-full" : "gap-2 w-full"}`}>
          {/* {isExpanded || isHovered || isMobileOpen ? (
            <img
              src={Logo}
              alt="SAGAR TMT & PIPES Logo"
              className="w-full h-auto max-h-20 object-contain"
            />
          ) : (
            <div className="bg-red-600 rounded-lg p-2.5 flex items-center justify-center shadow-md mx-auto w-12 h-12">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          )} */}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar h-full">
        <nav className="mb-6 flex-1">
          <div className="flex flex-col gap-4">
            {/* Store Section */}
            {(isExpanded || isHovered || isMobileOpen) && (
              <div className="mt-2">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 px-3 py-2 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-md shadow-sm">
                  Store
                </h2>
                <ul className="space-y-1">
                  {storeMenuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        onClick={handleSidebarLinkClick}
                        className={`menu-dropdown-item ${isActive(item.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                          }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </nav>

        {/* User Info and Logout Button */}
        {(isExpanded || isHovered || isMobileOpen) && !hideUserProfileSection && (
          <div className="mt-auto border-t border-indigo-200/50 dark:border-indigo-800/50 pt-4 pb-4">
            <div className="px-4 mb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">
                    {user?.user_name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.user_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="w-full mx-4 flex items-center gap-3 px-4 py-3 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}

        {/* Compact logout for dashboard view */}
        {hideUserProfileSection && (
          <div className="mt-auto border-t border-indigo-200/50 dark:border-indigo-800/50 pt-4 pb-4">
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="w-full flex items-center gap-3 justify-center text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
