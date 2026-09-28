const API_BASE = 'http://localhost:5000/api';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
}

export interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  overdue: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  errors?: { field: string; message: string }[];
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  sort?: string;
  order?: string;
}

class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];
  constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Unable to connect to the server. Please ensure the backend is running.', 0);
    }
    throw new ApiError('An unexpected error occurred.', 500);
  }
}

export const api = {
  /** GET /api/tasks — list with optional filters */
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.order) params.set('order', filters.order);
    const qs = params.toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  /** GET /api/tasks/stats */
  async getStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/tasks/stats');
  },

  /** GET /api/tasks/:id */
  async getTask(id: number): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  },

  /** POST /api/tasks */
  async createTask(data: TaskFormData): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** PUT /api/tasks/:id */
  async updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** DELETE /api/tasks/:id */
  async deleteTask(id: number): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  /** GET /api/health */
  async healthCheck(): Promise<{ message: string; timestamp: string }> {
    return request<{ message: string; timestamp: string }>('/health');
  },
};
