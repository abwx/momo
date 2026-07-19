export interface Character {
  id: string;
  name: string;
  image: string;
  personality: 'ACE候补' | '佛系贵公子' | '喜剧人' | '高情商' | '内秀舞担' | '懵懂门面' | '话题中心' | '潜力新星' | '探索者';
  popularity: number; // 初始人气
  description: string; // 一句话人设
}

// 数据基于公开粉丝讨论和综艺表现，仅供娱乐
// 为了游戏公平性，初始人气调整为较为接近的状态，后期靠制作人运营拉开差距
export const characters: Character[] = [
  { id: 'guan-junchen', name: '官俊臣', image: '/images/官俊臣.png', personality: '探索者', popularity: 75, description: '体育生出身，正在探索偶像之外的更多可能性。' },
  { id: 'zuo-qihan', name: '左奇函', image: '/images/左奇函.png', personality: '高情商', popularity: 78, description: '团队的气氛担当，舞台表现力正在快速进步中。' },
  { id: 'zhang-hanrui', name: '张函瑞', image: '/images/张函瑞.png', personality: 'ACE候补', popularity: 80, description: '天赋型大主唱，正在经历变声期的挑战，偶尔会有些小情绪。' },
  { id: 'zhang-yiran', name: '张奕然', image: '/images/张奕然.png', personality: '潜力新星', popularity: 76, description: '低调努力的潜力股，准备惊艳所有人。' },
  { id: 'zhang-guiyuan', name: '张桂源', image: '/images/张桂源.png', personality: 'ACE候补', popularity: 82, description: '公认的TOP，有队长相，性格温柔是他的秘密武器。' },
  { id: 'li-yudong', name: '李煜东', image: '/images/李煜东.png', personality: '懵懂门面', popularity: 77, description: '颜值出众的懵懂少年，未来的潜力无可限量。' },
  { id: 'yang-bowen', name: '杨博文', image: '/images/杨博文.png', personality: '内秀舞担', popularity: 79, description: '实力顶尖的内秀舞担，他的魅力在舞台上绽放。' },
  { id: 'yang-hanbo', name: '杨涵博', image: '/images/杨涵博.png', personality: '佛系贵公子', popularity: 75, description: '气质独特的贵公子，拥有演员般的镜头感。' },
  { id: 'wang-lujie', name: '王橹杰', personality: '喜剧人', image: '/images/王橹杰.png', popularity: 78, description: '行走的快乐源泉，独具魅力的舞台喜剧人。' },
  { id: 'wang-shuoran', name: '王烁然', image: '/images/王烁然.png', personality: '潜力新星', popularity: 74, description: '低调努力的潜力股，准备惊艳所有人。' },
  { id: 'nie-weichen', name: '聂玮辰', image: '/images/聂玮辰.png', personality: '探索者', popularity: 73, description: '家境优越的阳光男孩，正在寻找自己独特的舞台风格。' },
  { id: 'chen-junming', name: '陈浚铭', image: '/images/陈浚铭.png', personality: '潜力新星', popularity: 76, description: '人气不错的忙内担当，未来可期。' },
  { id: 'chen-yiheng', name: '陈奕恒', image: '/images/陈奕恒.png', personality: '话题中心', popularity: 80, description: '综艺感极强，话题与热度并存，是天生的镜头焦点。' },
  { id: 'chen-sihan', name: '陈思罕', image: '/images/陈思罕.png', personality: '潜力新星', popularity: 74, description: '低调努力的潜力股，准备惊艳所有人。' },
  { id: 'wei-zichen', name: '魏子宸', image: '/images/魏子宸.png', personality: '探索者', popularity: 72, description: '安静内敛的少年，拥有不为人知的坚定内心。' },
];
