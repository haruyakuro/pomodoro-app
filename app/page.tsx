"use client";

import { useState, useEffect, useRef } from "react";

// 各モードの時間（秒）
const FOCUS_TIME = 25 * 60; // 25分
const SHORT_BREAK = 5 * 60; // 5分
const LONG_BREAK = 30 * 60; // 30分

type Mode = "focus" | "shortBreak" | "longBreak";

export default function Home() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState(0);

  // 終了予定時刻を保持する（正確な時間計算のため）
  const endTimeRef = useRef<number | null>(null);

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

  // 1つのモード（集中 or 休憩）が終わった時の処理
  const handleModeComplete = () => {
    if (mode === "focus") {
      const newCompletedSets = completedSets + 1;
      setCompletedSets(newCompletedSets);

      if (newCompletedSets % 4 === 0) {
        // 4セット終わったら長い休憩
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      // 休憩が終わったら集中に戻る
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

  // 秒数を "25:00" のような表示に変換
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