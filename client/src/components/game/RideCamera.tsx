import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";
import { getTrackCurve } from "./Track";

export function RideCamera() {
  const { camera } = useThree();
  const { trackPoints, isRiding, rideProgress, setRideProgress, rideSpeed, stopRide } = useRollerCoaster();
  
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const previousCameraPos = useRef(new THREE.Vector3());
  const previousLookAt = useRef(new THREE.Vector3());
  
  useEffect(() => {
    curveRef.current = getTrackCurve(trackPoints);
  }, [trackPoints]);
  
  useFrame((_, delta) => {
    if (!isRiding || !curveRef.current) return;
    
    const curve = curveRef.current;
    const curveLength = curve.getLength();
    
    const currentPoint = curve.getPoint(rideProgress);
    const tangent = curve.getTangent(rideProgress);
    
    const slope = tangent.y;
    const baseSpeed = rideSpeed;
    const gravityEffect = -slope * 0.5;
    const speed = Math.max(0.05, baseSpeed + gravityEffect);
    
    const progressDelta = (speed * delta) / curveLength;
    let newProgress = rideProgress + progressDelta;
    
    if (newProgress >= 1) {
      stopRide();
      return;
    }
    
    setRideProgress(newProgress);
    
    const position = curve.getPoint(newProgress);
    const lookAheadT = Math.min(newProgress + 0.02, 1);
    const lookAtPoint = curve.getPoint(lookAheadT);
    
    const binormal = new THREE.Vector3();
    const normal = new THREE.Vector3(0, 1, 0);
    binormal.crossVectors(tangent, normal).normalize();
    
    const cameraHeight = 1.5;
    const cameraOffset = normal.clone().multiplyScalar(cameraHeight);
    
    const targetCameraPos = position.clone().add(cameraOffset);
    const targetLookAt = lookAtPoint.clone().add(cameraOffset.clone().multiplyScalar(0.5));
    
    previousCameraPos.current.lerp(targetCameraPos, 0.1);
    previousLookAt.current.lerp(targetLookAt, 0.1);
    
    camera.position.copy(previousCameraPos.current);
    camera.lookAt(previousLookAt.current);
  });
  
  return null;
}
