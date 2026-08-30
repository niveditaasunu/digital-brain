import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  start: [number, number, number];
  end: [number, number, number];
  isFaded: boolean;
  isActive: boolean;

  // NEW
  isSelected: boolean;
  onClick: () => void;
}

export default function ConnectionLine({
  start,
  end,
  isFaded,
  isActive,
  isSelected,
  onClick,
}: Props) {
  const pulseRef =
    useRef<THREE.Mesh>(null);

  const { curve } = useMemo(() => {
    const startPoint =
      new THREE.Vector3(...start);

    const endPoint =
      new THREE.Vector3(...end);

    const direction =
      endPoint
        .clone()
        .sub(startPoint);

    const midpoint =
      startPoint
        .clone()
        .add(endPoint)
        .multiplyScalar(0.5);

    /*
     * Slight curve so connections
     * don't look like rigid straight wires.
     */
    const perpendicular =
      new THREE.Vector3(
        -direction.y,
        direction.x,
        direction.z * 0.25
      );

    if (perpendicular.length() > 0) {
      perpendicular.normalize();
    }

    const distance =
      direction.length();

    midpoint.add(
      perpendicular.multiplyScalar(
        Math.min(
          distance * 0.15,
          1.2
        )
      )
    );

    const curve =
      new THREE.CatmullRomCurve3([
        startPoint,
        midpoint,
        endPoint,
      ]);

    return { curve };
  }, [start, end]);

  /*
   * Animated electrical signal.
   */
  useFrame((state) => {
    if (!pulseRef.current) {
      return;
    }

    if (isFaded) {
      pulseRef.current.visible = false;
      return;
    }

    pulseRef.current.visible = true;

    const time =
      state.clock.elapsedTime;

    const speed =
      isActive || isSelected
        ? 0.75
        : 0.35;

    const progress =
      (time * speed) % 1;

    const position =
      curve.getPoint(progress);

    pulseRef.current.position.copy(
      position
    );

    const pulseScale =
      isActive || isSelected
        ? 1 +
          0.3 *
            Math.sin(time * 10)
        : 1 +
          0.15 *
            Math.sin(time * 6);

    pulseRef.current.scale.setScalar(
      pulseScale
    );
  });

  /*
   * Faded connections during
   * search/filter.
   */
  if (isFaded) {
    return (
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <tubeGeometry
          args={[
            curve,
            24,
            0.025,
            8,
            false,
          ]}
        />

        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.02}
        />
      </mesh>
    );
  }

  return (
    <group>
      {/* ================================================== */}
      {/* CLICKABLE HIT AREA */}
      {/* ================================================== */}

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <tubeGeometry
          args={[
            curve,
            32,
            0.16,
            8,
            false,
          ]}
        />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* ================================================== */}
      {/* LARGE NEON OUTER GLOW */}
      {/* ================================================== */}

      <mesh
        raycast={() => null}
      >
        <tubeGeometry
          args={[
            curve,
            32,
            isSelected
              ? 0.24
              : isActive
              ? 0.18
              : 0.11,
            12,
            false,
          ]}
        />

        <meshBasicMaterial
          color={
            isSelected
              ? "#ff4d8d"
              : isActive
              ? "#00e5ff"
              : "#3657ff"
          }
          transparent
          opacity={
            isSelected
              ? 0.3
              : isActive
              ? 0.2
              : 0.08
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>

      {/* ================================================== */}
      {/* MAIN NEON SYNAPSE */}
      {/* ================================================== */}

      <mesh
        raycast={() => null}
      >
        <tubeGeometry
          args={[
            curve,
            32,
            isSelected
              ? 0.075
              : isActive
              ? 0.065
              : 0.045,
            12,
            false,
          ]}
        />

        <meshStandardMaterial
          color={
            isSelected
              ? "#ff7aa8"
              : isActive
              ? "#67e8f9"
              : "#4f7cff"
          }
          emissive={
            isSelected
              ? "#ff2f7d"
              : isActive
              ? "#00e5ff"
              : "#3157ff"
          }
          emissiveIntensity={
            isSelected
              ? 5
              : isActive
              ? 4
              : 1.8
          }
          transparent
          opacity={
            isSelected
              ? 1
              : isActive
              ? 1
              : 0.7
          }
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* ================================================== */}
      {/* MOVING ELECTRICAL SIGNAL */}
      {/* ================================================== */}

      <mesh
        ref={pulseRef}
        raycast={() => null}
      >
        <sphereGeometry
          args={[
            isSelected
              ? 0.15
              : isActive
              ? 0.13
              : 0.08,
            16,
            16,
          ]}
        />

        <meshBasicMaterial
          color={
            isSelected
              ? "#ffffff"
              : isActive
              ? "#ffffff"
              : "#00e5ff"
          }
          transparent
          opacity={
            isSelected
              ? 1
              : isActive
              ? 1
              : 0.85
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>

      {/* ================================================== */}
      {/* SIGNAL AURA */}
      {/* ================================================== */}

      <mesh
        position={[
          start[0],
          start[1],
          start[2],
        ]}
        raycast={() => null}
      >
        <sphereGeometry
          args={[
            isSelected
              ? 0.28
              : isActive
              ? 0.22
              : 0.13,
            12,
            12,
          ]}
        />

        <meshBasicMaterial
          color={
            isSelected
              ? "#ff4d8d"
              : "#00e5ff"
          }
          transparent
          opacity={
            isSelected
              ? 0.12
              : 0.08
          }
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>
    </group>
  );
}