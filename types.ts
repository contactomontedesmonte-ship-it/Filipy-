
export enum UserRole {
  GESTOR = 'gestor',
  ADMINISTRATIVO = 'administrativo',
  CHEFE_OBRA = 'chefe_obra',
  COMPRAS = 'compras',
  CLIENTE = 'cliente',
  FINANCEIRO = 'financeiro',
  TECNICO_OBRA = 'tecnico_obra'
}

export enum ObraStatus {
  ATIVA = 'ativa',
  FINALIZADA = 'finalizada'
}

export enum CategoriaLancamento {
  MAO_DE_OBRA = 'mao_de_obra',
  MATERIAIS = 'materiais',
  IVA = 'iva'
}

export enum PrioridadeSignal {
  ALTA = 'alta',
  URGENTE = 'urgente'
}

// NEW PRIORITY ENUM FOR AVISOS & TAREFAS
export enum Prioridade {
  CRITICO = 'critico',
  ALTO = 'alto',
  MEDIO = 'medio',
  BAIXO = 'baixo'
}

export enum TipoObra {
  APARTAMENTO = 'apartamento',
  COZINHA = 'cozinha',
  BANHEIRO = 'banheiro',
  QUARTO_SALA = 'quarto_sala',
  GENERICA = 'generica'
}

export enum TipoTarefa {
  CHECKLIST = 'checklist',
  FOTO_OBRIGATORIA = 'foto_obrigatoria',
  EXECUCAO = 'execucao'
}

export interface Company {
  id: string;
  name: string;
  logo: string; // URL to image
  custo_fixo_diario: number;
  ponto_equilibrio: number; // em dias
}

export interface UserProfile {
  id: string;
  userId: string; // Reference to 'User'
  name: string;
  email: string;
  password?: string; // For mock auth persistence
  role: UserRole;
  companyId: string;
  avatar?: string;
  rememberMeToken?: string; // Auth token for auto-login
  biometricEnabled?: boolean; // User preference
  allowedObras: string[]; // List of Obra IDs that this user can access
}

export interface Obra {
  id: string;
  companyId: string;
  name: string;
  cliente: string;
  status: ObraStatus;
  valor_contratado: number;
  recebido: number;
  orcamento_mo: number;
  orcamento_materiais: number;
  orcamento_iva: number;
  data_inicio?: string; // ISO Date
  data_conclusao?: string; // ISO Date
  tipo_obra?: TipoObra;
  
  // Fields for UI (not strictly in step 1 DB spec but needed for app function)
  execucao_fisica: number; // 0-100
  imagem_capa?: string;
}

export interface Lancamento {
  id: string;
  obraId: string;
  companyId: string;
  valor: number;
  categoria: CategoriaLancamento;
  fornecedor: string;
  subcategoria?: string; 
  data: string; // ISO Date
  observacoes?: string;
  comprovativo?: string; // Image URL
}

export interface Recebimento {
  id: string;
  obraId: string;
  companyId: string;
  valor: number;
  data: string; // ISO Date
  observacoes?: string;
}

export interface UserObra {
  id: string;
  userProfileId: string;
  obraId: string;
  papel: 'responsavel' | 'colaborador' | 'cliente';
}

// OLD INTERFACE - Kept for backward compatibility with blocking screen logic if needed, 
// though we will try to migrate to 'Aviso' where possible.
export interface CriticalSignal {
  id: string;
  companyId: string;
  obraId: string;
  titulo: string;
  descricao: string;
  enviadoParaId: string; // UserProfile ID
  enviadoPorId: string; // UserProfile ID
  prioridade: PrioridadeSignal;
  prazo: string; // ISO Date
  lida: boolean;
  dataEnvio: string; // ISO Date
  
  // New Fields for Completion
  concluida: boolean;
  foto_conclusao?: string; // URL
  descricao_conclusao?: string; // Text description of resolution
  data_conclusao?: string; // ISO Date
}

// --- NEW SYSTEM: AVISOS & TAREFAS ---

export interface Aviso {
  id: string;
  obraId: string;
  tipo: 'aviso';
  titulo: string;
  descricao: string;
  imagem?: string; // Foto do problema (Instagram Style)
  prioridade: Prioridade;
  enviadoPorId: string;
  enviadoParaId: string;
  prazo: string; // ISO Date
  concluido: boolean;
  
