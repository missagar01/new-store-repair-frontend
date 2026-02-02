import { useEffect, useMemo, useState } from "react";
import { Loader, FileText, CheckCircle } from "lucide-react";
import Heading from "../../components/element/Heading";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { storeGRNApi } from "../../services/storeGRNApi";
import { storeGRNApprovalApi } from "../../services/storeGRNApprovalApi";

/* ================= TYPES ================= */

type StoreGRNRow = {
    PLANNEDDATE?: string;
    VRNO?: string;
    VRDATE?: string;
    PARTYNAME?: string;
    PARTYBILLNO?: string;
    PARTYBILLAMT?: number;
    sended_bill?: boolean;
};

/* ================= HELPERS ================= */

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB");
}

/* ================= COMPONENT ================= */

export default function StoreGRN() {
    const [rows, setRows] = useState<StoreGRNRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [processingGrn, setProcessingGrn] = useState<string | null>(null);
    const [historyRows, setHistoryRows] = useState<StoreGRNRow[]>([]);

    /* ================= FETCH ORACLE DATA ================= */

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);

            try {
                const [oracleRes, pgRes] = await Promise.all([
                    storeGRNApi.getPending(),          // ORACLE
                    storeGRNApprovalApi.getAll(),      // PGSQL
                ]);

                if (!isMounted) return;

                if (!oracleRes?.success) {
                    toast.error("Failed to load Store GRN data");
                    return;
                }

                const dateThreshold = new Date('2026-02-01T00:00:00');
                const oracleRows: StoreGRNRow[] = (oracleRes.data || []).filter((row: any) => {
                    if (!row.VRDATE) return false;
                    const rowDate = new Date(row.VRDATE);
                    return rowDate >= dateThreshold;
                });
                const pgRows: any[] = pgRes?.data || [];

                // PG GRN lookup
                const pgGrnSet = new Set(
                    pgRows
                        .map((r) => r?.grn_no)
                        .filter(Boolean)
                        .map(String)
                );

                // ✅ Pending = Oracle rows NOT present in PG
                const pendingRows = oracleRows.filter(
                    (row) => row.VRNO && !pgGrnSet.has(String(row.VRNO))
                );

                // ✅ History = ONLY PG rows
                const historyMapped: StoreGRNRow[] = pgRows.map((r) => ({
                    VRNO: r.grn_no,
                    VRDATE: r.grn_date,
                    PARTYNAME: r.party_name,
                    PARTYBILLNO: r.party_bill_no,
                    PARTYBILLAMT: r.party_bill_amount,
                    PLANNEDDATE: r.planned_date,
                    sended_bill: true,
                }));

                setRows(pendingRows);
                setHistoryRows(historyMapped);
            } catch (err) {
                console.error(err);
                toast.error("Error fetching Store GRN data");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);



    /* ================= SEND BILL ================= */

    const handleSendBill = async (row: StoreGRNRow) => {
        if (!row.VRNO) return;

        const confirmed = window.confirm(
            `Are you sure you want to send bill for GRN ${row.VRNO}?`
        );
        if (!confirmed) return;

        setProcessingGrn(row.VRNO);

        try {
            await storeGRNApprovalApi.sendBill({
                planned_date: row.PLANNEDDATE,
                grn_no: row.VRNO,
                grn_date: row.VRDATE,
                party_name: row.PARTYNAME,
                party_bill_no: row.PARTYBILLNO,
                party_bill_amount: row.PARTYBILLAMT,
            });


            toast.success("Bill sent successfully");

            setRows((prev) => prev.filter((r) => r.VRNO !== row.VRNO));

            setHistoryRows((prev) => [
                {
                    ...row,
                    sended_bill: true,
                },
                ...prev,
            ]);

        } catch (err) {
            console.error(err);
            toast.error("Failed to send bill");
        } finally {
            setProcessingGrn(null);
        }
    };

    /* ================= FILTERING ================= */

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        const source = activeTab === "pending" ? rows : historyRows;

        return source.filter((r) => {
            if (!q) return true;

            return (
                r.VRNO?.toLowerCase().includes(q) ||
                r.PARTYNAME?.toLowerCase().includes(q) ||
                r.PARTYBILLNO?.toLowerCase().includes(q)
            );
        });
    }, [rows, historyRows, search, activeTab]);


    /* ================= UI ================= */

    return (
        <div className="w-full p-4 md:p-6 lg:p-8">
            <Heading
                heading="Store GRN"
                subtext="Pending & History GRN processing"
            >
                <FileText size={48} className="text-primary" />
            </Heading>

            {/* TABS */}
            <div className="flex gap-2 mb-4">
                <Button
                    variant={activeTab === "pending" ? "default" : "outline"}
                    onClick={() => setActiveTab("pending")}
                >
                    Pending
                </Button>
                <Button
                    variant={activeTab === "history" ? "default" : "outline"}
                    onClick={() => setActiveTab("history")}
                >
                    History
                </Button>
            </div>

            {/* SEARCH */}
            <div className="mb-4 flex justify-end">
                <Input
                    className="w-full max-w-md"
                    placeholder="Search GRN / Party / Bill No"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* TABLE */}
            <div className="relative overflow-x-auto border rounded-xl bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader className="animate-spin" />
                    </div>
                ) : filteredRows.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                        No records found
                    </div>
                ) : (
                    <table className="w-full min-w-[1200px] text-sm">
                        <thead className="bg-slate-100 border-b">
                            <tr>
                                <th className="px-3 py-2 text-center">Action</th>
                                <th className="px-3 py-2">Planned Date</th>
                                <th className="px-3 py-2">GRN No</th>
                                <th className="px-3 py-2">GRN Date</th>
                                <th className="px-3 py-2">Party Name</th>
                                <th className="px-3 py-2">Bill No</th>
                                <th className="px-3 py-2 text-right">Bill Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRows.map((row) => (
                                <tr key={row.VRNO} className="border-b even:bg-gray-50">
                                    <td className="px-3 py-2 text-center">
                                        {row.sended_bill ? (
                                            <CheckCircle className="text-green-600 mx-auto" />
                                        ) : (
                                            <Button
                                                size="sm"
                                                disabled={processingGrn === row.VRNO}
                                                onClick={() => handleSendBill(row)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                {processingGrn === row.VRNO
                                                    ? "Sending..."
                                                    : "Sended Bill"}
                                            </Button>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">{row.PLANNEDDATE || "—"}</td>
                                    <td className="px-3 py-2 font-medium">{row.VRNO}</td>
                                    <td className="px-3 py-2">{formatDate(row.VRDATE)}</td>
                                    <td className="px-3 py-2">{row.PARTYNAME}</td>
                                    <td className="px-3 py-2">{row.PARTYBILLNO}</td>
                                    <td className="px-3 py-2 text-right">
                                        {row.PARTYBILLAMT?.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
