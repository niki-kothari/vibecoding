import React from 'react';
import { Mail, AlertTriangle, Loader2, CheckCircle2, XCircle, X } from 'lucide-react';
import { Todo } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'single' | 'all';
  todo?: Todo;
  targetsCount?: number;
  onConfirm: () => Promise<void>;
  status: 'idle' | 'sending' | 'success' | 'error';
  errorMessage?: string;
  successMessage?: string;
  hasGmailToken?: boolean;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  type,
  todo,
  targetsCount = 0,
  onConfirm,
  status,
  errorMessage,
  successMessage,
  hasGmailToken = false,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      id="reminder-modal-overlay"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#f5c2b3]/50 overflow-hidden transform transition-all animate-scale-in"
        id="reminder-modal-content"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#be5a38] via-[#e28766] to-[#be5a38]" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={status === 'sending'}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-40"
          title="Close modal"
          id="reminder-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Status-specific Rendering */}
          {status === 'idle' && (
            <div className="space-y-4" id="reminder-modal-idle-state">
              <div className="mx-auto w-12 h-12 bg-[#fff5f2] rounded-full border-2 border-[#f5c2b3] flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#be5a38]" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 font-sans">
                  Send Overdue Reminder
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {type === 'all' 
                    ? `Send reminder emails to all ${targetsCount} users with overdue tasks?`
                    : `Send a friendly reminder email about this overdue task?`
                  }
                </p>
              </div>

              {type === 'single' && todo && (
                <div className="bg-[#fff5f2] border border-[#f5c2b3] p-4 rounded-xl space-y-2 mt-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] uppercase font-mono font-bold bg-[#be5a38]/10 text-[#be5a38] px-1.5 py-0.5 rounded border border-[#be5a38]/25 mt-0.5 shrink-0">
                      Task
                    </span>
                    <p className="text-sm font-medium text-gray-800 break-words flex-1">
                      {todo.text}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f5c2b3]/30 font-mono text-[11px] text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Recipient</span>
                      <span className="font-semibold text-gray-850 truncate block" title={todo.userEmail}>
                        {todo.userEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Due Date</span>
                      <span className="font-bold text-[#be5a38] block">
                        {todo.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {type === 'all' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 mt-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">Important Notification Details</p>
                    <p className="leading-relaxed">
                      Only tasks that have valid user email addresses assigned in Firestore will be matched for this send action.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-450 text-center font-mono py-1">
                {hasGmailToken 
                  ? "📧 Emails are sent securely through your authorized Google Account"
                  : "🔑 A quick Google popup will request authorization to send emails securely."
                }
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer font-sans"
                  id="reminder-modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-[#be5a38] text-white text-sm font-semibold rounded-xl hover:bg-[#a2492d] shadow-sm hover:shadow transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
                  id="reminder-modal-confirm-btn"
                >
                  <Mail className="w-4 h-4" />
                  <span>{hasGmailToken ? "Send Reminder" : "Authorize & Send"}</span>
                </button>
              </div>
            </div>
          )}

          {status === 'sending' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4" id="reminder-modal-sending-state">
              <div className="relative">
                <div className="w-16 h-16 bg-[#fff5f2] rounded-full flex items-center justify-center border-2 border-dashed border-[#be5a38]/35 animate-spin duration-3000" />
                <Loader2 className="w-8 h-8 text-[#be5a38] animate-spin absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 font-sans">
                  Processing Emails
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Authorizing access and dispatching email reminders securely via the Google API. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-2 space-y-4 text-center" id="reminder-modal-success-state">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full border-2 border-emerald-200 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">
                  Delivered Successfully!
                </h3>
                <p className="text-sm text-gray-600 mt-1.5 px-2">
                  {successMessage || "The overdue reminder email notification has been dispatched."}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer font-sans"
                  id="reminder-modal-success-close-btn"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-2 space-y-4 text-center" id="reminder-modal-error-state">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full border-2 border-rose-200 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 font-sans">
                  Delivery Failed
                </h3>
                <p className="text-sm text-rose-700 font-mono text-left bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs max-h-32 overflow-y-auto mt-2 break-all">
                  {errorMessage || "An unexpected error occurred while sending the email."}
                </p>
                <p className="text-xs text-gray-500 mt-3 px-1 leading-relaxed">
                  Tip: Ensure popup blocking is disabled or reload the page to re-authenticate with Google.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer font-sans"
                  id="reminder-modal-error-cancel-btn"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-[#be5a38] hover:bg-[#a2492d] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer font-sans"
                  id="reminder-modal-error-retry-btn"
                >
                  Retry Action
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
