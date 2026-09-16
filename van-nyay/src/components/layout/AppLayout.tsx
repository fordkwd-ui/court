import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, Settings, Bell, Search, User, AlertCircle, Clock } from 'lucide-react';
import './AppLayout.css';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export const AppLayout: React.FC = () => {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const mockAlerts = [
    { id: 1, title: 'Charge Sheet Overdue', desc: 'Case WL/2024/KAB/00118', time: '2 hours ago', type: 'danger' },
    { id: 2, title: 'Hearing Tomorrow', desc: 'Case WL/2023/KAB/00082 at Court No. 1', time: '5 hours ago', type: 'warning' },
    { id: 3, title: 'Appeal Deadline', desc: 'Case WL/2023/KAB/00102 expires in 3 days', time: '1 day ago', type: 'info' }
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🌿</span>
            <div className="logo-text">
              <h1>Van Nyay</h1>
              <span>वन न्याय</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/cases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Cases</span>
            <Badge variant="danger" className="nav-badge">3</Badge>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Calendar</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">IO</div>
            <div className="user-info">
              <span className="user-name">Rajesh Kumar</span>
              <span className="user-role">Investigating Officer</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-nav glass">
          <div className="search-container">
            <Input 
              placeholder="Search case number, FIR, or accused..." 
              leftIcon={<Search size={18} />}
              className="search-input"
            />
          </div>
          <div className="top-actions">
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setIsAlertsOpen(!isAlertsOpen)}>
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>
              
              {isAlertsOpen && (
                <div className="alerts-dropdown glass" style={{
                  position: 'absolute', top: '100%', right: '0', width: '320px', 
                  backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', 
                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', 
                  marginTop: '0.5rem', zIndex: 100, overflow: 'hidden'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Alerts Center</h3>
                    <Badge variant="danger">3 New</Badge>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {mockAlerts.map(alert => (
                      <Link to="/cases" key={alert.id} className="alert-item" style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', textDecoration: 'none', color: 'inherit', transition: 'background-color 0.2s' }}>
                        <div style={{ color: `var(--color-${alert.type})`, marginTop: '0.125rem' }}>
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.875rem' }}>{alert.title}</p>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{alert.desc}</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {alert.time}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: 'var(--color-bg-base)' }}>
                    <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: 500, textDecoration: 'none' }}>View All Alerts</a>
                  </div>
                </div>
              )}
            </div>
            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
