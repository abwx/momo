import { SCENES } from "@/data/scenes";
import { useGame } from "@/hooks/useGameStore";

export function SceneHeading() {
  const { sceneId } = useGame();
  const sc = SCENES[sceneId];
  if (!sc || sc.kind === "result") return null;
  return (
    <div className="scene-heading">
      <div className="scene-heading-kicker">当前场景 · 课表一角</div>
      <div className="scene-heading-title">{sc.title}</div>
    </div>
  );
}
