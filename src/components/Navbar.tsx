'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const { user, userRole, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Collaborative Coreel
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-6">
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/projects" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Projects
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                    <span className="text-sm font-medium text-gray-900">{user.email}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {userRole}
                    </span>
                  </div>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="text-sm hover:bg-gray-50"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
