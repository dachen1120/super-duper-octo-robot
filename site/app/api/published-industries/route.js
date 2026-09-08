import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ slugs: [] });
  const supabase = createClient(url, key);
  const { data, error } = await supabase.rpc("published_industry_slugs");
  if (error) return NextResponse.json({ slugs: [] });
  return NextResponse.json({ slugs: data || [] });
}