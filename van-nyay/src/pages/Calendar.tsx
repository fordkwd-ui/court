import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Plus, MapPin, Scale } from 'lucide-react';
import './Calendar.css';

// Mock data for hearings
const mockHearings = [
  { id: 1, caseNumber: 'WL/2024/KAB/00124', court: 'Court No. 1, Kabirdham', judge: 'Hon. Justice Verma', purpose: 'Framing Charges', priority: 'MEDIUM', time: '10:30 AM', dayOffset: 0 },
  { id: 2, caseNumber: 'WL/2023/KAB/00082', court: 'Court No. 3, Raipur', judge: 'Hon. Justice Singh', purpose: 'Judgment', priority: 'CRITICAL', time: '02:00 PM', dayOffset: 0 },
  { id: 3, caseNumber: 'WL/2024/KAB/00118', court: 'Court No. 2, Kabirdham', judge: 'Hon. Justice Sharma', purpose: 'Prosecution Evidence', priority: 'HIGH', time: '11:15 AM', dayOffset: 2 },
  { id: 4, caseNumber: 'WL/2024/KAB/00105', court: 'Court No. 1, Kabirdham', judge: 'Hon. Justice Verma', purpose: 'Arguments', priority: 'MEDIUM', time: '03:30 PM', dayOffset: 4 },
];

export const Calendar: React.FC = () => {
  // A simplistic calendar rendering for the MVP
  const today = new Date();
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i); // Assuming Monday start

  return (
    <div className="calendar-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Court Calendar</h1>
          <p className="page-subtitle">Track upcoming hearings across all jurisdictions.</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" leftIcon={<ChevronLeft size={18} />}>Prev</Button>
          <span className="current-month-label">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <Button variant="outline" rightIcon={<ChevronRight size={18} />}>Next</Button>
          <Button variant="primary" leftIcon={<Plus size={18} />} className="ml-4">Add Hearing</Button>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Main Calendar Grid */}
        <div className="calendar-main">
          <Card className="calendar-card">
            <div className="calendar-header-days">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="calendar-day-label">{day}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="calendar-cell empty"></div>
              ))}
              {daysArray.map((day) => {
                const isToday = day === today.getDate();
                const dayHearings = mockHearings.filter(h => h.dayOffset === (day - today.getDate()));

                return (
                  <div key={day} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                    <div className="calendar-cell-header">
                      <span className="day-number">{day}</span>
                    </div>
                    <div className="calendar-events">
                      {dayHearings.map(h => (
                        <div key={h.id} className={`calendar-event priority-${h.priority.toLowerCase()}`}>
                          {h.caseNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar - Upcoming List */}
        <div className="calendar-sidebar">
          <Card className="upcoming-card">
            <CardHeader>
              <CardTitle>Upcoming Hearings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="upcoming-list">
                {mockHearings.map(hearing => (
                  <div key={hearing.id} className="upcoming-item">
                    <div className="upcoming-time-block">
                      <span className="upcoming-date">{today.getDate() + hearing.dayOffset} {today.toLocaleString('default', { month: 'short' })}</span>
                      <span className="upcoming-time">{hearing.time}</span>
                    </div>
                    <div className="upcoming-details">
                      <h4 className="upcoming-case">{hearing.caseNumber}</h4>
                      <p className="upcoming-purpose"><Scale size={14} /> {hearing.purpose}</p>
                      <p className="upcoming-court"><MapPin size={14} /> {hearing.court}</p>
                      {hearing.priority === 'CRITICAL' && <Badge variant="danger" className="mt-1">Critical</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
