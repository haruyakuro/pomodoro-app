import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OceanBackground, { FONT } from "../components/OceanBackground";
import { updateUsername } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <main
      className="relative min-h-dvh w-full"
      style={{ fontFamily: FONT, fontWeight: 700, color: "#0B2F6B" }}
    >
      <OceanBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-xs flex-col items-center gap-6 px-6 pb-40 pt-12">
        <div className="flex w-full justify-start">
          <Link href="/" className="rounded-full bg-white/70 px-4 py-1.5 text-sm">
            ← タイマーに戻る
          </Link>
        </div>

        <div className="text-center">
          <p
            className="text-sm"
            style={{ letterSpacing: "0.4em", paddingLeft: "0.4em" }}
          >
            SETTINGS
          </p>
          <h1
            className="mt-1 text-3xl"
            style={{
              textShadow:
                "0 2px 0 rgba(255,255,255,0.85), 0 0 22px rgba(255,255,255,0.75)",
            }}
          >
            ユーザー名
          </h1>
          <p className="mt-2 text-[13px] text-[#17407E]">
            ランキングに表示される名前です
          </p>
        </div>

        <form action={updateUsername} className="flex w-full flex-col gap-2">
          <label htmlFor="username" className="pl-2 text-sm">
            ユーザー名（2〜16文字）
          </label>
          <input
            name="username"
            id="username"
            type="text"
            defaultValue={profile?.username ?? ""}
            maxLength={16}
            required
            className="h-12 w-full rounded-full bg-white px-5 text-base font-medium text-[#0B2F6B] shadow-[0_4px_14px_rgba(10,50,120,0.18)] outline-none focus:ring-4 focus:ring-[#1B7BEA]/40"
          />
          <button
            type="submit"
            className="mt-4 h-14 rounded-full bg-white text-lg text-[#0B3A8A] shadow-[0_8px_22px_rgba(10,50,120,0.35)]"
          >
            保存する
          </button>

          {params?.message && (
            <p className="mt-2 rounded-2xl bg-white/85 px-4 py-2 text-center text-sm">
              {params.message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}