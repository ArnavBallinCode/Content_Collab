'use client';

import { useState } from 'react';
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

export default function NewProject() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rawFootageFile, setRawFootageFile] = useState<File | null>(null);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      if (!rawFootageFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload your raw footage",
        });
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Create the project first to get the ID
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          creator_id: user.id,
          title: values.title,
          description: values.description,
          reel_type: values.reel_type,
          pricing_tier: values.pricing_tier,
          custom_price: values.custom_price,
          raw_footage_url: '', // Temporary, will update after file upload
          editing_instructions: values.editing_instructions,
          status: 'draft',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Upload the raw footage file
      const fileExt = rawFootageFile.name.split('.').pop();
      const fileName = `raw-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${project.id}/${fileName}`;
      
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
      
      // Update the project with the file URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ raw_footage_url: publicUrl })
        .eq('id', project.id);
        
      if (updateError) throw updateError;

      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="mt-2 text-gray-600">
              Fill out the form below to create a new project
            </p>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="title"
                render={({ field }: any) => (
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
                render={({ field }: any) => (
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
                  render={({ field }: any) => (
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
                  render={({ field }: any) => (
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
                  render={({ field }: any) => (
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
                <FileUpload
                  onFileSelect={(file) => setRawFootageFile(file)}
                  accept={{
                    'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
                    'application/zip': ['.zip'],
                    'application/x-rar-compressed': ['.rar']
                  }}
                  label="Upload your raw footage (videos, compressed archives)"
                  uploading={isLoading && uploadProgress > 0 && uploadProgress < 100}
                  progress={uploadProgress}
                />
                {!rawFootageFile && (
                  <p className="text-sm text-red-500 mt-1">Raw footage is required</p>
                )}
              </div>

              <FormField
                name="editing_instructions"
                render={({ field }: any) => (
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
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