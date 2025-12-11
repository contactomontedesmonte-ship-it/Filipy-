import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, ArrowLeft, AlertTriangle, TrendingUp, DollarSign, Trash2, Calendar, CheckCircle2, Upload, Trophy, AlertCircle, Activity, Clock, Target, BarChart2, PieChart as PieIcon, Archive, Star, FileText, Download, Printer, Building2, LogOut, User as UserIcon, Lock, Camera, ImageIcon, ChevronRight, Edit2, Eye, Save, Megaphone, Check, X, ScanFace, Fingerprint, History, Users, Shield, Search, Mail, ChevronDown, Layout, ListChecks, Briefcase, HardHat, FileCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// Types
import { 
  ViewState, Obra, Lancamento, CategoriaLancamento, ObraStatus, UserRole, CriticalSignal, PrioridadeSignal, UserProfile, Etapa, Subetapa, TarefaAvancada, TipoObra, TipoTarefa, HistoricoObra, Prioridade, Aviso, Tarefa, Subtarefa, HistoricoAT, EtapaObra, ChecklistEtapa
} from './types';

// Services
import { 
  getUser, getCompany, getCurrentObras, getCurrentLancamentos, getRecebimentos, calculateObraStats, addLancamento, updateLancamento, deleteLancamento, createObra, addRecebimento, getDashboardStats, getGlobalPerformanceStats, login, logout, getUnreadCriticalSignals, resolveCriticalSignal, createCriticalSignal, getObraCriticalSignals, getTeamMembers, getPendingCriticalSignals, getCompletedCriticalSignals, completeCriticalSignal, getStoredAuth, saveAuthToDevice, loginWithToken, simulateBiometricScan, canAccessObra, getAllUsers, updateUserPermissions, createUser, getAllAllObras, deleteUser, updateUser,
  getEtapas, getSubetapas, getTarefas, updateTarefa, updateEtapaPeso, getHistorico,
  getAvisosAT, getTarefasAT, getHistoricoAT, completeAvisoAT, completeSubtarefaAT, completeTarefaAT, createAvisoAT, createTarefaAT,
  getEtapasObra, getChecklistEtapa, createEtapaObra, createChecklistItem, toggleChecklistItem, completeEtapaObra,
  getGlobalAvisosUser, getGlobalTarefasUser, getAllPendingCriticalSignals, getAllGlobalAvisosAT, getAllLancamentos
} from './services/dataService';

// Components
import { Navigation } from './components/Navigation';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';

// --- HELPERS ---
const formatCurrency = (val: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
const formatDate = (dateStr: string) => (!dateStr ? '-' : new Date(dateStr).toLocaleDateString('pt-PT'));
const getProgressBarColor = (percentage: number) => {
  if (percentage > 99) return 'bg-app-green';
  if (percentage > 50) return 'bg-app-blue';
  return 'bg-app-yellow';
};
const getPriorityColor = (p: Prioridade) => {
   switch(p) {
      case Prioridade.CRITICO: return 'bg-red-500 text-white';
      case Prioridade.ALTO: return 'bg-orange-500 text-white';
      case Prioridade.MEDIO: return 'bg-yellow-500 text-black';
      case Prioridade.BAIXO: return 'bg-gray-500 text-white';
      default: return 'bg-gray-500';
   }
};

// NEW: Helper for Image Persistence with Compression
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
       const img = new Image();
       img.src = event.target?.result as string;
       img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Resize large images
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
             if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
             }
          } else {
             if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
             }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% quality
       };
       img.onerror = (error) => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

// --- VIEWS ---

