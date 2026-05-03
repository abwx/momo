import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ENTRY_SCENE, SCENES } from "@/data/scenes";
import { INITIAL_SCORES, type Scores } from "@/types/game";
import { resolvePersonality } from "@/data/personalities";
import { loadMeta } from "@/data/metaProgress";
import { DEFAULT_PORTRAIT_FILE } from "@/data/characterArt";
import { archetypeForPortrait, type Archetype } from "@/data/archetypes";

const STORAGE_KEY = "faxiado-quiz-v1";

type Persist = {
  scores: Scores;
  sceneId: string;
  chapterMax: number;
  partnerName: string;
  callYou: string;
  portraitFile: string;
  runSeed: number;
  replaySpice: boolean;
  epilogueThisRun: boolean;
};

const DEFAULT_PARTNER = "顾屿";
const DEFAULT_CALL = "发小";

function migrate(p: Partial<Persist> | null): Persist {
  let sceneId = p?.sceneId ?? ENTRY_SCENE;
  if (sceneId === "title") sceneId = "casting";
  return {
    scores: p?.scores ?? { ...INITIAL_SCORES },
    sceneId,
    chapterMax: p?.chapterMax ?? 0,
    partnerName: (p?.partnerName ?? DEFAULT_PARTNER).trim() || DEFAULT_PARTNER,
    callYou: (p?.callYou ?? DEFAULT_CALL).trim() || DEFAULT_CALL,
    portraitFile: (p?.portraitFile ?? DEFAULT_PORTRAIT_FILE).trim() || DEFAULT_PORTRAIT_FILE,
    runSeed: typeof p?.runSeed === "number" ? p.runSeed : 0,
    replaySpice: !!p?.replaySpice,
    epilogueThisRun: !!p?.epilogueThisRun,
  };
}

function loadPersist(): Persist {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrate(null);
    return migrate(JSON.parse(raw) as Partial<Persist>);
  } catch {
    return migrate(null);
  }
}

function savePersist(p: Persist) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export type StoryProfile = {
  partnerName: string;
  callYou: string;
  portraitFile: string;
};

type Ctx = {
  sceneId: string;
  scores: Scores;
  chapterMax: number;
  partnerName: string;
  callYou: string;
  portraitFile: string;
  archetype: Archetype;
  runSeed: number;
  replaySpice: boolean;
  epilogueThisRun: boolean;
  goTo: (id: string) => void;
  applyChoice: (next: string, delta?: Partial<Scores>) => void;
  /** 不改变场景，仅叠加分数（专属篇分步用） */
  applyDelta: (delta?: Partial<Scores>) => void;
  commitSetup: (p: StoryProfile) => void;
  reset: () => void;
  personalityId: ReturnType<typeof resolvePersonality>;
};

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersist();
  const [sceneId, setSceneId] = useState(persisted.sceneId);
  const [scores, setScores] = useState<Scores>(() => persisted.scores);
  const [chapterMax, setChapterMax] = useState(persisted.chapterMax);
  const [partnerName, setPartnerName] = useState(persisted.partnerName);
  const [callYou, setCallYou] = useState(persisted.callYou);
  const [portraitFile, setPortraitFile] = useState(persisted.portraitFile);
  const [runSeed, setRunSeed] = useState(persisted.runSeed);
  const [replaySpice, setReplaySpice] = useState(persisted.replaySpice);
  const [epilogueThisRun, setEpilogueThisRun] = useState(persisted.epilogueThisRun);

  useEffect(() => {
    const sc = SCENES[sceneId];
    if (!sc) return;
    setChapterMax((m) => Math.max(m, sc.chapter));
  }, [sceneId]);

  useEffect(() => {
    savePersist({
      scores,
      sceneId,
      chapterMax,
      partnerName,
      callYou,
      portraitFile,
      runSeed,
      replaySpice,
      epilogueThisRun,
    });
  }, [
    scores,
    sceneId,
    chapterMax,
    partnerName,
    callYou,
    portraitFile,
    runSeed,
    replaySpice,
    epilogueThisRun,
  ]);

  const goTo = useCallback((id: string) => {
    if (!SCENES[id]) return;
    setSceneId(id);
  }, []);

  const applyChoice = useCallback((next: string, delta?: Partial<Scores>) => {
    if (!SCENES[next]) return;
    setScores((prev) => {
      const nextScores: Scores = { ...prev };
      if (delta) {
        (Object.keys(delta) as (keyof Scores)[]).forEach((k) => {
          const v = delta[k];
          if (typeof v === "number") nextScores[k] = Math.max(0, prev[k] + v);
        });
      }
      return nextScores;
    });
    setSceneId(next);
  }, []);

  const applyDelta = useCallback((delta?: Partial<Scores>) => {
    if (!delta || !Object.keys(delta).length) return;
    setScores((prev) => {
      const nextScores: Scores = { ...prev };
      (Object.keys(delta) as (keyof Scores)[]).forEach((k) => {
        const v = delta[k];
        if (typeof v === "number") nextScores[k] = Math.max(0, prev[k] + v);
      });
      return nextScores;
    });
  }, []);

  const commitSetup = useCallback((p: StoryProfile) => {
    const meta = loadMeta();
    const spice = meta.totalClears >= 1;
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    setPartnerName((p.partnerName ?? DEFAULT_PARTNER).trim() || DEFAULT_PARTNER);
    setCallYou((p.callYou ?? DEFAULT_CALL).trim() || DEFAULT_CALL);
    setPortraitFile((p.portraitFile ?? DEFAULT_PORTRAIT_FILE).trim() || DEFAULT_PORTRAIT_FILE);
    setRunSeed(seed);
    setReplaySpice(spice);
    setEpilogueThisRun(spice);
    setScores({ ...INITIAL_SCORES });
    setChapterMax(0);
    setSceneId("ch1_open");
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setScores({ ...INITIAL_SCORES });
    setSceneId(ENTRY_SCENE);
    setChapterMax(0);
    setPartnerName(DEFAULT_PARTNER);
    setCallYou(DEFAULT_CALL);
    setPortraitFile(DEFAULT_PORTRAIT_FILE);
    setRunSeed(0);
    setReplaySpice(false);
    setEpilogueThisRun(false);
  }, []);

  const archetype = useMemo(() => archetypeForPortrait(portraitFile), [portraitFile]);

  const personalityId = useMemo(
    () => resolvePersonality(scores, { replaySpice, runSeed }),
    [scores, replaySpice, runSeed],
  );

  const value = useMemo(
    () => ({
      sceneId,
      scores,
      chapterMax,
      partnerName,
      callYou,
      portraitFile,
      archetype,
      runSeed,
      replaySpice,
      epilogueThisRun,
      goTo,
      applyChoice,
      applyDelta,
      commitSetup,
      reset,
      personalityId,
    }),
    [
      sceneId,
      scores,
      chapterMax,
      partnerName,
      callYou,
      portraitFile,
      archetype,
      runSeed,
      replaySpice,
      epilogueThisRun,
      goTo,
      applyChoice,
      applyDelta,
      commitSetup,
      reset,
      personalityId,
    ],
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside GameProvider");
  return c;
}
