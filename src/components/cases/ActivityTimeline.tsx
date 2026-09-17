import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  ArrowUpDown, 
  Plus, 
  CheckCircle2, 
  Copy, 
  FileEdit, 
  RefreshCw, 
  ClipboardList, 
  Paperclip, 
  Calendar, 
  FileCheck, 
  Gavel, 
  AlertTriangle, 
  MessageSquare, 
  FilePlus, 
  User, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import type { ForestCase, CaseActivity, ActivityType } from '../../types/case';

interface ActivityTimelineProps {
  currentCase: ForestCase;
  onAddActivity?: (activity: Omit<CaseActivity, 'id' | 'caseId'>) => void;
  onEditCase?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  currentCase,
  onAddActivity,
  onEditCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // New activity form state
  const [newType, setNewType] = useState<ActivityType>('OFFICER_NOTE');
  const [newTitle, setNewTitle] = useState('');
  const [newActor, setNewActor] = useState(currentCase.io || 'Investigating Officer');
  const [newDescription, setNewDescription] = useState('');

  const activities: CaseActivity[] = useMemo(() => {
    return currentCase.activities || [];
  }, [currentCase.activities]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter(act => {
        // Filter by category
        if (filterType === 'STATUS' && act.type !== 'STATUS_CHANGE') return false;
        if (filterType === 'EDITS' && act.type !== 'CASE_EDITED' && act.type !== 'CASE_CREATED') return false;
        if (filterType === 'INVESTIGATION' && act.type !== 'INVESTIGATION_LOG' && act.type !== 'EVIDENCE_ADDED') return false;
        if (filterType === 'COURT' && act.type !== 'HEARING_SCHEDULED' && act.type !== 'CHARGESHEET_FILED' && act.type !== 'JUDGMENT_RECORDED' && act.type !== 'APPEAL_FILED') return false;
        if (filterType === 'NOTES' && act.type !== 'OFFICER_NOTE') return false;

        // Search query
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchTitle = act.title.toLowerCase().includes(query);
          const matchDesc = act.description.toLowerCase().includes(query);
          const matchActor = act.actor.toLowerCase().includes(query);
          const matchType = act.type.toLowerCase().includes(query);
          return matchTitle || matchDesc || matchActor || matchType;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [activities, filterType, searchQuery, sortOrder]);

  // Counts for quick tabs
  const counts = useMemo(() => {
    return {
      all: activities.length,
      status: activities.filter(a => a.type === 'STATUS_CHANGE').length,
      edits: activities.filter(a => a.type === 'CASE_EDITED' || a.type === 'CASE_CREATED').length,
      investigation: activities.filter(a => a.type === 'INVESTIGATION_LOG' || a.type === 'EVIDENCE_ADDED').length,
      court: activities.filter(a => a.type === 'HEARING_SCHEDULED' || a.type === 'CHARGESHEET_FILED' || a.type === 'JUDGMENT_RECORDED' || a.type === 'APPEAL_FILED').length,
      notes: activities.filter(a => a.type === 'OFFICER_NOTE').length
    };
  }, [activities]);

  const handleCopyLog = () => {
    const lines = filteredActivities.map(act => {
      return `[${act.timestamp}] [${act.type}] ${act.title} - Officer: ${act.actor}\nDetails: ${act.description}`;
    });
    const header = `VAN NYAY AUDIT LOG: Case ${currentCase.caseNumber} (${currentCase.title})\nExported on ${new Date().toLocaleString()}\n------------------------------------------------------------\n`;
    navigator.clipboard.writeText(header + lines.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !onAddActivity) return;

    onAddActivity({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: newType,
      title: newTitle.trim(),
      description: newDescription.trim(),
      actor: newActor.trim() || 'Officer'
    });

    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  const getActivityConfig = (type: ActivityType) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return {
          icon: RefreshCw,
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          badgeVariant: 'warning' as const,
          label: 'Status Transition'
        };
      case 'CASE_CREATED':
        return {
          icon: FilePlus,
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          badgeVariant: 'success' as const,
          label: 'POR Registration'
        };
      case 'CASE_EDITED':
        return {
          icon: FileEdit,
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700',
          badgeVariant: 'info' as const,
          label: 'Case Edit'
        };
      case 'INVESTIGATION_LOG':
        return {
          icon: ClipboardList,
          bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-300 dark:border-teal-700',
          badgeVariant: 'default' as const,
          label: 'Investigation Diary'
        };
      case 'EVIDENCE_ADDED':
        return {
          icon: Paperclip,
          bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
          badgeVariant: 'info' as const,
          label: 'Evidence Secured'
        };
      case 'CHARGESHEET_FILED':
        return {
          icon: FileCheck,
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          badgeVariant: 'success' as const,
          label: 'Charge Sheet Filed'
        };
      case 'HEARING_SCHEDULED':
        return {
          icon: Calendar,
          bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300 dark:border-orange-700',
          badgeVariant: 'warning' as const,
          label: 'Court Hearing'
        };
      case 'JUDGMENT_RECORDED':
        return {
          icon: Gavel,
          bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700',
          badgeVariant: 'default' as const,
          label: 'Court Judgment'
        };
      case 'APPEAL_FILED':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-700',
          badgeVariant: 'danger' as const,
          label: 'Appellate Revision'
        };
      case 'OFFICER_NOTE':
      default:
        return {
          icon: MessageSquare,
          bg: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
          badgeVariant: 'default' as const,
          label: 'Officer Note'
        };
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6" id="activity-timeline-container">
      {/* Top Header & Action Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  Case Activity Timeline
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Chronological log of updates, status changes, and user edits for {currentCase.caseNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onEditCase && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEditCase}
                className="text-xs"
                id="btn-timeline-edit-case"
              >
                <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                Edit Case
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLog}
              className="text-xs"
              id="btn-timeline-copy-log"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Copied Log
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Log
                </>
              )}
            </Button>

            {onAddActivity && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs"
                id="btn-timeline-add-activity"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Record Note
              </Button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === 'ALL'
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilterType('STATUS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === 'STATUS'
                  ? 'bg-amber-700 text-white dark:bg-amber-600'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              Status Changes ({counts.status})
            </button>
            <button
              onClick={() => setFilterType('EDITS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === 'EDITS'
                  ? 'bg-blue-700 text-white dark:bg-blue-600'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              Edits & Creation ({counts.edits})
            </button>
            <button
              onClick={() => setFilterType('INVESTIGATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === 'INVESTIGATION'
                  ? 'bg-teal-700 text-white dark:bg-teal-600'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              Investigation & Evidence ({counts.investigation})
            </button>
            <button
              onClick={() => setFilterType('COURT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === 'COURT'
                  ? 'bg-purple-700 text-white dark:bg-purple-600'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              Court & Trials ({counts.court})
            </button>
            <button
              onClick={() => setFilterType('NOTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === 'NOTES'
                  ? 'bg-stone-800 text-white dark:bg-stone-700'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              Officer Notes ({counts.notes})
            </button>
          </div>

          {/* Search and Sort controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="input-timeline-search"
              />
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-700 dark:text-stone-300 font-medium transition-colors"
              title={`Sort: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
              id="btn-timeline-sort"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-12 text-center">
          <History className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-stone-900 dark:text-stone-100">
            No Activities Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No activity matching "${searchQuery}". Try clearing search.`
              : 'No activities recorded under the selected filter.'}
          </p>
          {(searchQuery || filterType !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterType('ALL');
              }}
              className="mt-4 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
          {filteredActivities.map((act, idx) => {
            const config = getActivityConfig(act.type);
            const Icon = config.icon;

            return (
              <div 
                key={act.id || idx}
                id={`timeline-item-${act.id || idx}`}
                className="relative group"
              >
                {/* Timeline node icon */}
                <div 
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${config.bg}`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>

                {/* Activity Card */}
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={config.badgeVariant} className="text-[11px] font-medium py-0.5">
                        {config.label}
                      </Badge>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {act.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(act.timestamp)}</span>
                    </div>
                  </div>

                  {/* Status Transition Badges if applicable */}
                  {act.previousValue && act.newValue && (
                    <div className="my-2.5 flex items-center gap-2 flex-wrap p-2 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200/80 dark:border-stone-700/80 text-xs">
                      <span className="text-stone-500 dark:text-stone-400 font-medium">Transition:</span>
                      <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono text-[11px]">
                        {act.previousValue}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[11px] font-semibold">
                        {act.newValue}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Footer Actor Pill */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Recorded by: <strong className="text-stone-700 dark:text-stone-300 font-medium">{act.actor}</strong></span>
                    </div>
                    <span className="font-mono text-[10px] text-stone-400">
                      ID: {act.id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record New Activity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Case Activity Note"
        size="md"
      >
        <form onSubmit={handleSubmitNewActivity} className="space-y-4" id="form-add-activity">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Activity Category
            </label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as ActivityType)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="select-activity-type"
            >
              <option value="OFFICER_NOTE">Officer Note / Remark</option>
              <option value="INVESTIGATION_LOG">Investigation Update</option>
              <option value="CASE_EDITED">Case Detail Modification</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Witness summons served, Site inspection remark"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="input-activity-title"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Recorded By (Officer / User Name) *
            </label>
            <input
              type="text"
              required
              placeholder="Officer Name"
              value={newActor}
              onChange={e => setNewActor(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="input-activity-actor"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Detailed Description / Remarks *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Enter comprehensive notes regarding this case update..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="textarea-activity-description"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              id="btn-submit-activity"
            >
              Save Activity Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
