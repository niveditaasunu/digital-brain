interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      className="font-body w-64 bg-surface/90 backdrop-blur border border-line rounded-full px-4 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-signal"
    />
  );
}
