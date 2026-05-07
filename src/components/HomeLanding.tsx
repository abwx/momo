import { portraitUrl, PORTRAIT_FILES } from "@/data/characterArt";

type Props = {
  hasProgress: boolean;
  onEnter: () => void;
};

function stripExt(file: string) {
  return file.replace(/\.png$/i, "");
}

export function HomeLanding({ hasProgress, onEnter }: Props) {
  const rosterCount = PORTRAIT_FILES.length;

  return (
    <div className="home-landing">
      <div className="home-landing-glow" aria-hidden />
      <div className="home-landing-glow home-landing-glow--rose" aria-hidden />
      <div className="home-landing-noise" aria-hidden />

      <div className="home-landing-inner">
        <div className="home-romance-deco" aria-hidden>
          <span className="home-deco home-deco--1">♡</span>
          <span className="home-deco home-deco--2">✦</span>
          <span className="home-deco home-deco--3">♡</span>
          <span className="home-deco home-deco--4">✧</span>
        </div>

        <div className="home-landing-card">
          <div className="home-top-compact">
            <span className="home-live-dot" aria-hidden />
            <span className="home-top-title">心动频段</span>
            <span className="home-top-pill">校园篇</span>
            <span className="home-top-pill home-top-pill--muted">仅供娱乐</span>
          </div>

          <p className="home-romance-kicker">把未说完的心动，轻轻接下去</p>

          <div className="home-roster">
            <p className="home-roster-label">
              <span className="home-roster-heart" aria-hidden>
                ♡
              </span>
              心动候补 <span className="home-roster-count">{rosterCount}</span> 人
              <span className="home-roster-sep">·</span>
              左右轻滑遇见 TA
            </p>
            <div className="home-roster-shell">
              <div className="home-roster-fade home-roster-fade--left" aria-hidden />
              <div className="home-roster-fade home-roster-fade--right" aria-hidden />
              <div className="home-roster-scroll" role="list">
                {PORTRAIT_FILES.map((file, i) => (
                  <div key={file} className="home-roster-cell" role="listitem">
                    <div className="home-roster-photo">
                      <img
                        src={portraitUrl(file)}
                        alt={stripExt(file)}
                        width={128}
                        height={128}
                        loading={i < 6 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={i === 0 ? "high" : "low"}
                      />
                    </div>
                    <span className="home-roster-name">{stripExt(file)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="home-hero-divider" aria-hidden>
            <span className="home-hero-divider-line" />
            <span className="home-hero-divider-ico">♡</span>
            <span className="home-hero-divider-line" />
          </div>

          <h1 className="home-hero-title">
            <span className="home-hero-line">发小出道前夜</span>
            <span className="home-hero-accent">与你同一页青春</span>
          </h1>

          <p className="home-hero-lead">真人选角 · 分支心事 · 温柔雷达 · 约一盏茶的时间</p>

          <div className="home-cta-block">
            <div className="home-btn-main-wrap">
              <button type="button" className="home-btn-main" onClick={onEnter}>
                <span className="home-btn-main-label">{hasProgress ? "续写心动" : "赴约开局"}</span>
                <span className="home-btn-main-sub">
                  {hasProgress ? "从上次那一页继续" : "从这里，走进故事里"}
                </span>
              </button>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}
