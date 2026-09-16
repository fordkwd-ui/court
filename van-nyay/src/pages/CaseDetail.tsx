import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { FileText, MapPin, Calendar as CalendarIcon, User, ChevronLeft, ArrowRight, Download, FileSignature, UploadCloud, Save, CheckCircle, Plus } from 'lucide-react';
import './CaseDetail.css';

// Mock case details
const mockCaseData = {
  id: 'WL/2024/KAB/00124',
  offence: 'Illegal Cutting',
  date: '2024-03-12',
  status: 'FIR_REGISTERED',
  priority: 'MEDIUM',
  io: 'Rajesh Kumar (Investigating Officer)',
  location: 'Beat 4, North Kabirdham',
  sections: ['Sec 33 IF Act', 'Sec 2 (16) WLPA'],
  description: 'Patrol team found freshly cut teak logs. 2 suspects detained on site.',
};

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isChargeSheetModalOpen, setIsChargeSheetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fake investigation logs
  const [logs, setLogs] = useState([
    { id: 1, action: 'Site Visit', date: '2024-03-13', description: 'Visited the site, found tire marks.', evidenceCount: 2 }
  ]);
  
  // Log Form State
  const [logAction, setLogAction] = useState('Site Visit');
  const [logDesc, setLogDesc] = useState('');
  const [logDate, setLogDate] = useState('');

  // Charge Sheet state
  const [csStep, setCsStep] = useState(1); // 1 = Review, 2 = Sign, 3 = Success

  // Judgment / OCR State
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ conviction?: string, fine?: string, sentence?: string, appealDeadline?: string } | null>(null);

  const handleUploadJudgment = () => {
    setIsProcessingOCR(true);
    // Simulate OCR processing time
    setTimeout(() => {
      setOcrResult({
        conviction: 'Guilty under Sec 33 IF Act, 1927',
        sentence: '3 Years Rigorous Imprisonment',
        fine: '₹50,000',
        appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      });
      setIsProcessingOCR(false);
    }, 2500);
  };

  const handleAddLog = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLogs([
        ...logs,
        { id: Date.now(), action: logAction, date: logDate || new Date().toISOString().split('T')[0], description: logDesc, evidenceCount: 1 }
      ]);
      setIsSubmitting(false);
      setIsLogModalOpen(false);
      setLogDesc('');
    }, 800);
  };

  const handleCompile = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setCsStep(3);
      setIsSubmitting(false);
    }, 1500);
  };

  // If no ID passed, we'll just use the mock data for demonstration
  const caseId = id || mockCaseData.id;

  return (
    <div className="case-detail-container">
      {/* Header */}
      <div className="case-header">
        <div className="case-header-left">
          <Link to="/cases" className="back-link">
            <ChevronLeft size={16} /> Back to Cases
          </Link>
          <div className="case-title-row">
            <h1 className="case-title">{caseId}</h1>
            <Badge variant="info">FIR Registered</Badge>
            <Badge variant="warning">Medium Priority</Badge>
          </div>
        </div>
        <div className="case-header-actions">
          <Button variant="outline" leftIcon={<Download size={18} />}>Export PDF</Button>
          <Button variant="primary" leftIcon={<FileSignature size={18} />} onClick={() => { setIsChargeSheetModalOpen(true); setCsStep(1); }}>
            Sign & Compile Charge Sheet
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'investigation' ? 'active' : ''}`} onClick={() => setActiveTab('investigation')}>Investigation Logs</button>
        <button className={`tab ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>Evidence</button>
        <button className={`tab ${activeTab === 'hearings' ? 'active' : ''}`} onClick={() => setActiveTab('hearings')}>Hearings</button>
        <button className={`tab ${activeTab === 'judgment' ? 'active' : ''}`} onClick={() => setActiveTab('judgment')}>Judgment & Appeal</button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            {/* Left Column - Details */}
            <div className="details-col">
              <Card>
                <CardHeader>
                  <CardTitle>Offence Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span className="detail-label"><FileText size={16} /> Offence Type</span>
                      <span className="detail-value">{mockCaseData.offence}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><CalendarIcon size={16} /> Offence Date</span>
                      <span className="detail-value">{mockCaseData.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><MapPin size={16} /> Location</span>
                      <span className="detail-value">{mockCaseData.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label"><User size={16} /> Assigned To</span>
                      <span className="detail-value">{mockCaseData.io}</span>
                    </div>
                  </div>
                  
                  <div className="sections-container">
                    <h4 className="sub-title">Applicable Sections</h4>
                    <div className="badge-row">
                      {mockCaseData.sections.map(sec => <Badge key={sec} variant="default">{sec}</Badge>)}
                    </div>
                  </div>

                  <div className="description-container">
                    <h4 className="sub-title">Description</h4>
                    <p className="description-text">{mockCaseData.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Timeline */}
            <div className="timeline-col">
              <Card>
                <CardHeader>
                  <CardTitle>Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="case-timeline">
                    <div className="timeline-step completed">
                      <div className="step-indicator"></div>
                      <div className="step-content">
                        <strong>Offence Reported</strong>
                        <span>March 12, 2024 - Guard Patrol</span>
                      </div>
                    </div>
                    <div className="timeline-step completed">
                      <div className="step-indicator"></div>
                      <div className="step-content">
                        <strong>FIR Generated & Signed</strong>
                        <span>March 13, 2024 - RFO North</span>
                        <Button variant="ghost" size="sm" className="inline-action">View FIR Document <ArrowRight size={14} /></Button>
                      </div>
                    </div>
                    <div className="timeline-step active">
                      <div className="step-indicator"></div>
                      <div className="step-content">
                        <strong>Investigation in Progress</strong>
                        <span>Assigned to Rajesh Kumar (IO)</span>
                      </div>
                    </div>
                    <div className="timeline-step pending">
                      <div className="step-indicator"></div>
                      <div className="step-content">
                        <strong>Charge Sheet Filing</strong>
                        <span>Pending</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'investigation' && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <CardTitle>Investigation Logs</CardTitle>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsLogModalOpen(true)}>Add Log</Button>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h3>No Investigation Logs Yet</h3>
                  <p>Click below to add a site visit, seizure, or witness statement.</p>
                  <Button onClick={() => setIsLogModalOpen(true)}>Add Investigation Log</Button>
                </div>
              ) : (
                <div className="logs-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{log.action}</strong>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{log.date}</span>
                      </div>
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)' }}>{log.description}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Badge variant="info">{log.evidenceCount} File(s) attached</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(activeTab === 'evidence' || activeTab === 'hearings') && (
          <Card>
            <CardContent>
              <p>Content for {activeTab} will go here.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'judgment' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Card>
              <CardHeader>
                <CardTitle>Upload Judgment</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  onClick={!isProcessingOCR && !ocrResult ? handleUploadJudgment : undefined}
                  style={{ 
                    border: '2px dashed var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '3rem 2rem', 
                    textAlign: 'center', 
                    backgroundColor: ocrResult ? 'var(--color-success)' : 'var(--color-bg-base)',
                    color: ocrResult ? 'white' : 'inherit',
                    cursor: !isProcessingOCR && !ocrResult ? 'pointer' : 'default',
                    transition: 'all 0.3s'
                  }}
                >
                  {isProcessingOCR ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div className="spinner" style={{ width: '2rem', height: '2rem', border: '3px solid var(--color-primary-200)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <p style={{ margin: 0, fontWeight: 600 }}>Running OCR Extraction...</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>Extracting conviction details, sections, and fine amounts.</p>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  ) : ocrResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <CheckCircle size={48} />
                      <h3 style={{ margin: 0 }}>Judgment Processed</h3>
                      <p style={{ margin: 0, opacity: 0.9 }}>Data successfully extracted via OCR.</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem auto' }} />
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload Court Order / Judgment</h3>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Click to select PDF or drag and drop</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extracted Summary & Appeals</CardTitle>
              </CardHeader>
              <CardContent>
                {!ocrResult ? (
                  <div className="empty-state" style={{ padding: '2rem 0' }}>
                    <p>Upload a judgment to see extracted details.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Conviction Details</h4>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{ocrResult.conviction}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Sentence</h4>
                        <p style={{ margin: 0, fontWeight: 500 }}>{ocrResult.sentence}</p>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Fine</h4>
                        <p style={{ margin: 0, fontWeight: 500 }}>{ocrResult.fine}</p>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CalendarIcon size={16} /> Appeal Deadline
                          </h4>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem' }}>{ocrResult.appealDeadline}</p>
                        </div>
                        <Button variant="danger">Draft Appeal</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Add Investigation Log"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddLog} isLoading={isSubmitting} leftIcon={<Save size={18} />}>Save Log</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Action Type" 
            value={logAction}
            onChange={(e) => setLogAction(e.target.value)}
            options={[
              { value: 'Site Visit', label: 'Site Visit' },
              { value: 'Seizure', label: 'Seizure' },
              { value: 'Arrest', label: 'Arrest' },
              { value: 'Witness Statement', label: 'Witness Statement' },
            ]}
          />
          <Input 
            label="Date" 
            type="date" 
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
          />
          <Textarea 
            label="Description" 
            placeholder="Describe the findings or actions taken..."
            value={logDesc}
            onChange={(e) => setLogDesc(e.target.value)}
          />
          <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-base)' }}>
            <UploadCloud size={32} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 0.5rem auto' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>Click to upload evidence</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Photos, Panchnama, Seizure Memos</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isChargeSheetModalOpen}
        onClose={() => setIsChargeSheetModalOpen(false)}
        title="Compile Charge Sheet"
        size="lg"
        footer={
          csStep === 3 ? (
            <Button variant="primary" onClick={() => setIsChargeSheetModalOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsChargeSheetModalOpen(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleCompile} 
                isLoading={isSubmitting}
                leftIcon={<FileSignature size={18} />}
              >
                Sign with DSC & File
              </Button>
            </>
          )
        }
      >
        {csStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-800)' }}>
              <strong>Review Compiled Data:</strong> The system has auto-compiled the charge sheet using your investigation logs and FIR details. Please review before applying your digital signature.
            </div>
            
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Accused Details</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Ramesh Singh</TableCell>
                    <TableCell>42</TableCell>
                    <TableCell>Judicial Custody</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Evidence Log Summary</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-text-secondary)' }}>
                <li>Site Visit (Mar 13): Found tire marks (2 photos attached)</li>
                <li>Seizure (Mar 14): Teak logs seized. Panchnama attached.</li>
              </ul>
            </div>
            
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: '0 0 1rem 0' }}>Please insert your <strong>Class 3 DSC USB Token</strong> to sign this document.</p>
              <Input type="password" placeholder="Enter Token PIN" style={{ maxWidth: '300px', margin: '0 auto' }} />
            </div>
          </div>
        )}
        
        {csStep === 3 && (
          <div className="empty-state">
            <CheckCircle size={64} style={{ color: 'var(--color-success)' }} />
            <h2 style={{ color: 'var(--color-success)' }}>Charge Sheet Filed Successfully!</h2>
            <p>The charge sheet has been digitally signed and the case status is now updated to "CHARGESHEET_FILED".</p>
            <p style={{ fontWeight: 600 }}>Auto-Assigned Court: Court No. 1, Kabirdham</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
