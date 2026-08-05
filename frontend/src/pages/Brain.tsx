import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BrainScene from "../components/BrainScene";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import NodePanel from "../components/NodePanel";
import CreateNeuronModal from "../components/CreateNeuronModal";
import { api } from "../api/client";
import type { Category, Connection, Neuron, NeuronDraft } from "../types";

export default function Brain() {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

  async function refresh() {
    try {
      const [n, c] = await Promise.all([api.listNeurons(), api.listConnections()]);
      setNeurons(n);
      setConnections(c);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        "Couldn't reach the backend. Is the FastAPI server running on http://localhost:8000?"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Feature 8 + 9: search highlights matches and fades everything else;
  // filtering narrows to one category. Both compose together.
  const fadedIds = useMemo(() => {
    const faded = new Set<string>();
    const query = search.trim().toLowerCase();
    for (const n of neurons) {
      const matchesCategory = categoryFilter ? n.category === categoryFilter : true;
      const matchesSearch = query
        ? n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          n.tags.some((t) => t.toLowerCase().includes(query))
        : true;
      if (!matchesCategory || !matchesSearch) faded.add(n.id);
    }
    return faded;
  }, [neurons, search, categoryFilter]);

  async function handleCreate(draft: NeuronDraft) {
    const created = await api.createNeuron(draft);
    setNeurons((prev) => [created, ...prev]);
    setShowCreate(false);
  }

  async function handleSave(
    id: string,
    patch: { title: string; description: string; category: Category; tags: string[] }
  ) {
    const updated = await api.updateNeuron(id, patch);
    setNeurons((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }

  async function handleDelete(id: string) {
    await api.deleteNeuron(id);
    setNeurons((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.source_id !== id && c.target_id !== id));
    setSelectedId(null);
  }

  async function handleNeuronClick(id: string) {
    if (connectSourceId) {
      if (connectSourceId !== id) {
        const conn = await api.createConnection(connectSourceId, id);
        setConnections((prev) => [...prev, conn]);
      }
      setConnectSourceId(null);
      return;
    }
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const selectedNeuron = neurons.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="relative h-screen w-screen bg-void overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-white/40 text-sm z-10">
          Loading your brain...
        </div>
      )}

      {loadError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg z-20 font-body">
          {loadError}
        </div>
      )}

      <BrainScene
        neurons={neurons}
        connections={connections}
        selectedId={selectedId}
        fadedIds={fadedIds}
        connectSourceId={connectSourceId}
        onNeuronClick={handleNeuronClick}
      />

      {/* Top bar */}
      <div className="absolute top-6 left-6 right-6 flex flex-wrap items-start justify-between gap-4 pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto">
          <Link to="/" className="font-display text-lg text-white/80 hover:text-white w-fit">
            Digital Brain
          </Link>
          <CategoryFilter active={categoryFilter} onChange={setCategoryFilter} />
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <SearchBar value={search} onChange={setSearch} />
          <button
            onClick={() => setShowCreate(true)}
            className="bg-signal text-void rounded-full w-9 h-9 flex items-center justify-center text-xl font-medium hover:bg-white transition-colors"
            title="Create neuron"
          >
            +
          </button>
        </div>
      </div>

      {connectSourceId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 border border-signal/40 text-signal text-sm px-4 py-2 rounded-full font-body">
          Click another neuron to connect it — click empty space to cancel
        </div>
      )}

      {selectedNeuron && (
        <NodePanel
          neuron={selectedNeuron}
          onClose={() => setSelectedId(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          onStartConnection={(id) => {
            setConnectSourceId(id);
            setSelectedId(null);
          }}
        />
      )}

      {showCreate && (
        <CreateNeuronModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
