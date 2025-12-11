

import { Company, UserProfile, UserRole, Obra, ObraStatus, Lancamento, CategoriaLancamento, UserObra, ObraStats, Recebimento, CriticalSignal, PrioridadeSignal, Etapa, Subetapa, TarefaAvancada, TipoObra, TipoTarefa, HistoricoObra, Aviso, Tarefa, Subtarefa, HistoricoAT, Prioridade, EtapaObra, ChecklistEtapa } from '../types';

// --- MOCK DATA ---

const MOCK_COMPANY: Company = {
  id: 'c1',
  name: 'Monte & Desmonte',
  logo: 'https://ui-avatars.com/api/?name=M+D&background=FFCC4D&color=000&size=200&font-size=0.5&length=2&bold=true', // M&D Logo
  custo_fixo_diario: 1500,
  ponto_equilibrio: 12 // dias
};

const MOCK_USER: UserProfile = {
  id: 'gestor',
  userId: 'u1',
  name: 'Gestor Administrativo',
  email: 'Gestor@montedesmonte.pt',
  password: 'Ferreira15',
  role: UserRole.GESTOR,
  companyId: 'c1',
  avatar: 'https://picsum.photos/100',
  rememberMeToken: 'valid_token_123', // Mock token on server
  biometricEnabled: false,
  allowedObras: [] // Gestor has implicit access to all, but defined for type safety
};

const MOCK_TEAM: UserProfile[] = [
  MOCK_USER,
  { 
    id: 'up2', 
    userId: 'u2', 
    name: 'João Mestre', 
    email: 'joao@montedesmont.com',
    password: '123',
    role: UserRole.CHEFE_OBRA, 
    companyId: 'c1', 
    avatar: 'https://picsum.photos/101',
    allowedObras: ['o1'] // Can only see Obra 1
  },
  { 
    id: 'up3', 
    userId: 'u3', 
    name: 'Maria Compras', 
    email: 'maria@montedesmont.com',
    password: '123',
    role: UserRole.COMPRAS, 
    companyId: 'c1', 
    avatar: 'https://picsum.photos/102',
    allowedObras: ['o1', 'o2'] // Can see Obra 1 and 2
  },
];

const MOCK_OBRAS: Obra[] = [
  // Active Obras
  {
    id: 'o1',
    companyId: 'c1',
    name: 'Residencial Alphaville',
    cliente: 'João Silva',
    status: ObraStatus.ATIVA,
    valor_contratado: 500000,
    recebido: 200000,
    orcamento_mo: 150000,
    orcamento_materiais: 250000,
    orcamento_iva: 50000,
    data_inicio: '2024-01-01',
    data_conclusao: '2024-12-01',
    execucao_fisica: 45,
    imagem_capa: 'https://picsum.photos/800/400?random=1',
    tipo_obra: TipoObra.APARTAMENTO
  },
  {
    id: 'o2',
    companyId: 'c1',
    name: 'Reforma Loja Centro',
    cliente: 'Maria Souza',
    status: ObraStatus.ATIVA,
    valor_contratado: 120000,
    recebido: 100000,
    orcamento_mo: 40000,
    orcamento_materiais: 60000,
    orcamento_iva: 10000,
    data_inicio: '2024-02-01',
    data_conclusao: '2024-06-15',
    execucao_fisica: 90,
    imagem_capa: 'https://picsum.photos/800/400?random=2',
    tipo_obra: TipoObra.GENERICA
  },
  {
    id: 'o3',
    companyId: 'c1',
    name: 'Galpão Industrial Z3',
    cliente: 'Indústrias Metal',
    status: ObraStatus.ATIVA,
    valor_contratado: 800000,
    recebido: 100000,
    orcamento_mo: 300000,
    orcamento_materiais: 350000,
    orcamento_iva: 50000,
    data_inicio: '2024-03-01',
    data_conclusao: '2025-02-20',
    execucao_fisica: 10,
    imagem_capa: 'https://picsum.photos/800/400?random=3',
    tipo_obra: TipoObra.GENERICA
  },
  // Finalized Obras (For Ranking/History)
  {
    id: 'o4',
    companyId: 'c1',
    name: 'Clinica Saúde+',
    cliente: 'Dr. Roberto',
    status: ObraStatus.FINALIZADA,
    valor_contratado: 300000,
    recebido: 300000,
    orcamento_mo: 80000,
    orcamento_materiais: 120000,
    orcamento_iva: 30000,
    data_inicio: '2023-05-01',
    data_conclusao: '2023-11-20',
    execucao_fisica: 100,
    imagem_capa: 'https://picsum.photos/800/400?random=4',
    tipo_obra: TipoObra.APARTAMENTO
  },
  {
    id: 'o5',
    companyId: 'c1',
    name: 'Apartamento Luxo 101',
    cliente: 'Fernanda Lima',
    status: ObraStatus.FINALIZADA,
    valor_contratado: 150000,
    recebido: 150000,
    orcamento_mo: 50000,
    orcamento_materiais: 50000,
    orcamento_iva: 15000,
    data_inicio: '2023-08-01',
    data_conclusao: '2023-12-15',
    execucao_fisica: 100,
    imagem_capa: 'https://picsum.photos/800/400?random=5',
    tipo_obra: TipoObra.APARTAMENTO
  }
];

const MOCK_LANCAMENTOS: Lancamento[] = [
  // ... Existing Lancamentos for active obras
  { id: 'l1', obraId: 'o1', companyId: 'c1', valor: 50000, categoria: CategoriaLancamento.MATERIAIS, fornecedor: 'Cimento & Cia', subcategoria: 'Estrutura', data: '2024-01-15', observacoes: 'Compra inicial de cimento' },
  { id: 'l2', obraId: 'o1', companyId: 'c1', valor: 20000, categoria: CategoriaLancamento.MAO_DE_OBRA, fornecedor: 'Equipe Alpha', data: '2024-01-30', observacoes: 'Pagamento quinzenal' },
  { id: 'l3', obraId: 'o2', companyId: 'c1', valor: 55000, categoria: CategoriaLancamento.MATERIAIS, fornecedor: 'Pisos Prime', subcategoria: 'Acabamento', data: '2024-02-10' },
  { id: 'l4', obraId: 'o2', companyId: 'c1', valor: 38000, categoria: CategoriaLancamento.MAO_DE_OBRA, fornecedor: 'Mestre João', data: '2024-02-15' },
  { id: 'l5', obraId: 'o2', companyId: 'c1', valor: 11000, categoria: CategoriaLancamento.IVA, fornecedor: 'Impostos', data: '2024-02-20' },
  
  // Lancamentos for Finalized Obras
  { id: 'l6', obraId: 'o4', companyId: 'c1', valor: 200000, categoria: CategoriaLancamento.MATERIAIS, fornecedor: 'Diversos', data: '2023-06-01' },
  { id: 'l7', obraId: 'o4', companyId: 'c1', valor: 50000, categoria: CategoriaLancamento.MAO_DE_OBRA, fornecedor: 'Equipe Beta', data: '2023-07-01' },
  { id: 'l8', obraId: 'o5', companyId: 'c1', valor: 40000, categoria: CategoriaLancamento.MATERIAIS, fornecedor: 'Decor', data: '2023-09-01' },
  { id: 'l9', obraId: 'o5', companyId: 'c1', valor: 60000, categoria: CategoriaLancamento.MAO_DE_OBRA, fornecedor: 'Equipe Gama', data: '2023-10-01' }, // High MO cost
];

