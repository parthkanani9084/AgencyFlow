'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { FileUp, Search, Image, Film, FileText, Archive, Download, Trash2, Upload, X, Filter } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import type { ManagedFile, FileType, FileStage } from '@/lib/types';
import Icon from '@/components/ui/AppIcon';
import { useRoleGuard } from '@/hooks/useRoleGuard';


// ─── Mock data ────────────────────────────────────────────────────────────────
const initialFiles: ManagedFile[] = [
  { id: 'f1',  name: 'novabrew_product_shoot_raw.zip',   type: 'archive',  stage: 'raw',    size: '2.4 GB', campaign: 'NovaBrew Spring Launch',   client: 'Jordan Lee',    uploadedBy: 'Marco Reyes',  uploadedAt: '2026-04-14' },
  { id: 'f2',  name: 'novabrew_promo_final.mp4',         type: 'video',    stage: 'final',  size: '380 MB', campaign: 'NovaBrew Spring Launch',   client: 'Jordan Lee',    uploadedBy: 'Jin Park',     uploadedAt: '2026-04-16' },
  { id: 'f3',  name: 'pulsewear_reel_raw_footage.zip',   type: 'archive',  stage: 'raw',    size: '5.1 GB', campaign: 'PulseWear Q2 Reel',        client: 'Samantha Cruz', uploadedBy: 'Marco Reyes',  uploadedAt: '2026-04-13' },
  { id: 'f4',  name: 'pulsewear_reel_edited_v2.mp4',     type: 'video',    stage: 'edited', size: '620 MB', campaign: 'PulseWear Q2 Reel',        client: 'Samantha Cruz', uploadedBy: 'Jin Park',     uploadedAt: '2026-04-17' },
  { id: 'f5',  name: 'greenroot_event_photos.zip',       type: 'archive',  stage: 'raw',    size: '1.8 GB', campaign: 'GreenRoot Awareness',      client: 'Ethan Patel',   uploadedBy: 'Marco Reyes',  uploadedAt: '2026-04-12' },
  { id: 'f6',  name: 'greenroot_hero_banner.jpg',        type: 'image',    stage: 'asset',  size: '4.2 MB', campaign: 'GreenRoot Awareness',      client: 'Ethan Patel',   uploadedBy: 'Jin Park',     uploadedAt: '2026-04-15' },
  { id: 'f7',  name: 'luxehome_interior_raw.zip',        type: 'archive',  stage: 'raw',    size: '3.3 GB', campaign: 'LuxeHome Interior Series', client: 'Mia Tanaka',    uploadedBy: 'Marco Reyes',  uploadedAt: '2026-04-16' },
  { id: 'f8',  name: 'luxehome_showcase_reel.mp4',       type: 'video',    stage: 'edited', size: '510 MB', campaign: 'LuxeHome Interior Series', client: 'Mia Tanaka',    uploadedBy: 'Jin Park',     uploadedAt: '2026-04-17' },
  { id: 'f9',  name: 'novabrew_brand_guidelines.pdf',    type: 'document', stage: 'asset',  size: '8.6 MB', campaign: 'NovaBrew Spring Launch',   client: 'Jordan Lee',    uploadedBy: 'Alex Owens',   uploadedAt: '2026-01-10' },
  { id: 'f10', name: 'pulsewear_ad_creatives_v3.zip',    type: 'archive',  stage: 'final',  size: '220 MB', campaign: 'PulseWear Q2 Reel',        client: 'Samantha Cruz', uploadedBy: 'Sofia Nguyen', uploadedAt: '2026-04-17' },
];

const typeIcon: Record<FileType, React.ElementType> = {
  image:    Image,
  video:    Film,
  document: FileText,
  archive:  Archive,
};

const typeColor: Record<FileType, string> = {
  image:    'text-blue-600 bg-blue-50',
  video:    'text-purple-600 bg-purple-50',
  document: 'text-amber-600 bg-amber-50',
  archive:  'text-slate-600 bg-slate-100',
};

const stageBadge: Record<FileStage, { label: string; color: string }> = {
  raw:    { label: 'Raw',    color: 'bg-slate-100 text-slate-600' },
  edited: { label: 'Edited', color: 'bg-amber-100 text-amber-700' },
  final:  { label: 'Final',  color: 'bg-emerald-100 text-emerald-700' },
  asset:  { label: 'Asset',  color: 'bg-blue-100 text-blue-700' },
};

const ALL_TYPES: FileType[] = ['image', 'video', 'document', 'archive'];
const ALL_STAGES: FileStage[] = ['raw', 'edited', 'final', 'asset'];

export default function FileManagerPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager']);
  const [files, setFiles]       = useState<ManagedFile[]>(initialFiles);
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter]   = useState<FileType | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<FileStage | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.campaign.toLowerCase().includes(search.toLowerCase()) ||
      f.client.toLowerCase().includes(search.toLowerCase());
    const matchType  = typeFilter  === 'all' || f.type  === typeFilter;
    const matchStage = stageFilter === 'all' || f.stage === stageFilter;
    return matchSearch && matchType && matchStage;
  });

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
    toast.success('File removed');
  }

  function handleUpload() {
    // BACKEND INTEGRATION: POST /api/files/upload — multipart form data
    toast.info('File upload coming soon — storage integration required');
  }

  const totalSize = files.length;
  const byType = ALL_TYPES.map((t) => ({ type: t, count: files.filter((f) => f.type === t).length }));

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileUp size={20} className="text-violet-600" />
              File Manager
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {totalSize} files across all campaigns
            </p>
          </div>
          <button
            onClick={handleUpload}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Upload size={15} />
            Upload File
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {byType.map(({ type, count }) => {
            const Icon = typeIcon[type];
            return (
              <div key={type} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[type]}`}>
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 tabular-nums">{count}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{type}s</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files, campaigns, clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FileType | 'all')}
              className="text-[13px] border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
            >
              <option value="all">All Types</option>
              {ALL_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as FileStage | 'all')}
              className="text-[13px] border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white"
            >
              <option value="all">All Stages</option>
              {ALL_STAGES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* File table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileUp size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-[14px] font-medium">No files found</p>
              <p className="text-[12px] mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold">File</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden md:table-cell">Campaign</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden lg:table-cell">Uploaded By</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden sm:table-cell">Size</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold">Stage</th>
                    <th className="px-4 py-3 text-slate-500 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((file) => {
                    const Icon = typeIcon[file.type];
                    const stage = stageBadge[file.stage];
                    return (
                      <tr key={file.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[file.type]}`}>
                              <Icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate max-w-[200px]">{file.name}</p>
                              <p className="text-[11px] text-slate-400 md:hidden">{file.campaign}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-slate-700 truncate max-w-[180px]">{file.campaign}</p>
                          <p className="text-[11px] text-slate-400">{file.client}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{file.uploadedBy}</td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell tabular-nums">{file.size}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${stage.color}`}>
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toast.info('Download coming soon — storage integration required')}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(file.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-[15px] font-bold text-slate-900">Delete File?</h3>
                <button onClick={() => setDeleteId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-[13.5px] text-slate-600 mb-5">
                This file will be permanently removed. This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
