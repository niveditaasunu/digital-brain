import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Neuron } from "../types";

interface Props {
  neuron: Neuron;
  isSelected: boolean;
  isNeighbor: boolean; // true if connected to the currently-selected neuron
  isFaded: boolean; // true if search/filter excludes it
  isConnectSource: boolean; // true if this neuron is the pending source of a new connection
  onClick: (id: string) => void;
}

export default function NeuronMesh({
  neuron,
  isSelected,
  isNeighbor,
  isFaded,
  isConnectSource,
  onClick,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Feature 10: hover/click makes the neuron and its neighbors glow, and
  // the camera-facing label appears. Nothing here is static.
  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale =
      hovered || isSelected ? 1.35 : isNeighbor ? 1.12 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.15
    );

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const baseIntensity = isFaded ? 0.15 : 0.8;
    const activeBoost = hovered || isSelected ? 1.2 : isNeighbor ? 0.5 : 0;
    const pulse = 0.15 * Math.sin(state.clock.elapsedTime * 2 + neuron.x);
    material.emissiveIntensity = baseIntensity + activeBoost + pulse;
    material.opacity = isFaded ? 0.25 : 1;
  });

  return (
    <group position={[neuron.x, neuron.y, neuron.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(neuron.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={neuron.color}
          emissive={neuron.color}
          emissiveIntensity={0.8}
          transparent
          opacity={1}
        />
      </mesh>

      {isConnectSource && (
        <mesh>
          <ringGeometry args={[0.5, 0.58, 32]} />
          <meshBasicMaterial color="#7dd3fc" side={THREE.DoubleSide} />
        </mesh>
      )}

      {(hovered || isSelected) && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.28}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#05060a"
        >
          {neuron.title}
        </Text>
      )}
    </group>
  );
}