const MOCK_RECEBIMENTOS: Recebimento[] = [
  { id: 'r1', obraId: 'o1', companyId: 'c1', valor: 200000, data: '2024-01-10', observacoes: 'Sinal' },
  { id: 'r2', obraId: 'o2', companyId: 'c1', valor: 100000, data: '2024-02-05', observacoes: 'Medição 1' },
  { id: 'r3', obraId: 'o3', companyId: 'c1', valor: 100000, data: '2024-02-15', observacoes: 'Sinal' },
  // Received for Finalized
  { id: 'r4', obraId: 'o4', companyId: 'c1', valor: 300000, data: '2023-11-20', observacoes: 'Total' },
  { id: 'r5', obraId: 'o5', companyId: 'c1', valor: 150000, data: '2023-12-15', observacoes: 'Total' },
];

const MOCK_SIGNALS: CriticalSignal[] = [
  {
    id: 's1',
    companyId: 'c1',
    obraId: 'o1',
    titulo: 'Resolver termo acumulador',
    descricao: 'Cliente reclamou que a pressão da água quente está baixa. Verificar instalação hidráulica urgentemente.',
    enviadoParaId: 'gestor', 
    enviadoPorId: 'up1',
    prioridade: PrioridadeSignal.URGENTE,
    prazo: '2024-06-15',
    lida: false,
    concluida: false,
    dataEnvio: new Date().toISOString()
  },
  {
    id: 's2',
    companyId: 'c1',
    obraId: 'o2',
    titulo: 'Aprovação de Orçamento Extra',
    descricao: 'Orçamento do piso superior excede 10%. Necessário aprovar com cliente até sexta.',
    enviadoParaId: 'gestor',
    enviadoPorId: 'up3',
    prioridade: PrioridadeSignal.ALTA,
    prazo: '2024-06-18',
    lida: false,
    concluida: false,
    dataEnvio: new Date().toISOString()
  }
];

// --- MOCK DATA FOR NEW AVISOS & TAREFAS SYSTEM ---

const MOCK_AVISOS: Aviso[] = [
  {
    id: 'a1', obraId: 'o1', tipo: 'aviso', titulo: 'Material faltante no 3º andar', descricao: 'Falta cimento cola para os banheiros da suíte master. A obra vai parar se não chegar até quarta.',
    imagem: 'https://picsum.photos/seed/construction1/600/400',
    prioridade: Prioridade.ALTO, enviadoPorId: 'gestor', enviadoParaId: 'u2', prazo: '2024-07-20',
    concluido: false, data_criacao: new Date(Date.now() - 86400000 * 2).toISOString(), requires_photo: true,
    visibilidade: 'publico'
  },
  {
    id: 'a2', obraId: 'o1', tipo: 'aviso', titulo: 'Infiltração na garagem', descricao: 'Verificar parede norte. Mancha de umidade crescendo rapidamente após as chuvas.',
    imagem: 'https://picsum.photos/seed/leak/600/400',
    prioridade: Prioridade.CRITICO, enviadoPorId: 'u2', enviadoParaId: 'gestor', prazo: '2024-07-18',
    concluido: true, data_criacao: new Date(Date.now() - 86400000 * 5).toISOString(), requires_photo: true,
    resolvidoPorId: 'gestor', foto_conclusao: 'https://picsum.photos/seed/fixed/600/400', descricao_conclusao: 'Impermeabilização refeita e parede pintada.', data_conclusao: new Date().toISOString(),
    visibilidade: 'publico'
  }
];

const MOCK_TAREFAS_AT: Tarefa[] = [
  {
    id: 't1', obraId: 'o1', tipo: 'tarefa', titulo: 'Instalação Elétrica Q1', descricao: 'Quadro principal da entrada.',
    prioridade: Prioridade.MEDIO, categoria: 'Elétrica', prazo: '2024-07-25', responsavelId: 'u2', concluida: false,
    subtarefas: [
       { id: 'st1', tarefaId: 't1', titulo: 'Fixação do quadro', concluido: true, foto: 'https://picsum.photos/200' },
       { id: 'st2', tarefaId: 't1', titulo: 'Passagem de cabos', concluido: false },
       { id: 'st3', tarefaId: 't1', titulo: 'Teste de disjuntores', concluido: false }
    ]
  }
];

const MOCK_HISTORICO_AT: HistoricoAT[] = [
  { id: 'h1', obraId: 'o1', userId: 'gestor', userName: 'Gestor', tipo_acao: 'aviso_criado', referenciaId: 'a1', descricao: 'Criou aviso: Material faltante', data: new Date().toISOString() }
];

// --- ADVANCED TASKS & STAGES MOCK DATA (Old system kept for compatibility) ---
const MOCK_ETAPAS: Etapa[] = [];
const MOCK_SUBETAPAS: Subetapa[] = [];
const MOCK_TAREFAS: TarefaAvancada[] = [];
const MOCK_HISTORICO: HistoricoObra[] = [];


// --- NEW SYSTEM: PROGRESSO DA OBRA (ETAPA OBRA / CHECKLIST) MOCK DATA ---
const MOCK_ETAPAS_OBRA: EtapaObra[] = [
  { id: 'eo1', obraId: 'o1', nome: 'Demolição', descricao: 'Remoção de paredes e pisos antigos', ordem: 1, peso_percentual: 10, concluida: true, data_conclusao: '2024-01-20', responsavelId: 'u2' },
  { id: 'eo2', obraId: 'o1', nome: 'Alvenaria', descricao: 'Levantamento de paredes e divisórias', ordem: 2, peso_percentual: 30, concluida: false },
  { id: 'eo3', obraId: 'o1', nome: 'Instalações', descricao: 'Elétrica e Hidráulica', ordem: 3, peso_percentual: 30, concluida: false },
  { id: 'eo4', obraId: 'o1', nome: 'Acabamentos', descricao: 'Pisos, revestimentos e pintura', ordem: 4, peso_percentual: 30, concluida: false }
];

