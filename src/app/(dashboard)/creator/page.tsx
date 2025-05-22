import DashboardLayout from '@/components/DashboardLayout';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Project } from '@/types';

// Sample projects data (would be fetched from Supabase in a real app)
const sampleProjects: Project[] = [
  {
    id: '1',
    creator_id: 'user1',
    title: 'Summer Campaign Reel',
    description: 'A promotional reel for our summer campaign featuring new products',
    raw_footage_url: '/videos/raw1.mp4',
    reel_type: 'instagram',
    pricing_tier: 'pro',
    status: 'completed',
    created_at: '2025-05-15T10:00:00Z',
    updated_at: '2025-05-18T14:30:00Z',
  },
  {
    id: '2',
    creator_id: 'user1',
    title: 'Product Demo',
    description: 'Detailed demonstration of our flagship product features',
    raw_footage_url: '/videos/raw2.mp4',
    reel_type: 'youtube_shorts',
    pricing_tier: 'premium',
    status: 'in_progress',
    created_at: '2025-05-19T09:15:00Z',
    updated_at: '2025-05-20T11:45:00Z',
  },
  {
    id: '3',
    creator_id: 'user1',
    title: 'Brand Story',
    description: 'Our brand journey and mission',
    raw_footage_url: '/videos/raw3.mp4',
    editing_instructions: 'Focus on emotional story arc',
    reel_type: 'tiktok',
    pricing_tier: 'basic',
    status: 'draft',
    created_at: '2025-05-21T16:20:00Z',
    updated_at: '2025-05-21T16:20:00Z',
  },
];

// Sidebar links for creator dashboard
const creatorSidebarLinks = [
  {
    href: '/creator/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/creator/projects',
    label: 'My Projects',
  },
  {
    href: '/creator/new-project',
    label: 'Create New Project',
  },
  {
    href: '/creator/profile',
    label: 'Profile Settings',
  },
];

export default function CreatorDashboard() {
  return (
    <DashboardLayout userRole="creator" sidebarLinks={creatorSidebarLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage your projects and collaborate with editors
            </p>
          </div>
          <Button asChild>
            <Link href="/creator/new-project">Create New Project</Link>
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} userRole="creator" />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <li className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      New version received for "Summer Campaign Reel"
                    </p>
                    <p className="text-sm text-gray-500">
                      2 hours ago
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      New comment on "Product Demo"
                    </p>
                    <p className="text-sm text-gray-500">
                      5 hours ago
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Project status updated to "In Progress" for "Product Demo"
                    </p>
                    <p className="text-sm text-gray-500">
                      1 day ago
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
