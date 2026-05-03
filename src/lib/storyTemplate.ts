export type StoryCtx = {
  partnerName: string;
  /** 对方平时怎么喊你 */
  callYou: string;
};

/** 剧情文案占位：{{对方}} {{称呼}} */
export function fillStoryTemplate(text: string, ctx: StoryCtx): string {
  return text.replaceAll("{{对方}}", ctx.partnerName).replaceAll("{{称呼}}", ctx.callYou);
}
