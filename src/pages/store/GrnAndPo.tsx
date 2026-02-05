import { useEffect, useState } from "react";
import { storeApi } from "../../services";
import {
    BarChart3,
    Calendar,
    ArrowRight,
    PackageCheck,
    FileText,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Loading from "./Loading";

// Custom style to show calendar picker icon (required for iframe compatibility)
const dateInputStyle = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    display: block !important;
    opacity: 1 !important;
    cursor: pointer !important;
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    background: transparent !important;
    color: transparent !important;
  }
`;

type SummaryData = {
    TCODE: string;
    ENTITY_CODE: string;
    TOTAL_AMOUNT: number;
};

const GrnAndPo = () => {
    const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
    const [summaryLoading, setSummaryLoading] = useState(true);

    const getTodayISO = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const [fromDate, setFromDate] = useState(getTodayISO());
    const [toDate, setToDate] = useState(getTodayISO());

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setSummaryLoading(true);
                const res: any = await storeApi.getGrnAndPoSummary({ fromDate, toDate });
                if (res.success) {
                    setSummaryData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch summary data", err);
            } finally {
                setSummaryLoading(false);
            }
        };

        fetchSummary();
    }, [fromDate, toDate]);

    const getUserName = (code: string) => {
        const mapping: Record<string, string> = {
            sr: "Saurabh",
            pa: "Pankaj",
            al: "Alankar",
        };
        return mapping[code.toLowerCase()] || code;
    };

    const getTypeName = (tcode: string) => {
        if (!tcode) return "—";
        const code = String(tcode).toUpperCase();
        if (code.includes("G")) return "GRN";
        if (code.includes("U")) return "PO";
        return tcode;
    };

    return (
        <div className="w-full p-4 md:p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen font-sans">
            <style>{dateInputStyle}</style>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transform hover:scale-105 transition-transform duration-300">
                        <BarChart3 size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Daily GRN & PO Summary
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Detailed tracking of purchases and receipts
                        </p>
                    </div>
                </div>
            </div>

            <Card className="rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden border-3 border-indigo-600">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Filters</CardTitle>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Select date range for summary</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 cursor-pointer relative" onClick={(e) => {
                            try {
                                const input = e.currentTarget.querySelector('input');
                                if (input) input.showPicker();
                            } catch (err) {
                                console.warn("showPicker() restricted:", err);
                            }
                        }}>
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none w-full cursor-pointer"
                            />
                        </div>
                        <ArrowRight size={14} className="text-slate-400 hidden sm:block" />
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 cursor-pointer relative" onClick={(e) => {
                            try {
                                const input = e.currentTarget.querySelector('input');
                                if (input) input.showPicker();
                            } catch (err) {
                                console.warn("showPicker() restricted:", err);
                            }
                        }}>
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none w-full cursor-pointer"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {summaryLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-slate-500 animate-pulse">Fetching summary data...</p>
                        </div>
                    ) : (
                        <>
                            {["GRN", "PO"].map((type) => {
                                const isGRN = type === "GRN";
                                const users = ["sr"];

                                return (
                                    <div key={type} className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`w-2 h-6 rounded-full ${isGRN ? "bg-emerald-500" : "bg-blue-500"}`}></div>
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{type} Transactions</h3>
                                        </div>

                                        <div className="grid grid-cols sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {users.map((userCode) => {
                                                const item = summaryData.find(
                                                    (d) => getTypeName(d.TCODE) === type && d.ENTITY_CODE.toLowerCase() === userCode
                                                );
                                                const amount = item?.TOTAL_AMOUNT || 0;
                                                const userName = getUserName(userCode);

                                                return (
                                                    <div key={userCode} className="group relative overflow-hidden p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md">
                                                        <div className={`absolute top-0 right-0 w-20 h-20 opacity-5 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110 group-hover:opacity-10 ${isGRN ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                            {isGRN ? <PackageCheck size={80} /> : <FileText size={80} />}
                                                        </div>

                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase ${isGRN ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                                                                {type}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                                <Users size={14} />
                                                                <span className="text-sm font-bold">{userName}</span>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Total Amount</p>
                                                            <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                                                                ₹{amount.toFixed(2)}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {isGRN && <hr className="border-slate-100 dark:border-slate-800 my-4" />}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GrnAndPo;

