import { describe, expect, it } from 'vitest';
import { SCreateStudioLedger, SGetStudioClosure, SRecordBondProject, SRecordFanProgram } from './SStudioLedger';

describe('SStudioLedger', () => {
  it('carries fan and bond work into the recap ledger', () => {
    const ledger = SCreateStudioLedger();
    SRecordFanProgram(ledger, 'SOLO', 24000);
    SRecordBondProject(ledger, 'STAGE', 30000, 'A × B');

    const closure = SGetStudioClosure(ledger, 'solo momentum', { key: 'a-b', names: 'A × B', value: 36 });

    expect(ledger.fanPrograms.SOLO).toBe(1);
    expect(ledger.bondProjects.STAGE).toBe(1);
    expect(closure).toContainEqual(expect.objectContaining({ key: 'fans', actions: 1, spend: 24000, result: 'solo momentum' }));
    expect(closure).toContainEqual(expect.objectContaining({ key: 'bonds', actions: 1, spend: 30000, result: 'A × B' }));
  });
});
