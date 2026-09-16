import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Scale, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  FileCheck, 
  ChevronRight, 
  PieChart, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { ForestCase, CaseStatus } from '../../types/case';
import { usePreferences } from '../../context/PreferencesContext';
import './CaseStatusSummaryCard.css';

interface CaseStatusSummaryCardProps {
  cases: ForestCase[];
  className?: string;
  onStatusSelect?: (filter: string) => void;
}

type ViewMode = 'grouped' | 'granular';

interface StatusGroupItem {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  filterValue: string;
  subBreakdown: string;
}

export const CaseStatusSummaryCard: React.FC<CaseStatusSummaryCardProps> = ({
  cases,
  className = '',
  onStatusSelect
}) => {
  const navigate = useNavigate();
  const { t, language } = usePreferences();
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const totalCases = cases.length;

  // 1. Grouped Pipeline Breakdown (Investigation, Pending Trial, Closed, Appeals)
  const groupedData: StatusGroupItem[] = useMemo(() => {
    const investigationCases = cases.filter(
      c => c.status === 'FIR_REGISTERED' || c.status === 'UNDER_INVESTIGATION'
    );
    const pendingTrialCases = cases.filter(
      c => c.status === 'CHARGESHEET_FILED' || c.status === 'TRIAL'
    );
    const closedCases = cases.filter(
      c => c.status === 'JUDGMENT_DELIVERED'
    );
    const appealCases = cases.filter(
      c => c.status === 'APPEAL_FILED'
    );

    const firCount = cases.filter(c => c.status === 'FIR_REGISTERED').length;
    const underInvCount = cases.filter(c => c.status === 'UNDER_INVESTIGATION').length;
    const csCount = cases.filter(c => c.status === 'CHARGESHEET_FILED').length;
    const trialCount = cases.filter(c => c.status === 'TRIAL').length;

    const calcPct = (cnt: number) => (totalCases > 0 ? Math.round((cnt / totalCases) * 100) : 0);

    return [
      {
        id: 'investigation',
        label: t('status.investigation'),
        count: investigationCases.length,
        percentage: calcPct(investigationCases.length),
        color: '#F59E0B', // Amber
        icon: <Clock size={16} />,
        description: 'Preliminary Offence Reports (POR), crime scene panchnama, custody & remand',
        filterValue: 'INVESTIGATION',
        subBreakdown: `${firCount} POR Registered • ${underInvCount} In Active Inquiry`
      },
      {
        id: 'pending_trial',
        label: t('status.pendingTrial'),
        count: pendingTrialCases.length,
        percentage: calcPct(pendingTrialCases.length),
        color: '#3B82F6', // Royal Blue
        icon: <Scale size={16} />,
        description: 'Chargesheets submitted, court cognizance, witness examination & arguments',
        filterValue: 'PENDING_TRIAL',
        subBreakdown: `${csCount} Charge Sheets Filed • ${trialCount} Hearing in Court`
      },
      {
        id: 'closed',
        label: t('status.closed'),
        count: closedCases.length,
        percentage: calcPct(closedCases.length),
        color: '#10B981', // Forest Emerald
        icon: <CheckCircle2 size={16} />,
        description: 'Final judgments pronounced, sentences executed or offences compounded',
        filterValue: 'CLOSED',
        subBreakdown: 'Verdict Delivered & Fines Realized'
      },
      {
        id: 'appeals',
        label: t('status.appeals'),
        count: appealCases.length,
        percentage: calcPct(appealCases.length),
        color: '#EF4444', // Crimson Red
        icon: <ShieldAlert size={16} />,
        description: 'Appeals or criminal revisions challenging sentences in Sessions/High Court',
        filterValue: 'APPEAL_FILED',
        subBreakdown: 'Limitation Tracking Active'
      }
    ];
  }, [cases, totalCases, t]);

  // 2. Granular 6-Stage Breakdown
  const granularData: StatusGroupItem[] = useMemo(() => {
    const stageDefs: Array<{
      status: CaseStatus;
      label: string;
      color: string;
      icon: React.ReactNode;
      desc: string;
    }> = [
      { 
        status: 'FIR_REGISTERED', 
        label: t('status.firRegistered'), 
        color: '#3B82F6', 
        icon: <FileCheck size={16} />,
        desc: 'Initial seizure & First Information lodged' 
      },
      { 
        status: 'UNDER_INVESTIGATION', 
        label: t('status.underInvestigation'), 
        color: '#F59E0B', 
        icon: <Clock size={16} />,
        desc: 'Remand custody, forensic & DGPS verification' 
      },
      { 
        status: 'CHARGESHEET_FILED', 
        label: t('status.chargesheetFiled'), 
        color: '#10B981', 
        icon: <FileCheck size={16} />,
        desc: 'DSC verified & committed to Magistrate' 
      },
      { 
        status: 'TRIAL', 
        label: t('status.trial'), 
        color: '#8B5CF6', 
        icon: <Scale size={16} />,
        desc: 'Witnesses testifying in JMFC / Sessions Court' 
      },
      { 
        status: 'JUDGMENT_DELIVERED', 
        label: t('status.judgmentDelivered'), 
        color: '#16803C', 
        icon: <CheckCircle2 size={16} />,
        desc: 'Conviction / compounding finalized' 
      },
      { 
        status: 'APPEAL_FILED', 
        label: t('status.appealFiled'), 
        color: '#EF4444', 
        icon: <ShieldAlert size={16} />,
        desc: 'High Court / Sessions revision under review' 
      }
    ];

    return stageDefs.map(def => {
      const matchCases = cases.filter(c => c.status === def.status);
      const pct = totalCases > 0 ? Math.round((matchCases.length / totalCases) * 100) : 0;
      return {
        id: def.status,
        label: def.label,
        count: matchCases.length,
        percentage: pct,
        color: def.color,
        icon: def.icon,
        description: def.desc,
        filterValue: def.status,
        subBreakdown: `${matchCases.length} case${matchCases.length === 1 ? '' : 's'}`
      };
    });
  }, [cases, totalCases, t]);

  const activeDataList = viewMode === 'grouped' ? groupedData : granularData;

  const handleItemClick = (filterValue: string) => {
    if (onStatusSelect) {
      onStatusSelect(filterValue);
    } else {
      navigate(`/cases?status=${filterValue}`);
    }
  };

  // Metrics for small chart and highlight
  const closedCount = cases.filter(c => c.status === 'JUDGMENT_DELIVERED').length;
  const closedPercent = totalCases > 0 ? Math.round((closedCount / totalCases) * 100) : 0;
  const activeInCourtCount = cases.filter(c => c.status === 'CHARGESHEET_FILED' || c.status === 'TRIAL').length;
  const underInvestigationCount = cases.filter(c => c.status === 'FIR_REGISTERED' || c.status === 'UNDER_INVESTIGATION').length;

  // Donut SVG parameters
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ≈ 213.63
  let cumulativePercent = 0;

  return (
    <Card className={`case-status-summary-card ${className}`}>
      {/* Header with Title and Mode Switcher */}
      <CardHeader className="case-status-card-header">
        <div className="case-status-header-title-group">
          <div className="case-status-header-icon">
            <PieChart size={20} />
          </div>
          <div>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.05rem' }}>
              {t('dashboard.statusBreakdown')}
            </CardTitle>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {t('dashboard.statusBreakdownSub')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View Mode Toggle */}
          <div className="case-status-view-toggle">
            <button
              type="button"
              className={`case-status-toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
              title="Grouped by Investigation, Pending Trial, Closed & Appeals"
            >
              <Layers size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {t('dashboard.pipelineView')}
            </button>
            <button
              type="button"
              className={`case-status-toggle-btn ${viewMode === 'granular' ? 'active' : ''}`}
              onClick={() => setViewMode('granular')}
              title="Granular view by all 6 individual statutory stages"
            >
              {t('dashboard.allStagesView')}
            </button>
          </div>

          <Link 
            to="/cases" 
            style={{ 
              fontSize: '0.8125rem', 
              color: 'var(--color-primary-700)', 
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            {t('dashboard.viewCases')} ({totalCases}) <ArrowUpRight size={14} />
          </Link>
        </div>
      </CardHeader>

      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.25rem' }}>
        {/* Top Visual Panel: Mini Circular Chart + Progress Highlights */}
        <div className="case-status-overview-panel">
          {/* Small Donut / Radial Chart */}
          <div className="case-status-donut-container">
            <svg width="96" height="96" viewBox="0 0 96 96">
              {/* Background Track */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="10"
              />
              
              {/* Segmented Slices for Active View */}
              {activeDataList.map((item) => {
                if (item.percentage <= 0 || totalCases === 0) return null;
                const strokeDash = (item.count / totalCases) * circumference;
                const strokeOffset = -((cumulativePercent / 100) * circumference);
                cumulativePercent += (item.count / totalCases) * 100;

                const isHovered = activeHoverId === item.id;

                return (
                  <circle
                    key={item.id}
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={isHovered ? 12 : 10}
                    strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 48 48)"
                    style={{ 
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      opacity: activeHoverId && !isHovered ? 0.45 : 1
                    }}
                    onMouseEnter={() => setActiveHoverId(item.id)}
                    onMouseLeave={() => setActiveHoverId(null)}
                    onClick={() => handleItemClick(item.filterValue)}
                  />
                );
              })}
            </svg>

            {/* Centered Key Metric in Donut */}
            <div className="case-status-donut-center">
              <span className="case-status-donut-val">
                {activeHoverId ? (
                  activeDataList.find(d => d.id === activeHoverId)?.count ?? totalCases
                ) : (
                  totalCases
                )}
              </span>
              <span className="case-status-donut-sub">
                {activeHoverId ? (language === 'hi' ? 'चयनित' : 'Selected') : t('dashboard.total')}
              </span>
            </div>
          </div>

          {/* Progress Highlights & Stacked Bar */}
          <div className="case-status-overview-info">
            <div className="case-status-headline-row">
              <div>
                <span className="case-status-headline-title">
                  Division Case Trajectory
                </span>
                <span style={{ margin: '0 0.5rem', color: 'var(--color-text-tertiary)' }}>•</span>
                <span className="case-status-headline-meta">
                  {closedPercent}% Closed • {activeInCourtCount} In Trial • {underInvestigationCount} Under Investigation
                </span>
              </div>
              <Badge variant={closedPercent >= 30 ? 'success' : 'default'}>
                {closedCount} Disposed ({closedPercent}%)
              </Badge>
            </div>

            {/* Multi-Segment Proportional Progress Bar */}
            <div className="case-status-stacked-bar-wrapper">
              <div className="case-status-stacked-bar" role="progressbar" aria-label="Cases by status distribution">
                {activeDataList.map((item) => {
                  const pct = totalCases > 0 ? (item.count / totalCases) * 100 : 0;
                  if (pct === 0) return null;
                  const isHovered = activeHoverId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="case-status-bar-segment"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        opacity: activeHoverId && !isHovered ? 0.45 : 1
                      }}
                      title={`${item.label}: ${item.count} cases (${Math.round(pct)}%)`}
                      onMouseEnter={() => setActiveHoverId(item.id)}
                      onMouseLeave={() => setActiveHoverId(null)}
                      onClick={() => handleItemClick(item.filterValue)}
                    />
                  );
                })}
              </div>

              {/* Inline mini legend */}
              <div className="case-status-bar-legend-inline">
                {activeDataList.map((item) => (
                  <div 
                    key={item.id} 
                    className="case-status-legend-item"
                    style={{ 
                      cursor: 'pointer',
                      fontWeight: activeHoverId === item.id ? 700 : 500,
                      color: activeHoverId === item.id ? item.color : 'inherit'
                    }}
                    onMouseEnter={() => setActiveHoverId(item.id)}
                    onMouseLeave={() => setActiveHoverId(null)}
                    onClick={() => handleItemClick(item.filterValue)}
                  >
                    <span 
                      className="case-status-legend-dot" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span>{item.label}</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>({item.count})</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Breakdown Grid (Individual Status Cards with Progress Bars) */}
        <div className="case-status-breakdown-grid">
          {activeDataList.map((item) => {
            const isHovered = activeHoverId === item.id;

            return (
              <div
                key={item.id}
                className="case-status-card-item"
                style={{
                  borderColor: isHovered ? item.color : 'var(--color-border)',
                  backgroundColor: isHovered ? 'var(--color-bg-base)' : 'var(--color-surface)'
                }}
                onMouseEnter={() => setActiveHoverId(item.id)}
                onMouseLeave={() => setActiveHoverId(null)}
                onClick={() => handleItemClick(item.filterValue)}
              >
                <div>
                  <div className="case-status-item-top">
                    <div className="case-status-item-label-group">
                      <div 
                        className="case-status-item-icon-wrap"
                        style={{ 
                          backgroundColor: `${item.color}15`, 
                          color: item.color 
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="case-status-item-name">{item.label}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                          {item.subBreakdown}
                        </span>
                      </div>
                    </div>

                    <div className="case-status-item-counts">
                      <div className="case-status-item-count-val">{item.count}</div>
                      <div className="case-status-item-pct-val">{item.percentage}%</div>
                    </div>
                  </div>

                  <p className="case-status-item-desc">
                    {item.description}
                  </p>
                </div>

                {/* Individual Mini Progress Bar */}
                <div className="case-status-item-progress-bar-wrap">
                  <div className="case-status-item-progress-track">
                    <div
                      className="case-status-item-progress-fill"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>

                  <div className="case-status-item-footer">
                    <span>
                      {item.count} of {totalCases} total
                    </span>
                    <span className="case-status-item-action-link">
                      Filter cases <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
