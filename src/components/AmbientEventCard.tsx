import { useState, useEffect } from "react";
import { useGame } from "@/hooks/useGameStore";
import { SCENES } from "@/data/scenes";

export function AmbientEventCard() {
  const { interruption, dismissInterruption, applyDelta, sceneId } = useGame();
  const [clicked, setClicked] = useState(false);
  const [closing, setClosing] = useState(false);
  const scene = SCENES[sceneId];

  useEffect(() => {
    setClicked(false);
    setClosing(false);
    if (interruption?.isSurprise) {
      document.body.classList.add("shake-anim");
      const t = setTimeout(() => document.body.classList.remove("shake-anim"), 500);
      return () => {
        clearTimeout(t);
        document.body.classList.remove("shake-anim");
      };
    }
  }, [sceneId, interruption]);

  if (!interruption) return null;

  const isPhoneScene = scene?.kind === "phone";

  const handleAction = () => {
    if (clicked || !interruption.isSurprise) return;
    setClicked(true);
    if (interruption.actionDelta) {
      applyDelta(interruption.actionDelta);
    }
    setTimeout(() => {
      setClosing(true);
      setTimeout(dismissInterruption, 400);
    }, 1200);
  };

  const handleIgnore = () => {
    setClosing(true);
    setTimeout(dismissInterruption, 400);
  };

  return (
    <div className={`interruption-card-wrap ${isPhoneScene ? "phone-interruption" : "vn-interruption"} ${closing ? "exit-anim" : "enter-anim"}`}>
      <aside
        className={`ambient-event ambient-event--${interruption.tone}${interruption.isSurprise ? " ambient-event--surprise" : ""}${clicked ? " ambient-event--done" : ""}`}
        aria-live="polite"
        onClick={handleAction}
      >
        <div className="ambient-event-badge">
          <span className="ambient-event-icon" aria-hidden>
            {interruption.icon}
          </span>
          <span>{interruption.tag}</span>
        </div>
        <div className="ambient-event-title">
          {interruption.title}
          {interruption.isSurprise && !clicked && <span className="surprise-pulse" />}
        </div>
        <p className="ambient-event-detail">
          {clicked && interruption.actionLabel ? `[${interruption.actionLabel}] ${interruption.detail}` : interruption.detail}
        </p>
        
        <div className="interruption-footer">
          {interruption.isSurprise && !clicked ? (
            <div className="surprise-hint">快处理突发状况！</div>
          ) : !clicked ? (
            <button className="btn-ignore" onClick={handleIgnore}>跳过</button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
