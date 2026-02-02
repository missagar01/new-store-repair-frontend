// Store System API Services
import { apiRequest, API_BASE_URL } from "../config/api";

const PO_BASE_URL = `${API_BASE_URL}/po`;

function buildAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchPoJson<T = unknown>(path: string): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, "");
  const response = await fetch(`${PO_BASE_URL}/${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Failed to fetch PO ${path}`);
  }

  return (await response.json()) as T;
}

async function downloadPoBlob(path: string): Promise<Blob> {
  const normalizedPath = path.replace(/^\/+/, "");
  const response = await fetch(`${PO_BASE_URL}/${normalizedPath}`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to download PO ${path}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().includes("application/json")) {
    const text = await response.text();
    throw new Error(text || `Failed to download PO ${path}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Received an empty file");
  }

  return blob;
}

// Store Indent APIs
export const storeApi = {
  // Store Indent
  createStoreIndent: (data: any) =>
    apiRequest("/store-indent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPendingIndents: () => apiRequest("/store-indent/pending"),
  getHistoryIndents: () => apiRequest("/store-indent/history"),
  approveStoreIndent: (data: any) =>
    apiRequest("/store-indent/approve", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getStoreIndentDashboard: () => apiRequest("/store-indent/dashboard"),
  downloadPendingIndents: () =>
    fetch(`${API_BASE_URL}/store-indent/pending/download`, {
      headers: buildAuthHeaders(),
    }).then((res) => res.blob()),
  // Repair Gate Pass APIs
  getRepairGatePassPending: () => apiRequest("/repair-gate-pass/pending"),
  getRepairGatePassReceived: () => apiRequest("/repair-gate-pass/received"),
  getRepairGatePassHistory: () => apiRequest("/repair-gate-pass/history"),
  getRepairGatePassCounts: () => apiRequest("/repair-gate-pass/counts"),
  downloadRepairGatePassPending: () =>
    fetch(`${API_BASE_URL}/repair-gate-pass/pending/download`, {
      headers: buildAuthHeaders(),
    }).then((res) => res.blob()),

  downloadHistoryIndents: () =>
    fetch(`${API_BASE_URL}/store-indent/history/download`, {
      headers: buildAuthHeaders(),
    }).then((res) => res.blob()),

  // Indent APIs
  getIndents: () => apiRequest("/indent"),
  getAllIndents: () => apiRequest("/indent/all"),
  getIndent: (requestNumber: string) => apiRequest(`/indent/${requestNumber}`),
  submitIndent: (data: any) =>
    apiRequest("/indent", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateIndentStatus: (requestNumber: string, data: any) =>
    apiRequest(`/indent/${requestNumber}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateIndentNumber: (requestNumber: string, indentNumber: string) =>
    apiRequest(`/indent/${requestNumber}/indent-number`, {
      method: "PATCH",
      body: JSON.stringify({
        indent_number: indentNumber,
      }),
    }),

  filterIndents: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/indent/filter?${queryString}`);
  },

  getIndentsByStatus: (statusType: string) =>
    apiRequest(`/indent/status/${statusType}`),

  // Purchase Order APIs
  getPoPending: () => fetchPoJson("pending"),
  getPoHistory: () => fetchPoJson("history"),
  downloadPoPending: () => downloadPoBlob("pending/download"),
  downloadPoHistory: () => downloadPoBlob("history/download"),

  // Item APIs
  getItems: () => apiRequest("/items"),

  // Stock APIs
  getStock: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    const query = params.toString();
    return apiRequest(`/stock${query ? `?${query}` : ""}`);
  },

  // UOM APIs
  getUom: () => apiRequest("/uom"),

  // Cost Location APIs
  getCostLocations: (divCode?: string) => {
    const query = divCode ? `?divCode=${divCode}` : "";
    return apiRequest(`/cost-location${query}`);
  },
  getCostLocationsRP: () => apiRequest("/cost-location/rp"),
  getCostLocationsPM: () => apiRequest("/cost-location/pm"),
  getCostLocationsCO: () => apiRequest("/cost-location/co"),

  // Vendor Rate Update APIs
  getVendorRatePending: () => apiRequest("/vendor-rate-update/pending"),
  getVendorRateHistory: () => apiRequest("/vendor-rate-update/history"),
  updateVendorRate: (data: any) =>
    apiRequest("/vendor-rate-update", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Three Party Approval APIs
  getThreePartyPending: () => apiRequest("/three-party-approval/pending"),
  getThreePartyHistory: () => apiRequest("/three-party-approval/history"),
  approveThreeParty: (data: any) =>
    apiRequest("/three-party-approval/approve", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getGrnAndPoSummary: (params: { fromDate?: string; toDate?: string }) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/grn-and-po/summary${queryString ? `?${queryString}` : ""}`);
  },

  getStoreIssues: () => apiRequest("/store-issue"),

  // User APIs
  getUser: (employeeId: string) => apiRequest(`/user/${employeeId}`),
  getMe: () => apiRequest("/user/me"),
};
