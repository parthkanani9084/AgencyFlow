'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Agency, SubscriptionPlan, ModuleUsage, ActivityLog, RoleMetrics } from '@/modules/super-admin/types';
import { mockService } from '@/services/mockService';

interface SuperAdminState {
  agencies: Agency[];
  subscriptions: SubscriptionPlan[];
  moduleUsage: ModuleUsage[];
  roleWiseUsage: Record<string, { module: string; metrics: RoleMetrics }[]>;
  activityLogs: ActivityLog[];
  isLoading: boolean;
  moduleViewMode: 'role-wise' | 'averaged';
  setModuleViewMode: (mode: 'role-wise' | 'averaged') => void;
  refreshData: () => Promise<void>;
}

const SuperAdminContext = createContext<SuperAdminState | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [moduleUsage, setModuleUsage] = useState<ModuleUsage[]>([]);
  const [roleWiseUsage, setRoleWiseUsage] = useState<Record<string, { module: string; metrics: RoleMetrics }[]>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [moduleViewMode, setModuleViewMode] = useState<'role-wise' | 'averaged'>('role-wise');
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [agenciesData, subscriptionsData, usageData, roleData, logsData] = await Promise.all([
        mockService.agency.getAll(),
        mockService.subscription.getAll(),
        mockService.dashboard.getModuleUsage(),
        mockService.dashboard.getRoleWiseUsage(),
        mockService.dashboard.getActivityLogs(),
      ]);
      setAgencies(agenciesData);
      setSubscriptions(subscriptionsData);
      setModuleUsage(usageData);
      setRoleWiseUsage(roleData);
      setActivityLogs(logsData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <SuperAdminContext.Provider value={{ 
      agencies, 
      subscriptions, 
      moduleUsage, 
      roleWiseUsage,
      activityLogs, 
      isLoading, 
      moduleViewMode,
      setModuleViewMode,
      refreshData 
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdminStore() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdminStore must be used within a SuperAdminProvider');
  }
  return context;
}
