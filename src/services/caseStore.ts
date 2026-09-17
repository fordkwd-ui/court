import type { ForestCase, HearingItem, ForestOfficer, InvestigationLog, EvidenceItem, JudgmentDetails, CaseActivity } from '../types/case';
import { supabase } from '../lib/supabase';

export function generateInitialActivities(c: ForestCase): CaseActivity[] {
  const list: CaseActivity[] = [];

  // 1. Initial Case Creation / POR Registration
  list.push({
    id: `act-init-created-${c.id}`,
    caseId: c.id,
    timestamp: `${c.date} ${c.time || '09:30 AM'}`,
    type: 'CASE_CREATED',
    title: 'Preliminary Offence Report Registered',
    description: `POR ${c.caseNumber} registered in ${c.range}, ${c.beat} (${c.compartment || 'RF'}). Offence: ${c.offence}.`,
    actor: c.reportingOfficer || c.io || 'Reporting Officer'
  });

  // 2. Investigation Initiation if status advanced
  if (c.status !== 'FIR_REGISTERED') {
    list.push({
      id: `act-init-stat-inv-${c.id}`,
      caseId: c.id,
      timestamp: `${c.date} 03:00 PM`,
      type: 'STATUS_CHANGE',
      title: 'Status: FIR_REGISTERED → UNDER_INVESTIGATION',
      description: 'Preliminary report vetted and marked for field investigation under Sec. 52 IFA.',
      actor: c.io,
      previousValue: 'FIR_REGISTERED',
      newValue: 'UNDER_INVESTIGATION'
    });
  }

  // 3. Historical Investigation Logs
  if (c.investigationLogs && c.investigationLogs.length > 0) {
    c.investigationLogs.forEach((log, idx) => {
      list.push({
        id: `act-init-log-${log.id || idx}`,
        caseId: c.id,
        timestamp: `${log.date} 11:00 AM`,
        type: 'INVESTIGATION_LOG',
        title: `Investigation: ${log.action}`,
        description: log.description,
        actor: log.officer
      });
    });
  }

  // 4. Historical Evidence Memos
  if (c.evidence && c.evidence.length > 0) {
    c.evidence.forEach((ev, idx) => {
      list.push({
        id: `act-init-ev-${ev.id || idx}`,
        caseId: c.id,
        timestamp: `${ev.date} 02:30 PM`,
        type: 'EVIDENCE_ADDED',
        title: `Evidence Secured: ${ev.title}`,
        description: `${ev.category} (${ev.fileNumber || 'Ref doc'}) • Status: ${ev.status}.`,
        actor: c.io
      });
    });
  }

  // 5. Charge Sheet Filing
  if (c.chargeSheet?.isFiled) {
    const csDate = c.chargeSheet.filedDate || c.date;
    list.push({
      id: `act-init-cs-status-${c.id}`,
      caseId: c.id,
      timestamp: `${csDate} 03:15 PM`,
      type: 'STATUS_CHANGE',
      title: 'Status: UNDER_INVESTIGATION → CHARGESHEET_FILED',
      description: 'Statutory investigation concluded; Final Form submitted to court.',
      actor: c.io,
      previousValue: 'UNDER_INVESTIGATION',
      newValue: 'CHARGESHEET_FILED'
    });
    list.push({
      id: `act-init-cs-${c.id}`,
      caseId: c.id,
      timestamp: `${csDate} 03:45 PM`,
      type: 'CHARGESHEET_FILED',
      title: `Charge Sheet Filed: ${c.chargeSheet.chargeSheetNo || 'CS Filed'}`,
      description: `Digitally signed via ${c.chargeSheet.dscTokenName || 'Class 3 DSC'}. Assigned Court: ${c.chargeSheet.courtAssigned}.`,
      actor: c.io
    });
  }

  // 6. Court Hearings & Trial Transition
  if (c.hearings && c.hearings.length > 0) {
    c.hearings.forEach((h, idx) => {
      list.push({
        id: `act-init-hr-${h.id || idx}`,
        caseId: c.id,
        timestamp: `${h.hearingDate} ${h.time || '11:00 AM'}`,
        type: 'HEARING_SCHEDULED',
        title: `Hearing Scheduled: ${h.stage}`,
        description: `${h.court} before ${h.judge}. Purpose: ${h.purpose} (${h.status}).`,
        actor: h.advocate || 'Court Registrar'
      });
    });

    if (c.status === 'TRIAL' || c.status === 'JUDGMENT_DELIVERED' || c.status === 'APPEAL_FILED') {
      const trialDate = c.hearings[0]?.hearingDate || c.date;
      list.push({
        id: `act-init-trial-status-${c.id}`,
        caseId: c.id,
        timestamp: `${trialDate} 10:30 AM`,
        type: 'STATUS_CHANGE',
        title: 'Status: CHARGESHEET_FILED → TRIAL',
        description: 'Court accepted charges and issued summons; trial underway.',
        actor: 'Judicial Magistrate',
        previousValue: 'CHARGESHEET_FILED',
        newValue: 'TRIAL'
      });
    }
  }

  // 7. Judgment Pronouncement
  if (c.judgment) {
    list.push({
      id: `act-init-judg-${c.id}`,
      caseId: c.id,
      timestamp: `${c.judgment.judgmentDate} 04:00 PM`,
      type: 'JUDGMENT_RECORDED',
      title: `Judgment Delivered: ${c.judgment.verdict}`,
      description: `Sentence: ${c.judgment.sentence}. Fine: ${c.judgment.fine}. Presiding Judge: ${c.judgment.judge}.`,
      actor: c.judgment.judge
    });
    list.push({
      id: `act-init-judg-status-${c.id}`,
      caseId: c.id,
      timestamp: `${c.judgment.judgmentDate} 04:30 PM`,
      type: 'STATUS_CHANGE',
      title: 'Status: TRIAL → JUDGMENT_DELIVERED',
      description: `Court trial concluded with verdict: ${c.judgment.verdict}.`,
      actor: c.judgment.judge,
      previousValue: 'TRIAL',
      newValue: 'JUDGMENT_DELIVERED'
    });
  }

  // 8. Appeal Registration
  if (c.status === 'APPEAL_FILED' || c.judgment?.appealFiled) {
    const appealDate = c.judgment?.judgmentDate || c.date;
    list.push({
      id: `act-init-appeal-${c.id}`,
      caseId: c.id,
      timestamp: `${appealDate} 05:00 PM`,
      type: 'APPEAL_FILED',
      title: `Statutory Appeal Filed: Memo No. ${c.judgment?.appealMemoNo || 'Revision Memo'}`,
      description: c.judgment?.appealNotes || 'Appeal memo filed before higher appellate court.',
      actor: 'State Standing Counsel'
    });
    list.push({
      id: `act-init-appeal-status-${c.id}`,
      caseId: c.id,
      timestamp: `${appealDate} 05:15 PM`,
      type: 'STATUS_CHANGE',
      title: 'Status: JUDGMENT_DELIVERED → APPEAL_FILED',
      description: 'Appellate revision registered for hearing on admission.',
      actor: 'State Standing Counsel',
      previousValue: 'JUDGMENT_DELIVERED',
      newValue: 'APPEAL_FILED'
    });
  }

  // Return sorted chronologically
  return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const STORAGE_KEY = 'van_nyay_cases_v2';
const OFFICERS_KEY = 'van_nyay_officers_v2';

export const INITIAL_OFFICERS: ForestOfficer[] = [
  {
    id: 'off-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@forest.cg.gov.in',
    role: 'IO',
    badgeNumber: 'CG-FOR-IO-1082',
    division: 'North Kabirdham',
    range: 'Bodla Range',
    phone: '+91 94252 88401',
    status: 'Active'
  },
  {
    id: 'off-2',
    name: 'Vikram Singh, IFS',
    email: 'dfo.kabirdham@cg.gov.in',
    role: 'DFO',
    badgeNumber: 'IFS-CG-2012-04',
    division: 'North Kabirdham',
    range: 'Division HQ',
    phone: '+91 77412 32014',
    status: 'Active'
  },
  {
    id: 'off-3',
    name: 'Suresh Sahu',
    email: 'suresh.sahu@forest.cg.gov.in',
    role: 'RFO',
    badgeNumber: 'CG-FOR-RFO-0512',
    division: 'North Kabirdham',
    range: 'Pandariya Range',
    phone: '+91 98261 40992',
    status: 'Active'
  },
  {
    id: 'off-4',
    name: 'Anjali Netam',
    email: 'anjali.netam@forest.cg.gov.in',
    role: 'ACF',
    badgeNumber: 'CG-FOR-ACF-0209',
    division: 'North Kabirdham',
    range: 'Kawardha Sub-Division',
    phone: '+91 94060 11983',
    status: 'Active'
  },
  {
    id: 'off-5',
    name: 'Mohan Lal Dhurve',
    email: 'mohan.dhurve@forest.cg.gov.in',
    role: 'Beat Guard',
    badgeNumber: 'CG-FOR-BG-9481',
    division: 'North Kabirdham',
    range: 'Bodla Range',
    phone: '+91 79998 22104',
    status: 'Active'
  }
];

export const INITIAL_CASES: ForestCase[] = [
  {
    id: 'WL-2024-KAB-00124',
    caseNumber: 'WL/2024/KAB/00124',
    title: 'Illicit Felling & Transit of Teak Timber in Chilphi Beat',
    offence: 'Illegal Cutting',
    date: '2024-03-12',
    time: '04:30 AM',
    division: 'North Kabirdham',
    range: 'Bodla Range',
    round: 'Chilphi Round',
    beat: 'Beat 4 - Chilphi Ghati',
    compartment: 'Comp. No. 248-RF (Reserve Forest)',
    gpsCoordinates: '22.1892° N, 81.0421° E',
    location: 'Beat 4, Near Chilphi Ghati, North Kabirdham',
    status: 'FIR_REGISTERED',
    priority: 'MEDIUM',
    sections: [
      'Sec 26(1)(f) Indian Forest Act, 1927',
      'Sec 33 Indian Forest Act, 1927',
      'Sec 2(16) & 9 Wildlife Protection Act, 1972',
      'Chhattisgarh Transit of Forest Produce Rules, 2001'
    ],
    io: 'Rajesh Kumar (IO, Bodla)',
    reportingOfficer: 'Mohan Lal Dhurve (Beat Guard)',
    description: 'During night patrolling along the Chilphi corridor, the beat patrol intercepted an unauthorized Mahindra Bolero Maxi-Truck laden with freshly felled green Teak (Tectona grandis) logs. Two suspects apprehended on spot; electric chainsaw and axe recovered.',
    accused: [
      {
        id: 'acc-1',
        name: 'Ramesh Singh Maravi',
        age: 42,
        fatherName: 'Late Dayaram Maravi',
        village: 'Village Rengakhar, Tehsil Bodla',
        status: 'Judicial Custody',
        idProof: 'Aadhaar: XXXX-XXXX-4812'
      },
      {
        id: 'acc-2',
        name: 'Bhupendra Patel',
        age: 29,
        fatherName: 'Santosh Patel',
        village: 'Village Taregaon Forest, Kabirdham',
        status: 'Judicial Custody',
        idProof: 'Voter ID: CG/14/082/01923'
      }
    ],
    seizedItems: [
      {
        id: 'sz-1',
        item: 'Teak (Sagwan) Timber Logs (28 pieces)',
        category: 'Timber',
        quantity: '4.82 cu. meters',
        estimatedValue: '₹3,85,000',
        malkhanaLocation: 'Range Malkhana Bodla - Bay 3',
        status: 'In Range Malkhana'
      },
      {
        id: 'sz-2',
        item: 'Mahindra Bolero Maxi-Truck (Reg: CG-09-JB-4190)',
        category: 'Vehicle',
        quantity: '1 Vehicle',
        estimatedValue: '₹6,50,000',
        malkhanaLocation: 'Bodla Forest Depot Compound',
        status: 'Forest Depot'
      },
      {
        id: 'sz-3',
        item: 'Husqvarna 450 Petrol Chainsaw & 2 Iron Axes',
        category: 'Tool/Weapon',
        quantity: '3 Units',
        estimatedValue: '₹45,000',
        malkhanaLocation: 'Sealed Property Locker - Bodla',
        status: 'In Range Malkhana'
      }
    ],
    investigationLogs: [
      {
        id: 'log-1',
        action: 'Site Inspection & Spot Map Creation',
        date: '2024-03-12',
        officer: 'Rajesh Kumar (IO)',
        description: 'Conducted detailed spot inspection at Comp. No. 248-RF. Marked 7 tree stumps. Measured girths (120cm to 165cm) and matched grain patterns to seized logs.',
        evidenceCount: 4
      },
      {
        id: 'log-2',
        action: 'Panchnama & Seizure Memo (Form 9)',
        date: '2024-03-13',
        officer: 'Rajesh Kumar (IO)',
        description: 'Executed spot Panchnama in presence of independent village panchas (Kailash Yadav & Dev Singh). Impounded vehicle and timber under Sec 52 of IFA 1927.',
        evidenceCount: 2
      },
      {
        id: 'log-3',
        action: 'Accused Production before CJM Court',
        date: '2024-03-14',
        officer: 'Rajesh Kumar (IO)',
        description: 'Produced both accused before Chief Judicial Magistrate, Kawardha. 14 days judicial remand granted till District Jail Kawardha.',
        evidenceCount: 1
      }
    ],
    evidence: [
      {
        id: 'ev-1',
        title: 'Spot Inspection Panchnama & Girth Chart',
        category: 'Panchnama Memo',
        date: '2024-03-12',
        size: '3.4 MB',
        status: 'Verified',
        fileNumber: 'PAN-2024-03-12-01'
      },
      {
        id: 'ev-2',
        title: 'Geo-tagged High-Res Tree Stump Photographs (8 angles)',
        category: 'Site Photo',
        date: '2024-03-12',
        size: '18.2 MB',
        status: 'Verified',
        fileNumber: 'IMG-GEO-248RF-004'
      },
      {
        id: 'ev-3',
        title: 'Form 9 - Seizure Memo of Timber and Vehicle CG-09-JB-4190',
        category: 'Seizure Memo',
        date: '2024-03-13',
        size: '2.1 MB',
        status: 'Sealed',
        fileNumber: 'FORM9-BODLA-2024-19'
      },
      {
        id: 'ev-4',
        title: 'Tropical Forest Research Institute (TFRI) Species Authentication',
        category: 'Forensic Report',
        date: '2024-03-18',
        size: '1.8 MB',
        status: 'Verified',
        fileNumber: 'TFRI-BOT-2024-811'
      }
    ],
    hearings: [
      {
        id: 'hr-1',
        caseId: 'WL-2024-KAB-00124',
        caseNumber: 'WL/2024/KAB/00124',
        hearingDate: '2024-04-05',
        time: '11:00 AM',
        court: 'Court of Chief Judicial Magistrate, Kawardha',
        judge: 'Hon. Justice P. K. Verma',
        purpose: 'Bail Hearing & Remand Extension',
        stage: 'Framing of Charges',
        advocate: 'Shri Arvind Shukla (Public Prosecutor)',
        priority: 'MEDIUM',
        notes: 'Public prosecutor to oppose regular bail citing commercial timber syndicate involvement.',
        status: 'Scheduled'
      }
    ],
    chargeSheet: {
      isFiled: false
    }
  },
  {
    id: 'WL-2023-KAB-00082',
    caseNumber: 'WL/2023/KAB/00082',
    title: 'Poaching of Schedule-I Indian Leopard via High-Tension Wire Snare',
    offence: 'Poaching',
    date: '2023-11-10',
    time: '07:15 AM',
    division: 'North Kabirdham',
    range: 'Pandariya Range',
    round: 'Kukdur Round',
    beat: 'Beat 11 - Dalpur',
    compartment: 'Comp. No. 114-PF (Protected Forest)',
    gpsCoordinates: '22.3411° N, 81.3912° E',
    location: 'Kukdur Beat 11, Pandariya, Kabirdham',
    status: 'JUDGMENT_DELIVERED',
    priority: 'CRITICAL',
    sections: [
      'Sec 9, 39, 48A & 51 Wildlife (Protection) Act, 1972',
      'Sec 135 Electricity Act, 2003 (Illegal Tapping for Poaching Trap)'
    ],
    io: 'Suresh Sahu (RFO, Pandariya)',
    reportingOfficer: 'Raju Gond (Forest Guard)',
    description: 'Male adult Leopard (Panthera pardus) electrocuted using illegal G.I. wire tapping drawn from 11KV agricultural line. Claws and skin partially attempted to be extracted. Suspect apprehended with GI wires and cutting pliers.',
    accused: [
      {
        id: 'acc-3',
        name: 'Mansingh Baiga',
        age: 38,
        fatherName: 'Bhanu Baiga',
        village: 'Village Dalpur, Post Kukdur',
        status: 'Judicial Custody',
        idProof: 'Aadhaar: XXXX-XXXX-9102'
      }
    ],
    seizedItems: [
      {
        id: 'sz-4',
        item: 'Leopard Carcass with 18 intact Claws and Canines',
        category: 'Wildlife Trophy',
        quantity: '1 Specimen',
        estimatedValue: 'Schedule-I Specimen (Strict Protection)',
        malkhanaLocation: 'Incinerated per NTCA SOP / Preserved Samples in Freezer',
        status: 'Produced in Court'
      },
      {
        id: 'sz-5',
        item: '320 Meters of High-Tension G.I. Wire & Wooden Insulators',
        category: 'Tool/Weapon',
        quantity: '1 Bundle',
        estimatedValue: '₹12,000',
        malkhanaLocation: 'Range Malkhana Pandariya',
        status: 'Produced in Court'
      }
    ],
    investigationLogs: [
      {
        id: 'log-4',
        action: 'Post-Mortem by Senior Wildlife Veterinary Surgeon',
        date: '2023-11-11',
        officer: 'Dr. N. K. Dewangan (Veterinary Officer)',
        description: 'Confirmed death due to electro-ventricular fibrillation. Organs and tissue samples preserved for WII Dehradun DNA profiling.',
        evidenceCount: 6
      },
      {
        id: 'log-5',
        action: 'Final Offence Report (Charge Sheet) Filing',
        date: '2024-01-08',
        officer: 'Suresh Sahu (RFO)',
        description: 'Complete charge sheet filed in Session Court Kawardha under Sec 51 WPA with DNA evidence and electrical engineer inspection report.',
        evidenceCount: 14
      }
    ],
    evidence: [
      {
        id: 'ev-5',
        title: 'Veterinary Autopsy & Forensic Necropsy Report',
        category: 'Forensic Report',
        date: '2023-11-11',
        size: '5.6 MB',
        status: 'Submitted to Court',
        fileNumber: 'VET-PM-2023-114'
      },
      {
        id: 'ev-6',
        title: 'Wildlife Institute of India (WII) DNA Forensic Certificate',
        category: 'Forensic Report',
        date: '2023-12-20',
        size: '2.4 MB',
        status: 'Submitted to Court',
        fileNumber: 'WII-DNA-KAB-992'
      }
    ],
    hearings: [
      {
        id: 'hr-2',
        caseId: 'WL-2023-KAB-00082',
        caseNumber: 'WL/2023/KAB/00082',
        hearingDate: '2024-03-01',
        time: '02:30 PM',
        court: 'Sessions Court, Kawardha',
        judge: 'Hon. Additional Sessions Judge Smt. K. Sharma',
        purpose: 'Final Pronouncement of Judgment',
        stage: 'Pronouncement of Judgment',
        advocate: 'Shri Arvind Shukla (PP)',
        priority: 'CRITICAL',
        notes: 'Court pronounced conviction under Sec 51 WPA.',
        status: 'Completed'
      }
    ],
    chargeSheet: {
      isFiled: true,
      chargeSheetNo: 'CS-WL-2024-001',
      filedDate: '2024-01-08',
      courtAssigned: 'Sessions Court, Kawardha',
      signedWithDsc: true,
      dscTokenName: 'ePass2003 - DFO Kabirdham',
      signedTimestamp: '2024-01-08 16:42:10 IST',
      publicProsecutorVetted: true
    },
    judgment: {
      verdict: 'Convicted',
      conviction: 'Guilty under Sec 9, 39 r/w Sec 51 of Wildlife (Protection) Act, 1972',
      sentence: '3 Years Rigorous Imprisonment (RI)',
      fine: '₹50,000 (In default of payment, 6 months additional SI)',
      judgmentDate: '2024-03-01',
      judge: 'Hon. Additional Sessions Judge Smt. K. Sharma',
      appealDeadline: '2024-03-31',
      appealFiled: false,
      appealNotes: 'Accused defense counsel has applied for certified copy to file appeal in Chhattisgarh High Court Bilaspur. Forest department seeking enhancement of sentence to 7 years.'
    }
  },
  {
    id: 'FOR-2024-KAB-00118',
    caseNumber: 'FOR/2024/KAB/00118',
    title: 'Encroachment and Clear-Felling of 4.5 Hectares in Taregaon Reserve Forest',
    offence: 'Encroachment',
    date: '2024-02-14',
    time: '10:00 AM',
    division: 'North Kabirdham',
    range: 'Bodla Range',
    round: 'Taregaon Round',
    beat: 'Beat 8 - Bhaisanghat',
    compartment: 'Comp. No. 319-RF',
    gpsCoordinates: '22.2541° N, 81.1890° E',
    location: 'Taregaon Comp. 319-RF, Kabirdham',
    status: 'UNDER_INVESTIGATION',
    priority: 'HIGH',
    sections: [
      'Sec 26(1)(a) & 26(1)(h) Indian Forest Act, 1927',
      'Sec 2 Forest (Conservation) Act, 1980'
    ],
    io: 'Rajesh Kumar (IO, Bodla)',
    reportingOfficer: 'Dinesh Patel (Forest Guard)',
    description: 'Encroachers cleared 4.5 hectares of dense forest using two hired JCB excavators to construct illegal agricultural bunds and ponds. Excavator operator and primary instigator detained.',
    accused: [
      {
        id: 'acc-4',
        name: 'Gopal Sahu',
        age: 51,
        fatherName: 'Kanhaiya Sahu',
        village: 'Taregaon Jungle, Kabirdham',
        status: 'Released on Bail',
        idProof: 'Aadhaar: XXXX-XXXX-1945'
      }
    ],
    seizedItems: [
      {
        id: 'sz-6',
        item: 'JCB 3DX Heavy Excavator (Yellow, Reg: CG-04-MC-8120)',
        category: 'Vehicle',
        quantity: '1 Heavy Equipment',
        estimatedValue: '₹28,50,000',
        malkhanaLocation: 'Division Depot, North Kabirdham',
        status: 'In Range Malkhana'
      }
    ],
    investigationLogs: [
      {
        id: 'log-6',
        action: 'DGPS Survey & Total Station Boundary Mapping',
        date: '2024-02-16',
        officer: 'Surveyor Amit Tiwari & IO Rajesh Kumar',
        description: 'Carried out differential GPS boundary mapping. Confirmed encroachment extends 4.52 hectares inside notified Reserve Forest boundary pillars 14 to 22.',
        evidenceCount: 3
      }
    ],
    evidence: [
      {
        id: 'ev-7',
        title: 'Cadastral Map Overlay and DGPS Survey Certification',
        category: 'Panchnama Memo',
        date: '2024-02-16',
        size: '12.4 MB',
        status: 'Verified',
        fileNumber: 'DGPS-SURV-2024-319'
      }
    ],
    hearings: [],
    chargeSheet: {
      isFiled: false
    }
  },
  {
    id: 'WL-2024-KAB-00105',
    caseNumber: 'WL/2024/KAB/00105',
    title: 'Poaching and Illegal Possession of Spotted Deer (Axis axis) Meat',
    offence: 'Poaching',
    date: '2024-01-22',
    time: '09:40 PM',
    division: 'North Kabirdham',
    range: 'Pandariya Range',
    round: 'Pandariya North',
    beat: 'Beat 2 - Kanda',
    compartment: 'Comp. No. 84-PF',
    gpsCoordinates: '22.3918° N, 81.4201° E',
    location: 'Kanda Beat 2, Pandariya',
    status: 'TRIAL',
    priority: 'HIGH',
    sections: [
      'Sec 9, 39 & 51 Wildlife (Protection) Act, 1972',
      'Arms Act, 1959 - Sec 25 & 27 (Muzzle-loading 12-bore Country Gun)'
    ],
    io: 'Suresh Sahu (RFO, Pandariya)',
    reportingOfficer: 'Kamlesh Dhurve (Beat Guard)',
    description: 'During a raid based on intelligence in village Kanda, 18 kg of fresh Chital meat, skin with antlers, and a country-made 12-bore muzzle gun were seized from the suspect premises.',
    accused: [
      {
        id: 'acc-5',
        name: 'Brijlal Gond',
        age: 46,
        fatherName: 'Sukhlal Gond',
        village: 'Village Kanda, Pandariya',
        status: 'Judicial Custody',
        idProof: 'Aadhaar: XXXX-XXXX-5521'
      }
    ],
    seizedItems: [
      {
        id: 'sz-7',
        item: 'Chital Antlers and 18 kg meat (Forensic samples preserved)',
        category: 'Wildlife Trophy',
        quantity: '1 Set Antlers, 18 kg Meat',
        estimatedValue: 'Schedule-III Species',
        malkhanaLocation: 'Range Deep Freezer, Pandariya',
        status: 'Produced in Court'
      },
      {
        id: 'sz-8',
        item: 'Single Barrel 12-Bore Country Gun with Gunpowder and Pellets',
        category: 'Tool/Weapon',
        quantity: '1 Firearm',
        estimatedValue: '₹15,000',
        malkhanaLocation: 'Sealed Police Malkhana Pandariya',
        status: 'Produced in Court'
      }
    ],
    investigationLogs: [
      {
        id: 'log-7',
        action: 'Species Confirmation by Forensic Science Lab (FSL)',
        date: '2024-02-05',
        officer: 'FSL Raipur Wildlife Division',
        description: 'Electrophoresis and precipitin test confirmed meat and skin belongs to Axis axis (Spotted Deer).',
        evidenceCount: 4
      }
    ],
    evidence: [
      {
        id: 'ev-8',
        title: 'FSL Raipur Wildlife Identification Report No. WLD-441/24',
        category: 'Forensic Report',
        date: '2024-02-05',
        size: '3.1 MB',
        status: 'Submitted to Court',
        fileNumber: 'FSL-WLD-2024-441'
      }
    ],
    hearings: [
      {
        id: 'hr-3',
        caseId: 'WL-2024-KAB-00105',
        caseNumber: 'WL/2024/KAB/00105',
        hearingDate: '2024-04-12',
        time: '11:30 AM',
        court: 'Judicial Magistrate First Class (JMFC), Pandariya',
        judge: 'Hon. Justice M. L. Gupta',
        purpose: 'Cross-Examination of Prosecution Witness PW-1 (IO Suresh Sahu)',
        stage: 'Prosecution Evidence',
        advocate: 'Shri Arvind Shukla (PP)',
        priority: 'HIGH',
        notes: 'PW-1 summoned with original Form 9 and Malkhana register.',
        status: 'Scheduled'
      }
    ],
    chargeSheet: {
      isFiled: true,
      chargeSheetNo: 'CS-WL-2024-008',
      filedDate: '2024-02-28',
      courtAssigned: 'JMFC Pandariya',
      signedWithDsc: true,
      dscTokenName: 'ePass2003 - RFO Pandariya',
      signedTimestamp: '2024-02-28 14:15:00 IST',
      publicProsecutorVetted: true
    }
  },
  {
    id: 'FOR-2023-KAB-00049',
    caseNumber: 'FOR/2023/KAB/00049',
    title: 'Illegal Stone Quarrying & Quartzite Extraction in Eco-Sensitive Sanctuary Zone',
    offence: 'Illegal Mining',
    date: '2023-08-19',
    time: '11:00 AM',
    division: 'North Kabirdham',
    range: 'Kawardha Buffer',
    round: 'Phen Sanctuary Buffer',
    beat: 'Beat 3 - Baroda',
    compartment: 'Comp. No. 19-RF Buffer',
    gpsCoordinates: '22.1120° N, 81.1500° E',
    location: 'Phen Wildlife Sanctuary Buffer Comp 19-RF',
    status: 'APPEAL_FILED',
    priority: 'CRITICAL',
    sections: [
      'Sec 26(1)(g) Indian Forest Act, 1927',
      'Sec 38-O Wildlife (Protection) Act, 1972',
      'Mines and Minerals (Development and Regulation) Act, 1957 - Sec 4 & 21'
    ],
    io: 'Anjali Netam (ACF)',
    reportingOfficer: 'Hemant Verma (Ranger)',
    description: 'Commercial mining contractor extracted over 120 truckloads of quartzite stone inside the eco-sensitive buffer zone of the wildlife sanctuary. Lower court had erroneously granted discharge on technical grounds; Forest Department preferred Revision in High Court.',
    accused: [
      {
        id: 'acc-6',
        name: 'M/s Shivalik Earthmovers (Prop. R. K. Agrawal)',
        age: 54,
        fatherName: 'B. D. Agrawal',
        village: 'Industrial Area, Kawardha',
        status: 'Released on Bail',
        idProof: 'GSTIN: 22AABCS9120F1Z4'
      }
    ],
    seizedItems: [
      {
        id: 'sz-9',
        item: '2 Dumpers (CG-04-E-9021 & CG-04-E-9022) and 1 Stone Crusher',
        category: 'Vehicle',
        quantity: '3 Units',
        estimatedValue: '₹42,00,000',
        malkhanaLocation: 'Sanctuary Range Depot Baroda',
        status: 'Produced in Court'
      }
    ],
    investigationLogs: [
      {
        id: 'log-8',
        action: 'Revision Appeal Filed before Hon. High Court of Chhattisgarh',
        date: '2023-12-15',
        officer: 'Anjali Netam (ACF) & Standing Counsel',
        description: 'Criminal Revision Petition No. CRR-1092/2023 filed challenging the trial court order of compounding.',
        evidenceCount: 8
      }
    ],
    evidence: [
      {
        id: 'ev-9',
        title: 'Mining Geologist Assessment Report on Extracted Volume',
        category: 'Forensic Report',
        date: '2023-08-25',
        size: '7.8 MB',
        status: 'Submitted to Court',
        fileNumber: 'MIN-GEO-2023-119'
      }
    ],
    hearings: [
      {
        id: 'hr-4',
        caseId: 'FOR-2023-KAB-00049',
        caseNumber: 'FOR/2023/KAB/00049',
        hearingDate: '2024-04-18',
        time: '10:30 AM',
        court: 'High Court of Chhattisgarh, Bilaspur',
        judge: 'Hon. Justice Deepak Tiwari',
        purpose: 'Hearing on Admission & Stay of Lower Court Order',
        stage: 'Final Arguments',
        advocate: 'Additional Advocate General (CG State)',
        priority: 'CRITICAL',
        notes: 'Standing Counsel briefed with Supreme Court Lafarge guidelines.',
        status: 'Scheduled'
      }
    ],
    chargeSheet: {
      isFiled: true,
      chargeSheetNo: 'CS-MIN-2023-014',
      filedDate: '2023-10-10',
      courtAssigned: 'High Court Bilaspur',
      signedWithDsc: true,
      dscTokenName: 'ePass2003 - DFO Kabirdham',
      signedTimestamp: '2023-10-10 17:00:00 IST',
      publicProsecutorVetted: true
    },
    judgment: {
      verdict: 'Acquitted',
      conviction: 'Lower Court ordered discharge citing jurisdiction overlap with Mining Dept',
      sentence: 'Discharged by JMFC Kawardha',
      fine: 'Nil',
      judgmentDate: '2023-11-20',
      judge: 'JMFC Kawardha',
      appealDeadline: '2024-01-20',
      appealFiled: true,
      appealMemoNo: 'CRR-1092/2023',
      appealNotes: 'High Court granted ad-interim stay on release of seized dumpers on 2024-01-15.'
    }
  }
];

class CaseStore {
  private cases: ForestCase[] = [];
  private officers: ForestOfficer[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
    this.hydrateFromSupabase();
  }

  private async hydrateFromSupabase() {
    try {
      const { data, error } = await supabase
        .from('app_state')
        .select('data')
        .eq('id', 'van_nyay_global')
        .single();
        
      if (error) {
        console.warn('Supabase Hydration Error (Will use local storage instead):', error.message);
        return;
      }
      
      if (data && data.data) {
        const parsed = data.data;
        if (parsed.cases && Array.isArray(parsed.cases)) {
          this.cases = parsed.cases;
        }
        if (parsed.officers && Array.isArray(parsed.officers)) {
          this.officers = parsed.officers;
        }
        console.log('Successfully hydrated state from Supabase Cloud!');
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to hydrate from Supabase:', err);
    }
  }

  private async syncToSupabase() {
    try {
      const payload = {
        cases: this.cases,
        officers: this.officers,
        last_updated: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('app_state')
        .upsert({ 
          id: 'van_nyay_global', 
          data: payload 
        });
        
      if (error) {
        console.error('Failed to sync state to Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to sync state to Supabase (Exception):', err);
    }
  }

  private loadFromStorage() {
    try {
      const storedCases = localStorage.getItem(STORAGE_KEY);
      if (storedCases) {
        this.cases = JSON.parse(storedCases);
      } else {
        this.cases = INITIAL_CASES;
        this.saveCases();
      }

      const storedOfficers = localStorage.getItem(OFFICERS_KEY);
      if (storedOfficers) {
        this.officers = JSON.parse(storedOfficers);
      } else {
        this.officers = INITIAL_OFFICERS;
        this.saveOfficers();
      }
    } catch {
      this.cases = INITIAL_CASES;
      this.officers = INITIAL_OFFICERS;
    }
  }

  private saveCases() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cases));
      this.syncToSupabase();
    } catch {
      // ignore
    }
    this.notify();
  }

  private saveOfficers() {
    try {
      localStorage.setItem(OFFICERS_KEY, JSON.stringify(this.officers));
      this.syncToSupabase();
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  public getCases(): ForestCase[] {
    return this.cases.map(c => {
      if (!c.activities || c.activities.length === 0) {
        c.activities = generateInitialActivities(c);
      }
      return c;
    });
  }

  public getCaseById(id: string): ForestCase | undefined {
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const c = this.cases.find(c => 
      c.id.toLowerCase() === cleanId || 
      c.caseNumber.toLowerCase() === cleanId ||
      c.id.replace(/\//g, '-').toLowerCase() === cleanId
    );
    if (c && (!c.activities || c.activities.length === 0)) {
      c.activities = generateInitialActivities(c);
    }
    return c;
  }

  public createCase(newCaseData: Partial<ForestCase>): ForestCase {
    const year = new Date().getFullYear();
    const count = this.cases.length + 1;
    const prefix = newCaseData.offence === 'Illegal Cutting' ? 'FOR' : 'WL';
    const caseNumber = `${prefix}/${year}/KAB/${String(count).padStart(5, '0')}`;
    const id = caseNumber.replace(/\//g, '-');

    const createdCase: ForestCase = {
      id,
      caseNumber,
      title: newCaseData.title || `${newCaseData.offence || 'Forest Offence'} in ${newCaseData.beat || 'Beat Area'}`,
      offence: newCaseData.offence || 'Illegal Cutting',
      date: newCaseData.date || new Date().toISOString().split('T')[0],
      time: newCaseData.time || '10:00 AM',
      division: newCaseData.division || 'North Kabirdham',
      range: newCaseData.range || 'Bodla Range',
      round: newCaseData.round || 'Round 1',
      beat: newCaseData.beat || 'Beat 4',
      compartment: newCaseData.compartment || 'Comp. No. 101-RF',
      gpsCoordinates: newCaseData.gpsCoordinates || '22.2000° N, 81.1000° E',
      location: newCaseData.location || `${newCaseData.beat || 'Beat Area'}, North Kabirdham`,
      status: 'FIR_REGISTERED',
      priority: newCaseData.priority || 'MEDIUM',
      sections: newCaseData.sections && newCaseData.sections.length > 0 ? newCaseData.sections : [
        'Sec 26 & 33 Indian Forest Act, 1927',
        'Chhattisgarh Transit of Forest Produce Rules, 2001'
      ],
      io: newCaseData.io || 'Rajesh Kumar (IO)',
      reportingOfficer: newCaseData.reportingOfficer || 'Mohan Lal Dhurve (Beat Guard)',
      description: newCaseData.description || 'Offence reported and preliminary offence report (POR) generated on patrol inspection.',
      accused: newCaseData.accused || [],
      seizedItems: newCaseData.seizedItems || [],
      investigationLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'FIR Registered & Investigation Commenced',
          date: newCaseData.date || new Date().toISOString().split('T')[0],
          officer: newCaseData.io || 'Rajesh Kumar (IO)',
          description: `Preliminary Offence Report registered under case ${caseNumber}. Assigned to Investigating Officer.`,
          evidenceCount: 1
        }
      ],
      evidence: newCaseData.evidence || [
        {
          id: `ev-${Date.now()}`,
          title: 'Preliminary Offence Report (POR) Form No. 1',
          category: 'Panchnama Memo',
          date: newCaseData.date || new Date().toISOString().split('T')[0],
          size: '1.4 MB',
          status: 'Verified',
          fileNumber: `POR-${year}-${String(count).padStart(4, '0')}`
        }
      ],
      hearings: [],
      chargeSheet: {
        isFiled: false
      },
      activities: [
        {
          id: `act-${Date.now()}-created`,
          caseId: id,
          timestamp: `${newCaseData.date || new Date().toISOString().split('T')[0]} ${newCaseData.time || '10:00 AM'}`,
          type: 'CASE_CREATED',
          title: 'Preliminary Offence Report Registered',
          description: `POR ${caseNumber} registered in ${newCaseData.range || 'Bodla Range'}, ${newCaseData.beat || 'Beat 4'}.`,
          actor: newCaseData.reportingOfficer || newCaseData.io || 'Beat Guard'
        }
      ]
    };

    this.cases.unshift(createdCase);
    this.saveCases();
    return createdCase;
  }

  public bulkCreateCases(newCasesData: Partial<ForestCase>[]): ForestCase[] {
    const year = new Date().getFullYear();
    const createdList: ForestCase[] = [];

    newCasesData.forEach((newCaseData, idx) => {
      const count = this.cases.length + createdList.length + 1;
      const prefix = newCaseData.offence === 'Illegal Cutting' ? 'FOR' : 'WL';
      const caseNumber = newCaseData.caseNumber && newCaseData.caseNumber.trim() !== ''
        ? newCaseData.caseNumber.trim()
        : `${prefix}/${year}/KAB/${String(count).padStart(5, '0')}`;
      const id = caseNumber.replace(/\//g, '-');

      const createdCase: ForestCase = {
        id,
        caseNumber,
        title: newCaseData.title || `${newCaseData.offence || 'Forest Offence'} in ${newCaseData.beat || 'Beat Area'}`,
        offence: newCaseData.offence || 'Illegal Cutting',
        date: newCaseData.date || new Date().toISOString().split('T')[0],
        time: newCaseData.time || '10:00 AM',
        division: newCaseData.division || 'North Kabirdham',
        range: newCaseData.range || 'Bodla Range',
        round: newCaseData.round || 'Round 1',
        beat: newCaseData.beat || 'Beat 4',
        compartment: newCaseData.compartment || 'Comp. No. 101-RF',
        gpsCoordinates: newCaseData.gpsCoordinates || '22.2000° N, 81.1000° E',
        location: newCaseData.location || `${newCaseData.beat || 'Beat Area'}, North Kabirdham`,
        status: newCaseData.status || 'FIR_REGISTERED',
        priority: newCaseData.priority || 'MEDIUM',
        sections: newCaseData.sections && newCaseData.sections.length > 0 ? newCaseData.sections : [
          'Sec 26 & 33 Indian Forest Act, 1927',
          'Chhattisgarh Transit of Forest Produce Rules, 2001'
        ],
        io: newCaseData.io || 'Rajesh Kumar (IO)',
        reportingOfficer: newCaseData.reportingOfficer || 'Mohan Lal Dhurve (Beat Guard)',
        description: newCaseData.description || 'Imported offence record; preliminary offence report registered.',
        accused: newCaseData.accused || [],
        seizedItems: newCaseData.seizedItems || [],
        investigationLogs: newCaseData.investigationLogs || [
          {
            id: `log-${Date.now()}-${idx}`,
            action: 'Record Registered / Imported',
            date: newCaseData.date || new Date().toISOString().split('T')[0],
            officer: newCaseData.io || 'Rajesh Kumar (IO)',
            description: `Offence report registered under case ${caseNumber}. Assigned to Investigating Officer.`,
            evidenceCount: (newCaseData.evidence && newCaseData.evidence.length) || 1
          }
        ],
        evidence: newCaseData.evidence || [
          {
            id: `ev-${Date.now()}-${idx}`,
            title: 'Preliminary Offence Report (POR) Form No. 1',
            category: 'Panchnama Memo',
            date: newCaseData.date || new Date().toISOString().split('T')[0],
            size: '1.2 MB',
            status: 'Verified',
            fileNumber: `POR-${year}-${String(count).padStart(4, '0')}`
          }
        ],
        hearings: newCaseData.hearings || [],
        chargeSheet: newCaseData.chargeSheet || {
          isFiled: false
        },
        judgment: newCaseData.judgment
      };

      createdCase.activities = generateInitialActivities(createdCase);
      createdList.push(createdCase);
    });

    this.cases.unshift(...createdList);
    this.saveCases();
    return createdList;
  }

  public updateCase(id: string, updates: Partial<ForestCase>, actor: string = 'Investigating Officer'): ForestCase | null {
    const idx = this.cases.findIndex(c => c.id === id || c.caseNumber === id);
    if (idx === -1) return null;
    const c = this.cases[idx];
    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Track status changes
    if (updates.status && updates.status !== c.status) {
      c.activities.unshift({
        id: `act-${Date.now()}-status`,
        caseId: c.id,
        timestamp: nowStr,
        type: 'STATUS_CHANGE',
        title: `Status: ${c.status.replace(/_/g, ' ')} → ${updates.status.replace(/_/g, ' ')}`,
        description: `Case legal status updated to ${updates.status.replace(/_/g, ' ')}.`,
        actor,
        previousValue: c.status,
        newValue: updates.status
      });
    }

    // Track field edits
    const changedFields: string[] = [];
    if (updates.priority && updates.priority !== c.priority) changedFields.push(`Priority (${c.priority} → ${updates.priority})`);
    if (updates.io && updates.io !== c.io) changedFields.push(`IO (${updates.io})`);
    if (updates.title && updates.title !== c.title) changedFields.push(`Title`);
    if (updates.offence && updates.offence !== c.offence) changedFields.push(`Offence (${updates.offence})`);
    if (updates.range && updates.range !== c.range) changedFields.push(`Range (${updates.range})`);
    if (updates.beat && updates.beat !== c.beat) changedFields.push(`Beat (${updates.beat})`);
    if (updates.description && updates.description !== c.description) changedFields.push(`Description`);
    if (updates.sections && JSON.stringify(updates.sections) !== JSON.stringify(c.sections)) changedFields.push(`Sections`);

    if (changedFields.length > 0) {
      c.activities.unshift({
        id: `act-${Date.now()}-edit`,
        caseId: c.id,
        timestamp: nowStr,
        type: 'CASE_EDITED',
        title: 'Case Particulars Updated',
        description: `Edited fields: ${changedFields.join(', ')}.`,
        actor
      });
    }

    this.cases[idx] = { ...c, ...updates };
    this.saveCases();
    return this.cases[idx];
  }

  public addCaseActivity(caseId: string, activity: Omit<CaseActivity, 'id' | 'caseId'>): CaseActivity | null {
    const c = this.getCaseById(caseId);
    if (!c) return null;
    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }
    const newAct: CaseActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      caseId: c.id
    };
    c.activities.unshift(newAct);
    this.saveCases();
    return newAct;
  }

  public addInvestigationLog(caseId: string, log: Omit<InvestigationLog, 'id'>): InvestigationLog | null {
    const c = this.getCaseById(caseId);
    if (!c) return null;
    const newLog: InvestigationLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    c.investigationLogs.unshift(newLog);

    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    c.activities.unshift({
      id: `act-${Date.now()}-log`,
      caseId: c.id,
      timestamp: `${log.date} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'INVESTIGATION_LOG',
      title: `Investigation: ${log.action}`,
      description: log.description,
      actor: log.officer
    });

    if (c.status === 'FIR_REGISTERED') {
      const prevStatus = c.status;
      c.status = 'UNDER_INVESTIGATION';
      c.activities.unshift({
        id: `act-${Date.now()}-status`,
        caseId: c.id,
        timestamp: `${log.date} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: 'STATUS_CHANGE',
        title: 'Status: FIR_REGISTERED → UNDER_INVESTIGATION',
        description: 'Investigation initiated upon recording of field investigation log.',
        actor: log.officer,
        previousValue: prevStatus,
        newValue: 'UNDER_INVESTIGATION'
      });
    }

    this.saveCases();
    return newLog;
  }

  public addEvidence(caseId: string, evidence: Omit<EvidenceItem, 'id'>): EvidenceItem | null {
    const c = this.getCaseById(caseId);
    if (!c) return null;
    const newEv: EvidenceItem = {
      ...evidence,
      id: `ev-${Date.now()}`
    };
    c.evidence.unshift(newEv);

    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    c.activities.unshift({
      id: `act-${Date.now()}-ev`,
      caseId: c.id,
      timestamp: `${evidence.date} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'EVIDENCE_ADDED',
      title: `Evidence Attached: ${evidence.title}`,
      description: `${evidence.category} (${evidence.fileNumber || 'Ref doc'}) • Status: ${evidence.status}.`,
      actor: c.io
    });

    this.saveCases();
    return newEv;
  }

  public addHearing(caseId: string, hearing: Omit<HearingItem, 'id' | 'caseId' | 'caseNumber'>): HearingItem | null {
    const c = this.getCaseById(caseId);
    if (!c) return null;
    const newHearing: HearingItem = {
      ...hearing,
      id: `hr-${Date.now()}`,
      caseId: c.id,
      caseNumber: c.caseNumber
    };
    c.hearings.push(newHearing);

    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    c.activities.unshift({
      id: `act-${Date.now()}-hr`,
      caseId: c.id,
      timestamp: `${hearing.hearingDate} ${hearing.time || '10:30 AM'}`,
      type: 'HEARING_SCHEDULED',
      title: `Court Hearing Scheduled: ${hearing.stage}`,
      description: `${hearing.court} before ${hearing.judge}. Purpose: ${hearing.purpose}.`,
      actor: hearing.advocate || 'Court Registrar'
    });

    if (c.status === 'CHARGESHEET_FILED' || c.status === 'UNDER_INVESTIGATION') {
      const prevStatus = c.status;
      c.status = 'TRIAL';
      c.activities.unshift({
        id: `act-${Date.now()}-trial`,
        caseId: c.id,
        timestamp: `${hearing.hearingDate} 10:00 AM`,
        type: 'STATUS_CHANGE',
        title: `Status: ${prevStatus} → TRIAL`,
        description: 'Hearing scheduled; case placed on active court trial calendar.',
        actor: 'Court Registrar',
        previousValue: prevStatus,
        newValue: 'TRIAL'
      });
    }

    this.saveCases();
    return newHearing;
  }

  public fileChargeSheet(caseId: string, dscTokenName: string, courtName: string): ForestCase | null {
    const c = this.getCaseById(caseId);
    if (!c) return null;
    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19) + ' IST';
    const csNo = `CS-${c.caseNumber.replace(/\//g, '-')}`;

    const prevStatus = c.status;
    c.status = 'CHARGESHEET_FILED';
    c.chargeSheet = {
      isFiled: true,
      chargeSheetNo: csNo,
      filedDate: now.toISOString().split('T')[0],
      courtAssigned: courtName || 'Court of Chief Judicial Magistrate, Kawardha',
      signedWithDsc: true,
      dscTokenName: dscTokenName || 'Class 3 USB Token (Rajesh Kumar)',
      signedTimestamp: formattedTimestamp,
      publicProsecutorVetted: true
    };

    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    c.activities.unshift({
      id: `act-${Date.now()}-cs-stat`,
      caseId: c.id,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
      type: 'STATUS_CHANGE',
      title: `Status: ${prevStatus} → CHARGESHEET_FILED`,
      description: `Charge sheet formally compiled and filed in court.`,
      actor: c.io,
      previousValue: prevStatus,
      newValue: 'CHARGESHEET_FILED'
    });

    c.activities.unshift({
      id: `act-${Date.now()}-cs`,
      caseId: c.id,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
      type: 'CHARGESHEET_FILED',
      title: `Charge Sheet Filed: ${csNo}`,
      description: `Digitally signed via ${dscTokenName}. Designated Court: ${courtName}.`,
      actor: c.io
    });

    // Auto-schedule first hearing 2 weeks out
    const hearingDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const autoHearing: HearingItem = {
      id: `hr-${Date.now()}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      hearingDate,
      time: '10:30 AM',
      court: c.chargeSheet.courtAssigned || 'Court of Chief Judicial Magistrate, Kawardha',
      judge: 'Hon. Chief Judicial Magistrate',
      purpose: 'Cognizance & Supply of Charge Sheet Copies to Accused',
      stage: 'Framing of Charges',
      advocate: 'Public Prosecutor (Forest Wing)',
      priority: c.priority,
      notes: 'Summons issued to accused and panchas.',
      status: 'Scheduled'
    };
    c.hearings.push(autoHearing);

    // Add log
    c.investigationLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'Final Offence Report (Charge Sheet) Filed & E-Signed',
      date: now.toISOString().split('T')[0],
      officer: c.io,
      description: `Charge Sheet ${csNo} successfully vetted by Public Prosecutor, digitally signed via ${dscTokenName}, and submitted to ${courtName}.`,
      evidenceCount: c.evidence.length
    });

    this.saveCases();
    return c;
  }

  public recordJudgment(caseId: string, judgment: JudgmentDetails): ForestCase | null {
    const c = this.getCaseById(caseId);
    if (!c) return null;
    const prevStatus = c.status;
    c.judgment = judgment;
    c.status = 'JUDGMENT_DELIVERED';

    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    c.activities.unshift({
      id: `act-${Date.now()}-judg-stat`,
      caseId: c.id,
      timestamp: `${judgment.judgmentDate} 04:30 PM`,
      type: 'STATUS_CHANGE',
      title: `Status: ${prevStatus} → JUDGMENT_DELIVERED`,
      description: `Trial concluded with verdict: ${judgment.verdict}.`,
      actor: judgment.judge,
      previousValue: prevStatus,
      newValue: 'JUDGMENT_DELIVERED'
    });

    c.activities.unshift({
      id: `act-${Date.now()}-judg`,
      caseId: c.id,
      timestamp: `${judgment.judgmentDate} 04:00 PM`,
      type: 'JUDGMENT_RECORDED',
      title: `Court Judgment: ${judgment.verdict}`,
      description: `Sentence: ${judgment.sentence}. Fine: ${judgment.fine}. Presiding Judge: ${judgment.judge}.`,
      actor: judgment.judge
    });

    c.investigationLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'Court Judgment Delivered',
      date: judgment.judgmentDate,
      officer: c.io,
      description: `Judgment pronounced by ${judgment.judge}. Verdict: ${judgment.verdict}. Sentence: ${judgment.sentence}. Fine: ${judgment.fine}.`,
      evidenceCount: 1
    });

    this.saveCases();
    return c;
  }

  public fileAppeal(caseId: string, appealMemoNo: string, appealNotes: string): ForestCase | null {
    const c = this.getCaseById(caseId);
    if (!c || !c.judgment) return null;
    const prevStatus = c.status;
    c.judgment.appealFiled = true;
    c.judgment.appealMemoNo = appealMemoNo;
    c.judgment.appealNotes = appealNotes;
    c.status = 'APPEAL_FILED';

    if (!c.activities || c.activities.length === 0) {
      c.activities = generateInitialActivities(c);
    }

    c.activities.unshift({
      id: `act-${Date.now()}-appeal-stat`,
      caseId: c.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'STATUS_CHANGE',
      title: `Status: ${prevStatus} → APPEAL_FILED`,
      description: `Statutory revision/appeal admitted before Appellate Court.`,
      actor: 'State Standing Counsel',
      previousValue: prevStatus,
      newValue: 'APPEAL_FILED'
    });

    c.activities.unshift({
      id: `act-${Date.now()}-appeal`,
      caseId: c.id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'APPEAL_FILED',
      title: `Appeal Filed: Memo No. ${appealMemoNo}`,
      description: appealNotes || 'Statutory revision filed before High Court / Appellate Bench.',
      actor: 'State Standing Counsel'
    });

    // Schedule High Court / District Judge Hearing
    const appealHearingDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    c.hearings.push({
      id: `hr-${Date.now()}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      hearingDate: appealHearingDate,
      time: '11:00 AM',
      court: 'High Court of Chhattisgarh, Bilaspur / District Appellate Court',
      judge: 'Appellate Bench',
      purpose: 'Hearing on Admission of Appeal Memo No. ' + appealMemoNo,
      stage: 'Final Arguments',
      advocate: 'Govt. Advocate (Forest Dept)',
      priority: 'CRITICAL',
      notes: appealNotes,
      status: 'Scheduled'
    });

    c.investigationLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'Appeal / Revision Petition Filed',
      date: new Date().toISOString().split('T')[0],
      officer: 'DFO & State Standing Counsel',
      description: `Appeal Petition filed under Memo No. ${appealMemoNo}. Grounds: Inadequacy of sentence and conservation imperative.`,
      evidenceCount: 2
    });

    this.saveCases();
    return c;
  }

  public getAllHearings(): HearingItem[] {
    const all: HearingItem[] = [];
    this.cases.forEach(c => {
      c.hearings.forEach(h => {
        all.push({
          ...h,
          caseId: c.id,
          caseNumber: c.caseNumber,
          priority: h.priority || c.priority
        });
      });
    });
    return all.sort((a, b) => new Date(a.hearingDate).getTime() - new Date(b.hearingDate).getTime());
  }

  public getOfficers(): ForestOfficer[] {
    return [...this.officers];
  }

  public addOfficer(officer: Omit<ForestOfficer, 'id'>): ForestOfficer {
    const newOff: ForestOfficer = {
      ...officer,
      id: `off-${Date.now()}`
    };
    this.officers.push(newOff);
    this.saveOfficers();
    return newOff;
  }

  public getKPIs() {
    const total = this.cases.length;
    const firRegistered = this.cases.filter(c => c.status === 'FIR_REGISTERED').length;
    const underInvestigation = this.cases.filter(c => c.status === 'UNDER_INVESTIGATION').length;
    const chargeSheetFiled = this.cases.filter(c => c.status === 'CHARGESHEET_FILED').length;
    const trial = this.cases.filter(c => c.status === 'TRIAL').length;
    const judgmentDelivered = this.cases.filter(c => c.status === 'JUDGMENT_DELIVERED').length;
    const appealFiled = this.cases.filter(c => c.status === 'APPEAL_FILED').length;

    // Conviction rate calculation
    const judged = this.cases.filter(c => c.judgment);
    const convicted = judged.filter(c => c.judgment?.verdict === 'Convicted').length;
    const convictionRate = judged.length > 0 ? Math.round((convicted / judged.length) * 100) : 74;

    const criticalCases = this.cases.filter(c => c.priority === 'CRITICAL').length;
    const upcomingHearingsCount = this.getAllHearings().filter(h => h.status === 'Scheduled').length;

    return {
      total,
      firRegistered,
      underInvestigation,
      chargeSheetFiled,
      trial,
      judgmentDelivered,
      appealFiled,
      convictionRate,
      criticalCases,
      upcomingHearingsCount
    };
  }

  public exportAllData(): string {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      cases: this.cases,
      officers: this.officers
    }, null, 2);
  }

  public importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.cases)) {
        this.cases = parsed.cases;
        if (Array.isArray(parsed.officers)) {
          this.officers = parsed.officers;
        }
        this.saveCases();
        this.saveOfficers();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public resetToDefault() {
    this.cases = INITIAL_CASES;
    this.officers = INITIAL_OFFICERS;
    this.saveCases();
    this.saveOfficers();
  }
}

export const caseStore = new CaseStore();
