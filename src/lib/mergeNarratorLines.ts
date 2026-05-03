import type { VnSpeaker } from "@/types/game";

export type VnLine = { speaker: VnSpeaker; text: string };

/** 连续「旁白」合并为一段，减少连点 */
export function mergeNarratorLines(lines: VnLine[]): VnLine[] {
  const out: VnLine[] = [];
  for (const L of lines) {
    const last = out[out.length - 1];
    if (L.speaker === "narrator" && last?.speaker === "narrator") {
      last.text = `${last.text}\n\n${L.text}`;
    } else {
      out.push({ ...L });
    }
  }
  return out;
}
