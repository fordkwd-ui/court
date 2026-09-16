import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CaseStatusSummaryCard } from '../components/dashboard/CaseStatusSummaryCard';
import { 
  TrendingUp, 
  Clock, 
  FileCheck, 
  AlertCircle, 
  ShieldAlert, 
  Plus, 
  Trees, 
  Calendar as CalendarIcon, 
  Gavel, 
  Truck
} from 'lucide-react';
import './Dashboard.css';
import { useCases } from '../hooks/useCases';

export const Dashboard: React.FC = () => {
  const { cases, kpis, hearings } = useCases();
  const navigate = useNavigate();

  // Calculate total seized assets valuation estimate
  const totalSeizedValue = '₹80.92 Lakh';

  // Upcoming hearings
  const nextHearings = hearings.filter(h => h.status === 'Scheduled').slice(0, 3);

  // Group by offence type
  const offenceCounts = cases.reduce((acc, c) => {
    acc[c.offence] = (acc[c.offence] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Flatten all recent logs from cases for activity feed
  const recentActivities: Array<{ id: string; caseId: string; caseNo: string; action: string; desc: string; date: string; officer: string }> = [];
  cases.forEach(c => {
    c.investigationLogs.forEach(l => {
      recentActivities.push({
        id: `${c.id}-${l.id}`,
        caseId: c.id,
        caseNo: c.caseNumber,
        action: l.action,
        desc: l.description,
        date: l.date,
        officer: l.officer
      });
    });
  });
  recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="dashboard-container">
      {/* Header with Division & Quick Actions */}
      <header className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              State Forest Department • Chhattisgarh
            </span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
            <Badge variant="success">Legal Cell Active</Badge>
          </div>
          <h1 className="page-title">North Kabirdham Division Command</h1>
          <p className="page-subtitle">Forest Offences, Charge Sheets, Court Hearings & Statutory Appeals Overview</p>
        </div>
        <div className="dashboard-header-actions">
          <Button 
            variant="outline" 
            leftIcon={<CalendarIcon size={16} />}
            onClick={() => navigate('/calendar')}
          >
            Court Calendar
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={18} />}
            onClick={() => navigate('/cases?action=new')}
          >
            New Offence Report (POR)
          </Button>
        </div>
      </header>

      {/* Primary KPIs */}
      <section className="kpi-grid">
        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper success">
              <TrendingUp size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Conviction Rate</span>
              <h2 className="kpi-value">{kpis.convictionRate}%</h2>
              <span className="kpi-trend positive">↑ 8% vs State Average (67%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper warning">
              <Clock size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Active Cases</span>
              <h2 className="kpi-value">{cases.length}</h2>
              <span className="kpi-trend">
                {kpis.firRegistered + kpis.underInvestigation} In Investigation • {kpis.trial + kpis.chargeSheetFiled} In Court
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper info">
              <FileCheck size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Charge Sheets Filed</span>
              <h2 className="kpi-value">{kpis.chargeSheetFiled + kpis.trial + kpis.judgmentDelivered}</h2>
              <span className="kpi-trend positive">100% DSC digitally signed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              <Truck size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Seized Assets & Contraband</span>
              <h2 className="kpi-value">{totalSeizedValue}</h2>
              <span className="kpi-trend">Vehicles, Timber & Machinery</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Case Status Summary & Visual Lifecycle Progress Breakdown */}
      <section className="dashboard-section">
        <CaseStatusSummaryCard cases={cases} />
      </section>

      {/* Critical Legal Alerts & Deadlines */}
      <section className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--color-danger)" /> High-Priority Legal Deadlines & Alerts
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
            Requires Immediate Officer Review
          </span>
        </div>

        <div className="alerts-list">
          {/* Leopard Poaching Appeal Card */}
          <Card className="alert-card danger-alert">
            <CardContent className="alert-content">
              <AlertCircle size={24} className="alert-icon" />
              <div className="alert-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <strong>High Court Revision Limitation Deadline (3 Days Left)</strong>
                  <Badge variant="danger">Critical</Badge>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                  Case <strong>WL/2023/KAB/00082</strong> (Schedule-I Leopard Poaching): Sessions Court awarded 3 years RI. Forest Dept decision required to file criminal revision in High Court for statutory enhancement to 7 years.
                </p>
              </div>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => navigate('/cases/WL-2023-KAB-00082?tab=judgment')}
              >
                Review & File Appeal
              </Button>
            </CardContent>
          </Card>
          
          {/* Taregaon Encroachment Investigation */}
          <Card className="alert-card warning-alert">
            <CardContent className="alert-content">
              <AlertCircle size={24} className="alert-icon" />
              <div className="alert-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <strong>Charge Sheet Drafting Due (Remand Limit)</strong>
                  <Badge variant="warning">High Priority</Badge>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                  Case <strong>FOR/2024/KAB/00118</strong> (4.5 Ha Encroachment in Taregaon RF): DGPS boundary certificate received. Final Offence Report must be signed via DSC and submitted to JMFC Kawardha.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/cases/FOR-2024-KAB-00118?tab=investigation')}
              >
                Review Evidence & Compile
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Two Column Layout: Upcoming Hearings & Offence Types + Activity Feed */}
      <div className="dashboard-columns">
        {/* Left Column: Recent Activity Feed */}
        <section className="dashboard-section">
          <Card style={{ height: '100%' }}>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle>Recent Investigation & Court Actions</CardTitle>
                <Badge variant="default">Real-time Logs</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="activity-timeline">
                {recentActivities.slice(0, 5).map((act, index) => (
                  <div key={act.id} className="timeline-item">
                    <div className={`timeline-dot ${index % 2 === 0 ? 'bg-success' : 'bg-info'}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <Link 
                          to={`/cases/${act.caseId}`}
                          style={{ fontWeight: 600, color: 'var(--color-primary-800)', textDecoration: 'none' }}
                        >
                          {act.caseNo} • {act.action}
                        </Link>
                        <span className="timeline-time">{act.date}</span>
                      </div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {act.desc}
                      </p>
                      <span style={{ fontSize: '0.725rem', color: 'var(--color-text-tertiary)' }}>
                        Officer: {act.officer}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Column: Upcoming Hearings & Offence Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming Court Hearings Card */}
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Gavel size={18} /> Upcoming Hearings
                </CardTitle>
                <Link to="/calendar" style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                  Full Calendar →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {nextHearings.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No upcoming hearings scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {nextHearings.map(h => (
                    <div 
                      key={h.id}
                      onClick={() => navigate(`/cases/${h.caseId}?tab=hearings`)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-base)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary-900)' }}>{h.caseNumber}</strong>
                          <Badge variant={h.priority === 'CRITICAL' ? 'danger' : 'info'}>{h.priority}</Badge>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                          {h.stage} • {h.court.split(',')[0]}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', color: 'var(--color-primary-800)' }}>
                          {h.hearingDate}
                        </span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--color-text-tertiary)' }}>{h.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offence Categories Distribution */}
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trees size={18} /> Offence Distribution by Nature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {Object.entries(offenceCounts).map(([type, count]) => {
                  const pct = Math.round((count / cases.length) * 100);
                  return (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{type}</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{count} cases ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-primary-600)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
