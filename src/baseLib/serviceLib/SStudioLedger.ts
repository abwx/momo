import type { SBondPair } from './type/SBondPair';
import type {
  SBondProjectKey,
  SFanProgramKey,
  SReportActionKey,
  SStudioClosure,
  SStudioLedger,
  SStudioLedgerKey,
} from './type/SStudioLedger';

const STUDIO_NAMES: Record<SStudioLedgerKey, string> = {
  fans: '粉盘物料',
  bonds: '双人花絮',
  report: '复盘处理',
};

export function SCreateStudioLedger(): SStudioLedger {
  return { spend: SCreateSpend(), fanPrograms: SCreateFanPrograms(), bondProjects: SCreateBondProjects(), reportActions: SCreateReportActions(), highlights: [] };
}

export function SResetStudioLedger(ledger: SStudioLedger) {
  Object.assign(ledger, SCreateStudioLedger());
}

export function SRecordFanProgram(ledger: SStudioLedger, type: SFanProgramKey, cost: number) {
  ledger.fanPrograms[type] += 1;
  SRecordSpend(ledger, 'fans', cost);
  SAddHighlight(ledger, `粉丝台：${SFanProgramName(type)}上线`);
}

export function SRecordBondProject(ledger: SStudioLedger, type: SBondProjectKey, cost: number, names: string) {
  ledger.bondProjects[type] += 1;
  SRecordSpend(ledger, 'bonds', cost);
  SAddHighlight(ledger, `羁绊台：${names} 完成${SBondProjectName(type)}`);
}

export function SRecordReportAction(ledger: SStudioLedger, type: SReportActionKey, cost: number) {
  ledger.reportActions[type] += 1;
  SRecordSpend(ledger, 'report', cost);
  SAddHighlight(ledger, `报告台：${SReportActionName(type)}执行`);
}

export function SGetStudioClosure(ledger: SStudioLedger, fanSummary: string, topBond: SBondPair | null): SStudioClosure[] {
  return [
    SBuildFanClosure(ledger, fanSummary),
    SBuildBondClosure(ledger, topBond),
    SBuildReportClosure(ledger),
  ];
}

function SCreateSpend(): Record<SStudioLedgerKey, number> {
  return { fans: 0, bonds: 0, report: 0 };
}

function SCreateFanPrograms(): Record<SFanProgramKey, number> {
  return { GROUP: 0, SOLO: 0, CP: 0, PUBLIC: 0, ANTI: 0 };
}

function SCreateBondProjects(): Record<SBondProjectKey, number> {
  return { STAGE: 0, LIVE: 0, VLOG: 0 };
}

function SCreateReportActions(): Record<SReportActionKey, number> {
  return { BALANCE: 0, CLEAN: 0 };
}

function SRecordSpend(ledger: SStudioLedger, key: SStudioLedgerKey, cost: number) {
  ledger.spend[key] += cost;
}

function SAddHighlight(ledger: SStudioLedger, text: string) {
  ledger.highlights = [text, ...ledger.highlights].slice(0, 6);
}

function SBuildFanClosure(ledger: SStudioLedger, fanSummary: string): SStudioClosure {
  const actions = SSumValues(ledger.fanPrograms);
  if (!actions) return SIdleClosure('fans');
  return SCreateClosure('fans', actions, ledger.spend.fans, fanSummary, `最高频 ${SFanProgramName(STopKey(ledger.fanPrograms))}`);
}

function SBuildBondClosure(ledger: SStudioLedger, topBond: SBondPair | null): SStudioClosure {
  const actions = SSumValues(ledger.bondProjects);
  if (!actions) return SIdleClosure('bonds');
  return SCreateClosure('bonds', actions, ledger.spend.bonds, topBond?.names || '未形成', `最高羁绊 ${topBond?.value || 0}`);
}

function SBuildReportClosure(ledger: SStudioLedger): SStudioClosure {
  const actions = SSumValues(ledger.reportActions);
  if (!actions) return SIdleClosure('report');
  return SCreateClosure('report', actions, ledger.spend.report, STopReportText(ledger), '用于修正成员断层和舆情风险');
}

function SCreateClosure(key: SStudioLedgerKey, actions: number, spend: number, result: string, detail: string): SStudioClosure {
  return { key, title: STUDIO_NAMES[key], actions, spend, result, detail };
}

function SIdleClosure(key: SStudioLedgerKey): SStudioClosure {
  return SCreateClosure(key, 0, 0, '尚未启用', '本局没有形成工作台记录');
}

function STopReportText(ledger: SStudioLedger) {
  return SReportActionName(STopKey(ledger.reportActions));
}

function STopKey<T extends string>(record: Record<T, number>) {
  return Object.entries(record).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0] as T;
}

function SSumValues(record: Record<string, number>) {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

function SFanProgramName(type: SFanProgramKey) {
  return { GROUP: '团建物料', SOLO: '单人直拍', CP: '双人花絮', PUBLIC: '路人切片', ANTI: '反黑联动' }[type];
}

function SBondProjectName(type: SBondProjectKey) {
  return { STAGE: '合作舞台', LIVE: '双人直播', VLOG: '宿舍 Vlog' }[type];
}

function SReportActionName(type: SReportActionKey) {
  return { BALANCE: '补短板会议', CLEAN: '舆情复盘' }[type];
}
