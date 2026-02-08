import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storeApi } from '../services';

interface StoreDashboardData {
  pendingIndents: any[];
  historyIndents: any[];
  poPending: any[];
  poHistory: any[];
  repairPending: any[];
  repairHistory: any[];
  repairReceived: any[];
  returnableDetails: any[];
  dashboardSummary: any | null;
  lastUpdated: Date | null;
}

interface StoreDashboardContextType extends StoreDashboardData {
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const StoreDashboardContext = createContext<StoreDashboardContextType | undefined>(undefined);

export const useStoreDashboard = () => {
  const context = useContext(StoreDashboardContext);
  if (!context) {
    throw new Error('useStoreDashboard must be used within a StoreDashboardProvider');
  }
  return context;
};

export const StoreDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoreDashboardData>({
    pendingIndents: [],
    historyIndents: [],
    poPending: [],
    poHistory: [],
    repairPending: [],
    repairHistory: [],
    repairReceived: [],
    returnableDetails: [],
    dashboardSummary: null,
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [
        pendingIndents,
        historyIndents,
        poPending,
        poHistory,
        repairPending,
        repairHistory,
        repairReceived,
        returnableDetails,
        dashboardSummary
      ] = await Promise.all([
        storeApi.getPendingIndents(),
        storeApi.getHistoryIndents(),
        storeApi.getPoPending(),
        storeApi.getPoHistory(),
        storeApi.getRepairGatePassPending(),
        storeApi.getRepairGatePassHistory(),
        storeApi.getRepairGatePassReceived(),
        storeApi.getReturnableDetails(),
        storeApi.getStoreIndentDashboard()
      ]);

      setData({
        pendingIndents: (pendingIndents as any).data || [],
        historyIndents: (historyIndents as any).data || [],
        poPending: (poPending as any).data || [],
        poHistory: (poHistory as any).data || [],
        repairPending: (repairPending as any).data || [],
        repairHistory: (repairHistory as any).data || [],
        repairReceived: (repairReceived as any).data || [],
        returnableDetails: (returnableDetails as any).data || [],
        dashboardSummary: (dashboardSummary as any).data || null,
        lastUpdated: new Date(),
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Set up polling every 60 seconds
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const value = useMemo(() => ({
    ...data,
    isLoading,
    error,
    refreshData
  }), [data, isLoading, error, refreshData]);

  return (
    <StoreDashboardContext.Provider value={value}>
      {children}
    </StoreDashboardContext.Provider>
  );
};
