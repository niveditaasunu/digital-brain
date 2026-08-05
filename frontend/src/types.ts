export type Category = "Projects" | "Learning" | "Research" | "Personal" | "Important";

export const CATEGORY_COLORS: Record<Category, string> = {
  Projects: "#22c55e",
  Learning: "#3b82f6",
  Research: "#a855f7",
  Personal: "#f97316",
  Important: "#ef4444",
};

export const ALL_CATEGORIES: Category[] = [
  "Projects",
  "Learning",
  "Research",
  "Personal",
  "Important",
];

export interface Neuron {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  color: string;
  created_at: string;
  x: number;
  y: number;
  z: number;
}

export interface Connection {
  source_id: string;
  target_id: string;
}

export interface NeuronDraft {
  title: string;
  description: string;
  category: Category;
  tags: string[];
}
