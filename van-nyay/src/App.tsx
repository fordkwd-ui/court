import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { CaseList } from './pages/CaseList';
import { CaseDetail } from './pages/CaseDetail';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
