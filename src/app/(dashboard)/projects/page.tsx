'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import { Project } from '@/types';

export default function Projects() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    search: '',
    type: 'all',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      try {
        let query = supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id(*),
            editor:editor_id(*)
          `);

        // Apply role-based filtering
        if (userRole === 'creator') {
          query = query.eq('creator_id', user.id);
        } else if (userRole === 'editor') {
          query = query.eq('editor_id', user.id);
        }

        // Apply status filter
        if (filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }

        // Apply type filter
        if (filter.type !== 'all') {
          query = query.eq('reel_type', filter.type);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Apply search filter client-side
        let filteredData = data || [];
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredData = filteredData.filter(project =>
            project.title.toLowerCase().includes(searchLower) ||
            project.description.toLowerCase().includes(searchLower)
          );
        }

        setProjects(filteredData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, userRole, filter, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Projects</h1>
            {userRole === 'creator' && (
              <Button
                onClick={() => router.push('/projects/new')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create New Project
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <Input
              placeholder="Search projects..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-xs"
            />
            
            <Select
              value={filter.status}
              onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="in_revision">In Revision</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.type}
              onValueChange={(value) => setFilter(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-gray-500">
                {filter.search || filter.status !== 'all' || filter.type !== 'all'
                  ? 'Try adjusting your filters'
                  : userRole === 'creator'
                  ? 'Create your first project to get started'
                  : 'No projects available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="mt-1 text-gray-500">
                        {userRole === 'creator'
                          ? `Editor: ${project.editor?.email || 'Unassigned'}`
                          : `Creator: ${project.creator?.email || 'Unknown'}`}
                      </p>
                      <p className="mt-2 text-gray-600">{project.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {project.reel_type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 