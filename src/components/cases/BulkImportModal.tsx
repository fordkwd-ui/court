import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ForestCase, OffenceType, PriorityLevel } from '../../types/case';
import { usePreferences } from '../../context/PreferencesContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
  bulkCreateCases: (cases: Partial<ForestCase>[]) => ForestCase[];
}

interface ParsedCaseRow {
  selected: boolean;
  caseNumber?: string;
  offence: OffenceType;
  title: string;
  date: string;
  time?: string;
  division?: string;
  range: string;
  beat: string;
  compartment?: string;
  gpsCoordinates?: string;
  location?: string;
  priority: PriorityLevel;
  sections: string[];
  io: string;
  reportingOfficer?: string;
  description: string;
  accusedName?: string;
  accusedAge?: number;
  accusedVillage?: string;
  accusedStatus?: 'Judicial Custody' | 'Released on Bail' | 'Absconding' | 'Under Interrogation';
  seizedItem?: string;
  seizedCategory?: 'Timber' | 'Vehicle' | 'Tool/Weapon' | 'Wildlife Trophy' | 'Mineral';
  seizedQuantity?: string;
  seizedValue?: string;
  warnings: string[];
}

const VALID_OFFENCES: OffenceType[] = [
  'Illegal Cutting',
  'Poaching',
  'Encroachment',
  'Wildlife Trade',
  'Illegal Mining',
  'Forest Fire Arson'
];

