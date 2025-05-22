import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Project } from '@/types';

interface SubmitVersionProps {
  project: Project;
  versionNumber: number;
}

export default function SubmitVersion({ project, versionNumber }: SubmitVersionProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editorNotes, setEditorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      alert('Please upload your edited video');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would:
      // 1. Upload the edited video to storage
      // 2. Create a new project version in the database
      // 3. Update the project status if needed
      
      console.log('Submitting version:', {
        projectId: project.id,
        versionNumber,
        videoFile,
        editorNotes,
      });
      
      // Sample implementation (replace with actual implementation)
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('edited-videos')
      //   .upload(`${project.id}/${Date.now()}-${videoFile.name}`, videoFile);
      
      // if (uploadError) throw uploadError;
      
      // const { data: versionData, error: versionError } = await supabase
      //   .from('project_versions')
      //   .insert([
      //     {
      //       project_id: project.id,
      //       version_number: versionNumber,
      //       video_url: uploadData.path,
      //       editor_notes: editorNotes,
      //     },
      //   ]);
      
      // if (versionError) throw versionError;
      
      // const { error: projectError } = await supabase
      //   .from('projects')
      //   .update({ status: 'in_revision' })
      //   .eq('id', project.id);
      
      alert('Version submitted successfully!');
    } catch (error) {
      console.error('Error submitting version:', error);
      alert('Error submitting version. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Submit New Version</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Edited Video
            </label>
            <FileUpload
              onFileSelect={(file) => setVideoFile(file)}
              label="Drag and drop your edited video here or click to browse"
            />
          </div>
          
          <div>
            <label htmlFor="editorNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Editor Notes
            </label>
            <textarea
              id="editorNotes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add notes about your edits, changes made, etc."
              value={editorNotes}
              onChange={(e) => setEditorNotes(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Version'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
