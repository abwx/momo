import type { Character } from '../../data/characters';
import type { ProgramEpisode } from '../../data/type/ProgramEpisode';
import type { EventHistoryItem } from '../../data/type/SettlementReport';
import type { SClassKey, SClassTrackState, SEpisodeClassResult } from './type/SClassTrack';
import type { SRecordingModeKey } from './type/SStudioLedger';

export const S_CLASS1_CAPACITY = 7;
const ASSESSMENT_RETENTION = 0.35;
const ASSESSMENT_BASELINE = 6;
const CLASS2_POPULARITY_MULTIPLIER = 0.85;
const CLASS2_CATCH_UP_MULTIPLIER = 1.15;

/** Creates the initial class roster from opening popularity. */
export function SCreateClassTrackState(characters: Character[], capacity = S_CLASS1_CAPACITY): SClassTrackState {
  return { capacityClass1: capacity, classById: SCreateClassById(characters, capacity), assessmentScore: SCreateScores(characters), episodeResults: [] };
}

export function SResetClassTrackState(state: SClassTrackState, characters: Character[], capacity = S_CLASS1_CAPACITY): void {
  Object.assign(state, SCreateClassTrackState(characters, capacity));
}

export function SAddAssessmentScores(state: SClassTrackState, deltas: Record<string, number>): void {
  Object.entries(deltas).forEach(([id, delta]) => SAddAssessmentScore(state, id, delta));
}

/** Carries only part of prior results forward and adds each episode's panel baseline. */
export function SApplyEpisodeAssessment(state: SClassTrackState, characters: Character[]): void {
  SRetainAssessmentScores(state);
  SAddAssessmentScores(state, SCreateEpisodeBaselineDeltas(state, characters));
}

export function SMergeAssessmentDeltas(...deltas: Record<string, number>[]): Record<string, number> {
  return deltas.reduce((merged, delta) => SMergeAssessmentDelta(merged, delta), {} as Record<string, number>);
}

export function SGetClassMultiplier(state: SClassTrackState, characterId: string): number {
  return state.classById[characterId] === 'CLASS2' ? CLASS2_POPULARITY_MULTIPLIER : 1;
}

export function SCreateEventAssessmentDeltas(state: SClassTrackState, popularity: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(popularity).map(([id, delta]) => [id, SGetAssessmentDelta(state, id, delta)]));
}

export function SCreateClassPopularityDeltas(state: SClassTrackState, popularity: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(popularity).map(([id, delta]) => [id, SGetClassPopularityDelta(state, id, delta)]));
}

export function SCreateRecordingAssessmentDeltas(state: SClassTrackState, characters: Character[], average: number, mode: SRecordingModeKey, focusId: string, intensity: number): Record<string, number> {
  if (mode === 'BALANCE') return SCreateClassDeltas(state, characters.filter(character => character.popularity < average).map(character => character.id), Math.max(1, intensity - 1));
  return SCreateClassDeltas(state, [focusId], intensity + (mode === 'DRAMA' ? 1 : 0));
}

export function SCreatePairAssessmentDeltas(state: SClassTrackState, ids: string[], intensity: number): Record<string, number> {
  return SCreateClassDeltas(state, ids, intensity);
}

export function SCreateBiasAssessmentDeltas(state: SClassTrackState, biasId: string, intensity: number): Record<string, number> {
  return SCreateClassDeltas(state, [biasId], intensity);
}

export function SCreateFinaleAssessmentDeltas(_state: SClassTrackState, biasId: string, biasPressure: number, hasFinaleAudit: boolean): Record<string, number> {
  if (!hasFinaleAudit) return {};
  return { [biasId]: SGetFinaleAssessmentDelta(biasPressure) };
}

/** Returns the final-audit assessment shift at the current projected pressure. */
export function SGetFinaleAssessmentDelta(biasPressure: number): number {
  return 8 - (3 + Math.ceil(biasPressure * 0.75));
}

export function SReshuffleClasses(state: SClassTrackState, episodeId: string, biasId: string): SEpisodeClassResult {
  const rankedIds = SGetRankedIds(state);
  const result = SCreateEpisodeResult(state, episodeId, biasId, rankedIds);
  SApplyClasses(state, rankedIds);
  state.episodeResults.push(result);
  return result;
}

export function SIsBiasInClass1(state: SClassTrackState, biasId: string): boolean {
  return state.classById[biasId] === 'CLASS1';
}

/** Returns a member's current score and distance from the Class 1 cutoff. */
export function SGetAssessmentStanding(state: SClassTrackState, characterId: string) {
  const rankedIds = SGetRankedIds(state);
  const score = state.assessmentScore[characterId] || 0;
  const rank = Math.max(0, rankedIds.indexOf(characterId)) + 1;
  const cutoffScore = state.assessmentScore[rankedIds[state.capacityClass1 - 1]] || 0;
  return { score, rank, cutoffScore, distanceToClass1: score - cutoffScore };
}

export function SGetClassRoster(state: SClassTrackState, characters: Character[]): Record<SClassKey, Character[]> {
  return { CLASS1: characters.filter(character => state.classById[character.id] === 'CLASS1'), CLASS2: characters.filter(character => state.classById[character.id] === 'CLASS2') };
}

export function SGetJustCompletedEpisode(program: ProgramEpisode[], history: EventHistoryItem[], results: SEpisodeClassResult[]): ProgramEpisode | null {
  return program.find(episode => SIsEpisodeComplete(episode, history) && !results.some(result => result.episodeId === episode.id)) || null;
}

