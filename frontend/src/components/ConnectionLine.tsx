import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  start: [number, number, number];
  end: [number, number, number];
  isFaded: boolean;
  isActive: boolean; // touches the selected/hovered neuron
}

export default function ConnectionLine({ start, end, isFaded, isActive }: Props) {
  // drei's <Line> takes a material ref via userData workaround isn't
  // needed here — we animate opacity through React state-driven props
  // by wrapping in a group and mutating the material each frame.
  const matRef = useRef<any>(null);

  useFrame((state) => {
    if (!matRef.current) return;
    const pulse = 0.15 * Math.sin(state.clock.elapsedTime * 2.5);
    const base = isFaded ? 0.08 : isActive ? 0.9 : 0.35;
    matRef.current.opacity = Math.max(0.05, base + (isActive ? pulse : 0));
  });

  return (
    <Line
      points={[start, end]}
      color={isActive ? "#7dd3fc" : "#3b4160"}
      lineWidth={isActive ? 2 : 1}
      transparent
      onUpdate={(self: any) => {
        matRef.current = self.material;
      }}
    />
  );
}
