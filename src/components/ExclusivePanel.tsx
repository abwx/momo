import { useMemo, useState } from "react";
import type { SceneExclusive, Scores } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { getExclusivePack } from "@/data/exclusivePacks";
import { GuyuPortrait } from "@/components/CharacterPortrait";
import { fillStoryTemplate, type StoryCtx } from "@/lib/storyTemplate";

export function ExclusivePanel({ scene }: { scene: SceneExclusive }) {
  const { portraitFile, partnerName, callYou, goTo, applyDelta } = useGame();
  const [step, setStep] = useState(0);
  const pack = useMemo(() => getExclusivePack(portraitFile), [portraitFile]);
  const ctx: StoryCtx = useMemo(() => ({ partnerName, callYou }), [partnerName, callYou]);

  const finish = (delta?: Partial<Scores>) => {
    applyDelta(delta);
    goTo(scene.continueTo);
  };

  return (
    <div className="glass exclusive-wrap">
      <div className="exclusive-portrait">
        <GuyuPortrait variant="vn" highlight />
      </div>
      <p className="exclusive-legal">{fillStoryTemplate(pack.tagline, ctx)}</p>

      {step === 0 && (
        <div className="exclusive-block">
          <h3 className="exclusive-h">{pack.stepTitles.step1}</h3>
          <div className="phone-chat exclusive-chat">
            {pack.step1.messages.map((m, i) => (
              <div key={i} className={`bubble-row bubble-row--them`}>
                <GuyuPortrait variant="avatar" className="bubble-side-avatar" />
                <div className="bubble them">
                  <div className="bubble-meta">{partnerName}</div>
                  {fillStoryTemplate(m.text, ctx)}
                </div>
              </div>
            ))}
          </div>
          <div className="vn-actions">
            {pack.step1.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="btn-choice"
                onClick={() => {
                  applyDelta(c.delta);
                  setStep(1);
                }}
              >
                {fillStoryTemplate(c.label, ctx)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="exclusive-block">
          <h3 className="exclusive-h">{pack.stepTitles.step2}</h3>
          <p className="binary-prompt">{fillStoryTemplate(pack.step2.prompt, ctx)}</p>
          <div className="binary-row">
            <button
              type="button"
              className="binary-card binary-card--a"
              onClick={() => {
                applyDelta(pack.step2.left.delta);
                setStep(2);
              }}
            >
              {fillStoryTemplate(pack.step2.left.label, ctx)}
            </button>
            <button
              type="button"
              className="binary-card binary-card--b"
              onClick={() => {
                applyDelta(pack.step2.right.delta);
                setStep(2);
              }}
            >
              {fillStoryTemplate(pack.step2.right.label, ctx)}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="exclusive-block">
          <h3 className="exclusive-h">{pack.stepTitles.step3}</h3>
          {pack.step3.lines.map((L, i) => (
            <div key={i} className="exclusive-vn-line">
              <div className="vn-speaker">
                {L.speaker === "player" ? "我" : L.speaker === "partner" ? partnerName : "旁白"}
              </div>
              <div className="vn-line">{fillStoryTemplate(L.text, ctx)}</div>
            </div>
          ))}
          <div className="vn-actions">
            {pack.step3.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="btn-choice"
                onClick={() => finish(c.delta)}
              >
                {fillStoryTemplate(c.label, ctx)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