const MOCK_CHECKLISTS_ETAPA: ChecklistEtapa[] = [
  // Demolição (Concluída)
  { id: 'ce1', etapaId: 'eo1', titulo: 'Retirar portas e janelas', concluido: true },
  { id: 'ce2', etapaId: 'eo1', titulo: 'Demolir parede cozinha', concluido: true },
  { id: 'ce3', etapaId: 'eo1', titulo: 'Remover entulho', concluido: true },
  // Alvenaria (Pendente)
  { id: 'ce4', etapaId: 'eo2', titulo: 'Marcar paredes', concluido: true },
  { id: 'ce5', etapaId: 'eo2', titulo: 'Executar alvenaria quartos', concluido: false },
  { id: 'ce6', etapaId: 'eo2', titulo: 'Executar alvenaria sala', concluido: false }
];

// DATA PERSISTENCE & STATE
// Load from localStorage or use Mock
const loadFromStorage = (key: string, fallback: any[]) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

// --- LOGIC ---

export const getCompany = () => MOCK_COMPANY;

let _currentUser: UserProfile | null = null;
let _team: UserProfile[] = loadFromStorage('md_users', MOCK_TEAM);
let _lancamentos: Lancamento[] = loadFromStorage('md_lancamentos', MOCK_LANCAMENTOS);
let _obras: Obra[] = loadFromStorage('md_obras', MOCK_OBRAS);
let _recebimentos: Recebimento[] = loadFromStorage('md_recebimentos', MOCK_RECEBIMENTOS);
let _signals: CriticalSignal[] = loadFromStorage('md_signals', MOCK_SIGNALS);

// New Data
let _etapas: Etapa[] = loadFromStorage('md_etapas', MOCK_ETAPAS);
let _subetapas: Subetapa[] = loadFromStorage('md_subetapas', MOCK_SUBETAPAS);
let _tarefas: TarefaAvancada[] = loadFromStorage('md_tarefas', MOCK_TAREFAS);
let _historico: HistoricoObra[] = loadFromStorage('md_historico', MOCK_HISTORICO);

// NEW SYSTEM STATE
let _avisos: Aviso[] = loadFromStorage('md_avisos_at', MOCK_AVISOS);
let _tarefasAT: Tarefa[] = loadFromStorage('md_tarefas_at', MOCK_TAREFAS_AT);
let _historicoAT: HistoricoAT[] = loadFromStorage('md_historico_at', MOCK_HISTORICO_AT);

// NEW PROGRESS SYSTEM STATE
let _etapasObra: EtapaObra[] = loadFromStorage('md_etapas_obra', MOCK_ETAPAS_OBRA);
let _checklistsEtapa: ChecklistEtapa[] = loadFromStorage('md_checklists_etapa', MOCK_CHECKLISTS_ETAPA);

const saveState = () => {
  try {
      localStorage.setItem('md_users', JSON.stringify(_team));
      localStorage.setItem('md_lancamentos', JSON.stringify(_lancamentos));
      localStorage.setItem('md_obras', JSON.stringify(_obras));
      localStorage.setItem('md_recebimentos', JSON.stringify(_recebimentos));
      localStorage.setItem('md_signals', JSON.stringify(_signals));
      
      localStorage.setItem('md_etapas', JSON.stringify(_etapas));
      localStorage.setItem('md_subetapas', JSON.stringify(_subetapas));
      localStorage.setItem('md_tarefas', JSON.stringify(_tarefas));
      localStorage.setItem('md_historico', JSON.stringify(_historico));
      
      // NEW SYSTEM
      localStorage.setItem('md_avisos_at', JSON.stringify(_avisos));
      localStorage.setItem('md_tarefas_at', JSON.stringify(_tarefasAT));
      localStorage.setItem('md_historico_at', JSON.stringify(_historicoAT));

      // NEW PROGRESS SYSTEM
      localStorage.setItem('md_etapas_obra', JSON.stringify(_etapasObra));
      localStorage.setItem('md_checklists_etapa', JSON.stringify(_checklistsEtapa));
  } catch (e) {
      console.error("Local Storage is full. Could not save state.", e);
      alert("Atenção: Armazenamento cheio. Algumas fotos podem não ter sido salvas.");
  }
};

// We merge MOCK_USER into current user in login for simpler mock, 
// but in real app user data comes from DB.
export const getUser = (): UserProfile => {
  if (!_currentUser) {
     return MOCK_USER; 
  }
  return _currentUser;
};

export const getTeamMembers = (): UserProfile[] => {
  return _team;
};

// USER MANAGEMENT FUNCTIONS
export const getAllUsers = (): UserProfile[] => {
  return _team;
};

export const updateUserPermissions = (userId: string, allowedObraIds: string[]) => {
  const idx = _team.findIndex(u => u.id === userId);
  if (idx >= 0) {
    _team[idx] = { ..._team[idx], allowedObras: allowedObraIds };
    saveState();
  }
};

export const updateUser = (updatedUser: UserProfile) => {
  const idx = _team.findIndex(u => u.id === updatedUser.id);
  if (idx >= 0) {
    _team[idx] = updatedUser;
    
    // Update current user if it's the one logged in
    if (_currentUser && _currentUser.id === updatedUser.id) {
       _currentUser = updatedUser;
    }
    
    saveState();
  }
};

export const deleteUser = (userId: string) => {
  _team = _team.filter(u => u.id !== userId);
  saveState();
}

export const createUser = (name: string, email: string, password: string, role: UserRole, allowedObras: string[], avatar?: string) => {
  const finalAvatar = avatar || `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`;

  const newUser: UserProfile = {
    id: Math.random().toString(36).substr(2, 9),
    userId: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, // Store password (mock persistence)
    role,
    companyId: MOCK_COMPANY.id,
    avatar: finalAvatar,
    allowedObras
  };
  
  _team.push(newUser);
  saveState(); // Save to local storage so user persists
  return newUser;
};

// --- AUTH SERVICES ---

const STORAGE_KEYS = {
  EMAIL: 'md_user_email',
  TOKEN: 'md_auth_token',
  BIOMETRIC: 'md_biometric_enabled'
};

export const saveAuthToDevice = (email: string, token: string, biometricEnabled: boolean) => {
  localStorage.setItem(STORAGE_KEYS.EMAIL, email);
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  if (biometricEnabled) {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC, 'yes');
  } else {
    localStorage.removeItem(STORAGE_KEYS.BIOMETRIC);
  }
};

export const getStoredAuth = () => {
  return {
    email: localStorage.getItem(STORAGE_KEYS.EMAIL),
    token: localStorage.getItem(STORAGE_KEYS.TOKEN),
    biometricEnabled: localStorage.getItem(STORAGE_KEYS.BIOMETRIC) === 'yes'
  };
};

export const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.EMAIL);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.BIOMETRIC);
};

export const simulateBiometricScan = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Always success in mock
    }, 1500);
  });
};

