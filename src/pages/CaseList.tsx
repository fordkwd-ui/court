import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { 
  Search, 
  Filter, 
  Plus, 
  Save, 
  Download, 
  FileText, 
  CheckCircle2,
  FileSpreadsheet,
  ScanLine,
  X as CloseIcon
} from 'lucide-react';
import './CaseList.css';
import { useCases } from '../hooks/useCases';
import { usePreferences } from '../context/PreferencesContext';
import { BulkImportModal } from '../components/cases/BulkImportModal';
import { ScanOcrModal } from '../components/cases/ScanOcrModal';
import type { CaseStatus, PriorityLevel, OffenceType } from '../types/case';

const getStatusBadge = (status: CaseStatus) => {
  switch (status) {
    case 'FIR_REGISTERED': return <Badge variant="info">FIR Registered</Badge>;
    case 'UNDER_INVESTIGATION': return <Badge variant="warning">Under Investigation</Badge>;
    case 'CHARGESHEET_FILED': return <Badge variant="default">Charge Sheet Filed</Badge>;
    case 'TRIAL': return <Badge variant="warning">Trial in Court</Badge>;
    case 'JUDGMENT_DELIVERED': return <Badge variant="success">Judgment Delivered</Badge>;
    case 'APPEAL_FILED': return <Badge variant="danger">Appeal / Revision</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const getPriorityBadge = (priority: PriorityLevel) => {
  switch (priority) {
    case 'CRITICAL': return <Badge variant="danger">Critical</Badge>;
    case 'HIGH': return <Badge variant="warning">High</Badge>;
    case 'MEDIUM': return <Badge variant="info">Medium</Badge>;
    case 'LOW': return <Badge variant="default">Low</Badge>;
  }
};

export const CaseList: React.FC = () => {
  const { cases, createCase, bulkCreateCases } = useCases();
  const { language, t } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const statusFilter = searchParams.get('status') || 'ALL';
  const setStatusFilter = (val: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val === 'ALL') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', val);
    }
    setSearchParams(nextParams, { replace: true });
  };
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [offenceFilter, setOffenceFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isScanOcrOpen, setIsScanOcrOpen] = useState(false);
  const [actionToast, setActionToast] = useState<{ message: string; caseId?: string } | null>(null);

  const isActionNew = searchParams.get('action') === 'new';
  const showModal = isModalOpen || isActionNew;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  // Form State for New Offence Report
  const [offenceType, setOffenceType] = useState<OffenceType>('Illegal Cutting');
  const [caseTitle, setCaseTitle] = useState('');
  const [offenceDate, setOffenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [offenceTime, setOffenceTime] = useState('09:30 AM');
  const [range, setRange] = useState('Bodla Range');
  const [beat, setBeat] = useState('Beat 4 - Chilphi Ghati');
  const [compartment, setCompartment] = useState('Comp. No. 248-RF');
  const location = 'Chilphi Beat, North Kabirdham';
  const [gpsCoordinates, setGpsCoordinates] = useState('22.1892° N, 81.0421° E');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [ioName, setIoName] = useState('Rajesh Kumar (IO)');
  const [description, setDescription] = useState('');

  // Primary Accused
  const [accusedName, setAccusedName] = useState('');
  const accusedAge = '35';
  const [accusedFather, setAccusedFather] = useState('');
  const [accusedVillage, setAccusedVillage] = useState('');
  const [accusedStatus, setAccusedStatus] = useState<'Judicial Custody' | 'Released on Bail' | 'Absconding' | 'Under Interrogation'>('Judicial Custody');

  // Primary Seized Item
  const [seizedItemName, setSeizedItemName] = useState('');
  const seizedCategory: 'Timber' | 'Vehicle' | 'Tool/Weapon' | 'Wildlife Trophy' | 'Mineral' = 'Timber';
  const [seizedQuantity, setSeizedQuantity] = useState('');
  const [seizedValue, setSeizedValue] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchParams({});
    setCreatedCaseId(null);
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created = createCase({
        title: caseTitle || `${offenceType} detected in ${beat}`,
        offence: offenceType,
        date: offenceDate,
        time: offenceTime,
        range,
        beat,
        compartment,
        location,
        gpsCoordinates,
        priority,
        io: ioName,
        description: description || `Offence of ${offenceType} reported in ${beat}. Preliminary Offence Report registered.`,
        sections: [
          offenceType === 'Poaching' || offenceType === 'Wildlife Trade' 
            ? 'Sec 9, 39 & 51 Wildlife (Protection) Act, 1972' 
            : 'Sec 26 & 33 Indian Forest Act, 1927',
          'Chhattisgarh Transit of Forest Produce Rules, 2001'
        ],
        accused: accusedName ? [
          {
            id: `acc-${Date.now()}`,
            name: accusedName,
            age: parseInt(accusedAge, 10) || 35,
            fatherName: accusedFather || 'Unknown',
            village: accusedVillage || 'Local Hamlet',
            status: accusedStatus,
            idProof: 'Aadhaar Verified'
          }
        ] : [],
        seizedItems: seizedItemName ? [
          {
            id: `sz-${Date.now()}`,
            item: seizedItemName,
            category: seizedCategory,
            quantity: seizedQuantity || '1 Unit',
            estimatedValue: seizedValue || '₹50,000',
            malkhanaLocation: `Range Malkhana ${range.split(' ')[0]}`,
            status: 'In Range Malkhana'
          }
        ] : []
      });

      setIsSubmitting(false);
      setCreatedCaseId(created.id);
    }, 600);
  };

  // Filter cases
  const filteredCases = cases.filter(c => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.caseNumber.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchIO = c.io.toLowerCase().includes(q);
      const matchLocation = c.location.toLowerCase().includes(q);
      const matchBeat = c.beat.toLowerCase().includes(q);
      const matchAccused = c.accused.some(a => a.name.toLowerCase().includes(q));
      if (!matchNum && !matchTitle && !matchIO && !matchLocation && !matchBeat && !matchAccused) {
        return false;
      }
    }
    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'INVESTIGATION') {
        if (c.status !== 'FIR_REGISTERED' && c.status !== 'UNDER_INVESTIGATION') return false;
      } else if (statusFilter === 'PENDING_TRIAL' || statusFilter === 'TRIAL_PENDING') {
        if (c.status !== 'CHARGESHEET_FILED' && c.status !== 'TRIAL') return false;
      } else if (statusFilter === 'CLOSED') {
        if (c.status !== 'JUDGMENT_DELIVERED') return false;
      } else if (c.status !== statusFilter) {
        return false;
      }
    }
    // Priority filter
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) {
      return false;
    }
    // Offence filter
    if (offenceFilter !== 'ALL' && c.offence !== offenceFilter) {
      return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Case Number', 'Offence Type', 'Offence Date', 'Status', 'Priority', 'Range', 'Beat', 'Assigned IO', 'Accused Count'];
    const rows = filteredCases.map(c => [
      c.caseNumber,
      c.offence,
      c.date,
      c.status,
      c.priority,
      c.range,
      c.beat,
      `"${c.io}"`,
      c.accused.length
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Van_Nyay_Cases_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cases-container">
      {/* Page Title & Top Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === 'hi' ? 'वन अपराध प्रकरण (POR)' : 'Forest Offence Cases'}
          </h1>
          <p className="page-subtitle">
            {language === 'hi' 
              ? 'प्राथमिक वन अपराध रिपोर्ट (POR), अभियोग पत्र (चार्जशीट), मालखाना जब्ती एवं न्यायालय विचारण की विधिक निगरानी।'
              : 'Statutory tracking of Preliminary Offence Reports (POR), Charge Sheets, Malkhana Seizures & Trials.'}
          </p>
        </div>
        <div className="page-header-actions">
          <Button 
            variant="outline" 
            leftIcon={<ScanLine size={16} />}
            onClick={() => setIsScanOcrOpen(true)}
            title="Scan PDF or Document with AI OCR to auto-upload offence case"
            style={{ borderColor: 'var(--color-primary-600)', color: 'var(--color-primary-800)' }}
          >
            {t('cases.scanOcr')}
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<FileSpreadsheet size={16} />}
            onClick={() => setIsBulkImportOpen(true)}
            title="Upload multiple case records via CSV or Excel"
          >
            {t('cases.bulkImport')}
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<Download size={16} />}
            onClick={exportCSV}
            title="Download CSV report of current view"
          >
            {t('cases.exportCsv')}
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={18} />} 
            onClick={() => setIsModalOpen(true)}
          >
            {language === 'hi' ? 'नया POR दर्ज करें' : 'New Offence Report (POR)'}
          </Button>
        </div>
      </div>

      {/* Action Notification Toast Banner */}
      {actionToast && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          border: '1px solid rgba(22, 163, 74, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-primary-800, #15803d)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{actionToast.message}</span>
            {actionToast.caseId && (
              <Link 
                to={`/cases/${actionToast.caseId}`}
                style={{ marginLeft: '0.5rem', textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}
              >
                {language === 'hi' ? 'विवरण देखें →' : 'View Case Dossier →'}
              </Link>
            )}
          </div>
          <button 
            onClick={() => setActionToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
          >
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* Quick Status Chips */}
      <div className="status-chips-scroll">
        {[
          { label: 'All Cases', value: 'ALL', count: cases.length },
          { label: 'FIR Registered', value: 'FIR_REGISTERED', count: cases.filter(c => c.status === 'FIR_REGISTERED').length },
          { label: 'Under Investigation', value: 'UNDER_INVESTIGATION', count: cases.filter(c => c.status === 'UNDER_INVESTIGATION').length },
          { label: 'Charge Sheet Filed', value: 'CHARGESHEET_FILED', count: cases.filter(c => c.status === 'CHARGESHEET_FILED').length },
          { label: 'In Trial', value: 'TRIAL', count: cases.filter(c => c.status === 'TRIAL').length },
          { label: 'Judgment Delivered', value: 'JUDGMENT_DELIVERED', count: cases.filter(c => c.status === 'JUDGMENT_DELIVERED').length },
          { label: 'Appeals', value: 'APPEAL_FILED', count: cases.filter(c => c.status === 'APPEAL_FILED').length }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className="status-chip"
            style={{
              border: statusFilter === tab.value ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
              backgroundColor: statusFilter === tab.value ? 'var(--color-primary-50)' : 'var(--color-surface)',
              color: statusFilter === tab.value ? 'var(--color-primary-900)' : 'var(--color-text-secondary)',
              fontWeight: statusFilter === tab.value ? 600 : 500,
            }}
          >
            <span>{tab.label}</span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.05rem 0.4rem', 
              borderRadius: '999px', 
              backgroundColor: statusFilter === tab.value ? 'var(--color-primary-600)' : 'var(--color-bg-base)',
              color: statusFilter === tab.value ? '#fff' : 'var(--color-text-tertiary)' 
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Table Toolbar */}
        <div className="table-toolbar" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '260px' }}>
            <Input 
              placeholder="Search case #, IO, beat, or accused person..." 
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button 
              variant={isFilterOpen ? 'primary' : 'outline'} 
              leftIcon={<Filter size={16} />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filters {(priorityFilter !== 'ALL' || offenceFilter !== 'ALL') ? '(Active)' : ''}
            </Button>
            {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || offenceFilter !== 'ALL') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setOffenceFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Filter Drawer / Panel */}
        {isFilterOpen && (
          <div style={{ 
            padding: '1rem', 
            borderBottom: '1px solid var(--color-border)', 
            backgroundColor: 'var(--color-bg-base)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <Select
              label="Filter by Offence Category"
              value={offenceFilter}
              onChange={(e) => setOffenceFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'Illegal Cutting', label: 'Illegal Cutting (Timber)' },
                { value: 'Poaching', label: 'Wildlife Poaching' },
                { value: 'Encroachment', label: 'Forest Land Encroachment' },
                { value: 'Wildlife Trade', label: 'Wildlife Trade / Smuggling' },
                { value: 'Illegal Mining', label: 'Illegal Mining in Forest' },
                { value: 'Forest Fire Arson', label: 'Forest Fire / Arson' },
              ]}
            />
            <Select
              label="Filter by Priority Level"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LOW', label: 'Low' },
              ]}
            />
          </div>
        )}
        
        {/* Cases Table (Desktop & Tablet) */}
        <div className="desktop-table-view table-responsive-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number & Priority</TableHead>
                <TableHead>Offence & Description</TableHead>
                <TableHead>Location (Beat / Comp.)</TableHead>
                <TableHead>Date Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned IO</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center" style={{ padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={36} style={{ color: 'var(--color-text-tertiary)' }} />
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-secondary)' }}>No matching offence cases found.</p>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                        Try adjusting your search terms or filter criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="case-number-cell">
                        <Link to={`/cases/${c.id}`} style={{ fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '0.9rem' }}>
                          {c.caseNumber}
                        </Link>
                        {getPriorityBadge(c.priority)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ maxWidth: '240px' }}>
                        <strong style={{ display: 'block', color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>{c.offence}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {c.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: '0.8125rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.beat}</span>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--color-text-tertiary)' }}>
                          {c.compartment} • {c.range}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{c.date}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell>
                      <div style={{ fontSize: '0.825rem' }}>
                        <span style={{ fontWeight: 500 }}>{c.io}</span>
                        {c.accused.length > 0 && (
                          <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--color-text-tertiary)' }}>
                            Accused: {c.accused[0].name} ({c.accused[0].status})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/cases/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          View Dossier
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Touch Cards View (< 768px) */}
        <div className="mobile-cards-view">
          {filteredCases.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
              <FileText size={32} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 0.5rem auto' }} />
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-secondary)' }}>No matching cases found</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                Try different filters or search keywords.
              </p>
            </div>
          ) : (
            filteredCases.map((c) => (
              <div key={c.id} className="mobile-case-card">
                <div className="mobile-case-header">
                  <div>
                    <Link to={`/cases/${c.id}`} className="mobile-case-num">
                      {c.caseNumber}
                    </Link>
                    <span className="mobile-case-date">{c.date}</span>
                  </div>
                  <div className="mobile-case-badges">
                    {getPriorityBadge(c.priority)}
                    {getStatusBadge(c.status)}
                  </div>
                </div>
                <div className="mobile-case-body">
                  <strong className="mobile-case-offence">{c.offence}</strong>
                  <p className="mobile-case-title">{c.title}</p>
                  <div className="mobile-case-meta">
                    <span>📍 {c.beat} • {c.range}</span>
                    <span>👮 IO: {c.io}</span>
                    {c.accused.length > 0 && <span>👤 Accused: {c.accused[0].name} ({c.accused[0].status})</span>}
                  </div>
                </div>
                <div className="mobile-case-footer">
                  <Link to={`/cases/${c.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      Open Case Dossier →
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* New Offence Report Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Register New Forest Offence Report (POR / FIR)"
        size="lg"
        footer={
          createdCaseId ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
              <Button variant="outline" onClick={handleCloseModal}>Stay on Case List</Button>
              <Button variant="primary" onClick={() => navigate(`/cases/${createdCaseId}`)}>
                Open Case Dossier →
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleCreateCase} 
                isLoading={isSubmitting}
                leftIcon={<Save size={18} />}
              >
                Register Offence & Generate POR
              </Button>
            </>
          )
        }
      >
        {createdCaseId ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={56} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-900)' }}>Preliminary Offence Report Registered!</h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Case has been officially entered into the Van Nyay system and assigned to <strong>{ioName}</strong>. Initial Panchnama & FIR Form No. 1 have been initialized.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Section 1: Offence Header */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-800)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                1. Offence Classification & Jurisdiction
              </h4>
              <div className="form-grid-2">
                <Select 
                  label="Offence Category *" 
                  value={offenceType}
                  onChange={(e) => setOffenceType(e.target.value as OffenceType)}
                  options={[
                    { value: 'Illegal Cutting', label: 'Illegal Cutting / Timber Transit' },
                    { value: 'Poaching', label: 'Wildlife Poaching (Schedule I - IV)' },
                    { value: 'Encroachment', label: 'Forest Land Encroachment' },
                    { value: 'Wildlife Trade', label: 'Wildlife Contraband & Trade' },
                    { value: 'Illegal Mining', label: 'Illegal Mining in Forest Land' },
                    { value: 'Forest Fire Arson', label: 'Forest Fire / Arson' },
                  ]}
                />
                <Select 
                  label="Statutory Priority Level *" 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  options={[
                    { value: 'MEDIUM', label: 'Medium Priority' },
                    { value: 'HIGH', label: 'High Priority (Commercial / Endangered)' },
                    { value: 'CRITICAL', label: 'Critical (Schedule-I Wildlife / Heavy Machinery)' },
                    { value: 'LOW', label: 'Low Priority (Minor Infraction)' },
                  ]}
                />
                <Input 
                  label="Case Title / Subject *" 
                  placeholder="e.g. Felling of 14 Sal trees in Chilphi Beat"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  required
                />
                <Select
                  label="Forest Range *"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  options={[
                    { value: 'Bodla Range', label: 'Bodla Range' },
                    { value: 'Pandariya Range', label: 'Pandariya Range' },
                    { value: 'Kawardha Buffer Range', label: 'Kawardha Buffer Range' },
                    { value: 'Rengakhar Range', label: 'Rengakhar Range' }
                  ]}
                />
              </div>

              <div className="form-grid-3" style={{ marginTop: '1rem' }}>
                <Input 
                  label="Beat Name *" 
                  placeholder="e.g. Beat 4 - Chilphi"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                  required
                />
                <Input 
                  label="Compartment No. *" 
                  placeholder="e.g. Comp. No. 248-RF"
                  value={compartment}
                  onChange={(e) => setCompartment(e.target.value)}
                  required
                />
                <Input 
                  label="GPS Coordinates" 
                  placeholder="22.1892° N, 81.0421° E"
                  value={gpsCoordinates}
                  onChange={(e) => setGpsCoordinates(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Timing & Officer */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-800)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                2. Offence Occurrence & Officer Details
              </h4>
              <div className="form-grid-3">
                <Input 
                  label="Date of Detection *" 
                  type="date" 
                  value={offenceDate}
                  onChange={(e) => setOffenceDate(e.target.value)}
                  required
                />
                <Input 
                  label="Time of Detection" 
                  placeholder="e.g. 04:30 AM"
                  value={offenceTime}
                  onChange={(e) => setOffenceTime(e.target.value)}
                />
                <Input 
                  label="Assigned Investigating Officer (IO) *" 
                  value={ioName}
                  onChange={(e) => setIoName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Section 3: Accused Details */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-800)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                3. Primary Accused (If Apprehended or Identified)
              </h4>
              <div className="form-grid-3">
                <Input 
                  label="Accused Full Name" 
                  placeholder="e.g. Ramesh Singh Maravi"
                  value={accusedName}
                  onChange={(e) => setAccusedName(e.target.value)}
                />
                <Input 
                  label="Father's / Husband's Name" 
                  placeholder="e.g. Dayaram Maravi"
                  value={accusedFather}
                  onChange={(e) => setAccusedFather(e.target.value)}
                />
                <Select
                  label="Custody / Remand Status"
                  value={accusedStatus}
                  onChange={(e) => setAccusedStatus(e.target.value as any)}
                  options={[
                    { value: 'Judicial Custody', label: 'In Judicial Custody (Jail)' },
                    { value: 'Under Interrogation', label: 'Under Forest Custody (Remand)' },
                    { value: 'Released on Bail', label: 'Released on Bail' },
                    { value: 'Absconding', label: 'Absconding / Identified' }
                  ]}
                />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <Input 
                  label="Village / Residence Address" 
                  placeholder="e.g. Village Rengakhar, Tehsil Bodla, Dist. Kabirdham"
                  value={accusedVillage}
                  onChange={(e) => setAccusedVillage(e.target.value)}
                />
              </div>
            </div>

            {/* Section 4: Seized Contraband & Property */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-800)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                4. Seized Property & Malkhana Deposit
              </h4>
              <div className="form-grid-3">
                <Input 
                  label="Seized Item Description" 
                  placeholder="e.g. 28 Teak Timber logs, Mahindra Bolero"
                  value={seizedItemName}
                  onChange={(e) => setSeizedItemName(e.target.value)}
                />
                <Input 
                  label="Quantity / Volume" 
                  placeholder="e.g. 4.82 cu.m / 1 Vehicle"
                  value={seizedQuantity}
                  onChange={(e) => setSeizedQuantity(e.target.value)}
                />
                <Input 
                  label="Estimated Market Value" 
                  placeholder="e.g. ₹3,85,000"
                  value={seizedValue}
                  onChange={(e) => setSeizedValue(e.target.value)}
                />
              </div>
            </div>

            {/* Section 5: Narrative */}
            <div>
              <Textarea 
                label="Incident Summary & Patrol Party Narrative *" 
                placeholder="Describe how the offence was detected, patrol party members, initial seizures made, and actions taken..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Bulk CSV / Excel Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        bulkCreateCases={bulkCreateCases}
        onImportSuccess={(count) => {
          setActionToast({
            message: language === 'hi'
              ? `सफलतापूर्वक ${count} नए वन अपराध प्रकरण आयात किए गए!`
              : `Successfully imported ${count} offence records into the registry.`
          });
        }}
      />

      {/* PDF Document Scan / AI OCR Auto-Upload Modal */}
      <ScanOcrModal
        isOpen={isScanOcrOpen}
        onClose={() => setIsScanOcrOpen(false)}
        createCase={createCase}
        onCaseCreated={(newCase) => {
          setActionToast({
            message: language === 'hi'
              ? `दस्तावेज़ OCR से केस ${newCase.caseNumber} सफलतापूर्वक पंजीकृत किया गया!`
              : `Document scanned & case ${newCase.caseNumber} auto-registered successfully!`,
            caseId: newCase.id
          });
        }}
      />
    </div>
  );
};
