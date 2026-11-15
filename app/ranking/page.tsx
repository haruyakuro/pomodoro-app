import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import OceanBackground, { FONT } from "../components/OceanBackground";

type RankingRow = {
  username: string;
  total_focus_seconds: number;
  total_sets: number;
};

// 1位〜3位のメダルの色
const MEDAL = ["#FFD84D", "#E3EAF2", "#F0B27A"];

// 秒数を "〇時間〇分" の形式に変換
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}時間${minutes}分`;
};

export default async function RankingPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_ranking");

  // ログイン中の人の名前を取得（ランキングで「あなた」と表示するため）
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let myName: string | null = null;
  if (user) {
    const { data: me } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    myName = me?.username ?? null;
  }

  const ranking = (data ?? []) as RankingRow[];

  return (
    <main
      className="relative min-h-dvh w-full"
      style={{ fontFamily: FONT, fontWeight: 700, color: "#0B2F6B" }}
    >
      <OceanBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center gap-5 px-5 pb-40 pt-12">
        <div className="flex w-full justify-start">
          <Link
            href="/"
            className="rounded-full bg-white/70 px-4 py-1.5 text-sm"
          >
            ← タイマーに戻る
          </Link>
        </div>

        <div className="text-center">
          <p
            className="text-sm"
            style={{ letterSpacing: "0.4em", paddingLeft: "0.4em" }}
          >
            RANKING
          </p>
          <h1
            className="mt-1 text-3xl"
            style={{
              textShadow:
                "0 2px 0 rgba(255,255,255,0.85), 0 0 22px rgba(255,255,255,0.75)",
            }}
          >
            集中時間ランキング
          </h1>
        </div>

        {error ? (
          <p className="rounded-2xl bg-white/85 px-4 py-3 text-sm">
            ランキングの取得に失敗しました
          </p>
        ) : ranking.length === 0 ? (
          <p className="rounded-2xl bg-white/85 px-4 py-3 text-sm">
            まだ記録がありません。最初の1人になろう！
          </p>
        ) : (
          <ol className="flex w-full flex-col gap-2.5">
            {ranking.map((row, i) => {
              const mine = row.username === myName;
              return (
                <li
                  key={`${row.username}-${i}`}
                  className={`flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_6px_18px_rgba(10,50,120,0.2)] ${
                    mine ? "ring-4 ring-[#FFE066]" : ""
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#0B2F6B] text-base"
                    style={{ background: MEDAL[i] ?? "#FFFFFF" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base">
                      {row.username}
                      {mine && (
                        <span className="ml-2 rounded-full bg-[#FFE066] px-2 py-0.5 text-xs">
                          あなた
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#17407E]">
                      {row.total_sets}セット
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-lg tabular-nums">
                    {formatDuration(row.total_focus_seconds)}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}