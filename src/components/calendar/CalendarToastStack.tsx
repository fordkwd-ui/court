import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Gavel, 
  ShieldAlert, 
  X, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { StatutoryDeadlineItem } from '../../utils/statutoryDeadlines';

interface CalendarToastStackProps {
  alerts: StatutoryDeadlineItem[];
  dismissedIds: string[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onJumpToDate: (dateStr: string) => void;
}

export const CalendarToastStack: React.FC<CalendarToastStackProps> = ({
  alerts,
  dismissedIds,
  onDismiss,
  onDismissAll,
  onJumpToDate
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const visibleAlerts = alerts.filter(a => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  // Render minimized floating pill when collapsed
  if (isCollapsed) {
    return (
      <div 
        className="calendar-toast-stack"
        style={{ pointerEvents: 'none' }}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="calendar-toast-collapsed-pill"
          style={{
            pointerEvents: 'auto',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid var(--color-danger)',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.625rem',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
          title="Click to expand Statutory Deadlines & Alerts"
        >
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-danger)', 
            display: 'inline-block',
            animation: 'pulse 1.5s infinite' 
          }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            Statutory Alerts ({visibleAlerts.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Expand <ChevronUp size={14} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="calendar-toast-stack"
      aria-live="polite"
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 0.5rem',
          pointerEvents: 'auto' 
        }}
      >
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          letterSpacing: '0.5px', 
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-danger)', 
            display: 'inline-block',
            animation: 'pulse 1.5s infinite' 
          }} />
          Statutory Deadlines & Alerts ({visibleAlerts.length})
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            style={{
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600
            }}
            title="Minimize alerts popup"
          >
            Collapse <ChevronDown size={14} />
          </button>
          {visibleAlerts.length > 1 && (
            <button
              type="button"
              onClick={onDismissAll}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Dismiss All
            </button>
          )}
        </div>
      </div>

      {visibleAlerts.slice(0, 3).map((item) => {
        const isCritical = item.priority === 'CRITICAL' || item.type === 'APPEAL_LIMITATION';
        const isInvestigation = item.type === 'INVESTIGATION_EXPIRY' || item.type === 'CUSTODY_REMAND_EXPIRY';

        const borderColor = isCritical 
          ? 'var(--color-danger)' 
          : isInvestigation 
            ? 'var(--color-warning)' 
            : 'var(--color-info)';

        const bgColor = isCritical 
          ? '#FEF2F2' 
          : isInvestigation 
            ? '#FFFBEB' 
            : '#EFF6FF';

        const textColor = isCritical 
          ? '#991B1B' 
          : isInvestigation 
            ? '#92400E' 
            : '#1E40AF';

        return (
          <div
            key={item.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              borderLeft: `4px solid ${borderColor}`,
              borderTop: '1px solid var(--color-border)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              transition: 'transform 0.2s ease, opacity 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: bgColor, 
                  color: textColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isCritical ? (
                    <ShieldAlert size={16} />
                  ) : isInvestigation ? (
                    <Clock size={16} />
                  ) : (
                    <Gavel size={16} />
                  )}
                </div>

                <div>
                  <span style={{ 
                    fontSize: '0.6875rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '4px',
                    backgroundColor: bgColor,
                    color: textColor,
                    letterSpacing: '0.3px'
                  }}>
                    {isCritical ? 'Limitation Alert' : isInvestigation ? 'Investigation Expiry' : 'Court Summons'}
                  </span>
                  <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => onDismiss(item.id)}
                title="Dismiss alert"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              <strong>{item.caseNumber}:</strong> {item.description}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '0.75rem', 
              backgroundColor: 'var(--color-bg-base)',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <span><strong>Deadline Date:</strong> {item.dueDate}</span>
              <span style={{ fontWeight: 600, color: textColor }}>{item.statutoryReference}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CalendarIcon size={14} />}
                onClick={() => onJumpToDate(item.dueDate)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                View on Calendar
              </Button>

              <Link to={item.actionUrl} style={{ textDecoration: 'none' }}>
                <Button
                  variant={isCritical ? 'danger' : 'primary'}
                  size="sm"
                  rightIcon={<ChevronRight size={14} />}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  {item.actionLabel.slice(0, 18)}
                </Button>
              </Link>
            </div>
          </div>
        );
      })}

      {visibleAlerts.length > 3 && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          pointerEvents: 'auto'
        }}>
          +{visibleAlerts.length - 3} additional statutory deadlines on this schedule.
        </div>
      )}
    </div>
  );
};
