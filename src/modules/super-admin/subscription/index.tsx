'use client';
 
import React, { useMemo, useState, useCallback } from 'react';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { mockService } from '@/services/mockService';
import { toast } from 'sonner';
import { Zap, Crown, AlertTriangle, Clock, User, Save, Power } from 'lucide-react';
import { Agency } from '@/modules/super-admin/types';

interface ManagedAccountRowProps {
  agency: Agency;
}

function ManagedAccountRow({ agency }: ManagedAccountRowProps) {
  const { refreshData } = useSuperAdminStore();
  const [plan, setPlan] = useState(agency.subscription === 'Starter' ? 'Free Trial' : 'Premium');
  const [expiry, setExpiry] = useState(agency.expiryDate.split('T')[0]);
  
  const daysLeft = useMemo(() => 
    Math.max(0, Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
  [expiry]);

  const handlePlanChange = useCallback((newPlan: string) => {
    setPlan(newPlan);
    if (newPlan === 'Free Trial') {
      const fifteenDays = new Date();
      fifteenDays.setDate(fifteenDays.getDate() + 15);
      setExpiry(fifteenDays.toISOString().split('T')[0]);
    }
  }, []);

  const handleEndNow = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setExpiry(today);
    
    const promise = mockService.agency.update(agency.id, { expiryDate: today });

    toast.promise(promise, {
      loading: 'Terminating subscription...',
      success: () => {
        refreshData();
        return `Subscription for ${agency.name} ended.`;
      },
      error: 'Failed to end subscription'
    });
  }, [agency.id, agency.name, refreshData]);

  const hasChanges = useMemo(() => {
    const originalPlan = agency.subscription === 'Starter' ? 'Free Trial' : 'Premium';
    const originalExpiry = agency.expiryDate.split('T')[0];
    return plan !== originalPlan || expiry !== originalExpiry;
  }, [agency, plan, expiry]);

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    const promise = mockService.agency.update(agency.id, { 
      subscription: plan === 'Free Trial' ? 'Starter' : 'Professional',
      expiryDate: new Date(expiry).toISOString()
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => {
        refreshData();
        return `Account settings for ${agency.name} saved.`;
      },
      error: 'Failed to save changes'
    });
  }, [agency.id, agency.name, plan, expiry, hasChanges, refreshData]);

  const formattedStartDate = useMemo(() => {
    const d = new Date(agency.startDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }, [agency.startDate]);

  return (
    <tr className="hover:bg-slate-50/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
            <User size={16} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800">{agency.ownerName}</p>
            <p className="text-[11px] text-slate-400">{agency.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <select 
          value={plan}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="Free Trial">Free Trial</option>
          <option value="Premium">Premium</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <p className="text-[12px] font-medium text-slate-500">
          {formattedStartDate}
        </p>
      </td>
      <td className="px-6 py-4">
        <input 
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`text-[13px] font-bold ${daysLeft <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
          {daysLeft}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-1.5 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-violet-700 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Save size={12} />
            Save
          </button>
          <button 
            onClick={handleEndNow}
            className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Power size={12} />
            End Now
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function SubscriptionView() {
  const { agencies, isLoading } = useSuperAdminStore();

  const stats = useMemo(() => {
    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);

    const data = {
      premiumActive: 0,
      onTrial: 0,
      expiredSoon: 0,
      expired: 0,
      free: 0,
      expiringList: [] as Agency[]
    };

    agencies.forEach(agency => {
      const expiry = new Date(agency.expiryDate);
      const isExpired = expiry < now || agency.status === 'inactive';
      const isExpiringSoon = !isExpired && expiry >= now && expiry <= fiveDaysFromNow;
      const isOnTrial = !isExpired && !isExpiringSoon && agency.subscription === 'Starter';
      const isPremiumActive = !isExpired && !isExpiringSoon && !isOnTrial;

      if (isExpired) {
        data.expired++;
      } else if (isExpiringSoon) {
        data.expiredSoon++;
        data.expiringList.push(agency);
      } else if (isOnTrial) {
        data.onTrial++;
      } else if (isPremiumActive) {
        data.premiumActive++;
      }

      if (agency.subscription === 'Starter') {
        data.free++;
      }
    });

    // Sort expiring list by nearest expiry
    data.expiringList.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    return data;
  }, [agencies]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-medium">Processing subscription data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Monitor and manage agency billing cycles and plan distributions.</p>
        </div>
      </div>

      {/* Section 1: Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Premium Active', value: stats.premiumActive, icon: Crown, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'On Trial', value: stats.onTrial, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Expiring Soon', value: stats.expiredSoon, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[13px] text-slate-500 font-semibold mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section 2: Breakdown & Expiry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Card 1: Subscription Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
            <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Subscription Breakdown</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[180px] justify-center">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Premium Plan</p>
                <p className="text-[15px] font-bold text-slate-900">{stats.premiumActive}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Free Trial</p>
                <p className="text-[15px] font-bold text-slate-900">{stats.free}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Expiring Soon</p>
                <p className="text-[15px] font-bold text-amber-600">{stats.expiredSoon}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Expired</p>
                <p className="text-[15px] font-bold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Expiring Soon Mini-List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Expired within 5 days</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[180px]">
            <div className="space-y-3 overflow-y-auto pr-2 no-scrollbar">
              {stats.expiringList.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic py-4 text-center">No upcoming expirations.</p>
              ) : (
                stats.expiringList.slice(0, 3).map(agency => (
                  <div key={agency.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{agency.name}</p>
                        <span className="text-[9px] text-slate-400 font-medium">• {agency.ownerName}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">
                        {agency.subscription === 'Starter' ? 'Free Trial' : 'Premium'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-lg border border-amber-100 whitespace-nowrap">
                      {Math.max(0, Math.ceil((new Date(agency.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Manage Account */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
          <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Manage Account</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Started</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Days Left</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {agencies.map((agency) => (
                  <ManagedAccountRow key={agency.id} agency={agency} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