export const login = (identifier: string, password?: string): UserProfile | null => {
  // Find user in the persisted team list
  const foundUser = _team.find(u => 
    u.email.toLowerCase() === identifier.toLowerCase() && 
    (u.password === password || (!u.password && identifier === 'Gestor@montedesmonte.pt')) // Fallback for old default if password missing
  );

  if (foundUser) {
    const token = 'generated_token_' + Math.random().toString(36).substr(2);
    _currentUser = { 
      ...foundUser, 
      rememberMeToken: token
    };
    return _currentUser;
  }
  return null;
};

export const loginWithToken = (email: string, token: string): UserProfile | null => {
  // Check against persisted team
  const foundUser = _team.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (foundUser && token && token.length > 5) {
     _currentUser = { 
      ...foundUser, 
      rememberMeToken: token
    };
    return _currentUser;
  }
  return null;
};

export const logout = () => {
  _currentUser = null;
  clearStoredAuth();
};


// --- PERMISSION AWARE DATA FETCHING ---

export const getCurrentObras = (): Obra[] => {
  if (!_currentUser) return [];
  
  // 1. GESTOR sees everything
  if (_currentUser.role === UserRole.GESTOR) {
    return _obras;
  }
  
  // 2. Others see only allowed works
  // If allowedObras is undefined/empty for non-gestor, they see nothing.
  const allowed = _currentUser.allowedObras || [];
  return _obras.filter(o => allowed.includes(o.id));
};

export const getAllAllObras = (): Obra[] => {
  // Helper for Manager UI to see list of ALL works to assign permissions
  return _obras; 
}

export const canAccessObra = (obraId: string): boolean => {
  const obras = getCurrentObras();
  return obras.some(o => o.id === obraId);
};

// --- REST OF GETTERS (Now filtered by usage of getCurrentObras or explicit filtering if needed) ---
// Note: getCurrentLancamentos takes an ID. If user can't see Obra, they shouldn't query lancamentos for it.
// The UI protects the entry point (ObraDetail).

export const getCurrentLancamentos = (obraId: string): Lancamento[] => {
  return _lancamentos
    .filter(l => l.obraId === obraId)
    .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
};

export const getRecebimentos = (obraId: string): Recebimento[] => {
  return _recebimentos.filter(r => r.obraId === obraId).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
};

// --- CRITICAL SIGNALS LOGIC ---

export const getUnreadCriticalSignals = (userId: string): CriticalSignal[] => {
  // Filter by user assignment AND ensure they still have access to the obra
  const accessibleObras = getCurrentObras().map(o => o.id);
  return _signals.filter(s => 
    s.enviadoParaId === userId && 
    !s.lida && 
    !s.concluida &&
    accessibleObras.includes(s.obraId)
  );
};

// GLOBAL GETTER FOR GESTOR
export const getAllPendingCriticalSignals = (): CriticalSignal[] => {
  // Return ALL pending signals regardless of assignee, for active obras
  const activeObrasIds = _obras.filter(o => o.status === ObraStatus.ATIVA).map(o => o.id);
  return _signals
    .filter(s => !s.concluida && activeObrasIds.includes(s.obraId))
    .sort((a, b) => {
       if (a.prioridade === b.prioridade) {
         return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
       }
       return a.prioridade === PrioridadeSignal.URGENTE ? -1 : 1;
    });
};

export const getPendingCriticalSignals = (userId: string): CriticalSignal[] => {
  const accessibleObras = getCurrentObras().map(o => o.id);
  return _signals
    .filter(s => 
      s.enviadoParaId === userId && 
      !s.concluida &&
      accessibleObras.includes(s.obraId)
    )
    .sort((a, b) => {
      if (a.prioridade === b.prioridade) {
        return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
      }
      return a.prioridade === PrioridadeSignal.URGENTE ? -1 : 1;
    });
};

export const getCompletedCriticalSignals = (userId: string): CriticalSignal[] => {
  return _signals
    .filter(s => s.enviadoParaId === userId && s.concluida)
    .sort((a, b) => {
      const dateA = a.data_conclusao ? new Date(a.data_conclusao).getTime() : 0;
      const dateB = b.data_conclusao ? new Date(b.data_conclusao).getTime() : 0;
      return dateB - dateA;
    });
};

export const getObraCriticalSignals = (obraId: string): CriticalSignal[] => {
  return _signals.filter(s => s.obraId === obraId && !s.concluida);
};

export const createCriticalSignal = (signal: Omit<CriticalSignal, 'id' | 'companyId' | 'lida' | 'dataEnvio' | 'concluida'>) => {
  const newSignal: CriticalSignal = {
    ...signal,
    id: Math.random().toString(36).substr(2, 9),
    companyId: MOCK_COMPANY.id,
    lida: false,
    concluida: false,
    dataEnvio: new Date().toISOString()
  };
  _signals.push(newSignal);
  saveState();
};

export const resolveCriticalSignal = (id: string) => {
  const idx = _signals.findIndex(s => s.id === id);
  if (idx >= 0) {
    _signals[idx] = { ..._signals[idx], lida: true };
    saveState();
  }
};

export const completeCriticalSignal = (id: string, fotoUrl: string, descricao: string) => {
  const idx = _signals.findIndex(s => s.id === id);
  if (idx >= 0) {
    _signals[idx] = { 
      ..._signals[idx], 
      lida: true,
      concluida: true,
      foto_conclusao: fotoUrl,
      descricao_conclusao: descricao,
      data_conclusao: new Date().toISOString()
    };
    saveState();
  }
};


