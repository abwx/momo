/** UI pages for the recording shell. Ledger spend still uses SStudioLedgerKey only. */
export type StudioViewKey = 'event' | 'goals' | 'recording' | 'fans' | 'bonds' | 'report';

export function SIsLedgerStudioPage(page: StudioViewKey): page is 'recording' | 'fans' | 'bonds' | 'report' {
  return page === 'recording' || page === 'fans' || page === 'bonds' || page === 'report';
}

export function SNormalizeStudioView(page: string | undefined): StudioViewKey {
  if (page === 'event' || page === 'goals' || page === 'recording' || page === 'fans' || page === 'bonds' || page === 'report') {
    return page;
  }
  return 'event';
}
