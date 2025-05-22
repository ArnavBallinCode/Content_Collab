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
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
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

        // Fetch available projects (submitted status)
        const { data: availableData, error: availableError } = await supabase
          .from('projects')
          .select(`
            *,
            creator:profiles(email)
          `)
          .eq('status', 'submitted')
          .is('editor_id', null)
          .order('created_at', { ascending: false });

        if (availableError) throw availableError;
        setAvailableProjects(availableData || []);

        // Fetch active projects (in_progress or in_revision status)
        const { data: activeData, error: activeError } = await supabase
          .from('projects')
          .select(`
            *,
            creator:profiles(email)
          `)
          .eq('editor_id', user.id)
          .in('status', ['in_progress', 'in_revision'])
          .order('created_at', { ascending: false });

        if (activeError) throw activeError;
        setActiveProjects(activeData || []);
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

  const handleStartEditing = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'in_progress',
          editor_id: user?.id
        })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      const project = availableProjects.find(p => p.id === projectId);
      if (project) {
        setAvailableProjects(prev => prev.filter(p => p.id !== projectId));
        setActiveProjects(prev => [{
          ...project,
          status: 'in_progress',
          editor_id: user?.id
        }, ...prev]);
      }

      toast({
        title: "Project started",
        description: "You can now start editing this project.",
      });
    } catch (error) {
      console.error('Error starting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start project",
      });
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
              <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your editing projects</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Projects */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Projects</h2>
              {availableProjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">No projects available at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">From: {project.creator.email}</p>
                          <p className="mt-2 text-gray-600">{project.description}</p>
                        </div>
                        <Button
                          onClick={() => handleStartEditing(project.id)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Start Editing
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Projects */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
              {activeProjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">No active projects</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">From: {project.creator.email}</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}
