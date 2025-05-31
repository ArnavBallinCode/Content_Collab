'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import FileUpload from '@/components/FileUpload';
import { useAuth } from '@/lib/auth-context';

// Schema for project form
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  reel_type: z.enum(['instagram', 'youtube_shorts', 'tiktok'], {
    required_error: "Please select a reel type",
  }),
  pricing_tier: z.enum(['basic', 'pro', 'premium', 'custom'], {
    required_error: "Please select a pricing tier",
  }),
  custom_price: z.number().optional(),
  editing_instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters' }),
});

interface EditProjectProps {
  params: {
    id: string;
  };
}

export default function EditProject({ params }: EditProjectProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rawFootageFile, setRawFootageFile] = useState<File | null>(null);
  const [currentRawFootageUrl, setCurrentRawFootageUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      reel_type: 'instagram',
      pricing_tier: 'basic',
      editing_instructions: '',
    },
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!user) {
          router.push('/sign-in');
          return;
        }

        // Fetch project details
        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (!project) throw new Error('Project not found');

        // Check if user is the creator
        if (project.creator_id !== user.id) {
          router.push('/dashboard');
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have permission to edit this project",
          });
          return;
        }

        // Check if project is in editable state
        if (!['draft', 'submitted'].includes(project.status)) {
          router.push(`/project/${params.id}`);
          toast({
            variant: "destructive",
            title: "Cannot edit",
            description: "This project is already in progress or completed and cannot be edited",
          });
          return;
        }

        // Set form values
        form.reset({
          title: project.title,
          description: project.description,
          reel_type: project.reel_type,
          pricing_tier: project.pricing_tier,
          custom_price: project.custom_price,
          editing_instructions: project.editing_instructions,
        });

        setCurrentRawFootageUrl(project.raw_footage_url);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load project data",
        });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id, user, router, toast, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      let raw_footage_url = currentRawFootageUrl;

      // Upload new raw footage if provided
      if (rawFootageFile) {
        const fileExt = rawFootageFile.name.split('.').pop();
        const fileName = `raw-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${params.id}/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, rawFootageFile, {
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(percent);
            },
          });
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(filePath);
        
        raw_footage_url = publicUrl;
      }

      // Update the project
      const { error } = await supabase
        .from('projects')
        .update({
          title: values.title,
          description: values.description,
          reel_type: values.reel_type,
          pricing_tier: values.pricing_tier,
          custom_price: values.custom_price,
          raw_footage_url,
          editing_instructions: values.editing_instructions,
        })
        .eq('id', params.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
      
      router.push(`/project/${params.id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 mt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="mt-2 text-gray-600">
              Update your project details
            </p>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter project title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  name="reel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reel Type</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          {...field}
                        >
                          <option value="instagram">Instagram</option>
                          <option value="youtube_shorts">YouTube Shorts</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="pricing_tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Tier</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          {...field}
                        >
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                          <option value="custom">Custom</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('pricing_tier') === 'custom' && (
                <FormField
                  name="custom_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter custom price"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Raw Footage</h4>
                <div className="mb-2">
                  {currentRawFootageUrl && (
                    <div className="p-3 bg-gray-50 rounded-md mb-2 text-sm">
                      <p className="text-gray-700">Current file: <a href={currentRawFootageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{currentRawFootageUrl.split('/').pop()}</a></p>
                    </div>
                  )}
                </div>
                <div>
                  <FileUpload
                    onFileSelect={(file) => setRawFootageFile(file)}
                    accept={{
                      'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
                      'application/zip': ['.zip'],
                      'application/x-rar-compressed': ['.rar']
                    }}
                    label="Upload new raw footage (optional)"
                    uploading={isSaving && uploadProgress > 0 && uploadProgress < 100}
                    progress={uploadProgress}
                  />
                </div>
              </div>

              <FormField
                name="editing_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Editing Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed instructions for the editor"
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
