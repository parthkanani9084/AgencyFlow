import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { AuthProvider } from '@/context/AuthContext';
import { AdsDataProvider } from '@/context/AdsDataContext';
import { TaskProvider } from '@/context/TaskContext';

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
        <AuthProvider>
          <AdsDataProvider>
            <TaskProvider>
              {children}
            </TaskProvider>
          </AdsDataProvider>
        </AuthProvider>

        {/* Third-party Analytics/Scripts */}
        <script 
          type="module" 
          async 
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fagencyflow7064back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" 
        />
        <script 
          type="module" 
          defer 
          src="https://static.rocket.new/rocket-shot.js?v=0.0.2" 
        />
      </body>
    </html>
  );
}