import type { ForestCase, HearingItem, PriorityLevel } from '../types/case';

export type DeadlineType = 
  | 'INVESTIGATION_EXPIRY'      // 60-day or 90-day statutory charge sheet filing limit under Sec 167 CrPC
  | 'CUSTODY_REMAND_EXPIRY'     // 14-day or 30-day judicial remand renewal deadline
  | 'APPEAL_LIMITATION'         // 30-day/60-day limitation to file High Court / Sessions Revision or Appeal
  | 'COURT_HEARING';            // Listed court hearing / summons date

export interface StatutoryDeadlineItem {
  id: string;
  type: DeadlineType;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  dueDate: string;              // YYYY-MM-DD
  dueTime?: string;
  priority: PriorityLevel;
  title: string;
  description: string;
  statutoryReference: string;   // e.g. "Sec 167(2) CrPC & Forest Manual"
  actionUrl: string;
  actionLabel: string;
}

/**
 * Computes all statutory deadlines and expiring investigation periods from the active cases and hearings.
 */
export function getStatutoryDeadlines(cases: ForestCase[], hearings: HearingItem[]): StatutoryDeadlineItem[] {
  const items: StatutoryDeadlineItem[] = [];

  cases.forEach(c => {
    // 1. Limitation Deadline for Appeals / High Court Revision
    if (c.judgment && !c.judgment.appealFiled && c.judgment.appealDeadline) {
      items.push({
        id: `limitation-${c.id}`,
        type: 'APPEAL_LIMITATION',
        caseId: c.id,
        caseNumber: c.caseNumber,
        caseTitle: c.title,
        dueDate: c.judgment.appealDeadline,
        priority: 'CRITICAL',
        title: 'High Court Revision Limitation Expiring',
        description: `Statutory 30-day appeal/revision window expires on ${c.judgment.appealDeadline}. Revision petition for enhancement of sentence must be filed before the High Court.`,
        statutoryReference: 'Sec 397/401 CrPC & Sec 51 Wildlife Protection Act',
        actionUrl: `/cases/${c.id}?tab=judgment`,
        actionLabel: 'Review Judgment & File Revision'
      });
    }

    // 2. Expiring Investigation Periods & Remand Deadlines
    if (c.status === 'UNDER_INVESTIGATION' || c.status === 'FIR_REGISTERED') {
      const caseRegDate = new Date(c.date);
      
      // Compute 60-day statutory charge sheet filing limit
      const sixtyDayLimit = new Date(caseRegDate);
      sixtyDayLimit.setDate(sixtyDayLimit.getDate() + 60);
      const sixtyDayStr = sixtyDayLimit.toISOString().split('T')[0];

      items.push({
        id: `inv-60d-${c.id}`,
        type: 'INVESTIGATION_EXPIRY',
        caseId: c.id,
        caseNumber: c.caseNumber,
        caseTitle: c.title,
        dueDate: sixtyDayStr,
        priority: c.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        title: 'Statutory 60-Day Investigation Remand Expiry',
        description: `Final Offence Report (Charge Sheet) must be vetted and signed via DSC before ${sixtyDayStr} to prevent default bail under Section 167(2) CrPC.`,
        statutoryReference: 'Sec 167(2) CrPC & MP/CG Forest Manual Para 42',
        actionUrl: `/cases/${c.id}?tab=chargesheet`,
        actionLabel: 'Sign & File Charge Sheet'
      });

      // If accused are in Judicial Custody, also check 14/30-day custody remand review
      const hasAccusedInCustody = c.accused.some(a => a.status === 'Judicial Custody');
      if (hasAccusedInCustody) {
        const custodyReviewDate = new Date(caseRegDate);
        custodyReviewDate.setDate(custodyReviewDate.getDate() + 14);
        const custodyStr = custodyReviewDate.toISOString().split('T')[0];

        items.push({
          id: `custody-${c.id}`,
          type: 'CUSTODY_REMAND_EXPIRY',
          caseId: c.id,
          caseNumber: c.caseNumber,
          caseTitle: c.title,
          dueDate: custodyStr,
          priority: 'HIGH',
          title: 'Accused Judicial Remand Renewal Due',
          description: `Custody period of accused requires formal remand extension application before the Chief Judicial Magistrate.`,
          statutoryReference: 'Sec 167(2) CrPC',
          actionUrl: `/cases/${c.id}?tab=investigation`,
          actionLabel: 'View Remand Record'
        });
      }
    }
  });

  // 3. Court Hearings
  hearings.forEach(h => {
    if (h.status === 'Scheduled') {
      items.push({
        id: `hearing-${h.id}`,
        type: 'COURT_HEARING',
        caseId: h.caseId,
        caseNumber: h.caseNumber,
        caseTitle: h.purpose,
        dueDate: h.hearingDate,
        dueTime: h.time,
        priority: h.priority,
        title: `Court Hearing: ${h.stage}`,
        description: `${h.purpose} listed at ${h.court} before ${h.judge}.`,
        statutoryReference: `Court Bench: ${h.court}`,
        actionUrl: `/cases/${h.caseId}?tab=hearings`,
        actionLabel: 'Open Case Dossier'
      });
    }
  });

  // Sort chronologically by due date
  items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return items;
}
