import React from 'react';
import { Search, X } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';

interface ClientSearchProps {
  value: string;
  onChange: (val: string) => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ value, onChange }) => {
  return (
    <section className="relative mb-5 max-w-sm">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={STATIC_STRINGS.CLIENT_MGMT_SEARCH_PLACEHOLDER}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
      />
      {value && (
        <button 
          onClick={() => onChange('')} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      )}
    </section>
  );
};

export default React.memo(ClientSearch);
