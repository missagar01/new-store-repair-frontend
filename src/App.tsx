import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import AppLayout from "./layout/AppLayout";
import StoreDashboard from "./pages/store/StoreDashboard";
import UserProfiles from "./pages/UserProfiles";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import PendingPOs from "./pages/store/PendingPOs";
import IndentAll from "./pages/store/IndentAll";
import Administration from "./pages/store/Administration";
import StoreOutApproval from "./pages/store/StoreOutApproval";
import ApproveIndent from "./pages/store/ApproveIndent";
import ApprowIndentData from "./pages/store/ApprowIndentData";
import CompletedItems from "./pages/store/CompletedItems";
import CreatePO from "./pages/store/CreatePO";
import Inventory from "./pages/store/Inventory";
import Loading from "./pages/store/Loading";
import PendingIndents from "./pages/store/PendingIndents";
import ReceiveItems from "./pages/store/ReceiveItems";
import UserIndent from "./pages/store/UserIndent";
import UserIndentList from "./pages/store/UserIndentList";
import UserIndentListIndent from "./pages/store/UserIndentListIndent";
import UserIndentListRequisition from "./pages/store/UserIndentListRequisition";
import VendorUpdate from "./pages/store/VendorUpdate";
import RepairGatePass from "./pages/store/RepairGatePass";
import RepairGatePassHistory from "./pages/store/RepairGatePassHistory";
import RepairFollowup from "./pages/store/RepairFollowup";
import Settings from "./pages/store/Settings";
import StoreGRN from "./pages/store/StoreGRN";
import StoreGRNAdmin from "./pages/store/StoreGRNAdminApproval";
import StoreGRNGM from "./pages/store/StoreGRNGMApproval";
import StoreGRNCloseBill from "./pages/store/StoreGRNCloseBill";
import GrnAndPo from "./pages/store/GrnAndPo";
import StoreIssue from "./pages/store/StoreIssue";

// Store page aliases for routing
const PoPending = PendingPOs;
const PoHistory = PendingPOs;

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/signin"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default landing → store dashboard */}
        <Route path="/" element={<Navigate to="/store/dashboard" replace />} />
        <Route path="/profile" element={<UserProfiles />} />
        {/* Store System Routes */}
        <Route path="/store/dashboard" element={<StoreDashboard />} />
        <Route path="/store/indent" element={<IndentAll />} />
        <Route path="/store/administration" element={<Administration />} />
        <Route
          path="/store/store-out-approval"
          element={<StoreOutApproval />}
        />
        <Route path="/store/pending-pos" element={<PendingPOs />} />
        <Route path="/store/create-po" element={<CreatePO />} />
        <Route path="/store/approve-indent" element={<ApproveIndent />} />
        <Route
          path="/store/approve-indent-data"
          element={<ApprowIndentData />}
        />
        <Route path="/store/completed-items" element={<CompletedItems />} />
        <Route path="/store/inventory" element={<Inventory />} />
        <Route path="/store/receive-items" element={<ReceiveItems />} />
        <Route path="/store/user-indent" element={<UserIndent />} />
        <Route path="/store/user-indent-list" element={<UserIndentList />} />
        <Route
          path="/store/user-indent-list-indent"
          element={<UserIndentListIndent />}
        />
        <Route
          path="/store/user-requisition"
          element={<UserIndentListRequisition />}
        />
        <Route path="/store/pending-indents" element={<PendingIndents />} />
        <Route path="/store/vendor-update" element={<VendorUpdate />} />
        <Route path="/store/repair-gate-pass" element={<RepairGatePass />} />
        <Route
          path="/store/repair-gate-pass/history"
          element={<RepairGatePassHistory />}
        />
        <Route path="/store/repair-followup" element={<RepairFollowup />} />
        <Route path="/store/settings" element={<Settings />} />
        <Route path="/store/store-grn" element={<StoreGRN />} />
        <Route path="/store/store-grn-admin" element={<StoreGRNAdmin />} />
        <Route path="/store/store-grn-gm" element={<StoreGRNGM />} />
        <Route path="/store/store-grn-close" element={<StoreGRNCloseBill />} />
        <Route path="/store/grn-po" element={<GrnAndPo />} />
        <Route path="/store/store-issue" element={<StoreIssue />} />

        <Route path="/store/loading" element={<Loading />} />
        <Route path="/indent/all" element={<IndentAll />} />
        <Route path="/po/pending" element={<PoPending />} />
        <Route path="/po/history" element={<PoHistory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
