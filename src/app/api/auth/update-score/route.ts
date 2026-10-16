import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, username, scoreDelta = 0, wonBell = false } = await req.json();

    if (!userId && !username) {
      return NextResponse.json({ error: "Thiếu thông tin người chơi!" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      // Tìm profile
      const query = userId ? supabase.from("profiles").select("*").eq("id", userId).single()
                           : supabase.from("profiles").select("*").eq("username", username).single();
      const { data: profile } = await query;

      if (profile) {
        const newScore = (profile.total_score || 0) + scoreDelta;
        const newBells = (profile.bells_won || 0) + (wonBell ? 1 : 0);

        await supabase
          .from("profiles")
          .update({
            total_score: newScore,
            bells_won: newBells,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        return NextResponse.json({ success: true, newScore, newBells });
      }
    }

    return NextResponse.json({ success: true, offline: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
