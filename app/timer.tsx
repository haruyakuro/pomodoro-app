"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/login/actions";
import Link from "next/link";

const FOCUS_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 30 * 60;

type Mode = "focus" | "shortBreak" | "longBreak";

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

  // DBに記録を保存する関数
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

  const handleModeComplete = () => {
    // 完了したモードの時間をDBに保存
    const duration =
      mode === "focus" ? FOCUS_TIME : mode === "shortBreak" ? SHORT_BREAK : LONG_BREAK;
    saveSession(mode, duration);

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
    const time =
      newMode === "focus"
        ? FOCUS_TIME
        : newMode === "shortBreak"
        ? SHORT_BREAK
        : LONG_BREAK;
    setSecondsLeft(time);
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

  const modeLabel =
    mode === "focus" ? "集中時間" : mode === "shortBreak" ? "小休憩" : "長い休憩";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Link href="/ranking" className="text-sm text-blue-500 underline">
          ランキングを見る
      </Link>
      <p className="text-sm text-gray-500">{userEmail} でログイン中</p>
      
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-red-500 underline"
        >
          ログアウト
        </button>
      </form>
      

      <h1 className="text-2xl font-bold">{modeLabel}</h1>

      <div className="text-7xl font-mono">{formatTime(secondsLeft)}</div>

      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            開始
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg"
          >
            一時停止
          </button>
        )}
        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-400 text-white rounded-lg"
        >
          リセット
        </button>
      </div>

      <p className="text-gray-600">完了セット数: {completedSets}</p>
    </main>
  );
}
