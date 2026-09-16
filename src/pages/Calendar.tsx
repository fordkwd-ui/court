import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Gavel, 
  Printer, 
  ExternalLink,
  Bell,
  ShieldAlert,
  Clock
} from 'lucide-react';
import './Calendar.css';
import { useCases } from '../hooks/useCases';
import type { HearingItem } from '../types/case';
import { getStatutoryDeadlines } from '../utils/statutoryDeadlines';
import { CalendarToastStack } from '../components/calendar/CalendarToastStack';

export const Calendar: React.FC = () => {
  const { cases, hearings, addHearing } = useCases();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected date & current view month
  const [viewDate, setViewDate] = useState(new Date(2024, 2, 1)); // Default March 2024 to match seed cases or current month
  const [selectedDay, setSelectedDay] = useState<number | null>(14);
  const [courtFilter, setCourtFilter] = useState('ALL');
  
  // Derive eventTypeFilter directly from URL search parameter for single source of truth
  const filterParam = searchParams.get('filter');
  const eventTypeFilter: 'ALL' | 'HEARINGS' | 'INVESTIGATION' | 'LIMITATION' = (() => {
    if (filterParam === 'LIMITATION' || filterParam === 'deadlines') return 'LIMITATION';
    if (filterParam === 'INVESTIGATION') return 'INVESTIGATION';
    if (filterParam === 'HEARINGS') return 'HEARINGS';
    return 'ALL';
  })();

  const handleFilterChange = (type: 'ALL' | 'HEARINGS' | 'INVESTIGATION' | 'LIMITATION') => {
    if (type === 'ALL') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('filter');
      setSearchParams(nextParams, { replace: true });
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('filter', type);
      setSearchParams(nextParams, { replace: true });
    }
  };

  // Toast Notification state
  const [dismissedToastIds, setDismissedToastIds] = useState<string[]>([]);
  const [showToastStack, setShowToastStack] = useState(true);

  // New Hearing Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [hrDate, setHrDate] = useState('2024-03-24');
  const [hrTime, setHrTime] = useState('11:00 AM');
  const [hrCourt, setHrCourt] = useState('Court of Chief Judicial Magistrate, Kawardha');
  const [hrJudge, setHrJudge] = useState('Hon. Chief Judicial Magistrate');
  const [hrPurpose, setHrPurpose] = useState('Prosecution Witness Examination (PW-1)');
  const [hrStage, setHrStage] = useState<HearingItem['stage']>('Prosecution Evidence');
  const [hrAdvocate, setHrAdvocate] = useState('Shri Arvind Shukla (PP)');
  const [hrNotes, setHrNotes] = useState('Produce timber seizure panchnama Form 9 and call beat guard.');

  // Cause List Print Modal
  const [isCauseListOpen, setIsCauseListOpen] = useState(false);

  // Calculate all statutory deadlines
  const allDeadlines = useMemo(() => getStatutoryDeadlines(cases, hearings), [cases, hearings]);

  // Specific groups of deadlines
  const limitationDeadlines = useMemo(() => 
    allDeadlines.filter(d => d.type === 'APPEAL_LIMITATION'), 
    [allDeadlines]
  );
  
  const investigationDeadlines = useMemo(() => 
    allDeadlines.filter(d => d.type === 'INVESTIGATION_EXPIRY' || d.type === 'CUSTODY_REMAND_EXPIRY'), 
    [allDeadlines]
  );

  // Jump to specific calendar date from toast or alert banner
  const handleJumpToDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (y && m && d) {
      setViewDate(new Date(y, m - 1, 1));
      setSelectedDay(d);
      setTimeout(() => {
        const cellEl = document.getElementById(`calendar-day-${d}`);
        if (cellEl) {
          cellEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };
  const goToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Monday start
  const blanksCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);

  // Filter hearings by court
  const filteredHearings = hearings.filter(h => {
    if (courtFilter !== 'ALL' && !h.court.toLowerCase().includes(courtFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Hearings & Deadlines on selected day
  const selectedDateStr = selectedDay 
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const hearingsOnSelectedDay = filteredHearings.filter(h => h.hearingDate === selectedDateStr);
  const deadlinesOnSelectedDay = allDeadlines.filter(d => d.dueDate === selectedDateStr && d.type !== 'COURT_HEARING');

  // Handle scheduling
  const handleScheduleHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !hrDate) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const parentCase = cases.find(c => c.id === selectedCaseId);
      addHearing(selectedCaseId, {
        hearingDate: hrDate,
        time: hrTime,
        court: hrCourt,
        judge: hrJudge,
        purpose: hrPurpose,
        stage: hrStage,
        advocate: hrAdvocate,
        priority: parentCase ? parentCase.priority : 'MEDIUM',
        notes: hrNotes,
        status: 'Scheduled'
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 600);
  };

  return (
    <div className="calendar-container">
      {/* Toast Notification Stack for Upcoming Deadlines */}
      {showToastStack && (
        <CalendarToastStack 
          alerts={allDeadlines.filter(d => d.type !== 'COURT_HEARING' || d.priority === 'CRITICAL')}
          dismissedIds={dismissedToastIds}
          onDismiss={(id) => setDismissedToastIds(prev => [...prev, id])}
          onDismissAll={() => setDismissedToastIds(allDeadlines.map(d => d.id))}
          onJumpToDate={handleJumpToDate}
        />
      )}

      {/* Page Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              North Kabirdham Division • Legal Cell
            </span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>
              <span className="alert-pulse-dot" style={{ backgroundColor: '#DC2626' }} />
              {allDeadlines.length} Active Deadlines & Schedules
            </span>
          </div>
          <h1 className="page-title">Forest Offence Court & Deadlines Calendar</h1>
          <p className="page-subtitle">
            Daily Cause Lists, Limitation Deadlines, Investigation Expiry Monitors & Court Schedules.
          </p>
        </div>
        <div className="header-actions" style={{ flexWrap: 'wrap' }}>
          {/* Re-trigger / Alert Count Button */}
          <Button 
            variant="outline" 
            size="sm"
            leftIcon={<Bell size={16} color="var(--color-danger)" />}
            onClick={() => {
              if (showToastStack && dismissedToastIds.length === 0) {
                setShowToastStack(false);
              } else {
                setDismissedToastIds([]);
                setShowToastStack(true);
              }
            }}
            title="Toggle Deadline Toast Notifications"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(254, 242, 242, 0.6)' }}
          >
            {showToastStack ? `Hide Alerts (${allDeadlines.length})` : `Show Alerts (${allDeadlines.length})`}
          </Button>

          <Button variant="outline" size="sm" onClick={goToday}>Current Month</Button>
          <Button variant="outline" leftIcon={<ChevronLeft size={18} />} onClick={prevMonth}>Prev</Button>
          <span className="current-month-label">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" rightIcon={<ChevronRight size={18} />} onClick={nextMonth}>Next</Button>
          <Button variant="outline" leftIcon={<Printer size={16} />} onClick={() => setIsCauseListOpen(true)}>
            Cause List
          </Button>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Schedule Hearing
          </Button>
        </div>
      </div>

      {/* Statutory Deadlines & Expiry Monitor Banner */}
      <div className="deadlines-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#FEE2E2', 
              color: '#B91C1C', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7F1D1D' }}>
                Statutory Limitation & Remand Monitor
              </div>
              <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>
                Urgent court filing requirements under CrPC & Wildlife Protection Act
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {limitationDeadlines.map(lim => (
              <span
                key={lim.id}
                onClick={() => handleJumpToDate(lim.dueDate)}
                className="deadline-badge-pill"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
                title={`Click to jump to ${lim.dueDate}`}
              >
                <ShieldAlert size={13} />
                <strong>HC Appeal Due:</strong> {lim.dueDate} ({lim.caseNumber})
              </span>
            ))}

            {investigationDeadlines.slice(0, 2).map(inv => (
              <span
                key={inv.id}
                onClick={() => handleJumpToDate(inv.dueDate)}
                className="deadline-badge-pill"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
                title={`Click to jump to ${inv.dueDate}`}
              >
                <Clock size={13} />
                <strong>{inv.type === 'CUSTODY_REMAND_EXPIRY' ? 'Remand Review' : '60D Expiry'}:</strong> {inv.dueDate}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Filter View:</span>
          {(['ALL', 'HEARINGS', 'INVESTIGATION', 'LIMITATION'] as const).map(type => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: eventTypeFilter === type ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                backgroundColor: eventTypeFilter === type ? 'var(--color-primary-50)' : '#FFFFFF',
                color: eventTypeFilter === type ? 'var(--color-primary-900)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: eventTypeFilter === type ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {type === 'ALL' ? 'All Alerts & Dates' : 
               type === 'HEARINGS' ? 'Hearings Only' :
               type === 'INVESTIGATION' ? 'Expiring Investigations' : 'Limitation Deadlines'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Court Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Jurisdiction Bench:</span>
        {[
          { label: 'All Courts', value: 'ALL' },
          { label: 'CJM Kawardha', value: 'Judicial Magistrate' },
          { label: 'Sessions Court Kabirdham', value: 'Sessions' },
          { label: 'High Court of Chhattisgarh', value: 'High Court' },
        ].map(item => (
          <button
            key={item.value}
            onClick={() => setCourtFilter(item.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: courtFilter === item.value ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
              backgroundColor: courtFilter === item.value ? 'var(--color-primary-50)' : 'var(--color-surface)',
              color: courtFilter === item.value ? 'var(--color-primary-900)' : 'var(--color-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: courtFilter === item.value ? 600 : 500,
              cursor: 'pointer'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="calendar-layout">
        {/* Main Calendar Grid */}
        <div className="calendar-main">
          <Card className="calendar-card">
            <div className="calendar-header-days">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="calendar-day-label">{day}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="calendar-cell empty"></div>
              ))}
              {daysArray.map((day) => {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                // Get hearings on this day
                const dayHearings = eventTypeFilter === 'INVESTIGATION' || eventTypeFilter === 'LIMITATION' 
                  ? [] 
                  : filteredHearings.filter(h => h.hearingDate === dateKey);

                // Get statutory deadlines on this day
                const dayDeadlines = allDeadlines.filter(d => {
                  if (d.dueDate !== dateKey || d.type === 'COURT_HEARING') return false;
                  if (eventTypeFilter === 'HEARINGS') return false;
                  if (eventTypeFilter === 'INVESTIGATION' && d.type !== 'INVESTIGATION_EXPIRY' && d.type !== 'CUSTODY_REMAND_EXPIRY') return false;
                  if (eventTypeFilter === 'LIMITATION' && d.type !== 'APPEAL_LIMITATION') return false;
                  return true;
                });

                const isSelected = selectedDay === day;
                const hasCriticalDeadline = dayDeadlines.some(d => d.type === 'APPEAL_LIMITATION' || d.priority === 'CRITICAL');
                const hasInvestigationExpiry = dayDeadlines.some(d => d.type === 'INVESTIGATION_EXPIRY' || d.type === 'CUSTODY_REMAND_EXPIRY');

                return (
                  <div 
                    key={day} 
                    id={`calendar-day-${day}`}
                    className={`calendar-cell ${isSelected ? 'today' : ''} ${hasCriticalDeadline ? 'has-critical-deadline' : ''} ${hasInvestigationExpiry ? 'has-investigation-deadline' : ''}`}
                    onClick={() => setSelectedDay(day)}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: isSelected 
                        ? 'rgba(22, 128, 60, 0.06)' 
                        : hasCriticalDeadline 
                          ? 'rgba(254, 242, 242, 0.4)' 
                          : hasInvestigationExpiry 
                            ? 'rgba(255, 251, 235, 0.35)' 
                            : undefined 
                    }}
                  >
                    <div className="calendar-cell-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="day-number" style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-primary-800)' : undefined }}>
                        {day}
                      </span>
                      
                      {/* Cell Indicators */}
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {hasCriticalDeadline && (
                          <span 
                            title="Statutory Appeal / Revision Limitation Due!"
                            style={{ 
                              fontSize: '0.65rem', 
                              backgroundColor: '#FEE2E2', 
                              color: '#991B1B', 
                              borderRadius: '999px', 
                              padding: '0.05rem 0.35rem', 
                              fontWeight: 800,
                              border: '1px solid #F87171' 
                            }}
                          >
                            🚨 HC Due
                          </span>
                        )}

                        {hasInvestigationExpiry && !hasCriticalDeadline && (
                          <span 
                            title="Investigation Remand Expiry Limit"
                            style={{ 
                              fontSize: '0.65rem', 
                              backgroundColor: '#FEF3C7', 
                              color: '#92400E', 
                              borderRadius: '999px', 
                              padding: '0.05rem 0.35rem', 
                              fontWeight: 700,
                              border: '1px solid #FCD34D' 
                            }}
                          >
                            ⏳ Remand
                          </span>
                        )}

                        {dayHearings.length > 0 && (
                          <span 
                            title={`${dayHearings.length} court hearings listed`}
                            style={{ 
                              fontSize: '0.65rem', 
                              backgroundColor: 'var(--color-primary-100)', 
                              color: 'var(--color-primary-800)', 
                              borderRadius: '999px', 
                              padding: '0.05rem 0.35rem', 
                              fontWeight: 700 
                            }}
                          >
                            🏛️ {dayHearings.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="calendar-events">
                      {/* Statutory Deadline Indicators */}
                      {dayDeadlines.map(d => (
                        <div
                          key={d.id}
                          className={`calendar-event ${d.type === 'APPEAL_LIMITATION' ? 'deadline-critical' : 'deadline-investigation'}`}
                          title={`${d.title} - Case ${d.caseNumber}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(day);
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            {d.type === 'APPEAL_LIMITATION' ? '🚨 HC Revision Due' : '⏳ Remand / 60D Due'}
                          </span>
                          <span style={{ fontSize: '0.6875rem', display: 'block', opacity: 0.9 }}>
                            {d.caseNumber.split('/').slice(-2).join('/')}
                          </span>
                        </div>
                      ))}

                      {/* Hearings */}
                      {dayHearings.slice(0, 2).map(h => (
                        <div 
                          key={h.id} 
                          className={`calendar-event priority-${h.priority.toLowerCase()}`}
                          title={`${h.caseNumber}: ${h.purpose} at ${h.court}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(day);
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{h.caseNumber.split('/').slice(-2).join('/')}</span>
                          <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.85 }}>{h.stage}</span>
                        </div>
                      ))}

                      {dayHearings.length > 2 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                          +{dayHearings.length - 2} more hearings
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar: Details of Selected Date (Statutory Deadlines + Cause List) */}
        <div className="calendar-sidebar" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <CardHeader style={{ paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <CalendarIcon size={18} /> 
                  {selectedDay ? `Date Dossier: ${selectedDateStr}` : 'Upcoming Cause List'}
                </CardTitle>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {deadlinesOnSelectedDay.length > 0 && (
                    <Badge variant="danger">{deadlinesOnSelectedDay.length} Deadline</Badge>
                  )}
                  <Badge variant={hearingsOnSelectedDay.length > 0 ? 'success' : 'default'}>
                    {hearingsOnSelectedDay.length} Hearings
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Section 1: Statutory Deadlines & Expiring Remands on this Date */}
              {deadlinesOnSelectedDay.length > 0 && (
                <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldAlert size={16} /> Statutory Deadlines on this Date
                  </div>
                  
                  {deadlinesOnSelectedDay.map(dl => {
                    const isCritical = dl.type === 'APPEAL_LIMITATION' || dl.priority === 'CRITICAL';
                    return (
                      <div
                        key={dl.id}
                        style={{
                          padding: '0.875rem',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: `4px solid ${isCritical ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                          backgroundColor: isCritical ? '#FEF2F2' : '#FFFBEB',
                          borderTop: '1px solid var(--color-border)',
                          borderRight: '1px solid var(--color-border)',
                          borderBottom: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ 
                            fontSize: '0.6875rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            color: isCritical ? '#991B1B' : '#92400E' 
                          }}>
                            {dl.type === 'APPEAL_LIMITATION' ? 'Limitation Period' : 'Investigation Remand'}
                          </span>
                          <Badge variant={isCritical ? 'danger' : 'warning'}>{dl.priority}</Badge>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                          {dl.title}
                        </div>

                        <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                          Case: <strong>{dl.caseNumber}</strong> ({dl.caseTitle})
                        </div>

                        <p style={{ margin: '0.2rem 0', fontSize: '0.775rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {dl.description}
                        </p>

                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                          Statutory Mandate: <strong>{dl.statutoryReference}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <Link to={dl.actionUrl}>
                            <Button 
                              variant={isCritical ? 'danger' : 'primary'} 
                              size="sm" 
                              rightIcon={<ExternalLink size={14} />}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                            >
                              {dl.actionLabel}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Section 2: Court Hearings Listed on this Date */}
              {hearingsOnSelectedDay.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Gavel size={16} /> Court Listings ({hearingsOnSelectedDay.length})
                  </div>

                  {hearingsOnSelectedDay.map(h => (
                    <div 
                      key={h.id}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Link 
                            to={`/cases/${h.caseId}?tab=hearings`}
                            style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '0.95rem', textDecoration: 'none' }}
                          >
                            {h.caseNumber}
                          </Link>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {h.stage}
                          </span>
                        </div>
                        <Badge variant={h.priority === 'CRITICAL' ? 'danger' : 'info'}>{h.priority}</Badge>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div>🏛️ {h.court}</div>
                        <div>⚖️ {h.judge}</div>
                        <div>🕒 <strong>{h.time}</strong></div>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-base)', padding: '0.5rem', borderRadius: '4px' }}>
                        <strong>Purpose:</strong> {h.purpose}
                      </p>

                      {h.notes && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          <strong>PP Note:</strong> {h.notes}
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        <Link to={`/cases/${h.caseId}?tab=hearings`}>
                          <Button variant="ghost" size="sm" rightIcon={<ExternalLink size={14} />}>
                            Case Dossier
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state when no hearings AND no deadlines */}
              {deadlinesOnSelectedDay.length === 0 && hearingsOnSelectedDay.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Gavel size={36} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>No hearings or statutory deadlines on this date.</p>
                  <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    Select a highlighted date with 🚨 or ⏳ on the calendar or schedule a new summons.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
                    Schedule for This Date
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Hearing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Court Hearing / Issue Summons"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleScheduleHearing} 
              isLoading={isSubmitting}
              leftIcon={<CalendarIcon size={18} />}
            >
              Add to Court Roster
            </Button>
          </>
        }
      >
        <form onSubmit={handleScheduleHearing} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Select Forest Offence Case *" 
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            options={cases.map(c => ({
              value: c.id,
              label: `${c.caseNumber} - ${c.title.slice(0, 45)}... (${c.status})`
            }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Hearing Date *" 
              type="date" 
              value={hrDate}
              onChange={(e) => setHrDate(e.target.value)}
              required
            />
            <Input 
              label="Listing Time *" 
              placeholder="e.g. 11:00 AM"
              value={hrTime}
              onChange={(e) => setHrTime(e.target.value)}
            />
          </div>

          <Input 
            label="Court Bench & Location *" 
            value={hrCourt}
            onChange={(e) => setHrCourt(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Presiding Judge Name" 
              value={hrJudge}
              onChange={(e) => setHrJudge(e.target.value)}
            />
            <Select 
              label="Trial Stage *" 
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Prosecution Advocate / PP" 
              value={hrAdvocate}
              onChange={(e) => setHrAdvocate(e.target.value)}
            />
            <Input 
              label="Listing Purpose *" 
              placeholder="e.g. Production of accused & seized Bolero"
              value={hrPurpose}
              onChange={(e) => setHrPurpose(e.target.value)}
              required
            />
          </div>

          <Textarea 
            label="Instructions for Forest Staff / Investigating Officer"
            placeholder="Summons served, witness attendance requirements, Malkhana articles to produce..."
            rows={3}
            value={hrNotes}
            onChange={(e) => setHrNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* Cause List Printable Modal */}
      <Modal
        isOpen={isCauseListOpen}
        onClose={() => setIsCauseListOpen(false)}
        title="Print Official Court Cause List"
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsCauseListOpen(false)}>Close</Button>
            <Button variant="primary" leftIcon={<Printer size={18} />} onClick={() => window.print()}>
              Print Daily Cause List
            </Button>
          </div>
        }
      >
        <div style={{ padding: '1rem', color: '#000' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1rem', fontWeight: 800 }}>
              NORTH KABIRDHAM FOREST DIVISION • LEGAL CELL
            </h3>
            <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: 700 }}>
              DAILY CAUSE LIST OF FOREST OFFENCE CASES LISTED FOR HEARING
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Date: {selectedDateStr || 'Upcoming Listings'} • Division: North Kabirdham, CG
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#eee', borderBottom: '1px solid #000' }}>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Item #</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Case Number</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Court & Bench</th>
                <th style={{ padding: '0.4rem', borderRight: '1px solid #000', textAlign: 'left' }}>Purpose / Stage</th>
                <th style={{ padding: '0.4rem', textAlign: 'left' }}>Appearing Officer / PP</th>
              </tr>
            </thead>
            <tbody>
              {filteredHearings.map((h, i) => (
                <tr key={h.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{i + 1}</td>
                  <td style={{ padding: '0.4rem', borderRight: '1px solid #000', fontWeight: 700 }}>{h.caseNumber}</td>
                  <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{h.court}</td>
                  <td style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>{h.purpose} ({h.stage})</td>
                  <td style={{ padding: '0.4rem' }}>{h.advocate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};
