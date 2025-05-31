const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://xhbqcwlujwwrvitkfpvg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // You'll need to provide this

async function applySchema() {
  if (!supabaseServiceKey) {
    console.error('Please provide SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Read the schema file
  const schema = fs.readFileSync('update-auth-schema.sql', 'utf8');
  
  try {
    // Apply the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Error applying schema:', error);
    } else {
      console.log('Schema applied successfully!');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

applySchema();
