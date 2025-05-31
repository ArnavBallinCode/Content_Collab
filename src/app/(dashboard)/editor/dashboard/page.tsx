'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, ProjectStatus } from '@/types';
import ProjectCard from '@/components/ProjectCard';

type ProjectWithCreator = Project & {
  creator: {
    email: string;
  };
};

export default function EditorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [assignedProjects, setAssignedProjects] = useState<ProjectWithCreator[]>([]);
  const [availableProjects, setAvailableProjects] = useState<ProjectWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
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

        if (userRole !== 'editor') {
          router.push('/dashboard');
          return;
        }

        // Fetch projects assigned to this editor
        const { data: assignedData, error: assignedError } = await supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id(email)
          `)
          .eq('editor_id', user.id)
          .order('updated_at', { ascending: false });

        if (assignedError) throw assignedError;
        
        // Fetch available projects that are submitted but not assigned
        const { data: availableData, error: availableError } = await supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id(email)
          `)
          .eq('status', 'submitted')
          .is('editor_id', null)
          .order('created_at', { ascending: false });

        if (availableError) throw availableError;
        
        setAssignedProjects(assignedData || []);
        setAvailableProjects(availableData || []);
        
        // Calculate stats
        const completedCount = (assignedData || []).filter(p => p.status === 'completed').length;
        const inProgressCount = (assignedData || []).filter(p => 
          ['in_progress', 'in_revision'].includes(p.status)
        ).length;
        
        setStats({
          assigned: (assignedData || []).length,
          inProgress: inProgressCount,
          completed: completedCount
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

  const handleTakeProject = async (projectId: string) => {
    try {
      if (!user) return;
      
      // Update project to assign it to this editor and change status to in_progress
      const { error } = await supabase
        .from('projects')
        .update({ 
          editor_id: user.id,
          status: 'in_progress'
        })
        .eq('id', projectId)
        .eq('status', 'submitted')
        .is('editor_id', null);
      
      if (error) throw error;
      
      // Refresh data
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          creator:creator_id(email)
        `)
        .eq('id', projectId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update state
      setAvailableProjects(prev => prev.filter(p => p.id !== projectId));
      setAssignedProjects(prev => [data, ...prev]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        assigned: prev.assigned + 1,
        inProgress: prev.inProgress + 1
      }));
      
      toast({
        title: "Project assigned",
        description: "You've successfully taken on this project."
      });
      
    } catch (error) {
      console.error('Error taking project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to take project. It may have been assigned to another editor."
      });
    }
  };

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your editing projects</p>
          </div>
          
          {/* Project Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Assigned Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.assigned}</p>
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

          {/* Projects Tabs */}
          <Tabs defaultValue="assigned" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="assigned">My Projects</TabsTrigger>
              <TabsTrigger value="available">Available Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assigned" className="mt-0">
              {assignedProjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Projects</h2>
                  <p className="text-gray-600 mb-6">Check the Available Projects tab to find work</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} userRole="editor" />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="mt-0">
              {availableProjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600">No available projects at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableProjects.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {project.reel_type.charAt(0).toUpperCase() + project.reel_type.slice(1).replace('_', ' ')} • 
                              {project.pricing_tier.charAt(0).toUpperCase() + project.pricing_tier.slice(1)}
                            </CardDescription>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Submitted
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {project.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {project.description}
                          </p>
                        )}
                        <div className="text-sm">
                          <p className="text-gray-500">From Creator:</p>
                          <p>{project.creator?.email || 'Unknown'}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 bg-gray-50">
                        <div className="w-full flex justify-between">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/project/${project.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleTakeProject(project.id)}
                          >
                            Take Project
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