/** Returns the episode whose fixed nodes are done and whose state branch is still pending. */
export function SGetEpisodeAwaitingBranch(program: ProgramEpisode[], history: EventHistoryItem[], results: SEpisodeClassResult[]): ProgramEpisode | null {
  return program.find(episode => SAreFixedEpisodeNodesComplete(episode, history) && !SHasEpisodeBranch(episode, history) && !results.some(result => result.episodeId === episode.id)) || null;
}

function SCreateClassById(characters: Character[], capacity: number): Record<string, SClassKey> {
  return Object.fromEntries(SGetOpeningOrder(characters).map((character, index) => [character.id, index < capacity ? 'CLASS1' : 'CLASS2']));
}

function SCreateScores(characters: Character[]): Record<string, number> {
  return Object.fromEntries(characters.map(character => [character.id, Math.round(character.popularity / 10)]));
}

function SRetainAssessmentScores(state: SClassTrackState): void {
  Object.keys(state.assessmentScore).forEach(id => state.assessmentScore[id] = Math.round(state.assessmentScore[id] * ASSESSMENT_RETENTION));
}

function SCreateEpisodeBaselineDeltas(state: SClassTrackState, characters: Character[]): Record<string, number> {
  const average = characters.reduce((total, character) => total + character.popularity, 0) / Math.max(characters.length, 1);
  return Object.fromEntries(characters.map(character => [character.id, SGetEpisodeBaseline(state, character, average)]));
}

function SGetEpisodeBaseline(state: SClassTrackState, character: Character, average: number): number {
  const performance = Math.max(2, ASSESSMENT_BASELINE + Math.round((character.popularity - average) / 10));
  return performance + (state.classById[character.id] === 'CLASS2' ? 2 : 0);
}

function SGetOpeningOrder(characters: Character[]): Character[] {
  return [...characters].sort((left, right) => right.popularity - left.popularity || left.id.localeCompare(right.id));
}

function SAddAssessmentScore(state: SClassTrackState, id: string, delta: number): void {
  if (!(id in state.assessmentScore)) return;
  state.assessmentScore[id] = Math.max(0, state.assessmentScore[id] + Math.round(delta));
}

function SCreateClassDeltas(state: SClassTrackState, ids: string[], value: number): Record<string, number> {
  return Object.fromEntries(ids.map(id => [id, SGetCompetitiveScoreDelta(state, id, value)]));
}

function SGetAssessmentDelta(state: SClassTrackState, id: string, popularityDelta: number): number {
  if (popularityDelta <= 0) return 0;
  return SGetCompetitiveScoreDelta(state, id, Math.min(4, Math.ceil(popularityDelta * 0.22)));
}

/** Keeps the leading score from snowballing while preserving a catch-up route. */
function SGetCompetitiveScoreDelta(state: SClassTrackState, id: string, value: number): number {
  return Math.max(1, Math.round(value * SGetCompetitiveGainMultiplier(state, id)));
}

function SGetCompetitiveGainMultiplier(state: SClassTrackState, id: string): number {
  if (state.classById[id] === 'CLASS2') return CLASS2_CATCH_UP_MULTIPLIER;
  const lead = (state.assessmentScore[id] || 0) - SGetAssessmentStanding(state, id).cutoffScore;
  return lead >= 16 ? 0.45 : lead >= 8 ? 0.65 : 1;
}

function SMergeAssessmentDelta(merged: Record<string, number>, delta: Record<string, number>): Record<string, number> {
  Object.entries(delta).forEach(([id, value]) => merged[id] = (merged[id] || 0) + value);
  return merged;
}

function SGetClassPopularityDelta(state: SClassTrackState, id: string, delta: number): number {
  return delta > 0 ? Number((delta * SGetClassMultiplier(state, id)).toFixed(2)) : delta;
}

function SGetRankedIds(state: SClassTrackState): string[] {
  return Object.keys(state.assessmentScore).sort((left, right) => state.assessmentScore[right] - state.assessmentScore[left] || left.localeCompare(right));
}

function SCreateEpisodeResult(state: SClassTrackState, episodeId: string, biasId: string, rankedIds: string[]): SEpisodeClassResult {
  const nextClass1 = new Set(rankedIds.slice(0, state.capacityClass1));
  return { episodeId, rankedIds, promotedIds: SGetClassChanges(state, nextClass1, 'CLASS2'), demotedIds: SGetClassChanges(state, nextClass1, 'CLASS1'), biasClass: nextClass1.has(biasId) ? 'CLASS1' : 'CLASS2' };
}

function SGetClassChanges(state: SClassTrackState, nextClass1: Set<string>, previousClass: SClassKey): string[] {
  return Object.keys(state.classById).filter(id => state.classById[id] === previousClass && nextClass1.has(id) === (previousClass === 'CLASS2'));
}

function SApplyClasses(state: SClassTrackState, rankedIds: string[]): void {
  state.classById = Object.fromEntries(rankedIds.map((id, index) => [id, index < state.capacityClass1 ? 'CLASS1' : 'CLASS2']));
}

function SIsEpisodeComplete(episode: ProgramEpisode, history: EventHistoryItem[]): boolean {
  return SAreFixedEpisodeNodesComplete(episode, history) && SHasEpisodeBranch(episode, history);
}

function SAreFixedEpisodeNodesComplete(episode: ProgramEpisode, history: EventHistoryItem[]): boolean {
  return episode.eventIds.every(eventId => history.some(item => item.event.id === eventId));
}

function SHasEpisodeBranch(episode: ProgramEpisode, history: EventHistoryItem[]): boolean {
  return episode.branchEventIds.some(eventId => history.some(item => item.event.id === eventId));
}
