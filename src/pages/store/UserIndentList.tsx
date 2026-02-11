import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import Heading from "../../components/element/Heading";
import DataTable from "../../components/element/DataTable";
import { Button } from "../../components/ui/button";
import { ComboBox } from "../../components/ui/combobox";
import { storeApi } from "../../services";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

type IndentRow = {
  timestamp: string;
  formType?: string;
  requestNumber?: string;
  indentSeries?: string;
  indentNumber?: string;
  requesterName?: string;
  department?: string;
  division?: string;
  itemCode?: string;
  productName?: string;
  requestQty?: number;
  uom?: string;
  make?: string;
  purpose?: string;
  costLocation?: string;
  requestStatus?: string;
  gmApproval?: string;
};

export default function UserIndentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<IndentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState<string[]>([]);
  const [uomFilter, setUomFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const fetchIndents = async () => {
      setLoading(true);
      try {
        const username = (user as { user_name?: string; name?: string })?.user_name || (user as { user_name?: string; name?: string })?.name || "";
        const currentName = String(username).trim();
        const role = String((user as any)?.role || "").toUpperCase();

        let res: any;
        if (role !== "ADMIN" && currentName) {
          res = await storeApi.filterIndents({
            requesterName: currentName,
            limit: 500,
          });
        } else {
          res = await storeApi.getAllIndents();
        }

        if (!active) return;

        const resData = (res as { data?: unknown }).data;
        const payload: unknown[] = Array.isArray(resData)
          ? resData
          : Array.isArray(res as unknown[])
            ? (res as unknown[])
            : [];

        const mapped = payload
          .map((r: any) => ({
            timestamp: String(r.timestamp ?? r.created_at ?? r.createdAt ?? ""),
            formType: String(r.form_type ?? r.formType ?? ""),
            requestNumber: String(r.request_number ?? r.requestNumber ?? ""),
            indentSeries: String(r.indent_series ?? r.indentSeries ?? ""),
            indentNumber: String(r.indent_number ?? r.indentNumber ?? ""),
            requesterName: String(r.requester_name ?? r.requesterName ?? ""),
            department: String(r.department ?? ""),
            division: String(r.division ?? ""),
            itemCode: String(r.item_code ?? r.itemCode ?? ""),
            productName: String(r.product_name ?? r.productName ?? ""),
            requestQty: Number(r.request_qty ?? r.requestQty ?? 0) || 0,
            uom: String(r.uom ?? ""),
            specification: String(r.specification ?? ""),
            make: String(r.make ?? ""),
            purpose: String(r.purpose ?? ""),
            costLocation: String(r.cost_location ?? r.costLocation ?? ""),
            requestStatus: String(r.request_status ?? r.requestStatus ?? ""),
            gmApproval: String(r.gm_approval ?? r.gmApproval ?? ""),
            planned_1: r.planned_1,
            actual_1: r.actual_1,
            time_delay_1: r.time_delay_1,
          }))
          .filter((r: IndentRow) => {
            const type = (r.formType || "").toUpperCase();
            return type === "INDENT" || type === "REQUISITION";
          });

        setRows(mapped);
      } catch (err) {
        console.error("Failed to load indent list", err);
        if (active) {
          toast.error("Failed to load indent list");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchIndents();
    return () => {
      active = false;
    };
  }, [user]);

  const filteredRows = useMemo(() => {
    const currentName = (user as { user_name?: string; name?: string })?.user_name || (user as { user_name?: string; name?: string })?.name;
    const role = String((user as any)?.role || "").toUpperCase();
    const productValue = productFilter[0] ?? "";
    const uomValue = uomFilter[0] ?? "";
    const locationValue = locationFilter[0] ?? "";

    let data = rows;

    // Only filter by requester if NOT an ADMIN
    if (role !== "ADMIN" && currentName) {
      data = data.filter(
        (r) =>
          (r.requesterName || "").toLowerCase() ===
          String(currentName).toLowerCase()
      );
    }

    if (productValue) {
      data = data.filter(
        (r) =>
          (r.productName || "").toLowerCase() === productValue.toLowerCase()
      );
    }

    if (uomValue) {
      data = data.filter(
        (r) => (r.uom || "").toLowerCase() === uomValue.toLowerCase()
      );
    }

    if (locationValue) {
      data = data.filter(
        (r) =>
          (r.costLocation || "").toLowerCase() === locationValue.toLowerCase()
      );
    }

    return data;
  }, [rows, user, productFilter, uomFilter, locationFilter]);

  const productOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const val = (r.productName || "").trim();
      if (val) set.add(val);
    });
    return [
      { label: "All products", value: "" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ label: v, value: v })),
    ];
  }, [rows]);

  const uomOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const val = (r.uom || "").trim();
      if (val) set.add(val);
    });
    return [
      { label: "All UOM", value: "" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ label: v, value: v })),
    ];
  }, [rows]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const val = (r.costLocation || "").trim();
      if (val) set.add(val);
    });
    return [
      { label: "All locations", value: "" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ label: v, value: v })),
    ];
  }, [rows]);

  const columns: ColumnDef<IndentRow>[] = [
    {
      accessorKey: "indentNumber",
      header: "Indent No.",
      cell: ({ row }) => {
        const val = row.original.indentNumber;
        if (!val || !val.trim()) {
          return <span className="text-gray-400 italic">not process in ERP</span>;
        }
        return val;
      }
    },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => {
        const timestamp = row.original.timestamp;
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return timestamp;
        return date.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    { accessorKey: "requestNumber", header: "Request No." },
    { accessorKey: "formType", header: "Form Type" },
    { accessorKey: "indentSeries", header: "Series" },
    { accessorKey: "requesterName", header: "Requester" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "division", header: "Division" },
    { accessorKey: "itemCode", header: "Item Code" },
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "uom", header: "UOM" },
    { accessorKey: "requestQty", header: "Qty" },
    { accessorKey: "costLocation", header: "Cost Location" },
    { accessorKey: "specification", header: "Specification" },
    { accessorKey: "make", header: "Make" },
    { accessorKey: "purpose", header: "Purpose" },
    {
      accessorKey: "planned_1",
      header: "Planned Date",
      cell: ({ row }) => (row.original as any).planned_1 ? new Date((row.original as any).planned_1).toLocaleDateString("en-GB") : "-"
    },
    {
      accessorKey: "actual_1",
      header: "Actual Date",
      cell: ({ row }) => (row.original as any).actual_1 ? new Date((row.original as any).actual_1).toLocaleDateString("en-GB") : "-"
    },
    {
      accessorKey: "time_delay_1",
      header: "Delay",
      cell: ({ row }) => {
        const delay = (row.original as any).time_delay_1;
        if (!delay) return "-";
        if (typeof delay === 'object') {
          return `${delay.days || 0}d ${delay.hours || 0}h`;
        }
        return String(delay);
      }
    },
    {
      accessorKey: "requestStatus",
      header: "HOD Status",
      cell: ({ row }) => {
        const status = row.original.requestStatus?.toUpperCase();
        if (status === "APPROVED") {
          return <span className="font-medium text-green-600">APPROVED</span>;
        }
        if (status === "REJECTED") {
          return <span className="font-medium text-red-600">REJECTED</span>;
        }
        if (status === "PENDING") {
          return <span className="font-medium text-blue-600">PENDING</span>;
        }
        return (
          <span className="text-gray-500">{row.original.requestStatus}</span>
        );
      },
    },
    {
      accessorKey: "gmApproval",
      header: "GM Status",
      cell: ({ row }) => {
        const hodStatus = row.original.requestStatus?.toUpperCase();
        const gmStatus = row.original.gmApproval?.toUpperCase();

        if (gmStatus === "APPROVED") {
          return <span className="font-medium text-green-600">APPROVED</span>;
        }
        if (gmStatus === "REJECTED") {
          return <span className="font-medium text-red-600">REJECTED</span>;
        }

        // If HOD rejected, GM is irrelevant
        if (hodStatus === "REJECTED") {
          return <span className="text-gray-400">—</span>;
        }

        // If HOD pending, GM is pending HOD
        if (hodStatus === "PENDING" || !hodStatus) {
          return <span className="text-gray-400 italic">Pending HOD</span>;
        }

        return <span className="font-medium text-blue-600">PENDING GM</span>;
      },
    },
  ];

  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <Heading
        heading="Indent List"
        subtext="Your Indent lines"
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Product Name
          </span>
          <ComboBox
            options={productOptions}
            value={productFilter}
            onChange={setProductFilter}
            placeholder="All products"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">UOM</span>
          <ComboBox
            options={uomOptions}
            value={uomFilter}
            onChange={setUomFilter}
            placeholder="All UOM"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Cost / Project Location
          </span>
          <ComboBox
            options={locationOptions}
            value={locationFilter}
            onChange={setLocationFilter}
            placeholder="All locations"
          />
        </div>
      </div>

      <DataTable
        data={filteredRows}
        columns={columns}
        dataLoading={loading}
        className="h-[74dvh]"
      >
        <Button onClick={() => navigate("/store/user-indent?formType=INDENT")}>
          + Add Indent
        </Button>
      </DataTable>
    </div>
  );
}
