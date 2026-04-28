import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-auto">
        {children}
      </main>
    </div>
  );
}