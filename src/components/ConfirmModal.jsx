import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-fg-default bg-opacity-25 transition-opacity"
          onClick={onCancel}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-canvas-default text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-border-default">
          <div className="bg-canvas-default px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-danger-fg/10 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-danger-fg" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-fg-default">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-fg-muted">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-canvas-subtle px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-md bg-danger-fg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-danger-fg/90 sm:w-auto"
            >
              Slet
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-canvas-default px-3 py-2 text-sm font-semibold text-fg-default shadow-sm border border-border-default hover:bg-canvas-subtle sm:mt-0 sm:w-auto"
            >
              Annuller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
