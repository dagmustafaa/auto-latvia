import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseUrl =
  rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : "https://dbhoocuujgcadcdpusuq.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "sb_publishable_3RapXCq0xvRH8uHKKm1ojg_C6w1FCOX";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);