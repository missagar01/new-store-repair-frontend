// Store Dashboard - Modern UI Version
import { useEffect, useState } from "react";
import { storeApi } from "../../services";
import { ClipboardList, LayoutDashboard, PackageCheck, Truck, Warehouse, FileText, TrendingUp, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Package, Users, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Loading from "./Loading";

type DashboardApiResponse = {
  success: boolean;
  data: {
    // Status-based metrics
    totalIndents: number;
    completedIndents: number;
    pendingIndents: number;
    upcomingIndents: number;
    overdueIndents: number;

    // Progress percentages
    overallProgress: number;
    completedPercent: number;
    pendingPercent: number;
    upcomingPercent: number;
    overduePercent: number;

    // Quantity metrics
    totalIndentedQuantity: number;
    totalPurchaseOrders: number;
    totalPurchasedQuantity: number;
    totalIssuedQuantity: number;
    outOfStockCount: number;
    topPurchasedItems: {
      itemName: string;
      orderCount: number;
      totalOrderQty: number;
    }[];
    topVendors: {
      vendorName: string;
      uniquePoCount: number;
      totalItems: number;
    }[];
  };
};

type RepairGatePassCounts = {
  success: boolean;
  data: {
    pending: number;
    history: number;
  };
};

export default function StoreDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse['data'] | null>(null);
  const [repairGatePassCounts, setRepairGatePassCounts] = useState<{ pending: number; history: number }>({ pending: 0, history: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Load dashboard data and repair gate pass counts in parallel
        const [dashboardRes, gatePassRes] = await Promise.allSettled([
          storeApi.getStoreIndentDashboard() as Promise<DashboardApiResponse>,
          storeApi.getRepairGatePassCounts() as Promise<RepairGatePassCounts>,
        ]);

        if (!active) return;

        // Handle dashboard data
        if (dashboardRes.status === 'fulfilled' && dashboardRes.value) {
          const res = dashboardRes.value;
          if (res.success && res.data) {
            setDashboardData(res.data);
            setError(null);
          } else {
            throw new Error('No dashboard data');
          }
        } else {
          throw dashboardRes.reason || new Error('No dashboard data');
        }

        // Handle repair gate pass counts (don't fail dashboard if this fails)
        if (gatePassRes.status === 'fulfilled' && gatePassRes.value) {
          const res = gatePassRes.value;
          if (res.success && res.data) {
            setRepairGatePassCounts(res.data);
          } else if (res.data) {
            setRepairGatePassCounts(res.data);
          }
        } else {
          console.warn('Failed to load repair gate pass counts:', gatePassRes.reason);
          setRepairGatePassCounts({ pending: 0, history: 0 });
        }
      } catch (err: unknown) {
        console.error('Failed to load dashboard', err);
        if (active) {
          setError('Unable to fetch dashboard data right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      title: 'Total Indents',
      icon: <ClipboardList size={22} />,
      value: dashboardData?.totalIndents ?? '—',
      sublabel: 'Indented Quantity',
      subvalue: dashboardData ? dashboardData.totalIndentedQuantity.toLocaleString() : '—',
      bgGradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-indigo-200 dark:shadow-indigo-900/20',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'Total Purchases',
      icon: <Truck size={22} />,
      value: dashboardData?.totalPurchaseOrders ?? '—',
      sublabel: 'Purchased Quantity',
      subvalue: dashboardData ? dashboardData.totalPurchasedQuantity.toLocaleString() : '—',
      bgGradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/20',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'Pending Indents',
      icon: <PackageCheck size={22} />,
      value: dashboardData?.pendingIndents ?? '—',
      sublabel: 'Indents Waiting',
      subvalue: dashboardData?.pendingIndents?.toLocaleString() ?? '—',
      bgGradient: 'from-amber-400 to-orange-500',
      shadowColor: 'shadow-orange-200 dark:shadow-orange-900/20',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'Upcoming Indents',
      icon: <Warehouse size={22} />,
      value: dashboardData?.upcomingIndents ?? '—',
      sublabel: 'Scheduled Soon',
      subvalue: dashboardData?.upcomingIndents?.toLocaleString() ?? '—',
      bgGradient: 'from-rose-500 to-pink-600',
      shadowColor: 'shadow-pink-200 dark:shadow-pink-900/20',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'Repair Pending',
      icon: <Activity size={22} />,
      value: repairGatePassCounts.pending ?? '—',
      sublabel: 'Gate Pass Pending',
      subvalue: repairGatePassCounts.pending.toLocaleString() ?? '—',
      bgGradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-purple-200 dark:shadow-purple-900/20',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'Repair History',
      icon: <FileText size={22} />,
      value: repairGatePassCounts.history ?? '—',
      sublabel: 'Gate Pass Received',
      subvalue: repairGatePassCounts.history.toLocaleString() ?? '—',
      bgGradient: 'from-cyan-500 to-blue-500',
      shadowColor: 'shadow-cyan-200 dark:shadow-cyan-900/20',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
  ];

  if (loading) {
    return (
      <Loading
        heading="Store Dashboard"
        subtext="Loading dashboard insights"
        icon={<LayoutDashboard size={48} className="text-indigo-600" />}
      />
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm flex flex-col items-center justify-center h-64">
          <p className="text-lg font-semibold mb-2">Error loading dashboard</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transform hover:scale-105 transition-transform duration-300">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Store Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Live overview of inventory &amp; purchases
            </p>
          </div>
        </div>
        {/* <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-medium text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Live
        </div> */}
      </div>

      {/* Hero Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${card.bgGradient} p-3 sm:p-6 shadow-lg ${card.shadowColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none">
              {card.icon}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${card.iconBg} backdrop-blur-sm`}>
                  {card.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold bg-white/20 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-white/90">
                  <ArrowUpRight size={12} className="w-3 h-3 sm:w-auto sm:h-auto" />
                  <span className="hidden xs:inline sm:inline">View</span>
                </div>
              </div>

              <div>
                <p className="text-white/80 font-medium text-[10px] sm:text-sm tracking-wide uppercase truncate">{card.title}</p>
                <h3 className="text-xl sm:text-3xl font-bold text-white mt-1 mb-2 sm:mb-3 truncate">{card.value}</h3>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/20 pt-2 sm:pt-3 mt-1 gap-0.5 sm:gap-0">
                  <p className="text-white/70 text-[10px] sm:text-xs font-medium truncate">{card.sublabel}</p>
                  <p className="text-white font-semibold text-xs sm:text-sm truncate">{card.subvalue}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Progress Charts Section - Now wider */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Circular Progress */}
            <Card className="rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
              <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={20} />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Overall Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center gap-8">
                  <div className="relative w-56 h-56 flex-shrink-0">
                    <svg className="transform -rotate-90 w-full h-full drop-shadow-lg">
                      {/* Track */}
                      <circle cx="50%" cy="50%" r="90" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-100 dark:text-slate-800" />

                      {/* Segments - Adding simplified logic for display */}
                      <circle cx="50%" cy="50%" r="90" stroke="currentColor" strokeWidth="12" fill="none"
                        strokeDasharray={`${(dashboardData?.upcomingPercent || 0) * 5.65} 565`}
                        strokeDashoffset={`-${((dashboardData?.completedPercent || 0) + (dashboardData?.pendingPercent || 0)) * 5.65}`}
                        className="text-slate-300 dark:text-slate-600" />

                      <circle cx="50%" cy="50%" r="90" stroke="currentColor" strokeWidth="12" fill="none"
                        strokeDasharray={`${(dashboardData?.pendingPercent || 0) * 5.65} 565`}
                        strokeDashoffset={`-${(dashboardData?.completedPercent || 0) * 5.65}`}
                        className="text-amber-400" />

                      <circle cx="50%" cy="50%" r="90" stroke="currentColor" strokeWidth="12" fill="none"
                        strokeDasharray={`${(dashboardData?.completedPercent || 0) * 5.65} 565`}
                        className="text-emerald-500" />

                      <circle cx="50%" cy="50%" r="90" stroke="currentColor" strokeWidth="12" fill="none"
                        strokeDasharray={`${(dashboardData?.overduePercent || 0) * 5.65} 565`}
                        strokeDashoffset={`-${((dashboardData?.completedPercent || 0) + (dashboardData?.pendingPercent || 0) + (dashboardData?.upcomingPercent || 0)) * 5.65}`}
                        className="text-rose-500" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {dashboardData?.overallProgress?.toFixed(0) ?? 0}%
                      </span>
                      <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Completed</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 w-full">
                    {[
                      { label: "Completed", color: "bg-emerald-500", value: dashboardData?.completedIndents, icon: <PackageCheck size={14} className="text-white" /> },
                      { label: "Pending", color: "bg-amber-400", value: dashboardData?.pendingIndents, icon: <Truck size={14} className="text-white" /> },
                      { label: "Overdue", color: "bg-rose-500", value: dashboardData?.overdueIndents, icon: <Activity size={14} className="text-white" /> },
                      { label: "Upcoming", color: "bg-slate-300", value: dashboardData?.upcomingIndents, icon: <ArrowUpRight size={14} className="text-slate-600" /> },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} shadow-sm`}>
                            {item.icon}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{item.value?.toLocaleString() ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linear Progress Reports */}
            <Card className="rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
              <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <BarChart3 size={20} />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Key Performance Indicators</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Purchase Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                        <Truck size={16} />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Purchase Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {dashboardData && dashboardData.totalIndents > 0
                        ? Math.round((dashboardData.totalPurchaseOrders / dashboardData.totalIndents) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg"
                      style={{ width: `${dashboardData && dashboardData.totalIndents > 0 ? Math.min((dashboardData.totalPurchaseOrders / dashboardData.totalIndents) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>{dashboardData?.totalPurchaseOrders ?? 0} Orders</span>
                    <span>{dashboardData?.totalIndents ?? 0} Indents</span>
                  </div>
                </div>

                {/* Stock Utilization */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                        <Package size={16} />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Stock Utilization</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {dashboardData && dashboardData.totalPurchasedQuantity > 0
                        ? Math.round((dashboardData.totalIssuedQuantity / dashboardData.totalPurchasedQuantity) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
                      style={{ width: `${dashboardData && dashboardData.totalPurchasedQuantity > 0 ? Math.min((dashboardData.totalIssuedQuantity / dashboardData.totalPurchasedQuantity) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>{dashboardData?.totalIssuedQuantity?.toLocaleString() ?? 0} Issued</span>
                    <span>{dashboardData?.totalPurchasedQuantity?.toLocaleString() ?? 0} Acquired</span>
                  </div>
                </div>

                {/* Gate Pass Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                        <FileText size={16} />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Gate Pass Return Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {repairGatePassCounts.pending + repairGatePassCounts.history > 0
                        ? Math.round((repairGatePassCounts.history / (repairGatePassCounts.pending + repairGatePassCounts.history)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full shadow-lg"
                      style={{ width: `${repairGatePassCounts.pending + repairGatePassCounts.history > 0 ? Math.min((repairGatePassCounts.history / (repairGatePassCounts.pending + repairGatePassCounts.history)) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>{repairGatePassCounts.history} Returned</span>
                    <span>{repairGatePassCounts.pending + repairGatePassCounts.history} Total</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Side Panel - Top Lists - Stacked Vertical */}
        <div className="xl:col-span-1 space-y-6">
          {/* Top Products */}
          <Card className="rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 h-[420px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 py-5">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="bg-orange-500 w-1.5 h-1.5 rounded-full"></span> Top 10 Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
              {dashboardData?.topPurchasedItems && dashboardData.topPurchasedItems.length > 0 ? (
                <div className="flex flex-col">
                  {dashboardData.topPurchasedItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs mr-3 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-2" title={item.itemName}>{item.itemName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-500">{item.totalOrderQty.toLocaleString()} units</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold whitespace-nowrap">
                        {item.orderCount} Orders
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <PackageCheck size={48} className="opacity-20 mb-2" />
                  <p className="text-sm">No product data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card className="rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 h-[420px] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 py-5">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full"></span> Top 10 Vendors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
              {dashboardData?.topVendors && dashboardData.topVendors.length > 0 ? (
                <div className="flex flex-col">
                  {dashboardData.topVendors.slice(0, 10).map((vendor, index) => (
                    <div key={index} className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs mr-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-2" title={vendor.vendorName}>{vendor.vendorName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-500">{vendor.totalItems.toLocaleString()} items supplied</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold whitespace-nowrap">
                        {vendor.uniquePoCount} POs
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Truck size={48} className="opacity-20 mb-2" />
                  <p className="text-sm">No vendor data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
