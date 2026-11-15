"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/login/actions";

// ===== 時間の設定（秒）。動作確認のときは数字を小さくするとテストしやすい =====
const FOCUS_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 30 * 60;

// ===== 見た目の設定 =====
const BASE_LEVEL = 0.14; // 水位の最低ライン（画面の14%）
const DEEP_LEVEL = 0.78; // この水位を越えたら文字とリングを白にする
const FONT =
  "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif";
const DAY_SKY = "linear-gradient(#4DB1FF 0%, #8BD2FF 38%, #DDF5FF 78%)";
const DUSK_SKY =
  "linear-gradient(#7A8BFF 0%, #C9A3F0 34%, #FFB9A8 66%, #FFE3BF 90%)";
const WATER = "linear-gradient(#3CD6F2, #1B8FEA 22%, #0E4FB8 70%, #0B3C94)";
const DAY_GLOW =
  "radial-gradient(circle, #FFFFFF 0%, #FFFFFF 7%, rgba(255,246,190,0.95) 9%, rgba(255,246,190,0.35) 30%, rgba(255,255,255,0) 64%)";
const DUSK_GLOW =
  "radial-gradient(circle, #FFFFFF 0%, #FFFFFF 7%, rgba(255,176,110,0.95) 9%, rgba(255,176,110,0.35) 30%, rgba(255,255,255,0) 64%)";

const RING_R = 138;
const RING_C = 2 * Math.PI * RING_R;

type Mode = "focus" | "shortBreak" | "longBreak";

// 雲（2色のアニメ風）
function Cloud({ shade, className }: { shade: string; className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 170 72"
      className={`cloud-sway absolute ${className}`}
    >
      <g fill={shade}>
        <circle cx="52" cy="46" r="26" />
        <circle cx="92" cy="38" r="32" />
        <circle cx="130" cy="48" r="24" />
        <rect x="26" y="46" width="124" height="24" rx="12" />
      </g>
      <g fill="#FFFFFF">
        <circle cx="52" cy="42" r="26" />
        <circle cx="92" cy="34" r="32" />
        <circle cx="130" cy="44" r="24" />
        <rect x="26" y="42" width="124" height="22" rx="11" />
      </g>
    </svg>
  );
}

