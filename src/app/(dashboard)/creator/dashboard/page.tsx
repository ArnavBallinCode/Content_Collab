'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, ProjectStatus } from '@/types';
import ProjectCard from '@/components/ProjectCard';

type ProjectWithEditor = Project & {
  editor?: {
    email: string;
  } | null;
};

export default function CreatorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [projects, setProjects] = useState<ProjectWithEditor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });

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
            editor:editor_id(email)
          `)
          .eq('creator_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        const projectData = data || [];
        setProjects(projectData);
        
        // Calculate stats
        setStats({
          total: projectData.length,
          inProgress: projectData.filter(p => 
            ['submitted', 'in_progress', 'in_revision'].includes(p.status)
          ).length,
          completed: projectData.filter(p => p.status === 'completed').length
        });
        
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
          
          {/* Project Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} userRole="creator" />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter(p => ['submitted', 'in_progress', 'in_revision'].includes(p.status))
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} userRole="creator" />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter(p => p.status === 'completed')
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} userRole="creator" />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="draft" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter(p => p.status === 'draft')
                    .map((project) => (
                      <ProjectCard key={project.id} project={project} userRole="creator" />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