const VALID_PRIORITIES: PriorityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  bulkCreateCases
}) => {
  const { language } = usePreferences();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedCaseRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const resetState = () => {
    setFileName('');
    setParsedRows([]);
    setErrorMsg(null);
    setSuccessCount(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Process XLSX / CSV workbook
  const processWorkbook = (workbook: XLSX.WorkBook, name: string) => {
    try {
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      if (rawJson.length === 0) {
        setErrorMsg(language === 'hi' ? 'फ़ाइल रिक्त है या कोई मान्य पंक्तियां नहीं मिलीं।' : 'The uploaded spreadsheet is empty or has no valid rows.');
        setIsProcessing(false);
        return;
      }

      const rows: ParsedCaseRow[] = rawJson.map((row, index) => {
        const warnings: string[] = [];

        // Normalize keys (lowercase without special chars)
        const normalized: Record<string, any> = {};
        Object.keys(row).forEach(k => {
          const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          normalized[normKey] = row[k];
        });

        // 1. Offence Type
        let rawOffence = normalized['offence'] || normalized['offencetype'] || normalized['type'] || '';
        let offence: OffenceType = 'Illegal Cutting';
        const matchedOffence = VALID_OFFENCES.find(o => o.toLowerCase() === String(rawOffence).toLowerCase().trim());
        if (matchedOffence) {
          offence = matchedOffence;
        } else if (rawOffence) {
          warnings.push(`Unknown offence "${rawOffence}". Defaulted to Illegal Cutting.`);
        }

        // 2. Date
        let date = normalized['date'] || normalized['offencedate'] || normalized['incidentdate'] || '';
        if (!date) {
          date = new Date().toISOString().split('T')[0];
        } else if (typeof date === 'number') {
          // Excel serial date to JS Date
          const excelDate = new Date(Math.round((date - 25569) * 86400 * 1000));
          date = excelDate.toISOString().split('T')[0];
        } else {
          date = String(date).trim();
        }

        // 3. Priority
        let rawPriority = String(normalized['priority'] || '').toUpperCase().trim();
        let priority: PriorityLevel = 'MEDIUM';
        if (VALID_PRIORITIES.includes(rawPriority as PriorityLevel)) {
          priority = rawPriority as PriorityLevel;
        }

        // 4. Case / POR Number
        const caseNumber = normalized['casenumber'] || normalized['caseno'] || normalized['porno'] || normalized['pornumber'] || '';

        // 5. Title
        const range = normalized['range'] || 'Bodla Range';
        const beat = normalized['beat'] || `Beat ${index + 1}`;
        const title = normalized['title'] || `${offence} detected in ${beat}`;

        // 6. Location & Compartment
        const compartment = normalized['compartment'] || `Comp. No. ${100 + index}-RF`;
        const division = normalized['division'] || 'North Kabirdham';
        const location = normalized['location'] || `${beat}, ${range}`;
        const gpsCoordinates = normalized['gpscoordinates'] || normalized['gps'] || '22.1892° N, 81.0421° E';

        // 7. Sections
        let rawSections = normalized['sections'] || normalized['acts'] || normalized['legalact'] || '';
        let sections: string[] = [];
        if (typeof rawSections === 'string' && rawSections.trim()) {
          sections = rawSections.split(';').map(s => s.trim()).filter(Boolean);
        }
        if (sections.length === 0) {
          sections = offence === 'Poaching' || offence === 'Wildlife Trade'
            ? ['Sec 9, 39 & 51 Wildlife (Protection) Act, 1972']
            : ['Sec 26 & 33 Indian Forest Act, 1927', 'CG Transit Rules 2001'];
        }

        // 8. Officers
        const io = normalized['io'] || normalized['investigatingofficer'] || 'Rajesh Kumar (IO)';
        const reportingOfficer = normalized['reportingofficer'] || normalized['guard'] || 'Beat Guard on Duty';
        const description = normalized['description'] || normalized['details'] || `Offence of ${offence} reported in ${beat}. Bulk imported register entry.`;

        // 9. Accused
        const accusedName = normalized['accusedname'] || normalized['accused'] || '';
        const accusedAge = parseInt(normalized['accusedage'] || '35', 10) || 35;
        const accusedVillage = normalized['accusedvillage'] || normalized['village'] || 'Local Hamlet';
        const accusedStatus = 'Judicial Custody';

        // 10. Seized Items
        const seizedItem = normalized['seizeditem'] || normalized['seizeditems'] || normalized['seizure'] || '';
        const seizedValue = normalized['estimatedvalue'] || normalized['value'] || (seizedItem ? '₹45,000' : '');
        const seizedQuantity = normalized['quantity'] || '1 Lot';

        return {
          selected: true,
          caseNumber: caseNumber ? String(caseNumber).trim() : undefined,
          offence,
          title,
          date,
          division,
          range,
          beat,
          compartment,
          location,
          gpsCoordinates,
          priority,
          sections,
          io,
          reportingOfficer,
          description,
          accusedName: accusedName ? String(accusedName).trim() : undefined,
          accusedAge,
          accusedVillage,
          accusedStatus,
          seizedItem: seizedItem ? String(seizedItem).trim() : undefined,
          seizedQuantity,
          seizedValue,
          warnings
        };
      });

      setFileName(name);
      setParsedRows(rows);
      setErrorMsg(null);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Error parsing file:', err);
      setErrorMsg(language === 'hi' ? 'फ़ाइल पार्स करने में त्रुटि: ' + err.message : 'Error reading file: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        processWorkbook(workbook, file.name);
      } catch {
        setErrorMsg(language === 'hi' ? 'अमान्य स्प्रेडशीट फ़ाइल स्वरूप।' : 'Invalid spreadsheet file format.');
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Download official CSV template
  const downloadSampleTemplate = () => {
    const headers = [
      'Case Number (Optional)',
      'Offence Type',
      'Title',
      'Date (YYYY-MM-DD)',
      'Range',
      'Beat',
      'Compartment',
      'Sections (Semicolon separated)',
      'Priority (LOW/MEDIUM/HIGH/CRITICAL)',
      'IO Name',
      'Accused Name',
      'Accused Age',
      'Accused Village',
      'Seized Items',
      'Estimated Value',
      'Description'
    ];

    const sampleRow = [
      'POR/2024/KAB/00341',
      'Illegal Cutting',
      'Illicit Felling of Sal & Teak in Chilphi',
      new Date().toISOString().split('T')[0],
      'Bodla Range',
      'Beat 4 - Chilphi Ghati',
      'Comp. No. 248-RF',
      'Sec 26 & 33 Indian Forest Act, 1927; CG Transit Rules 2001',
      'MEDIUM',
      'Rajesh Kumar (IO)',
      'Ramesh Singh Maravi',
      '42',
      'Village Rengakhar',
      '4 Teak Logs & 1 Chainsaw',
      '₹55,000',
      'Interception during night patrol with contraband timber.'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cases_Import_Template');
    XLSX.writeFile(wb, 'Van_Nyay_Offence_Cases_Template.xlsx');
  };

  // Preload sample test dataset for quick testing
  const loadDemoData = () => {
    const today = new Date().toISOString().split('T')[0];
    const demoRows: ParsedCaseRow[] = [
      {
        selected: true,
        caseNumber: `POR/2024/KAB/${Math.floor(1000 + Math.random() * 9000)}`,
        offence: 'Illegal Cutting',
        title: 'Unauthorized Chainsaw Felling of 6 Sal Trees',
        date: today,
        division: 'North Kabirdham',
        range: 'Bodla Range',
        beat: 'Beat 3 - Chilphi Ghati',
        compartment: 'Comp. No. 244-RF',
        priority: 'MEDIUM',
        sections: ['Sec 26(1)(f) Indian Forest Act, 1927', 'CG Transit Rules 2001'],
        io: 'Rajesh Kumar (IO)',
        reportingOfficer: 'Mohan Lal Dhurve (Beat Guard)',
        description: 'Night patrol intercepted suspects transporting green cut logs on bullock cart.',
        accusedName: 'Manglu Baiga',
        accusedAge: 38,
        accusedVillage: 'Chilphi Hamlet',
        accusedStatus: 'Judicial Custody',
        seizedItem: '6 Sal Logs (1.4 cu.m) & 1 Electric Saw',
        seizedCategory: 'Timber',
        seizedQuantity: '6 Logs',
        seizedValue: '₹72,000',
        warnings: []
      },
      {
        selected: true,
        caseNumber: `WL/2024/KAB/${Math.floor(1000 + Math.random() * 9000)}`,
        offence: 'Poaching',
        title: 'Steel Wire Snares & Poisoned Baits Laid Near Waterhole',
        date: today,
        division: 'North Kabirdham',
        range: 'Pandariya Range',
        beat: 'Beat 2 - Phen Sanctuary Buffer',
        compartment: 'Comp. No. 18-RF Buffer',
        priority: 'CRITICAL',
        sections: ['Sec 9, 39 & 51 Wildlife (Protection) Act, 1972'],
        io: 'Suresh Sahu (RFO, Pandariya)',
        reportingOfficer: 'Hemant Verma (Guard)',
        description: 'Joint search team recovered lethal tension snares set for herbivores near forest stream.',
        accusedName: 'Sukhlal Gond',
        accusedAge: 44,
        accusedVillage: 'Boregaon',
        accusedStatus: 'Judicial Custody',
        seizedItem: '3 Steel Wire Snares & 1 Country Made Axe',
        seizedCategory: 'Tool/Weapon',
        seizedQuantity: '4 Items',
        seizedValue: '₹8,500',
        warnings: []
      },
      {
        selected: true,
        caseNumber: `FOR/2024/KAB/${Math.floor(1000 + Math.random() * 9000)}`,
        offence: 'Encroachment',
        title: 'Illegal Tractor Tilling & Boundary Stone Demolition',
        date: today,
        division: 'North Kabirdham',
        range: 'Taregaon Range',
        beat: 'Beat 1 - Taregaon Central',
        compartment: 'Comp. No. 92-PF',
        priority: 'HIGH',
        sections: ['Sec 26(1)(h) Indian Forest Act, 1927'],
        io: 'Anjali Netam (ACF)',
        reportingOfficer: 'Dhanesh Patel (Forester)',
        description: 'Unauthorized clearing of 1.2 hectares of reserve forest using mechanized tractor.',
        accusedName: 'Dhaniram Sahu',
        accusedAge: 51,
        accusedVillage: 'Taregaon Khurd',
        accusedStatus: 'Judicial Custody',
        seizedItem: '1 Swaraj 744 Tractor with Plough',
        seizedCategory: 'Vehicle',
        seizedQuantity: '1 Unit',
        seizedValue: '₹5,50,000',
        warnings: []
      },
      {
        selected: true,
        caseNumber: `MIN/2024/KAB/${Math.floor(1000 + Math.random() * 9000)}`,
        offence: 'Illegal Mining',
        title: 'Unauthorized Excavation & Quarrying of Quartzite Stone',
        date: today,
        division: 'North Kabirdham',
        range: 'Kawardha Buffer',
        beat: 'Beat 4 - Baroda Ghati',
        compartment: 'Comp. No. 19-RF',
        priority: 'HIGH',
        sections: ['Sec 26 Indian Forest Act, 1927', 'MMDR Act 1957'],
        io: 'Rajesh Kumar (IO)',
        reportingOfficer: 'Sunil Toppo (Beat Guard)',
        description: 'Excavation of forest stone for road ballast without clearance.',
        accusedName: 'Rajendra Prasad Agrawal',
        accusedAge: 49,
        accusedVillage: 'Industrial Area Kawardha',
        accusedStatus: 'Released on Bail',
        seizedItem: '1 JCB 3DX & 2 Tipper Trucks',
        seizedCategory: 'Vehicle',
        seizedQuantity: '3 Units',
        seizedValue: '₹48,00,000',
        warnings: []
      }
    ];

    setFileName('Demo_Forest_Offence_Register_4_Cases.xlsx');
    setParsedRows(demoRows);
    setErrorMsg(null);
    setSuccessCount(null);
  };

  const toggleSelectRow = (index: number) => {
    setParsedRows(prev => prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = () => {
    const allSelected = parsedRows.every(r => r.selected);
    setParsedRows(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const handleExecuteImport = () => {
    const selectedRows = parsedRows.filter(r => r.selected);
    if (selectedRows.length === 0) {
      setErrorMsg(language === 'hi' ? 'कृपया आयात के लिए कम से कम एक पंक्ति का चयन करें।' : 'Please select at least one row to import.');
      return;
    }

    setIsProcessing(true);

    const casesToCreate: Partial<ForestCase>[] = selectedRows.map(row => {
      return {
        caseNumber: row.caseNumber,
        title: row.title,
        offence: row.offence,
        date: row.date,
        time: row.time || '10:00 AM',
        division: row.division || 'North Kabirdham',
        range: row.range,
        round: 'Central Round',
        beat: row.beat,
        compartment: row.compartment || 'Comp. 101-RF',
        gpsCoordinates: row.gpsCoordinates || '22.1892° N, 81.0421° E',
        location: row.location || `${row.beat}, ${row.range}`,
        priority: row.priority,
        sections: row.sections,
        io: row.io,
        reportingOfficer: row.reportingOfficer || 'Mohan Lal Dhurve (Beat Guard)',
        description: row.description,
        accused: row.accusedName ? [
          {
            id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: row.accusedName,
            age: row.accusedAge || 35,
            fatherName: 'Father Name on Record',
            village: row.accusedVillage || 'Local Village',
            status: row.accusedStatus || 'Judicial Custody',
            idProof: 'Aadhaar / Voter ID Verified'
          }
        ] : [],
        seizedItems: row.seizedItem ? [
          {
            id: `sz-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            item: row.seizedItem,
            category: row.seizedCategory || 'Timber',
            quantity: row.seizedQuantity || '1 Lot',
            estimatedValue: row.seizedValue || '₹50,000',
            malkhanaLocation: `${row.range} Malkhana`,
            status: 'In Range Malkhana'
          }
        ] : []
      };
    });

    setTimeout(() => {
      try {
        const created = bulkCreateCases(casesToCreate);
        setIsProcessing(false);
        setSuccessCount(created.length);
        onImportSuccess(created.length);
        setTimeout(() => {
          handleClose();
        }, 1200);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMsg('Failed to commit bulk cases: ' + err.message);
      }
    }, 400);
  };

  const selectedCount = parsedRows.filter(r => r.selected).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={language === 'hi' ? 'थोक CSV / Excel अपराध प्रकरण आयात' : 'Bulk CSV / Excel Offence Cases Import'}
      size="xl"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Intro & Action Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {language === 'hi'
                ? 'एक साथ कई प्राथमिक वन अपराध (POR) प्रकरणों को स्प्रेडशीट से आयात करें।'
                : 'Upload multiple Preliminary Offence Records (POR) simultaneously from Excel (.xlsx) or CSV format.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
            >
              <Download size={14} />
              {language === 'hi' ? 'टेम्पलेट डाउनलोड करें' : 'Download Sample Template'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadDemoData}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
            >
              <Sparkles size={14} />
              {language === 'hi' ? 'नमूना डेटा लोड करें (4 केस)' : 'Load Demo Register (4 Cases)'}
            </Button>
          </div>
        </div>

        {/* Upload Drop Zone (if no file loaded yet) */}
        {parsedRows.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1.5rem',
              border: `2px dashed ${isDragging ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isDragging ? 'var(--color-primary-50, rgba(22,101,52,0.05))' : 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .xlsx, .xls"
              style={{ display: 'none' }}
            />
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-100, rgba(22,101,52,0.12))',
              color: 'var(--color-primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <FileSpreadsheet size={28} />
            </div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
              {language === 'hi' ? 'CSV या Excel फ़ाइल यहाँ खींचें या चुनें' : 'Drag and drop your CSV or Excel file here'}
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Supports .xlsx, .xls, and .csv formats with headers (Case No, Offence, Date, Beat, Accused, Seizure)
            </p>
            <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>
              <Upload size={14} style={{ marginRight: '6px' }} />
              {language === 'hi' ? 'फ़ाइल ब्राउज़ करें' : 'Browse Files'}
            </Button>
          </div>
        ) : (
          /* File loaded state: Summary and Preview Table */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.03))',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileSpreadsheet size={20} color="var(--color-primary-700)" />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{fileName}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.75rem' }}>
                    <span>Total Rows: <strong>{parsedRows.length}</strong></span>
                    <span>Selected: <strong>{selectedCount}</strong></span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
                style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Trash2 size={14} />
                {language === 'hi' ? 'हटाएं व पुनः चुनें' : 'Remove & Change File'}
              </Button>
            </div>

            {/* Preview Table */}
            <div style={{ 
              maxHeight: '360px', 
              overflowY: 'auto', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-hover, #f8fafc)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem', width: '36px' }}>
                      <input
                        type="checkbox"
                        checked={parsedRows.length > 0 && parsedRows.every(r => r.selected)}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>#</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Case / POR No.</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Offence Type</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Title & Beat</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Date</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Accused</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Seizure Item</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: row.selected ? 'transparent' : 'rgba(0,0,0,0.02)',
                        opacity: row.selected ? 1 : 0.6
                      }}
                    >
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleSelectRow(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--color-text-secondary)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>
                        {row.caseNumber || <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Auto-Assign</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <Badge variant="default" style={{ fontSize: '0.72rem' }}>
                          {row.offence}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <div style={{ fontWeight: 500, maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          {row.beat} ({row.range})
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                        {row.date}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        {row.accusedName ? (
                          <span>{row.accusedName} ({row.accusedAge || 35}y)</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>None listed</span>
                        )}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.seizedItem || <span style={{ color: 'var(--color-text-secondary)' }}>-</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <Badge 
                          variant={row.priority === 'CRITICAL' ? 'danger' : (row.priority === 'HIGH' ? 'warning' : 'default')}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {row.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error / Warning Alert */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            fontSize: '0.8125rem'
          }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Toast */}
        {successCount !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(22, 163, 74, 0.12)',
            color: '#16a34a',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            <span>
              {language === 'hi'
                ? `सफलतापूर्वक ${successCount} प्रकरण आयात किए गए!`
                : `Successfully imported ${successCount} offence cases into registry!`}
            </span>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border)'
        }}>
          <Button variant="ghost" onClick={handleClose}>
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>

          {parsedRows.length > 0 && (
            <Button
              variant="primary"
              onClick={handleExecuteImport}
              disabled={selectedCount === 0 || isProcessing || successCount !== null}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isProcessing ? (
                <span>{language === 'hi' ? 'आयात हो रहा है...' : 'Importing...'}</span>
              ) : (
                <>
                  <Layers size={16} />
                  <span>
                    {language === 'hi'
                      ? `${selectedCount} प्रकरण आयात करें`
                      : `Import ${selectedCount} Record${selectedCount === 1 ? '' : 's'}`}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
