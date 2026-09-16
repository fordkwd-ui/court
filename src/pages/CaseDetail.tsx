import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { 
  FileText, 
  MapPin, 
  Calendar as CalendarIcon, 
  User, 
  ChevronLeft, 
  Download, 
  FileSignature, 
  UploadCloud, 
  Save, 
  CheckCircle, 
  Plus, 
  Shield, 
  Gavel, 
  Printer, 
  Truck, 
  Trees, 
  CheckCircle2, 
  Copy, 
  Check,
  FileEdit,
  History
} from 'lucide-react';
import './CaseDetail.css';
import { useCases } from '../hooks/useCases';
import type { EvidenceItem, HearingItem } from '../types/case';
import { ActivityTimeline } from '../components/cases/ActivityTimeline';
import { EditCaseModal } from '../components/cases/EditCaseModal';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    cases, 
    getCaseById, 
    addInvestigationLog, 
    addEvidence, 
    addHearing, 
    fileChargeSheet, 
    recordJudgment, 
    fileAppeal,
    updateCase,
    addCaseActivity
  } = useCases();

  // Active Tab state (defaults to 'overview' or URL param)
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  // Find the case
  const currentCase = (id ? getCaseById(id) : null) || cases[0];

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [isChargeSheetModalOpen, setIsChargeSheetModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Investigation Log Form
  const [logAction, setLogAction] = useState('Site Inspection');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logDesc, setLogDesc] = useState('');
  const [logOfficer, setLogOfficer] = useState(currentCase?.io || 'Rajesh Kumar (IO)');

  // Evidence Form
  const [evTitle, setEvTitle] = useState('');
  const [evCategory, setEvCategory] = useState<EvidenceItem['category']>('Panchnama Memo');
  const [evFileNumber, setEvFileNumber] = useState('');
  const evSize = '2.4 MB';

  // Hearing Form
  const [hrDate, setHrDate] = useState('');
  const [hrTime, setHrTime] = useState('11:00 AM');
  const [hrCourt, setHrCourt] = useState('Court of Chief Judicial Magistrate, Kawardha');
  const [hrJudge, setHrJudge] = useState('Hon. Chief Judicial Magistrate');
  const [hrPurpose, setHrPurpose] = useState('Examination of Prosecution Witnesses');
  const [hrStage, setHrStage] = useState<HearingItem['stage']>('Prosecution Evidence');
  const [hrAdvocate] = useState('Shri Arvind Shukla (PP)');
  const [hrNotes, setHrNotes] = useState('');

  // Charge Sheet state
  const [csStep, setCsStep] = useState(1);
  const [dscPin, setDscPin] = useState('');
  const dscToken = 'ePass2003 - Class 3 (Rajesh Kumar, IO)';
  const [assignedCourt, setAssignedCourt] = useState('Court of Chief Judicial Magistrate, Kawardha');
  const [pinError, setPinError] = useState('');

  // Judgment / OCR State
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // Appeal Modal State
  const [appealMemoNo, setAppealMemoNo] = useState('CRA-2024-412');
  const [appealNotes, setAppealNotes] = useState('Revision preferred before High Court on grounds of sentence inadequacy for Schedule-I offence under Wildlife Protection Act.');

  if (!currentCase) {
    return (
      <div className="empty-state" style={{ padding: '4rem 1rem' }}>
        <FileText size={48} className="empty-icon" />
        <h2>Case Not Found</h2>
        <p>The requested case identifier does not exist in the database.</p>
        <Link to="/cases"><Button>Return to Case Registry</Button></Link>
      </div>
    );
  }

  // Calculate days remaining to appeal if judgment exists
  const getAppealRemainingDays = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const appealDaysLeft = getAppealRemainingDays(currentCase.judgment?.appealDeadline);

  const copyCoordinates = () => {
    navigator.clipboard.writeText(currentCase.gpsCoordinates);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleAddLog = () => {
    if (!logDesc.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addInvestigationLog(currentCase.id, {
        action: logAction,
        date: logDate,
        officer: logOfficer,
        description: logDesc,
        evidenceCount: 1
      });
      setIsSubmitting(false);
      setIsLogModalOpen(false);
      setLogDesc('');
    }, 600);
  };

  const handleAddEvidence = () => {
    if (!evTitle.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addEvidence(currentCase.id, {
        title: evTitle,
        category: evCategory,
        date: new Date().toISOString().split('T')[0],
        size: evSize || '1.8 MB',
        status: 'Verified',
        fileNumber: evFileNumber || `EV-${new Date().getFullYear()}-${Math.floor(Math.random() * 8000) + 1000}`
      });
      setIsSubmitting(false);
      setIsEvidenceModalOpen(false);
      setEvTitle('');
      setEvFileNumber('');
    }, 600);
  };

  const handleAddHearing = () => {
    if (!hrDate) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addHearing(currentCase.id, {
        hearingDate: hrDate,
        time: hrTime,
        court: hrCourt,
        judge: hrJudge,
        purpose: hrPurpose,
        stage: hrStage,
        advocate: hrAdvocate,
        priority: currentCase.priority,
        notes: hrNotes,
        status: 'Scheduled'
      });
      setIsSubmitting(false);
      setIsHearingModalOpen(false);
      setHrDate('');
      setHrNotes('');
    }, 600);
  };

  const handleCompileChargeSheet = () => {
    if (csStep === 1) {
      setCsStep(2);
      return;
    }
    if (csStep === 2) {
      if (!dscPin || dscPin.length < 4) {
        setPinError('Please enter your 4 to 8 digit DSC PIN');
        return;
      }
      setIsSubmitting(true);
      setPinError('');
      setTimeout(() => {
        fileChargeSheet(currentCase.id, dscToken, assignedCourt);
        setIsSubmitting(false);
        setCsStep(3);
      }, 1200);
    }
  };

  const handleRunOcrExtraction = () => {
    setIsProcessingOCR(true);
    setTimeout(() => {
      const isPoaching = currentCase.offence === 'Poaching' || currentCase.offence === 'Wildlife Trade';
      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      recordJudgment(currentCase.id, {
        verdict: 'Convicted',
        conviction: isPoaching 
          ? 'Guilty under Sec 9 & 39 r/w Sec 51 of Wildlife (Protection) Act, 1972' 
          : 'Guilty under Sec 26 & 33 Indian Forest Act, 1927',
        sentence: isPoaching ? '3 Years Rigorous Imprisonment (RI)' : '1 Year Simple Imprisonment',
        fine: isPoaching ? '₹50,000 (with 6 months default SI)' : '₹25,000',
        judgmentDate: new Date().toISOString().split('T')[0],
        judge: 'Hon. Chief Judicial Magistrate, Kawardha',
        appealDeadline: deadline,
        appealFiled: false,
        appealNotes: 'Forest Department legal team advised to examine sentencing adequacy under Wildlife Protection Act amendments.'
      });
      setIsProcessingOCR(false);
    }, 2000);
  };

  const handleFileAppeal = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      fileAppeal(currentCase.id, appealMemoNo, appealNotes);
      setIsSubmitting(false);
      setIsAppealModalOpen(false);
    }, 800);
  };

  // Lifecycle steps determination
  const lifecycleSteps = [
    { label: 'Offence Reported (POR)', sub: `${currentCase.date}`, completed: true },
    { 
      label: 'Investigation & Evidence', 
      sub: `${currentCase.investigationLogs.length} logs recorded`, 
      completed: currentCase.status !== 'FIR_REGISTERED',
      active: currentCase.status === 'UNDER_INVESTIGATION' || currentCase.status === 'FIR_REGISTERED'
    },
    { 
      label: 'Charge Sheet Filed (DSC)', 
      sub: currentCase.chargeSheet.isFiled ? `${currentCase.chargeSheet.chargeSheetNo}` : 'Pending Compilation', 
      completed: currentCase.chargeSheet.isFiled,
      active: currentCase.status === 'CHARGESHEET_FILED'
    },
    { 
      label: 'Court Trial', 
      sub: `${currentCase.hearings.length} hearings tracked`, 
      completed: currentCase.status === 'JUDGMENT_DELIVERED' || currentCase.status === 'APPEAL_FILED',
      active: currentCase.status === 'TRIAL'
    },
    { 
      label: 'Judgment Delivered', 
      sub: currentCase.judgment ? `${currentCase.judgment.verdict}` : 'Awaiting Verdict', 
      completed: !!currentCase.judgment,
      active: currentCase.status === 'JUDGMENT_DELIVERED'
    },
    { 
      label: 'Appeal / Revision', 
      sub: currentCase.status === 'APPEAL_FILED' ? 'Appellate Bench Active' : 'Limitation Tracking', 
      completed: currentCase.status === 'APPEAL_FILED',
      active: currentCase.status === 'APPEAL_FILED'
    }
  ];

  return (
    <div className="case-detail-container">
      {/* Top Header */}
      <div className="case-header">
        <div className="case-header-left">
          <Link to="/cases" className="back-link">
            <ChevronLeft size={16} /> Case Registry
          </Link>
          <div className="case-title-row" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <h1 className="case-title">{currentCase.caseNumber}</h1>
            <Badge variant={
              currentCase.status === 'JUDGMENT_DELIVERED' ? 'success' :
              currentCase.status === 'APPEAL_FILED' ? 'danger' :
              currentCase.status === 'UNDER_INVESTIGATION' ? 'warning' : 'info'
            }>
              {currentCase.status.replace(/_/g, ' ')}
            </Badge>
            <Badge variant={currentCase.priority === 'CRITICAL' ? 'danger' : currentCase.priority === 'HIGH' ? 'warning' : 'default'}>
              {currentCase.priority} Priority
            </Badge>
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            {currentCase.title}
          </p>
        </div>

        <div className="case-header-actions" style={{ flexWrap: 'wrap' }}>
          <Button 
            variant="outline" 
            leftIcon={<FileEdit size={16} />}
            onClick={() => setIsEditModalOpen(true)}
            id="btn-case-edit"
          >
            Edit Case
          </Button>

          <Button 
            variant="outline" 
            leftIcon={<Printer size={18} />}
            onClick={() => setIsDossierModalOpen(true)}
          >
            Export Form 9
          </Button>

          {!currentCase.chargeSheet.isFiled ? (
            <Button 
              variant="primary" 
              leftIcon={<FileSignature size={18} />} 
              onClick={() => { setIsChargeSheetModalOpen(true); setCsStep(1); }}
            >
              Sign Charge Sheet
            </Button>
          ) : (
            <Button 
              variant="outline" 
              leftIcon={<Gavel size={18} />}
              onClick={() => { handleTabChange('hearings'); setIsHearingModalOpen(true); }}
            >
              Schedule Hearing
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => handleTabChange('overview')}
        >
          Case Overview
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`} 
          onClick={() => handleTabChange('activity')}
          id="tab-activity-timeline"
        >
          Activity Timeline ({currentCase.activities?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'investigation' ? 'active' : ''}`} 
          onClick={() => handleTabChange('investigation')}
        >
          Investigation Logs ({currentCase.investigationLogs.length})
        </button>
        <button 
          className={`tab ${activeTab === 'evidence' ? 'active' : ''}`} 
          onClick={() => handleTabChange('evidence')}
        >
          Evidence ({currentCase.evidence.length})
        </button>
        <button 
          className={`tab ${activeTab === 'hearings' ? 'active' : ''}`} 
          onClick={() => handleTabChange('hearings')}
        >
          Court Hearings ({currentCase.hearings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'judgment' ? 'active' : ''}`} 
          onClick={() => handleTabChange('judgment')}
        >
          Judgment & Appeals {currentCase.judgment && '✓'}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="overview-grid">
            {/* Left Column */}
            <div className="details-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Offence Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} /> Offence Particulars
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span className="detail-label"><Trees size={16} /> Offence Nature</span>
                      <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-primary-900)' }}>
                        {currentCase.offence}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><CalendarIcon size={16} /> Detection Date & Time</span>
                      <span className="detail-value">{currentCase.date} at {currentCase.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><MapPin size={16} /> Forest Beat & Comp.</span>
                      <span className="detail-value">{currentCase.beat} ({currentCase.compartment})</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><MapPin size={16} /> GPS Coordinates</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code>{currentCase.gpsCoordinates}</code>
                        <button 
                          onClick={copyCoordinates}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCoords ? 'var(--color-success)' : 'var(--color-primary-600)' }}
                          title="Copy Coordinates"
                        >
                          {copiedCoords ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><User size={16} /> Investigating Officer</span>
                      <span className="detail-value">{currentCase.io}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><Shield size={16} /> Reporting Guard</span>
                      <span className="detail-value">{currentCase.reportingOfficer}</span>
                    </div>
                  </div>
                  
                  <div className="sections-container">
                    <h4 className="sub-title">Applicable Acts & Penal Sections</h4>
                    <div className="badge-row">
                      {currentCase.sections.map(sec => (
                        <Badge key={sec} variant="default" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-900)', border: '1px solid var(--color-primary-100)' }}>
                          {sec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="description-container" style={{ margin: 0 }}>
                    <h4 className="sub-title">Patrol Incident Narrative</h4>
                    <p className="description-text" style={{ backgroundColor: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      {currentCase.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Seized Items & Malkhana Register */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={18} /> Seized Contraband, Timber & Vehicle Register
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentCase.seizedItems.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No seized property recorded.</p>
                  ) : (
                    <div className="table-responsive-wrapper">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property / Vehicle Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Quantity / Vol.</TableHead>
                            <TableHead>Est. Value</TableHead>
                            <TableHead>Malkhana Custody</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentCase.seizedItems.map(item => (
                            <TableRow key={item.id}>
                              <TableCell><strong>{item.item}</strong></TableCell>
                              <TableCell><Badge variant="default">{item.category}</Badge></TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell style={{ fontWeight: 600, color: 'var(--color-primary-800)' }}>{item.estimatedValue}</TableCell>
                              <TableCell>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                  {item.malkhanaLocation}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accused Persons Sheet */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} /> Accused Persons & Remand Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentCase.accused.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No accused individuals recorded or identified yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {currentCase.accused.map(acc => (
                        <div 
                          key={acc.id}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-base)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <strong style={{ fontSize: '0.95rem' }}>{acc.name}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                (Age: {acc.age}, S/o {acc.fatherName})
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              📍 {acc.village} • ID: {acc.idProof}
                            </p>
                          </div>
                          <Badge variant={
                            acc.status === 'Judicial Custody' ? 'danger' :
                            acc.status === 'Under Interrogation' ? 'warning' : 'info'
                          }>
                            {acc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Interactive Timeline & E-Sign Stamp */}
            <div className="timeline-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Charge Sheet E-Sign Status Stamp */}
              {currentCase.chargeSheet.isFiled && (
                <Card style={{ border: '2px solid var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.03)' }}>
                  <CardContent style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-success)' }}>Digitally Signed Charge Sheet</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Vetted by Public Prosecutor
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div><strong>CS Number:</strong> {currentCase.chargeSheet.chargeSheetNo}</div>
                      <div><strong>Court:</strong> {currentCase.chargeSheet.courtAssigned}</div>
                      <div><strong>Token:</strong> {currentCase.chargeSheet.dscTokenName}</div>
                      <div><strong>Timestamp:</strong> {currentCase.chargeSheet.signedTimestamp}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Case Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Legal Lifecycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="case-timeline">
                    {lifecycleSteps.map((step) => (
                      <div 
                        key={step.label} 
                        className={`timeline-step ${step.completed ? 'completed' : step.active ? 'active' : 'pending'}`}
                      >
                        <div className="step-indicator"></div>
                        <div className="step-content">
                          <strong>{step.label}</strong>
                          <span>{step.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Mini Card */}
              <Card>
                <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem' }}>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <History size={16} /> Recent Activity
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => handleTabChange('activity')}
                  >
                    View All →
                  </Button>
                </CardHeader>
                <CardContent>
                  {(!currentCase.activities || currentCase.activities.length === 0) ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      No activity recorded.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {currentCase.activities.slice(0, 3).map((act, idx) => (
                        <div 
                          key={act.id || idx}
                          style={{ 
                            padding: '0.6rem 0.75rem', 
                            borderRadius: 'var(--radius-sm)', 
                            backgroundColor: 'var(--color-surface-hover)', 
                            fontSize: '0.8rem',
                            borderLeft: act.type === 'STATUS_CHANGE' ? '3px solid var(--color-warning)' : '3px solid var(--color-primary)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{act.title}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{act.timestamp.split(' ')[0]}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                            {act.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ================= TAB: ACTIVITY TIMELINE ================= */}
        {activeTab === 'activity' && (
          <ActivityTimeline
            currentCase={currentCase}
            onAddActivity={(activity) => addCaseActivity(currentCase.id, activity)}
            onEditCase={() => setIsEditModalOpen(true)}
          />
        )}

        {/* ================= TAB 2: INVESTIGATION LOGS ================= */}
        {activeTab === 'investigation' && (
          <Card>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Investigation Diary</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Case diary under Sec. 52 IFA / CrPC.
                </p>
              </div>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsLogModalOpen(true)}>
                Add Investigation Entry
              </Button>
            </CardHeader>
            <CardContent>
              {currentCase.investigationLogs.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h3>No Investigation Logs</h3>
                  <p>Document site visits, seizures, or witness statements.</p>
                  <Button onClick={() => setIsLogModalOpen(true)}>Add First Entry</Button>
                </div>
              ) : (
                <div className="logs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentCase.investigationLogs.map(log => (
                    <div 
                      key={log.id} 
                      style={{ 
                        border: '1px solid var(--color-border)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: '1.25rem',
                        backgroundColor: 'var(--color-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary-900)' }}>{log.action}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.1rem' }}>
                            By Officer: {log.officer}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          {log.date}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 0.75rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {log.description}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Badge variant="info">{log.evidenceCount} Document/Photo Attached</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ================= TAB 3: EVIDENCE REPOSITORY ================= */}
        {activeTab === 'evidence' && (
          <Card>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle>Case Evidence & Panchnama Dossier</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Certified Panchnamas, Spot Maps, TFRI/FSL forensic reports, and seizure memos.
                </p>
              </div>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsEvidenceModalOpen(true)}>
                Upload Evidence Document
              </Button>
            </CardHeader>
            <CardContent>
              {currentCase.evidence.length === 0 ? (
                <div className="empty-state">
                  <UploadCloud size={48} className="empty-icon" />
                  <h3>No Evidence Documents Uploaded</h3>
                  <p>Upload Panchnamas, TFRI Forensic certificates, or Geo-tagged site photos.</p>
                  <Button onClick={() => setIsEvidenceModalOpen(true)}>Upload Document</Button>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>File Number / Reference</TableHead>
                        <TableHead>Date Filed</TableHead>
                        <TableHead>Verification Status</TableHead>
                        <TableHead>File Size</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCase.evidence.map(ev => (
                        <TableRow key={ev.id}>
                          <TableCell>
                            <strong>{ev.title}</strong>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{ev.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <code>{ev.fileNumber}</code>
                          </TableCell>
                          <TableCell>{ev.date}</TableCell>
                          <TableCell>
                            <Badge variant={ev.status === 'Submitted to Court' ? 'success' : 'info'}>
                              {ev.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{ev.size}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              leftIcon={<Download size={14} />}
                              onClick={() => alert(`Simulated downloading certified copy of: ${ev.title}`)}
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ================= TAB 4: HEARINGS ================= */}
        {activeTab === 'hearings' && (
          <Card>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <CardTitle>Court Hearings & Summons Schedule</CardTitle>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Hearing dates before Chief Judicial Magistrate, Sessions Court, and High Court benches.
                </p>
              </div>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsHearingModalOpen(true)}>
                Schedule Next Hearing
              </Button>
            </CardHeader>
            <CardContent>
              {currentCase.hearings.length === 0 ? (
                <div className="empty-state">
                  <Gavel size={48} className="empty-icon" />
                  <h3>No Court Hearings Scheduled</h3>
                  <p>Once the charge sheet is filed or summons are issued, schedule hearings here.</p>
                  <Button onClick={() => setIsHearingModalOpen(true)}>Schedule Hearing</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentCase.hearings.map(h => (
                    <div key={h.id} className="hearing-card">
                      <div className="hearing-card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-primary-900)' }}>{h.purpose}</strong>
                          <Badge variant={h.status === 'Completed' ? 'success' : 'info'}>{h.status}</Badge>
                          <Badge variant="default">{h.stage}</Badge>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          🏛️ <strong>{h.court}</strong> • {h.judge}
                        </p>
                        {h.notes && (
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-base)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                            <strong>Prosecutor Notes:</strong> {h.notes}
                          </p>
                        )}
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                          Appearing Counsel: {h.advocate}
                        </p>
                      </div>

                      <div className="hearing-card-date">
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
                          {h.hearingDate}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{h.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ================= TAB 5: JUDGMENT & APPEALS ================= */}
        {activeTab === 'judgment' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Upload & OCR Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Court Order Upload & OCR Extractor</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  onClick={!isProcessingOCR && !currentCase.judgment ? handleRunOcrExtraction : undefined}
                  style={{ 
                    border: '2px dashed var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '3rem 2rem', 
                    textAlign: 'center', 
                    backgroundColor: currentCase.judgment ? 'var(--color-primary-50)' : 'var(--color-bg-base)',
                    cursor: !isProcessingOCR && !currentCase.judgment ? 'pointer' : 'default',
                    transition: 'all 0.3s'
                  }}
                >
                  {isProcessingOCR ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div className="spinner" style={{ width: '2rem', height: '2rem', border: '3px solid var(--color-primary-200)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-primary-800)' }}>Running Legal OCR Parser...</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Parsing Conviction Sections, Sentence, Fine and 30-Day Limitation Act appeal deadline.
                      </p>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  ) : currentCase.judgment ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle size={48} style={{ color: 'var(--color-success)' }} />
                      <h3 style={{ margin: 0, color: 'var(--color-primary-900)' }}>Judgment Processed & Verified</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Parsed order from {currentCase.judgment.judge} dated {currentCase.judgment.judgmentDate}.
                      </p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem auto' }} />
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload Certified Copy of Judgment</h3>
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        Click to simulate uploading court order PDF and running automated extraction
                      </p>
                      <Button size="sm" variant="primary">Run Order Parser</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Extracted Details & Appeals Card */}
            <Card>
              <CardHeader>
                <CardTitle>Extracted Conviction & Statutory Appeal Window</CardTitle>
              </CardHeader>
              <CardContent>
                {!currentCase.judgment ? (
                  <div className="empty-state" style={{ padding: '3rem 0' }}>
                    <p>Upload or parse a court judgment order to see sentence analysis and appeal limitation tracking.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Verdict</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <Badge variant={currentCase.judgment.verdict === 'Convicted' ? 'success' : 'danger'}>
                          {currentCase.judgment.verdict}
                        </Badge>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          Pronounced: {currentCase.judgment.judgmentDate}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Conviction Finding</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                        {currentCase.judgment.conviction}
                      </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Awarded Sentence</span>
                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '0.95rem' }}>{currentCase.judgment.sentence}</p>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Awarded Fine</span>
                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-primary-800)' }}>{currentCase.judgment.fine}</p>
                      </div>
                    </div>

                    {/* Appeal Deadline Section */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.875rem' }}>
                            <CalendarIcon size={16} /> Statutory Appeal Deadline
                          </div>
                          <p style={{ margin: '0.25rem 0 0 0', fontWeight: 700, fontSize: '1.25rem' }}>
                            {currentCase.judgment.appealDeadline}
                          </p>
                          {appealDaysLeft !== null && (
                            <span style={{ fontSize: '0.75rem', color: appealDaysLeft <= 7 ? 'var(--color-danger)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                              {appealDaysLeft > 0 ? `⏳ ${appealDaysLeft} days remaining in statutory limitation period` : '⚠️ Limitation period expired'}
                            </span>
                          )}
                        </div>

                        {currentCase.judgment.appealFiled ? (
                          <div style={{ textAlign: 'right' }}>
                            <Badge variant="success">Appeal Memo Filed ({currentCase.judgment.appealMemoNo})</Badge>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                              Pending before Appellate Bench
                            </span>
                          </div>
                        ) : (
                          <Button 
                            variant="danger"
                            onClick={() => setIsAppealModalOpen(true)}
                          >
                            Draft Forest Appeal / Revision
                          </Button>
                        )}
                      </div>

                      {currentCase.judgment.appealNotes && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          <strong>Appellate Notes:</strong> {currentCase.judgment.appealNotes}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD INVESTIGATION LOG ================= */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Record Investigation Diary Entry"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddLog} isLoading={isSubmitting} leftIcon={<Save size={18} />}>
              Save Diary Entry
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Action Classification *" 
            value={logAction}
            onChange={(e) => setLogAction(e.target.value)}
            options={[
              { value: 'Site Inspection & Spot Map', label: 'Site Inspection & Spot Map' },
              { value: 'Spot Panchnama (Form 9)', label: 'Spot Panchnama (Form 9)' },
              { value: 'Seizure of Contraband / Vehicle', label: 'Seizure of Contraband / Vehicle' },
              { value: 'Accused Interrogation / Confession', label: 'Accused Interrogation' },
              { value: 'Production of Accused before Magistrate', label: 'Production before Magistrate' },
              { value: 'Forensic Specimen Despatch (TFRI/WII)', label: 'Forensic Specimen Despatch' },
              { value: 'Witness Statement Recording', label: 'Witness Statement Recording' },
            ]}
          />
          <div className="form-grid-2">
            <Input 
              label="Action Date *" 
              type="date" 
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
            <Input 
              label="Recording Officer *" 
              value={logOfficer}
              onChange={(e) => setLogOfficer(e.target.value)}
            />
          </div>
          <Textarea 
            label="Detailed Investigation Findings & Actions *" 
            placeholder="Record measurements, witness remarks, recovered implements, or remand orders..."
            rows={4}
            value={logDesc}
            onChange={(e) => setLogDesc(e.target.value)}
          />
        </div>
      </Modal>

      {/* ================= MODAL: UPLOAD EVIDENCE ================= */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title="Upload Certified Case Evidence Document"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEvidenceModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddEvidence} isLoading={isSubmitting} leftIcon={<UploadCloud size={18} />}>
              Upload & Seal Evidence
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Document Title *" 
            placeholder="e.g. TFRI Wood Anatomy Species Authentication Certificate"
            value={evTitle}
            onChange={(e) => setEvTitle(e.target.value)}
            required
          />
          <div className="form-grid-2">
            <Select 
              label="Document Classification *" 
              value={evCategory}
              onChange={(e) => setEvCategory(e.target.value as any)}
              options={[
                { value: 'Panchnama Memo', label: 'Panchnama Memo' },
                { value: 'Site Photo', label: 'Geo-tagged Site Photo' },
                { value: 'Forensic Report', label: 'Forensic Report (WII/TFRI/FSL)' },
                { value: 'Seizure Memo', label: 'Seizure Memo (Form 9)' },
                { value: 'Witness Statement', label: 'Witness Deposition / Statement' },
              ]}
            />
            <Input 
              label="Official Memo / Dispatch Number" 
              placeholder="e.g. TFRI-BOT-2024-811"
              value={evFileNumber}
              onChange={(e) => setEvFileNumber(e.target.value)}
            />
          </div>
          <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-base)' }}>
            <UploadCloud size={36} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 0.5rem auto' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Click to select PDF or image file</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>PDF, JPG, PNG up to 25MB (SHA-256 Checksum Verified)</p>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: SCHEDULE HEARING ================= */}
      <Modal
        isOpen={isHearingModalOpen}
        onClose={() => setIsHearingModalOpen(false)}
        title="Schedule Court Hearing & Issue Summons"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsHearingModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddHearing} isLoading={isSubmitting} leftIcon={<CalendarIcon size={18} />}>
              Save to Court Calendar
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid-2">
            <Input 
              label="Hearing Date *" 
              type="date" 
              value={hrDate}
              onChange={(e) => setHrDate(e.target.value)}
              required
            />
            <Input 
              label="Court Time *" 
              placeholder="e.g. 11:00 AM"
              value={hrTime}
              onChange={(e) => setHrTime(e.target.value)}
            />
          </div>
          <Input 
            label="Court Name *" 
            value={hrCourt}
            onChange={(e) => setHrCourt(e.target.value)}
            required
          />
          <div className="form-grid-2">
            <Input 
              label="Presiding Judge" 
              value={hrJudge}
              onChange={(e) => setHrJudge(e.target.value)}
            />
            <Select 
              label="Stage of Trial *" 
              value={hrStage}
              onChange={(e) => setHrStage(e.target.value as any)}
              options={[
                { value: 'Framing of Charges', label: 'Framing of Charges' },
                { value: 'Prosecution Evidence', label: 'Prosecution Evidence (PW)' },
                { value: 'Defense Arguments', label: 'Defense Arguments (DW)' },
                { value: 'Final Arguments', label: 'Final Arguments' },
                { value: 'Pronouncement of Judgment', label: 'Pronouncement of Judgment' },
              ]}
            />
          </div>
          <Input 
            label="Purpose of Listing *" 
            placeholder="e.g. Cross-examination of PW-1 (Beat Guard) & production of Malkhana seized logs"
            value={hrPurpose}
            onChange={(e) => setHrPurpose(e.target.value)}
            required
          />
          <Textarea 
            label="Prosecution Advocate Instructions" 
            placeholder="Brief for Govt Pleader or Standing Counsel..."
            rows={2}
            value={hrNotes}
            onChange={(e) => setHrNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* ================= MODAL: CHARGE SHEET COMPILE & SIGN ================= */}
      <Modal
        isOpen={isChargeSheetModalOpen}
        onClose={() => setIsChargeSheetModalOpen(false)}
        title="Final Offence Report (Charge Sheet) Compilation & E-Sign"
        size="lg"
        footer={
          csStep === 3 ? (
            <Button variant="primary" onClick={() => setIsChargeSheetModalOpen(false)}>
              Done & View Dossier
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsChargeSheetModalOpen(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleCompileChargeSheet} 
                isLoading={isSubmitting}
                leftIcon={<FileSignature size={18} />}
              >
                {csStep === 1 ? 'Proceed to Digital Signature →' : 'Apply DSC Token & File'}
              </Button>
            </>
          )
        }
      >
        {csStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-900)', border: '1px solid var(--color-primary-100)' }}>
              <strong>Statutory Summary:</strong> Auto-compiling case <strong>{currentCase.caseNumber}</strong> with {currentCase.evidence.length} certified evidence documents, {currentCase.accused.length} accused, and {currentCase.seizedItems.length} seized properties.
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>1. Designated Trial Court</h4>
              <Input 
                value={assignedCourt}
                onChange={(e) => setAssignedCourt(e.target.value)}
                label="Court to submit Charge Sheet"
              />
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>2. Accused Custody Roster</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accused Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Remand Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCase.accused.map(acc => (
                    <TableRow key={acc.id}>
                      <TableCell><strong>{acc.name}</strong></TableCell>
                      <TableCell>{acc.age}</TableCell>
                      <TableCell>{acc.village}</TableCell>
                      <TableCell><Badge variant="danger">{acc.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>3. Evidence List to accompany Charge Sheet</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {currentCase.evidence.map(e => (
                  <li key={e.id}>{e.title} ({e.fileNumber})</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {csStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <Shield size={48} style={{ color: 'var(--color-primary-700)', margin: '0 auto 0.5rem auto' }} />
              <h3 style={{ margin: 0 }}>Apply Class 3 Digital Signature Certificate (DSC)</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Compliant with Information Technology Act 2000 and High Court e-filing mandates.
              </p>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', backgroundColor: 'var(--color-bg-base)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Detected Crypto USB Token</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{dscToken}</p>
              </div>
              <Input 
                type="password"
                label="Enter 6-Digit DSC Security PIN *"
                placeholder="••••••"
                value={dscPin}
                onChange={(e) => setDscPin(e.target.value)}
                error={pinError}
                autoFocus
              />
            </div>
          </div>
        )}

        {csStep === 3 && (
          <div className="empty-state" style={{ padding: '2rem 0' }}>
            <CheckCircle2 size={64} style={{ color: 'var(--color-success)' }} />
            <h2 style={{ color: 'var(--color-success)', margin: '0.5rem 0 0.25rem 0' }}>Charge Sheet Filed Successfully!</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto 1rem auto' }}>
              Case status updated to <strong>CHARGESHEET_FILED</strong>. Initial court appearance automatically entered into calendar.
            </p>
            <div style={{ backgroundColor: 'var(--color-bg-base)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'left', display: 'inline-block' }}>
              <div><strong>Charge Sheet No:</strong> CS-{currentCase.caseNumber.replace(/\//g, '-')}</div>
              <div><strong>Assigned Court:</strong> {assignedCourt}</div>
              <div><strong>Digital Timestamp:</strong> {new Date().toLocaleString()}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= MODAL: DRAFT APPEAL ================= */}
      <Modal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
        title="Draft Statutory Appeal / Revision Petition"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAppealModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleFileAppeal} isLoading={isSubmitting} leftIcon={<Gavel size={18} />}>
              Submit Revision to High Court Bench
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--color-danger)' }}>Statutory Limitation Check:</strong> Filing within 30 days limitation period prescribed under CrPC / High Court Rules for Forest Department Revision Petitions.
          </div>
          <Input 
            label="Revision / Appeal Memo Number *"
            value={appealMemoNo}
            onChange={(e) => setAppealMemoNo(e.target.value)}
            required
          />
          <Textarea 
            label="Legal Grounds for Revision / Sentence Enhancement *"
            placeholder="Cite legal precedents, commercial syndicate evidence, or ecological impact..."
            rows={4}
            value={appealNotes}
            onChange={(e) => setAppealNotes(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* ================= MODAL: PRINTABLE OFFICIAL DOSSIER ================= */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="Forest Department Case Dossier & Form 9"
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsDossierModalOpen(false)}>Close</Button>
            <Button 
              variant="primary" 
              leftIcon={<Printer size={18} />}
              onClick={() => window.print()}
            >
              Print / Save as Official PDF
            </Button>
          </div>
        }
      >
        <div className="printable-dossier" style={{ padding: '1rem', color: '#000' }}>
          {/* Emblem & Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              GOVERNMENT OF CHHATTISGARH • FOREST DEPARTMENT
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              OFFICE OF THE DIVISIONAL FOREST OFFICER • NORTH KABIRDHAM DIVISION
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', textDecoration: 'underline' }}>
              PRELIMINARY OFFENCE REPORT & SEIZURE REGISTER (FORM NO. 1)
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              [Maintained under Section 52 of Indian Forest Act, 1927 r/w Sec 50 Wildlife Protection Act, 1972]
            </div>
          </div>

          {/* Key particulars grid */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '0.4rem', fontWeight: 700, width: '25%' }}>Case / POR Number:</td>
                <td style={{ padding: '0.4rem', width: '25%' }}>{currentCase.caseNumber}</td>
                <td style={{ padding: '0.4rem', fontWeight: 700, width: '25%' }}>Date & Time Detected:</td>
                <td style={{ padding: '0.4rem', width: '25%' }}>{currentCase.date} at {currentCase.time}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '0.4rem', fontWeight: 700 }}>Forest Range & Round:</td>
                <td style={{ padding: '0.4rem' }}>{currentCase.range} / {currentCase.round}</td>
                <td style={{ padding: '0.4rem', fontWeight: 700 }}>Beat & Compartment:</td>
                <td style={{ padding: '0.4rem' }}>{currentCase.beat} ({currentCase.compartment})</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '0.4rem', fontWeight: 700 }}>GPS Coordinates:</td>
                <td style={{ padding: '0.4rem' }}>{currentCase.gpsCoordinates}</td>
                <td style={{ padding: '0.4rem', fontWeight: 700 }}>Assigned IO:</td>
                <td style={{ padding: '0.4rem' }}>{currentCase.io}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '0.4rem', fontWeight: 700 }}>Sections Invoked:</td>
                <td colSpan={3} style={{ padding: '0.4rem' }}>{currentCase.sections.join('; ')}</td>
              </tr>
            </tbody>
          </table>

          {/* Seized Property Schedule */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700 }}>
              Schedule of Seized Property (Timber / Implements / Vehicles)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee', borderBottom: '1px solid #000' }}>
                  <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>S.No</th>
                  <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Quantity / Girth</th>
                  <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Est. Valuation</th>
                  <th style={{ padding: '0.4rem', textAlign: 'left' }}>Deposit Malkhana</th>
                </tr>
              </thead>
              <tbody>
                {currentCase.seizedItems.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{i + 1}</td>
                    <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{item.item}</td>
                    <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{item.quantity}</td>
                    <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{item.estimatedValue}</td>
                    <td style={{ padding: '0.4rem' }}>{item.malkhanaLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="dossier-signatures">
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '180px', borderBottom: '1px solid #000', marginBottom: '0.25rem' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Signature of Beat Guard</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '180px', borderBottom: '1px solid #000', marginBottom: '0.25rem' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Investigating Officer (IO)</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '180px', borderBottom: '1px solid #000', marginBottom: '0.25rem' }}></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Divisional Forest Officer</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