// Calculate Financials Logic - PROFESSIONAL MARGIN MODEL UPDATE
export const calculateObraStats = (obra: Obra, lancamentos: Lancamento[]): ObraStats => {
  // 1. Custo Realizado (Fluxo de caixa de saída)
  const gasto_total = lancamentos.reduce((acc, l) => acc + l.valor, 0);
  const saldo_restante = obra.valor_contratado - gasto_total; // Cash flow perspective

  // 2. Orçamento Previsto Total (Baseline)
  const custo_previsto_total = obra.orcamento_mo + obra.orcamento_materiais + obra.orcamento_iva;

  // 3. Margem Prevista (Baseline Margin)
  const margem_prevista = obra.valor_contratado > 0 
    ? (obra.valor_contratado - custo_previsto_total) / obra.valor_contratado 
    : 0;

  // 4. Custo a Concluir (ETC - Estimate To Complete)
  const custo_a_concluir = custo_previsto_total - gasto_total;

  // 5. Margem Projetada / Real (Display Margin)
  let margem = 0;
  if (obra.status === ObraStatus.FINALIZADA) {
    margem = obra.valor_contratado > 0 
      ? (obra.valor_contratado - gasto_total) / obra.valor_contratado
      : 0;
  } else {
    margem = margem_prevista;
  }
  
  // 6. Desvio (Deviation)
  const desvio = custo_previsto_total > 0 ? (gasto_total - custo_previsto_total) / custo_previsto_total : 0; 
  
  const execucao_financeira = obra.valor_contratado > 0 ? (gasto_total / obra.valor_contratado) * 100 : 0;

  // Breakdown Logic
  const calcBreakdown = (cat: CategoriaLancamento, orcado: number) => {
    const gasto = lancamentos.filter(l => l.categoria === cat).reduce((a,b) => a + b.valor, 0);
    return {
      orcado,
      gasto,
      restante: orcado - gasto, // Can be negative
      progresso: orcado > 0 ? (gasto / orcado) * 100 : 0
    };
  };

  const breakdown = {
    [CategoriaLancamento.MAO_DE_OBRA]: calcBreakdown(CategoriaLancamento.MAO_DE_OBRA, obra.orcamento_mo),
    [CategoriaLancamento.MATERIAIS]: calcBreakdown(CategoriaLancamento.MATERIAIS, obra.orcamento_materiais),
    [CategoriaLancamento.IVA]: calcBreakdown(CategoriaLancamento.IVA, obra.orcamento_iva),
  };

  // --- FORECASTING ---
  const today = new Date();
  const startDate = obra.data_inicio ? new Date(obra.data_inicio) : new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  const diasEmExecucao = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const ritmoMedioDiario = gasto_total / diasEmExecucao;
  const orcamentoCustoRestante = Math.max(0, custo_previsto_total - gasto_total);
  const diasRestantes = ritmoMedioDiario > 0 ? Math.ceil(orcamentoCustoRestante / ritmoMedioDiario) : 0;
  
  const estimatedEndDate = new Date(today.getTime() + (diasRestantes * 24 * 60 * 60 * 1000));
  
  const lucroProjetado = obra.valor_contratado - custo_previsto_total;

  // Alerts Logic
  const alertas: string[] = [];
  if (margem < 0.15) alertas.push("Margem projetada baixa (< 15%)");
  
  if (execucao_financeira > obra.execucao_fisica + 5) alertas.push("Gasto acelerado vs avanço físico");
  
  if (breakdown[CategoriaLancamento.MATERIAIS].gasto > obra.orcamento_materiais) alertas.push("Estouro no orçamento de Materiais");
  if (breakdown[CategoriaLancamento.MAO_DE_OBRA].gasto > obra.orcamento_mo) alertas.push("Estouro no orçamento de Mão de Obra");
  
  if (desvio > 0.05) alertas.push(`Orçamento estourado em ${(desvio*100).toFixed(1)}%`);
  
  if (obra.data_conclusao && estimatedEndDate > new Date(obra.data_conclusao)) alertas.push("Risco de atraso no cronograma");

  let riscoGeral: 'baixo' | 'medio' | 'alto' = 'baixo';
  if (alertas.length >= 1) riscoGeral = 'medio';
  if (alertas.length >= 3 || margem < 0.10) riscoGeral = 'alto';

  return {
    gasto_total,
    saldo_restante,
    custo_previsto_total,
    custo_a_concluir,
    margem_prevista,
    margem,
    desvio,
    execucao_financeira,
    progresso_medido: obra.execucao_fisica, // Use stored execution value which is updated by tasks
    previsao_ritmo: 0, 
    alertas,
    breakdown,
    forecast: {
      dias_restantes: diasRestantes,
      data_termino_estimada: estimatedEndDate.toISOString(),
      lucro_projetado: lucroProjetado,
      ritmo_medio_diario: ritmoMedioDiario,
      orcamento_consumido_pct: custo_previsto_total > 0 ? (gasto_total / custo_previsto_total) * 100 : 0,
      risco_geral: riscoGeral
    }
  };
};

export const updateObraFisico = (id: string, value: number) => {
  const idx = _obras.findIndex(o => o.id === id);
  if (idx >= 0) {
    _obras[idx] = { ..._obras[idx], execucao_fisica: value };
    saveState();
  }
};

export const addLancamento = (lancamento: Lancamento) => {
  _lancamentos.push(lancamento);
  saveState();
};

export const updateLancamento = (updatedLancamento: Lancamento) => {
  const index = _lancamentos.findIndex(l => l.id === updatedLancamento.id);
  if (index !== -1) {
    _lancamentos[index] = updatedLancamento;
    saveState();
  }
};

export const deleteLancamento = (id: string) => {
  _lancamentos = _lancamentos.filter(l => l.id !== id);
  saveState();
};

export const addRecebimento = (recebimento: Omit<Recebimento, 'id' | 'companyId'>) => {
  const newRec: Recebimento = {
    ...recebimento,
    id: Math.random().toString(36).substr(2, 9),
    companyId: MOCK_COMPANY.id
  };
  
  _recebimentos.push(newRec);

  const idx = _obras.findIndex(o => o.id === recebimento.obraId);
  if (idx >= 0) {
    _obras[idx] = { 
      ..._obras[idx], 
      recebido: _obras[idx].recebido + recebimento.valor 
    };
  }
  saveState();
};

export const createObra = (obraData: Omit<Obra, 'id' | 'companyId' | 'status' | 'recebido' | 'execucao_fisica'>) => {
  const newId = Math.random().toString(36).substr(2, 9);
  const newObra: Obra = {
    ...obraData,
    id: newId,
    companyId: MOCK_COMPANY.id,
    status: ObraStatus.ATIVA,
    recebido: 0,
    execucao_fisica: 0,
    data_inicio: new Date().toISOString()
  };
  _obras.push(newObra);
  
  // Generate Default Etapas based on TipoObra
  // OLD SYSTEM (ETAPA/SUBETAPA) logic
  if (obraData.tipo_obra) {
     const stages = [
        { nome: 'Infraestrutura', peso: 20 },
        { nome: 'Alvenaria', peso: 30 },
        { nome: 'Acabamentos', peso: 30 },
        { nome: 'Entrega', peso: 20 }
     ];
     
     stages.forEach((s, i) => {
        const etapaId = Math.random().toString(36).substr(2, 9);
        _etapas.push({
           id: etapaId,
           obraId: newId,
           nome: s.nome,
           ordem: i+1,
           peso_percentual: s.peso,
           peso_editavel: true,
           concluida: false,
           percentual_concluido: 0
        });
        const subId = Math.random().toString(36).substr(2, 9);
        _subetapas.push({ id: subId, etapaId, nome: 'Execução', ordem: 1, percentual_concluido: 0 });
        _tarefas.push({ id: Math.random().toString(36).substr(2,9), subetapaId: subId, titulo: 'Executar serviço', tipo: TipoTarefa.EXECUCAO, concluido: false });
     });
  }

  // Generate Default Etapas for NEW PROGRESS SYSTEM (EtapaObra)
  // Simple default set for now
  const simpleStages = [
      { nome: 'Serviços Preliminares', peso: 10 },
      { nome: 'Infraestrutura', peso: 20 },
      { nome: 'Superestrutura', peso: 20 },
      { nome: 'Instalações', peso: 20 },
      { nome: 'Acabamentos', peso: 20 },
      { nome: 'Limpeza Final', peso: 10 }
  ];
  simpleStages.forEach((s, i) => {
      _etapasObra.push({
          id: Math.random().toString(36).substr(2, 9),
          obraId: newId,
          nome: s.nome,
          descricao: 'Etapa padrão',
          ordem: i+1,
          peso_percentual: s.peso,
          concluida: false
      });
  });

  saveState();
}

