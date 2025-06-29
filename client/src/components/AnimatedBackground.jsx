import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function AnimatedBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: {
            value: "#0f172a",
          },
        },
        particles: {
          color: { value: "#00e0ff" },
          links: {
            enable: true,
            color: "#00e0ff",
            distance: 130,
            opacity: 0.4,
          },
          move: { enable: true, speed: 1 },
          size: { value: 2 },
          number: { value: 60 },
        },
      }}
    />
  );
}

export default AnimatedBackground;
