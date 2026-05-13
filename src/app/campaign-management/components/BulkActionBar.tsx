'use client';

import React from 'react';
import { X } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';

interface BulkActionBarProps {
  selectedCount: number;
  onAction: (action: 'delete' | 'pause') => void;
  onClearSelection: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onAction,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-40 animate-slide-up">
      <span className="text-[13px] font-bold">
        {selectedCount} {STATIC_STRINGS.CAMPAIGN_MGMT_SELECTED}
      </span>
      <div className="w-px h-4 bg-slate-700" />
      <button
        onClick={() => onAction('pause')}
        className="text-[12.5px] font-medium text-slate-300 hover:text-white transition-colors"
      >
        {STATIC_STRINGS.CAMPAIGN_MGMT_BULK_PAUSE}
      </button>
      <button
        onClick={() => onAction('delete')}
        className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all"
      >
        {STATIC_STRINGS.CAMPAIGN_MGMT_BULK_DELETE}
      </button>
      <button
        onClick={onClearSelection}
        className="p-1 text-slate-400 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default BulkActionBar;
