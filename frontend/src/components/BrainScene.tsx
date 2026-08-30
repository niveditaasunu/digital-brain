import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import NeuronMesh from "./NeuronMesh";
import ConnectionLine from "./ConnectionLine";
import type { Connection, Neuron } from "../types";

interface Props {
  neurons: Neuron[];
  connections: Connection[];
  selectedId: string | null;
  fadedIds: Set<string>;
  connectSourceId: string | null;

  // NEW
  selectedConnection: Connection | null;

  onNeuronClick: (id: string) => void;

  // NEW
  onConnectionClick: (connection: Connection) => void;
}

export default function BrainScene({
  neurons,
  connections,
  selectedId,
  fadedIds,
  connectSourceId,
  selectedConnection,
  onNeuronClick,
  onConnectionClick,
}: Props) {
  const neuronById = new Map(
    neurons.map((n) => [n.id, n])
  );

  const neighborIds = new Set<string>();

  if (selectedId) {
    for (const c of connections) {
      if (c.source_id === selectedId) {
        neighborIds.add(c.target_id);
      }

      if (c.target_id === selectedId) {
        neighborIds.add(c.source_id);
      }
    }
  }

  return (
    <Canvas
      camera={{
        position: [0, 0, 16],
        fov: 55,
      }}
    >
      <color
        attach="background"
        args={["#05060a"]}
      />

      <ambientLight intensity={0.4} />

      <pointLight
        position={[10, 10, 10]}
        intensity={0.6}
      />

      <Stars
        radius={60}
        depth={40}
        count={2000}
        factor={2}
        fade
        speed={0.5}
      />

      {/* ================================================== */}
      {/* CONNECTIONS */}
      {/* ================================================== */}

      {connections.map((connection) => {
        const source = neuronById.get(
          connection.source_id
        );

        const target = neuronById.get(
          connection.target_id
        );

        if (!source || !target) {
          return null;
        }

        const isActive =
          selectedId !== null &&
          (
            connection.source_id === selectedId ||
            connection.target_id === selectedId
          );

        const isFaded =
          fadedIds.has(connection.source_id) ||
          fadedIds.has(connection.target_id);

        const isSelected =
          selectedConnection !== null &&
          selectedConnection.source_id ===
            connection.source_id &&
          selectedConnection.target_id ===
            connection.target_id;

        return (
          <ConnectionLine
            key={`${connection.source_id}-${connection.target_id}`}
            start={[
              source.x,
              source.y,
              source.z,
            ]}
            end={[
              target.x,
              target.y,
              target.z,
            ]}
            isActive={isActive}
            isFaded={isFaded}
            isSelected={isSelected}
            onClick={() =>
              onConnectionClick(connection)
            }
          />
        );
      })}

      {/* ================================================== */}
      {/* NEURONS */}
      {/* ================================================== */}

      {neurons.map((neuron) => (
        <NeuronMesh
          key={neuron.id}
          neuron={neuron}
          isSelected={
            neuron.id === selectedId
          }
          isNeighbor={neighborIds.has(neuron.id)}
          isFaded={fadedIds.has(neuron.id)}
          isConnectSource={
            neuron.id === connectSourceId
          }
          onClick={onNeuronClick}
        />
      ))}

      {/* ================================================== */}
      {/* CAMERA CONTROLS */}
      {/* ================================================== */}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={40}
        autoRotate={!selectedId && !selectedConnection}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}