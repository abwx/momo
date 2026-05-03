import { useState } from "react";
import { PORTRAIT_FILES, DEFAULT_PORTRAIT_FILE, portraitUrl } from "@/data/characterArt";
import { ARCHETYPE_LABEL, archetypeForPortrait } from "@/data/archetypes";
import { loadMeta } from "@/data/metaProgress";
import { useGame } from "@/hooks/useGameStore";

export function CastingPanel() {
  const { commitSetup } = useGame();
  const meta = loadMeta();
  const [partnerName, setPartnerName] = useState("");
  const [callYou, setCallYou] = useState("");
  const [file, setFile] = useState<string>(DEFAULT_PORTRAIT_FILE);

  const canStart = partnerName.trim().length > 0 && callYou.trim().length > 0 && !!file;

  return (
    <div className="glass casting-panel">
      <p className="casting-lead">
        选一张脸作为「对方」的立绘，并填写<strong>对方的名字</strong>和<strong>你希望 TA 怎么称呼你</strong>（仅保存在本机浏览器）。
      </p>
      {meta.totalClears >= 1 && (
        <div className="casting-badge">
          再入局模式：选项顺序会洗牌；结局临界会轻微扰动；解读文案会轮换。完整通关过 {meta.totalClears}{" "}
          次后解锁的短彩蛋仍会出现。
        </div>
      )}
      <p className="casting-archetype" aria-live="polite">
        当前气质参考：{ARCHETYPE_LABEL[archetypeForPortrait(file)]}（会影响题干与部分分支）
      </p>
      <div className="casting-grid" role="list">
        {PORTRAIT_FILES.map((f) => (
          <button
            key={f}
            type="button"
            role="listitem"
            className={`casting-tile${file === f ? " casting-tile--on" : ""}`}
            onClick={() => setFile(f)}
            aria-pressed={file === f}
          >
            <img src={portraitUrl(f)} alt="" />
          </button>
        ))}
      </div>
      <label className="casting-field">
        <span>对方的名字</span>
        <input
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          maxLength={12}
          placeholder="例如：顾屿"
          autoComplete="off"
        />
      </label>
      <label className="casting-field">
        <span>希望对方怎么称呼你</span>
        <input
          value={callYou}
          onChange={(e) => setCallYou(e.target.value)}
          maxLength={12}
          placeholder="例如：发小 / 同桌 / 小名"
          autoComplete="off"
        />
      </label>
      <button
        type="button"
        className="btn-primary casting-start"
        disabled={!canStart}
        onClick={() =>
          commitSetup({
            partnerName: partnerName.trim(),
            callYou: callYou.trim(),
            portraitFile: file,
          })
        }
      >
        开始故事
      </button>
    </div>
  );
}
