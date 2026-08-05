import { useState, type FormEvent } from "react";
import { ALL_CATEGORIES, type Category, type NeuronDraft } from "../types";

interface Props {
  onClose: () => void;
  onCreate: (draft: NeuronDraft) => void;
}

export default function CreateNeuronModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Projects");
  const [tagsInput, setTagsInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onCreate({ title: title.trim(), description, category, tags });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-line rounded-2xl p-6 w-full max-w-md font-body"
      >
        <h2 className="font-display text-xl mb-5">New neuron</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ROS2"
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Robot middleware"
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
              placeholder="ROS2, LiDAR, Python"
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="flex-1 bg-signal text-void rounded py-2 text-sm font-medium hover:bg-white transition-colors"
          >
            Create neuron
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 rounded border border-line text-sm text-white/70 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
