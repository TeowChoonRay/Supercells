'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, MessageSquare, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center p-2 ${
              isActive('/dashboard') ? 'text-yellow-500' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            href="/leads" 
            className={`flex flex-col items-center p-2 ${
              isActive('/leads') ? 'text-yellow-500' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          
          <Link 
            href="/leads-enquiry" 
            className={`flex flex-col items-center p-2 ${
              isActive('/leads-enquiry') ? 'text-yellow-500' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </Link>
          
          <Link 
            href="/settings" 
            className={`flex flex-col items-center p-2 ${
              isActive('/settings') ? 'text-yellow-500' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}