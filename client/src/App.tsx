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

function MusicController() {
  const { isNightMode } = useRollerCoaster();
  const { 
    setDaylightMusic, daylightMusic,
    setNightMusic, nightMusic,
    isMuted 
  } = useAudio();

  const hasStartedRef = useRef(false);

  // Preload audio once
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const dayMusic = new Audio(`${base}sounds/roller-groover-ibiza-house-377494.mp3`);
    dayMusic.loop = true;
    dayMusic.volume = 0.5;

    const nightMusicAudio = new Audio(`${base}sounds/no-copyright-music-hype-166457.mp3`);
    nightMusicAudio.loop = true;
    nightMusicAudio.volume = 0.5;

    setDaylightMusic(dayMusic);
    setNightMusic(nightMusicAudio);

    return () => {
      dayMusic.pause();
      dayMusic.src = "";
      nightMusicAudio.pause();
      nightMusicAudio.src = "";
    };
  }, [setDaylightMusic, setNightMusic]);

  // Start playback on first user interaction
  useEffect(() => {
    const startMusic = () => {
      if (!daylightMusic || !nightMusic) return;
      if (hasStartedRef.current) return;

      hasStartedRef.current = true;

      if (!isMuted) {
        if (isNightMode) nightMusic.play().catch(() => {});
        else daylightMusic.play().catch(() => {});
      }
    };

    document.addEventListener("click", startMusic);
    document.addEventListener("keydown", startMusic);

    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("keydown", startMusic);
    };
  }, [daylightMusic, nightMusic, isNightMode, isMuted]);

  // Handle switching day/night and mute changes
  useEffect(() => {
    if (!daylightMusic || !nightMusic) return;
    if (!hasStartedRef.current) return;

    if (isMuted) {
      daylightMusic.pause();
      nightMusic.pause();
      return;
    }

    if (isNightMode) {
      daylightMusic.pause();
      nightMusic.currentTime = 0;
      nightMusic.play().catch(() => {});
    } else {
      nightMusic.pause();
      daylightMusic.currentTime = 0;
      daylightMusic.play().catch(() => {});
    }
  }, [isNightMode, isMuted, daylightMusic, nightMusic]);

  return null;
}

function Scene() {
  const { mode } = useRollerCoaster();

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
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
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
