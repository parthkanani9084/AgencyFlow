'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  LogOut, 
  Building2,
  X,
  ChevronDown,
  Edit,

} from 'lucide-react';
import { superAdminAgent } from '@/agents/superAdminAgent';
import { TeamMember } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import AddEditOwnerModal from './AddEditOwnerModal';

export default function SuperAdminDashboardView() {
  const { logout, user } = useAuth();
  const [owners, setOwners] = useState<TeamMember[]>([]);
  const [isAddingOwner, setIsAddingOwner] = useState(false);
  const [editingOwner, setEditingOwner] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const result = await superAdminAgent.processAction('get_owners', {});
      if (result.success) {
        setOwners(result.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteOwner = async (id: string) => {
    if (!confirm('Are you sure you want to remove this owner?')) return;
    
    const result = await superAdminAgent.processAction('delete_owner', { id });
    if (result.success) {
      toast.success('Owner removed');
      fetchOwners();
    } else {

    }
  };

  const handleEditOwner = (owner: TeamMember) => {
    setEditingOwner(owner);
  };

  const filteredOwners = owners.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.agencyName && o.agencyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck size={20} className='text-white'/>
            </div>
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
            <h1 className="text-[15px] font-bold text-slate-900 hidden sm:block">Super Admin Dashboard</h1>
          </div>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
          >
            <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-[12px] font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-[13px] font-semibold text-slate-700 hidden sm:block">{user?.name}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-[14px] font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3.5 py-1 text-[13px] font-bold text-red-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-white-100 flex items-center justify-center group-hover/item:bg-red-100/50 transition-colors">
                    <LogOut size={16} />
                  </div>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-full mx-auto w-full space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Agencies</p>
              <p className="text-2xl font-bold text-slate-900">{owners.length}</p>
            </div>
          </div>
{/* 
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Owners</p>
              <p className="text-2xl font-bold text-slate-900">
                {owners.filter(o => o.status === 'active').length}
              </p>
            </div>
          </div> */}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
   <div>
              <h2 className="text-[15px] font-bold text-slate-900">All Agency Owners</h2>
              
              <p className="text-[13px] text-slate-600 mt-1">Manage all agency owner accounts and their access.</p>
   </div>
            
            <div className="flex items-center gap-3">
         
              <button
                onClick={() => setIsAddingOwner(true)}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap"
              >
                <Plus size={16} />
                Create Owner
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agency</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>

                  <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-6 h-16 bg-white" />
                    </tr>
                  ))
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-[13px]">
                      No owners found.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[11px]">
                            {owner.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900">{owner.name}</p>
                      
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <p className="text-[13px] text-slate-600">{owner.email}</p>
                        </div>
                      </td>

            
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Building2 size={14} className="text-slate-400" />
                          <span className="text-[13px] font-medium">{owner.agencyName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-slate-500">
                        {new Date(owner.joinedAt).toLocaleDateString('en-GB')}
                      </td>                 
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEditOwner(owner)}
                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteOwner(owner.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Owner Modal */}
      {isAddingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-900">Create Owner Account</h3>
              <button onClick={() => setIsAddingOwner(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <AddEditOwnerModal 
              onClose={() => setIsAddingOwner(false)} 
              onSuccess={() => {
                setIsAddingOwner(false);
                fetchOwners();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-slate-900">Edit Owner Account</h3>
              <button onClick={() => setEditingOwner(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <AddEditOwnerModal 
              owner={editingOwner}
              onClose={() => setEditingOwner(null)} 
              onSuccess={() => {
                setEditingOwner(null);
                fetchOwners();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