export const getDashboardStats = () => {
  const accessibleObras = getCurrentObras();
  const accessibleIds = accessibleObras.map(o => o.id);

  const totalRecebido = _recebimentos
    .filter(r => accessibleIds.includes(r.obraId))
    .reduce((acc, r) => acc + r.valor, 0);

  const totalGasto = _lancamentos
    .filter(l => accessibleIds.includes(l.obraId))
    .reduce((acc, l) => acc + l.valor, 0);
  
  const lucroTotal = totalRecebido - totalGasto;

  let totalContratado = 0;
  let totalMargemPonderada = 0;
  
  accessibleObras.forEach(o => {
    totalContratado += o.valor_contratado;
    const stats = calculateObraStats(o, _lancamentos.filter(l => l.obraId === o.id));
    totalMargemPonderada += (stats.margem * o.valor_contratado);
  });

  const margemGlobal = totalContratado > 0 ? totalMargemPonderada / totalContratado : 0;
  const obrasAtivas = accessibleObras.filter(o => o.status === ObraStatus.ATIVA).length;

  return {
    faturacaoTotal: totalRecebido,
    lucroTotal: lucroTotal,
    margemGlobal,
    obrasAtivas,
    faturacaoMes: 0, // Deprecated but kept for type compat if needed (though UI uses Total)
    lucroMes: 0, 
    custoDiario: MOCK_COMPANY.custo_fixo_diario,
    pontoEquilibrio: margemGlobal > 0 ? MOCK_COMPANY.custo_fixo_diario / margemGlobal : 0
  };
}

export const getAllLancamentos = () => _lancamentos;
export const getGlobalPerformanceStats = () => {
  const accessibleObras = getCurrentObras();
  const accessibleIds = accessibleObras.map(o => o.id);
  const currentYear = new Date().getFullYear();
  
  const obrasNoAno = accessibleObras.filter(o => 
    (o.data_inicio && new Date(o.data_inicio).getFullYear() === currentYear) || 
    (o.data_conclusao && new Date(o.data_conclusao).getFullYear() === currentYear) ||
    o.status === ObraStatus.ATIVA
  );

  const recebimentosAno = _recebimentos.filter(r => new Date(r.data).getFullYear() === currentYear && accessibleIds.includes(r.obraId));
  const lancamentosAno = _lancamentos.filter(l => new Date(l.data).getFullYear() === currentYear && accessibleIds.includes(l.obraId));

  const totalFaturadoAno = recebimentosAno.reduce((acc, r) => acc + r.valor, 0);
  const totalGastoAno = lancamentosAno.reduce((acc, l) => acc + l.valor, 0);
  const lucroAnual = totalFaturadoAno - totalGastoAno;
  const margemAnual = totalFaturadoAno > 0 ? lucroAnual / totalFaturadoAno : 0;

  const finalizadasCount = accessibleObras.filter(o => o.status === ObraStatus.FINALIZADA).length;
  const ativasCount = accessibleObras.filter(o => o.status === ObraStatus.ATIVA).length;

  const finalized = accessibleObras.filter(o => o.status === ObraStatus.FINALIZADA);
  const onTimeCount = finalized.filter(o => true).length; 
  const taxaPrazo = finalized.length > 0 ? (onTimeCount / finalized.length) * 100 : 100;
  
  const profitableCount = finalized.filter(o => {
    const l = _lancamentos.filter(lan => lan.obraId === o.id);
    const s = calculateObraStats(o, l);
    return s.margem > 0;
  }).length;
  const taxaLucro = finalized.length > 0 ? (profitableCount / finalized.length) * 100 : 100;

  const score = Math.round(((margemAnual * 100) * 0.5) + (taxaPrazo * 0.3) + (taxaLucro * 0.2));

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const billingChartData = months.map((m, idx) => {
    const total = recebimentosAno
      .filter(r => new Date(r.data).getMonth() === idx)
      .reduce((a, b) => a + b.valor, 0);
    return { name: m, valor: total };
  });

  const profitChartData = obrasNoAno.map(o => {
    const l = _lancamentos.filter(la => la.obraId === o.id);
    const s = calculateObraStats(o, l);
    return { name: o.name.split(' ')[0], lucro: o.valor_contratado - (o.status === ObraStatus.ATIVA ? s.custo_previsto_total : s.gasto_total) };
  });

  let mo = 0, mat = 0, iva = 0;
  lancamentosAno.forEach(l => {
    if (l.categoria === CategoriaLancamento.MAO_DE_OBRA) mo += l.valor;
    if (l.categoria === CategoriaLancamento.MATERIAIS) mat += l.valor;
    if (l.categoria === CategoriaLancamento.IVA) iva += l.valor;
  });
  const distributionData = [
    { name: 'MO', value: mo, color: '#005CFF' },
    { name: 'Mat', value: mat, color: '#FFCC4D' },
    { name: 'IVA', value: iva, color: '#EF4444' },
  ].filter(d => d.value > 0);

  return {
    totalFaturadoAno,
    totalGastoAno,
    lucroAnual,
    margemAnual,
    ativasCount,
    finalizadasCount,
    taxaPrazo,
    score,
    billingChartData,
    profitChartData,
    distributionData
  };
};

// --- NEW AVISOS & TAREFAS LOGIC ---

// Helper for Visibility
const canViewAviso = (aviso: Aviso): boolean => {
   if (!_currentUser) return false;
   if (aviso.visibilidade === 'publico') return true;
   // if 'restrito', only Diretoria
   const isDiretoria = [UserRole.GESTOR, UserRole.CHEFE_OBRA, UserRole.FINANCEIRO, UserRole.ADMINISTRATIVO].includes(_currentUser.role);
   return isDiretoria;
}

export const getAvisosAT = (obraId: string): Aviso[] => {
  return _avisos
    .filter(a => a.obraId === obraId && !a.concluido && canViewAviso(a))
    .sort((a,b) => {
       const priorityOrder = { [Prioridade.CRITICO]: 0, [Prioridade.ALTO]: 1, [Prioridade.MEDIO]: 2, [Prioridade.BAIXO]: 3 };
       if (priorityOrder[a.prioridade] !== priorityOrder[b.prioridade]) {
          return priorityOrder[a.prioridade] - priorityOrder[b.prioridade];
       }
       return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
    });
};

