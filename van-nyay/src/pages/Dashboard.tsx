import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AlertCircle, TrendingUp, Clock, FileCheck } from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Division Command</h1>
          <p className="page-subtitle">Kabirdham Division Overview</p>
        </div>
        <div className="dashboard-actions">
          <Badge variant="success">Online</Badge>
        </div>
      </header>

      {/* KPIs */}
      <section className="kpi-grid">
        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper success">
              <TrendingUp size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Conviction Rate</span>
              <h2 className="kpi-value">68%</h2>
              <span className="kpi-trend positive">↑ 12% from last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper warning">
              <Clock size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Pending Cases</span>
              <h2 className="kpi-value">1,245</h2>
              <span className="kpi-trend negative">↓ 3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="kpi-content">
            <div className="kpi-icon-wrapper info">
              <FileCheck size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Charge Sheets Filed (YTD)</span>
              <h2 className="kpi-value">342</h2>
              <span className="kpi-trend">Avg. 42 days to file</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Critical Alerts */}
      <section className="dashboard-section">
        <h3 className="section-title">Critical Alerts</h3>
        <div className="alerts-list">
          <Card className="alert-card danger-alert">
            <CardContent className="alert-content">
              <AlertCircle size={20} className="alert-icon" />
              <div className="alert-text">
                <strong>Appeal Deadline (3 Days)</strong> - Case WL/2023/KAB/00082
              </div>
              <button className="btn btn-sm btn-primary">File Appeal</button>
            </CardContent>
          </Card>
          
          <Card className="alert-card warning-alert">
            <CardContent className="alert-content">
              <AlertCircle size={20} className="alert-icon" />
              <div className="alert-text">
                <strong>Charge Sheet Overdue</strong> - Case WL/2024/KAB/00015 (Overdue by 5 days)
              </div>
              <button className="btn btn-sm btn-secondary">Notify IO</button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="dashboard-section">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-dot bg-success"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>Judgment Delivered</strong>
                    <span className="timeline-time">2 hours ago</span>
                  </div>
                  <p>Conviction secured in WL/2023/KAB/00102. 3 years RI, ₹50,000 fine.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot bg-info"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <strong>FIR Registered</strong>
                    <span className="timeline-time">5 hours ago</span>
                  </div>
                  <p>WL/2024/KAB/00124 (Illegal Cutting) assigned to IO Rajesh Kumar.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
