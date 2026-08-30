import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";

import type {
  Connection,
  Neuron,
} from "../types";

export default function Insights() {
  const [neurons, setNeurons] =
    useState<Neuron[]>([]);

  const [connections, setConnections] =
    useState<Connection[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [neuronData, connectionData] =
          await Promise.all([
            api.listNeurons(),
            api.listConnections(),
          ]);

        setNeurons(neuronData);
        setConnections(connectionData);
      } catch (err) {
        console.error(err);

        setError(
          "Couldn't load your brain insights."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /*
   * Category statistics.
   */
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const neuron of neurons) {
      counts[neuron.category] =
        (counts[neuron.category] || 0) + 1;
    }

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [neurons]);

  /*
   * Neuron type statistics.
   */
  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const neuron of neurons) {
      counts[neuron.type] =
        (counts[neuron.type] || 0) + 1;
    }

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [neurons]);

  /*
   * Connection count for every neuron.
   */
  const connectionStats = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const neuron of neurons) {
      counts[neuron.id] = 0;
    }

    for (const connection of connections) {
      if (counts[connection.source_id] !== undefined) {
        counts[connection.source_id]++;
      }

      if (counts[connection.target_id] !== undefined) {
        counts[connection.target_id]++;
      }
    }

    return neurons
      .map((neuron) => ({
        neuron,
        connections:
          counts[neuron.id] || 0,
      }))
      .sort(
        (a, b) =>
          b.connections -
          a.connections
      );
  }, [neurons, connections]);

  /*
   * Recently created neurons.
   */
  const recentNeurons = useMemo(() => {
    return [...neurons]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [neurons]);

  /*
   * Growth by day.
   */
  const growthStats = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const neuron of neurons) {
      const date = new Date(
        neuron.created_at
      ).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      counts[date] =
        (counts[date] || 0) + 1;
    }

    return Object.entries(counts);
  }, [neurons]);

  const mostConnected =
    connectionStats[0];

  const mostUsedCategory =
    categoryStats[0];

  const mostUsedType =
    typeStats[0];

  return (
    <div className="min-h-screen bg-void text-white px-6 py-10 font-body">

      <div className="max-w-6xl mx-auto">

        {/* =============================== */}
        {/* HEADER */}
        {/* =============================== */}

        <div className="flex items-start justify-between mb-12">

          <div>

            <Link
              to="/brain"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ← Back to brain
            </Link>

            <h1 className="font-display text-4xl mt-5">
              Brain Insights
            </h1>

            <p className="text-white/40 text-sm mt-2">
              A look at how your personal brain is forming.
            </p>

          </div>

          <div className="flex gap-3">

            <Link
              to="/timeline"
              className="px-4 py-2 rounded-full border border-line text-sm text-white/50 hover:text-white hover:border-white/30 transition-colors"
            >
              Timeline
            </Link>

            <Link
              to="/brain"
              className="px-4 py-2 rounded-full bg-white/10 text-sm text-white/70 hover:bg-white/20 transition-colors"
            >
              Brain
            </Link>

          </div>

        </div>

        {/* =============================== */}
        {/* LOADING */}
        {/* =============================== */}

        {loading && (
          <div className="py-20 text-center text-white/40 font-mono text-sm">
            Reading your brain...
          </div>
        )}

        {/* =============================== */}
        {/* ERROR */}
        {/* =============================== */}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* =============================== */}
            {/* OVERVIEW */}
            {/* =============================== */}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              <InsightCard
                label="Neurons"
                value={neurons.length}
                description="Things stored in your brain"
              />

              <InsightCard
                label="Connections"
                value={connections.length}
                description="Relationships between ideas"
              />

              <InsightCard
                label="Top category"
                value={
                  mostUsedCategory
                    ? mostUsedCategory[0]
                    : "—"
                }
                description={
                  mostUsedCategory
                    ? `${mostUsedCategory[1]} neurons`
                    : "No data yet"
                }
              />

              <InsightCard
                label="Top neuron"
                value={
                  mostConnected
                    ? mostConnected.neuron.title
                    : "—"
                }
                description={
                  mostConnected
                    ? `${mostConnected.connections} connections`
                    : "No connections yet"
                }
              />

            </section>

            {/* =============================== */}
            {/* MAIN GRID */}
            {/* =============================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* CATEGORY */}
              <InsightSection title="Where your brain lives">

                {categoryStats.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">

                    {categoryStats.map(
                      ([category, count]) => {

                        const percentage =
                          neurons.length
                            ? Math.round(
                                (count /
                                  neurons.length) *
                                  100
                              )
                            : 0;

                        return (
                          <div key={category}>

                            <div className="flex justify-between mb-2">

                              <span className="text-sm text-white/70">
                                {category}
                              </span>

                              <span className="font-mono text-xs text-white/30">
                                {count}
                              </span>

                            </div>

                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-signal rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </InsightSection>

              {/* TYPES */}
              <InsightSection title="What makes up your brain">

                {typeStats.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-wrap gap-3">

                    {typeStats.map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="bg-white/5 border border-line rounded-xl px-4 py-3"
                        >

                          <div className="text-sm">
                            {type}
                          </div>

                          <div className="font-mono text-xs text-white/30 mt-1">
                            {count} neuron
                            {count !== 1
                              ? "s"
                              : ""}
                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </InsightSection>

              {/* CONNECTIONS */}
              <InsightSection title="Most connected">

                {connectionStats.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-3">

                    {connectionStats
                      .slice(0, 7)
                      .map(
                        ({
                          neuron,
                          connections,
                        }) => (
                          <div
                            key={neuron.id}
                            className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
                          >

                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  neuron.color,
                                boxShadow:
                                  `0 0 12px ${neuron.color}`,
                              }}
                            />

                            <div className="flex-1 min-w-0">

                              <div className="text-sm truncate">
                                {neuron.title}
                              </div>

                              <div className="text-[11px] text-white/30">
                                {neuron.type}
                              </div>

                            </div>

                            <div className="font-mono text-xs text-white/40">
                              {connections}
                            </div>

                          </div>
                        )
                      )}

                  </div>
                )}

              </InsightSection>

              {/* RECENT */}
              <InsightSection title="Recently added">

                {recentNeurons.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-3">

                    {recentNeurons.map(
                      (neuron) => (
                        <div
                          key={neuron.id}
                          className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
                        >

                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                neuron.color,
                              boxShadow:
                                `0 0 12px ${neuron.color}`,
                            }}
                          />

                          <div className="flex-1 min-w-0">

                            <div className="text-sm truncate">
                              {neuron.title}
                            </div>

                            <div className="text-[11px] text-white/30 mt-1">
                              {neuron.type}
                            </div>

                          </div>

                          <div className="font-mono text-[10px] text-white/25">
                            {new Date(
                              neuron.created_at
                            ).toLocaleDateString()}
                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </InsightSection>

            </div>

            {/* =============================== */}
            {/* GROWTH */}
            {/* =============================== */}

            <section className="mt-6">

              <InsightSection title="Brain growth">

                {growthStats.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex items-end gap-3 h-48">

                    {growthStats.map(
                      ([date, count]) => {

                        const max =
                          Math.max(
                            ...growthStats.map(
                              ([, value]) =>
                                value
                            )
                          );

                        const height =
                          max > 0
                            ? Math.max(
                                10,
                                (count /
                                  max) *
                                  100
                              )
                            : 10;

                        return (
                          <div
                            key={date}
                            className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                          >

                            <span className="font-mono text-[10px] text-white/30">
                              {count}
                            </span>

                            <div
                              className="w-full max-w-12 bg-signal/70 rounded-t-lg"
                              style={{
                                height: `${height}%`,
                              }}
                            />

                            <span className="font-mono text-[9px] text-white/20 whitespace-nowrap">
                              {date}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </InsightSection>

            </section>

            {/* =============================== */}
            {/* PERSONAL BRAIN SUMMARY */}
            {/* =============================== */}

            <section className="mt-6">

              <div className="bg-surface/60 border border-line rounded-2xl p-6">

                <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-3">
                  Brain snapshot
                </div>

                {neurons.length === 0 ? (
                  <p className="text-white/40 text-sm">
                    Your brain hasn't started forming yet.
                  </p>
                ) : (
                  <p className="text-white/60 text-sm leading-relaxed">

                    Your brain currently contains{" "}
                    <span className="text-white">
                      {neurons.length}
                    </span>{" "}
                    neuron
                    {neurons.length !== 1
                      ? "s"
                      : ""}{" "}
                    connected by{" "}
                    <span className="text-white">
                      {connections.length}
                    </span>{" "}
                    relationship
                    {connections.length !== 1
                      ? "s"
                      : ""}.

                    {mostUsedType && (
                      <>
                        {" "}
                        Your most common neuron type is{" "}
                        <span className="text-white">
                          {mostUsedType[0]}
                        </span>
                        .
                      </>
                    )}

                    {mostUsedCategory && (
                      <>
                        {" "}
                        Most of your stored thoughts currently live in{" "}
                        <span className="text-white">
                          {mostUsedCategory[0]}
                        </span>
                        .
                      </>
                    )}

                  </p>
                )}

              </div>

            </section>

          </>
        )}

      </div>
    </div>
  );
}

/*
 * Reusable insight card.
 */
function InsightCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="bg-surface/60 border border-line rounded-2xl p-5">

      <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">
        {label}
      </div>

      <div className="font-display text-2xl mt-3 truncate">
        {value}
      </div>

      <div className="text-xs text-white/30 mt-2">
        {description}
      </div>

    </div>
  );
}

/*
 * Reusable section.
 */
function InsightSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface/60 border border-line rounded-2xl p-6">

      <h2 className="font-display text-lg mb-6">
        {title}
      </h2>

      {children}

    </section>
  );
}

/*
 * Empty state.
 */
function EmptyState() {
  return (
    <div className="py-8 text-center text-white/25 text-sm">
      Nothing here yet.
    </div>
  );
}