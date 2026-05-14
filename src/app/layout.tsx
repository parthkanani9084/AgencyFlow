import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { AdsDataProvider } from '@/context/AdsDataContext';
import { SuperAdminProvider } from '@/store/superAdminStore';
import QueryProvider from '@/components/QueryProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'AgencyFlow — Campaign Workflow Automation',
  description: 'AgencyFlow automates campaign workflows for marketing agencies.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <SuperAdminProvider>
            <AuthProvider>
              <AdsDataProvider>
                {children}
              </AdsDataProvider>
            </AuthProvider>
          </SuperAdminProvider>
        </QueryProvider>

        <Toaster position="top-right" expand={false} richColors />
      </body>
    </html>
  );
}