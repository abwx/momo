export type CharacterPersonality =
  | '全能担当'
  | '松弛贵气'
  | '快乐担'
  | '情商担当'
  | '舞担感'
  | '少年门面'
  | '综艺感'
  | '成长势'
  | '多面少年';

export interface Character {
  id: string;
  name: string;
  image: string;
  personality: CharacterPersonality;
  popularity: number;
  description: string;
}

export const characters: Character[] = [
  { id: 'guan-junchen', name: '官俊臣', image: '/images/optimized/guan-junchen.webp', personality: '多面少年', popularity: 75, description: '体育生底子，舞台外还有好多面等你发现。' },
  { id: 'zuo-qihan', name: '左奇函', image: '/images/optimized/zuo-qihan.webp', personality: '情商担当', popularity: 78, description: '团里的气氛润滑剂，舞台感也在一点点发光。' },
  { id: 'zhang-hanrui', name: '张函瑞', image: '/images/optimized/zhang-hanrui.webp', personality: '全能担当', popularity: 80, description: '主唱位的声音很亮，高光和成长都让人想守护。' },
  { id: 'zhang-yiran', name: '张奕然', image: '/images/optimized/zhang-yiran.webp', personality: '成长势', popularity: 76, description: '闷头努力型，下一秒惊喜留给认真看他的人。' },
  { id: 'zhang-guiyuan', name: '张桂源', image: '/images/optimized/zhang-guiyuan.webp', personality: '全能担当', popularity: 82, description: '稳稳的队长相，温柔里带着把舞台扛起来的力量。' },
  { id: 'li-yudong', name: '李煜东', image: '/images/optimized/li-yudong.webp', personality: '少年门面', popularity: 77, description: '一眼就被记住的少年感，未来还有很长很长。' },
  { id: 'yang-bowen', name: '杨博文', image: '/images/optimized/yang-bowen.webp', personality: '舞担感', popularity: 79, description: '舞感干净又有劲，一上场气场就自己站好了。' },
  { id: 'yang-hanbo', name: '杨涵博', image: '/images/optimized/yang-hanbo.webp', personality: '松弛贵气', popularity: 75, description: '气质松又贵，镜头里像自带滤镜的少年。' },
  { id: 'wang-lujie', name: '王橹杰', image: '/images/optimized/wang-lujie.webp', personality: '快乐担', popularity: 78, description: '团里的快乐按钮，看他笑你也会跟着亮起来。' },
  { id: 'wang-shuoran', name: '王烁然', image: '/images/optimized/wang-shuoran.webp', personality: '成长势', popularity: 74, description: '低调发光型，认真追下去会看到他一点点长大。' },
  { id: 'nie-weichen', name: '聂玮辰', image: '/images/optimized/nie-weichen.webp', personality: '多面少年', popularity: 73, description: '安静里藏着光，舞台风格还在温柔展开。' },
  { id: 'chen-junming', name: '陈浚铭', image: '/images/optimized/chen-junming.webp', personality: '成长势', popularity: 76, description: '内敛但有劲，越看越想把票投给他。' },
  { id: 'chen-yiheng', name: '陈奕恒', image: '/images/optimized/chen-yiheng.webp', personality: '综艺感', popularity: 80, description: '综艺体质拉满，镜头一给就会自己出花活。' },
  { id: 'chen-sihan', name: '陈思罕', image: '/images/optimized/chen-sihan.webp', personality: '成长势', popularity: 74, description: '安静努力派，值得被慢慢看见的那种光。' },
  { id: 'wei-zichen', name: '魏子宸', image: '/images/optimized/wei-zichen.webp', personality: '多面少年', popularity: 72, description: '外表安静，心里有一股稳稳的劲。' },
];
