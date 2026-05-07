import { useEffect, useMemo, useState } from "react";
import type { Choice, SceneVN, VnSpeaker } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { resolveChoiceRoute } from "@/lib/resolveChoice";import { shouldShowPartnerPortraitInVn } from "@/data/characterArt";
import { GuyuPortrait } from "@/components/CharacterPortrait";
import { fillStoryTemplate, type StoryCtx } from "@/lib/storyTemplate";
import { shuffleWithSeed } from "@/lib/seededShuffle";

export function VnPanel({ scene }: { scene: SceneVN }) {
  const { goTo, applyChoice, partnerName, callYou, runSeed, replaySpice, archetype, portraitFile, interruption } = useGame();
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const ctx: StoryCtx = useMemo(
    () => ({ partnerName, callYou }),
    [partnerName, callYou],
  );

  useEffect(() => {
    setIdx(0);
    setTimeLeft(null);
  }, [scene.id]);

  const line = scene.lines[idx];
  const atEnd = idx >= scene.lines.length - 1;
  const hasChoices = !!scene.choices?.length;
  const nextId = scene.next;
  const showPortrait = shouldShowPartnerPortraitInVn(scene.id);
  const partnerLit = line?.speaker === "partner";

  const displayChoices = useMemo(() => {
    const ch = scene.choices;
    if (!ch?.length) return [];
    if (!replaySpice) return ch;
    return shuffleWithSeed(ch, runSeed, `vn-${scene.id}`);
  }, [scene.choices, scene.id, replaySpice, runSeed]);

  useEffect(() => {
    if (atEnd && hasChoices && scene.timeLimitMs && !interruption) {
      const limit = scene.timeLimitMs;
      // 如果之前已经有进度了，从之前的地方继续（实现暂停功能）
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
  }, [atEnd, hasChoices, scene.id, scene.timeLimitMs, displayChoices, archetype, portraitFile, applyChoice, interruption]);

  const skin = scene.skin ?? "default";
  return (
    <div
      className={`glass vn-box${showPortrait ? " vn-box--portrait" : ""}${skin === "journal" ? " vn-box--journal" : ""}`}
    >
      {timeLeft !== null && (
        <div className="time-limit-bar">
          <div
            className={`time-limit-fill${timeLeft < (scene.timeLimitMs || 0) * 0.3 ? " time-limit-fill--warning" : ""}`}
            style={{ width: `${(timeLeft / (scene.timeLimitMs || 1)) * 100}%` }}
          />
        </div>
      )}
      {showPortrait && (
        <div className="vn-portrait-wrap" data-lit={partnerLit ? "true" : "false"}>
          <GuyuPortrait variant="vn" highlight={partnerLit} />
        </div>
      )}
      {line ? (
        <>
          <div className="vn-speaker">{speakerLabel(line.speaker, partnerName)}</div>
          <div className="vn-line">{fillStoryTemplate(line.text, ctx)}</div>
        </>
      ) : null}

      <div className="vn-actions">
        {!atEnd && (
          <button type="button" className="btn-primary" onClick={() => setIdx((i) => i + 1)}>
            下一句
          </button>
        )}
        {atEnd &&
          hasChoices &&
          displayChoices.map((c: Choice) => (
            <button
              key={c.id}
              type="button"
              className={`btn-choice${scene.id === "dream" ? " card-pick" : ""}`}
              onClick={() => {
                const r = resolveChoiceRoute(c, archetype, portraitFile);
                applyChoice(r.next, r.delta);
              }}            >
              {fillStoryTemplate(c.label, ctx)}
            </button>
          ))}
        {atEnd && !hasChoices && nextId && (
          <button type="button" className="btn-primary" onClick={() => goTo(nextId)}>
            继续
          </button>
        )}
      </div>
    </div>
  );
}

function speakerLabel(s: VnSpeaker, partnerName: string) {
  if (s === "player") return "我";
  if (s === "partner") return partnerName;
  return "旁白";
}
