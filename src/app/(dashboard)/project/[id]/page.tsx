import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Comments from '@/components/Comments';
import SubmitVersion from '@/components/SubmitVersion';
import { Project, ProjectVersion, Comment } from '@/types';
import Link from 'next/link';

// Sample project data (would be fetched from Supabase in a real app)
const sampleProject: Project = {
  id: '1',
  creator_id: 'user1',
  editor_id: 'editor1',
  title: 'Summer Campaign Reel',
  description: 'A promotional reel for our summer campaign featuring new products',
  raw_footage_url: '/videos/raw1.mp4',
  editing_instructions: 'Create a vibrant summer-themed reel that showcases our new product line. Focus on bright colors and energetic transitions. Music should be upbeat and summery.',
  reel_type: 'instagram',
  pricing_tier: 'pro',
  status: 'in_progress',
  created_at: '2025-05-15T10:00:00Z',
  updated_at: '2025-05-18T14:30:00Z',
};

// Sample project versions
const sampleVersions: ProjectVersion[] = [
  {
    id: 'v1',
    project_id: '1',
    version_number: 1,
    video_url: '/videos/edit1.mp4',
    editor_notes: 'First draft focusing on the product introduction and key features',
    created_at: '2025-05-16T15:20:00Z',
  },
  {
    id: 'v2',
    project_id: '1',
    version_number: 2,
    video_url: '/videos/edit2.mp4',
    editor_notes: 'Second draft incorporating feedback on transitions and music selection',
    created_at: '2025-05-18T09:45:00Z',
  },
];

// Sample comments
const sampleComments: Comment[] = [
  {
    id: 'c1',
    project_id: '1',
    user_id: 'user1',
    content: 'Could we adjust the color balance in the intro to be a bit warmer?',
    timestamp: 8.5,
    created_at: '2025-05-16T18:30:00Z',
  },
  {
    id: 'c2',
    project_id: '1',
    user_id: 'editor1',
    content: 'I've updated the color balance throughout. Let me know what you think of the new version!',
    created_at: '2025-05-17T10:15:00Z',
  },
  {
    id: 'c3',
    project_id: '1',
    user_id: 'user1',
    content: 'The new colors look great! Could we add more emphasis on the product packaging at 0:22?',
    timestamp: 22,
    created_at: '2025-05-18T11:20:00Z',
  },
];

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
  // For the demo, we're just using sample data
  // In a real app, we'd fetch project data using params.id
  const project = sampleProject;
  const versions = sampleVersions;
  const comments = sampleComments;
  
  // Demo user role (in a real app, we'd determine this from authentication)
  const userRole: 'creator' | 'editor' = 'creator';
  const currentUserId = userRole === 'creator' ? project.creator_id : project.editor_id!;
  
  const isCreator = userRole === 'creator';
  const isEditor = userRole === 'editor';
  
  return (
    <>
      <Navbar userRole={userRole} />
      
      <div className="container mx-auto pt-20 pb-12 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
            <p className="text-gray-600">{project.reel_type.replace('_', ' ').toUpperCase()} • {project.pricing_tier.toUpperCase()}</p>
          </div>
          
          <div className="flex gap-3">
            {isCreator && project.status === 'in_revision' && (
              <Button>Approve Latest Version</Button>
            )}
            {isCreator && ['draft', 'submitted'].includes(project.status) && (
              <Button variant="outline" asChild>
                <Link href={`/project/${project.id}/edit`}>Edit Project</Link>
              </Button>
            )}
            {isEditor && project.status === 'in_progress' && (
              <Button>Submit New Version</Button>
            )}
            {(project.status === 'draft' || project.status === 'cancelled') && (
              <Button variant="destructive">Delete Project</Button>
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
                <div className="aspect-video bg-gray-900 rounded-md flex items-center justify-center text-white">
                  {/* In a real app, this would be a video player */}
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
                    <p className="mt-2">Video Player</p>
                  </div>
                </div>
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
                            <Button size="sm" variant="outline">Preview</Button>
                            <Button size="sm" variant="outline">Download</Button>
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
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-2">Original Footage</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm">Download Raw Files</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Submit New Version (only for editor) */}
            {isEditor && project.status === 'in_progress' && (
              <SubmitVersion 
                project={project}
                versionNumber={versions.length + 1}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
