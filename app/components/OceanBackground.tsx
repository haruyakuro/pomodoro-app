// 海の背景（空・雲・波）。ログイン画面とランキング画面で共通して使う部品
// 画面いっぱいに固定され、スクロールしても動かない

export const FONT =
  "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif";

const DAY_SKY = "linear-gradient(#4DB1FF 0%, #8BD2FF 38%, #DDF5FF 78%)";
const DAY_GLOW =
  "radial-gradient(circle, #FFFFFF 0%, #FFFFFF 7%, rgba(255,246,190,0.95) 9%, rgba(255,246,190,0.35) 30%, rgba(255,255,255,0) 64%)";
const WATER = "linear-gradient(#3CD6F2, #1B8FEA 22%, #0E4FB8 70%, #0B3C94)";

function Cloud({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 170 72"
      className={`cloud-sway absolute ${className}`}
    >
      <g fill="#BFE3FA">
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

// level: 水位（0〜1）。ログイン画面などは浅め（0.14）でOK
export default function OceanBackground({ level = 0.14 }: { level?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ background: DAY_SKY }}
    >
      <div
        className="absolute h-[320px] w-[320px] rounded-full"
        style={{ top: -90, right: -60, background: DAY_GLOW }}
      />
      <Cloud className="top-[28%] left-[4%] h-[72px] w-[170px]" />
      <Cloud className="top-[14%] right-[6%] h-[52px] w-[120px]" />

      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: `${level * 100}%`, background: WATER }}
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
    </div>
  );
}