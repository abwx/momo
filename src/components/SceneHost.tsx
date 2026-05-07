import { useMemo, useEffect } from "react";
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
import { AmbientEventCard } from "@/components/AmbientEventCard";

export function SceneHost() {
  const { sceneId, archetype, portraitFile, interruption, triggerInterruption } = useGame();
  const raw = SCENES[sceneId];
  const scene = useMemo(
    () => (raw ? resolveScene(raw, archetype, portraitFile) : null),
    [raw, archetype, portraitFile, sceneId],
  );

  // 随机触发中断逻辑 (25% 概率在进入支持 QTE 的场景时触发)
  useEffect(() => {
    // 排除初始场景：企划说明 (splash) 和 选角页 (casting)
    if (sceneId === "splash" || sceneId === "casting") return;

    if (scene && (scene.kind === "vn" || scene.kind === "phone")) {
      const timer = setTimeout(() => {
        if (Math.random() < 0.25) {
          triggerInterruption();
        }
      }, 3000); // 进入场景3秒后可能触发
      return () => clearTimeout(timer);
    }
  }, [sceneId, triggerInterruption, scene]);

  if (!scene) return <p style={{ padding: 16 }}>场景丢失</p>;

  return (
    <div className="scene-host-container" style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
      {interruption && (
        <div className="interruption-overlay">
          <AmbientEventCard />
        </div>
      )}
      <div className={`scene-content ${interruption ? "scene-content--paused" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {renderScene(scene)}
      </div>
    </div>
  );
}

function renderScene(scene: any) {
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
