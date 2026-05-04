'use client';

import React, { useMemo, useState } from 'react';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { Building2, Users, TrendingUp, Activity, BarChart3, MousePointer2, Trash2, RefreshCw, Plus } from 'lucide-react';
import { ROLES } from '@/constants/roles';
import { UserRole } from '@/types';

export default function DashboardView() {
  const { 
    agencies, 
    moduleUsage, 
    roleWiseUsage,
    activityLogs, 
    isLoading
  } = useSuperAdminStore();
  const [activeTab, setActiveTab] = useState<UserRole>(ROLES.OWNER);

  const metrics = useMemo(() => {
    if (isLoading) return null;

    const totalViews = moduleUsage.reduce((acc, mod) => {
      return acc + Object.values(mod.roleData).reduce((sum, role) => sum + role.views, 0);
    }, 0);

    const totalDataActions = activityLogs.length;

    return {
      totalAgencies: agencies.length,
      activeAgencies: agencies.filter(a => a.status === 'active').length,
      totalViews,
      totalDataActions,
    };
  }, [agencies, moduleUsage, activityLogs, isLoading]);

  const usageAnalysis = useMemo(() => {
    return moduleUsage.map(mod => {
      const roles = Object.values(mod.roleData);
      const count = roles.length || 1;
      
      return {
        module: mod.module,
        views: Math.round(roles.reduce((s, r) => s + r.views, 0) / count),
        clicks: Math.round(roles.reduce((s, r) => s + r.clicks, 0) / count),
        dataEntered: Math.round(roles.reduce((s, r) => s + r.dataEntered, 0) / count),
        updated: Math.round(roles.reduce((s, r) => s + r.updated, 0) / count),
        deleted: Math.round(roles.reduce((s, r) => s + r.deleted, 0) / count),
        currentRecords: Math.round(roles.reduce((s, r) => s + r.currentRecords, 0) / count),
        uniqueBase: Math.round(roles.reduce((s, r) => s + r.uniqueBase, 0) / count),
      };
    });
  }, [moduleUsage]);

  const extremeUsage = useMemo(() => {
    if (usageAnalysis.length === 0) return null;
    const sorted = [...usageAnalysis].sort((a, b) => b.views - a.views);
    return {
      highest: sorted[0],
      lowest: sorted[sorted.length - 1]
    };
  }, [usageAnalysis]);

  const topStats = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: 'Total Agency', value: metrics.totalAgencies, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Active Agencies', value: metrics.activeAgencies, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Total Module Views', value: metrics.totalViews.toLocaleString(), icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Total Data Actions', value: metrics.totalDataActions.toLocaleString(), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }, [metrics]);

  const roleTabs = useMemo(() => 
    Object.entries(ROLES)
      .filter(([key]) => key !== 'SUPER_ADMIN' && key !== 'CLIENT')
      .map(([key, value]) => ({ key, value })),
  []);

  if (isLoading || !metrics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-medium">Loading system metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time governance and module performance analytics.</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[13px] text-slate-500 font-semibold mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Combined Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Uses Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Feature uses highlights
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-wider">Daily Extreme</span>
          </div>
          
          <div className="space-y-6 flex-1 flex flex-col">
            {extremeUsage && (
              <>
                {/* Highest Usage Card */}
                <div className="p-6 rounded-2xl bg-[#f0fdf4]/60 border border-emerald-100 relative group transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-emerald-50 shadow-sm">
                      HIGHEST USAGE
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shadow-sm">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">{extremeUsage.highest.module}</h3>
                  <div className="flex items-center gap-14">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Views</p>
                      <p className="text-[20px] font-bold text-emerald-600 leading-none">{extremeUsage.highest.views.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                      <p className="text-[20px] font-bold text-slate-800 leading-none">98.4%</p>
                    </div>
                  </div>
                </div>

                {/* Lowest Usage Card */}
                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 relative group transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-sm">
                      LOWEST USAGE
                    </span>
                    <div className="p-2 rounded-xl bg-white text-slate-400 border border-slate-100 shadow-sm">
                      <MousePointer2 size={18} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">{extremeUsage.lowest.module}</h3>
                  <div className="flex items-center gap-14">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Views</p>
                      <p className="text-[20px] font-bold text-slate-600 leading-none">{extremeUsage.lowest.views.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Req.</p>
                      <p className="text-[20px] font-bold text-amber-600 leading-none">Pending</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* System Audit Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 shadow-sm">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 leading-tight">Recent Activity</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Platform governance feed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Live Feed</span>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
          >
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 5px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #e2e8f0;
                border-radius: 20px;
              }
            `}</style>

            <div className="space-y-0.5">
              {activityLogs.map((log, idx) => {
                const isDelete = log.action.includes('DELETE');
                const isUpdate = log.action.includes('UPDATE');
                
                return (
                  <div key={log.id} className="group relative flex gap-4 p-3 rounded-xl transition-all hover:bg-slate-50 cursor-default">
                    {/* Timeline Line */}
                    {idx !== activityLogs.length - 1 && (
                      <div className="absolute left-[27px] top-12 w-[1px] h-[calc(100%-24px)] bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                    )}
                    
                    {/* Action Icon */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isDelete ? 'bg-red-50 text-red-500' :
                      isUpdate ? 'bg-blue-50 text-blue-500' :
                      'bg-emerald-50 text-emerald-500'
                    }`}>
                      {isDelete ? <Trash2 size={14} /> :
                       isUpdate ? <RefreshCw size={14} /> :
                       <Plus size={14} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${
                          isDelete ? 'text-red-500' :
                          isUpdate ? 'text-blue-500' :
                          'text-emerald-500'
                        }`}>
                          {log.action}
                        </span>
                        <time className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-violet-700 transition-colors">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isDelete ? 'bg-red-400' :
                          isUpdate ? 'bg-blue-400' :
                          'bg-emerald-400'
                        }`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                          {log.module}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Module Usage Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Module Usage Breakdown</h2>
          </div>
          
          {/* Role Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {roleTabs.map(({ key, value }) => (
              <button
                key={key}
                onClick={() => setActiveTab(value)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === value 
                    ? 'bg-white text-violet-600 shadow-sm border border-violet-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {key.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-violet-400 rounded-full" />
                <div>
                  <h2 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-wider">
                    {activeTab} Panel Analytics
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {(roleWiseUsage[activeTab] || []).length} Active Modules
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Module</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Views/Clicks</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Data Entered</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Updated</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Deleted</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Current Records</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">Unique Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(!roleWiseUsage[activeTab] || roleWiseUsage[activeTab].length === 0) ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                        No active modules found for this role.
                      </td>
                    </tr>
                  ) : (
                    roleWiseUsage[activeTab].map((item) => (
                      <tr key={item.module} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-slate-800 whitespace-nowrap">{item.module}</p>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-slate-600 text-[13px]">{item.metrics.views}</td>
                        <td className="px-4 py-4 text-center font-semibold text-emerald-600 text-[13px]">{item.metrics.dataEntered}</td>
                        <td className="px-4 py-4 text-center font-semibold text-blue-600 text-[13px]">{item.metrics.updated}</td>
                        <td className="px-4 py-4 text-center font-semibold text-red-600 text-[13px]">{item.metrics.deleted}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[11px] font-bold">
                            {item.metrics.currentRecords}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-slate-600 text-[13px]">{item.metrics.uniqueBase}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
