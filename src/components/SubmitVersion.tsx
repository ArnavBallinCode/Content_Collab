import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Project } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface SubmitVersionProps {
  project: Project;
  versionNumber: number;
  onSubmitVersion?: (videoUrl: string, editorNotes: string) => Promise<boolean>;
}

export default function SubmitVersion({ project, versionNumber, onSubmitVersion }: SubmitVersionProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editorNotes, setEditorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload your edited video",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload the file to Supabase Storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${project.id}/${fileName}`;
      
      // Upload with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, videoFile, {
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);
      
      // Save the version to the database
      if (onSubmitVersion) {
        const success = await onSubmitVersion(publicUrl, editorNotes);
        
        if (success) {
          toast({
            title: "Success",
            description: "Version submitted successfully!",
          });
          setVideoFile(null);
          setEditorNotes('');
        }
      } else {
        // Fallback sample implementation
        console.log('Submitting version:', {
          projectId: project.id,
          versionNumber,
          videoUrl: publicUrl,
          editorNotes,
        });
        
        toast({
          title: "Success",
          description: "Version submitted successfully! (Demo mode)",
        });
      }
    } catch (error) {
      console.error('Error submitting version:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit version. Please try again.",
      });
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
              progress={uploadProgress}
              uploading={isSubmitting && uploadProgress > 0 && uploadProgress < 100}
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
