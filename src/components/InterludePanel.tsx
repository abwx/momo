import type { SceneInterlude } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { fillStoryTemplate } from "@/lib/storyTemplate";

export function InterludePanel({ scene }: { scene: SceneInterlude }) {
  const { goTo, partnerName, callYou, epilogueThisRun } = useGame();
  const ctx = { partnerName, callYou };
  const next =
    scene.id === "finale" && epilogueThisRun ? "epilogue" : scene.next;

  return (
    <div className="glass interlude">
      <h2>{scene.title}</h2>
      <p>{fillStoryTemplate(scene.subtitle, ctx)}</p>
      <button type="button" className="btn-primary" onClick={() => goTo(next)}>
        继续
      </button>
    </div>
  );
}