export default function Timer({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      if (endTimeRef.current === null) return;

      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        setIsRunning(false);
        setSecondsLeft(0);
        handleModeComplete();
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const saveSession = async (completedMode: Mode, durationSeconds: number) => {
    const { error } = await supabase.from("sessions").insert({
      user_id: userId,
      mode: completedMode,
      duration_seconds: durationSeconds,
    });

    if (error) {
      console.log("保存エラー:", error);
    }
  };

  const timeOf = (m: Mode) =>
    m === "focus" ? FOCUS_TIME : m === "shortBreak" ? SHORT_BREAK : LONG_BREAK;

  const handleModeComplete = () => {
    saveSession(mode, timeOf(mode));

    if (mode === "focus") {
      const newCompletedSets = completedSets + 1;
      setCompletedSets(newCompletedSets);

      if (newCompletedSets % 4 === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("focus");
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setSecondsLeft(timeOf(newMode));
  };

  const start = () => {
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    switchMode(mode);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ===== ここから見た目の計算 =====
  const isBreak = mode !== "focus";
  const total = timeOf(mode);
  // 経過した割合（0〜1）。リングが進む量
  const progress = Math.min(1, Math.max(0, 1 - secondsLeft / total));
  // 水位（BASE_LEVEL〜1）。集中中は上がり、休憩中は満水から引いていく
  const level =
    BASE_LEVEL + (1 - BASE_LEVEL) * (isBreak ? 1 - progress : progress);
  // 水位が高いときは、文字とリングを白にする
  const deep = level > DEEP_LEVEL;

  const ink = deep ? "#FFFFFF" : "#0B2F6B";
  const captionInk = deep ? "#FFFFFF" : "#17407E";
  const textShadow = deep
    ? "0 2px 12px rgba(7,40,110,0.55)"
    : "0 2px 0 rgba(255,255,255,0.85), 0 0 22px rgba(255,255,255,0.75)";
  const stopA = deep ? "#FFFFFF" : isBreak ? "#7A5CFF" : "#1B7BEA";
  const stopB = deep ? "#8FF0FF" : isBreak ? "#3A2BB8" : "#1238C8";
  const glowColor = deep ? "#8FF0FF" : isBreak ? "#7A5CFF" : "#1B7BEA";
  const tickColor = deep ? "#FFFFFF" : isBreak ? "#3A2BB8" : "#1238C8";
  const trackColor = deep ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.55)";
  const knobStroke = deep ? "#1238C8" : isBreak ? "#3A2BB8" : "#1238C8";

  const modeLabel = isBreak ? "休 憩" : "集 中";
  const minutesLeft = Math.ceil(secondsLeft / 60);
  const caption = isBreak
    ? "波がゆっくり引いていくよ"
    : `波が満ちるまで あと${minutesLeft}分`;
  // 4つの丸（何セット目か）。長い休憩のときは4つとも埋まる
  const filledDots = mode === "longBreak" ? 4 : completedSets % 4;

  const fade = "color 0.7s, text-shadow 0.7s";
  const pt = (r: number, a: number) => ({
    x: (150 + r * Math.cos(a)).toFixed(2),
    y: (150 + r * Math.sin(a)).toFixed(2),
  });

  return (
    <main
      className="relative h-dvh w-full overflow-hidden"
      style={{ fontFamily: FONT, fontWeight: 700, color: ink }}
    >
      {/* 空（昼） */}
      <div className="absolute inset-0" style={{ background: DAY_SKY }}>
        <div
          aria-hidden="true"
          className="absolute h-[320px] w-[320px] rounded-full"
          style={{ top: -90, right: -60, background: DAY_GLOW }}
        />
        <Cloud shade="#BFE3FA" className="top-[28%] left-[4%] h-[72px] w-[170px]" />
        <Cloud shade="#BFE3FA" className="top-[14%] right-[6%] h-[52px] w-[120px]" />
      </div>

      {/* 空（夕焼け）：休憩のときにゆっくり重なる */}
      <div
        className="absolute inset-0"
        style={{
          background: DUSK_SKY,
          opacity: isBreak ? 1 : 0,
          transition: "opacity 1.5s",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute h-[320px] w-[320px] rounded-full"
          style={{ top: "32%", left: -30, background: DUSK_GLOW }}
        />
        <Cloud shade="#F2C3D6" className="top-[28%] left-[4%] h-[72px] w-[170px]" />
        <Cloud shade="#F2C3D6" className="top-[14%] right-[6%] h-[52px] w-[120px]" />
      </div>

      {/* 水：高さを変えて水位を表現。1秒かけてなめらかに動く */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: `${level * 100}%`,
          background: WATER,
          transition: "height 1s linear",
        }}
      >
        <div
          className="absolute inset-x-0 h-[56px] overflow-hidden"
          style={{ top: -54 }}
        >
          <div className="wave wave-back" />
          <div className="wave wave-mid" />
          <div className="wave wave-front" />
        </div>
      </div>

      {/* 上のメニュー */}
      <nav
        className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-12 text-sm"
        style={{ color: "#0B2F6B" }}
      >
        <span className="rounded-full bg-white/70 px-4 py-1.5">Pomodoro</span>
        <div className="flex items-center gap-2">
          <Link href="/ranking" className="rounded-full bg-white/70 px-4 py-1.5">
            ランキング
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full bg-white/70 px-4 py-1.5"
            >
              ログアウト
            </button>
          </form>
        </div>
      </nav>

      {/* タイマーとリング */}
      <div
        className="absolute left-1/2 flex h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5"
        style={{ top: "max(34%, 215px)", color: ink, transition: fade }}
      >
        <svg
          role="img"
          aria-label={`経過 ${Math.round(progress * 100)}%`}
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="absolute left-0 top-0"
        >
          <defs>
            <linearGradient
              id="ringGrad"
              gradientUnits="userSpaceOnUse"
              x1="20"
              y1="20"
              x2="280"
              y2="280"
            >
              <stop
                offset="0"
                style={{ stopColor: stopA, transition: "stop-color 0.7s" }}
              />
              <stop
                offset="1"
                style={{ stopColor: stopB, transition: "stop-color 0.7s" }}
              />
            </linearGradient>
          </defs>
          {/* 外側の細い線・土台のリング・内側の細い線 */}
          <circle cx="150" cy="150" r="148" fill="none" stroke={tickColor} strokeOpacity="0.35" strokeWidth="1.5" />
          <circle cx="150" cy="150" r={RING_R} fill="none" stroke={trackColor} strokeWidth="10" style={{ transition: "stroke 0.7s" }} />
          <circle cx="150" cy="150" r="108" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />
          {/* 60個の目盛り（進んだ分は濃くなる） */}
          {Array.from({ length: 60 }, (_, i) => {
            const a = ((i * 6 - 90) * Math.PI) / 180;
            const r1 = i % 5 === 0 ? 118 : 122;
            const p1 = pt(r1, a);
            const p2 = pt(127, a);
            const done = i * 6 < progress * 360 - 0.1;
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={tickColor}
                strokeOpacity={done ? (deep ? 0.9 : 0.7) : deep ? 0.3 : 0.22}
                strokeWidth={i % 5 === 0 ? 2.2 : 1.5}
                strokeLinecap="round"
                style={{ transition: "stroke 0.7s, stroke-opacity 0.7s" }}
              />
            );
          })}
          {/* 進んだ分のリング */}
          <circle
            cx="150"
            cy="150"
            r={RING_R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress * RING_C} ${RING_C}`}
            transform="rotate(-90 150 150)"
            opacity={progress > 0 ? 1 : 0}
            style={{
              transition: "stroke-dasharray 1s linear",
              filter: `drop-shadow(0 0 7px ${glowColor})`,
            }}
          />
          {/* 先端の白い丸 */}
          <g
            style={{
              transform: `rotate(${progress * 360}deg)`,
              transformOrigin: "150px 150px",
              transition: "transform 1s linear",
            }}
          >
            <circle
              cx="150"
              cy="12"
              r="12"
              fill="#FFFFFF"
              stroke={knobStroke}
              strokeWidth="5"
              style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
            />
          </g>
        </svg>

        <p
          className="relative text-base"
          style={{ letterSpacing: "0.4em", paddingLeft: "0.4em" }}
        >
          {modeLabel}
        </p>
        <p
          className="relative text-[72px] leading-[1.1]"
          style={{ fontVariantNumeric: "tabular-nums", textShadow, transition: fade }}
        >
          {formatTime(secondsLeft)}
        </p>
        <p
          className="relative text-[13px]"
          style={{ color: captionInk, transition: fade }}
        >
          {caption}
        </p>
        <div aria-hidden="true" className="relative mt-2 flex gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className="h-[18px] w-[18px] rounded-full border-2 border-[#0B2F6B]"
              style={
                i < filledDots
                  ? { background: "#FFE066", boxShadow: "0 0 10px #FFE066" }
                  : { background: "rgba(255,255,255,0.6)" }
              }
            />
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div
        className="absolute inset-x-0 flex justify-center gap-3.5"
        style={{ bottom: "max(20%, 150px)" }}
      >
        {!isRunning ? (
          <button
            onClick={start}
            className="h-14 rounded-full bg-white px-10 text-lg text-[#0B3A8A] shadow-[0_8px_22px_rgba(10,50,120,0.35)]"
          >
            開始
          </button>
        ) : (
          <button
            onClick={pause}
            className="h-14 rounded-full bg-white px-10 text-lg text-[#0B3A8A] shadow-[0_8px_22px_rgba(10,50,120,0.35)]"
          >
            一時停止
          </button>
        )}
        <button
          onClick={reset}
          className="h-14 rounded-full border-2 border-white bg-[#0B3A8A] px-6 text-lg text-white shadow-[0_8px_22px_rgba(10,50,120,0.35)]"
        >
          リセット
        </button>
      </div>

      {/* 下の小さな表示 */}
      <p className="absolute inset-x-0 bottom-5 text-center text-xs text-white">
        {userEmail} ・ 完了セット数: {completedSets}
      </p>
    </main>
  );
}