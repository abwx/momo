import type { SceneBinary } from "@/types/game";
import { useGame } from "@/hooks/useGameStore";
import { fillStoryTemplate, type StoryCtx } from "@/lib/storyTemplate";
import { resolveChoiceRoute } from "@/lib/resolveChoice";

export function BinaryPanel({ scene }: { scene: SceneBinary }) {
  const { applyChoice, partnerName, callYou, archetype, portraitFile } = useGame();
  const ctx: StoryCtx = { partnerName, callYou };
  const left = resolveChoiceRoute(scene.left, archetype, portraitFile);
  const right = resolveChoiceRoute(scene.right, archetype, portraitFile);

  return (
    <div className="glass binary-panel">
      <p className="binary-prompt">{fillStoryTemplate(scene.prompt, ctx)}</p>
      <div className="binary-row">
        <button
          type="button"
          className="binary-card binary-card--a"
          onClick={() => applyChoice(left.next, left.delta)}
        >
          {fillStoryTemplate(scene.left.label, ctx)}
        </button>
        <button
          type="button"
          className="binary-card binary-card--b"
          onClick={() => applyChoice(right.next, right.delta)}
        >
          {fillStoryTemplate(scene.right.label, ctx)}
        </button>
      </div>
    </div>
  );
}
