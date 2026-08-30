import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrainScene from "../components/BrainScene";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import NodePanel from "../components/NodePanel";
import CreateNeuronModal from "../components/CreateNeuronModal";

import { api } from "../api/client";

import type {
  Category,
  Connection,
  Neuron,
  NeuronDraft,
} from "../types";

export default function Brain() {
  const navigate = useNavigate();

  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<Category | null>(null);

  const [showCreate, setShowCreate] = useState(false);

  const [connectSourceId, setConnectSourceId] =
    useState<string | null>(null);

  // Connection selected for deletion
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null);

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  function handleLogout() {
    // Remove JWT token from browser storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    // Return to login page
    navigate("/login");
  }

  /*
   * ============================================================
   * LOAD BRAIN
   * ============================================================
   */

  async function refresh() {
    try {
      setLoading(true);

      const [neuronsData, connectionsData] =
        await Promise.all([
          api.listNeurons(),
          api.listConnections(),
        ]);

      setNeurons(neuronsData);
      setConnections(connectionsData);
      setLoadError(null);
    } catch (err) {
      console.error(err);

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

  /*
   * ============================================================
   * SEARCH + CATEGORY FILTER
   * ============================================================
   */

  const fadedIds = useMemo(() => {
    const faded = new Set<string>();

    const query = search.trim().toLowerCase();

    for (const neuron of neurons) {
      const matchesCategory = categoryFilter
        ? neuron.category === categoryFilter
        : true;

      const matchesSearch = query
        ? neuron.title.toLowerCase().includes(query) ||
          neuron.description.toLowerCase().includes(query) ||
          neuron.tags.some((tag) =>
            tag.toLowerCase().includes(query)
          ) ||
          neuron.type.toLowerCase().includes(query)
        : true;

      if (!matchesCategory || !matchesSearch) {
        faded.add(neuron.id);
      }
    }

    return faded;
  }, [neurons, search, categoryFilter]);

  /*
   * ============================================================
   * CREATE NEURON
   * ============================================================
   */

  async function handleCreate(draft: NeuronDraft) {
    try {
      const created = await api.createNeuron(draft);

      setNeurons((prev) => [created, ...prev]);
      setShowCreate(false);
    } catch (err) {
      console.error(err);
      alert("Couldn't create neuron.");
    }
  }

  /*
   * ============================================================
   * EDIT NEURON
   * ============================================================
   */

  async function handleSave(
    id: string,
    patch: {
      title: string;
      description: string;
      category: Category;
      tags: string[];
    }
  ) {
    try {
      const updated = await api.updateNeuron(id, patch);

      setNeurons((prev) =>
        prev.map((neuron) =>
          neuron.id === id ? updated : neuron
        )
      );
    } catch (err) {
      console.error(err);
      alert("Couldn't save changes.");
    }
  }

  /*
   * ============================================================
   * DELETE NEURON
   * ============================================================
   */

  async function handleDelete(id: string) {
    try {
      await api.deleteNeuron(id);

      setNeurons((prev) =>
        prev.filter((neuron) => neuron.id !== id)
      );

      setConnections((prev) =>
        prev.filter(
          (connection) =>
            connection.source_id !== id &&
            connection.target_id !== id
        )
      );

      setSelectedId(null);
      setConnectSourceId(null);
      setSelectedConnection(null);
    } catch (err) {
      console.error(err);
      alert("Couldn't delete neuron.");
    }
  }

  /*
   * ============================================================
   * NEURON CLICK
   * ============================================================
   */

  async function handleNeuronClick(id: string) {
    setSelectedConnection(null);

    /*
     * CONNECTION CREATION MODE
     */

    if (connectSourceId) {
      if (connectSourceId === id) {
        setConnectSourceId(null);
        return;
      }

      try {
        const connection = await api.createConnection(
          connectSourceId,
          id
        );

        setConnections((prev) => {
          const alreadyExists = prev.some(
            (existing) =>
              existing.source_id === connection.source_id &&
              existing.target_id === connection.target_id
          );

          if (alreadyExists) {
            return prev;
          }

          return [...prev, connection];
        });

        setConnectSourceId(null);
      } catch (err) {
        console.error(err);
        alert("Couldn't create connection.");
        setConnectSourceId(null);
      }

      return;
    }

    /*
     * NORMAL MODE
     */

    setSelectedId((previous) =>
      previous === id ? null : id
    );
  }

  /*
   * ============================================================
   * START CONNECTION MODE
   * ============================================================
   */

  function handleStartConnection(id: string) {
    setSelectedId(null);
    setSelectedConnection(null);
    setConnectSourceId(id);
  }

  /*
   * ============================================================
   * CANCEL CONNECTION MODE
   * ============================================================
   */

  function handleCancelConnection() {
    setConnectSourceId(null);
  }

  /*
   * ============================================================
   * SELECT CONNECTION
   * ============================================================
   */

  function handleConnectionClick(
    connection: Connection
  ) {
    // Don't interfere with connection creation
    if (connectSourceId) {
      return;
    }

    setSelectedId(null);

    setSelectedConnection((previous) => {
      if (
        previous &&
        previous.source_id === connection.source_id &&
        previous.target_id === connection.target_id
      ) {
        return null;
      }

      return connection;
    });
  }

  /*
   * ============================================================
   * DELETE CONNECTION
   * ============================================================
   */

  async function handleDeleteConnection() {
    if (!selectedConnection) {
      return;
    }

    const connection = selectedConnection;

    try {
      await api.deleteConnection(
        connection.source_id,
        connection.target_id
      );

      setConnections((prev) =>
        prev.filter(
          (c) =>
            !(
              c.source_id === connection.source_id &&
              c.target_id === connection.target_id
            )
        )
      );

      setSelectedConnection(null);
    } catch (err) {
      console.error(err);
      alert("Couldn't delete connection.");
    }
  }

  /*
   * ============================================================
   * SELECTED NEURON
   * ============================================================
   */

  const selectedNeuron =
    neurons.find(
      (neuron) => neuron.id === selectedId
    ) ?? null;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      className="relative h-screen w-screen bg-void overflow-hidden"
      onPointerMissed={() => {
        if (connectSourceId) {
          handleCancelConnection();
        }

        if (selectedConnection) {
          setSelectedConnection(null);
        }
      }}
    >
      {/* ===================================================== */}
      {/* LOADING */}
      {/* ===================================================== */}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-white/40 text-sm z-10 pointer-events-none">
          Loading your brain...
        </div>
      )}

      {/* ===================================================== */}
      {/* BACKEND ERROR */}
      {/* ===================================================== */}

      {loadError && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg z-30 font-body">
          {loadError}
        </div>
      )}

      {/* ===================================================== */}
      {/* 3D BRAIN */}
      {/* ===================================================== */}

      <BrainScene
        neurons={neurons}
        connections={connections}
        selectedId={selectedId}
        fadedIds={fadedIds}
        connectSourceId={connectSourceId}
        selectedConnection={selectedConnection}
        onNeuronClick={handleNeuronClick}
        onConnectionClick={handleConnectionClick}
      />

      {/* ===================================================== */}
      {/* TOP BAR */}
      {/* ===================================================== */}

      <div className="absolute top-6 left-6 right-6 flex flex-wrap items-start justify-between gap-4 pointer-events-none">

        {/* LEFT SIDE */}

        <div className="flex flex-col gap-3 pointer-events-auto">

          {/* Digital Brain + Timeline */}

          <div className="flex items-center gap-4">

            <Link
              to="/"
              className="font-display text-lg text-white/80 hover:text-white transition-colors"
            >
              Digital Brain
            </Link>

            <Link
              to="/timeline"
              className="font-mono text-xs text-white/40 hover:text-white transition-colors"
            >
              Timeline
            </Link>

          </div>

          {/* Category filter */}

          <CategoryFilter
            active={categoryFilter}
            onChange={setCategoryFilter}
          />

        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3 pointer-events-auto">

          <SearchBar
            value={search}
            onChange={setSearch}
          />

          {/* Create neuron */}

          <button
            onClick={() => setShowCreate(true)}
            className="bg-signal text-void rounded-full w-9 h-9 flex items-center justify-center text-xl font-medium hover:bg-white transition-colors"
            title="Create neuron"
          >
            +
          </button>

          {/* ================================================= */}
          {/* LOGOUT BUTTON */}
          {/* ================================================= */}

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-white/10 bg-surface/80 text-white/50 text-xs font-mono hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
            title="Logout"
          >
            Logout
          </button>

        </div>
      </div>

      {/* ===================================================== */}
      {/* CONNECTION DELETE CONTROL */}
      {/* ===================================================== */}

      {selectedConnection && !connectSourceId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur border border-red-400/30 rounded-xl px-4 py-3 z-30 shadow-[0_0_30px_rgba(0,0,0,0.4)]">

          <div className="flex items-center gap-4">

            <div className="font-mono text-xs text-white/50">
              Connection selected
            </div>

            <button
              onClick={handleDeleteConnection}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs hover:bg-red-500/25 hover:text-red-200 transition-colors"
            >
              Delete connection
            </button>

            <button
              onClick={() =>
                setSelectedConnection(null)
              }
              className="text-white/30 hover:text-white text-xs transition-colors"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* ===================================================== */}
      {/* CONNECTION MODE MESSAGE */}
      {/* ===================================================== */}

      {connectSourceId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur border border-signal/40 text-signal text-sm px-4 py-2 rounded-full font-body z-20">

          Click another neuron to connect it

          <button
            onClick={handleCancelConnection}
            className="ml-3 text-white/40 hover:text-white transition-colors"
          >
            Cancel
          </button>

        </div>
      )}

      {/* ===================================================== */}
      {/* SELECTED NEURON PANEL */}
      {/* ===================================================== */}

      {selectedNeuron && (
        <NodePanel
          neuron={selectedNeuron}
          onClose={() => setSelectedId(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          onStartConnection={handleStartConnection}
        />
      )}

      {/* ===================================================== */}
      {/* CREATE NEURON MODAL */}
      {/* ===================================================== */}

      {showCreate && (
        <CreateNeuronModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

    </div>
  );
}