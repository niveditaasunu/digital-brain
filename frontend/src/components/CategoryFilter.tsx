import { ALL_CATEGORIES, CATEGORY_COLORS, type Category } from "../types";

interface Props {
  active: Category | null;
  onChange: (category: Category | null) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 font-mono text-xs">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full border transition-colors ${
          active === null ? "border-white text-white" : "border-line text-white/50 hover:text-white/80"
        }`}
      >
        All
      </button>
      {ALL_CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(active === c ? null : c)}
          className="px-3 py-1.5 rounded-full border transition-colors"
          style={{
            borderColor: active === c ? CATEGORY_COLORS[c] : "#1c2030",
            color: active === c ? CATEGORY_COLORS[c] : "rgba(255,255,255,0.5)",
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
