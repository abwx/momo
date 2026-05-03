import { useEffect, useMemo, useRef, useState } from "react";
import type { SceneHold } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { fillStoryTemplate } from "@/lib/storyTemplate";

export function HoldPanel({ scene }: { scene: SceneHold }) {
  const { applyChoice, partnerName, callYou } = useGame();
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const ctx = useMemo(() => ({ partnerName, callYou }), [partnerName, callYou]);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => {
    doneRef.current = false;
    setProgress(0);
    setHolding(false);
    clearTick();
  }, [scene.id]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTick();
    setHolding(false);
    setProgress(0);
    applyChoice(scene.next, scene.delta);
  };

  const startHold = () => {
    if (doneRef.current || holding) return;
    setHolding(true);
    const start = Date.now();
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / scene.holdMs);
      setProgress(p);
      if (p >= 1) {
        clearTick();
        setHolding(false);
        setProgress(1);
        finish();
      }
    }, 32);
  };

  const cancelHold = () => {
    if (doneRef.current) return;
    clearTick();
    setHolding(false);
    setProgress(0);
  };

  return (
    <div className="glass interaction-panel interaction-hold">
      <p className="binary-prompt">{fillStoryTemplate(scene.prompt, ctx)}</p>
      <p className="interaction-hold-hint">{fillStoryTemplate(scene.hint, ctx)}</p>
      <button
        type="button"
        className={`interaction-hold-zone${holding ? " interaction-hold-zone--active" : ""}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startHold();
        }}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onPointerLeave={(e) => {
          if (holding && e.pressure === 0) cancelHold();
        }}
      >
        <span className="interaction-hold-fill" style={{ transform: `scaleX(${progress})` }} />
        <span className="interaction-hold-label">{holding ? "再坚持一下…" : "按住这里"}</span>
      </button>
    </div>
  );
}
