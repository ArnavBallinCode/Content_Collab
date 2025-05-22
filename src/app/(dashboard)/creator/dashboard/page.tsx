'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';

type Project = {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'in_revision' | 'completed' | 'cancelled';
  reel_type: 'instagram' | 'youtube_shorts' | 'tiktok';
  pricing_tier: 'basic' | 'pro' | 'premium' | 'custom';
  custom_price: number | null;
  created_at: string;
  editor: {
    email: string;
  } | null;
};

export default function CreatorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user) {
          router.push('/sign-in');
          return;
        }

        if (userRole !== 'creator') {
          router.push('/dashboard');
          return;
        }

        // Fetch creator's projects
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id(*),
            editor:editor_id(*)
          `)
          .eq('creator_id', user.id);

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load projects",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, userRole, router, toast]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_revision':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your content projects</p>
            </div>
            <Button
              onClick={() => router.push('/projects/new')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h2>
              <p className="text-gray-600 mb-6">Create your first project to get started</p>
              <Button
                onClick={() => router.push('/projects/new')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Created on {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-gray-600">{project.description}</p>
                    </div>
                    <Button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Project
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {project.reel_type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {project.pricing_tier}
                      {project.custom_price && ` ($${project.custom_price})`}
                    </span>
                    {project.editor && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Editor: {project.editor.email}
                      </span>
                    )}
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
