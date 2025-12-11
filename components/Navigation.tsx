
import React from 'react';
import { Home, HardHat, Trophy, User, Megaphone } from 'lucide-react';
import { ViewState, UserRole } from '../types';
import { getUser } from '../services/dataService';

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const user = getUser();
  const isTecnico = user.role === UserRole.TECNICO_OBRA;

  const items = [
    // Tecnico does not see Dashboard (HOME)
    ...(!isTecnico ? [{ id: 'HOME', icon: Home, label: 'Home' }] : []),
    { id: 'AVISOS', icon: Megaphone, label: 'Avisos' },
    { id: 'OBRAS', icon: HardHat, label: 'Obras' },
    // Tecnico does not see Ranking
    ...(!isTecnico ? [{ id: 'RANKING', icon: Trophy, label: 'Ranking' }] : []),
    { id: 'PERFIL', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-card/95 backdrop-blur-md border-t border-white/5 pb-safe pt-2 px-6 z-40 h-[80px]">
      <div className="flex justify-between items-center max-w-md mx-auto h-full pb-4">
        {items.map((item) => {
          const isActive = item.id === currentView || (currentView === 'OBRA_DETALHE' && item.id === 'OBRAS');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-12 gap-1 transition-all duration-300 ${
                isActive ? 'text-app-blue' : 'text-app-textSec hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-app-blue/10' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};