export type CharacterPersonality =
  | 'ACE候补'
  | '佛系贵公子'
  | '喜剧人'
  | '高情商'
  | '内秀舞担'
  | '懵懂门面'
  | '话题中心'
  | '潜力新星'
  | '探索者';

export interface Character {
  id: string;
  name: string;
  image: string;
  personality: CharacterPersonality;
  popularity: number;
  description: string;
}

export const characters: Character[] = [
  { id: 'guan-junchen', name: '官俊臣', image: '/images/optimized/guan-junchen.webp', personality: '探索者', popularity: 75, description: '体育生出身，正在探索偶像之外的更多可能性。' },
  { id: 'zuo-qihan', name: '左奇函', image: '/images/optimized/zuo-qihan.webp', personality: '高情商', popularity: 78, description: '团队的气氛担当，舞台表现力正在快速进步中。' },
  { id: 'zhang-hanrui', name: '张函瑞', image: '/images/optimized/zhang-hanrui.webp', personality: 'ACE候补', popularity: 80, description: '天赋型大主唱，正在经历成长里的挑战与高光。' },
  { id: 'zhang-yiran', name: '张奕然', image: '/images/optimized/zhang-yiran.webp', personality: '潜力新星', popularity: 76, description: '低调努力的潜力股，准备惊艳所有人。' },
  { id: 'zhang-guiyuan', name: '张桂源', image: '/images/optimized/zhang-guiyuan.webp', personality: 'ACE候补', popularity: 82, description: '公认的TOP，兼具队长相与温柔性格。' },
  { id: 'li-yudong', name: '李煜东', image: '/images/optimized/li-yudong.webp', personality: '懵懂门面', popularity: 77, description: '颜值出众的懵懂少年，未来的潜力无可限量。' },
  { id: 'yang-bowen', name: '杨博文', image: '/images/optimized/yang-bowen.webp', personality: '内秀舞担', popularity: 79, description: '实力顶尖的内秀舞担，魅力在舞台上绽放。' },
  { id: 'yang-hanbo', name: '杨涵博', image: '/images/optimized/yang-hanbo.webp', personality: '佛系贵公子', popularity: 75, description: '气质独特的贵公子，拥有演员般的镜头感。' },
  { id: 'wang-lujie', name: '王橹杰', image: '/images/optimized/wang-lujie.webp', personality: '喜剧人', popularity: 78, description: '行走的快乐源泉，独具魅力的舞台喜剧人。' },
  { id: 'wang-shuoran', name: '王烁然', image: '/images/optimized/wang-shuoran.webp', personality: '潜力新星', popularity: 74, description: '低调努力的潜力股，准备惊艳所有人。' },
  { id: 'nie-weichen', name: '聂玮辰', image: '/images/optimized/nie-weichen.webp', personality: '探索者', popularity: 73, description: '安静阳光的少年，正在寻找独特的舞台风格。' },
  { id: 'chen-junming', name: '陈浚铭', image: '/images/optimized/chen-junming.webp', personality: '潜力新星', popularity: 76, description: '人气不错的内敛担当，未来可期。' },
  { id: 'chen-yiheng', name: '陈奕恒', image: '/images/optimized/chen-yiheng.webp', personality: '话题中心', popularity: 80, description: '综艺感强，话题与热度并存，是天生的镜头焦点。' },
  { id: 'chen-sihan', name: '陈思罕', image: '/images/optimized/chen-sihan.webp', personality: '潜力新星', popularity: 74, description: '低调努力的潜力股，准备惊艳所有人。' },
  { id: 'wei-zichen', name: '魏子宸', image: '/images/optimized/wei-zichen.webp', personality: '探索者', popularity: 72, description: '安静内敛的少年，拥有不为人知的坚定内心。' },
];
