import React from 'react';
import { X, Save } from 'lucide-react';

interface NotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  content: string;
  onChange: (content: string) => void;
  verseNumber: number;
  verseText?: string;
  isEditing: boolean;
  t: {
    notes: {
      addNote: string;
      editNote: string;
      placeholder: string;
      save: string;
      cancel: string;
    };
    verse: {
      verse: string;
    };
  };
}

export const NotePopup: React.FC<NotePopupProps> = ({
  isOpen,
  onClose,
  onSave,
  content,
  onChange,
  verseNumber,
  verseText,
  isEditing,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? t.notes.editNote : t.notes.addNote}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t.verse.verse} {verseNumber}
            </p>
            <p className="text-gray-900 dark:text-gray-100 text-sm border-l-2 border-emerald-500 pl-3 py-2">
              {verseText}
            </p>
          </div>

          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t.notes.placeholder}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none min-h-[150px]"
              autoFocus
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>{t.notes.cancel}</span>
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t.notes.save}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 