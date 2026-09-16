export type CaseStatus = 
  | 'FIR_REGISTERED'
  | 'UNDER_INVESTIGATION'
  | 'CHARGESHEET_FILED'
  | 'TRIAL'
  | 'JUDGMENT_DELIVERED'
  | 'APPEAL_FILED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type OffenceType = 
  | 'Illegal Cutting'
  | 'Poaching'
  | 'Encroachment'
  | 'Wildlife Trade'
  | 'Illegal Mining'
  | 'Forest Fire Arson';

export interface AccusedPerson {
  id: string;
  name: string;
  age: number;
  fatherName: string;
  village: string;
  status: 'Judicial Custody' | 'Released on Bail' | 'Absconding' | 'Under Interrogation';
  idProof: string;
}

export interface SeizedItem {
  id: string;
  item: string;
  category: 'Timber' | 'Vehicle' | 'Tool/Weapon' | 'Wildlife Trophy' | 'Mineral';
  quantity: string;
  estimatedValue: string;
  malkhanaLocation: string;
  status: 'In Range Malkhana' | 'Forest Depot' | 'Produced in Court';
}

export interface InvestigationLog {
  id: string;
  action: string;
  date: string;
  officer: string;
  description: string;
  evidenceCount: number;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'Panchnama Memo' | 'Site Photo' | 'Forensic Report' | 'Seizure Memo' | 'Witness Statement';
  date: string;
  size: string;
  status: 'Verified' | 'Sealed' | 'Submitted to Court';
  fileNumber: string;
}

export interface HearingItem {
  id: string;
  caseId: string;
  caseNumber: string;
  hearingDate: string;
  time: string;
  court: string;
  judge: string;
  purpose: string;
  stage: 'Framing of Charges' | 'Prosecution Evidence' | 'Defense Arguments' | 'Final Arguments' | 'Pronouncement of Judgment';
  advocate: string;
  priority: PriorityLevel;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Adjourned';
}

export interface JudgmentDetails {
  verdict: 'Convicted' | 'Acquitted' | 'Compounded';
  conviction: string;
  sentence: string;
  fine: string;
  judgmentDate: string;
  judge: string;
  appealDeadline: string;
  appealFiled?: boolean;
  appealMemoNo?: string;
  appealNotes?: string;
}

export interface ChargeSheetDetails {
  isFiled: boolean;
  chargeSheetNo?: string;
  filedDate?: string;
  courtAssigned?: string;
  signedWithDsc?: boolean;
  dscTokenName?: string;
  signedTimestamp?: string;
  publicProsecutorVetted?: boolean;
}

export type ActivityType = 
  | 'STATUS_CHANGE'
  | 'CASE_CREATED'
  | 'CASE_EDITED'
  | 'INVESTIGATION_LOG'
  | 'EVIDENCE_ADDED'
  | 'HEARING_SCHEDULED'
  | 'CHARGESHEET_FILED'
  | 'JUDGMENT_RECORDED'
  | 'APPEAL_FILED'
  | 'OFFICER_NOTE';

export interface CaseActivity {
  id: string;
  caseId: string;
  timestamp: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  field?: string;
  previousValue?: string;
  newValue?: string;
}

export interface ForestCase {
  id: string;
  caseNumber: string;
  offence: OffenceType;
  title: string;
  date: string;
  time: string;
  division: string;
  range: string;
  round: string;
  beat: string;
  compartment: string;
  gpsCoordinates: string;
  location: string;
  status: CaseStatus;
  priority: PriorityLevel;
  sections: string[];
  io: string;
  reportingOfficer: string;
  description: string;
  accused: AccusedPerson[];
  seizedItems: SeizedItem[];
  investigationLogs: InvestigationLog[];
  evidence: EvidenceItem[];
  hearings: HearingItem[];
  chargeSheet: ChargeSheetDetails;
  judgment?: JudgmentDetails;
  activities?: CaseActivity[];
}

export interface ForestOfficer {
  id: string;
  name: string;
  email: string;
  role: 'DFO' | 'ACF' | 'RFO' | 'IO' | 'Beat Guard' | 'SDO' | 'RO' | 'Legal Cell';
  badgeNumber: string;
  division: string;
  range: string;
  phone: string;
  contact?: string;
  status: 'Active' | 'On Leave';
}
