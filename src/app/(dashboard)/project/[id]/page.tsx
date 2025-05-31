'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Comments from '@/components/Comments';
import SubmitVersion from '@/components/SubmitVersion';
import { Project, ProjectVersion, Comment } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

// Helper function to get status badge color
const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    in_revision: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

export default function ProjectDetail({ params }: ProjectDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!user) {
          router.push('/sign-in');
          return;
        }

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Project not found');

        // Check if user has access to this project
        const isCreator = projectData.creator_id === user.id;
        const isEditor = projectData.editor_id === user.id;
        
        if (!isCreator && !isEditor && userRole !== 'editor') {
          router.push('/dashboard');
          return;
        }

        setProject(projectData);

        // Fetch project versions
        const { data: versionData, error: versionError } = await supabase
          .from('project_versions')
          .select('*')
          .eq('project_id', params.id)
          .order('version_number', { ascending: false });

        if (versionError) throw versionError;
        setVersions(versionData || []);

        // Fetch comments
        const { data: commentData, error: commentError } = await supabase
          .from('comments')
          .select(`
            id,
            project_id,
            user_id,
            content,
            timestamp,
            created_at,
            profiles:user_id(email, role)
          `)
          .eq('project_id', params.id)
          .order('created_at', { ascending: true });

        if (commentError) throw commentError;
        setComments(commentData || []);

      } catch (error) {
        console.error('Error fetching project data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load project data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [params.id, user, userRole, router, toast]);

  const handleSubmitComment = async (content: string, timestamp: number | null) => {
    try {
      if (!user || !project) return false;

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            project_id: project.id,
            user_id: user.id,
            content,
            timestamp,
          },
        ])
        .select(`
          id,
          project_id,
          user_id,
          content,
          timestamp,
          created_at,
          profiles:user_id(email, role)
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
      return false;
    }
  };

  const handleSubmitVersion = async (videoUrl: string, editorNotes: string) => {
    try {
      if (!user || !project) return false;

      // Get the next version number
      const nextVersionNumber = versions.length > 0 
        ? Math.max(...versions.map(v => v.version_number)) + 1 
        : 1;

      // Add the new version
      const { data: versionData, error: versionError } = await supabase
        .from('project_versions')
        .insert([
          {
            project_id: project.id,
            version_number: nextVersionNumber,
            video_url: videoUrl,
            editor_notes: editorNotes,
          },
        ])
        .select()
        .single();

      if (versionError) throw versionError;

      // Update project status to in_revision
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          status: 'in_revision',
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Update local state
      setVersions([versionData, ...versions]);
      setProject({
        ...project,
        status: 'in_revision',
        updated_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error submitting version:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit version",
      });
      return false;
    }
  };

  const handleApproveVersion = async () => {
    try {
      if (!user || !project) return;
      
      setIsActionLoading(true);

      // Update project status to completed
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      // Update local state
      setProject({
        ...project,
        status: 'completed',
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Version approved",
        description: "The project has been marked as completed.",
      });
    } catch (error) {
      console.error('Error approving version:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve version",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (!user || !project) return;
      
      setIsActionLoading(true);

      // Only allow deletion of draft or cancelled projects
      if (!['draft', 'cancelled'].includes(project.status)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Only draft or cancelled projects can be deleted",
        });
        return;
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitProject = async () => {
    try {
      if (!user || !project) return;
      
      setIsActionLoading(true);

      // Validate that the project has all required fields
      if (!project.title || !project.description || !project.raw_footage_url || !project.editing_instructions) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in all required fields before submitting.",
        });
        return;
      }

      // Update project status to submitted
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      // Update local state
      setProject({
        ...project,
        status: 'submitted',
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Project submitted",
        description: "Your project is now available for editors to pick up.",
      });
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit project",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelProject = async () => {
    try {
      if (!user || !project) return;
      
      setIsActionLoading(true);

      // Only allow cancellation of submitted, in_progress, or in_revision projects
      if (!['submitted', 'in_progress', 'in_revision'].includes(project.status)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This project cannot be cancelled in its current state",
        });
        return;
      }

      // Update project status to cancelled
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      // Update local state
      setProject({
        ...project,
        status: 'cancelled',
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Project cancelled",
        description: "The project has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel project",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto pt-20 pb-12 px-4">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto pt-20 pb-12 px-4">
          <div className="text-center my-12">
            <h2 className="text-2xl font-semibold text-gray-800">Project not found</h2>
            <p className="mt-2 text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-6"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  const isCreator = project.creator_id === user?.id;
  const isEditor = project.editor_id === user?.id;
  const currentUserId = user?.id || '';
  
  const latestVersion = versions.length > 0 ? versions[0] : null;
  
  return (
    <>
      <Navbar />
      
      <div className="container mx-auto pt-20 pb-12 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            </div>
            <p className="text-gray-600">{project.reel_type.replace('_', ' ').toUpperCase()} • {project.pricing_tier.toUpperCase()}</p>
          </div>
          
          <div className="flex gap-3">
            {isCreator && project.status === 'in_revision' && (
              <Button 
                onClick={handleApproveVersion}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Processing...' : 'Approve Latest Version'}
              </Button>
            )}
            {isCreator && project.status === 'draft' && (
              <Button 
                onClick={handleSubmitProject}
                disabled={isActionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isActionLoading ? 'Submitting...' : 'Submit to Marketplace'}
              </Button>
            )}
            {isCreator && ['draft', 'submitted'].includes(project.status) && (
              <Button variant="outline" asChild>
                <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
              </Button>
            )}
            {isCreator && ['submitted', 'in_progress', 'in_revision'].includes(project.status) && (
              <Button 
                variant="outline"
                onClick={handleCancelProject}
                disabled={isActionLoading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {isActionLoading ? 'Cancelling...' : 'Cancel Project'}
              </Button>
            )}
            {isEditor && project.status === 'in_progress' && versions.length === 0 && (
              <Button 
                onClick={() => {
                  // Scroll to the submit version form
                  const submitVersionElement = document.getElementById('submit-version-section');
                  if (submitVersionElement) {
                    submitVersionElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Submit First Version
              </Button>
            )}
            {(project.status === 'draft' || project.status === 'cancelled') && isCreator && (
              <Button 
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Deleting...' : 'Delete Project'}
              </Button>
            )}
            {isCreator && project.status === 'draft' && (
              <Button 
                onClick={handleSubmitProject}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Submitting...' : 'Submit Project'}
              </Button>
            )}
            {isCreator && ['submitted', 'in_progress', 'in_revision'].includes(project.status) && (
              <Button 
                variant="destructive"
                onClick={handleCancelProject}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Cancelling...' : 'Cancel Project'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Video Player */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Latest Version</CardTitle>
              </CardHeader>
              <CardContent>
                {latestVersion ? (
                  <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                    {latestVersion.video_url.toLowerCase().endsWith('.mp4') ? (                        <video 
                          className="w-full h-full" 
                          controls
                          poster="/video-placeholder.svg"
                        >
                          <source src={latestVersion.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="mt-2">Version {latestVersion.version_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p className="mt-2">No versions submitted yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Versions List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Project Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No versions yet</p>
                  ) : (
                    versions.map((version) => (
                      <div key={version.id} className="flex items-start gap-4 p-4 border rounded-md">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                          <span className="font-semibold">{version.version_number}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">Version {version.version_number}</span>
                            <span className="text-sm text-gray-500">{formatDate(version.created_at)}</span>
                          </div>
                          {version.editor_notes && (
                            <p className="text-sm text-gray-600">{version.editor_notes}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Here you could show a modal with the video preview
                                // For simplicity, we'll just open it in a new tab
                                window.open(version.video_url, '_blank');
                              }}
                            >
                              Preview
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={version.video_url} target="_blank" rel="noopener noreferrer" download>
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Comments */}
            <Comments
              projectId={project.id}
              comments={comments}
              currentUserId={currentUserId}
              onSubmitComment={handleSubmitComment}
            />
          </div>
          
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p>{project.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                    <p>{formatDate(project.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h4>
                    <p>{formatDate(project.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Editing Instructions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Editing Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{project.editing_instructions || 'No editing instructions provided'}</p>
              </CardContent>
            </Card>
            
            {/* Original Footage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Original Footage</CardTitle>
              </CardHeader>
              <CardContent>
                {project.raw_footage_url ? (
                  <div>
                    {project.raw_footage_url.toLowerCase().endsWith('.mp4') ? (
                      // If it's a video file, show the player
                      <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                        <video 
                          className="w-full h-full" 
                          controls
                          poster="/video-placeholder.svg"
                        >
                          <source src={project.raw_footage_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      // If it's not a video file (like a zip), show a placeholder
                      <div className="aspect-video bg-gray-900 rounded-md flex items-center justify-center text-white">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="mt-2">Raw Footage Files</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.raw_footage_url} target="_blank" rel="noopener noreferrer">
                          Download Raw Files
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <p>No raw footage available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Submit New Version (only for editor) */}
            {isEditor && ['in_progress', 'in_revision'].includes(project.status) && (
              <div id="submit-version-section">
                <SubmitVersion 
                  project={project}
                  versionNumber={versions.length + 1}
                  onSubmitVersion={handleSubmitVersion}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
