import { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";
import { TrackPoint } from "./TrackPoint";
import { Track } from "./Track";

export function TrackBuilder() {
  const { trackPoints, addTrackPoint, mode, selectPoint } = useRollerCoaster();
  const planeRef = useRef<THREE.Mesh>(null);
  const [previewHeight, setPreviewHeight] = useState(5);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<THREE.Vector3 | null>(null);
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode !== "build") return;
    e.stopPropagation();
    
    selectPoint(null);
    
    const point = e.point.clone();
    point.y = previewHeight;
    
    setDragStartPos(point.clone());
    setIsDraggingNew(true);
  };
  
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingNew || !dragStartPos || mode !== "build") return;
    
    const deltaY = (e.point.z - dragStartPos.z) * -0.5;
    const newHeight = Math.max(1, previewHeight + deltaY);
    setPreviewHeight(newHeight);
    dragStartPos.y = newHeight;
  };
  
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingNew || mode !== "build") return;
    
    const point = e.point.clone();
    point.y = previewHeight;
    
    addTrackPoint(point);
    console.log("Added track point at:", point);
    
    setIsDraggingNew(false);
    setDragStartPos(null);
  };
  
  return (
    <group>
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <Track />
      
      {trackPoints.map((point, index) => (
        <TrackPoint
          key={point.id}
          id={point.id}
          position={point.position}
          index={index}
        />
      ))}
      
      {isDraggingNew && dragStartPos && (
        <mesh position={dragStartPos}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}
