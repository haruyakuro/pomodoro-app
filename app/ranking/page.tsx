import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

type RankingRow = {
  username: string;
  total_focus_seconds: number;
  total_sets: number;
};

export default async function RankingPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_ranking");

  if (error) {
    return <p className="p-8 text-red-500">ランキングの取得に失敗しました</p>;
  }

  const ranking = data as RankingRow[];

  // 秒数を "〇時間〇分" の形式に変換
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-6">
      <h1 className="text-2xl font-bold">集中時間ランキング</h1>

      <Link href="/" className="text-blue-500 underline text-sm">
        ← タイマーに戻る
      </Link>

      <table className="w-full max-w-md border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">順位</th>
            <th className="text-left py-2">ユーザー名</th>
            <th className="text-right py-2">合計集中時間</th>
            <th className="text-right py-2">セット数</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((row, index) => (
            <tr key={row.username} className="border-b">
              <td className="py-2">{index + 1}</td>
              <td className="py-2">{row.username}</td>
              <td className="py-2 text-right">
                {formatDuration(row.total_focus_seconds)}
              </td>
              <td className="py-2 text-right">{row.total_sets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}