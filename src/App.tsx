import { SceneHost } from "@/components/SceneHost";
import { ChapterStrip } from "@/components/ChapterStrip";
import { SceneHeading } from "@/components/SceneHeading";
import { useGame } from "@/hooks/useGameStore";
export default function App() {
  return (
    <div className="campus-root">
      <div className="campus-sky" aria-hidden />
      <div className="app-shell campus-shell">
        <Header />
        <ChapterStrip />
        <SceneHeading />
        <main className="stage">
          <SceneHost />
        </main>
      </div>
    </div>
  );
}

function Header() {
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
      <button type="button" className="btn-ghost" onClick={() => reset()}>
        重置进度
      </button>
    </header>
  );
}
