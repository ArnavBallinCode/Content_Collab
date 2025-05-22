import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'creator' | 'editor';
  sidebarLinks: SidebarLink[];
}

export default function DashboardLayout({
  children,
  userRole,
  sidebarLinks
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userRole={userRole} />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 pt-16">
          <div className="overflow-y-auto py-4 px-3 h-full">
            <ul className="space-y-2">
              {sidebarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    {link.icon && <span className="mr-3">{link.icon}</span>}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        {/* Main content */}
        <div className="ml-64 w-full">
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
