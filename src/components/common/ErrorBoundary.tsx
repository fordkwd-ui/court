import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Van Nyay Uncaught Application Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('van_nyay_cases_v2');
      localStorage.removeItem('van_nyay_cases');
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: 'var(--color-background, #0f172a)',
          color: 'var(--color-text, #f8fafc)',
          fontFamily: 'inherit'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: 'var(--color-surface, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--color-border, #334155)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <AlertOctagon size={34} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              Unexpected Application Error
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #94a3b8)', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
              Van Nyay encountered an unhandled exception during execution. Your local case registry is safe. You can reload the system or return to the main dashboard.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <Button variant="primary" onClick={this.handleReload} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={15} />
                <span>Reload App</span>
              </Button>
              <Button variant="outline" onClick={this.handleGoHome} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Home size={15} />
                <span>Dashboard</span>
              </Button>
              <Button variant="ghost" onClick={this.handleResetStorage} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
                <RotateCcw size={15} />
                <span>Safety Reset</span>
              </Button>
            </div>

            {this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.75rem',
                color: '#cbd5e1'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, outline: 'none' }}>
                  Technical diagnostics
                </summary>
                <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto' }}>
                  {this.state.error.toString()}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
