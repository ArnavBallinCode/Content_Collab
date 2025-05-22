import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reelType: z.enum(['instagram', 'youtube_shorts', 'tiktok']),
  pricingTier: z.enum(['basic', 'pro', 'premium', 'custom']),
  customPrice: z.number().optional(),
  editingInstructions: z.string().min(10, 'Editing instructions must be at least 10 characters'),
  aiBrief: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectCreateForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      reelType: 'instagram',
      pricingTier: 'basic',
    },
  });

  const selectedPricingTier = watch('pricingTier');
  
  const onSubmit = async (data: ProjectFormData) => {
    if (!videoFile) {
      alert('Please upload a video file');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would:
      // 1. Upload the video file to storage
      // 2. Create the project in the database
      // 3. Redirect to the project page
      
      console.log('Form data:', data);
      console.log('Video file:', videoFile);
      
      // Sample implementation (replace with actual implementation)
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('raw-footage')
      //   .upload(`${Date.now()}-${videoFile.name}`, videoFile);
      
      // if (uploadError) throw uploadError;
      
      // const { data: projectData, error: projectError } = await supabase
      //   .from('projects')
      //   .insert([
      //     {
      //       title: data.title,
      //       description: data.description,
      //       reel_type: data.reelType,
      //       pricing_tier: data.pricingTier,
      //       custom_price: data.customPrice || null,
      //       editing_instructions: data.editingInstructions,
      //       ai_brief: data.aiBrief || null,
      //       raw_footage_url: uploadData.path,
      //       creator_id: 'current-user-id', // Replace with actual user ID
      //       status: 'draft',
      //     },
      //   ]);
      
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Upload your raw footage and provide instructions for editors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <Input
                id="title"
                placeholder="Enter a title for your project"
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your project"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reelType" className="block text-sm font-medium text-gray-700 mb-1">
                  Reel Type
                </label>
                <select
                  id="reelType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register('reelType')}
                >
                  <option value="instagram">Instagram</option>
                  <option value="youtube_shorts">YouTube Shorts</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="pricingTier" className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Tier
                </label>
                <select
                  id="pricingTier"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register('pricingTier')}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            
            {selectedPricingTier === 'custom' && (
              <div>
                <label htmlFor="customPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Price
                </label>
                <Input
                  id="customPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter custom price"
                  {...register('customPrice', { valueAsNumber: true })}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="editingInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                Editing Instructions
              </label>
              <textarea
                id="editingInstructions"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Provide detailed instructions for the editor"
                {...register('editingInstructions')}
              />
              {errors.editingInstructions && (
                <p className="mt-1 text-sm text-red-600">{errors.editingInstructions.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="aiBrief" className="block text-sm font-medium text-gray-700 mb-1">
                AI Brief (Optional)
              </label>
              <textarea
                id="aiBrief"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Generate AI suggestions for your editor (optional)"
                {...register('aiBrief')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Raw Footage
              </label>
              <FileUpload
                onFileSelect={(file) => setVideoFile(file)}
                label="Drag and drop your video file here or click to browse"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
