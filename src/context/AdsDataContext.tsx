'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AdsMetrics {
  totalSpend: number;
  totalLeads: number;
  totalClicks: number;
  avgRoas: number;
  totalSales: number;
  totalCollection: number;
  updatedAt: string;
}
interface AdsDataContextType {
  adsMetrics: AdsMetrics;
  updateAdsMetrics: (metrics: AdsMetrics) => void;
}

const AdsDataContext = createContext<AdsDataContextType | undefined>(undefined);

export const AdsDataProvider = ({ children }: { children: ReactNode }) => {
  const [adsMetrics, setAdsMetrics] = useState<AdsMetrics>({
    totalSpend: 0,
    totalLeads: 0,
    totalClicks: 0,
    avgRoas: 0,
    totalSales: 0,
    totalCollection: 0,
    updatedAt: '',
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('agencyflow_ads_metrics');
    if (saved) {
      try {
        setAdsMetrics(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved metrics', e);
      }
    }
  }, []);

  const updateAdsMetrics = (metrics: AdsMetrics) => {
    setAdsMetrics(metrics);
    localStorage.setItem('agencyflow_ads_metrics', JSON.stringify(metrics));
  };

  return (
    <AdsDataContext.Provider value={{ adsMetrics, updateAdsMetrics }}>
      {children}
    </AdsDataContext.Provider>
  );
};

export const useAdsData = () => {
  const context = useContext(AdsDataContext);
  if (context === undefined) {
    throw new Error('useAdsData must be used within an AdsDataProvider');
  }
  return context;
};

