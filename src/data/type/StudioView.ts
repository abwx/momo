/** UI pages for the game studio. Ledger spending still uses SStudioLedgerKey only. */
export type StudioViewKey = 'event' | 'fans';

export function SNormalizeStudioView(page: string | undefined): StudioViewKey {
  if (page === 'bonds') return 'fans';
  if (page === 'event' || page === 'fans') {
    return page;
  }
  return 'event';
}
