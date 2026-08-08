import { useEffect, useRef } from "react";

type Props = {
  className?: string;
};

/**
 * Client-only WebGL hero: a premium laptop that rotates with a constant
 * linear speed in a seamless infinite loop. All three.js work happens inside
 * a single effect so React re-renders never rebuild the scene.
 */
export function HeroLaptop3D({ className }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (typeof window === "undefined" || !host) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import(
        "three/examples/jsm/geometries/RoundedBoxGeometry.js"
      );
      const { RoomEnvironment } = await import(
        "three/examples/jsm/environments/RoomEnvironment.js"
      );
      if (disposed || !hostRef.current) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        return; // no WebGL — poster stays visible
      }

      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const maxDpr = isCoarse ? 1.5 : 2;
      const setPixelRatio = () =>
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));

      setPixelRatio();
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 1.55, 6.2);
      camera.lookAt(0, 0.35, 0);

      // Lighting — fixed in world space so rotation creates soft light travel.
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(3.5, 5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xbcd6ff, 1.4);
      rim.position.set(-4.5, 2.5, -3.5);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(0xffffff, 0.5);
      fill.position.set(0, -3, 3);
      scene.add(fill);

      const alu = new THREE.MeshPhysicalMaterial({
        color: 0xd6d9dd,
        metalness: 1,
        roughness: 0.26,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
      });
      const dark = new THREE.MeshPhysicalMaterial({
        color: 0x111214,
        metalness: 0.5,
        roughness: 0.35,
      });
      const glass = new THREE.MeshPhysicalMaterial({
        color: 0x0a0d12,
        metalness: 0.2,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        emissive: 0x1b2740,
        emissiveIntensity: 0.55,
      });

      const laptop = new THREE.Group();

      // Base
      const baseGeo = new RoundedBoxGeometry(3.4, 0.14, 2.35, 4, 0.07);
      const base = new THREE.Mesh(baseGeo, alu);
      base.position.y = 0.07;
      laptop.add(base);

      // Keyboard well + trackpad
      const kb = new THREE.Mesh(new RoundedBoxGeometry(2.85, 0.02, 1.15, 2, 0.01), dark);
      kb.position.set(0, 0.145, -0.35);
      laptop.add(kb);
      const pad = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.02, 0.78, 2, 0.01), alu);
      pad.position.set(0, 0.145, 0.62);
      laptop.add(pad);

      // Lid (hinged slightly open, tilted back)
      const lid = new THREE.Group();
      const lidShell = new THREE.Mesh(new RoundedBoxGeometry(3.4, 2.25, 0.1, 4, 0.06), alu);
      lidShell.position.y = 1.125;
      lid.add(lidShell);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 2.0), glass);
      screen.position.set(0, 1.125, 0.052);
      lid.add(screen);
      lid.position.set(0, 0.12, -1.13);
      lid.rotation.x = -0.19;
      laptop.add(lid);

      laptop.rotation.x = 0.06;
      const pivot = new THREE.Group();
      pivot.add(laptop);
      laptop.position.y = -0.55;
      scene.add(pivot);

      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        setPixelRatio();
        renderer.setSize(w, h, false);
      };
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(host);
      window.addEventListener("resize", resize);

      // Constant-speed, seamless loop driven by accumulated visible time.
      const SPEED = (Math.PI * 2) / 26; // one full turn per 26s
      let elapsed = 0;
      let last = performance.now();
      let raf = 0;
      let running = true;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!running) return;
        elapsed += dt;
        pivot.rotation.y = elapsed * SPEED;
        // gentle vertical float, period is a divisor-free sine — always smooth
        pivot.position.y = Math.sin(elapsed * 0.55) * 0.055;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      const onVisibility = () => {
        last = performance.now();
      };
      document.addEventListener("visibilitychange", onVisibility);

      const io = new IntersectionObserver(
        ([entry]) => {
          running = !!entry?.isIntersecting;
          last = performance.now();
        },
        { threshold: 0 },
      );
      io.observe(host);

      const onLost = (e: Event) => {
        e.preventDefault();
      };
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      host.dataset["ready"] = "true";

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        scene.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          if (mesh.geometry) mesh.geometry.dispose();
        });
        [alu, dark, glass].forEach((m) => m.dispose());
        envRT.texture.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={className}>
      <div ref={hostRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
