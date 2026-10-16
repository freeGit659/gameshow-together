import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, total_score, bells_won")
        .order("bells_won", { ascending: false })
        .order("total_score", { ascending: false })
        .limit(10);

      if (!error && profiles && profiles.length > 0) {
        const mapped = profiles.map((p, idx) => ({
          rank: idx + 1,
          name: p.full_name || p.username,
          avatar: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`,
          score: `${(p.total_score || 0).toLocaleString()} pts`,
          bells: p.bells_won || 0,
        }));
        return NextResponse.json({ leaderboard: mapped });
      }
    }

    // Dữ liệu mẫu ban đầu
    const fallback = [
      { rank: 1, name: "Quán Quân Minh", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MinhTop", score: "14,800 pts", bells: 9 },
      { rank: 2, name: "Bảo Ngọc Pro", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BaoNgoc", score: "11,500 pts", bells: 6 },
      { rank: 3, name: "Huy Coder", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=HuyCoder", score: "9,200 pts", bells: 4 },
      { rank: 4, name: "Pablo Gamer", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Pablo", score: "6,500 pts", bells: 2 },
    ];
    return NextResponse.json({ leaderboard: fallback });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
