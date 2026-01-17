import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import "@fontsource/inter";
import { Ground } from "./components/game/Ground";
import { TrackBuilder } from "./components/game/TrackBuilder";
import { BuildCamera } from "./components/game/BuildCamera";
import { RideCamera } from "./components/game/RideCamera";
import { Sky } from "./components/game/Sky";
import { GameUI } from "./components/game/GameUI";
import { useRollerCoaster } from "./lib/stores/useRollerCoaster";
import { useAudio } from "./lib/stores/useAudio";

// Import your coaster JSON
import coasterData from "./public/A.json";

function MusicController() {
  const { isNightMode } = useRollerCoaster();
  const { setDaylightMusic, setNightMusic, isMuted } = useAudio();
  const hasStartedRef = useRef(false);

  const dayMusicRef = useRef<HTMLAudioElement>();
  const nightMusicRef = useRef<HTMLAudioElement>();

  // create audio objects once
  if (!dayMusicRef.current) {
    const base = import.meta.env.BASE_URL || "/";
    
    dayMusicRef.current = new Audio(`${base}sounds/roller-groover-ibiza-house-377494.mp3`);
    dayMusicRef.current.loop = true;
    dayMusicRef.current.volume = 0.5;
    setDaylightMusic(dayMusicRef.current);

    nightMusicRef.current = new Audio(`${base}sounds/no-copyright-music-hype-166457.mp3`);
    nightMusicRef.current.loop = true;
    nightMusicRef.current.volume = 0.5;
    setNightMusic(nightMusicRef.current);
  }

  // play music on first user interaction
  useEffect(() => {
    const startMusic = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      if (!isMuted) {
        if (isNightMode) nightMusicRef.current?.play().catch(() => {});
        else dayMusicRef.current?.play().catch(() => {});
      }
    };

    document.addEventListener("click", startMusic);
    document.addEventListener("keydown", startMusic);

    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("keydown", startMusic);
    };
  }, [isNightMode, isMuted]);

  // switch music on night/day toggle
  useEffect(() => {
    if (!hasStartedRef.current) return;

    if (isMuted) {
      dayMusicRef.current?.pause();
      nightMusicRef.current?.pause();
    } else {
      if (isNightMode) {
        dayMusicRef.current?.pause();
        nightMusicRef.current?.play().catch(() => {});
      } else {
        nightMusicRef.current?.pause();
        dayMusicRef.current?.play().catch(() => {});
      }
    }
  }, [isNightMode, isMuted]);

  return null;
}

function Scene() {
  const { loadCoaster } = useRollerCoaster();

  // load your A.json coaster on mount
  useEffect(() => {
    loadCoaster(coasterData);
  }, [loadCoaster]);

  return (
    <>
      <Sky />
      <BuildCamera />
      <RideCamera />

      <Suspense fallback={null}>
        <Ground />
        <TrackBuilder />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MusicController />
      <Canvas
        shadows
        camera={{ position: [20, 15, 20], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: "default" }}
      >
        <Scene />
      </Canvas>
      <GameUI />
    </div>
  );
}

export default App;
