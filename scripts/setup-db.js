const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
    },
    body: JSON.stringify({ sql }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SQL execution failed: ${error}`)
  }

  return response.json()
}

async function setupDatabase() {
  try {
    console.log('Setting up database schema...')

    // SQL commands to create tables and policies
    const sqlCommands = [
      `
        CREATE TABLE IF NOT EXISTS public.entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          project_name TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('vendor', 'labour', 'material', 'labour_attendance', 'material_stock', 'other')),
          party_name TEXT NOT NULL,
          quantity NUMERIC,
          amount NUMERIC NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
      `,
      `ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;`,
      `
        CREATE POLICY "Users can view their own entries" 
        ON public.entries FOR SELECT 
        USING (auth.uid() = user_id);
      `,
      `
        CREATE POLICY "Users can insert their own entries" 
        ON public.entries FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
      `,
      `
        CREATE POLICY "Users can update their own entries" 
        ON public.entries FOR UPDATE 
        USING (auth.uid() = user_id);
      `,
      `
        CREATE POLICY "Users can delete their own entries" 
        ON public.entries FOR DELETE 
        USING (auth.uid() = user_id);
      `,
    ]

    for (const sql of sqlCommands) {
      try {
        await executeSQL(sql)
        console.log('✓ SQL executed:', sql.substring(0, 50).trim() + '...')
      } catch (error) {
        // Some statements might fail if they already exist, which is OK
        console.log('⚠ Note:', error.message)
      }
    }

    console.log('✓ Database setup completed!')
  } catch (error) {
    console.error('Database setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()
