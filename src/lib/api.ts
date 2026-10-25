const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('inkloom_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; token_type: string; user: { id: string; name: string; email: string; role: string } }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(init?.headers ?? {}) },
    ...init,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export interface BackendBrandRule {
  id: string
  name: string
  category: string
  description: string
  rule_text: string | null
  severity: string
  status: string
}

export interface BackendReviewFinding {
  id: string
  review_id: string
  brand_rule_id: string | null
  category: string
  severity: string
  original_excerpt: string
  explanation: string
  suggested_correction: string | null
  status: string
}

export interface BackendReview {
  id: string
  content_item_id: string
  content_revision_id: string
  analysis_type: string
  analysis_mode: string
  model_name: string | null
  request_id: string | null
  score: number | null
  status: string
  analyzed_at: string
  created_by_id: string
  findings: BackendReviewFinding[]
}

export interface BackendContent {
  id: string
  title: string
  content_type: string
  current_content: string
  created_by_id: string
  current_revision_number: number
}

export const contentApi = {
  create: (payload: { title: string; content_type: string; content: string; created_by: string }) =>
    request<BackendContent>('/api/v1/content', { method: 'POST', body: JSON.stringify(payload) }),
}

export const reviewsApi = {
  create: (contentId: string, createdBy: string) =>
    request<BackendReview>(`/api/v1/content/${contentId}/reviews`, { method: 'POST', body: JSON.stringify({ content_item_id: contentId, created_by: createdBy }) }),
  get: (reviewId: string) => request<BackendReview>(`/api/v1/reviews/${reviewId}`),
  updateFinding: (findingId: string, status: string) =>
    request<BackendReviewFinding>(`/api/v1/findings/${findingId}?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  suggestCorrection: (reviewId: string, findingId: string, originalExcerpt: string) =>
    request<{ suggested_correction: string; rationale: string }>(`/api/v1/reviews/${reviewId}/findings/${findingId}/suggest-correction`, {
      method: 'POST',
      body: JSON.stringify({ finding_id: findingId, original_excerpt: originalExcerpt }),
    }),
}

export const aiApi = {
  status: () => request<{ enabled: boolean; provider: string; model: string; credentials_configured: boolean; mode: string }>('/api/v1/ai/status'),
}

export const brandRulesApi = {
  list: () => request<BackendBrandRule[]>('/api/v1/brand-rules'),
  create: (payload: Omit<BackendBrandRule, 'id' | 'rule_text'> & { rule_text?: string | null }) =>
    request<BackendBrandRule>('/api/v1/brand-rules', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<BackendBrandRule>) =>
    request<BackendBrandRule>(`/api/v1/brand-rules/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/api/v1/brand-rules/${id}`, { method: 'DELETE' }),
}