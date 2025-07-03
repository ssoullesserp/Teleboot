export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Bot {
  id: string;
  user_id: number;
  name: string;
  description?: string;
  telegram_token?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotFlow {
  id: string;
  bot_id: string;
  name: string;
  description?: string;
  flow_data: Flow;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  flow_data: Flow;
  is_public: boolean;
  created_by?: number;
  created_at: string;
}

// React Flow types
export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface Flow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export enum NodeType {
  START = 'start',
  MESSAGE = 'message',
  QUESTION = 'question',
  CONDITION = 'condition',
  ACTION = 'action',
  END = 'end'
}

export interface NodeData {
  label: string;
  content?: string;
  options?: string[];
  conditions?: Condition[];
  actions?: Action[];
}

export interface Condition {
  type: 'equals' | 'contains' | 'regex';
  value: string;
  target: string;
}

export interface Action {
  type: 'send_message' | 'save_data' | 'call_webhook';
  parameters: Record<string, any>;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateBotRequest {
  name: string;
  description?: string;
  telegram_token?: string;
}

export interface UpdateBotRequest {
  name?: string;
  description?: string;
  telegram_token?: string;
  is_active?: boolean;
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  flow_data: Flow;
  is_main?: boolean;
}

export interface UpdateFlowRequest {
  name?: string;
  description?: string;
  flow_data?: Flow;
  is_main?: boolean;
}

export interface ApiError {
  error: string;
}