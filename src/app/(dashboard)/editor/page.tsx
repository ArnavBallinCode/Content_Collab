import DashboardLayout from '@/components/DashboardLayout';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Project } from '@/types';

// Sample projects data (would be fetched from Supabase in a real app)
const sampleProjects: Project[] = [
  {
    id: '4',
    creator_id: 'creator1',
    editor_id: 'editor1',
    title: 'New Product Launch',
    description: 'Introducing our new line of eco-friendly products',
    raw_footage_url: '/videos/raw4.mp4',
    reel_type: 'instagram',
    pricing_tier: 'premium',
    status: 'in_progress',
    created_at: '2025-05-17T10:00:00Z',
    updated_at: '2025-05-19T14:30:00Z',
  },
  {
    id: '5',
    creator_id: 'creator2',
    editor_id: 'editor1',
    title: 'Customer Testimonials',
    description: 'Compilation of customer success stories',
    raw_footage_url: '/videos/raw5.mp4',
    reel_type: 'youtube_shorts',
    pricing_tier: 'pro',
    status: 'in_revision',
    created_at: '2025-05-16T09:15:00Z',
    updated_at: '2025-05-21T11:45:00Z',
  },
  {
    id: '6',
    creator_id: 'creator3',
    editor_id: 'editor1',
    title: 'Behind the Scenes',
    description: 'Behind the scenes of our manufacturing process',
    raw_footage_url: '/videos/raw6.mp4',
    reel_type: 'tiktok',
    pricing_tier: 'basic',
    status: 'completed',
    created_at: '2025-05-10T16:20:00Z',
    updated_at: '2025-05-15T16:20:00Z',
  },
];

// Sidebar links for editor dashboard
const editorSidebarLinks = [
  {
    href: '/editor/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/editor/projects',
    label: 'Active Projects',
  },
  {
    href: '/editor/available',
    label: 'Available Projects',
  },
  {
    href: '/editor/completed',
    label: 'Completed Projects',
  },
  {
    href: '/editor/profile',
    label: 'Profile Settings',
  },
];

export default function EditorDashboard() {
  return (
    <DashboardLayout userRole="editor" sidebarLinks={editorSidebarLinks}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Editor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your editing projects and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 uppercase">Active Projects</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">3</h3>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 uppercase">Completed This Month</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">12</h3>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 uppercase">Average Rating</p>
              <div className="flex items-center justify-center mt-1">
                <span className="text-3xl font-bold text-gray-900 mr-1">4.8</span>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} userRole="editor" />
            ))}
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Find more projects</h3>
                <p className="mt-1 text-sm text-gray-500">Browse available projects that match your skills</p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/editor/available">Browse Projects</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <li className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      You've been assigned a new project: "New Product Launch"
                    </p>
                    <p className="text-sm text-gray-500">
                      1 day ago
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Your submission for "Customer Testimonials" was reviewed
                    </p>
                    <p className="text-sm text-gray-500">
                      2 days ago
                    </p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      New feedback received on "Customer Testimonials"
                    </p>
                    <p className="text-sm text-gray-500">
                      2 days ago
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
