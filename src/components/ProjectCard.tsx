import React from 'react';
import { Project, ProjectStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper function to get status badge color
const getStatusColor = (status: ProjectStatus) => {
  const colors = {
    draft: 'bg-gray-200 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    in_revision: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

interface ProjectCardProps {
  project: Project;
  userRole: 'creator' | 'editor';
}

export default function ProjectCard({ project, userRole }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <CardDescription className="mt-1">
              {project.reel_type.charAt(0).toUpperCase() + project.reel_type.slice(1).replace('_', ' ')} • 
              {project.pricing_tier.charAt(0).toUpperCase() + project.pricing_tier.slice(1)}
            </CardDescription>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {project.description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Created</p>
            <p>{formatDate(project.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Updated</p>
            <p>{formatDate(project.updated_at)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 bg-gray-50">
        <div className="w-full flex justify-between">
          {userRole === 'creator' ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/project/${project.id}`}>View Details</Link>
              </Button>
              {project.status === 'draft' && (
                <Button size="sm" asChild>
                  <Link href={`/project/${project.id}/edit`}>Edit Project</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/project/${project.id}`}>View Details</Link>
              </Button>
              {project.status === 'in_progress' && (
                <Button size="sm" asChild>
                  <Link href={`/project/${project.id}/edit`}>Work on Project</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
