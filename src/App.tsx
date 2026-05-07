import { useCallback, useState } from "react";
import { SceneHost } from "@/components/SceneHost";
import { ChapterStrip } from "@/components/ChapterStrip";
import { SceneHeading } from "@/components/SceneHeading";
import { HomeLanding } from "@/components/HomeLanding";
import { useGame } from "@/hooks/useGameStore";
import { ENTRY_SCENE } from "@/data/scenes";

const SESSION_IN_APP = "faxiado-in-app";

export default function App() {
  const { sceneId } = useGame();
  const hasProgress = sceneId !== ENTRY_SCENE;
  const [inApp, setInApp] = useState(() => sessionStorage.getItem(SESSION_IN_APP) === "1");

  const enterApp = useCallback(() => {
    sessionStorage.setItem(SESSION_IN_APP, "1");
    setInApp(true);
  }, []);

  const goHome = useCallback(() => {
    sessionStorage.removeItem(SESSION_IN_APP);
    setInApp(false);
  }, []);

  return (
    <div className="campus-root">
      <div className="campus-sky" aria-hidden />
      {!inApp ? (
        <HomeLanding hasProgress={hasProgress} onEnter={enterApp} />
      ) : (
        <div className="app-shell campus-shell">
          <Header onGoHome={goHome} />
          <ChapterStrip />
          <SceneHeading />
          <main className="stage">
            <SceneHost />
          </main>
        </div>
      )}
    </div>
  );
}

function Header({ onGoHome }: { onGoHome: () => void }) {
  const { reset } = useGame();
  return (
    <header className="top-bar">
      <div className="brand-block">
        <div className="brand-row">
          <span className="brand-crest" aria-hidden title="校园">
            🏫
          </span>
          <div className="brand">发小出道前夜 · 校园篇</div>
        </div>
        <div className="brand-tagline">青春物语 · 心理小测</div>
      </div>
      <div className="top-bar-actions">
        <button type="button" className="btn-ghost btn-ghost--compact" onClick={onGoHome}>
          首页
        </button>
        <button type="button" className="btn-ghost" onClick={() => reset()}>
          重置进度
        </button>
      </div>
    </header>
  );
}
