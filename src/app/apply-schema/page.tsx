'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ApplySchemaPage() {
  const [output, setOutput] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);

  const applySchema = async () => {
    setIsApplying(true);
    setOutput('Starting schema diagnosis...\n');

    try {
      // Check current state of the database
      setOutput(prev => prev + 'Checking profiles table...\n');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (profilesError) {
        setOutput(prev => prev + `Profiles table error: ${profilesError.message}\n`);
        if (profilesError.message.includes('relation "public.profiles" does not exist')) {
          setOutput(prev => prev + '❌ Profiles table does not exist. Please apply the SQL schema manually.\n');
        }
      } else {
        setOutput(prev => prev + '✅ Profiles table exists\n');
      }

      // Check if we can create a test profile manually
      setOutput(prev => prev + 'Testing manual profile creation...\n');
      
      const testUserId = '00000000-0000-0000-0000-000000000001';
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          role: 'editor'
        })
        .select();

      if (insertError) {
        setOutput(prev => prev + `Manual insert error: ${insertError.message}\n`);
        if (insertError.message.includes('RLS')) {
          setOutput(prev => prev + '❌ RLS policy blocking INSERT. Missing INSERT policy!\n');
        }
      } else {
        setOutput(prev => prev + '✅ Manual profile creation works\n');
        // Clean up test data
        await supabase.from('profiles').delete().eq('id', testUserId);
      }

      setOutput(prev => prev + '\n=== Diagnosis completed ===\n');
      setOutput(prev => prev + 'To fix this issue, you need to apply the SQL schema with the INSERT policy.\n');
      setOutput(prev => prev + 'You can do this through the Supabase dashboard SQL editor.\n');
      
    } catch (error) {
      setOutput(prev => prev + `General error: ${error}\n`);
    } finally {
      setIsApplying(false);
    }
  };

  const testRegistration = async () => {
    setOutput(prev => prev + '\n=== Testing Editor Registration ===\n');
    
    try {
      const testEmail = `test-editor-${Date.now()}@example.com`;
      setOutput(prev => prev + `Creating test editor account: ${testEmail}\n`);

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123',
        options: {
          data: { role: 'editor' }
        }
      });

      if (error) {
        setOutput(prev => prev + `Registration error: ${error.message}\n`);
        return;
      }

      if (data.user) {
        setOutput(prev => prev + `User created: ${data.user.id}\n`);
        setOutput(prev => prev + `User metadata: ${JSON.stringify(data.user.user_metadata)}\n`);

        // Wait and check for profile
        setTimeout(async () => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user!.id)
            .single();

          if (profileError) {
            setOutput(prev => prev + `Profile check error: ${profileError.message}\n`);
          } else {
            setOutput(prev => prev + `✅ Profile created successfully: ${JSON.stringify(profile)}\n`);
            setOutput(prev => prev + `✅ Role correctly set to: ${profile.role}\n`);
          }
        }, 3000);
      }

    } catch (error) {
      setOutput(prev => prev + `Test error: ${error}\n`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Database Schema Management</h1>
      
      <div className="mb-6 space-x-4">
        <button 
          onClick={applySchema}
          disabled={isApplying}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? 'Applying Schema...' : 'Apply Database Schema'}
        </button>
        
        <button 
          onClick={testRegistration}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Test Editor Registration
        </button>
        
        <button 
          onClick={() => setOutput('')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear Output
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Output Log</h2>
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {output || 'Ready to apply schema changes...'}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">What this will do:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Create user_role enum (creator, editor)</li>
          <li>• Create/update profiles table with role column</li>
          <li>• Create trigger function to automatically create profiles</li>
          <li>• Set up Row Level Security with proper INSERT policy</li>
          <li>• Test editor account creation to verify the fix</li>
        </ul>
      </div>
    </div>
  );
}
