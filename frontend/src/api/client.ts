import {
  Material,
  MaterialInput,
  MaterialUpdateInput,
  Member,
  MemberInput,
  MemberUpdateInput
} from '../types';

const defaultBaseUrl = 'http://127.0.0.1:8000';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  async listMembers(): Promise<Member[]> {
    return request<Member[]>('/members');
  },
  async createMember(payload: MemberInput): Promise<Member> {
    return request<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateMember(memberId: number, payload: MemberUpdateInput): Promise<Member> {
    return request<Member>(`/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteMember(memberId: number): Promise<void> {
    await request<void>(`/members/${memberId}`, {
      method: 'DELETE'
    });
  },
  async listMaterials(): Promise<Material[]> {
    return request<Material[]>('/materials');
  },
  async createMaterial(payload: MaterialInput): Promise<Material> {
    return request<Material>('/materials', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateMaterial(materialId: number, payload: MaterialUpdateInput): Promise<Material> {
    return request<Material>(`/materials/${materialId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteMaterial(materialId: number): Promise<void> {
    await request<void>(`/materials/${materialId}`, {
      method: 'DELETE'
    });
  }
};
