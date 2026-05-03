import type { Scores } from "@/types/game";

const LABELS: { key: keyof Scores; label: string }[] = [
  { key: "possess", label: "占有欲" },
  { key: "devote", label: "奉献感" },
  { key: "grow", label: "并肩成长" },
  { key: "boundary", label: "边界自洽" },
];

const MAX = 18;

export function ScoreRadar({ scores }: { scores: Scores }) {
  const cx = 100;
  const cy = 100;
  const r = 72;
  const step = (2 * Math.PI) / LABELS.length;
  const pts = LABELS.map((_, i) => {
    const a = -Math.PI / 2 + step * i;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const valPts = LABELS.map((L, i) => {
    const v = Math.min(1, Math.max(0, scores[L.key] / MAX));
    const a = -Math.PI / 2 + step * i;
    return { x: cx + r * v * Math.cos(a), y: cy + r * v * Math.sin(a) };
  });
  const d =
    valPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  const grid = pts.map((p) => `M${cx},${cy} L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg className="score-radar" width="220" height="220" viewBox="0 0 200 200" aria-hidden>
      <path d={grid} fill="none" stroke="rgba(30,45,55,0.12)" strokeWidth="1" />
      <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="rgba(30,45,55,0.14)" />
      <path
        d={d}
        fill="url(#rg)"
        fillOpacity={0.5}
        stroke="url(#lg)"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d7a5e" />
          <stop offset="100%" stopColor="#3a9ebd" />
        </linearGradient>
        <radialGradient id="rg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#5cb88a" />
          <stop offset="100%" stopColor="#8fd4e8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {LABELS.map((L, i) => {
        const a = -Math.PI / 2 + step * i;
        const lx = cx + (r + 14) * Math.cos(a);
        const ly = cy + (r + 14) * Math.sin(a);
        return (
          <text
            key={L.key}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#5a6b73"
            fontSize="9"
          >
            {L.label}
          </text>
        );
      })}
    </svg>
  );
}
