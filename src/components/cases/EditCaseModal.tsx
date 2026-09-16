import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ForestCase, CaseStatus, PriorityLevel, OffenceType } from '../../types/case';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: ForestCase;
  onSave: (updates: Partial<ForestCase>, actor: string) => void;
}

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  currentCase,
  onSave
}) => {
  const [title, setTitle] = useState(currentCase.title);
  const [status, setStatus] = useState<CaseStatus>(currentCase.status);
  const [priority, setPriority] = useState<PriorityLevel>(currentCase.priority);
  const [offence, setOffence] = useState<OffenceType>(currentCase.offence);
  const [io, setIo] = useState(currentCase.io);
  const [range, setRange] = useState(currentCase.range);
  const [beat, setBeat] = useState(currentCase.beat);
  const [compartment, setCompartment] = useState(currentCase.compartment || '');
  const [description, setDescription] = useState(currentCase.description || '');
  const [actor, setActor] = useState(currentCase.io || 'Investigating Officer');

  useEffect(() => {
    if (isOpen) {
      setTitle(currentCase.title);
      setStatus(currentCase.status);
      setPriority(currentCase.priority);
      setOffence(currentCase.offence);
      setIo(currentCase.io);
      setRange(currentCase.range);
      setBeat(currentCase.beat);
      setCompartment(currentCase.compartment || '');
      setDescription(currentCase.description || '');
      setActor(currentCase.io || 'Investigating Officer');
    }
  }, [isOpen, currentCase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        title: title.trim(),
        status,
        priority,
        offence,
        io: io.trim(),
        range: range.trim(),
        beat: beat.trim(),
        compartment: compartment.trim(),
        description: description.trim()
      },
      actor.trim() || 'Investigating Officer'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Case ${currentCase.caseNumber}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" id="form-edit-case">
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Case Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            id="input-edit-title"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Case Status *
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CaseStatus)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="select-edit-status"
            >
              <option value="FIR_REGISTERED">FIR / POR Registered</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="CHARGESHEET_FILED">Charge Sheet Filed</option>
              <option value="TRIAL">Trial / Court Hearings</option>
              <option value="JUDGMENT_DELIVERED">Judgment Delivered</option>
              <option value="APPEAL_FILED">Appeal / Revision Filed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Priority Level *
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as PriorityLevel)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="select-edit-priority"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Offence Type *
            </label>
            <select
              value={offence}
              onChange={e => setOffence(e.target.value as OffenceType)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="select-edit-offence"
            >
              <option value="Illegal Cutting">Illegal Cutting</option>
              <option value="Wildlife Poaching">Wildlife Poaching</option>
              <option value="Encroachment">Encroachment</option>
              <option value="Illegal Transit">Illegal Transit</option>
              <option value="Mining & Quarrying">Mining & Quarrying</option>
              <option value="Forest Fire">Forest Fire</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Investigating Officer (IO) *
            </label>
            <input
              type="text"
              required
              value={io}
              onChange={e => setIo(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="input-edit-io"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Range *
            </label>
            <input
              type="text"
              required
              value={range}
              onChange={e => setRange(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="input-edit-range"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Beat *
            </label>
            <input
              type="text"
              required
              value={beat}
              onChange={e => setBeat(e.target.value)}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="input-edit-beat"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Compartment
            </label>
            <input
              type="text"
              value={compartment}
              onChange={e => setCompartment(e.target.value)}
              placeholder="e.g. Comp. No. 104-RF"
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="input-edit-compartment"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Offence Narrative / Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            id="textarea-edit-description"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Editor / Officer Making Changes
          </label>
          <input
            type="text"
            required
            value={actor}
            onChange={e => setActor(e.target.value)}
            className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            id="input-edit-actor"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            id="btn-save-case-edits"
          >
            Save Changes & Log Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
