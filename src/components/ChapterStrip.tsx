import { useGame } from "@/hooks/useGameStore";
import { SCENES } from "@/data/scenes";
import { SCENE_MAX_CHAPTER } from "@/data/sceneMeta";

const CHAPTER_TOTAL = SCENE_MAX_CHAPTER;
export function ChapterStrip() {
  const { sceneId, chapterMax } = useGame();
  const cur = SCENES[sceneId]?.chapter ?? 0;

  return (
    <>
      <div className="chapter-pill">
        第 {Math.min(CHAPTER_TOTAL, Math.max(0, cur))} 章 / 共 {CHAPTER_TOTAL} 章
      </div>
      <div className="progress-row" aria-hidden>
        {Array.from({ length: CHAPTER_TOTAL }, (_, i) => {
          const n = i + 1;
          const done = chapterMax >= n || cur >= n;
          const active = cur === n;
          return (
            <div key={n} className={`progress-dot ${done ? "done" : ""} ${active ? "active" : ""}`}>
              <i />
            </div>
          );
        })}
      </div>
    </>
  );
}
