import { useState, type FormEvent } from "react";
import {
  ALL_CATEGORIES,
  ALL_NEURON_TYPES,
  CATEGORY_COLORS,
  type Category,
  type NeuronDraft,
  type NeuronType,
} from "../types";

interface Props {
  onClose: () => void;
  onCreate: (draft: NeuronDraft) => void;
}

export default function CreateNeuronModal({
  onClose,
  onCreate,
}: Props) {
  const [type, setType] = useState<NeuronType>("Person");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whyCreated, setWhyCreated] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [tagsInput, setTagsInput] = useState("");
  const [color, setColor] = useState(
    CATEGORY_COLORS.Personal
  );

  function handleCategoryChange(newCategory: Category) {
    setCategory(newCategory);
    setColor(CATEGORY_COLORS[newCategory]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onCreate({
      title: title.trim(),
      description,
      type,
      why_created: whyCreated,
      category,
      tags,
      color,
    });
  }

  function getTitleLabel() {
    switch (type) {
      case "Person":
        return "Name";

      case "Emotion":
        return "Emotion";

      case "Memory":
        return "Memory";

      case "Experience":
        return "Experience";

      case "Goal":
        return "Goal";

      case "Interest":
        return "Interest";

      case "Knowledge":
        return "Topic";

      case "Opinion":
        return "Topic";

      case "Idea":
        return "Idea";

      case "Thought":
        return "Thought";

      default:
        return "Title";
    }
  }

  function getDescriptionLabel() {
    switch (type) {
      case "Person":
        return "What do you think about them?";

      case "Emotion":
        return "What caused it?";

      case "Memory":
        return "What happened?";

      case "Experience":
        return "What happened?";

      case "Goal":
        return "What do you want to achieve?";

      case "Interest":
        return "What about it interests you?";

      case "Knowledge":
        return "What did you learn?";

      case "Opinion":
        return "What do you think?";

      case "Idea":
        return "What is it about?";

      case "Thought":
        return "What is it about?";

      default:
        return "Description";
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-line rounded-2xl p-6 w-full max-w-md font-body max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display text-xl mb-5">
          New neuron
        </h2>

        <div className="space-y-4">

          {/* Type */}
          <div>
            <label className="block text-xs text-white/50 mb-1">
              What is this neuron?
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
              {getTitleLabel()}
            </label>

            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "Person"
                  ? "e.g. Alex"
                  : "e.g. My new thought"
              }
              className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Person relationship */}
          {type === "Person" && (
            <div>
              <label className="block text-xs text-white/50 mb-1">
                What is your relationship with them?
              </label>

              <input
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="e.g. Friend, classmate, family"
                className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* Description */}
          {type !== "Person" && (
            <div>
              <label className="block text-xs text-white/50 mb-1">
                {getDescriptionLabel()}
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={3}
                placeholder="Write something..."
                className="w-full bg-void border border-line rounded px-3 py-2 text-sm"
              />
            </div>
          )}

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
              placeholder="What made you want to remember this?"
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
              placeholder="e.g. college, friendship"
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
                title="Choose neuron colour"
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
        </div>

        {/* Buttons */}
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