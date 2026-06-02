export interface PCComponent {
  id: number;
  category: string;
  name: string;
  price: number;
  details?: Record<string, string | number>;
}

export interface CompatibilityResult {
  issues: string[];
}

const API_BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getComponents(params: { category?: string; search?: string; sort?: string } = {}): Promise<PCComponent[]> {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    );
    const qs = new URLSearchParams(filtered).toString();
    return request(`/api/components${qs ? `?${qs}` : ''}`);
  },

  getComponent(id: number): Promise<PCComponent> {
    return request(`/api/components/${id}`);
  },

  getCategories(): Promise<string[]> {
    return request('/api/categories');
  },

  getCategoryComponents(category: string): Promise<PCComponent[]> {
    return request(`/api/categories/${encodeURIComponent(category)}/components`);
  },

  checkCompatibility(parts: Record<string, PCComponent>): Promise<CompatibilityResult> {
    return request('/api/compatibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parts }),
    });
  },
};
