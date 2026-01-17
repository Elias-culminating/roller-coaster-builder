import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";

export function Sky() {
  const { isNightMode } = useRollerCoaster();

  // ---------- AI ENHANCEMENTS ----------
  const sunRef = useRef<any>(null);
  const sunTime = useRef(0);
  const cloudRefs = useRef<any[]>([]);

  useFrame((_, delta) => {
    if (!isNightMode) {
      sunTime.current += delta * 0.1;

      // Sun moves in a smooth arc
      if (sunRef.current) {
        sunRef.current.position.x = Math.sin(sunTime.current) * 80;
        sunRef.current.position.y = 40 + Math.cos(sunTime.current) * 20;
      }

      // Clouds drift
      cloudRefs.current.forEach((cloud) => {
        if (cloud) {
          cloud.position.x += delta * 2;
          if (cloud.position.x > 120) cloud.position.x = -120;
        }
      });
    }
  });

  // ---------- ORIGINAL TEACHER DATA ----------
  const parkLights = useMemo(() => {
    const lights: { x: number; z: number; height: number; color: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 60 + (i * 7) % 100;
      lights.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 8 + (i % 4),
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF69B4", "#00CED1", "#FFFFFF"][i % 6]
      });
    }
    return lights;
  }, []);

  const stars = useMemo(() => {
    const s: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < 100; i++) {
      s.push({
        x: (i * 17 % 500) - 250,
        y: 60 + (i * 13 % 50),
        z: (i * 23 % 500) - 250,
        size: 0.15 + (i % 3) * 0.05
      });
    }
    return s;
  }, []);

  const ferrisWheel = useMemo(() => {
    const spokes: { angle: number; color: string }[] = [];
    for (let i = 0; i < 12; i++) {
      spokes.push({
        angle: (i / 12) * Math.PI * 2,
        color: ["#FF0000", "#FFFF00", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF"][i % 6]
      });
    }
    return spokes;
  }, []);

  // ---------- NIGHT MODE ----------
  if (isNightMode) {
    return (
      <>
        <color attach="background" args={["#101025"]} />
        <fog attach="fog" args={["#101025", 150, 500]} />

        <ambientLight intensity={0.4} color="#6688cc" />
        <directionalLight position={[50, 50, 25]} intensity={0.5} color="#8899bb" />

        <pointLight position={[0, 30, 0]} intensity={2} color="#FFFFFF" distance={150} />
        <pointLight position={[100, 40, -80]} intensity={1.5} color="#FF88FF" distance={100} />
        <pointLight position={[-80, 35, 60]} intensity={1.5} color="#FFAA44" distance={100} />

        <mesh position={[-60, 45, -80]}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color="#FFFFEE" />
        </mesh>

        {stars.map((star, i) => (
          <mesh key={i} position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[star.size, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}

        {parkLights.map((light, i) => (
          <group key={`post-${i}`} position={[light.x, 0, light.z]}>
            <mesh position={[0, light.height / 2, 0]}>
              <cylinderGeometry args={[0.15, 0.2, light.height, 6]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            <mesh position={[0, light.height + 0.5, 0]}>
              <sphereGeometry args={[0.8, 12, 12]} />
              <meshBasicMaterial color={light.color} />
            </mesh>
          </group>
        ))}

        <group position={[120, 0, -100]}>
          <mesh position={[0, 22, 0]}>
            <cylinderGeometry args={[1, 1.5, 44, 8]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          <mesh position={[0, 28, 0]}>
            <torusGeometry args={[18, 0.6, 8, 32]} />
            <meshBasicMaterial color="#FF00FF" />
          </mesh>
          {ferrisWheel.map((spoke, i) => (
            <mesh key={i} position={[Math.cos(spoke.angle) * 18, 28 + Math.sin(spoke.angle) * 18, 0]}>
              <boxGeometry args={[3, 3, 3]} />
              <meshBasicMaterial color={spoke.color} />
            </mesh>
          ))}
        </group>
      </>
    );
  }

  // ---------- DAY MODE ----------
  return (
    <>
      <color attach="background" args={["#BFDFFF"]} />
      <fog attach="fog" args={["#BFDFFF", 120, 450]} />

      {/* Animated Sun */}
      <mesh ref={sunRef} position={[0, 40, -50]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#FFF2AA" />
      </mesh>

      {/* Drifting Clouds */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group
          key={i}
          ref={(el) => (cloudRefs.current[i] = el)}
          position={[-100 + i * 40, 50 + (i % 2) * 5, -50 + i * 20]}
        >
          <mesh>
            <sphereGeometry args={[6, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[6, 0, 0]}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-6, 0, 0]}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {/* AI-Enhanced daytime ambient */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[60, 60, 30]} intensity={1.1} />
      <hemisphereLight args={["#CFE9FF", "#3A7D44", 0.35]} />
    </>
  );
}
