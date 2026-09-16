import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Key, Shield, Map, Save, Users } from 'lucide-react';
import './Settings.css';

export const Settings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure division details and system preferences.</p>
        </div>
        <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>

      <div className="settings-layout">
        {/* Navigation / Tabs could go here in future */}
        
        <div className="settings-content">
          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title"><Map size={20} /> Division Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="form-grid">
                <Input label="Division Name" defaultValue="North Kabirdham" />
                <Input label="Division Code" defaultValue="KAB-N" />
                <Input label="Nodal Officer Name" defaultValue="Vikram Singh, DFO" />
                <Input label="Contact Email" defaultValue="dfo.kabirdham@cg.gov.in" />
              </div>
            </CardContent>
          </Card>

          <Card className="settings-section">
            <CardHeader>
              <CardTitle className="section-title"><Key size={20} /> DSC & E-Sign Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="dsc-status">
                <Shield size={32} className="dsc-icon" />
                <div className="dsc-info">
                  <h4>Class 3 Digital Signature Certificate</h4>
                  <p>Status: <Badge variant="success">Active & Registered</Badge></p>
                  <p className="dsc-meta">Registered to: Rajesh Kumar (IO) | Expires: Oct 2025</p>
                </div>
                <Button variant="outline">Update Token</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="settings-section">
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle className="section-title"><Users size={20} /> User Management</CardTitle>
                <Button size="sm" variant="outline">Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="users-list">
                <div className="user-row">
                  <div className="user-details">
                    <strong>Rajesh Kumar</strong>
                    <span>rajesh.k@cg.gov.in</span>
                  </div>
                  <Badge variant="info">Investigating Officer</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="user-row">
                  <div className="user-details">
                    <strong>Suresh Singh</strong>
                    <span>suresh.s@cg.gov.in</span>
                  </div>
                  <Badge variant="info">Investigating Officer</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="user-row">
                  <div className="user-details">
                    <strong>Vikram Singh</strong>
                    <span>vikram.s@cg.gov.in</span>
                  </div>
                  <Badge variant="danger">DFO</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
