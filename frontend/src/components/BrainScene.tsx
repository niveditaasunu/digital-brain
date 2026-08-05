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
  onNeuronClick: (id: string) => void;
}

export default function BrainScene({
  neurons,
  connections,
  selectedId,
  fadedIds,
  connectSourceId,
  onNeuronClick,
}: Props) {
  const neuronById = new Map(neurons.map((n) => [n.id, n]));

  const neighborIds = new Set<string>();
  if (selectedId) {
    for (const c of connections) {
      if (c.source_id === selectedId) neighborIds.add(c.target_id);
      if (c.target_id === selectedId) neighborIds.add(c.source_id);
    }
  }

  return (
    <Canvas camera={{ position: [0, 0, 16], fov: 55 }}>
      <color attach="background" args={["#05060a"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <Stars radius={60} depth={40} count={2000} factor={2} fade speed={0.5} />

      {connections.map((c) => {
        const source = neuronById.get(c.source_id);
        const target = neuronById.get(c.target_id);
        if (!source || !target) return null;
        const isActive =
          selectedId !== null &&
          (c.source_id === selectedId || c.target_id === selectedId);
        const isFaded = fadedIds.has(c.source_id) || fadedIds.has(c.target_id);
        return (
          <ConnectionLine
            key={`${c.source_id}-${c.target_id}`}
            start={[source.x, source.y, source.z]}
            end={[target.x, target.y, target.z]}
            isActive={isActive}
            isFaded={isFaded}
          />
        );
      })}

      {neurons.map((n) => (
        <NeuronMesh
          key={n.id}
          neuron={n}
          isSelected={n.id === selectedId}
          isNeighbor={neighborIds.has(n.id)}
          isFaded={fadedIds.has(n.id)}
          isConnectSource={n.id === connectSourceId}
          onClick={onNeuronClick}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={40}
        autoRotate={!selectedId}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}
