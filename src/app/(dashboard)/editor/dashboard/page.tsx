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
  creator: {
    email: string;
  };
};

export default function EditorDashboard() {
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

        if (userRole !== 'editor') {
          router.push('/dashboard');
          return;
        }

        // Fetch all projects for editors
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id(*),
            editor:editor_id(*)
          `)
          .order('created_at', { ascending: false });

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
              <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
              <p className="mt-2 text-gray-600">Browse and manage all projects</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">From: {project.creator?.email || 'Unknown'}</p>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {project.reel_type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {project.pricing_tier}
                      {project.custom_price && ` ($${project.custom_price})`}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {project.status.replace('_', ' ')}
                    </span>
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
