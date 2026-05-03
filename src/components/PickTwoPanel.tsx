import { useEffect, useMemo, useState } from "react";
import type { ScenePickTwo } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { fillStoryTemplate } from "@/lib/storyTemplate";
import { mergeScoreDelta } from "@/lib/mergeScoreDelta";

export function PickTwoPanel({ scene }: { scene: ScenePickTwo }) {
  const { applyChoice, partnerName, callYou } = useGame();
  const [sel, setSel] = useState<string[]>([]);
  const ctx = useMemo(() => ({ partnerName, callYou }), [partnerName, callYou]);

  useEffect(() => {
    setSel([]);
  }, [scene.id]);

  const toggle = (id: string) => {
    setSel((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[0]!, id];
    });
  };

  const commit = () => {
    if (sel.length !== 2) return;
    const a = scene.options.find((o) => o.id === sel[0])!;
    const b = scene.options.find((o) => o.id === sel[1])!;
    applyChoice(scene.next, mergeScoreDelta(a.delta, b.delta));
  };

  const ready = sel.length === 2;

  return (
    <div className="glass interaction-panel interaction-pick2">
      <p className="binary-prompt">{fillStoryTemplate(scene.prompt, ctx)}</p>
      <p className="interaction-pick2-hint">{fillStoryTemplate(scene.hint, ctx)}</p>
      <div className="interaction-pick2-grid">
        {scene.options.map((o) => {
          const on = sel.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`interaction-pick2-chip${on ? " interaction-pick2-chip--on" : ""}`}
              onClick={() => toggle(o.id)}
            >
              {fillStoryTemplate(o.label, ctx)}
            </button>
          );
        })}
      </div>
      <button type="button" className="btn-primary" disabled={!ready} onClick={commit}>
        确认这两句
      </button>
    </div>
  );
}
