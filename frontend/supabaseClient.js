// Import Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Replace with your Supabase credentials
const SUPABASE_URL = "https://irybwarqzmsabvidjtws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeWJ3YXJxem1zYWJ2aWRqdHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg2OTMsImV4cCI6MjA3MzM0NDY5M30.4Iv9IfPnyS3atSM4XeWgO14FeJ2qewFFxNgKVwaEEOU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
