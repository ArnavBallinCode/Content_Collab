import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhbqcwlujwwrvitkfpvg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoYnFjd2x1and3cnZpdGtmcHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjE4ODksImV4cCI6MjA2MzM5Nzg4OX0.HDFtewXHsw7Hcs6efqcS65fb5LlV1CksRA8JRz9jR8w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
