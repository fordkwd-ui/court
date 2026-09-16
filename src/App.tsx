import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CaseList = lazy(() => import('./pages/CaseList').then(m => ({ default: m.CaseList })));
const CaseDetail = lazy(() => import('./pages/CaseDetail').then(m => ({ default: m.CaseDetail })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const RouteLoading = () => (
  <div style={{
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.85rem'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      border: '3px solid rgba(22, 101, 52, 0.2)',
      borderTopColor: '#166534',
      animation: 'spin 0.75s linear infinite'
    }} />
    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)', fontWeight: 500 }}>
      Loading registry...
    </span>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="cases" element={<CaseList />} />
                <Route path="cases/:id" element={<CaseDetail />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
