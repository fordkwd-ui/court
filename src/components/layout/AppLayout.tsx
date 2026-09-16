import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Settings, 
  Bell, 
  Search, 
  User, 
  AlertCircle, 
  Clock, 
  Scale, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  Plus,
  ShieldAlert,
  Languages,
  Sun,
  Moon
} from 'lucide-react';
import './AppLayout.css';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCases } from '../../hooks/useCases';
import { usePreferences } from '../../context/PreferencesContext';
import { getStatutoryDeadlines } from '../../utils/statutoryDeadlines';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { OfflineIndicator } from '../common/OfflineIndicator';

export const AppLayout: React.FC = () => {
  const { cases, hearings, officers } = useCases();
  const { language, theme, toggleLanguage, toggleTheme, t } = usePreferences();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isDeadlinesModalOpen, setIsDeadlinesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeOfficerIndex, setActiveOfficerIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('van_nyay_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => {
        const next = !prev;
        localStorage.setItem('van_nyay_sidebar_collapsed', next.toString());
        return next;
      });
    }
  };

  const searchRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentOfficer = officers[activeOfficerIndex] || {
    name: 'Rajesh Kumar',
    role: 'IO',
    division: 'North Kabirdham',
    badgeNumber: 'CG-FOR-IO-1082'
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(target)) {
        setIsAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Compute dynamic statutory deadlines and alerts
  const allStatutoryDeadlines = useMemo(() => getStatutoryDeadlines(cases, hearings), [cases, hearings]);

  // Compute dynamic system alerts
  const alerts: Array<{ id: string; title: string; desc: string; time: string; type: 'danger' | 'warning' | 'info'; caseId: string }> = [];

  // 1. Appeal deadlines
  cases.filter(c => c.judgment && !c.judgment.appealFiled).forEach(c => {
    alerts.push({
      id: `alert-app-${c.id}`,
      title: 'Appeal Deadline Critical',
      desc: `Case ${c.caseNumber}: High Court revision limitation period ends soon`,
      time: 'Urgent Action Required',
      type: 'danger',
      caseId: c.id
    });
  });

  // 2. Overdue or pending charge sheets
  cases.filter(c => c.status === 'UNDER_INVESTIGATION').forEach(c => {
    alerts.push({
      id: `alert-cs-${c.id}`,
      title: 'Charge Sheet Compilation Due',
      desc: `Case ${c.caseNumber} in ${c.range}: 60-day statutory remand period`,
      time: 'Statutory deadline',
      type: 'warning',
      caseId: c.id
    });
  });

  // 3. Upcoming hearings
  hearings.filter(h => h.status === 'Scheduled').slice(0, 3).forEach(h => {
    alerts.push({
      id: `alert-hr-${h.id}`,
      title: `Hearing Scheduled (${h.hearingDate})`,
      desc: `${h.caseNumber} - ${h.stage} at ${h.court}`,
      time: h.time,
      type: 'info',
      caseId: h.caseId
    });
  });

  // Filtered search results
  const searchResults = searchQuery.trim() === '' ? [] : cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesNumber = c.caseNumber.toLowerCase().includes(q);
    const matchesTitle = c.title.toLowerCase().includes(q);
    const matchesOffence = c.offence.toLowerCase().includes(q);
    const matchesLocation = c.location.toLowerCase().includes(q);
    const matchesAccused = c.accused.some(a => a.name.toLowerCase().includes(q) || a.village.toLowerCase().includes(q));
    const matchesSections = c.sections.some(s => s.toLowerCase().includes(q));
    return matchesNumber || matchesTitle || matchesOffence || matchesLocation || matchesAccused || matchesSections;
  }).slice(0, 6);

  const handleSelectSearchResult = (caseId: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(`/cases/${caseId}`);
  };

  return (
    <div className="layout-container">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Left Menu Bar */}
      <aside 
        className={`sidebar glass ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation Menu"
      >
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="emblem-wrapper" title="Van Nyay - Forest Court CMS">
              <Scale size={22} />
            </div>
            {!isSidebarCollapsed && (
              <div className="logo-text">
                <h1>{t('app.title')}</h1>
                <span>{language === 'hi' ? 'वन अपराध प्रकरण प्रबंधन' : 'Court & Offence System'}</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle-btn"
            onClick={handleToggleSidebar}
            title={isMobileMenuOpen ? "Close menu" : (isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar")}
            aria-label={isMobileMenuOpen ? "Close menu" : (isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar")}
          >
            {isMobileMenuOpen ? (
              <X size={18} />
            ) : isSidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Quick Action: File New Offence (POR) */}
        <div className="sidebar-action-container">
          <Link 
            to="/cases?action=new" 
            className="sidebar-new-case-btn"
            title="File New Preliminary Offence Report (Form 1 / POR)"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Plus size={18} />
            {!isSidebarCollapsed && <span>{t('nav.newReport')}</span>}
          </Link>
        </div>

        <nav className="sidebar-nav">
          {!isSidebarCollapsed && <div className="nav-group-label">Core Operations</div>}

          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            title="Operational Dashboard"
          >
            <LayoutDashboard size={20} />
            {!isSidebarCollapsed && <span>{t('nav.dashboard')}</span>}
          </NavLink>

          <NavLink 
            to="/cases" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            title="Offence Cases & Dossiers"
          >
            <FileText size={20} />
            {!isSidebarCollapsed && <span>{t('nav.cases')}</span>}
            <Badge variant="default" className="nav-badge">{cases.length}</Badge>
          </NavLink>

          <NavLink 
            to="/calendar" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            title="Court Calendar & Hearings"
          >
            <Calendar size={20} />
            {!isSidebarCollapsed && <span>{t('nav.calendar')}</span>}
            {hearings.filter(h => h.status === 'Scheduled').length > 0 && (
              <Badge variant="info" className="nav-badge">
                {hearings.filter(h => h.status === 'Scheduled').length}
              </Badge>
            )}
          </NavLink>

          {!isSidebarCollapsed && <div className="nav-group-label">Legal & Oversight</div>}

          <NavLink 
            to="/calendar?filter=LIMITATION" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            }}
            title="Statutory Deadlines & Appeals"
          >
            <Clock size={20} />
            {!isSidebarCollapsed && <span>{t('nav.statutoryDeadlines')}</span>}
            {alerts.length > 0 && (
              <Badge variant="danger" className="nav-badge">
                {alerts.length}
              </Badge>
            )}
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            title="Settings, Officers & Division"
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span>{t('nav.settings')}</span>}
          </NavLink>
        </nav>

        {/* Division Jurisdiction Indicator */}
        {!isSidebarCollapsed ? (
          <div className="sidebar-jurisdiction-box">
            <div className="jurisdiction-header">
              <ShieldCheck size={14} />
              <span>JURISDICTION</span>
            </div>
            <span className="jurisdiction-title">
              North Kabirdham Division
            </span>
            <span className="jurisdiction-circle">
              Bilaspur Forest Circle, CG
            </span>
            <div className="jurisdiction-badge-status">
              <span className="status-indicator-dot" />
              <span>{cases.length} Active Statutory Files</span>
            </div>
          </div>
        ) : (
          <div className="sidebar-jurisdiction-collapsed" title="North Kabirdham Division • Bilaspur Circle">
            <ShieldCheck size={18} />
          </div>
        )}

        {/* User Profile in Sidebar */}
        <div className="sidebar-footer">
          <div 
            className="user-profile" 
            onClick={() => setIsProfileOpen(!isProfileOpen)} 
            style={{ cursor: 'pointer', width: '100%' }}
            title={`Active Officer: ${currentOfficer.name} (${currentOfficer.role}) - Click to Switch`}
          >
            <div className="avatar">{currentOfficer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
            {!isSidebarCollapsed && (
              <div className="user-info">
                <span className="user-name">{currentOfficer.name}</span>
                <span className="user-role">{currentOfficer.role} • {currentOfficer.division}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-nav glass">
          <div className="top-nav-left">
            <button 
              className="hamburger-btn"
              onClick={handleToggleSidebar}
              title={isSidebarCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="mobile-brand-title">
              <div className="mobile-emblem">
                <Scale size={18} />
              </div>
              <span className="mobile-app-name">Van Nyay</span>
            </div>
          </div>

          <div className="search-container" ref={searchRef}>
            <Input 
              placeholder={t('nav.searchPlaceholder')} 
              leftIcon={<Search size={18} />}
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}

            {/* Live Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
                zIndex: 200,
                maxHeight: '380px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                  Matching Forest Offence Cases ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    No case records found matching "{searchQuery}".
                  </div>
                ) : (
                  searchResults.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => handleSelectSearchResult(c.id)}
                      style={{ 
                        padding: '0.75rem 1rem', 
                        borderBottom: '1px solid var(--color-border)', 
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      className="search-result-row"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--color-primary-800)', fontSize: '0.875rem' }}>{c.caseNumber}</strong>
                        <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)' }}>
                          {c.offence}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {c.title}
                      </p>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.75rem' }}>
                        <span>📍 {c.beat}</span>
                        {c.accused.length > 0 && <span>👤 {c.accused[0].name}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="top-actions">
            {/* PWA Install Button for Field Rangers & Officers */}
            <PWAInstallButton />

            {/* Quick Language Toggle Button (Hindi / English) */}
            <button
              type="button"
              className="icon-btn"
              onClick={toggleLanguage}
              title={language === 'en' ? 'हिंदी में बदलें (Switch to Hindi)' : 'Switch to English (अंग्रेजी में बदलें)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary-700)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Languages size={16} />
              <span>{language === 'en' ? 'हि' : 'EN'}</span>
            </button>

            {/* Quick Theme Toggle Button (Light / Dark Mode) */}
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode (Midnight Emerald)' : 'Switch to Light Mode (Forest Clean)'}
              style={{
                color: theme === 'dark' ? '#fbbf24' : 'var(--color-text-secondary)'
              }}
            >
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            {/* Alerts Center Dropdown */}
            <div style={{ position: 'relative' }} ref={alertsRef}>
              <button 
                className="icon-btn" 
                onClick={() => setIsAlertsOpen(!isAlertsOpen)} 
                title="System Legal Alerts & Statutory Deadlines"
                style={{ position: 'relative' }}
              >
                <Bell size={20} />
                {alerts.length > 0 && <span className="notification-dot"></span>}
              </button>
              
              {isAlertsOpen && (
                <>
                  <div 
                    className="popover-backdrop" 
                    onClick={() => setIsAlertsOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 140, backgroundColor: 'transparent' }} 
                  />
                  <div 
                    className="alerts-dropdown glass alerts-popover-mobile" 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: '100%', right: '0', width: '360px', 
                      backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', 
                      boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)', 
                      marginTop: '0.5rem', zIndex: 150, overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Legal Alerts Center</h3>
                        <Badge variant="danger">{alerts.length} Active</Badge>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsAlertsOpen(false)}
                        title="Close popover"
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '340px', overflowY: 'auto' }}>
                      {alerts.map(alert => (
                        <Link 
                          to={`/cases/${alert.caseId}`} 
                          key={alert.id} 
                          onClick={() => setIsAlertsOpen(false)}
                          className="alert-item" 
                          style={{ 
                            padding: '0.875rem 1rem', 
                            borderBottom: '1px solid var(--color-border)', 
                            display: 'flex', 
                            gap: '0.75rem', 
                            textDecoration: 'none', 
                            color: 'inherit' 
                          }}
                        >
                          <div style={{ color: `var(--color-${alert.type})`, marginTop: '0.125rem' }}>
                            <AlertCircle size={18} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.825rem' }}>{alert.title}</p>
                            <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{alert.desc}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} /> {alert.time}
                            </p>
                          </div>
                          <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center' }} />
                        </Link>
                      ))}
                    </div>
                    <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-base)', borderTop: '1px solid var(--color-border)' }}>
                      <Link 
                        to="/calendar?filter=LIMITATION" 
                        onClick={() => setIsAlertsOpen(false)} 
                        style={{ fontSize: '0.8125rem', color: 'var(--color-primary-700)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Clock size={14} /> Court Deadlines →
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAlertsOpen(false);
                          setIsDeadlinesModalOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Full Dossier
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Officer Switcher / Quick Profile Popover */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button 
                className="icon-btn" 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                title="Active Forest Officer Account"
              >
                <User size={20} />
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="popover-backdrop" 
                    onClick={() => setIsProfileOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 140, backgroundColor: 'transparent' }} 
                  />
                  <div 
                    className="profile-popover-mobile" 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: '100%', right: 0, width: '280px',
                      backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)',
                      marginTop: '0.5rem', zIndex: 150, overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Officer</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{currentOfficer.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 500 }}>{currentOfficer.role} • {currentOfficer.badgeNumber}</p>
                    </div>
                    <div style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Switch Operating Role:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {officers.map((off, idx) => (
                          <button
                            key={off.id}
                            onClick={() => {
                              setActiveOfficerIndex(idx);
                              setIsProfileOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: idx === activeOfficerIndex ? 'var(--color-primary-50)' : 'transparent',
                              border: idx === activeOfficerIndex ? '1px solid var(--color-primary-100)' : '1px solid transparent',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              textAlign: 'left'
                            }}
                          >
                            <span>{off.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{off.role}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 600, textDecoration: 'none' }}>
                        Division & E-Sign Settings →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
          <NavLink 
            to="/" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/cases" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="mobile-nav-icon-wrap">
              <FileText size={20} />
              {cases.length > 0 && (
                <span className="mobile-nav-badge">{cases.length}</span>
              )}
            </div>
            <span>Cases</span>
          </NavLink>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="mobile-nav-icon-wrap">
              <Calendar size={20} />
              {hearings.filter(h => h.status === 'Scheduled').length > 0 && (
                <span className="mobile-nav-badge">
                  {hearings.filter(h => h.status === 'Scheduled').length}
                </span>
              )}
            </div>
            <span>Calendar</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Full Statutory Deadlines & Legal Limitation Dossier Modal */}
        <Modal
          isOpen={isDeadlinesModalOpen}
          onClose={() => setIsDeadlinesModalOpen(false)}
          title="Statutory Deadlines & Limitation Register"
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ 
              backgroundColor: 'var(--color-bg-base)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  Active Statutory Compliance Monitors
                </p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Mandatory filing limits under Criminal Procedure Code (CrPC) and Forest Acts
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Badge variant="danger">{allStatutoryDeadlines.filter(d => d.priority === 'CRITICAL').length} Critical Limitation</Badge>
                <Badge variant="warning">{allStatutoryDeadlines.filter(d => d.type === 'INVESTIGATION_EXPIRY' || d.type === 'CUSTODY_REMAND_EXPIRY').length} Remand Expiries</Badge>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxHeight: '55vh', overflowY: 'auto' }}>
              {allStatutoryDeadlines.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No pending statutory deadlines or limitation expirations recorded.
                </div>
              ) : (
                allStatutoryDeadlines.map(item => {
                  const isCritical = item.priority === 'CRITICAL' || item.type === 'APPEAL_LIMITATION';
                  const isInv = item.type === 'INVESTIGATION_EXPIRY' || item.type === 'CUSTODY_REMAND_EXPIRY';

                  return (
                    <div 
                      key={item.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isCritical ? '1.5px solid #FCA5A5' : '1px solid var(--color-border)',
                        backgroundColor: isCritical ? '#FEF2F2' : isInv ? '#FFFBEB' : 'var(--color-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            width: '28px', height: '28px', borderRadius: '50%', 
                            backgroundColor: isCritical ? '#FEE2E2' : '#FEF3C7',
                            color: isCritical ? '#991B1B' : '#92400E',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {isCritical ? <ShieldAlert size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: isCritical ? '#991B1B' : '#92400E' }}>
                              {isCritical ? 'Appeal Limitation' : 'Investigation Expiry'}
                            </span>
                            <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        <Badge variant={isCritical ? 'danger' : 'warning'}>
                          Due: {item.dueDate}
                        </Badge>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        <strong>Case {item.caseNumber}:</strong> {item.description}
                      </p>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        fontSize: '0.75rem', 
                        padding: '0.4rem 0.6rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-secondary)',
                        marginTop: '0.25rem'
                      }}>
                        <span><strong>Statutory Section:</strong> {item.statutoryReference}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link 
                            to={`/calendar?filter=LIMITATION`}
                            onClick={() => setIsDeadlinesModalOpen(false)}
                            style={{ textDecoration: 'none' }}
                          >
                            <Button variant="outline" size="sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              View on Calendar
                            </Button>
                          </Link>
                          <Link 
                            to={item.actionUrl}
                            onClick={() => setIsDeadlinesModalOpen(false)}
                            style={{ textDecoration: 'none' }}
                          >
                            <Button variant={isCritical ? 'danger' : 'primary'} size="sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              Open Case
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <Link 
                to="/calendar?filter=LIMITATION" 
                onClick={() => setIsDeadlinesModalOpen(false)}
                style={{ fontSize: '0.85rem', color: 'var(--color-primary-700)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Calendar size={16} /> Open Full Statutory Calendar Grid →
              </Link>
              <Button variant="secondary" onClick={() => setIsDeadlinesModalOpen(false)}>
                Close Register
              </Button>
            </div>
          </div>
        </Modal>

        {/* Real-time Field Connectivity Offline Status Banner */}
        <OfflineIndicator />
      </div>
    </div>
  );
};
