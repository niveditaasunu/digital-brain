export type Category =
  | "Projects"
  | "Learning"
  | "Research"
  | "Personal"
  | "Important";

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

// Types of things that can exist in a personal brain.
export type NeuronType =
  | "Person"
  | "Emotion"
  | "Thought"
  | "Idea"
  | "Memory"
  | "Experience"
  | "Goal"
  | "Interest"
  | "Knowledge"
  | "Opinion"
  | "Custom";

export const ALL_NEURON_TYPES: NeuronType[] = [
  "Person",
  "Emotion",
  "Thought",
  "Idea",
  "Memory",
  "Experience",
  "Goal",
  "Interest",
  "Knowledge",
  "Opinion",
  "Custom",
];

export interface Neuron {
  id: string;

  title: string;
  description: string;

  // What kind of thing this neuron represents.
  type: NeuronType;

  // Why the user decided to create this neuron.
  why_created: string;

  category: Category;
  tags: string[];
  color: string;

  created_at: string;

  // 3D position.
  x: number;
  y: number;
  z: number;
}

export interface Connection {
  source_id: string;
  target_id: string;
  created_at: string;
}

export interface NeuronDraft {
  title: string;
  description: string;

  type: NeuronType;

  why_created: string;

  category: Category;
  tags: string[];
  color: string;
}