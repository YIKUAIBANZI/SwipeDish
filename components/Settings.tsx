import React, { useState } from 'react';
import { IconX } from './Icons';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  taboos: string;
  onSave: (newTaboos: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, taboos, onSave }) => {
  const [localTaboos, setLocalTaboos] = useState(taboos);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Taboos & Restrictions
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Enter items you cannot eat (e.g., "Peanuts, Shellfish, Pork").
          </p>
          <textarea
            className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none resize-none font-medium text-gray-800"
            placeholder="No spicy food, vegetarian only..."
            value={localTaboos}
            onChange={(e) => setLocalTaboos(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            onSave(localTaboos);
            onClose();
          }}
          className="w-full bg-black text-white py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Save Filters
        </button>
      </div>
    </div>
  );
};
