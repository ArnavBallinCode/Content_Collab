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
  raw_footage_url: z.string().url({ message: 'Please enter a valid URL' }),
  editing_instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters' }),
});

export default function NewProject() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      reel_type: 'instagram',
      pricing_tier: 'basic',
      raw_footage_url: '',
      editing_instructions: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          creator_id: user.id,
          title: values.title,
          description: values.description,
          reel_type: values.reel_type,
          pricing_tier: values.pricing_tier,
          custom_price: values.custom_price,
          raw_footage_url: values.raw_footage_url,
          editing_instructions: values.editing_instructions,
          status: 'draft',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      
      router.push(`/projects/${project.id}`);
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

              <FormField
                name="raw_footage_url"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Raw Footage URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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