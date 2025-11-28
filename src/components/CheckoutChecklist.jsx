import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Circle, X } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { id: 'empty_trash', label: 'Tøm skrald' },
  { id: 'lock_doors', label: 'Lås døre' },
  { id: 'turn_on_alarm', label: 'Tænd alarm' },
  { id: 'close_windows', label: 'Luk vinduer' },
  { id: 'turn_off_heat', label: 'Sluk varme' },
  { id: 'clean_kitchen', label: 'Rengør køkken' },
];

export function CheckoutChecklist({ booking, onClose, onUpdate }) {
  const [checklist, setChecklist] = useState(booking.checkout_checklist || {});
  const [saving, setSaving] = useState(false);

  const handleToggle = async (itemId) => {
    const newChecklist = {
      ...checklist,
      [itemId]: !checklist[itemId]
    };
    
    setChecklist(newChecklist);
    
    // Auto-save to database
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ checkout_checklist: newChecklist })
        .eq('id', booking.id);
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error('Error saving checklist:', err);
    } finally {
      setSaving(false);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const isComplete = completedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-fg-default bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-canvas-default text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-border-default">
          <div className="bg-canvas-default px-4 pb-4 pt-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold leading-6 text-fg-default">
                  Tjekliste ved afrejse
                </h3>
                <p className="mt-1 text-sm text-fg-muted">
                  {booking.guest_name} • {new Date(booking.start_date).toLocaleDateString('da-DK')} - {new Date(booking.end_date).toLocaleDateString('da-DK')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-fg-muted hover:text-fg-default"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-fg-muted">Fremskridt</span>
                <span className={`font-medium ${isComplete ? 'text-success-fg' : 'text-fg-default'}`}>
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="w-full bg-canvas-subtle rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${isComplete ? 'bg-success-fg' : 'bg-accent-fg'}`}
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className="w-full flex items-center space-x-3 p-3 rounded-md border border-border-default hover:bg-canvas-subtle transition-colors text-left"
                >
                  {checklist[item.id] ? (
                    <CheckCircle2 className="h-5 w-5 text-success-fg flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-fg-muted flex-shrink-0" />
                  )}
                  <span className={`text-sm ${checklist[item.id] ? 'text-fg-muted line-through' : 'text-fg-default'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {isComplete && (
              <div className="mt-4 p-3 bg-success-fg/10 border border-success-fg/20 rounded-md">
                <p className="text-sm text-success-fg font-medium">
                  ✓ Alle opgaver er fuldført!
                </p>
              </div>
            )}

            {saving && (
              <div className="mt-4 text-xs text-fg-muted text-center">
                Gemmer...
              </div>
            )}
          </div>

          <div className="bg-canvas-subtle px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-btn-primary-bg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-btn-primary-hover-bg sm:w-auto"
            >
              Luk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
