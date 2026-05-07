import { useEffect, useMemo, useRef, useState } from "react";
import type { Choice, ScenePhone } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { resolveChoiceRoute } from "@/lib/resolveChoice";
import { GuyuPortrait } from "@/components/CharacterPortrait";
import { fillStoryTemplate, type StoryCtx } from "@/lib/storyTemplate";
import { shuffleWithSeed } from "@/lib/seededShuffle";

export function PhonePanel({ scene }: { scene: ScenePhone }) {
  const { applyChoice, partnerName, callYou, runSeed, replaySpice, archetype, portraitFile, interruption } = useGame();
  const [shown, setShown] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
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
    setTimeLeft(null);
  }, [scene.id]);

  useEffect(() => {
    if (interruption) return; // 如果被中断，停止打字流

    const run = (i: number) => {
      if (i >= scene.messages.length) {
        setTypingDone(true);
        return;
      }
      const delay = i === 0 ? 120 : scene.messages[i]?.delayMs ?? 450;
      const t = window.setTimeout(() => {
        setShown((s) => Math.max(s, i + 1));
      }, delay);
      timers.current.push(t);
    };

    if (shown < scene.messages.length) {
      run(shown);
    } else {
      setTypingDone(true);
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [scene.id, scene.messages, interruption, shown]);

  useEffect(() => {
    if (typingDone && scene.timeLimitMs && !interruption) {
      const limit = scene.timeLimitMs;
      const start = Date.now() - (limit - (timeLeft ?? limit));
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, limit - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          const first = displayChoices[0];
          if (first) {
            const r = resolveChoiceRoute(first, archetype, portraitFile);
            applyChoice(r.next, { ...r.delta, grow: (r.delta?.grow || 0) - 1 });
          }
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [typingDone, scene.id, scene.timeLimitMs, displayChoices, archetype, portraitFile, applyChoice, interruption]);

  const pendingMessage = shown < scene.messages.length ? scene.messages[shown] : null;
  const isPartnerTyping = pendingMessage?.from !== "player";
  const typingName = isPartnerTyping ? partnerName : "我";
  const typingLabel = isPartnerTyping ? "正在输入" : "正在斟酌回复";
  const headerStatus = typingDone ? "对话已送达" : isPartnerTyping ? "对方正在输入" : "你正在输入";

  return (
    <div className="phone-frame">
      {timeLeft !== null && (
        <div className="time-limit-bar">
          <div
            className={`time-limit-fill${timeLeft < (scene.timeLimitMs || 0) * 0.3 ? " time-limit-fill--warning" : ""}`}
            style={{ width: `${(timeLeft / (scene.timeLimitMs || 1)) * 100}%` }}
          />
        </div>
      )}
      <div className="phone-notch" />
      <div className="phone-contact-bar">
        <GuyuPortrait variant="avatar" />
        <div className="phone-contact-text">
          <div className="phone-contact-name">{partnerName}</div>
          <div className="phone-contact-status">{headerStatus}</div>
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
          <div className={`bubble-row ${isPartnerTyping ? "bubble-row--them" : "bubble-row--me"} bubble-row--typing`}>
            {isPartnerTyping ? (
              <GuyuPortrait variant="avatar" className="bubble-side-avatar" />
            ) : (
              <span className="bubble-side-spacer" aria-hidden />
            )}
            <div className={`bubble ${isPartnerTyping ? "them" : "me"} bubble--typing`}>
              <div className="bubble-meta">{typingName}</div>
              <div className="typing-indicator" aria-label={`${typingName}${typingLabel}`}>
                <span className="typing-dots" aria-hidden>
                  <i className="typing-dot" />
                  <i className="typing-dot" />
                  <i className="typing-dot" />
                </span>
                <span className="typing-label">{typingLabel}</span>
              </div>
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
              }}
            >
              {fillStoryTemplate(c.label, ctx)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