  visibilidade: 'publico' | 'restrito'; // publico = Todos da obra; restrito = Diretoria

  // Resolution fields
  foto_conclusao?: string;
  descricao_conclusao?: string;
  data_conclusao?: string;
  resolvidoPorId?: string; // ID of the user who resolved it

  data_criacao: string;
  requires_photo: boolean; // Always true per requirements
}

export interface Subtarefa {
  id: string;
  tarefaId: string;
  titulo: string;
  concluido: boolean;
  foto?: string;
  descricao_execucao?: string;
  data_conclusao?: string;
}

export interface Tarefa {
  id: string;
  obraId: string;
  tipo: 'tarefa';
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  categoria: string;
  subtarefas: Subtarefa[]; // List of subtarefas
  prazo: string;
  responsavelId: string;
  concluida: boolean;
  foto_conclusao?: string;
  data_conclusao?: string;
}

export interface HistoricoAT {
  id: string;
  obraId: string;
  userId: string;
  userName: string;
  tipo_acao: 'aviso_criado' | 'aviso_concluido' | 'tarefa_concluida' | 'subtarefa_concluida' | 'reaberto' | 'foto_enviada' | 'tarefa_criada';
  referenciaId: string; // ID of Aviso/Tarefa/Subtarefa
  descricao: string;
  foto?: string;
  data: string; // ISO Date
}

// --- END NEW SYSTEM ---

// --- SISTEMA PROGRESSO DA OBRA (SIMPLIFICADO E SEGURO) ---

export interface EtapaObra {
  id: string;
  obraId: string;
  nome: string;
  descricao: string;
  ordem: number;
  peso_percentual: number;
  concluida: boolean;
  data_conclusao?: string; // ISO Date
  foto_conclusao?: string; // URL
  responsavelId?: string;
}

export interface ChecklistEtapa {
  id: string;
  etapaId: string;
  titulo: string;
  concluido: boolean;
  foto?: string; // URL
  descricao_execucao?: string;
  data_conclusao?: string; // ISO Date
}

// --- END SISTEMA PROGRESSO ---

export interface Etapa {
  id: string;
  obraId: string;
  nome: string;
  ordem: number;
  peso_percentual: number;
  peso_editavel: boolean;
  concluida: boolean;
  percentual_concluido: number; // Calculated
}

export interface Subetapa {
  id: string;
  etapaId: string;
  nome: string;
  ordem: number;
  percentual_concluido: number; // Calculated
}

export interface TarefaAvancada {
  id: string;
  subetapaId: string;
  titulo: string;
  tipo: TipoTarefa;
  concluido: boolean;
  foto?: string;
  observacao?: string;
  data_conclusao?: string;
}

export interface HistoricoObra {
  id: string;
  obraId: string;
  usuarioId: string;
  usuarioNome: string;
  descricao: string;
  data: string;
  percentual_anterior: number;
  percentual_novo: number;
}

// Helper types for UI (Frontend only, not DB)
export interface ObraStats {
  gasto_total: number;
  saldo_restante: number; // Cash flow balance
  
  // Professional Margin Model
  custo_previsto_total: number;
  custo_a_concluir: number;
  margem_prevista: number; // Baseline margin
  margem: number; // Display margin (Projected if active, Real if finished)
  
  desvio: number; 
  execucao_financeira: number; // %
  progresso_medido: number; // % based on tasks or input
  previsao_ritmo: number; 
  alertas: string[];
  breakdown: {
    [key in CategoriaLancamento]: {
      orcado: number;
      gasto: number;
      restante: number;
      progresso: number;
    };
  };
  forecast: {
    dias_restantes: number;
    data_termino_estimada: string;
    lucro_projetado: number;
    ritmo_medio_diario: number;
    orcamento_consumido_pct: number;
    risco_geral: 'baixo' | 'medio' | 'alto';
  };
}

export type ViewState = 'HOME' | 'OBRAS' | 'OBRA_DETALHE' | 'RANKING' | 'PERFIL' | 'NOVA_OBRA' | 'RELATORIO_OBRA' | 'SINAIS_IMPORTANTES' | 'AVISOS' | 'USUARIOS';
