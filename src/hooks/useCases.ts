import { useState, useEffect } from 'react';
import { caseStore } from '../services/caseStore';
import type { ForestCase, HearingItem, ForestOfficer } from '../types/case';

export function useCases() {
  const [cases, setCases] = useState<ForestCase[]>(() => caseStore.getCases());
  const [hearings, setHearings] = useState<HearingItem[]>(() => caseStore.getAllHearings());
  const [officers, setOfficers] = useState<ForestOfficer[]>(() => caseStore.getOfficers());
  const [kpis, setKpis] = useState(() => caseStore.getKPIs());

  useEffect(() => {
    const unsubscribe = caseStore.subscribe(() => {
      setCases(caseStore.getCases());
      setHearings(caseStore.getAllHearings());
      setOfficers(caseStore.getOfficers());
      setKpis(caseStore.getKPIs());
    });
    return unsubscribe;
  }, []);

  return {
    cases,
    hearings,
    officers,
    kpis,
    getCaseById: (id: string) => caseStore.getCaseById(id),
    createCase: (data: Partial<ForestCase>) => caseStore.createCase(data),
    bulkCreateCases: (data: Partial<ForestCase>[]) => caseStore.bulkCreateCases(data),
    updateCase: (id: string, updates: Partial<ForestCase>, actor?: string) => caseStore.updateCase(id, updates, actor),
    addCaseActivity: (caseId: string, activity: Parameters<typeof caseStore.addCaseActivity>[1]) =>
      caseStore.addCaseActivity(caseId, activity),
    addInvestigationLog: (caseId: string, log: Parameters<typeof caseStore.addInvestigationLog>[1]) => 
      caseStore.addInvestigationLog(caseId, log),
    addEvidence: (caseId: string, evidence: Parameters<typeof caseStore.addEvidence>[1]) => 
      caseStore.addEvidence(caseId, evidence),
    addHearing: (caseId: string, hearing: Parameters<typeof caseStore.addHearing>[1]) => 
      caseStore.addHearing(caseId, hearing),
    fileChargeSheet: (caseId: string, token: string, court: string) => 
      caseStore.fileChargeSheet(caseId, token, court),
    recordJudgment: (caseId: string, judgment: Parameters<typeof caseStore.recordJudgment>[1]) => 
      caseStore.recordJudgment(caseId, judgment),
    fileAppeal: (caseId: string, memoNo: string, notes: string) => 
      caseStore.fileAppeal(caseId, memoNo, notes),
    addOfficer: (officer: Parameters<typeof caseStore.addOfficer>[0]) => 
      caseStore.addOfficer(officer),
    resetToDefault: () => caseStore.resetToDefault()
  };
}
