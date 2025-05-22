'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['creator', 'editor']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function FormLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("block mb-1 font-medium", className)}>{children}</label>;
}

export default function SignUp() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'creator',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log('Form values:', values);
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        throw signUpError;
      }

      if (user) {
        console.log('Creating profile with role:', values.role);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              role: values.role,
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        toast({
          title: "Success",
          description: `Account created successfully as ${values.role}`,
        });

        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50" role="main">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12 mt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create your account
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Join our community of content creators and editors
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" role="form" aria-label="Sign up form">
                <FormField
                  name="email"
                  render={({ field }: any) => (
                    <FormItem>
                      <label htmlFor="email" className="block mb-1 font-medium text-gray-700">Email</label>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="password"
                  render={({ field }: any) => (
                    <FormItem>
                      <label htmlFor="password" className="block mb-1 font-medium text-gray-700">Password</label>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="confirmPassword"
                  render={({ field }: any) => (
                    <FormItem>
                      <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">Confirm Password</label>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="role"
                  render={({ field }: any) => (
                    <FormItem>
                      <label htmlFor="role" className="block mb-1 font-medium text-gray-700">Sign up as</label>
                      <Select 
                        onValueChange={(value) => {
                          console.log('Role selected:', value);
                          field.onChange(value);
                        }} 
                        value={field.value} 
                        required
                      >
                        <FormControl>
                          <SelectTrigger id="role" className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent position="popper" className="w-full bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-lg">
                          <SelectItem value="creator" className="py-3 px-4 hover:bg-indigo-50 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">🎥</span>
                              <div>
                                <div className="font-medium text-gray-900">Content Creator</div>
                                <div className="text-sm text-gray-500">Create and submit content</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="editor" className="py-3 px-4 hover:bg-indigo-50 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">✂️</span>
                              <div>
                                <div className="font-medium text-gray-900">Video Editor</div>
                                <div className="text-sm text-gray-500">Edit and enhance content</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base font-medium text-white shadow-lg shadow-indigo-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </FormProvider>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
