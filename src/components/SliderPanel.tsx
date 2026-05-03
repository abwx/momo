import { useEffect, useMemo, useState } from "react";
import type { SceneSlider, SliderTier } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { fillStoryTemplate } from "@/lib/storyTemplate";

function deltaForSlider(value: number, tiers: SliderTier[]) {
  const t = [...tiers].sort((a, b) => a.until - b.until);
  const clamped = Math.max(0, Math.min(100, value));
  for (const tier of t) {
    if (clamped <= tier.until) return tier.delta;
  }
  return t[t.length - 1]!.delta;
}

export function SliderPanel({ scene }: { scene: SceneSlider }) {
  const { applyChoice, partnerName, callYou } = useGame();
  const [v, setV] = useState(50);
  const ctx = useMemo(() => ({ partnerName, callYou }), [partnerName, callYou]);

  useEffect(() => {
    setV(50);
  }, [scene.id]);

  const commit = () => {
    applyChoice(scene.next, deltaForSlider(v, scene.tiers));
  };

  return (
    <div className="glass interaction-panel interaction-slider">
      <p className="binary-prompt">{fillStoryTemplate(scene.prompt, ctx)}</p>
      <div className="interaction-slider-row">
        <span className="interaction-slider-cap">{scene.minLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className="interaction-slider-input"
          aria-valuetext={`${v}`}
        />
        <span className="interaction-slider-cap">{scene.maxLabel}</span>
      </div>
      <div className="interaction-slider-readout" aria-live="polite">
        当前刻度：<strong>{v}</strong>
      </div>
      <button type="button" className="btn-primary" onClick={commit}>
        就停在这里
      </button>
    </div>
  );
}
