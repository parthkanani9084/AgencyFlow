'use client';

import React from 'react';
import { 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight 
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  totalEntries: number;
  labels?: {
    show: string;
    of: string;
    entries: string;
  };
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  totalEntries,
  labels = {
    show: 'Show',
    of: 'of',
    entries: 'entries'
  }
}: PaginationProps) {
  return (
    <footer className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
      {/* Entries Info */}
      <div className="flex items-center gap-2 text-[12.5px] text-slate-500 font-medium">
        <span>{labels.show}</span>
        <select
          value={perPage}
          onChange={(e) => {
            onPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="px-2 py-1 border border-slate-200 rounded-lg bg-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 transition-all cursor-pointer"
        >
          {[8, 12, 20, 50].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>
          {labels.of} <span className="text-slate-900 font-bold">{totalEntries}</span> {labels.entries}
        </span>
      </div>

      {/* Navigation Controls */}
      <nav className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Previous Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        
        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => Math.abs(n - currentPage) <= 2)
            .map(n => (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12.5px] font-bold transition-all ${
                  currentPage === n 
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {n}
              </button>
            ))
          }
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Next Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Last Page"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronsRight size={14} />
        </button>
      </nav>
    </footer>
  );
}
