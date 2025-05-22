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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in. Please check your credentials.",
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
              Welcome back
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Sign in to your account to continue
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" role="form" aria-label="Sign in form">
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
                          placeholder="Enter your password"
                          className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base font-medium text-white shadow-lg shadow-indigo-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </FormProvider>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
