import type { Character } from '../data/characters';
import type { SBondPair } from '../baseLib/serviceLib/type/SBondPair';
import type { SFanFactionState } from '../baseLib/serviceLib/type/SFanFactionState';
import type { SSeasonRecap } from '../baseLib/serviceLib/type/SSeasonRecap';

interface SharePosterOptions {
  title: string;
  grade: string;
  topCharacters: Character[];
  factions: SFanFactionState;
  recap: SSeasonRecap;
  topBond: SBondPair | null;
  biasName: string;
  biasBreakthrough: boolean;
  finalClassLabel: string;
}

/** Exports the final season report as a shareable image. */
export function downloadSharePoster(options: SharePosterOptions) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext('2d');
  if (!context) return;
  drawPoster(context, options);
  triggerDownload(canvas);
}

function triggerDownload(canvas: HTMLCanvasElement) {
  const link = document.createElement('a');
  link.download = `momo-report-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawPoster(context: CanvasRenderingContext2D, options: SharePosterOptions) {
  const gradient = context.createLinearGradient(0, 0, 1080, 1440);
  gradient.addColorStop(0, '#16113f');
  gradient.addColorStop(0.55, '#24183f');
  gradient.addColorStop(1, '#090b18');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1440);
  drawPosterText(context, options);
}

function drawPosterText(context: CanvasRenderingContext2D, options: SharePosterOptions) {
  context.fillStyle = '#ffffff';
  context.font = '800 48px sans-serif';
  context.fillText('突围模拟器', 88, 120);
  context.font = '900 78px sans-serif';
  context.fillText(options.title, 88, 220);
  context.fillStyle = '#ffcf66';
  context.font = '800 54px sans-serif';
  context.fillText(`本季评级 ${options.grade}`, 88, 310);
  drawPosterBias(context, options);
  drawPosterVerdict(context, options.recap);
  drawPosterRanking(context, options.topCharacters);
  drawPosterFactions(context, options.factions, options.topBond);
}

function drawPosterBias(context: CanvasRenderingContext2D, options: SharePosterOptions) {
  context.fillStyle = '#ffcf66';
  context.font = '800 32px sans-serif';
  context.fillText('本命最终席位', 88, 390);
  context.fillStyle = '#ffffff';
  context.font = '800 44px sans-serif';
  const outcome = options.biasBreakthrough ? '突围成功，留在一班' : `暂留${options.finalClassLabel}，下季再战`;
  context.fillText(`${options.biasName} ${outcome}`, 88, 450);
}

function drawPosterVerdict(context: CanvasRenderingContext2D, recap: SSeasonRecap) {
  context.fillStyle = '#ffffff';
  context.font = '800 46px sans-serif';
  context.fillText(`我走了${recap.route.title}`, 88, 535);
  context.font = '700 38px sans-serif';
  context.fillText(`留下${recap.gain.title}，也承担${recap.cost.title}`, 88, 595);
}

function drawPosterRanking(context: CanvasRenderingContext2D, characters: Character[]) {
  context.fillStyle = '#cbd5e1';
  context.font = '700 36px sans-serif';
  context.fillText('我捧出的最终 TOP 3', 88, 690);
  characters.slice(0, 3).forEach((character, index) => drawRankLine(context, character, index));
}

function drawRankLine(context: CanvasRenderingContext2D, character: Character, index: number) {
  const y = 780 + index * 92;
  context.fillStyle = index === 0 ? '#ff9a9e' : '#ffffff';
  context.font = '800 54px sans-serif';
  context.fillText(`${index + 1}. ${character.name}`, 108, y);
  context.fillStyle = '#94a3b8';
  context.font = '600 30px sans-serif';
  context.fillText(`人气 ${character.popularity}`, 780, y);
}

function drawPosterFactions(context: CanvasRenderingContext2D, factions: SFanFactionState, topBond: SBondPair | null) {
  context.fillStyle = '#cbd5e1';
  context.font = '700 36px sans-serif';
  context.fillText('粉丝生态', 88, 1080);
  context.font = '700 34px sans-serif';
  context.fillText(`团粉 ${factions.groupFans} / 唯粉 ${factions.soloFans} / CP ${factions.cpFans}`, 108, 1160);
  context.fillText(`路人 ${factions.publicFans} / 黑粉声量 ${factions.antiFans}`, 108, 1220);
  drawPosterFooter(context, topBond);
}

function drawPosterFooter(context: CanvasRenderingContext2D, topBond: SBondPair | null) {
  context.fillStyle = '#ffffff';
  context.font = '800 42px sans-serif';
  context.fillText(`最强羁绊：${topBond?.names || '尚未形成'}`, 108, 1300);
  context.fillStyle = '#64748b';
  context.font = '600 28px sans-serif';
  context.fillText('突围模拟器 / 数据仅供娱乐', 88, 1380);
}
