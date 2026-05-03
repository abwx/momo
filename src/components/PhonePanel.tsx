import { useEffect, useMemo, useRef, useState } from "react";
import type { Choice, ScenePhone } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { resolveChoiceRoute } from "@/lib/resolveChoice";import { GuyuPortrait } from "@/components/CharacterPortrait";
import { fillStoryTemplate, type StoryCtx } from "@/lib/storyTemplate";
import { shuffleWithSeed } from "@/lib/seededShuffle";

export function PhonePanel({ scene }: { scene: ScenePhone }) {
  const { applyChoice, partnerName, callYou, runSeed, replaySpice, archetype, portraitFile } = useGame();  const [shown, setShown] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const timers = useRef<number[]>([]);

  const ctx: StoryCtx = useMemo(
    () => ({ partnerName, callYou }),
    [partnerName, callYou],
  );

  const displayChoices = useMemo(() => {
    if (!replaySpice) return scene.choices;
    return shuffleWithSeed(scene.choices, runSeed, `phone-${scene.id}`);
  }, [scene.choices, scene.id, replaySpice, runSeed]);

  useEffect(() => {
    setShown(0);
    setTypingDone(false);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const run = (i: number) => {
      if (i >= scene.messages.length) {
        setTypingDone(true);
        return;
      }
      const delay = i === 0 ? 120 : scene.messages[i]?.delayMs ?? 450;
      const t = window.setTimeout(() => {
        setShown((s) => Math.max(s, i + 1));
        run(i + 1);
      }, delay);
      timers.current.push(t);
    };
    run(0);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [scene.id, scene.messages]);

  return (
    <div className="phone-frame">
      <div className="phone-notch" />
      <div className="phone-contact-bar">
        <GuyuPortrait variant="avatar" />
        <div className="phone-contact-text">
          <div className="phone-contact-name">{partnerName}</div>
          <div className="phone-contact-status">发消息中…</div>
        </div>
      </div>
      <div className="phone-chat">
        {scene.messages.slice(0, shown).map((m, i) =>
          m.from === "player" ? (
            <div key={i} className="bubble-row bubble-row--me">
              <span className="bubble-side-spacer" aria-hidden />
              <div className="bubble me">
                <div className="bubble-meta">我</div>
                {fillStoryTemplate(m.text, ctx)}
              </div>
            </div>
          ) : (
            <div key={i} className="bubble-row bubble-row--them">
              <GuyuPortrait variant="avatar" className="bubble-side-avatar" />
              <div className="bubble them">
                <div className="bubble-meta">{partnerName}</div>
                {fillStoryTemplate(m.text, ctx)}
              </div>
            </div>
          ),
        )}
        {!typingDone && shown < scene.messages.length && (
          <div className="bubble-row bubble-row--them">
            <GuyuPortrait variant="avatar" className="bubble-side-avatar" />
            <div className="bubble them" style={{ opacity: 0.6 }}>
              <div className="bubble-meta">{partnerName}</div>
              <span className="typing">正在输入…</span>
            </div>
          </div>
        )}
      </div>
      {typingDone && (
        <div className="vn-actions" style={{ marginTop: 12 }}>
          {displayChoices.map((c: Choice) => (
            <button
              key={c.id}
              type="button"
              className="btn-choice"
              onClick={() => {
                const r = resolveChoiceRoute(c, archetype, portraitFile);
                applyChoice(r.next, r.delta);
              }}            >
              {fillStoryTemplate(c.label, ctx)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