// 1. SINAIS IMPORTANTES (BLOCKING SCREEN - Legacy Compatibility)
const SinaisImportantesView: React.FC<{ onProceed: () => void }> = ({ onProceed }) => {
  const user = getUser();
  const [signals, setSignals] = useState<CriticalSignal[]>([]);

  useEffect(() => { setSignals(getUnreadCriticalSignals(user.id)); }, []);

  const handleResolve = (id: string) => {
    resolveCriticalSignal(id);
    setSignals(prev => prev.filter(s => s.id !== id));
    if (signals.length <= 1) onProceed();
  };

  if (signals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-app-bg flex flex-col p-6 animate-fade-in">
      <div className="flex justify-between items-start mb-6">
         <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
               <AlertTriangle className="text-app-yellow" /> Atenção Necessária
            </h1>
            <p className="text-gray-400 text-sm">Você possui avisos pendentes que exigem leitura.</p>
         </div>
         <button onClick={onProceed} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {signals.map(signal => {
          const isUrgent = signal.prioridade === PrioridadeSignal.URGENTE;
          const obra = getCurrentObras().find(o => o.id === signal.obraId);
          return (
            <div key={signal.id} className={`bg-app-card p-5 rounded-2xl border-l-4 shadow-lg ${isUrgent ? 'border-app-red shadow-red-500/10' : 'border-app-yellow shadow-yellow-500/10'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isUrgent ? 'bg-app-red/20 text-app-red' : 'bg-app-yellow/20 text-app-yellow'}`}>
                  {signal.prioridade}
                </span>
                <span className="text-xs text-gray-500">{formatDate(signal.prazo)}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{signal.titulo}</h3>
              <p className="text-gray-300 text-sm mb-3">{signal.descricao}</p>
              {obra && <p className="text-xs text-app-blue mb-4 flex items-center gap-1"><Building2 size={12}/> {obra.name}</p>}
              <Button fullWidth onClick={() => handleResolve(signal.id)}>Marcar como Lido</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. AVISOS IMPORTANTES (TAB - UNIFIED CENTRAL - INSTAGRAM STYLE FEED)
const AvisosImportantesView: React.FC = () => {
  const user = getUser();
  const [activeTab, setActiveTab] = useState<'AVISOS' | 'TAREFAS'>('AVISOS');
  
  // Data State
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  
  // Modal State
  const [completeType, setCompleteType] = useState<'aviso' | 'tarefa' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [desc, setDesc] = useState('');
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const isGestor = user.role === UserRole.GESTOR;

  useEffect(() => {
     loadData();
  }, [user.id, showCreateModal]); // Reload when modal closes

  const loadData = () => {
    // 1. Get List of Works this user has access to (Permission-Aware)
    const accessibleObras = getCurrentObras();
    const accessibleObraIds = accessibleObras.map(o => o.id);

    // 2. Get ALL alerts from the system (Visibility Filtered inside dataService)
    const allAvisos = getAllGlobalAvisosAT();

    // 3. Filter: Only show alerts related to accessible works
    const visibleAvisos = allAvisos.filter(a => accessibleObraIds.includes(a.obraId));

    setAvisos(visibleAvisos);

    // 4. Tasks assigned to user
    setTarefas(getGlobalTarefasUser(user.id));
  };

  const handleComplete = async () => {
     if (!selectedItem || !photo || !desc) return alert("Foto e descrição são obrigatórias.");
     const url = await fileToBase64(photo);
     
     if (completeType === 'aviso') completeAvisoAT(selectedItem.id, url, desc);
     if (completeType === 'tarefa') completeTarefaAT(selectedItem.id, url);

     setCompleteType(null); setSelectedItem(null); setPhoto(null); setDesc('');
     loadData();
  };

  const openComplete = (type: 'aviso' | 'tarefa', item: any) => {
     setCompleteType(type);
     setSelectedItem(item);
     setPhoto(null);
     setDesc('');
  };

  const getObraName = (obraId: string) => {
     return getAllAllObras().find(o => o.id === obraId)?.name || 'Obra Desconhecida';
  };

  const getUserDetails = (userId: string) => {
     const u = getAllUsers().find(u => u.id === userId);
     return u || { name: 'Usuário Desconhecido', avatar: 'https://ui-avatars.com/api/?name=?' };
  };

  return (
    <div className="animate-fade-in pb-20">
       <header className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Feed de Ocorrências</h1>
          <div className="flex p-1 bg-app-card rounded-xl border border-white/5">
             <button onClick={() => setActiveTab('AVISOS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'AVISOS' ? 'bg-app-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                Avisos ({avisos.filter(a => !a.concluido).length})
             </button>
             <button onClick={() => setActiveTab('TAREFAS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'TAREFAS' ? 'bg-app-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                Finalizadas ({avisos.filter(a => a.concluido).length})
             </button>
          </div>
       </header>

       {activeTab === 'AVISOS' ? (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-white font-bold text-sm">Ocorrências Ativas</h2>
                 <Button size="sm" onClick={() => setShowCreateModal(true)}>+ Nova Ocorrência</Button>
             </div>

             {avisos.filter(a => !a.concluido).length === 0 && (
                <p className="text-center text-gray-500 mt-10">Tudo limpo! Nenhum aviso pendente.</p>
             )}

             {avisos.filter(a => !a.concluido).map(a => {
                const creator = getUserDetails(a.enviadoPorId);
                return (
                   <div key={a.id} className="bg-app-card rounded-2xl overflow-hidden border border-white/5 shadow-lg relative">
                      {a.visibilidade === 'restrito' && (
                         <div className="absolute top-2 right-2 z-10 bg-black/60 rounded-full p-1 text-app-red border border-app-red/30">
                            <Lock size={12} />
                         </div>
                      )}
                      <div className="p-3 flex items-center justify-between border-b border-white/5">
                         <div className="flex items-center gap-3">
                            <img src={creator.avatar} className="w-8 h-8 rounded-full border border-white/10" alt={creator.name} />
                            <div>
                               <p className="text-sm font-bold text-white leading-none">{creator.name}</p>
                               <p className="text-[10px] text-gray-500 mt-1">{new Date(a.data_criacao).toLocaleDateString()} • {getObraName(a.obraId)}</p>
                            </div>
                         </div>
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${getPriorityColor(a.prioridade)}`}>{a.prioridade}</span>
                      </div>

                      {a.imagem ? (
                         <div className="w-full h-64 bg-black/50">
                            <img src={a.imagem} className="w-full h-full object-cover" alt="Evidência" />
                         </div>
                      ) : (
                         <div className="w-full h-32 bg-gray-800/30 flex flex-col items-center justify-center text-gray-500 border-y border-white/5">
                            <ImageIcon size={32} />
                            <span className="text-xs mt-2">Sem imagem anexada</span>
                         </div>
                      )}

                      <div className="p-4">
                         <div className="mb-3">
                            <h3 className="font-bold text-white text-lg">{a.titulo}</h3>
                            <p className="text-sm text-gray-300 mt-1">{a.descricao}</p>
                         </div>
                         <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                            <span className="flex items-center gap-1"><Calendar size={12}/> Prazo: {formatDate(a.prazo)}</span>
                            {a.visibilidade === 'restrito' && <span className="text-app-red font-bold flex items-center gap-1"><Shield size={10}/> Confidencial Diretoria</span>}
                         </div>
                         <Button fullWidth onClick={() => openComplete('aviso', a)}>Resolver Problema</Button>
                      </div>
                   </div>
                );
             })}
          </div>
       ) : (
          <div className="space-y-6">
             <h2 className="text-white font-bold text-sm mb-4">Histórico de Resoluções</h2>
             {avisos.filter(a => a.concluido).length === 0 ? <p className="text-center text-gray-500 mt-10">Nenhuma ocorrência finalizada.</p> : 
             avisos.filter(a => a.concluido).map(a => {
                const resolver = a.resolvidoPorId ? getUserDetails(a.resolvidoPorId) : null;
                return (
                   <div key={a.id} className="bg-app-card rounded-2xl overflow-hidden border border-white/5 opacity-80">
                      <div className="p-3 border-b border-white/5 flex justify-between">
                         <span className="text-xs text-app-textSec">{getObraName(a.obraId)}</span>
                         <span className="text-xs text-app-green font-bold uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Resolvido</span>
                      </div>
                      <div className="p-4">
                         <h3 className="font-bold text-white text-md line-through text-gray-400">{a.titulo}</h3>
                         <div className="mt-3 bg-app-green/10 rounded-lg p-3 border border-app-green/10">
                            <p className="text-xs font-bold text-app-green mb-1">SOLUÇÃO:</p>
                            <p className="text-sm text-gray-300">{a.descricao_conclusao}</p>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                               <img src={resolver?.avatar} className="w-4 h-4 rounded-full"/>
                               <span className="text-[10px] text-gray-400">Resolvido por {resolver?.name}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                );
             })}
          </div>
       )}

       {/* MODAL DE CONCLUSÃO */}
       <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Finalizar Item">
          <div className="space-y-4">
             <div>
                <label className="text-xs text-gray-500 mb-1 block">Descrição da Solução *</label>
                <textarea className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" rows={3} value={desc} onChange={e => setDesc(e.target.value)}></textarea>
             </div>
             <div>
                <label className="text-xs text-gray-500 mb-1 block">Foto Comprobatória *</label>
                <input type="file" className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-app-blue file:text-white hover:file:bg-blue-600" onChange={e => setPhoto(e.target.files?.[0] || null)} />
             </div>
             <Button fullWidth onClick={handleComplete}>Concluir</Button>
          </div>
       </Modal>

       {/* MODAL NOVA OCORRÊNCIA (GLOBAL) */}
       <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nova Ocorrência">
          <CreateAvisoForm onClose={() => { setShowCreateModal(false); loadData(); }} />
       </Modal>
    </div>
  );
};

// --- AVISOS & TAREFAS TAB (NEW UNIFIED SYSTEM) ---
const AvisosTarefasTab: React.FC<{ obraId: string }> = ({ obraId }) => {
   const user = getUser();
   const [avisos, setAvisos] = useState<Aviso[]>([]);
   const [tarefas, setTarefas] = useState<Tarefa[]>([]);
   const [history, setHistory] = useState<HistoricoAT[]>([]);
   const [refresh, setRefresh] = useState(0);

   // Modal States
   const [completeType, setCompleteType] = useState<'aviso' | 'tarefa' | 'subtarefa' | null>(null);
   const [selectedItem, setSelectedItem] = useState<any>(null); // Aviso or Tarefa
   const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
   const [photo, setPhoto] = useState<File | null>(null);
   const [desc, setDesc] = useState('');
   
   // Create States
   const [showCreateAviso, setShowCreateAviso] = useState(false);
   const [showCreateTarefa, setShowCreateTarefa] = useState(false);

   useEffect(() => {
      setAvisos(getAvisosAT(obraId));
      setTarefas(getTarefasAT(obraId));
      setHistory(getHistoricoAT(obraId));
   }, [obraId, refresh]);

   const handleComplete = async () => {
      if (!photo) return alert("Foto é obrigatória para conclusão.");
      const url = await fileToBase64(photo);

      if (completeType === 'aviso' && selectedItem) {
         if (!desc) return alert("Descrição obrigatória.");
         completeAvisoAT(selectedItem.id, url, desc);
      } else if (completeType === 'subtarefa' && selectedItem && selectedSubId) {
         completeSubtarefaAT(selectedItem.id, selectedSubId, url);
      } else if (completeType === 'tarefa' && selectedItem) {
         completeTarefaAT(selectedItem.id, url);
      }

      setCompleteType(null); setSelectedItem(null); setPhoto(null); setDesc(''); setSelectedSubId(null);
      setRefresh(r => r + 1);
   };

   // UI Helpers
   const openComplete = (type: 'aviso' | 'tarefa' | 'subtarefa', item: any, subId?: string) => {
      setCompleteType(type);
      setSelectedItem(item);
      setSelectedSubId(subId || null);
      setPhoto(null);
      setDesc('');
   };

   return (
      <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
         <div className="flex-1 space-y-8">
            {/* SEÇÃO A: AVISOS PENDENTES */}
            <section>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2"><AlertTriangle className="text-app-yellow" size={18}/> Avisos Pendentes</h3>
                  {/* ALLOW ANY USER with access to create alerts locally too, not just gestor, if desired. Keeping permission broader for now based on prompt intent */}
                  <Button size="sm" onClick={() => setShowCreateAviso(true)}>+ Novo Aviso</Button>
               </div>
               
               {avisos.length === 0 ? <p className="text-sm text-gray-500 italic">Nenhum aviso pendente.</p> : (
                  <div className="space-y-3">
                     {avisos.map(aviso => (
                        <div key={aviso.id} className="bg-app-card rounded-xl overflow-hidden border border-white/5 flex relative">
                           {aviso.visibilidade === 'restrito' && (
                              <div className="absolute top-2 right-2 bg-app-red/20 border border-app-red/40 rounded-full p-1">
                                 <Lock size={10} className="text-app-red"/>
                              </div>
                           )}
                           <div className={`w-2 ${getPriorityColor(aviso.prioridade)}`}></div>
                           {aviso.imagem && <div className="w-20 h-full bg-cover bg-center hidden sm:block" style={{ backgroundImage: `url(${aviso.imagem})` }}></div>}
                           <div className="p-4 flex-1">
                              <div className="flex justify-between items-start mb-2">
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(aviso.prioridade)}`}>{aviso.prioridade}</span>
                                 <span className="text-xs text-gray-500">{formatDate(aviso.prazo)}</span>
                              </div>
                              <h4 className="font-bold text-white">{aviso.titulo}</h4>
                              <p className="text-sm text-gray-400 mt-1 mb-3">{aviso.descricao}</p>
                              <div className="flex justify-between items-center">
                                 {aviso.visibilidade === 'restrito' ? <span className="text-[10px] text-app-red font-bold flex items-center gap-1"><Shield size={10}/> Restrito Diretoria</span> : <span></span>}
                                 <Button size="sm" onClick={() => openComplete('aviso', aviso)}>Concluir</Button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>

            {/* SEÇÃO B: TAREFAS PENDENTES */}
            <section>
               <div className="flex justify-between items-center mb-4 pt-4 border-t border-white/5">
                  <h3 className="text-white font-bold flex items-center gap-2"><ListChecks className="text-app-blue" size={18}/> Tarefas da Obra</h3>
                  {user.role === UserRole.GESTOR && <Button size="sm" onClick={() => setShowCreateTarefa(true)}>+ Nova Tarefa</Button>}
               </div>

               {tarefas.length === 0 ? <p className="text-sm text-gray-500 italic">Nenhuma tarefa pendente.</p> : (
                  <div className="space-y-4">
                     {tarefas.map(tarefa => {
                        const doneCount = tarefa.subtarefas.filter(s => s.concluido).length;
                        const total = tarefa.subtarefas.length;
                        const progress = total > 0 ? (doneCount / total) * 100 : 0;
                        
                        return (
                           <Card key={tarefa.id} className="border-l-4 border-l-app-blue">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h4 className="font-bold text-white">{tarefa.titulo}</h4>
                                    <p className="text-xs text-gray-400">{tarefa.categoria} • Resp: {getUser().name.split(' ')[0]}</p>
                                 </div>
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(tarefa.prioridade)}`}>{tarefa.prioridade}</span>
                              </div>
                              
                              <div className="bg-black/20 rounded-lg p-3 mb-3">
                                 <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wide">Checklist ({doneCount}/{total})</p>
                                 <div className="space-y-2">
                                    {tarefa.subtarefas.map(sub => (
                                       <div key={sub.id} className="flex items-center justify-between bg-app-bg/50 p-2 rounded border border-white/5">
                                          <div className="flex items-center gap-2">
                                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sub.concluido ? 'bg-app-green border-app-green' : 'border-gray-500'}`}>
                                                {sub.concluido && <Check size={10} className="text-white"/>}
                                             </div>
                                             <span className={`text-xs ${sub.concluido ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{sub.titulo}</span>
                                          </div>
                                          {!sub.concluido && (
                                             <button onClick={() => openComplete('subtarefa', tarefa, sub.id)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                                <Camera size={14}/>
                                             </button>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              
                              {progress === 100 && (
                                 <Button fullWidth onClick={() => openComplete('tarefa', tarefa)}>Finalizar Tarefa Completa</Button>
                              )}
                           </Card>
                        );
                     })}
                  </div>
               )}
            </section>
         </div>

         {/* SEÇÃO C: HISTÓRICO */}
         <div className="w-full lg:w-80 bg-app-card rounded-xl border border-white/5 p-4 h-fit sticky top-20">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><History size={16}/> Linha do Tempo</h3>
            <div className="space-y-6 relative border-l border-gray-700 ml-2 pl-4">
               {history.length === 0 ? <p className="text-xs text-gray-500">Nenhum registro.</p> : history.map(h => (
                  <div key={h.id} className="relative">
                     <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-500 border border-app-bg"></div>
                     <p className="text-[10px] text-gray-500 mb-0.5">{new Date(h.data).toLocaleString()}</p>
                     <p className="text-xs text-white font-medium">{h.descricao}</p>
                     <p className="text-[10px] text-app-textSec mt-1 flex items-center gap-1"><UserIcon size={10}/> {h.userName}</p>
                     {h.foto && (
                        <div className="mt-2 w-full h-20 rounded-lg overflow-hidden border border-white/10">
                           <img src={h.foto} className="w-full h-full object-cover" />
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* COMPLETION MODAL */}
         <Modal isOpen={!!completeType} onClose={() => setCompleteType(null)} title="Conclusão">
            <div className="space-y-4">
               {completeType === 'aviso' && (
                  <div>
                     <label className="text-xs text-gray-500 mb-1 block">Descrição da Solução *</label>
                     <textarea className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" rows={3} value={desc} onChange={e => setDesc(e.target.value)}></textarea>
                  </div>
               )}
               <div>
                  <label className="text-xs text-gray-500 mb-1 block">Foto Obrigatória *</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border border-gray-600 border-dashed rounded cursor-pointer hover:bg-white/5">
                     {photo ? (
                        <img src={URL.createObjectURL(photo)} className="h-full object-contain" />
                     ) : (
                        <>
                           <Camera size={24} className="text-gray-400 mb-2" />
                           <span className="text-xs text-gray-500 mt-1">Tirar foto ou upload</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
                  </label>
               </div>
               <Button fullWidth onClick={handleComplete}>Confirmar Conclusão</Button>
            </div>
         </Modal>

         {/* CREATE MODALS (SIMPLIFIED FOR DEMO) */}
         <Modal isOpen={showCreateAviso} onClose={() => setShowCreateAviso(false)} title="Novo Aviso">
             <CreateAvisoForm onClose={() => { setShowCreateAviso(false); setRefresh(r => r+1); }} />
         </Modal>
         <Modal isOpen={showCreateTarefa} onClose={() => setShowCreateTarefa(false)} title="Nova Tarefa">
             <CreateTarefaForm obraId={obraId} onClose={() => { setShowCreateTarefa(false); setRefresh(r => r+1); }} />
         </Modal>
      </div>
   );
};

// --- PROGESSO TAB (NEW SIMPLE SYSTEM) ---
const ProgressoTab: React.FC<{ obraId: string }> = ({ obraId }) => {
  const [etapas, setEtapas] = useState<EtapaObra[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [selectedEtapa, setSelectedEtapa] = useState<EtapaObra | null>(null);
  const [checklist, setChecklist] = useState<ChecklistEtapa[]>([]);
  
  // Modal State
  const [photo, setPhoto] = useState<File | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  
  // Create Etapa State
  const [showCreateEtapa, setShowCreateEtapa] = useState(false);
  const [newEtapaData, setNewEtapaData] = useState({ nome: '', peso: '', descricao: '' });

  // Permissions Check
  const user = getUser();
  const isTecnico = user.role === UserRole.TECNICO_OBRA;

  useEffect(() => {
     setEtapas(getEtapasObra(obraId));
  }, [obraId, refresh]);

  const openEtapa = (e: EtapaObra) => {
     setSelectedEtapa(e);
     setChecklist(getChecklistEtapa(e.id));
     setPhoto(null);
  };

  const handleToggleItem = (id: string, current: boolean) => {
     toggleChecklistItem(id, !current);
     if (selectedEtapa) setChecklist(getChecklistEtapa(selectedEtapa.id));
     setRefresh(r => r + 1);
  };

  const handleCreateItem = () => {
     if (!selectedEtapa || !newItemTitle) return;
     createChecklistItem(selectedEtapa.id, newItemTitle);
     setNewItemTitle('');
     setChecklist(getChecklistEtapa(selectedEtapa.id));
  };

  const handleCompleteEtapa = async () => {
     if (!selectedEtapa || !photo) return alert("Foto de conclusão é obrigatória.");
     try {
        const url = await fileToBase64(photo);
        completeEtapaObra(selectedEtapa.id, url);
        setSelectedEtapa(null);
        setRefresh(r => r + 1);
     } catch (err: any) {
        alert(err.message);
     }
  };
  
  const handleCreateEtapa = () => {
     if (!newEtapaData.nome || !newEtapaData.peso) return alert("Preencha nome e peso.");
     createEtapaObra(obraId, newEtapaData.nome, parseFloat(newEtapaData.peso), newEtapaData.descricao);
     setShowCreateEtapa(false);
     setNewEtapaData({ nome: '', peso: '', descricao: '' });
     setRefresh(r => r + 1);
  };

  return (
     <div className="animate-fade-in space-y-6">
        {/* CARD DE PROGRESSO GERAL */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-app-blue/30">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold flex items-center gap-2"><TrendingUp size={18} className="text-app-blue"/> Progresso da Obra</h3>
              <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
                 {etapas.filter(e => e.concluida).length} de {etapas.length} etapas
              </span>
           </div>
           
           {/* Calculated Progress Display */}
           <div className="flex items-end gap-2 mb-2">
               <span className="text-4xl font-bold text-white">
                  {etapas.reduce((acc, e) => acc + (e.concluida ? e.peso_percentual : 0), 0)}%
               </span>
               <span className="text-xs text-gray-500 mb-1">concluído (peso ponderado)</span>
           </div>
           
           {/* Visual Bar */}
           <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
               <div 
                  className="h-full bg-app-blue transition-all duration-1000" 
                  style={{ width: `${etapas.reduce((acc, e) => acc + (e.concluida ? e.peso_percentual : 0), 0)}%` }} 
               />
           </div>
        </Card>

        {/* LISTA DE ETAPAS */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Etapas</h3>
              {/* Only non-technicians can add stages */}
              {!isTecnico && <Button size="sm" onClick={() => setShowCreateEtapa(true)}>+ Nova Etapa</Button>}
           </div>

           {etapas.map(etapa => (
              <div key={etapa.id} className={`bg-app-card rounded-xl border ${etapa.concluida ? 'border-app-green/30' : 'border-white/5'} overflow-hidden`}>
                 <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${etapa.concluida ? 'bg-app-green text-black' : 'bg-gray-700 text-white'}`}>
                          {etapa.concluida ? <Check size={16}/> : etapa.ordem}
                       </div>
                       <div>
                          <h4 className={`font-bold ${etapa.concluida ? 'text-app-green' : 'text-white'}`}>{etapa.nome}</h4>
                          <p className="text-xs text-gray-500">{etapa.descricao} • Peso: {etapa.peso_percentual}%</p>
                       </div>
                    </div>
                    <Button variant={etapa.concluida ? "secondary" : "primary"} size="sm" onClick={() => openEtapa(etapa)}>
                       {etapa.concluida ? 'Ver Detalhe' : 'Ver / Checklist'}
                    </Button>
                 </div>
              </div>
           ))}
        </div>

        {/* MODAL DETALHE DA ETAPA */}
        <Modal isOpen={!!selectedEtapa} onClose={() => setSelectedEtapa(null)} title={selectedEtapa?.nome || ''}>
           {selectedEtapa && (
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="text-sm font-bold text-gray-300 uppercase">Checklist de Execução</h3>
                       <span className="text-xs text-gray-500">{checklist.filter(c => c.concluido).length}/{checklist.length} concluídos</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                       {checklist.map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                             <span className={`text-sm ${item.concluido ? 'text-gray-500 line-through' : 'text-white'}`}>{item.titulo}</span>
                             <input 
                                type="checkbox" 
                                checked={item.concluido} 
                                onChange={() => handleToggleItem(item.id, item.concluido)}
                                disabled={selectedEtapa.concluida}
                                className="w-5 h-5 accent-app-blue"
                             />
                          </div>
                       ))}
                    </div>

                    {!selectedEtapa.concluida && !isTecnico && (
                       <div className="flex gap-2">
                          <input 
                             placeholder="Novo item..." 
                             value={newItemTitle} 
                             onChange={e => setNewItemTitle(e.target.value)} 
                             className="flex-1 bg-black/20 border border-white/10 rounded px-3 text-sm text-white"
                          />
                          <Button size="sm" onClick={handleCreateItem}>Adicionar</Button>
                       </div>
                    )}
                 </div>

                 <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm font-bold text-gray-300 uppercase mb-3">Conclusão da Etapa</h3>
                    
                    {selectedEtapa.concluida ? (
                       <div className="bg-app-green/10 border border-app-green/20 rounded-lg p-4 text-center">
                          <CheckCircle2 size={32} className="text-app-green mx-auto mb-2"/>
                          <p className="text-app-green font-bold">Etapa Concluída</p>
                          <p className="text-xs text-gray-400 mt-1">em {new Date(selectedEtapa.data_conclusao!).toLocaleDateString()}</p>
                          {selectedEtapa.foto_conclusao && (
                             <img src={selectedEtapa.foto_conclusao} className="mt-3 rounded-lg h-32 object-cover mx-auto border border-app-green/20"/>
                          )}
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <p className="text-xs text-gray-400">Para concluir esta etapa, marque todos os itens acima e envie uma foto obrigatória.</p>
                          
                          <label className="flex flex-col items-center justify-center w-full h-32 border border-gray-600 border-dashed rounded cursor-pointer hover:bg-white/5">
                             {photo ? (
                                <img src={URL.createObjectURL(photo)} className="h-full object-contain" />
                             ) : (
                                <>
                                   <Camera size={24} className="text-gray-400 mb-2" />
                                   <span className="text-xs text-gray-500 mt-1">Foto de Conclusão (Obrigatória)</span>
                                </>
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
                          </label>

                          <Button fullWidth onClick={handleCompleteEtapa} disabled={checklist.some(c => !c.concluido)}>
                             Concluir Etapa
                          </Button>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </Modal>
        
        {/* MODAL NOVA ETAPA */}
        <Modal isOpen={showCreateEtapa} onClose={() => setShowCreateEtapa(false)} title="Nova Etapa">
            <div className="space-y-4">
                <input placeholder="Nome da Etapa" value={newEtapaData.nome} onChange={e => setNewEtapaData({...newEtapaData, nome: e.target.value})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white"/>
                <input placeholder="Descrição" value={newEtapaData.descricao} onChange={e => setNewEtapaData({...newEtapaData, descricao: e.target.value})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white"/>
                <input type="number" placeholder="Peso (%)" value={newEtapaData.peso} onChange={e => setNewEtapaData({...newEtapaData, peso: e.target.value})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white"/>
                <Button fullWidth onClick={handleCreateEtapa}>Criar</Button>
            </div>
        </Modal>
     </div>
  );
};

// --- FORMS COMPONENTS ---
const CreateAvisoForm: React.FC<{ obraId?: string, onClose: () => void }> = ({ obraId, onClose }) => {
   // If obraId is not provided (Global Feed), allow selection
   const [selectedObraId, setSelectedObraId] = useState(obraId || '');
   const [titulo, setTitulo] = useState('');
   const [desc, setDesc] = useState('');
   const [prio, setPrio] = useState<Prioridade>(Prioridade.ALTO);
   const [prazo, setPrazo] = useState('');
   const [photo, setPhoto] = useState<File | null>(null);
   
   // Visibility Setting
   const [visibilidade, setVisibilidade] = useState<'publico' | 'restrito'>('publico');
   
   const user = getUser();
   const canRestrict = [UserRole.GESTOR, UserRole.CHEFE_OBRA, UserRole.FINANCEIRO, UserRole.ADMINISTRATIVO].includes(user.role);

   // Use getCurrentObras to ensure we only show Obras the user is allowed to access
   const accessibleObras = getCurrentObras().filter(o => o.status === ObraStatus.ATIVA);

   const handleSave = async () => {
      if (!selectedObraId) return alert("Por favor, selecione uma obra.");
      if (!titulo) return alert("Título é obrigatório.");
      const url = photo ? await fileToBase64(photo) : undefined;
      createAvisoAT(selectedObraId, titulo, desc, prio, prazo, getUser().id, visibilidade, url); // Sent by current user
      onClose();
   };

   return (
      <div className="space-y-3">
         {!obraId && (
            <div>
               <label className="text-xs text-gray-500 mb-1 block">Obra *</label>
               <select 
                  value={selectedObraId} 
                  onChange={e => setSelectedObraId(e.target.value)} 
                  className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm"
               >
                  <option value="">Selecione a Obra...</option>
                  {accessibleObras.map(o => (
                     <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
               </select>
            </div>
         )}

         {/* VISIBILITY SELECTOR - ONLY FOR CERTAIN ROLES */}
         {canRestrict && (
            <div>
               <label className="text-xs text-gray-500 mb-1 block">Visibilidade</label>
               <select 
                  value={visibilidade} 
                  onChange={e => setVisibilidade(e.target.value as any)} 
                  className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm"
               >
                  <option value="publico">Público (Todos na Obra)</option>
                  <option value="restrito">Restrito (Diretoria: Gestor/Chefe/Fin)</option>
               </select>
               {visibilidade === 'restrito' && (
                  <p className="text-[10px] text-app-red mt-1 flex items-center gap-1"><Lock size={10}/> Técnicos e clientes não verão esta ocorrência.</p>
               )}
            </div>
         )}

         <div>
             <label className="text-xs text-gray-500 mb-1 block">Título</label>
             <input placeholder="Ex: Falta material" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm" />
         </div>
         
         <div>
             <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
             <textarea placeholder="Detalhes..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm" />
         </div>

         <div>
             <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
             <select value={prio} onChange={e => setPrio(e.target.value as Prioridade)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm">
                <option value={Prioridade.CRITICO}>Crítico</option>
                <option value={Prioridade.ALTO}>Alto</option>
                <option value={Prioridade.MEDIO}>Médio</option>
                <option value={Prioridade.BAIXO}>Baixo</option>
             </select>
         </div>

         <div>
             <label className="text-xs text-gray-500 mb-1 block">Prazo</label>
             <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm" />
         </div>
         
         {/* PHOTO INPUT */}
         <div>
            <label className="text-xs text-gray-500 mb-1 block">Foto do Problema (Opcional)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border border-gray-600 border-dashed rounded cursor-pointer hover:bg-white/5">
                {photo ? (
                <img src={URL.createObjectURL(photo)} className="h-full object-contain" />
                ) : (
                <>
                    <Camera size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Adicionar Foto</span>
                </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
            </label>
         </div>

         <Button fullWidth onClick={handleSave}>Criar Aviso</Button>
      </div>
   );
};

const CreateTarefaForm: React.FC<{ obraId: string, onClose: () => void }> = ({ obraId, onClose }) => {
   const [titulo, setTitulo] = useState('');
   const [cat, setCat] = useState('');
   const [prio, setPrio] = useState<Prioridade>(Prioridade.MEDIO);
   const [subs, setSubs] = useState('');
   
   const handleSave = () => {
      createTarefaAT(obraId, titulo, '...', prio, cat, '2024-12-01', getUser().id, subs.split(',').map(s=>s.trim()));
      onClose();
   };

   return (
      <div className="space-y-3">
         <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm" />
         <input placeholder="Categoria (Ex: Elétrica)" value={cat} onChange={e => setCat(e.target.value)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm" />
         <select value={prio} onChange={e => setPrio(e.target.value as Prioridade)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm">
            <option value={Prioridade.CRITICO}>Crítico</option>
            <option value={Prioridade.ALTO}>Alto</option>
            <option value={Prioridade.MEDIO}>Médio</option>
            <option value={Prioridade.BAIXO}>Baixo</option>
         </select>
         <textarea placeholder="Subtarefas (separar por vírgula)" value={subs} onChange={e => setSubs(e.target.value)} className="w-full bg-black/20 p-2 rounded border border-white/10 text-white text-sm" />
         <Button fullWidth onClick={handleSave}>Criar Tarefa</Button>
      </div>
   );
};

// ... (RankingView, PerfilView, GerenciarUsuariosView, NovaObraView components remain unchanged - omitted for brevity but part of file) ...
// 3. RANKING VIEW (UPDATED)
const RankingView: React.FC = () => {
   const obras = getCurrentObras();
   // Calculate stats for all works (active and finalized) and sort by margin (descending)
   const rankedObras = obras.map(o => {
      const lancamentos = getCurrentLancamentos(o.id);
      const stats = calculateObraStats(o, lancamentos);
      return { obra: o, stats };
   }).sort((a, b) => b.stats.margem - a.stats.margem);

   const winner = rankedObras.length > 0 ? rankedObras[0] : null;
   // Show all other works in the list, including active ones
   const rest = rankedObras.length > 1 ? rankedObras.slice(1) : [];

   return (
     <div className="animate-fade-in pb-20 pt-6">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">Obra Campeã</h1>
        
        {!winner ? (
           <div className="text-center text-gray-500 mt-10">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma obra para gerar ranking.</p>
           </div>
        ) : (
           <div className="relative mb-10">
              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-app-yellow/20 rounded-full blur-[80px]"></div>
              
              <Card className="relative bg-gradient-to-b from-gray-800 to-gray-900 border-app-yellow/50 shadow-2xl shadow-app-yellow/20 p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-500">
                 <div className="absolute -top-6 bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-full shadow-lg shadow-yellow-500/30">
                    <Trophy size={32} className="text-black" strokeWidth={2.5} />
                 </div>
                 
                 <div className="mt-8 mb-2">
                    <p className="text-xs font-bold text-app-yellow uppercase tracking-widest mb-2">Maior Margem de Lucro</p>
                    <h2 className="text-3xl font-bold text-white mb-1">{winner.obra.name}</h2>
                    <p className="text-gray-400 text-sm mb-1">{winner.obra.cliente}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${winner.obra.status === ObraStatus.ATIVA ? 'bg-app-blue/20 text-app-blue' : 'bg-app-green/20 text-app-green'}`}>
                       {winner.obra.status === ObraStatus.ATIVA ? 'Em Andamento' : 'Finalizada'}
                    </span>
                 </div>

                 <div className="my-6">
                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                       {(winner.stats.margem * 100).toFixed(1)}%
                    </span>
                 </div>

                 <div className="grid grid-cols-2 gap-4 w-full border-t border-white/10 pt-4">
                    <div>
                       <p className="text-[10px] text-gray-500 uppercase">Lucro {winner.obra.status === ObraStatus.ATIVA ? 'Proj.' : 'Real'}</p>
                       <p className="text-lg font-bold text-app-green">{formatCurrency(winner.stats.saldo_restante)}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 uppercase">Valor Contrato</p>
                       <p className="text-lg font-bold text-white">{formatCurrency(winner.obra.valor_contratado)}</p>
                    </div>
                 </div>
              </Card>
           </div>
        )}

        {/* LIST OF RUNNER-UPS */}
        {rest.length > 0 && (
           <div className="space-y-4 px-1">
              <h3 className="text-white font-bold text-sm uppercase tracking-wide">Classificação Geral</h3>
              {rest.map((item, index) => (
                 <div key={item.obra.id} className="bg-app-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-xl font-bold text-gray-600">#{index + 2}</span>
                       <div>
                          <h4 className="font-bold text-white text-sm">{item.obra.name}</h4>
                          <p className="text-xs text-gray-500">
                             {item.obra.cliente} • <span className={item.obra.status === ObraStatus.ATIVA ? 'text-app-blue' : 'text-gray-400'}>{item.obra.status === ObraStatus.ATIVA ? 'Em Andamento' : 'Finalizada'}</span>
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className={`font-bold ${item.stats.margem > 0 ? 'text-app-green' : 'text-app-red'}`}>
                          {(item.stats.margem * 100).toFixed(1)}%
                       </span>
                       <p className="text-[10px] text-gray-500">Margem</p>
                    </div>
                 </div>
              ))}
           </div>
        )}
     </div>
   );
 };

// 4. PERFIL VIEW
const PerfilView: React.FC<{ onViewUsers: () => void, onLogout: () => void }> = ({ onViewUsers, onLogout }) => {
  const user = getUser();
  const company = getCompany();
  const [, setRefresh] = useState(0);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = await fileToBase64(file);
        updateUser({ ...user, avatar: url });
        setRefresh(r => r + 1);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col items-center mb-8 pt-4">
         <div className="w-24 h-24 rounded-full border-4 border-app-card shadow-xl overflow-hidden mb-4 relative">
            <img src={user.avatar} className="w-full h-full object-cover" />
            <label className="absolute bottom-0 right-0 p-1.5 bg-app-blue rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors">
                <Camera size={14} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
         </div>
         <h2 className="text-xl font-bold text-white">{user.name}</h2>
         <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-app-blue mt-2 uppercase font-bold tracking-wide">{user.role.replace('_', ' ')}</span>
      </div>

      <div className="space-y-3">
         <Card className="flex items-center gap-4">
            <div className="p-2 bg-white/5 rounded-lg"><Building2 className="text-white" size={20}/></div>
            <div>
               <p className="text-xs text-gray-500">Empresa</p>
               <p className="font-bold text-white">{company.name}</p>
            </div>
         </Card>
         
         <div className="bg-app-card rounded-xl border border-white/5 overflow-hidden">
            {user.role === UserRole.GESTOR && (
               <button onClick={onViewUsers} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-3">
                     <Users size={18} className="text-app-blue"/>
                     <span className="text-sm font-medium text-white">Gerenciar Usuários</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-500"/>
               </button>
            )}
            <div className="w-full flex items-center justify-between p-4 border-b border-white/5">
               <div className="flex items-center gap-3">
                  <ScanFace size={18} className="text-app-green"/>
                  <span className="text-sm font-medium text-white">Face ID / Biometria</span>
               </div>
               <div className="w-10 h-5 bg-app-green/20 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-app-green rounded-full shadow"></div>
               </div>
            </div>
         </div>

         <Button variant="danger" fullWidth onClick={onLogout} className="mt-8">
            <LogOut size={18} className="mr-2"/> Sair do Aplicativo
         </Button>
      </div>
    </div>
  );
};

// 5. GERENCIAR USUARIOS
const GerenciarUsuariosView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const users = getAllUsers();
  const obras = getAllAllObras();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: UserRole.TECNICO_OBRA, allowedObras: [] as string[], avatar: null as File | null });

  const currentUser = getUser();
  const isSelf = (u: UserProfile) => u.id === currentUser.id;
  const isMainAdmin = (u: UserProfile) => u.email.toLowerCase() === 'gestor@montedesmonte.pt';

  const handleSave = async () => {
    if(!formData.name || !formData.email || !formData.password) return alert("Preencha campos obrigatórios");
    
    let avatarUrl = editingUser?.avatar;
    if (formData.avatar) {
        avatarUrl = await fileToBase64(formData.avatar);
    }

    if (isCreating) {
       createUser(formData.name, formData.email, formData.password, formData.role, formData.allowedObras, avatarUrl);
    } else if (editingUser) {
       updateUser({ 
          ...editingUser, 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: formData.role, 
          allowedObras: formData.allowedObras,
          avatar: avatarUrl
       });
    }
    setEditingUser(null); setIsCreating(false);
  };

  const handleDelete = () => {
     // No browser confirm, just state logic in button but for now direct delete as requested previously
     if (editingUser) {
        if (isSelf(editingUser)) return alert("Não pode excluir a si mesmo.");
        if (isMainAdmin(editingUser)) return alert("Admin principal não pode ser excluído.");
        deleteUser(editingUser.id);
        setEditingUser(null);
     }
  };

  const openEdit = (u: UserProfile) => {
     setEditingUser(u);
     setIsCreating(false);
     setFormData({ name: u.name, email: u.email, password: u.password || '', role: u.role, allowedObras: u.allowedObras, avatar: null });
  };

  const openCreate = () => {
     setEditingUser(null);
     setIsCreating(true);
     setFormData({ name: '', email: '', password: '', role: UserRole.TECNICO_OBRA, allowedObras: [], avatar: null });
  };

  return (
    <div className="animate-fade-in pb-20">
       <header className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="text-white" /></button>
          <h1 className="text-xl font-bold text-white">Equipe</h1>
       </header>

       <div className="grid grid-cols-1 gap-3">
          {users.map(u => (
             <div key={u.id} className="bg-app-card p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-700" />
                   <div>
                      <h4 className="font-bold text-white text-sm">{u.name} {isSelf(u) && '(Você)'}</h4>
                      <p className="text-xs text-gray-500">{u.role}</p>
                   </div>
                </div>
                <button onClick={() => openEdit(u)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"><Edit2 size={16}/></button>
             </div>
          ))}
          <Button variant="secondary" onClick={openCreate} className="mt-4">+ Adicionar Membro</Button>
       </div>

       <Modal isOpen={!!editingUser || isCreating} onClose={() => { setEditingUser(null); setIsCreating(false); }} title={isCreating ? "Novo Usuário" : "Editar Usuário"}>
          <div className="space-y-4">
             {/* PROFILE PICTURE INPUT */}
             <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-app-card overflow-hidden mb-2 relative">
                    {formData.avatar ? (
                        <img src={URL.createObjectURL(formData.avatar)} className="w-full h-full object-cover" />
                    ) : (editingUser ? (
                        <img src={editingUser.avatar} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><UserIcon size={32}/></div>
                    ))}
                </div>
                <label className="text-xs text-app-blue cursor-pointer hover:underline">
                    Alterar Foto
                    <input type="file" className="hidden" accept="image/*" onChange={e => setFormData({...formData, avatar: e.target.files?.[0] || null})} />
                </label>
             </div>

             <input type="text" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white" />
             <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white" />
             <input type="text" placeholder="Senha" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white" />
             
             <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full bg-black/20 p-3 rounded border border-white/10 text-white">
                <option value={UserRole.GESTOR}>Gestor</option>
                <option value={UserRole.CHEFE_OBRA}>Chefe de Obra</option>
                <option value={UserRole.TECNICO_OBRA}>Técnico de Obra</option>
                <option value={UserRole.FINANCEIRO}>Financeiro</option>
                <option value={UserRole.ADMINISTRATIVO}>Administrativo</option>
             </select>

             {formData.role !== UserRole.GESTOR && (
                <div className="border-t border-white/10 pt-4">
                   <p className="text-xs text-gray-500 mb-2">Obras Permitidas:</p>
                   <div className="space-y-2 max-h-40 overflow-y-auto">
                      {obras.map(o => (
                         <label key={o.id} className="flex items-center gap-2 text-sm text-gray-300">
                            <input 
                              type="checkbox" 
                              checked={formData.allowedObras.includes(o.id)}
                              onChange={e => {
                                 if (e.target.checked) setFormData({...formData, allowedObras: [...formData.allowedObras, o.id]});
                                 else setFormData({...formData, allowedObras: formData.allowedObras.filter(id => id !== o.id)});
                              }}
                            />
                            {o.name}
                         </label>
                      ))}
                   </div>
                </div>
             )}

             <div className="flex gap-2 mt-4">
                {!isCreating && editingUser && !isSelf(editingUser) && !isMainAdmin(editingUser) && (
                   <Button variant="danger" onClick={handleDelete} className="flex-1">Excluir</Button>
                )}
                <Button fullWidth onClick={handleSave} className="flex-[2]">Salvar</Button>
             </div>
          </div>
       </Modal>
    </div>
  );
};

// --- NOVA OBRA VIEW ---
const NovaObraView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState({
     name: '', cliente: '', valor_contratado: '', orcamento_mo: '', orcamento_materiais: '', orcamento_iva: '',
     tipo_obra: TipoObra.APARTAMENTO
  });

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
     if (!formData.name) return alert("Preencha o nome da obra");
     
     const mat = parseFloat(formData.orcamento_materiais) || 0;
     const mo = parseFloat(formData.orcamento_mo) || 0;
     const iva = parseFloat(formData.orcamento_iva) || 0;

     if (mat <= 0 || mo <= 0 || iva <= 0) {
        return alert("Para criar uma obra, você deve informar os valores de Materiais, Mão de Obra e IVA.");
     }

     createObra({
        name: formData.name,
        cliente: formData.cliente,
        valor_contratado: parseFloat(formData.valor_contratado)||0,
        orcamento_mo: mo,
        orcamento_materiais: mat,
        orcamento_iva: iva,
        tipo_obra: formData.tipo_obra
     });
     onBack();
  };

  return (
    <div className="animate-fade-in pb-8">
       <header className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="text-white" /></button>
          <h1 className="text-xl font-bold text-white">Nova Obra</h1>
       </header>
       
       <div className="bg-app-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
             <label className="text-xs text-app-textSec mb-1 block">Nome da Obra</label>
             <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-app-bg p-3 rounded-xl border border-white/10 text-white" placeholder="Ex: Reforma Apto 302" />
          </div>
          <div>
             <label className="text-xs text-app-textSec mb-1 block">Tipo de Obra (Gera Etapas Automáticas)</label>
             <select value={formData.tipo_obra} onChange={e => handleChange('tipo_obra', e.target.value)} className="w-full bg-app-bg p-3 rounded-xl border border-white/10 text-white">
                <option value={TipoObra.BANHEIRO}>Banheiro</option>
                <option value={TipoObra.COZINHA}>Cozinha</option>
                <option value={TipoObra.APARTAMENTO}>Apartamento Completo</option>
                <option value={TipoObra.QUARTO_SALA}>Quarto/Sala</option>
                <option value={TipoObra.GENERICA}>Genérica</option>
             </select>
          </div>
          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-xs text-app-textSec mb-1 block">Valor Contratado (€)</label>
                <input type="number" value={formData.valor_contratado} onChange={e => handleChange('valor_contratado', e.target.value)} className="w-full bg-app-bg p-3 rounded-xl border border-app-green/30 text-white font-bold" placeholder="0.00" />
             </div>
             <div className="col-span-2">
                <label className="text-xs text-app-textSec mb-1 block">Orçamento Materiais (€) *</label>
                <input type="number" value={formData.orcamento_materiais} onChange={e => handleChange('orcamento_materiais', e.target.value)} className="w-full bg-app-bg p-3 rounded-xl border border-white/10 text-white" placeholder="0.00" />
             </div>
             <div className="col-span-2">
                <label className="text-xs text-app-textSec mb-1 block">Orçamento Mão de Obra (€) *</label>
                <input type="number" value={formData.orcamento_mo} onChange={e => handleChange('orcamento_mo', e.target.value)} className="w-full bg-app-bg p-3 rounded-xl border border-white/10 text-white" placeholder="0.00" />
             </div>
             <div className="col-span-2">
                <label className="text-xs text-app-textSec mb-1 block">Orçamento IVA (€) *</label>
                <input type="number" value={formData.orcamento_iva} onChange={e => handleChange('orcamento_iva', e.target.value)} className="w-full bg-app-bg p-3 rounded-xl border border-white/10 text-white" placeholder="0.00" />
             </div>
          </div>
          <Button fullWidth size="lg" onClick={handleSubmit}>Criar Obra e Gerar Etapas</Button>
       </div>
    </div>
  );
};

// --- MEDICAO TAB (Legacy Advanced) ---
const MedicaoTab: React.FC<{ obraId: string }> = ({ obraId }) => {
  const user = getUser();
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [expandedEtapaId, setExpandedEtapaId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  
  // Task Modal
  const [selectedTask, setSelectedTask] = useState<TarefaAvancada | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [obs, setObs] = useState('');

  // History
  const historico = useMemo(() => getHistorico(obraId), [obraId, refresh]);

  useEffect(() => {
    setEtapas(getEtapas(obraId));
  }, [obraId, refresh]);

  const toggleExpand = (id: string) => setExpandedEtapaId(expandedEtapaId === id ? null : id);
  
  const handleEditWeight = (e: React.MouseEvent, etapa: Etapa) => {
    e.stopPropagation();
    const newW = prompt("Novo peso da etapa (%):", etapa.peso_percentual.toString());
    if (newW && !isNaN(parseFloat(newW))) {
       try {
          updateEtapaPeso(etapa.id, parseFloat(newW));
          setRefresh(r => r+1);
       } catch(err) { alert(err); }
    }
  };

  const handleTaskClick = (task: TarefaAvancada) => {
    setSelectedTask(task);
    setObs(task.observacao || '');
    setPhotoFile(null);
  };

  const confirmTaskCompletion = async () => {
    if(!selectedTask) return;
    if(selectedTask.tipo === TipoTarefa.FOTO_OBRIGATORIA && !selectedTask.foto && !photoFile && !selectedTask.concluido) {
        return alert("Foto obrigatória para esta tarefa.");
    }
    const url = photoFile ? await fileToBase64(photoFile) : undefined;
    
    // Toggle status or keep true if just updating info
    const newStatus = !selectedTask.concluido;
    
    updateTarefa(selectedTask.id, newStatus, url, obs);
    setSelectedTask(null);
    setRefresh(r => r + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      <div className="flex-1 space-y-4">
        {etapas.map(etapa => (
          <div key={etapa.id} className="bg-app-card rounded-xl border border-white/5 overflow-hidden">
            {/* STAGE HEADER */}
            <div 
              onClick={() => toggleExpand(etapa.id)} 
              className={`p-4 cursor-pointer transition-colors ${expandedEtapaId === etapa.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
            >
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    {etapa.concluida ? <CheckCircle2 size={16} className="text-app-green"/> : <span className="text-gray-500 text-xs">{etapa.ordem}.</span>}
                    {etapa.nome}
                  </h4>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] bg-black/30 px-2 py-1 rounded text-gray-400">Peso: {etapa.peso_percentual}%</span>
                     {user.role === UserRole.GESTOR && etapa.peso_editavel && (
                        <button onClick={(e) => handleEditWeight(e, etapa)} className="p-1 hover:bg-white/10 rounded text-gray-500"><Edit2 size={12}/></button>
                     )}
                     {expandedEtapaId === etapa.id ? <ChevronDown className="rotate-180" size={16}/> : <ChevronDown size={16}/>}
                  </div>
               </div>
               <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressBarColor(etapa.percentual_concluido)} transition-all duration-500`} style={{ width: `${etapa.percentual_concluido}%` }}></div>
               </div>
            </div>

            {/* SUBSTAGES (LEVEL 2) */}
            {expandedEtapaId === etapa.id && (
               <div className="p-4 pt-0 space-y-4 border-t border-white/5 bg-black/20">
                  {getSubetapas(etapa.id).map(sub => (
                     <div key={sub.id} className="mt-4">
                        <div className="flex justify-between items-end mb-1">
                           <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wide">{sub.nome}</h5>
                           <span className="text-[10px] text-gray-500">{sub.percentual_concluido.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden mb-2">
                           <div className="h-full bg-app-blue transition-all" style={{ width: `${sub.percentual_concluido}%` }}></div>
                        </div>
                        
                        {/* TASKS (LEVEL 3) */}
                        <div className="grid grid-cols-1 gap-1">
                           {getTarefas(sub.id).map(task => (
                              <div 
                                key={task.id} 
                                onClick={() => handleTaskClick(task)}
                                className={`flex items-center gap-3 p-2 rounded border transition-colors cursor-pointer ${task.concluido ? 'bg-app-green/5 border-app-green/10' : 'bg-app-card border-white/5 hover:border-white/20'}`}
                              >
                                 <div className={`w-4 h-4 rounded border flex items-center justify-center ${task.concluido ? 'bg-app-green border-app-green' : 'border-gray-500'}`}>
                                    {task.concluido && <Check size={10} className="text-white"/>}
                                 </div>
                                 <span className={`text-xs flex-1 ${task.concluido ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.titulo}</span>
                                 {task.tipo === TipoTarefa.FOTO_OBRIGATORIA && <Camera size={12} className={task.foto ? 'text-app-green' : 'text-app-red'} />}
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            )}
          </div>
        ))}
      </div>

      {/* SIDEBAR HISTORY */}
      <div className="w-full lg:w-80 bg-app-card rounded-xl border border-white/5 p-4 h-fit sticky top-20">
         <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2"><History size={16}/> Histórico Recente</h3>
         <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {historico.length === 0 ? <p className="text-xs text-gray-500">Nenhum atividade.</p> : historico.slice(0, 10).map(h => (
               <div key={h.id} className="relative pl-4 border-l border-gray-700">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-600 border-2 border-app-card"></div>
                  <p className="text-[10px] text-gray-500 mb-0.5">{new Date(h.data).toLocaleString()}</p>
                  <p className="text-xs text-white font-medium">{h.descricao}</p>
                  <p className="text-[10px] text-app-textSec mt-0.5">{h.usuarioNome}</p>
                  {Math.abs(h.percentual_novo - h.percentual_anterior) > 0 && (
                     <span className="text-[10px] text-app-green">+{ (h.percentual_novo - h.percentual_anterior).toFixed(1) }% avanço</span>
                  )}
               </div>
            ))}
         </div>
      </div>

      {/* TASK MODAL */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Detalhes da Tarefa">
         {selectedTask && (
            <div className="space-y-4">
               <div>
                  <h3 className="font-bold text-white text-lg">{selectedTask.titulo}</h3>
                  <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded text-gray-400">{selectedTask.tipo}</span>
               </div>
               
               <div>
                  <label className="text-xs text-gray-500 mb-1 block">Observações</label>
                  <textarea value={obs} onChange={e => setObs(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white" rows={3}></textarea>
               </div>

               {/* PHOTO LOGIC */}
               {(selectedTask.tipo === TipoTarefa.FOTO_OBRIGATORIA || selectedTask.tipo === TipoTarefa.EXECUCAO) && (
                  <div>
                     <label className="text-xs text-gray-500 mb-1 block">Evidência (Foto)</label>
                     {selectedTask.foto || photoFile ? (
                        <div className="relative">
                           <img src={selectedTask.foto || (photoFile ? URL.createObjectURL(photoFile) : '')} className="w-full h-40 object-cover rounded border border-gray-700" />
                           <button onClick={() => { setPhotoFile(null); updateTarefa(selectedTask.id, selectedTask.concluido, '', obs); }} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"><X size={14}/></button>
                        </div>
                     ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-gray-600 border-dashed rounded cursor-pointer hover:bg-white/5">
                           <Camera size={20} className="text-gray-400" />
                           <span className="text-xs text-gray-500 mt-1">Adicionar Foto</span>
                           <input type="file" className="hidden" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
                        </label>
                     )}
                  </div>
               )}

               <div className="pt-4 flex gap-2">
                  <Button fullWidth onClick={confirmTaskCompletion} variant={selectedTask.concluido ? 'secondary' : 'primary'}>
                     {selectedTask.concluido ? 'Reabrir Tarefa / Salvar Obs' : 'Concluir Tarefa'}
                  </Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

// --- HOME VIEW --- 
const HomeView: React.FC<{ onViewObra: (id: string) => void }> = ({ onViewObra }) => {
  const stats = getDashboardStats();
  const obras = getCurrentObras();
  const user = getUser();
  
  return (
    <div className="animate-fade-in pb-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {user.name.split(' ')[0]}</h1>
          <p className="text-app-textSec text-sm">Resumo financeiro hoje</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-app-card border border-white/10 overflow-hidden">
          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* KPIs Carousel - RESTORED */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide snap-x">
         <Card className="min-w-[140px] bg-gradient-to-br from-app-card to-app-card/50 border-app-blue/20 snap-start">
            <div className="p-2 bg-app-blue/10 rounded-lg w-fit mb-2"><DollarSign className="text-app-blue" size={18}/></div>
            <p className="text-[10px] text-gray-400 uppercase">Recebido</p>
            <p className="text-lg font-bold text-white">{formatCurrency(stats.faturacaoTotal)}</p>
         </Card>
         <Card className="min-w-[140px] bg-gradient-to-br from-app-card to-app-card/50 border-app-green/20 snap-start">
            <div className="p-2 bg-app-green/10 rounded-lg w-fit mb-2"><TrendingUp className="text-app-green" size={18}/></div>
            <p className="text-[10px] text-gray-400 uppercase">Lucro Caixa</p>
            <p className="text-lg font-bold text-white">{formatCurrency(stats.lucroTotal)}</p>
         </Card>
         <Card className="min-w-[140px] snap-start">
            <div className="p-2 bg-yellow-500/10 rounded-lg w-fit mb-2"><PieIcon className="text-yellow-500" size={18}/></div>
            <p className="text-[10px] text-gray-400 uppercase">Margem</p>
            <p className="text-lg font-bold text-white">{(stats.margemGlobal * 100).toFixed(1)}%</p>
         </Card>
         <Card className="min-w-[140px] snap-start">
            <div className="p-2 bg-purple-500/10 rounded-lg w-fit mb-2"><HardHat className="text-purple-500" size={18}/></div>
            <p className="text-[10px] text-gray-400 uppercase">Ativas</p>
            <p className="text-lg font-bold text-white">{stats.obrasAtivas}</p>
         </Card>
      </div>

      <div className="space-y-4">
        {obras.filter(o => o.status === ObraStatus.ATIVA).length === 0 ? (
           <p className="text-gray-500 text-sm italic">Nenhuma obra ativa.</p>
        ) : (
           obras.filter(o => o.status === ObraStatus.ATIVA).map(obra => {
             const obraStats = calculateObraStats(obra, getCurrentLancamentos(obra.id));
             return (
               <Card key={obra.id} onClick={() => onViewObra(obra.id)} className="group hover:border-app-blue/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        <h4 className="font-bold text-white text-lg">{obra.name}</h4>
                        <p className="text-xs text-app-textSec">{obra.cliente}</p>
                     </div>
                     <span className={`text-[10px] font-bold px-2 py-1 rounded border ${obraStats.margem < 0.1 ? 'bg-app-red/10 text-app-red border-app-red/20' : 'bg-app-green/10 text-app-green border-app-green/20'}`}>
                        Margem: {(obraStats.margem * 100).toFixed(1)}%
                     </span>
                  </div>
                  <div className="mb-2">
                     <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progresso Medido</span>
                        <span className="text-white font-bold">{obraStats.progresso_medido.toFixed(0)}%</span>
                     </div>
                     <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressBarColor(obraStats.progresso_medido)}`} style={{ width: `${obraStats.progresso_medido}%` }}></div>
                     </div>
                  </div>
               </Card>
             );
           })
        )}
      </div>
    </div>
  );
};

// --- OBRA DETAIL VIEW ---
const ObraDetailView: React.FC<{ obraId: string, onBack: () => void, onViewReport: (id: string) => void }> = ({ obraId, onBack, onViewReport }) => {
  const user = getUser();
  const isTecnico = user.role === UserRole.TECNICO_OBRA;
  
  const [activeTab, setActiveTab] = useState<'GERAL' | 'MEDICAO' | 'AVISOS_TAREFAS' | 'PROGRESSO'>(isTecnico ? 'PROGRESSO' : 'GERAL');
  const [refresh, setRefresh] = useState(0); 
  const [showLancamentoModal, setShowLancamentoModal] = useState(false);
  const [showReceber, setShowReceber] = useState(false);
  
  const [receberData, setReceberData] = useState({ valor: '', data: new Date().toISOString().slice(0, 10), observacoes: '' });
  const [newValor, setNewValor] = useState('');
  const [newCategoria, setNewCategoria] = useState<CategoriaLancamento>(CategoriaLancamento.MATERIAIS);
  const [newFornecedor, setNewFornecedor] = useState('');
  const [newData, setNewData] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
     if (!canAccessObra(obraId)) { alert("Sem permissão"); onBack(); }
  }, [obraId]);

  const obra = getCurrentObras().find(o => o.id === obraId);
  const lancamentos = useMemo(() => getCurrentLancamentos(obraId), [obraId, refresh]);
  
  if (!obra) return null; 
  const stats = calculateObraStats(obra, lancamentos);
  const isReadOnly = obra.status === ObraStatus.FINALIZADA;

  const handleSaveLancamento = () => { 
      // Validate Budget Existence BEFORE Saving
      if (newCategoria === CategoriaLancamento.MATERIAIS && (!obra.orcamento_materiais || obra.orcamento_materiais <= 0)) {
          return alert("A obra precisa ter orçamento definido para esta categoria antes de registrar custos.");
      }
      if (newCategoria === CategoriaLancamento.MAO_DE_OBRA && (!obra.orcamento_mo || obra.orcamento_mo <= 0)) {
          return alert("A obra precisa ter orçamento definido para esta categoria antes de registrar custos.");
      }
      if (newCategoria === CategoriaLancamento.IVA && (!obra.orcamento_iva || obra.orcamento_iva <= 0)) {
          return alert("A obra precisa ter orçamento definido para esta categoria antes de registrar custos.");
      }

      addLancamento({ id: Math.random().toString(), obraId, companyId: obra.companyId, valor: parseFloat(newValor), categoria: newCategoria, fornecedor: newFornecedor, data: newData }); 
      setShowLancamentoModal(false); 
      setRefresh(r => r + 1); 
  };
  const handleReceberConfirm = () => { addRecebimento({ obraId, valor: parseFloat(receberData.valor), data: receberData.data }); setShowReceber(false); setRefresh(r => r + 1); };

  return (
    <div className="pb-24 animate-fade-in">
      <header className="sticky top-0 bg-app-bg/95 backdrop-blur z-20 pt-4 pb-2 border-b border-white/5 mb-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={24} className="text-white" /></button>
          <div className="flex-1">
             <h1 className="text-xl font-bold text-white leading-tight">{obra.name}</h1>
             <p className="text-xs text-app-textSec">{obra.cliente}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-2 px-1 overflow-x-auto scrollbar-hide">
           {!isTecnico && (
             <button onClick={() => setActiveTab('GERAL')} className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'GERAL' ? 'text-app-blue border-app-blue' : 'text-gray-500 border-transparent'}`}>Visão Geral</button>
           )}
           <button onClick={() => setActiveTab('PROGRESSO')} className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'PROGRESSO' ? 'text-app-blue border-app-blue' : 'text-gray-500 border-transparent'}`}>Progresso</button>
           <button onClick={() => setActiveTab('AVISOS_TAREFAS')} className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'AVISOS_TAREFAS' ? 'text-app-blue border-app-blue' : 'text-gray-500 border-transparent'}`}>Avisos & Tarefas</button>
           {!isTecnico && (
             <button onClick={() => setActiveTab('MEDICAO')} className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'MEDICAO' ? 'text-app-blue border-app-blue' : 'text-gray-500 border-transparent'}`}>Avançado</button>
           )}
        </div>
      </header>

      {activeTab === 'PROGRESSO' ? (
         <ProgressoTab obraId={obraId} />
      ) : activeTab === 'AVISOS_TAREFAS' ? (
         <AvisosTarefasTab obraId={obraId} />
      ) : activeTab === 'MEDICAO' ? (
        <div className="animate-fade-in">
           <Card className="mb-6 bg-gradient-to-br from-gray-900 to-gray-800 border-app-blue/30">
              <h3 className="text-app-textSec text-xs font-bold uppercase tracking-wider mb-2">Progresso Total</h3>
              <div className="flex items-end gap-3 mb-2">
                 <span className="text-4xl font-bold text-white">{stats.progresso_medido.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
                 <div className={`h-full ${getProgressBarColor(stats.progresso_medido)} transition-all duration-1000 ease-out`} style={{ width: `${stats.progresso_medido}%` }} />
              </div>
           </Card>
           <MedicaoTab obraId={obraId} />
        </div>
      ) : (
        <div className="animate-fade-in">
           {/* GERAL TAB CONTENT */}
           <section className="mb-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3 px-1">Resumo Financeiro</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                  <Card className="flex flex-col justify-center text-center py-4">
                      <p className="text-[10px] text-app-textSec uppercase">Contratado</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(obra.valor_contratado)}</p>
                  </Card>
                  <Card className="flex flex-col justify-center text-center py-4">
                      <p className="text-[10px] text-app-textSec uppercase">Recebido</p>
                      <p className="text-sm font-bold text-app-green">{formatCurrency(obra.recebido)}</p>
                  </Card>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => setShowReceber(true)}>+ Registrar Recebimento</Button>
           </section>

           {/* DETALHAMENTO DE CUSTOS (NEW) */}
           <section className="mb-6">
                 <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3 px-1">Detalhamento de Custos</h3>
                 <div className="grid grid-cols-1 gap-3">
                    {/* Material */}
                    <Card className="p-4 bg-app-card border border-white/5">
                        <div className="flex justify-between items-end mb-1">
                           <span className="text-xs text-app-yellow font-bold uppercase">Materiais</span>
                           <span className="text-xs text-white">{formatCurrency(stats.breakdown[CategoriaLancamento.MATERIAIS].gasto)} <span className="text-gray-500">/ {formatCurrency(stats.breakdown[CategoriaLancamento.MATERIAIS].orcado)}</span></span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
                           <div className="h-full bg-app-yellow" style={{ width: `${Math.min(100, stats.breakdown[CategoriaLancamento.MATERIAIS].progresso)}%` }}></div>
                        </div>
                        <p className="text-right text-[10px] text-gray-400">{stats.breakdown[CategoriaLancamento.MATERIAIS].progresso.toFixed(1)}% consumido</p>
                    </Card>

                    {/* MO */}
                    <Card className="p-4 bg-app-card border border-white/5">
                        <div className="flex justify-between items-end mb-1">
                           <span className="text-xs text-app-blue font-bold uppercase">Mão de Obra</span>
                           <span className="text-xs text-white">{formatCurrency(stats.breakdown[CategoriaLancamento.MAO_DE_OBRA].gasto)} <span className="text-gray-500">/ {formatCurrency(stats.breakdown[CategoriaLancamento.MAO_DE_OBRA].orcado)}</span></span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
                           <div className="h-full bg-app-blue" style={{ width: `${Math.min(100, stats.breakdown[CategoriaLancamento.MAO_DE_OBRA].progresso)}%` }}></div>
                        </div>
                        <p className="text-right text-[10px] text-gray-400">{stats.breakdown[CategoriaLancamento.MAO_DE_OBRA].progresso.toFixed(1)}% consumido</p>
                    </Card>

                    {/* IVA */}
                    <Card className="p-4 bg-app-card border border-white/5">
                        <div className="flex justify-between items-end mb-1">
                           <span className="text-xs text-app-red font-bold uppercase">IVA</span>
                           <span className="text-xs text-white">{formatCurrency(stats.breakdown[CategoriaLancamento.IVA].gasto)} <span className="text-gray-500">/ {formatCurrency(stats.breakdown[CategoriaLancamento.IVA].orcado)}</span></span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-1">
                           <div className="h-full bg-app-red" style={{ width: `${Math.min(100, stats.breakdown[CategoriaLancamento.IVA].progresso)}%` }}></div>
                        </div>
                        <p className="text-right text-[10px] text-gray-400">{stats.breakdown[CategoriaLancamento.IVA].progresso.toFixed(1)}% consumido</p>
                    </Card>
                 </div>
           </section>

           <section className="space-y-4 mt-6">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wide">Últimas Despesas</h3>
                    {!isReadOnly && <Button size="sm" onClick={() => setShowLancamentoModal(true)}>+ Lançamento</Button>}
                  </div>
                  <div className="space-y-2">
                      {lancamentos.slice(0, 5).map(l => (
                          <div key={l.id} className="bg-app-card p-3 rounded-xl flex justify-between items-center border border-white/5">
                              <div><p className="text-white font-bold text-sm">{l.fornecedor}</p><p className="text-xs text-app-textSec">{formatDate(l.data)}</p></div>
                              <p className="text-white font-bold text-sm">- {formatCurrency(l.valor)}</p>
                          </div>
                      ))}
                  </div>
           </section>
        </div>
      )}

      {/* MODALS */}
      {!isTecnico && (
        <>
            <Modal isOpen={showReceber} onClose={() => setShowReceber(false)} title="Registrar Recebimento">
                <div className="space-y-4 pt-2">
                    <input type="number" value={receberData.valor} onChange={e => setReceberData({...receberData, valor: e.target.value})} className="w-full bg-app-bg border border-gray-700 rounded-lg p-3 text-white" placeholder="Valor" />
                    <Button fullWidth onClick={handleReceberConfirm}>Confirmar</Button>
                </div>
            </Modal>
            <Modal isOpen={showLancamentoModal} onClose={() => setShowLancamentoModal(false)} title="Novo Lançamento">
                <div className="space-y-4 pt-2">
                    <input type="number" value={newValor} onChange={e => setNewValor(e.target.value)} className="w-full bg-app-bg border border-gray-700 rounded-lg p-3 text-white" placeholder="Valor" />
                    <input type="text" value={newFornecedor} onChange={e => setNewFornecedor(e.target.value)} className="w-full bg-app-bg border border-gray-700 rounded-lg p-3 text-white" placeholder="Fornecedor" />
                    <select value={newCategoria} onChange={e => setNewCategoria(e.target.value as CategoriaLancamento)} className="w-full bg-app-bg border border-gray-700 rounded-lg p-3 text-white">
                      <option value={CategoriaLancamento.MATERIAIS}>Materiais</option>
                      <option value={CategoriaLancamento.MAO_DE_OBRA}>Mão de Obra</option>
                      <option value={CategoriaLancamento.IVA}>IVA</option>
                    </select>
                    <input type="date" value={newData} onChange={e => setNewData(e.target.value)} className="w-full bg-app-bg border border-gray-700 rounded-lg p-3 text-white" />
                    <Button fullWidth onClick={handleSaveLancamento}>Salvar</Button>
                </div>
            </Modal>
        </>
      )}
    </div>
  );
};

// ... (Rest of the file remains unchanged) ...
// --- LOGIN VIEW ---
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulating network delay
    setTimeout(() => {
        const user = login(email, password);
        if (user) {
            if (user.rememberMeToken) {
                saveAuthToDevice(email, user.rememberMeToken, user.biometricEnabled || false);
            }
            onLogin();
        } else {
            setError('Credenciais inválidas');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-app-blue rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
            <Building2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Monte & Desmonte</h1>
          <p className="text-gray-400">Gestão de Obras Inteligente</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <input 
                type="email" 
                placeholder="Email corporativo" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-app-card border border-white/10 rounded-xl p-4 text-white focus:border-app-blue outline-none transition-colors"
             />
          </div>
          <div>
             <input 
                type="password" 
                placeholder="Senha" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-app-card border border-white/10 rounded-xl p-4 text-white focus:border-app-blue outline-none transition-colors"
             />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button fullWidth size="lg" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar Sistema'}
          </Button>

          <p className="text-center text-xs text-gray-500 mt-6">
            v2.5.0 • Build 2024
          </p>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
       const { email, token } = getStoredAuth();
       if (email && token) {
          const user = loginWithToken(email, token);
          if (user) {
             setIsAuthenticated(true);
             checkBlockingSignals(user.id);
             // TECNICO REDIRECT LOGIC
             if (user.role === UserRole.TECNICO_OBRA) {
                setCurrentView('AVISOS');
             }
          }
       }
    };
    initAuth();
  }, []);

  const checkBlockingSignals = (userId: string) => {
     const signals = getUnreadCriticalSignals(userId);
     if (signals.length > 0) setIsBlocking(true);
  };

  const handleLogin = () => {
     setIsAuthenticated(true);
     const user = getUser();
     if (user) {
        checkBlockingSignals(user.id);
        // TECNICO REDIRECT LOGIC
        if (user.role === UserRole.TECNICO_OBRA) {
           setCurrentView('AVISOS');
        }
     }
  };

  const handleLogout = () => {
     logout();
     setIsAuthenticated(false);
     setCurrentView('HOME');
  };

  const handleViewObra = (id: string) => {
     setSelectedObraId(id);
     setCurrentView('OBRA_DETALHE');
  };

  // Views rendering logic
  const renderView = () => {
     if (!isAuthenticated) return <LoginView onLogin={handleLogin} />;
     
     if (isBlocking) {
        return <SinaisImportantesView onProceed={() => setIsBlocking(false)} />;
     }

     const user = getUser();
     const isTecnico = user.role === UserRole.TECNICO_OBRA;

     switch (currentView) {
        case 'HOME':
           return <HomeView onViewObra={handleViewObra} />;
        case 'OBRAS':
           return (
              <div className="pb-20 animate-fade-in">
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Obras</h1>
                    {getUser().role === UserRole.GESTOR && (
                        <Button size="sm" onClick={() => setCurrentView('NOVA_OBRA')}>+ Nova Obra</Button>
                    )}
                 </div>
                 <div className="space-y-4">
                    {getCurrentObras().map(obra => {
                       const stats = calculateObraStats(obra, getCurrentLancamentos(obra.id));
                       return (
                          <Card key={obra.id} onClick={() => handleViewObra(obra.id)} className="hover:border-app-blue/50 transition-colors">
                             {/* Header: Name and Status */}
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                   <h4 className="font-bold text-white text-lg">{obra.name}</h4>
                                   <p className="text-xs text-gray-500">{obra.cliente}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded border ${obra.status === ObraStatus.ATIVA ? 'bg-app-blue/10 text-app-blue border-app-blue/20' : 'bg-gray-700 text-gray-300'}`}>
                                   {obra.status === ObraStatus.ATIVA ? 'Ativa' : 'Finalizada'}
                                </span>
                             </div>
                
                             {/* KPIs Grid - HIDDEN FOR TECNICO */}
                             {!isTecnico && (
                                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                                    {/* Margin */}
                                    <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase">Margem</p>
                                    <p className={`font-bold ${stats.margem < 0.1 ? 'text-app-red' : 'text-app-green'}`}>
                                        {(stats.margem * 100).toFixed(1)}%
                                    </p>
                                    </div>
                                    {/* Physical Progress */}
                                    <div className="text-center border-l border-white/5">
                                    <p className="text-[10px] text-gray-500 uppercase">Físico</p>
                                    <p className="font-bold text-white">{stats.progresso_medido.toFixed(0)}%</p>
                                    </div>
                                    {/* Financial Execution */}
                                    <div className="text-center border-l border-white/5">
                                    <p className="text-[10px] text-gray-500 uppercase">Financeiro</p>
                                    <p className={`font-bold ${stats.execucao_financeira > stats.progresso_medido + 5 ? 'text-app-red' : 'text-app-blue'}`}>
                                        {stats.execucao_financeira.toFixed(0)}%
                                    </p>
                                    </div>
                                </div>
                             )}
                             
                             {/* ONLY PROGRESS FOR TECNICO */}
                             {isTecnico && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Progresso</span>
                                        <span className="text-white font-bold">{stats.progresso_medido.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${getProgressBarColor(stats.progresso_medido)}`} style={{ width: `${stats.progresso_medido}%` }}></div>
                                    </div>
                                </div>
                             )}
                          </Card>
                       );
                    })}
                 </div>
              </div>
           );
        case 'OBRA_DETALHE':
           return selectedObraId ? <ObraDetailView obraId={selectedObraId} onBack={() => setCurrentView('OBRAS')} onViewReport={() => {}} /> : <HomeView onViewObra={handleViewObra} />;
        case 'RANKING':
           return <RankingView />;
        case 'PERFIL':
           return <PerfilView onViewUsers={() => setCurrentView('USUARIOS')} onLogout={handleLogout} />;
        case 'USUARIOS':
           return <GerenciarUsuariosView onBack={() => setCurrentView('PERFIL')} />;
        case 'NOVA_OBRA':
           return <NovaObraView onBack={() => setCurrentView('OBRAS')} />;
        case 'AVISOS':
           return <AvisosImportantesView />;
        default:
           return <HomeView onViewObra={handleViewObra} />;
     }
  };

  return (
    <div className="min-h-screen bg-app-bg text-white font-sans selection:bg-app-blue/30">
      <div className="max-w-md mx-auto min-h-screen bg-app-bg shadow-2xl relative overflow-hidden">
        <main className="p-6 pt-safe min-h-screen pb-24">
          {renderView()}
        </main>
        
        {isAuthenticated && !isBlocking && (
           <Navigation currentView={currentView} onChangeView={setCurrentView} />
        )}
      </div>
    </div>
  );
};

export default App;