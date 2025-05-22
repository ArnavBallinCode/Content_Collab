'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import React from 'react';

type Project = {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'in_revision' | 'completed' | 'cancelled';
  reel_type: 'instagram' | 'youtube_shorts' | 'tiktok';
  pricing_tier: 'basic' | 'pro' | 'premium' | 'custom';
  custom_price: number | null;
  raw_footage_url: string;
  editing_instructions: string;
  created_at: string;
  creator_id: string;
  editor_id: string | null;
};

type Comment = {
  id: string;
  content: string;
  timestamp: number | null;
  created_at: string;
  user_id: string;
  user: {
    email: string;
  };
};

type ProjectVersion = {
  id: string;
  version_number: number;
  video_url: string;
  editor_notes: string;
  created_at: string;
};

type PageParams = {
  id: string;
};

export default function ProjectDetails({ params }: { params: PageParams }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVersion, setNewVersion] = useState({
    video_url: '',
    editor_notes: '',
  });

  // Unwrap params for Next.js 15+
  const { id } = params;

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
          .eq('id', id)
          .single();
        if (projectError) {
          console.error('Supabase project error:', projectError);
          throw projectError;
        }
        setProject(projectData);

        // Fetch comments with user information
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            profiles!user_id(
              id,
              role
            )
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: true });

        if (commentsError) {
          console.error('Supabase comments error:', commentsError);
          throw commentsError;
        }

        // Get the current user's email
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const currentUserEmail = currentUser?.email || 'Unknown';

        // Map comments with user data
        const commentsWithUsers = commentsData?.map(comment => ({
          ...comment,
          user: {
            email: comment.user_id === currentUser?.id ? currentUserEmail : 'Other User'
          }
        })) || [];

        setComments(commentsWithUsers);

        // Fetch project versions
        const { data: versionsData, error: versionsError } = await supabase
          .from('project_versions')
          .select('*')
          .eq('project_id', id)
          .order('version_number', { ascending: true });
        if (versionsError) {
          console.error('Supabase versions error:', versionsError);
          throw versionsError;
        }
        setVersions(versionsData || []);
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
  }, [id, router, toast, user]);

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus,
          ...(newStatus === 'in_progress' && userRole === 'editor' ? { editor_id: user?.id } : {})
        })
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: "Status updated",
        description: "Project status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project status",
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !project) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: project.id,
          user_id: user?.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      // Refresh comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!user_id(
            id,
            role
          )
        `)
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      setComments(commentsData || []);
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newVersion.video_url.trim()) return;

    try {
      const { error } = await supabase
        .from('project_versions')
        .insert({
          project_id: project.id,
          version_number: versions.length + 1,
          video_url: newVersion.video_url.trim(),
          editor_notes: newVersion.editor_notes.trim(),
        });

      if (error) throw error;

      // Refresh versions
      const { data: versionsData } = await supabase
        .from('project_versions')
        .select('*')
        .eq('project_id', project.id)
        .order('version_number', { ascending: true });

      setVersions(versionsData || []);
      setNewVersion({ video_url: '', editor_notes: '' });
      toast({
        title: "Version added",
        description: "New version has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding version:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add version",
      });
    }
  };

  const handleSubmitForReview = async () => {
    if (!project) return;
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('projects')
        .update({ status: 'submitted' })
        .eq('id', project.id);
      if (error) throw error;
      toast({ title: 'Submitted', description: 'Project submitted for review.' });
      // Refresh project data
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`*, creator:creator_id(*), editor:editor_id(*)`)
        .eq('id', project.id)
        .single();
      if (!fetchError) setProject(data);
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit for review',
      });
    } finally {
      setIsLoading(false);
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

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
            <p className="mt-2 text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = userRole === 'creator' && project.creator_id === user?.id;
  const isEditor = userRole === 'editor' && project.editor_id === user?.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="mt-2 text-gray-600">{project.description}</p>
            </div>
            <div className="flex gap-4">
              {canEdit && project.status === 'draft' && (
                <Button
                  onClick={handleSubmitForReview}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit for Review
                </Button>
              )}
              {userRole === 'editor' && project.status === 'submitted' && !project.editor_id && (
                <Button
                  onClick={() => handleStatusChange('in_progress')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Editing
                </Button>
              )}
              {isEditor && project.status === 'in_progress' && (
                <Button
                  onClick={() => handleStatusChange('in_revision')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit for Review
                </Button>
              )}
              {canEdit && project.status === 'in_revision' && (
                <Button
                  onClick={() => handleStatusChange('completed')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Approve
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{project.status.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Reel Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{project.reel_type.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pricing Tier</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {project.pricing_tier}
                      {project.custom_price && ` ($${project.custom_price})`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Raw Footage</dt>
                    <dd className="mt-1">
                      <a 
                        href={project.raw_footage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        View Raw Footage
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Editing Instructions</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{project.editing_instructions}</p>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Versions</h2>
                {versions.length === 0 ? (
                  <p className="text-gray-500">No versions uploaded yet</p>
                ) : (
                  <div className="space-y-4">
                    {versions.map((version) => (
                      <div key={version.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Version {version.version_number}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(version.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <a 
                          href={version.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 text-sm"
                        >
                          View Video
                        </a>
                        {version.editor_notes && (
                          <p className="mt-2 text-sm text-gray-600">{version.editor_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isEditor && project.status === 'in_progress' && (
                  <form onSubmit={handleVersionSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={newVersion.video_url}
                        onChange={(e) => setNewVersion(prev => ({ ...prev, video_url: e.target.value }))}
                        placeholder="https://..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Editor Notes
                      </label>
                      <textarea
                        value={newVersion.editor_notes}
                        onChange={(e) => setNewVersion(prev => ({ ...prev, editor_notes: e.target.value }))}
                        placeholder="Add any notes about this version..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add Version
                    </Button>
                  </form>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">{comment.user?.email}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCommentSubmit} className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    rows={3}
                  />
                  <Button
                    type="submit"
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 