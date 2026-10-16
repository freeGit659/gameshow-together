import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select(`
          id,
          code,
          host_id,
          status,
          created_at,
          creator_packs (
            title
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && rooms) {
        return NextResponse.json({
          rooms: rooms.map((r: any) => ({
            id: r.id,
            code: r.code,
            hostName: r.host_id,
            status: r.status,
            packTitle: r.creator_packs?.title || "Rung Chuông Vàng",
            createdAt: r.created_at,
          })),
        });
      }
    }

    return NextResponse.json({ rooms: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
