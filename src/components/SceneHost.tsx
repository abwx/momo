import { useMemo } from "react";
import { SCENES } from "@/data/scenes";
import { resolveScene } from "@/data/resolveScene";
import { useGame } from "@/hooks/useGameStore";
import { VnPanel } from "@/components/VnPanel";
import { PhonePanel } from "@/components/PhonePanel";
import { InterludePanel } from "@/components/InterludePanel";
import { ResultPanel } from "@/components/ResultPanel";
import { CastingPanel } from "@/components/CastingPanel";
import { BinaryPanel } from "@/components/BinaryPanel";
import { ExclusivePanel } from "@/components/ExclusivePanel";
import { SliderPanel } from "@/components/SliderPanel";
import { HoldPanel } from "@/components/HoldPanel";
import { PickTwoPanel } from "@/components/PickTwoPanel";

export function SceneHost() {
  const { sceneId, archetype, portraitFile } = useGame();
  const raw = SCENES[sceneId];
  const scene = useMemo(
    () => (raw ? resolveScene(raw, archetype, portraitFile) : null),
    [raw, archetype, portraitFile, sceneId],
  );
  if (!scene) return <p style={{ padding: 16 }}>场景丢失</p>;

  switch (scene.kind) {
    case "vn":
      return <VnPanel scene={scene} />;
    case "phone":
      return <PhonePanel scene={scene} />;
    case "interlude":
      return <InterludePanel scene={scene} />;
    case "result":
      return <ResultPanel />;
    case "casting":
      return <CastingPanel />;
    case "binary":
      return <BinaryPanel scene={scene} />;
    case "exclusive":
      return <ExclusivePanel scene={scene} />;
    case "slider":
      return <SliderPanel scene={scene} />;
    case "hold":
      return <HoldPanel scene={scene} />;
    case "pick_two":
      return <PickTwoPanel scene={scene} />;
    default:
      return null;
  }
}
