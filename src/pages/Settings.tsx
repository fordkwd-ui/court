import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { 
  Key, 
  Shield, 
  Map, 
  Save, 
  Users, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Plus,
  Languages,
  Globe,
  Palette,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';
import './Settings.css';
import { useCases } from '../hooks/useCases';
import { usePreferences } from '../context/PreferencesContext';
import { caseStore } from '../services/caseStore';

export const Settings: React.FC = () => {
  const { officers, addOfficer, resetToDefault } = useCases();
  const { language, theme, setLanguage, setTheme, t } = usePreferences();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Division Configuration State
  const [divisionName, setDivisionName] = useState('North Kabirdham');
  const [divisionCode, setDivisionCode] = useState('KAB-N');
  const [circleName, setCircleName] = useState('Bilaspur Forest Circle');
  const [dfoName, setDfoName] = useState('Vikram Singh, IFS (DFO)');
  const [contactEmail, setContactEmail] = useState('dfo.kabirdham@cg.gov.in');
  const [highCourtLiaison, setHighCourtLiaison] = useState('Bilaspur High Court Forest Legal Cell');

  // SMS Gateway Configuration State
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [twilioSid, setTwilioSid] = useState('ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
  const [twilioToken, setTwilioToken] = useState('••••••••••••••••••••••••••••••••');
  const [twilioPhone, setTwilioPhone] = useState('+1234567890');

  // New Officer Modal State
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerRole, setNewOfficerRole] = useState<'DFO' | 'SDO' | 'RO' | 'IO' | 'Beat Guard' | 'Legal Cell'>('RO');
  const [newOfficerBadge, setNewOfficerBadge] = useState('');
  const [newOfficerPhone, setNewOfficerPhone] = useState('');

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 800);
  };

  const handleAddOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName.trim()) return;

    addOfficer({
      name: newOfficerName,
      role: newOfficerRole,
      badgeNumber: newOfficerBadge || `CG-FOR-${newOfficerRole}-${Math.floor(Math.random() * 8000) + 1000}`,
      division: divisionName,
      range: 'Division HQ',
      email: `${newOfficerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@forest.cg.gov.in`,
      phone: newOfficerPhone || '+91 94252 00000',
      contact: newOfficerPhone || '+91 94252 00000',
      status: 'Active'
    });

    setIsOfficerModalOpen(false);
    setNewOfficerName('');
    setNewOfficerBadge('');
    setNewOfficerPhone('');
  };

  const handleExportBackup = () => {
    const dataStr = caseStore.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Van_Nyay_Backup_${divisionCode}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = caseStore.importData(content);
        if (success) {
          alert('Database restored successfully from backup file!');
        } else {
          alert('Failed to import backup file. Ensure valid JSON schema.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetToDefault();
    setIsResetConfirmOpen(false);
    alert('System database reset to initial statutory demo records.');
  };

  return (
    <div className="settings-container">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#083314',
          color: '#fff',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} style={{ color: '#4ade80' }} />
          <span>Division settings saved and updated!</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-subtitle">{t('settings.subtitle')}</p>
        </div>
        <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSave} isLoading={isSaving}>
          {isSaving ? t('settings.saving') : t('settings.saveBtn')}
        </Button>
      </div>

      <div className="settings-layout">
        <div className="settings-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Language & Theme Preferences */}
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title">
                <Languages size={20} /> {t('settings.prefSection')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="pref-section-group">
                {/* Language Toggle (Hindi / English) */}
                <div className="pref-block">
                  <div className="pref-block-header">
                    <span className="pref-block-title">
                      <Globe size={16} /> {t('settings.langLabel')}
                    </span>
                    <span className="pref-block-sub">
                      {t('settings.langSub')}
                    </span>
                  </div>

                  <div className="pref-cards-grid">
                    {/* English Option */}
                    <button
                      type="button"
                      className={`pref-card ${language === 'en' ? 'active' : ''}`}
                      onClick={() => setLanguage('en')}
                    >
                      <div className="pref-card-icon-wrap">
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>EN</span>
                      </div>
                      <div className="pref-card-content">
                        <div className="pref-card-label">
                          <span>English</span>
                          <span className="pref-radio-indicator">
                            {language === 'en' && <span className="pref-radio-dot" />}
                          </span>
                        </div>
                        <span className="pref-card-desc">
                          Forest Judicial Case Management System (Default)
                        </span>
                      </div>
                    </button>

                    {/* Hindi Option */}
                    <button
                      type="button"
                      className={`pref-card ${language === 'hi' ? 'active' : ''}`}
                      onClick={() => setLanguage('hi')}
                    >
                      <div className="pref-card-icon-wrap">
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>हि</span>
                      </div>
                      <div className="pref-card-content">
                        <div className="pref-card-label">
                          <span>हिंदी (Hindi)</span>
                          <span className="pref-radio-indicator">
                            {language === 'hi' && <span className="pref-radio-dot" />}
                          </span>
                        </div>
                        <span className="pref-card-desc">
                          वन अपराध न्यायिक प्रकरण मॉनिटर (राजभाषा हिंदी)
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Theme Mode Toggle (Light / Dark) */}
                <div className="pref-block" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <div className="pref-block-header">
                    <span className="pref-block-title">
                      <Palette size={16} /> {t('settings.themeLabel')}
                    </span>
                    <span className="pref-block-sub">
                      {t('settings.themeSub')}
                    </span>
                  </div>

                  <div className="pref-cards-grid">
                    {/* Light Mode */}
                    <button
                      type="button"
                      className={`pref-card ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="pref-card-icon-wrap" style={{ color: '#d97706' }}>
                        <Sun size={20} />
                      </div>
                      <div className="pref-card-content">
                        <div className="pref-card-label">
                          <span>{t('theme.light')}</span>
                          <span className="pref-radio-indicator">
                            {theme === 'light' && <span className="pref-radio-dot" />}
                          </span>
                        </div>
                        <span className="pref-card-desc">
                          Forest Clean light canvas for clear daytime readability
                        </span>
                      </div>
                    </button>

                    {/* Dark Mode */}
                    <button
                      type="button"
                      className={`pref-card ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="pref-card-icon-wrap" style={{ color: '#38bdf8' }}>
                        <Moon size={20} />
                      </div>
                      <div className="pref-card-content">
                        <div className="pref-card-label">
                          <span>{t('theme.dark')}</span>
                          <span className="pref-radio-indicator">
                            {theme === 'dark' && <span className="pref-radio-dot" />}
                          </span>
                        </div>
                        <span className="pref-card-desc">
                          Midnight Emerald dark palette optimized for low-light environments
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notification Gateway */}
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title">
                <MessageSquare size={20} /> SMS Gateway Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: smsEnabled ? 'var(--color-primary-50)' : 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Automated SMS Alerts</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Send statutory deadline reminders to Investigating Officers via Twilio.</p>
                  </div>
                  <Button 
                    type="button"
                    variant={smsEnabled ? "primary" : "outline"} 
                    onClick={() => setSmsEnabled(!smsEnabled)}
                  >
                    {smsEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                {smsEnabled && (
                  <div className="form-grid" style={{ marginTop: '0.5rem' }}>
                    <Input 
                      label="Twilio Account SID" 
                      value={twilioSid} 
                      onChange={(e) => setTwilioSid(e.target.value)}
                    />
                    <Input 
                      label="Twilio Auth Token" 
                      type="password"
                      value={twilioToken} 
                      onChange={(e) => setTwilioToken(e.target.value)}
                    />
                    <Input 
                      label="Sender Phone Number" 
                      value={twilioPhone} 
                      onChange={(e) => setTwilioPhone(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Division Configuration */}
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title"><Map size={20} /> {t('settings.divisionSection')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-grid">
                <Input 
                  label={t('settings.divisionName')} 
                  value={divisionName} 
                  onChange={(e) => setDivisionName(e.target.value)}
                />
                <Input 
                  label={t('settings.divisionCode')} 
                  value={divisionCode} 
                  onChange={(e) => setDivisionCode(e.target.value)}
                />
                <Input 
                  label={t('settings.circleName')} 
                  value={circleName} 
                  onChange={(e) => setCircleName(e.target.value)}
                />
                <Input 
                  label={t('settings.dfo')} 
                  value={dfoName} 
                  onChange={(e) => setDfoName(e.target.value)}
                />
                <Input 
                  label={t('settings.nodalEmail')} 
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <Input 
                  label={t('settings.highCourt')} 
                  value={highCourtLiaison} 
                  onChange={(e) => setHighCourtLiaison(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* DSC & E-Sign Settings */}
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title"><Key size={20} /> {t('settings.dscSection')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="dsc-status" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: 'var(--color-bg-base)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(22, 128, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-700)' }}>
                  <Shield size={26} />
                </div>
                <div className="dsc-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{t('settings.dscToken')}</h4>
                    <Badge variant="success">{t('settings.dscActive')}</Badge>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {t('settings.dscLicensedTo')}
                  </p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    {t('settings.dscCryptoInfo')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => alert('DSC Token Hardware diagnostic check passed: Ready for charge sheet signing.')}>
                  {t('settings.dscTestBtn')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Forest Officers & Legal Staff Roster */}
          <Card className="settings-section">
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle className="section-title"><Users size={20} /> {t('settings.rosterSection')}</CardTitle>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsOfficerModalOpen(true)}>
                {t('settings.addOfficer')}
              </Button>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {officers.map(officer => (
                  <div 
                    key={officer.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{officer.name}</strong>
                      <Badge variant="default">{officer.role}</Badge>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                      Badge: {officer.badgeNumber}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      📍 {officer.division}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      📞 {officer.contact || officer.phone}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Database Backup & Maintenance */}
          {/* Data Management & Backup */}
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title"><Database size={20} /> {t('settings.dataSection')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {t('settings.dataDesc')}
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button 
                    variant="outline" 
                    leftIcon={<Download size={16} />}
                    onClick={handleExportBackup}
                  >
                    {t('settings.exportBackup')}
                  </Button>

                  <label>
                    <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportBackup} 
                    style={{ display: 'none' }} 
                  />
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}>
                    <Upload size={16} /> {t('settings.restoreBackup')}
                  </span>
                </label>

                <Button 
                  variant="ghost" 
                  leftIcon={<RotateCcw size={16} />}
                  onClick={() => setIsResetConfirmOpen(true)}
                  style={{ color: 'var(--color-danger)' }}
                >
                  {t('settings.resetDemo')}
                </Button>
              </div>

              <div style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: 'var(--color-bg-base)', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--color-border)',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>{t('settings.storageStatus')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Add Officer Modal */}
      <Modal
        isOpen={isOfficerModalOpen}
        onClose={() => setIsOfficerModalOpen(false)}
        title="Add Authorized Forest Officer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOfficerModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddOfficerSubmit} leftIcon={<Save size={18} />}>
              Save Officer
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddOfficerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Officer Full Name *" 
            placeholder="e.g. Smt. Sunita Markam"
            value={newOfficerName}
            onChange={(e) => setNewOfficerName(e.target.value)}
            required
          />
          <div className="form-grid-2">
            <Select 
              label="Designation / Role *" 
              value={newOfficerRole}
              onChange={(e) => setNewOfficerRole(e.target.value as any)}
              options={[
                { value: 'DFO', label: 'Divisional Forest Officer (DFO)' },
                { value: 'SDO', label: 'Sub-Divisional Officer (SDO)' },
                { value: 'RO', label: 'Range Officer (RO)' },
                { value: 'IO', label: 'Investigating Officer (IO)' },
                { value: 'Beat Guard', label: 'Beat Guard / Deputy Ranger' },
                { value: 'Legal Cell', label: 'Legal Cell In-Charge' },
              ]}
            />
            <Input 
              label="Badge / Department ID" 
              placeholder="e.g. CG-FOR-RO-2091"
              value={newOfficerBadge}
              onChange={(e) => setNewOfficerBadge(e.target.value)}
            />
          </div>
          <Input 
            label="Official Contact Number" 
            placeholder="+91 94252 12345"
            value={newOfficerPhone}
            onChange={(e) => setNewOfficerPhone(e.target.value)}
          />
        </form>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset System to Default Demo Data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsResetConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleResetData}>
              Yes, Reset Everything
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          This will restore the 5 comprehensive statutory demonstration cases (Illegal Teak Felling, Schedule-I Leopard Poaching, Reserve Forest Encroachment, Chital Deer Skin Seizure, and Chilphi Sand Mining) and reset all investigation diaries.
        </p>
      </Modal>
    </div>
  );
};
