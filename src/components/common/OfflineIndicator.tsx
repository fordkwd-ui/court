import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { language } = usePreferences();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '1.25rem',
      zIndex: 9990,
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.55rem 0.95rem',
      backgroundColor: '#d97706',
      color: '#ffffff',
      fontSize: '0.8125rem',
      fontWeight: 500,
      borderRadius: 'var(--radius-md, 8px)',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.2)',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <WifiOff size={16} />
      <span>
        {language === 'hi'
          ? 'ऑफलाइन मोड — स्थानीय केस डेटा सुरक्षित उपलब्ध है।'
          : 'Offline Field Mode — Local case registry is active.'}
      </span>
    </div>
  );
};
