import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-app-bg w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-app-card">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};