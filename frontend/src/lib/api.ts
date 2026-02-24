const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchApi(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { email: string; name: string; password: string; company_name?: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi('/auth/me'),

  // Emails
  listEmails: (params?: { category?: string; urgency?: string; is_read?: boolean; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.set(k, String(v));
      });
    }
    const qs = searchParams.toString();
    return fetchApi(`/emails/${qs ? `?${qs}` : ''}`);
  },
  getEmail: (id: string) => fetchApi(`/emails/${id}`),
  getEmailStats: () => fetchApi('/emails/stats/summary'),

  // Suggestions
  actionSuggestion: (id: string, action: string, editedText?: string) =>
    fetchApi(`/suggestions/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, edited_text: editedText }),
    }),
  sendSuggestion: (id: string) =>
    fetchApi(`/suggestions/${id}/send`, { method: 'POST' }),
  refineSuggestion: (id: string, prompt: string, currentText?: string) =>
    fetchApi(`/suggestions/${id}/refine`, {
      method: 'POST',
      body: JSON.stringify({ prompt, current_text: currentText }),
    }),

  // Templates
  listTemplates: () => fetchApi('/templates/'),
  createTemplate: (data: { name: string; category?: string; body: string }) =>
    fetchApi('/templates/', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: string, data: { name?: string; category?: string; body?: string }) =>
    fetchApi(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    fetchApi(`/templates/${id}`, { method: 'DELETE' }),

  // Knowledge
  listKnowledge: (entryType?: string) =>
    fetchApi(`/knowledge/${entryType ? `?entry_type=${entryType}` : ''}`),
  createKnowledge: (data: { entry_type: string; title: string; content: string }) =>
    fetchApi('/knowledge/', { method: 'POST', body: JSON.stringify(data) }),
  updateKnowledge: (id: string, data: { entry_type?: string; title?: string; content?: string }) =>
    fetchApi(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKnowledge: (id: string) =>
    fetchApi(`/knowledge/${id}`, { method: 'DELETE' }),

  // Accounts
  listAccounts: () => fetchApi('/webhooks/accounts'),
  connectGmail: () => fetchApi('/webhooks/gmail/connect'),
  connectOutlook: () => fetchApi('/webhooks/outlook/connect'),
  disconnectAccount: (id: string) =>
    fetchApi(`/webhooks/accounts/${id}`, { method: 'DELETE' }),
};
