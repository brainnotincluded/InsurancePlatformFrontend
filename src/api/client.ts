const BASE = '/api/v1';

export interface User {
  id: number;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  patronymic: string | null;
  balance: string;
  pending_balance: string;
  referral_code: string | null;
  status: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Chat {
  id: string;
  type: string;
  last_message_at: string | null;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'user' | 'support' | 'system';
  kind: 'message' | 'file';
  body: string | null;
  file: { file_id: string; name: string; mime: string; size: number; url: string } | null;
  client_msg_id: string | null;
  created_at: string;
}

export interface TemplatePhrase {
  id: number;
  scope: string;
  text: string;
  sort_order: number;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    const msg = typeof detail === 'string' ? detail : `Ошибка ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export const api = {
  // auth
  requestCode: (phone: string) =>
    request<{ message: string }>('/auth/request-code/', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  register: (payload: {
    phone: string; code: string; email: string; password: string;
    first_name?: string; last_name?: string; referral_code: string;
  }) =>
    request<TokenResponse>('/auth/register/', { method: 'POST', body: JSON.stringify(payload) }),
  login: (phone: string, code: string, password: string) =>
    request<TokenResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ phone, code, password }),
    }),
  logout: (refreshToken: string) =>
    request<{ message: string }>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  // chats
  listChats: (token: string) => request<Chat[]>('/chats/', {}, token),
  openChat: (type: 'main' | 'bonus', token: string) =>
    request<Chat>('/chats/', { method: 'POST', body: JSON.stringify({ type }) }, token),
  listMessages: (chatId: string, token: string) =>
    request<{ messages: ChatMessage[]; next_cursor: string | null }>(
      `/chats/${chatId}/messages/?limit=100`, {}, token),
  sendMessage: (chatId: string, body: string, token: string, clientMsgId?: string) =>
    request<ChatMessage>(
      `/chats/${chatId}/messages/`,
      { method: 'POST', body: JSON.stringify({ body, client_msg_id: clientMsgId ?? null }) },
      token),
  deleteMessage: (chatId: string, messageId: string, token: string) =>
    request<void>(`/chats/${chatId}/messages/${messageId}/`, { method: 'DELETE' }, token),

  // templates
  listTemplates: (scope: 'user' | 'bonus' | 'support' = 'user') =>
    request<TemplatePhrase[]>(`/templates/?scope=${scope}`),

  // support (manager)
  supportLogin: (login: string, password: string) =>
    request<{ access_token: string; expires_in: number }>('/support/login/', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),
  supportListChats: (token: string) =>
    request<{ chats: SupportChatItem[]; next_cursor: string | null }>(
      '/support/chats/?include_empty=true', {}, token),

  // me / referrals / applications
  getMe: (token: string) => request<User>('/me/', {}, token),
  getBalance: (token: string) =>
    request<{ balance: string; pending_balance: string }>('/referrals/me/balance/', {}, token),
  getStructure: (token: string) =>
    request<{ referral_code: string; referral_link: string; total: number; levels: { level: number; count: number }[] }>(
      '/referrals/me/structure/', {}, token),
  getStructureList: (token: string) =>
    request<{ levels: Record<string, StructureMember[]> }>('/referrals/me/structure/list/', {}, token),
  getAccruals: (token: string) =>
    request<Accrual[]>('/referrals/me/accruals/', {}, token),
  listApplications: (token: string) =>
    request<Application[]>('/applications/', {}, token),
  createApplication: (product: string, token: string) =>
    request<Application>('/applications/', { method: 'POST', body: JSON.stringify({ product }) }, token),
};

export interface SupportChatItem {
  id: string;
  type: string;
  owner: { id: number; phone: string | null; first_name: string | null; last_name: string | null };
  last_message_at: string | null;
}

export interface StructureMember {
  id: number;
  name: string;
  joined_at: string;
  structure_count: number;
  status: string;
}

export interface Accrual {
  id: number;
  source_user_id: number;
  level: number;
  percent: string;
  base_amount: string;
  amount: string;
  status: string;
  created_at: string;
  available_at: string;
  credited_at: string | null;
}

export interface Application {
  id: string;
  user_id: number;
  chat_id: string | null;
  product: string;
  status: string;
  manager_comment: string | null;
  created_at: string;
  updated_at: string;
}

export { ApiError };
