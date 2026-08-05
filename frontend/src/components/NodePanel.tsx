import { useEffect, useState } from "react";
import type { Category, Neuron } from "../types";
import { ALL_CATEGORIES, CATEGORY_COLORS } from "../types";

interface Props {
  neuron: Neuron;
  onClose: () => void;
  onSave: (id: string, patch: { title: string; description: string; category: Category; tags: string[] }) => void;
  onDelete: (id: string) => void;
  onStartConnection: (id: string) => void;
}

export default function NodePanel({ neuron, onClose, onSave, onDelete, onStartConnection }: Props) {
  const [title, setTitle] = useState(neuron.title);
  const [description, setDescription] = useState(neuron.description);
  const [category, setCategory] = useState<Category>(neuron.category);
  const [tagsInput, setTagsInput] = useState(neuron.tags.join(", "));
  const [editing, setEditing] = useState(false);

  // Reset local edit state whenever a different neuron is selected.
  useEffect(() => {
    setTitle(neuron.title);
    setDescription(neuron.description);
    setCategory(neuron.category);
    setTagsInput(neuron.tags.join(", "));
    setEditing(false);
  }, [neuron.id]);

  function handleSave() {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(neuron.id, { title, description, category, tags });
    setEditing(false);
  }

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-surface/95 backdrop-blur border-l border-line p-6 overflow-y-auto font-body">
      <div className="flex justify-between items-start mb-6">
        <span
          className="font-mono text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${CATEGORY_COLORS[category]}22`, color: CATEGORY_COLORS[category] }}
        >
          {category}
        </span>
        <button onClick={onClose} className="text-white/50 hover:text-white text-sm">
          Close
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Tags (comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-signal text-void rounded py-2 text-sm font-medium hover:bg-white transition-colors"
            >
              Save changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 rounded border border-line text-sm text-white/70 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <h2 className="font-display text-2xl">{neuron.title}</h2>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
            {neuron.description || "No description yet."}
          </p>
          {neuron.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {neuron.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs px-2 py-1 rounded bg-line/60 text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="font-mono text-[11px] text-white/30">
            Created {new Date(neuron.created_at).toLocaleDateString()}
          </p>

          <div className="flex flex-col gap-2 pt-4 border-t border-line">
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded py-2 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onStartConnection(neuron.id)}
              className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded py-2 text-sm"
            >
              Connect to another neuron
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${neuron.title}"? This also removes its connections.`)) {
                  onDelete(neuron.id);
                }
              }}
              className="w-full bg-red-500/10 hover:bg-red-500/20 transition-colors rounded py-2 text-sm text-red-400"
            >
              Delete neuron
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
