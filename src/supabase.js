// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmjgylvnbywpinxyimny.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamd5bHZuYnl3cGlueHlpbW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDM0OTIsImV4cCI6MjA2NjM3OTQ5Mn0.rY_ZLqQ7wqr01KCXWUOt4figH0_IRymAdemrr73kYiM';

export const supabase = createClient(supabaseUrl, supabaseKey);
