import type { QTEScenario } from './type/QTEScenario';

export const qteScenarios: QTEScenario[] = [
  {
    title: '设备故障',
    desc: '舞台音响突然刺耳，连续点击屏幕完成应急调音。',
    type: 'MASH',
    icon: 'EQ',
    successText: '调整成功，音效恢复稳定，全员人气 +5',
    failText: '调整失败，观众被噪音影响，全员人气 -3',
  },
  {
    title: '气氛降至冰点',
    desc: '现场提问太尴尬，长按屏幕指挥后期救场。',
    type: 'HOLD',
    icon: 'CUT',
    successText: '救场成功，剪辑节奏拉回来了，全员人气 +5',
    failText: '救场失败，场面一度沉默，全员人气 -3',
  },
  {
    title: '粉丝冲撞',
    desc: '录制现场秩序混乱，连续点击协助安保疏散。',
    type: 'MASH',
    icon: 'SEC',
    successText: '疏散成功，录制安全推进，全员人气 +5',
    failText: '疏散失败，录制被迫中断，全员人气 -3',
  },
  {
    title: '麦克风失灵',
    desc: '主唱麦克风没声了，长按屏幕切换备用麦。',
    type: 'HOLD',
    icon: 'MIC',
    successText: '切换成功，临场反应漂亮，全员人气 +5',
    failText: '切换失败，舞台出现长时间空白，全员人气 -3',
  },
  {
    title: '捕捉高光',
    desc: '绝佳互动镜头出现，在指针进入中心区时点击捕捉。',
    type: 'TIMING',
    icon: 'CAM',
    successText: '捕捉成功，高光镜头出圈，全员人气 +8',
    failText: '错过高光，镜头价值下降，全员人气 -2',
  },
];
