import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Search, Filter, Plus, Save } from 'lucide-react';
import './CaseList.css';

// Initial Mock data
const initialCases = [
  { id: 'WL/2024/KAB/00124', caseNumber: 'WL/2024/KAB/00124', offence: 'Illegal Cutting', date: '2024-03-12', status: 'FIR_REGISTERED', priority: 'MEDIUM', io: 'Rajesh Kumar' },
  { id: 'WL/2024/KAB/00123', caseNumber: 'WL/2024/KAB/00123', offence: 'Poaching', date: '2024-03-10', status: 'UNDER_INVESTIGATION', priority: 'HIGH', io: 'Rajesh Kumar' },
  { id: 'WL/2024/KAB/00118', caseNumber: 'WL/2024/KAB/00118', offence: 'Encroachment', date: '2024-02-28', status: 'CHARGESHEET_FILED', priority: 'MEDIUM', io: 'S. Singh' },
  { id: 'WL/2023/KAB/00082', caseNumber: 'WL/2023/KAB/00082', offence: 'Wildlife Trade', date: '2023-11-05', status: 'TRIAL', priority: 'CRITICAL', io: 'Rajesh Kumar' },
  { id: 'WL/2023/KAB/00102', caseNumber: 'WL/2023/KAB/00102', offence: 'Illegal Cutting', date: '2023-08-20', status: 'JUDGMENT_DELIVERED', priority: 'MEDIUM', io: 'A. Patel' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'FIR_REGISTERED': return <Badge variant="info">FIR Registered</Badge>;
    case 'UNDER_INVESTIGATION': return <Badge variant="warning">Investigation</Badge>;
    case 'CHARGESHEET_FILED': return <Badge variant="default">Charge Sheeted</Badge>;
    case 'TRIAL': return <Badge variant="warning">Trial</Badge>;
    case 'JUDGMENT_DELIVERED': return <Badge variant="success">Judgment</Badge>;
    default: return <Badge>{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return <Badge variant="danger">Critical</Badge>;
    case 'HIGH': return <Badge variant="warning">High</Badge>;
    case 'MEDIUM': return <Badge variant="info">Medium</Badge>;
    default: return null;
  }
};

export const CaseList: React.FC = () => {
  const [cases, setCases] = useState(initialCases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [offenceType, setOffenceType] = useState('Illegal Cutting');
  const [offenceDate, setOffenceDate] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleCreateCase = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newCaseNo = `WL/2024/KAB/00${Math.floor(Math.random() * 900) + 100}`;
      const newCase = {
        id: newCaseNo,
        caseNumber: newCaseNo,
        offence: offenceType,
        date: offenceDate || new Date().toISOString().split('T')[0],
        status: 'FIR_REGISTERED',
        priority: priority,
        io: 'Rajesh Kumar', // Mock logged in user
      };
      
      setCases([newCase, ...cases]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      
      // Reset form
      setOffenceType('Illegal Cutting');
      setOffenceDate('');
      setLocation('');
      setPriority('MEDIUM');
    }, 800);
  };

  return (
    <div className="cases-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cases</h1>
          <p className="page-subtitle">Manage and track all forest offence cases.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          New Offence Report
        </Button>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="search-box">
            <Input 
              placeholder="Search by case number or IO..." 
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>Filters</Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Number</TableHead>
              <TableHead>Offence Type</TableHead>
              <TableHead>Offence Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned IO</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="case-number-cell">
                    <strong>{c.caseNumber}</strong>
                    {getPriorityBadge(c.priority)}
                  </div>
                </TableCell>
                <TableCell>{c.offence}</TableCell>
                <TableCell>{c.date}</TableCell>
                <TableCell>{getStatusBadge(c.status)}</TableCell>
                <TableCell>{c.io}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/cases/${encodeURIComponent(c.id)}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Offence Report (FIR Draft)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleCreateCase} 
              isLoading={isSubmitting}
              leftIcon={<Save size={18} />}
            >
              Generate Draft
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select 
            label="Offence Type" 
            value={offenceType}
            onChange={(e) => setOffenceType(e.target.value)}
            options={[
              { value: 'Illegal Cutting', label: 'Illegal Cutting' },
              { value: 'Poaching', label: 'Poaching' },
              { value: 'Encroachment', label: 'Encroachment' },
              { value: 'Wildlife Trade', label: 'Wildlife Trade' },
            ]}
          />
          <Input 
            label="Offence Date" 
            type="date" 
            value={offenceDate}
            onChange={(e) => setOffenceDate(e.target.value)}
          />
          <Input 
            label="Location (Beat / Compartment)" 
            placeholder="e.g. Beat 4, North Kabirdham"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Select 
            label="Priority" 
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};
