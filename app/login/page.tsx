import { login, signup } from "./actions";
import OceanBackground, { FONT } from "../components/OceanBackground";

const inputClass =
  "h-12 w-full rounded-full bg-white px-5 text-base font-medium text-[#0B2F6B] shadow-[0_4px_14px_rgba(10,50,120,0.18)] outline-none focus:ring-4 focus:ring-[#1B7BEA]/40";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      className="relative min-h-dvh w-full"
      style={{ fontFamily: FONT, fontWeight: 700, color: "#0B2F6B" }}
    >
      <OceanBackground />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-7 px-6 py-12">
        <div className="text-center">
          <p
            className="text-sm"
            style={{ letterSpacing: "0.4em", paddingLeft: "0.4em" }}
          >
            POMODORO
          </p>
          <h1
            className="mt-1 text-4xl"
            style={{
              textShadow:
                "0 2px 0 rgba(255,255,255,0.85), 0 0 22px rgba(255,255,255,0.75)",
            }}
          >
            ログイン
          </h1>
          <p className="mt-2 text-[13px] text-[#17407E]">
            波に乗って、集中しよう
          </p>
        </div>

        <form className="flex w-full max-w-xs flex-col gap-2">
          <label htmlFor="email" className="pl-2 text-sm">
            メールアドレス
          </label>
          <input
            name="email"
            id="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />

          <label htmlFor="password" className="mt-2 pl-2 text-sm">
            パスワード（6文字以上）
          </label>
          <input
            name="password"
            id="password"
            type="password"
            autoComplete="current-password"
            minLength={6}
            required
            className={inputClass}
          />

          <div className="mt-5 flex flex-col gap-3">
            <button
              formAction={login}
              className="h-14 rounded-full bg-white text-lg text-[#0B3A8A] shadow-[0_8px_22px_rgba(10,50,120,0.35)]"
            >
              ログイン
            </button>
            <button
              formAction={signup}
              className="h-14 rounded-full border-2 border-white bg-[#0B3A8A] text-lg text-white shadow-[0_8px_22px_rgba(10,50,120,0.35)]"
            >
              新規登録
            </button>
          </div>

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