import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Neuron } from "../types";

interface Props {
  neuron: Neuron;
  isSelected: boolean;
  isNeighbor: boolean;
  isFaded: boolean;
  isConnectSource: boolean;
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
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!coreRef.current || !glowRef.current) return;

    const time = state.clock.elapsedTime;

    const active = hovered || isSelected;

    const targetScale = active
      ? 1.35
      : isNeighbor
      ? 1.15
      : 1;

    coreRef.current.scale.lerp(
      new THREE.Vector3(
        targetScale,
        targetScale,
        targetScale
      ),
      0.12
    );

    /*
     * Neon breathing effect
     */
    const pulse =
      0.35 *
      Math.sin(
        time * 3 + neuron.x + neuron.y
      );

    const material =
      coreRef.current.material as THREE.MeshStandardMaterial;

    material.emissiveIntensity =
      isFaded
        ? 0.15
        : active
        ? 3.5 + pulse
        : isNeighbor
        ? 2.4 + pulse
        : 1.8 + pulse * 0.4;

    material.opacity = isFaded ? 0.18 : 1;

    /*
     * Outer glow
     */
    const glowPulse =
      1 +
      0.12 *
        Math.sin(
          time * 2 +
            neuron.z
        );

    const glowScale =
      (active
        ? 1.5
        : isNeighbor
        ? 1.25
        : 1) * glowPulse;

    glowRef.current.scale.set(
      glowScale,
      glowScale,
      glowScale
    );

    const glowMaterial =
      glowRef.current.material as THREE.MeshBasicMaterial;

    glowMaterial.opacity =
      isFaded
        ? 0.01
        : active
        ? 0.3
        : isNeighbor
        ? 0.18
        : 0.09;

    /*
     * Rotating selection ring
     */
    if (ringRef.current) {
      ringRef.current.rotation.z =
        time * 1.2;

      ringRef.current.rotation.x =
        Math.sin(time * 0.8) * 0.3;
    }
  });

  return (
    <group
      position={[
        neuron.x,
        neuron.y,
        neuron.z,
      ]}
    >

      {/* ================================================== */}
      {/* LARGE NEON AURA */}
      {/* ================================================== */}

      <mesh ref={glowRef}>
        <sphereGeometry
          args={[0.9, 32, 32]}
        />

        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>

      {/* ================================================== */}
      {/* INNER NEON AURA */}
      {/* ================================================== */}

      <mesh>
        <sphereGeometry
          args={[0.55, 32, 32]}
        />

        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={
            isFaded
              ? 0.01
              : 0.2
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>

      {/* ================================================== */}
      {/* MAIN NEON CORE */}
      {/* ================================================== */}

      <mesh
        ref={coreRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(neuron.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();

          setHovered(true);

          document.body.style.cursor =
            "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);

          document.body.style.cursor =
            "default";
        }}
      >
        <icosahedronGeometry
          args={[0.32, 3]}
        />

        <meshStandardMaterial
          color={neuron.color}
          emissive={neuron.color}
          emissiveIntensity={2}
          roughness={0.15}
          metalness={0.35}
          transparent
          opacity={1}
        />
      </mesh>

      {/* ================================================== */}
      {/* ORBITING PARTICLES */}
      {/* ================================================== */}

      {!isFaded && (
        <>
          <mesh
            position={[
              0.42,
              0.08,
              0.05,
            ]}
          >
            <sphereGeometry
              args={[0.035, 8, 8]}
            />

            <meshBasicMaterial
              color={neuron.color}
              transparent
              opacity={0.9}
              depthWrite={false}
              blending={
                THREE.AdditiveBlending
              }
            />
          </mesh>

          <mesh
            position={[
              -0.35,
              0.2,
              -0.1,
            ]}
          >
            <sphereGeometry
              args={[0.025, 8, 8]}
            />

            <meshBasicMaterial
              color={neuron.color}
              transparent
              opacity={0.85}
              depthWrite={false}
              blending={
                THREE.AdditiveBlending
              }
            />
          </mesh>

          <mesh
            position={[
              0.05,
              -0.42,
              0.12,
            ]}
          >
            <sphereGeometry
              args={[0.03, 8, 8]}
            />

            <meshBasicMaterial
              color={neuron.color}
              transparent
              opacity={0.85}
              depthWrite={false}
              blending={
                THREE.AdditiveBlending
              }
            />
          </mesh>
        </>
      )}

      {/* ================================================== */}
      {/* SELECTED NEURON RINGS */}
      {/* ================================================== */}

      {isSelected && (
        <>
          <mesh
            ref={ringRef}
            rotation={[
              Math.PI / 2,
              0,
              0,
            ]}
          >
            <torusGeometry
              args={[
                0.62,
                0.025,
                8,
                48,
              ]}
            />

            <meshBasicMaterial
              color={neuron.color}
              transparent
              opacity={0.95}
              depthWrite={false}
              blending={
                THREE.AdditiveBlending
              }
            />
          </mesh>

          <mesh
            rotation={[
              0,
              Math.PI / 2,
              0,
            ]}
          >
            <torusGeometry
              args={[
                0.75,
                0.015,
                8,
                48,
              ]}
            />

            <meshBasicMaterial
              color={neuron.color}
              transparent
              opacity={0.55}
              depthWrite={false}
              blending={
                THREE.AdditiveBlending
              }
            />
          </mesh>
        </>
      )}

      {/* ================================================== */}
      {/* CONNECTION SOURCE */}
      {/* ================================================== */}

      {isConnectSource && (
        <mesh
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >
          <ringGeometry
            args={[
              0.52,
              0.65,
              48,
            ]}
          />

          <meshBasicMaterial
            color="#ffffff"
            side={THREE.DoubleSide}
            transparent
            opacity={1}
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
          />
        </mesh>
      )}

      {/* ================================================== */}
      {/* LABEL */}
      {/* ================================================== */}

      {(hovered || isSelected) && (
        <Text
          position={[
            0,
            0.72,
            0,
          ]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.035}
          outlineColor="#05060a"
        >
          {neuron.title}
        </Text>
      )}
    </group>
  );
}