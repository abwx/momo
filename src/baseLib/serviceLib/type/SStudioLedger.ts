export type SStudioLedgerKey = 'fans' | 'bonds' | 'report';

export type SFanProgramKey = 'GROUP' | 'SOLO' | 'CP' | 'PUBLIC' | 'ANTI';

export type SBondProjectKey = 'STAGE' | 'LIVE' | 'VLOG';

export type SReportActionKey = 'BALANCE' | 'CLEAN';

export interface SStudioLedger {
  spend: Record<SStudioLedgerKey, number>;
  fanPrograms: Record<SFanProgramKey, number>;
  bondProjects: Record<SBondProjectKey, number>;
  reportActions: Record<SReportActionKey, number>;
  highlights: string[];
}

export interface SStudioClosure {
  key: SStudioLedgerKey;
  title: string;
  actions: number;
  spend: number;
  result: string;
  detail: string;
}
