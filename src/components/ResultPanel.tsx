import { useEffect, useMemo, useState } from "react";
import { PERSONALITIES } from "@/data/personalities";
import { bumpClears } from "@/data/metaProgress";
import { useGame } from "@/hooks/useGameStore";
import { ScoreRadar } from "@/components/ScoreRadar";
import { GuyuPortrait } from "@/components/CharacterPortrait";
import { fillStoryTemplate } from "@/lib/storyTemplate";
import type { AxisKey } from "@/types/game";

const AXIS_LABEL: Record<AxisKey, string> = {
  possess: "占有欲",
  devote: "奉献感",
  grow: "并肩成长",
  boundary: "边界自洽",
};

export function ResultPanel() {
  const { personalityId, scores, reset, partnerName, callYou, replaySpice, runSeed } = useGame();
  const p = PERSONALITIES[personalityId];
  const [revealed, setRevealed] = useState(false);
  const bumpKey = `faxiado-bump-${runSeed}`;

  const storyCtx = useMemo(() => ({ partnerName, callYou }), [partnerName, callYou]);

  const summary = useMemo(() => {
    if (replaySpice && p.summaryAlt && (runSeed % 2 === 1)) return p.summaryAlt;
    return p.summary;
  }, [p, replaySpice, runSeed]);

  const advice = useMemo(() => {
    if (replaySpice && p.adviceAlt && (runSeed % 2 === 0)) return p.adviceAlt;
    return p.advice;
  }, [p, replaySpice, runSeed]);

  useEffect(() => {
    if (!revealed) return;
    try {
      if (sessionStorage.getItem(bumpKey)) return;
      sessionStorage.setItem(bumpKey, "1");
      bumpClears();
    } catch {
      bumpClears();
    }
  }, [revealed, bumpKey]);

  return (
    <div className="glass" style={{ padding: "8px 0 20px" }}>
      {!revealed ? (
        <div className="result-reveal-stage">
          <div className="radar-wrap">
            <ScoreRadar scores={scores} />
          </div>
          <button type="button" className="btn-primary" style={{ margin: "0 16px" }} onClick={() => setRevealed(true)}>
            揭晓我的类型
          </button>
        </div>
      ) : (
        <>
          <div className="result-hero">
            <div className="result-face-row">
              <GuyuPortrait variant="thumb" />
              <div className="result-emoji">{p.emoji}</div>
            </div>
            <h1 className="result-title">{p.title}</h1>
            <p className="advice" style={{ color: "var(--muted)", marginTop: 4 }}>
              {fillStoryTemplate(summary, storyCtx)}
            </p>
          </div>
          <div className="radar-wrap">
            <ScoreRadar scores={scores} />
          </div>
          <div className="trait-tags">
            {p.traits.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="advice">{fillStoryTemplate(advice, storyCtx)}</p>

          <div className="result-extra">
            <div className="result-block-title">本局四维得分（raw，越高越突出）</div>
            <div className="result-axis-grid">
              {(Object.keys(AXIS_LABEL) as AxisKey[]).map((k) => (
                <div key={k} className="result-axis-row">
                  <span>{AXIS_LABEL[k]}</span>
                  <strong>{scores[k]}</strong>
                </div>
              ))}
            </div>
            <p className="result-note">
              共 9 种结局倾向：除经典六类外，新增「电光 / 镜面 / 锚定」用于描述「高成长+高投入」「高边界+高奉献」「高奉献+高并肩」等组合态。
            </p>
            {p.spotlightHint && (
              <>
                <div className="result-block-title">与「练习生作息 / 聚光灯」语境的相处提示</div>
                <p className="advice">{fillStoryTemplate(p.spotlightHint, storyCtx)}</p>
              </>
            )}
            {p.riskLine && (
              <>
                <div className="result-block-title">风险提示（非评判）</div>
                <p className="advice" style={{ color: "var(--muted)" }}>
                  {p.riskLine}
                </p>
              </>
            )}
            {p.reflectQuestion && (
              <>
                <div className="result-block-title">留给自己的一问</div>
                <p className="advice">{p.reflectQuestion}</p>
              </>
            )}
          </div>
        </>
      )}
      {revealed && (
        <div className="vn-actions" style={{ padding: "0 16px 8px" }}>
          <button type="button" className="btn-ghost" onClick={reset}>
            从头再测
          </button>
        </div>
      )}
    </div>
  );
}
