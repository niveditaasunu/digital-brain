import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Signature element: a single firing neuron, pulse rings radiating
          outward — the idea of the whole product compressed into one motif. */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-10">
        <span className="pulse-ring absolute inline-block w-10 h-10 rounded-full border border-signal/60" />
        <span className="pulse-ring pulse-ring-delay absolute inline-block w-10 h-10 rounded-full border border-signal/60" />
        <span className="core-glow relative inline-block w-4 h-4 rounded-full bg-signal" />
      </div>

      <h1 className="font-display text-5xl md:text-6xl font-medium tracking-tight text-white">
        Digital Brain
      </h1>
      <p className="font-body text-white/60 mt-4 max-w-md text-lg">
        Store your ideas like your brain stores memories.
      </p>

      <button
        onClick={() => navigate("/login")}
        className="mt-10 font-body px-7 py-3 rounded-full bg-signal text-void font-medium hover:bg-white transition-colors"
      >
        Enter Brain
      </button>

      <a
        href="https://github.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-8 font-mono text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        View on GitHub &rarr;
      </a>

      <p className="absolute bottom-6 font-mono text-[11px] text-white/30 max-w-sm">
        Every idea is a neuron. Every relationship is a synapse.
      </p>
    </div>
  );
}
