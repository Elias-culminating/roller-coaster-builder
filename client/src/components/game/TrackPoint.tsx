import { useRef, useState, useEffect } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";

interface TrackPointProps {
  id: string;
  position: THREE.Vector3;
  index: number;
}

export function TrackPoint({ id, position, index }: TrackPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedPointId, selectPoint, updateTrackPoint, mode } = useRollerCoaster();
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();
  
  const isSelected = selectedPointId === id;
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || mode !== "build") return;
      
      const deltaY = e.movementY * -0.05;
      const newY = Math.max(0.5, position.y + deltaY);
      
      const newPos = new THREE.Vector3(position.x, newY, position.z);
      updateTrackPoint(id, newPos);
    };
    
    const handlePointerUp = () => {
      setIsDragging(false);
    };
    
    gl.domElement.addEventListener("pointermove", handlePointerMove);
    gl.domElement.addEventListener("pointerup", handlePointerUp);
    
    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
      gl.domElement.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, id, position, updateTrackPoint, mode, gl.domElement]);
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode !== "build") return;
    e.stopPropagation();
    setIsDragging(true);
    selectPoint(id);
  };
  
  if (mode === "ride") return null;
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#ff6600" : hovered ? "#ffaa00" : "#4488ff"}
          emissive={isSelected ? "#ff3300" : hovered ? "#ff6600" : "#000000"}
          emissiveIntensity={0.3}
        />
      </mesh>
      <sprite position={[position.x, position.y + 1, position.z]} scale={[0.8, 0.4, 1]}>
        <spriteMaterial color="white" opacity={0.8} transparent />
      </sprite>
    </group>
  );
}
