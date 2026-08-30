import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Neuron } from "../types";

export default function Timeline() {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNeurons() {
      try {
        const data = await api.listNeurons();
        setNeurons(data);
      } catch {
        setError("Couldn't load your brain timeline.");
      } finally {
        setLoading(false);
      }
    }

    loadNeurons();
  }, []);

  const groupedNeurons = useMemo(() => {
    const groups: Record<string, Neuron[]> = {};

    for (const neuron of neurons) {
      const date = new Date(neuron.created_at);

      const key = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(neuron);
    }

    return Object.entries(groups);
  }, [neurons]);

  return (
    <div className="min-h-screen bg-void text-white px-6 py-10 font-body">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link
              to="/brain"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ← Back to brain
            </Link>

            <h1 className="font-display text-3xl mt-4">
              Brain Timeline
            </h1>

            <p className="text-white/40 text-sm mt-2">
              Watch your brain evolve over time.
            </p>
          </div>

          <div className="font-mono text-xs text-white/30">
            {neurons.length} neurons
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-white/40 text-sm font-mono">
            Loading your timeline...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && neurons.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">◌</div>

            <h2 className="font-display text-xl">
              Your timeline is empty
            </h2>

            <p className="text-white/40 text-sm mt-2">
              Create your first neuron to start building your timeline.
            </p>
          </div>
        )}

        {/* Timeline */}
        {!loading && !error && groupedNeurons.length > 0 && (
          <div className="relative">

            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

            <div className="space-y-12">
              {groupedNeurons.map(([date, dayNeurons]) => (
                <section key={date}>

                  {/* Date */}
                  <div className="relative flex items-center gap-4 mb-5">
                    <div className="relative z-10 w-[15px] h-[15px] rounded-full bg-signal shadow-[0_0_12px_rgba(255,255,255,0.25)]" />

                    <h2 className="font-display text-lg text-white/90">
                      {date}
                    </h2>
                  </div>

                  {/* Neurons */}
                  <div className="ml-8 space-y-3">
                    {dayNeurons.map((neuron) => (
                      <div
                        key={neuron.id}
                        className="group relative bg-surface/70 border border-line rounded-xl p-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start gap-4">

                          {/* Neuron colour */}
                          <div
                            className="mt-1 w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: neuron.color,
                              boxShadow: `0 0 12px ${neuron.color}`,
                            }}
                          />

                          <div className="min-w-0 flex-1">

                            {/* Title */}
                            <h3 className="font-display text-base">
                              {neuron.title}
                            </h3>

                            {/* Type + category */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-[11px] font-mono text-white/50 bg-white/5 px-2 py-1 rounded-full">
                                {neuron.type}
                              </span>

                              <span className="text-[11px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded-full">
                                {neuron.category}
                              </span>
                            </div>

                            {/* Description */}
                            {neuron.description && (
                              <p className="text-sm text-white/50 mt-3 leading-relaxed">
                                {neuron.description}
                              </p>
                            )}

                            {/* Why created */}
                            {neuron.why_created && (
                              <p className="text-xs text-white/30 mt-3 leading-relaxed">
                                <span className="text-white/40">
                                  Why:
                                </span>{" "}
                                {neuron.why_created}
                              </p>
                            )}

                            {/* Time */}
                            <p className="font-mono text-[10px] text-white/25 mt-3">
                              {new Date(
                                neuron.created_at
                              ).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}