export type SStudioLedgerKey = 'recording' | 'fans' | 'bonds' | 'report';

export type SRecordingModeKey = 'BALANCE' | 'FOCUS' | 'DRAMA';

export type SFanProgramKey = 'GROUP' | 'SOLO' | 'CP' | 'PUBLIC' | 'ANTI';

export type SBondProjectKey = 'STAGE' | 'LIVE' | 'VLOG';

export type SReportActionKey = 'BALANCE' | 'TOP' | 'CLEAN';

export interface SStudioLedger {
  spend: Record<SStudioLedgerKey, number>;
  recordingModes: Record<SRecordingModeKey, number>;
  fanPrograms: Record<SFanProgramKey, number>;
  bondProjects: Record<SBondProjectKey, number>;
  reportActions: Record<SReportActionKey, number>;
  cardUses: number;
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
