import type { Submission, SubmissionCreate, SubmissionReview, AuditEvent, HealthCheck } from './types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function getErrorDetail(errorText: string) {
  try {
    const parsed = JSON.parse(errorText);
    return typeof parsed.detail === 'string' ? parsed.detail : errorText;
  } catch {
    return errorText;
  }
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const detail = getErrorDetail(errorText);
      throw new Error(`Request failed (${response.status}): ${detail}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<HealthCheck> {
    return this.request<HealthCheck>('/api/health');
  }

  async getSubmissions(): Promise<Submission[]> {
    return this.request<Submission[]>('/api/submissions');
  }

  async getSubmission(id: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}`);
  }

  async createSubmission(data: SubmissionCreate): Promise<Submission> {
    return this.request<Submission>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async extractSubmission(id: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}/extract`, {
      method: 'POST',
    });
  }

  async reviewSubmission(id: string, data: SubmissionReview): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async approveSubmission(id: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}/approve`, {
      method: 'POST',
    });
  }

  async syncCrm(id: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${id}/crm-sync`, {
      method: 'POST',
    });
  }

  async getAuditLog(id: string): Promise<AuditEvent[]> {
    return this.request<AuditEvent[]>(`/api/submissions/${id}/audit`);
  }
}

export const api = new ApiClient();
