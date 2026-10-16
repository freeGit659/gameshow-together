import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Hàm helper lấy danh sách packs từ Supabase (hoặc fallback nếu chưa cấu hình)
export async function getPacksFromSupabase() {
  if (!supabase) return null;

  try {
    const { data: packs, error } = await supabase
      .from("creator_packs")
      .select(`
        id,
        title,
        author_name,
        description,
        price,
        tags,
        plays_count,
        is_official,
        questions (
          id,
          question_text,
          options,
          correct_answer,
          time_limit,
          explanation,
          difficulty
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error, fallback to local:", error.message);
      return null;
    }

    return packs.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.author_name,
      description: p.description,
      price: Number(p.price) || 0,
      tags: p.tags || ["Chung"],
      playsCount: p.plays_count || 0,
      isOfficial: p.is_official,
      questions: (p.questions || []).map((q: any, idx: number) => ({
        id: idx + 1,
        text: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
        timeLimit: q.time_limit || 15,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "medium",
      })),
    }));
  } catch (err) {
    console.warn("Could not connect to Supabase:", err);
    return null;
  }
}
