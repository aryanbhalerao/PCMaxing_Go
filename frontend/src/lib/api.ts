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

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PopularBuild {
  id: number;
  name: string;
  description: string;
  parts: Array<{category: string; name: string; price: number}>;
  total_price: number;
  tier: string;
}

export interface SavedBuild {
  id: string;
  name: string;
  parts: Record<string, any>;
  total_price: number;
  is_public: boolean;
  created_at: string;
}

export interface BuildHistoryEntry {
  id: string;
  parts: Record<string, any>;
  total_price: number;
  created_at: string;
}

const API_BASE = '';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options?.headers || {})
  };
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) errorMsg = body.error;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  
  // Return void for empty responses like 204
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
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

  signup(email: string, username: string, password: string): Promise<AuthResponse> {
    return request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  logout(): Promise<void> {
    return request('/api/auth/logout', { method: 'POST' });
  },

  getMe(): Promise<User> {
    return request('/api/auth/me');
  },

  getPopularBuilds(): Promise<PopularBuild[]> {
    return request('/api/builds/popular');
  },

  getSavedBuilds(): Promise<SavedBuild[]> {
    return request('/api/builds/saved');
  },

  saveBuild(name: string, parts: Record<string, any>, totalPrice: number, isPublic: boolean): Promise<SavedBuild> {
    return request('/api/builds/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parts, total_price: totalPrice, is_public: isPublic }),
    });
  },

  deleteSavedBuild(id: string): Promise<void> {
    return request(`/api/builds/saved/${id}`, { method: 'DELETE' });
  },

  getBuildHistory(): Promise<BuildHistoryEntry[]> {
    return request('/api/builds/history');
  },

  addBuildHistory(parts: Record<string, any>, totalPrice: number): Promise<void> {
    return request('/api/builds/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parts, total_price: totalPrice }),
    });
  },

  getFavourites(): Promise<number[]> {
    return request('/api/favourites');
  },

  addFavourite(componentId: number): Promise<void> {
    return request('/api/favourites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ component_id: componentId }),
    });
  },

  removeFavourite(componentId: number): Promise<void> {
    return request(`/api/favourites/${componentId}`, { method: 'DELETE' });
  },
};
