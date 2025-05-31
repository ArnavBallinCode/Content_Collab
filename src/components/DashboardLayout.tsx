"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Navbar from './Navbar';

type SidebarLink = {
  href: string;
  label: string;
  icon?: ReactNode;
};

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'creator' | 'editor';
  sidebarLinks: SidebarLink[];
}

export default function DashboardLayout({
  children,
  userRole,
  sidebarLinks,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  // Add settings link to all dashboards
  const allLinks = [
    ...sidebarLinks,
    {
      href: '/settings',
      label: 'Settings',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userRole={userRole} />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 pt-20">
          <nav className="px-4 space-y-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                  pathname === link.href
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 pt-20 pb-12 px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
