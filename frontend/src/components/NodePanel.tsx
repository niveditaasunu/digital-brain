import { useEffect, useState } from "react";
import type {
  Category,
  Neuron,
  NeuronType,
} from "../types";
import {
  ALL_CATEGORIES,
  ALL_NEURON_TYPES,
  CATEGORY_COLORS,
} from "../types";

interface Props {
  neuron: Neuron;
  onClose: () => void;
  onSave: (
    id: string,
    patch: {
      title: string;
      description: string;
      type: NeuronType;
      why_created: string;
      category: Category;
      tags: string[];
      color: string;
    }
  ) => void;
  onDelete: (id: string) => void;
  onStartConnection: (id: string) => void;
}

export default function NodePanel({
  neuron,
  onClose,
  onSave,
  onDelete,
  onStartConnection,
}: Props) {
  const [title, setTitle] = useState(neuron.title);
  const [description, setDescription] = useState(
    neuron.description
  );
  const [type, setType] = useState<NeuronType>(neuron.type);
  const [whyCreated, setWhyCreated] = useState(
    neuron.why_created
  );
  const [category, setCategory] = useState<Category>(
    neuron.category
  );
  const [tagsInput, setTagsInput] = useState(
    neuron.tags.join(", ")
  );
  const [color, setColor] = useState(neuron.color);
  const [editing, setEditing] = useState(false);

  // Reset edit state when another neuron is selected.
  useEffect(() => {
    setTitle(neuron.title);
    setDescription(neuron.description);
    setType(neuron.type);
    setWhyCreated(neuron.why_created);
    setCategory(neuron.category);
    setTagsInput(neuron.tags.join(", "));
    setColor(neuron.color);
    setEditing(false);
  }, [neuron.id]);

  function handleCategoryChange(
    newCategory: Category
  ) {
    setCategory(newCategory);

    // Only automatically change the colour when
    // selecting a category while editing.
    setColor(CATEGORY_COLORS[newCategory]);
  }

  function handleSave() {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave(neuron.id, {
      title: title.trim(),
      description,
      type,
      why_created: whyCreated,
      category,
      tags,
      color,
    });

    setEditing(false);
  }

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-surface/95 backdrop-blur border-l border-line p-6 overflow-y-auto font-body">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-2">
          {/* Type */}
          <span
            className="font-mono text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${color}22`,
              color: color,
            }}
          >
            {type}
          </span>

          {/* Category */}
          <span
            className="font-mono text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${CATEGORY_COLORS[category]}22`,
              color: CATEGORY_COLORS[category],
            }}
          >
            {category}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-white/50 hover:text-white text-sm"
        >
          Close
        </button>
      </div>

      {editing ? (
        /* ================= EDIT MODE ================= */
        <div className="space-y-4">

          {/* Type */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as NeuronType)
              }
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            >
              {ALL_NEURON_TYPES.map((neuronType) => (
                <option
                  key={neuronType}
                  value={neuronType}
                >
                  {neuronType}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={4}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Why created */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Why did you create this neuron?
            </label>

            <textarea
              value={whyCreated}
              onChange={(e) =>
                setWhyCreated(e.target.value)
              }
              rows={3}
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                handleCategoryChange(
                  e.target.value as Category
                )
              }
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              Tags (comma-separated)
            </label>

            <input
              value={tagsInput}
              onChange={(e) =>
                setTagsInput(e.target.value)
              }
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Colour */}
          <div>
            <label className="block text-xs text-white/50 mb-2">
              Neuron colour
            </label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) =>
                  setColor(e.target.value)
                }
                className="w-12 h-10 rounded cursor-pointer bg-void border border-line"
              />

              <div
                className="flex-1 h-10 rounded border border-line"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 18px ${color}`,
                }}
              />

              <span className="text-xs text-white/50 font-mono">
                {color}
              </span>
            </div>
          </div>

          {/* Save / Cancel */}
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
        /* ================= VIEW MODE ================= */
        <div className="space-y-5">

          {/* Title */}
          <h2 className="font-display text-2xl">
            {neuron.title}
          </h2>

          {/* Type */}
          <div>
            <p className="text-xs text-white/30 mb-1">
              Type
            </p>

            <p
              className="text-sm font-medium"
              style={{ color: color }}
            >
              {type}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-white/30 mb-1">
              About
            </p>

            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
              {neuron.description ||
                "No description yet."}
            </p>
          </div>

          {/* Why created */}
          {neuron.why_created && (
            <div className="border-l-2 border-line pl-3">
              <p className="text-xs text-white/30 mb-1">
                Why I created this
              </p>

              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {neuron.why_created}
              </p>
            </div>
          )}

          {/* Tags */}
          {neuron.tags.length > 0 && (
            <div>
              <p className="text-xs text-white/30 mb-2">
                Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {neuron.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-2 py-1 rounded bg-line/60 text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Created */}
          <p className="font-mono text-[11px] text-white/30">
            Created{" "}
            {new Date(
              neuron.created_at
            ).toLocaleDateString()}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-line">

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded py-2 text-sm"
            >
              Edit
            </button>

            <button
              onClick={() =>
                onStartConnection(neuron.id)
              }
              className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded py-2 text-sm"
            >
              Connect to another neuron
            </button>

            <button
              onClick={() => {
                if (
                  confirm(
                    `Delete "${neuron.title}"? This also removes its connections.`
                  )
                ) {
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