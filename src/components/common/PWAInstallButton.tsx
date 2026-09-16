import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { usePreferences } from '../../context/PreferencesContext';
import { Button } from '../ui/Button';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = usePreferences();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone installed app, hide install trigger
  if (isInstalled) {
    return null;
  }

  // Desktop / Android / Chrome install flow
  if (isInstallable) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={install}
        title={language === 'hi' ? 'वन न्याय ऐप इंस्टॉल करें' : 'Install Van Nyay App for Field Access'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8125rem',
          borderColor: 'var(--color-primary-600)',
          color: 'var(--color-primary-700)'
        }}
      >
        <Download size={14} />
        <span>{language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
      </Button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowIOSGuide(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8125rem'
          }}
        >
          <Download size={14} />
          <span>{language === 'hi' ? 'iOS पर इंस्टॉल' : 'Install on iOS'}</span>
        </Button>

        {showIOSGuide && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            padding: '1.5rem',
            backdropFilter: 'blur(3px)'
          }}>
            <div style={{
              maxWidth: '380px',
              width: '100%',
              backgroundColor: 'var(--color-surface, #1e293b)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.5rem',
              color: 'var(--color-text, #f8fafc)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  {language === 'hi' ? 'iPhone / iPad पर इंस्टॉल करें' : 'Install on iPhone / iPad'}
                </h4>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ padding: '0.3rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Share2 size={16} />
                  </div>
                  <div>
                    {language === 'hi' ? '1. सफारी टूलबार में' : '1. In the Safari bottom bar, tap the'}{' '}
                    <strong>{language === 'hi' ? 'शेयर (Share)' : 'Share'}</strong>{' '}
                    {language === 'hi' ? 'बटन दबाएं।' : 'button.'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ padding: '0.3rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <PlusSquare size={16} />
                  </div>
                  <div>
                    {language === 'hi' ? '2. नीचे स्क्रॉल करें और' : '2. Scroll down and choose'}{' '}
                    <strong>{language === 'hi' ? 'होम स्क्रीन में जोड़ें (Add to Home Screen)' : 'Add to Home Screen'}</strong>
                    {language === 'hi' ? ' चुनें।' : '.'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <Button variant="primary" onClick={() => setShowIOSGuide(false)} style={{ width: '100%' }}>
                  {language === 'hi' ? 'समझ गया' : 'Got it'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
