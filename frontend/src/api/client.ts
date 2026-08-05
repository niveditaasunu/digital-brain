import type { Connection, Neuron, NeuronDraft } from "../types";

// In dev, Vite proxies nothing by default, so we hit the FastAPI server
// directly. Change this if you deploy the backend somewhere else.
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listNeurons: (params?: { category?: string; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return request<Neuron[]>(`/api/neurons${qs ? `?${qs}` : ""}`);
  },

  createNeuron: (draft: NeuronDraft) =>
    request<Neuron>("/api/neurons", {
      method: "POST",
      body: JSON.stringify(draft),
    }),

  updateNeuron: (id: string, patch: Partial<NeuronDraft>) =>
    request<Neuron>(`/api/neurons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteNeuron: (id: string) =>
    request<void>(`/api/neurons/${id}`, { method: "DELETE" }),

  listConnections: () => request<Connection[]>("/api/connections"),

  createConnection: (source_id: string, target_id: string) =>
    request<Connection>("/api/connections", {
      method: "POST",
      body: JSON.stringify({ source_id, target_id }),
    }),

  deleteConnection: (source_id: string, target_id: string) =>
    request<void>(
      `/api/connections?source_id=${encodeURIComponent(source_id)}&target_id=${encodeURIComponent(target_id)}`,
      { method: "DELETE" }
    ),
};
