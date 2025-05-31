'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [output, setOutput] = useState<string>('');

  const testDatabaseSchema = async () => {
    try {
      // Test 1: Check if profiles table exists
      setOutput(prev => prev + '\n=== Testing Database Schema ===\n');
      
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles');
        
      if (tablesError) {
        setOutput(prev => prev + `Error checking tables: ${tablesError.message}\n`);
        return;
      }
      
      setOutput(prev => prev + `Profiles table exists: ${tables.length > 0 ? 'YES' : 'NO'}\n`);
      
      // Test 2: Check if user_role enum exists
      const { data: enums, error: enumsError } = await supabase
        .rpc('check_enum_exists', { enum_name: 'user_role' });
        
      if (!enumsError) {
        setOutput(prev => prev + `user_role enum exists: YES\n`);
      } else {
        setOutput(prev => prev + `user_role enum: ${enumsError.message}\n`);
      }
      
      // Test 3: Check trigger function
      const { data: functions, error: functionsError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .eq('routine_name', 'handle_new_user');
        
      if (!functionsError) {
        setOutput(prev => prev + `handle_new_user function exists: ${functions.length > 0 ? 'YES' : 'NO'}\n`);
      } else {
        setOutput(prev => prev + `Function check error: ${functionsError.message}\n`);
      }
      
      // Test 4: Check RLS policies
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'profiles');
        
      if (!policiesError && policies) {
        setOutput(prev => prev + `\nRLS Policies on profiles table:\n`);
        policies.forEach(policy => {
          setOutput(prev => prev + `- ${policy.policyname} (${policy.cmd})\n`);
        });
      } else {
        setOutput(prev => prev + `Policies check error: ${policiesError?.message || 'No policies found'}\n`);
      }
      
    } catch (error) {
      setOutput(prev => prev + `General error: ${error}\n`);
    }
  };

  const testSignUp = async () => {
    try {
      setOutput(prev => prev + '\n=== Testing Sign Up Process ===\n');
      
      // Create a test user
      const testEmail = `test-editor-${Date.now()}@example.com`;
      const testPassword = 'password123';
      
      setOutput(prev => prev + `Attempting to create user: ${testEmail}\n`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { role: 'editor' }
        }
      });
      
      if (error) {
        setOutput(prev => prev + `Sign up error: ${error.message}\n`);
        return;
      }
      
      if (data.user) {
        setOutput(prev => prev + `User created successfully: ${data.user.id}\n`);
        setOutput(prev => prev + `User metadata: ${JSON.stringify(data.user.user_metadata)}\n`);
        
        // Check if profile was created
        setTimeout(async () => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user!.id)
            .single();
            
          if (profileError) {
            setOutput(prev => prev + `Profile fetch error: ${profileError.message}\n`);
          } else {
            setOutput(prev => prev + `Profile created: ${JSON.stringify(profile)}\n`);
          }
        }, 2000);
      }
      
    } catch (error) {
      setOutput(prev => prev + `Test sign up error: ${error}\n`);
    }
  };

  const clearOutput = () => setOutput('');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Debug Tool</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testDatabaseSchema}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Database Schema
        </button>
        
        <button 
          onClick={testSignUp}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Sign Up
        </button>
        
        <button 
          onClick={clearOutput}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Output
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <pre className="whitespace-pre-wrap text-sm">
          {output || 'Click a button to start testing...'}
        </pre>
      </div>
    </div>
  );
}