// GLOBAL GETTER FOR GESTOR NEW AVISOS (Actually global for everyone, filtered by visibility)
export const getAllGlobalAvisosAT = (): Aviso[] => {
  return _avisos
    .filter(a => canViewAviso(a))
    .sort((a,b) => {
       // Put uncompleted first
       if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
       const priorityOrder = { [Prioridade.CRITICO]: 0, [Prioridade.ALTO]: 1, [Prioridade.MEDIO]: 2, [Prioridade.BAIXO]: 3 };
       if (priorityOrder[a.prioridade] !== priorityOrder[b.prioridade]) {
          return priorityOrder[a.prioridade] - priorityOrder[b.prioridade];
       }
       return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
    });
};

export const getTarefasAT = (obraId: string): Tarefa[] => {
   return _tarefasAT.filter(t => t.obraId === obraId && !t.concluida);
};

export const getGlobalAvisosUser = (userId: string): Aviso[] => {
  return _avisos
    .filter(a => a.enviadoParaId === userId && canViewAviso(a))
    .sort((a,b) => {
       if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
       return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
    });
};

export const getGlobalTarefasUser = (userId: string): Tarefa[] => {
  return _tarefasAT
    .filter(t => t.responsavelId === userId && !t.concluida)
    .sort((a,b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime());
};

export const getHistoricoAT = (obraId: string): HistoricoAT[] => {
   return _historicoAT.filter(h => h.obraId === obraId).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
};

const logHistoricoAT = (obraId: string, tipo: HistoricoAT['tipo_acao'], descricao: string, refId: string, foto?: string) => {
   _historicoAT.push({
      id: Math.random().toString(),
      obraId,
      userId: _currentUser?.id || 'sys',
      userName: _currentUser?.name || 'Sistema',
      tipo_acao: tipo,
      descricao,
      referenciaId: refId,
      foto,
      data: new Date().toISOString()
   });
   saveState();
};

export const createAvisoAT = (obraId: string, titulo: string, descricao: string, prioridade: Prioridade, prazo: string, enviadoParaId: string, visibilidade: 'publico' | 'restrito', fotoUrl?: string) => {
   const newId = Math.random().toString();
   const newAviso: Aviso = {
      id: newId,
      obraId,
      tipo: 'aviso',
      titulo,
      descricao,
      prioridade,
      enviadoPorId: _currentUser?.id || 'sys',
      enviadoParaId,
      prazo,
      concluido: false,
      data_criacao: new Date().toISOString(),
      requires_photo: true,
      imagem: fotoUrl, // Initial Problem Photo
      visibilidade
   };
   _avisos.push(newAviso);
   logHistoricoAT(obraId, 'aviso_criado', `Aviso criado (${visibilidade}): ${titulo}`, newId, fotoUrl);
   saveState();
};

export const completeAvisoAT = (id: string, fotoUrl: string, descricao: string) => {
   const idx = _avisos.findIndex(a => a.id === id);
   if (idx >= 0) {
      _avisos[idx] = { 
        ..._avisos[idx], 
        concluido: true, 
        foto_conclusao: fotoUrl, 
        descricao_conclusao: descricao, 
        data_conclusao: new Date().toISOString(),
        resolvidoPorId: _currentUser?.id 
      };
      logHistoricoAT(_avisos[idx].obraId, 'aviso_concluido', `Aviso concluído: ${_avisos[idx].titulo}`, id, fotoUrl);
      saveState();
   }
};

export const createTarefaAT = (obraId: string, titulo: string, descricao: string, prioridade: Prioridade, categoria: string, prazo: string, responsavelId: string, subtarefas: string[]) => {
   const newId = Math.random().toString();
   const newTarefa: Tarefa = {
      id: newId,
      obraId,
      tipo: 'tarefa',
      titulo,
      descricao,
      prioridade,
      categoria,
      prazo,
      responsavelId,
      concluida: false,
      subtarefas: subtarefas.map(t => ({
         id: Math.random().toString(),
         tarefaId: newId,
         titulo: t,
         concluido: false
      }))
   };
   _tarefasAT.push(newTarefa);
   logHistoricoAT(obraId, 'tarefa_criada', `Tarefa criada: ${titulo}`, newId);
   saveState();
};

export const completeSubtarefaAT = (tarefaId: string, subId: string, fotoUrl: string) => {
   const tIdx = _tarefasAT.findIndex(t => t.id === tarefaId);
   if (tIdx >= 0) {
      const sIdx = _tarefasAT[tIdx].subtarefas.findIndex(s => s.id === subId);
      if (sIdx >= 0) {
         _tarefasAT[tIdx].subtarefas[sIdx].concluido = true;
         _tarefasAT[tIdx].subtarefas[sIdx].foto = fotoUrl;
         _tarefasAT[tIdx].subtarefas[sIdx].data_conclusao = new Date().toISOString();
         
         logHistoricoAT(_tarefasAT[tIdx].obraId, 'subtarefa_concluida', `Subtarefa concluída: ${_tarefasAT[tIdx].subtarefas[sIdx].titulo}`, subId, fotoUrl);
         saveState();
      }
   }
};

export const completeTarefaAT = (tarefaId: string, fotoUrl: string) => {
   const idx = _tarefasAT.findIndex(t => t.id === tarefaId);
   if (idx >= 0) {
      // Validate all subtasks
      const allDone = _tarefasAT[idx].subtarefas.every(s => s.concluido);
      if (!allDone) throw new Error("Todas as subtarefas devem estar concluídas.");
      
      _tarefasAT[idx] = { ..._tarefasAT[idx], concluida: true, foto_conclusao: fotoUrl, data_conclusao: new Date().toISOString() };
      logHistoricoAT(_tarefasAT[idx].obraId, 'tarefa_concluida', `Tarefa finalizada: ${_tarefasAT[idx].titulo}`, tarefaId, fotoUrl);
      saveState();
   }
};

// --- PROGRESSO DA OBRA (NEW SIMPLE SYSTEM) LOGIC ---

export const getEtapasObra = (obraId: string): EtapaObra[] => {
  return _etapasObra.filter(e => e.obraId === obraId).sort((a,b) => a.ordem - b.ordem);
};

export const getChecklistEtapa = (etapaId: string): ChecklistEtapa[] => {
  return _checklistsEtapa.filter(c => c.etapaId === etapaId);
};

export const createEtapaObra = (obraId: string, nome: string, peso: number, descricao: string) => {
  const existing = _etapasObra.filter(e => e.obraId === obraId);
  const nextOrdem = existing.length > 0 ? Math.max(...existing.map(e => e.ordem)) + 1 : 1;
  
  const newEtapa: EtapaObra = {
    id: Math.random().toString(36).substr(2, 9),
    obraId,
    nome,
    descricao,
    ordem: nextOrdem,
    peso_percentual: peso,
    concluida: false
  };
  _etapasObra.push(newEtapa);
  
  // Create default checklist
  createChecklistItem(newEtapa.id, "Serviço executado");
  createChecklistItem(newEtapa.id, "Área limpa");
  
  saveState();
  return newEtapa;
};

export const createChecklistItem = (etapaId: string, titulo: string) => {
  const newItem: ChecklistEtapa = {
    id: Math.random().toString(36).substr(2, 9),
    etapaId,
    titulo,
    concluido: false
  };
  _checklistsEtapa.push(newItem);
  saveState();
};

export const toggleChecklistItem = (itemId: string, concluido: boolean, fotoUrl?: string, desc?: string) => {
  const idx = _checklistsEtapa.findIndex(c => c.id === itemId);
  if (idx >= 0) {
    _checklistsEtapa[idx] = { 
       ..._checklistsEtapa[idx], 
       concluido,
       ...(fotoUrl && { foto: fotoUrl }),
       ...(desc && { descricao_execucao: desc }),
       ...(concluido && { data_conclusao: new Date().toISOString() })
    };
    
    // If unchecked, unfinish the Etapa
    if (!concluido) {
       const etapaId = _checklistsEtapa[idx].etapaId;
       const eIdx = _etapasObra.findIndex(e => e.id === etapaId);
       if (eIdx >= 0 && _etapasObra[eIdx].concluida) {
          _etapasObra[eIdx].concluida = false;
          _etapasObra[eIdx].data_conclusao = undefined;
          _etapasObra[eIdx].foto_conclusao = undefined;
          
          // Recalculate global progress
          recalculateGlobalProgressSimple(_etapasObra[eIdx].obraId);
       }
    }
    
    saveState();
  }
};

export const completeEtapaObra = (etapaId: string, fotoUrl: string) => {
  const items = _checklistsEtapa.filter(c => c.etapaId === etapaId);
  if (items.some(i => !i.concluido)) {
     throw new Error("Todos os itens do checklist devem estar concluídos.");
  }
  
  const idx = _etapasObra.findIndex(e => e.id === etapaId);
  if (idx >= 0) {
     _etapasObra[idx] = {
        ..._etapasObra[idx],
        concluida: true,
        data_conclusao: new Date().toISOString(),
        foto_conclusao: fotoUrl,
        responsavelId: _currentUser?.id
     };
     recalculateGlobalProgressSimple(_etapasObra[idx].obraId);
     saveState();
  }
};

const recalculateGlobalProgressSimple = (obraId: string) => {
  const etapas = _etapasObra.filter(e => e.obraId === obraId);
  const completedWeight = etapas
     .filter(e => e.concluida)
     .reduce((acc, e) => acc + e.peso_percentual, 0);
  
  const oIdx = _obras.findIndex(o => o.id === obraId);
  if (oIdx >= 0) {
     _obras[oIdx].execucao_fisica = completedWeight; // Simple sum of completed stages weights
  }
};

// --- ADVANCED METHODS (Old System Wrappers) ---

export const getEtapas = (obraId: string): Etapa[] => _etapas.filter(e => e.obraId === obraId).sort((a,b) => a.ordem - b.ordem);
export const getSubetapas = (etapaId: string): Subetapa[] => _subetapas.filter(s => s.etapaId === etapaId).sort((a,b) => a.ordem - b.ordem);
export const getTarefas = (subetapaId: string): TarefaAvancada[] => _tarefas.filter(t => t.subetapaId === subetapaId);

export const updateEtapaPeso = (etapaId: string, novoPeso: number) => {
  const eIdx = _etapas.findIndex(e => e.id === etapaId);
  if (eIdx === -1) return;
  
  _etapas[eIdx].peso_percentual = novoPeso;
  
  // Recalculate Obra Global Progress based on new weights
  const etapa = _etapas[eIdx];
  const obraId = etapa.obraId;
  recalculateObraProgress(obraId);
  saveState();
};

export const updateTarefa = (tarefaId: string, concluido: boolean, foto?: string, observacao?: string) => {
  const tIdx = _tarefas.findIndex(t => t.id === tarefaId);
  if (tIdx === -1) return;

  const oldStatus = _tarefas[tIdx].concluido;
  _tarefas[tIdx] = { ..._tarefas[tIdx], concluido, foto, observacao, data_conclusao: new Date().toISOString() };
  
  // 1. Update Subetapa
  const subId = _tarefas[tIdx].subetapaId;
  const subTasks = _tarefas.filter(t => t.subetapaId === subId);
  const subProgress = (subTasks.filter(t => t.concluido).length / subTasks.length) * 100;
  
  const sIdx = _subetapas.findIndex(s => s.id === subId);
  if (sIdx >= 0) {
     _subetapas[sIdx].percentual_concluido = subProgress;
     
     // 2. Update Etapa
     const etapaId = _subetapas[sIdx].etapaId;
     const subetapas = _subetapas.filter(s => s.etapaId === etapaId);
     // Simple average for subetapas within etapa, or we could add weights to subetapas later
     const etapaProgress = subetapas.reduce((acc, s) => acc + s.percentual_concluido, 0) / subetapas.length;
     
     const eIdx = _etapas.findIndex(e => e.id === etapaId);
     if (eIdx >= 0) {
        _etapas[eIdx].percentual_concluido = etapaProgress;
        _etapas[eIdx].concluida = etapaProgress >= 100;
        
        // 3. Update Obra
        const obraId = _etapas[eIdx].obraId;
        const previousObraProgress = _obras.find(o => o.id === obraId)?.execucao_fisica || 0;
        const newObraProgress = recalculateObraProgress(obraId);
        
        // 4. Log History
        if (oldStatus !== concluido) {
           _historico.push({
              id: Math.random().toString(),
              obraId,
              usuarioId: _currentUser?.id || 'sys',
              usuarioNome: _currentUser?.name || 'Sistema',
              descricao: `${concluido ? 'Concluiu' : 'Reabriu'} tarefa: ${_tarefas[tIdx].titulo}`,
              data: new Date().toISOString(),
              percentual_anterior: previousObraProgress,
              percentual_novo: newObraProgress
           });
        }
     }
  }
  saveState();
};

const recalculateObraProgress = (obraId: string): number => {
  const etapas = _etapas.filter(e => e.obraId === obraId);
  let totalWeightedProgress = 0;
  let totalWeight = 0;
  
  etapas.forEach(e => {
     totalWeightedProgress += (e.percentual_concluido * e.peso_percentual);
     totalWeight += e.peso_percentual;
  });
  
  // Normalize if weights don't sum to 100
  const finalProgress = totalWeight > 0 ? totalWeightedProgress / totalWeight : 0;
  
  const oIdx = _obras.findIndex(o => o.id === obraId);
  if (oIdx >= 0) {
     _obras[oIdx].execucao_fisica = finalProgress;
  }
  return finalProgress;
};

export const getHistorico = (obraId: string): HistoricoObra[] => {
   return _historico.filter(h => h.obraId === obraId).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
};