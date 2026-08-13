import { useEffect, useRef } from "react";

type Props = {
  className?: string;
};

/** Real MacBook Pro 14" proportions (312.6 x 221.2 x 15.5 mm), scaled to 3.2 wide. */
const W = 3.2;
const D = 2.264;
const BASE_H = 0.159;
const LID_T = 0.056;
const LID_H = D - 0.07;
const LID_TILT = -0.2; // radians back from vertical -> ~101 degrees open

/** Dark UI on the display. Abstract, monochrome, matches the site's palette. */
function drawScreen(g: CanvasRenderingContext2D, w: number, h: number) {
  const bg = g.createLinearGradient(0, 0, w * 0.4, h);
  bg.addColorStop(0, "#12161b");
  bg.addColorStop(1, "#0a0c0f");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  const card = (x: number, y: number, cw: number, ch: number, r = 14) => {
    g.beginPath();
    g.roundRect(x, y, cw, ch, r);
  };

  // sidebar
  g.fillStyle = "#0e1116";
  g.fillRect(0, 0, w * 0.17, h);
  g.fillStyle = "rgba(255,255,255,0.06)";
  g.fillRect(w * 0.17 - 1, 0, 1, h);
  g.fillStyle = "rgba(255,255,255,0.9)";
  card(w * 0.045, h * 0.06, 26, 26, 8);
  g.fill();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i === 1 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)";
    card(w * 0.03, h * 0.17 + i * 46, w * 0.11, 30, 8);
    g.fill();
  }

  // top bar
  g.fillStyle = "rgba(255,255,255,0.05)";
  card(w * 0.2, h * 0.055, w * 0.34, 30, 10);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.5)";
  card(w * 0.88, h * 0.055, w * 0.075, 30, 15);
  g.fill();

  // stat tiles
  const tileW = (w * 0.77 - 36) / 3;
  for (let i = 0; i < 3; i++) {
    const x = w * 0.2 + i * (tileW + 18);
    g.fillStyle = "rgba(255,255,255,0.045)";
    card(x, h * 0.16, tileW, h * 0.15, 16);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.28)";
    card(x + 18, h * 0.19, tileW * 0.4, 12, 6);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.85)";
    card(x + 18, h * 0.225, tileW * 0.55, 26, 8);
    g.fill();
  }

  // chart card
  const cx = w * 0.2;
  const cy = h * 0.36;
  const cw = w * 0.77;
  const ch = h * 0.42;
  g.fillStyle = "rgba(255,255,255,0.04)";
  card(cx, cy, cw, ch, 18);
  g.fill();

  // gridlines
  g.strokeStyle = "rgba(255,255,255,0.05)";
  g.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = cy + (ch / 4) * i;
    g.beginPath();
    g.moveTo(cx + 24, y);
    g.lineTo(cx + cw - 24, y);
    g.stroke();
  }

  // line series with soft fill
  const pts: [number, number][] = [];
  const n = 26;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const y =
      cy + ch * 0.78 - ch * 0.5 * (0.25 + 0.42 * Math.sin(t * 5.2) * Math.cos(t * 1.7) + t * 0.45);
    pts.push([cx + 24 + t * (cw - 48), y]);
  }
  const fill = g.createLinearGradient(0, cy, 0, cy + ch);
  fill.addColorStop(0, "rgba(200,220,255,0.20)");
  fill.addColorStop(1, "rgba(200,220,255,0)");
  g.beginPath();
  g.moveTo(pts[0]![0], cy + ch - 20);
  pts.forEach((p) => g.lineTo(p[0], p[1]));
  g.lineTo(pts[pts.length - 1]![0], cy + ch - 20);
  g.closePath();
  g.fillStyle = fill;
  g.fill();

  g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.strokeStyle = "rgba(226,238,255,0.95)";
  g.lineWidth = 3;
  g.lineJoin = "round";
  g.stroke();

  // bars
  for (let i = 0; i < 12; i++) {
    const bh = 18 + Math.abs(Math.sin(i * 1.3)) * 54;
    g.fillStyle = i === 8 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.13)";
    card(cx + 26 + i * ((cw - 60) / 12), cy + ch + h * 0.035, (cw - 60) / 12 - 10, bh, 5);
    g.fill();
  }
}

/** Fine anisotropic streaks -> brushed-aluminium roughness variation. */
function drawBrush(g: CanvasRenderingContext2D, s: number) {
  g.fillStyle = "#8a8a8a";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 7000; i++) {
    const y = Math.random() * s;
    const len = 40 + Math.random() * 300;
    const x = Math.random() * s;
    g.strokeStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${
      Math.random() > 0.5 ? 255 : 0
    },${Math.random() * 0.05})`;
    g.lineWidth = Math.random() < 0.85 ? 1 : 2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y);
    g.stroke();
  }
}

/** Wordmark used as an alpha mask for the engraved lid logo. */
function drawLogo(g: CanvasRenderingContext2D, w: number, h: number) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  // letterSpacing is not in older TS DOM lib; guarded assignment keeps it optional
  const ctx = g as CanvasRenderingContext2D & { letterSpacing?: string };
  ctx.letterSpacing = `${Math.round(w * 0.028)}px`;
  g.font = `800 ${Math.round(h * 0.62)}px Inter, "Segoe UI", system-ui, sans-serif`;
  g.fillText("FYRIA", w / 2, h * 0.54);
}

export function HeroLaptop3D({ className }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (typeof window === "undefined" || !host) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } =
        await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (disposed || !hostRef.current) return;

      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Phones and reduced-motion users get one crisp frame instead of a live loop.
      const still = coarse || reduced;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: still ? "default" : "high-performance",
        });
      } catch {
        return; // no WebGL — the hero gradient stays on its own
      }

      const maxDpr = still ? 2 : 1.85;
      const setPixelRatio = () =>
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      setPixelRatio();
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.26;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const scene = new THREE.Scene();
      const disposables: { dispose: () => void }[] = [];

      const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        if (!g) return null;
        draw(g);
        const t = new THREE.CanvasTexture(c);
        t.anisotropy = maxAniso;
        disposables.push(t);
        return t;
      };

      // ---- studio environment: softbox above + rim strips at the sides -------
      // Gives metal its elongated highlights. Far more convincing than a
      // generic room probe, and it stays dark to match the hero.
      const envScene = new THREE.Scene();
      // Mid-slate, not black: metal has nothing but the environment to reflect,
      // so a dark probe renders anodised aluminium as a black slab.
      envScene.background = new THREE.Color(0x424852);
      const softbox = (
        col: number,
        intensity: number,
        sx: number,
        sy: number,
        pos: [number, number, number],
        look: [number, number, number],
      ) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(sx, sy),
          new THREE.MeshBasicMaterial({ color: col }),
        );
        m.material.color.multiplyScalar(intensity);
        m.position.set(...pos);
        m.lookAt(...look);
        envScene.add(m);
      };
      softbox(0xffffff, 7, 14, 8, [0, 7, 2], [0, 0, 0]);
      softbox(0xf2f5fa, 4.2, 4, 12, [-7, 1.5, 1], [0, 0, 0]);
      softbox(0xffffff, 3.2, 4, 12, [7, 1.5, -1], [0, 0, 0]);
      softbox(0x9fb4d4, 1.4, 12, 12, [0, -5, 4], [0, 0, 0]);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(envScene, 0.03);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 1.05;
      envScene.traverse((o) => {
        const m = o as InstanceType<typeof THREE.Mesh>;
        if (m.geometry) m.geometry.dispose();
        if (m.material) (m.material as InstanceType<typeof THREE.Material>).dispose();
      });

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

      // ---- lights: soft key from above-left, cool rim behind, low fill ------
      scene.add(new THREE.AmbientLight(0xd2d6dc, 0.7));
      const key = new THREE.DirectionalLight(0xfff4e8, 3.4);
      key.position.set(3.2, 6.2, 4.4);
      key.castShadow = true;
      key.shadow.mapSize.set(still ? 1024 : 2048, still ? 1024 : 2048);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 20;
      key.shadow.camera.left = -3.6;
      key.shadow.camera.right = 3.6;
      key.shadow.camera.top = 3.6;
      key.shadow.camera.bottom = -3.6;
      key.shadow.bias = -0.0006;
      key.shadow.normalBias = 0.02;
      key.shadow.radius = 4;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd4e0f5, 2.4);
      rim.position.set(-5, 2.2, -4.5);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(0xffffff, 0.35);
      fill.position.set(-1, -2.5, 5);
      scene.add(fill);

      // ---- materials --------------------------------------------------------
      const brush = canvasTex(512, 512, (g) => drawBrush(g, 512));
      if (brush) {
        brush.wrapS = brush.wrapT = THREE.RepeatWrapping;
        brush.repeat.set(3, 3);
      }

      const alu = new THREE.MeshPhysicalMaterial({
        color: 0x93989f, // space gray; matte anodised, not polished chrome
        metalness: 0.95,
        roughness: 0.46,
        envMapIntensity: 1.05,
        ...(brush ? { roughnessMap: brush } : {}),
      });
      const aluDark = new THREE.MeshPhysicalMaterial({
        color: 0x7d8288,
        metalness: 0.9,
        roughness: 0.62,
        envMapIntensity: 0.7,
      });
      // deck recess — darker than the caps so the keyboard reads as a keyboard
      const graphite = new THREE.MeshStandardMaterial({
        color: 0x0f1113,
        metalness: 0.4,
        roughness: 0.75,
        envMapIntensity: 0.6,
      });
      const keycap = new THREE.MeshStandardMaterial({
        color: 0x303439,
        metalness: 0.3,
        roughness: 0.62,
        envMapIntensity: 0.9,
      });
      const rubber = new THREE.MeshStandardMaterial({
        color: 0x0d0e10,
        metalness: 0,
        roughness: 0.9,
      });

      const screenTex = canvasTex(1280, 800, (g) => drawScreen(g, 1280, 800));
      if (screenTex) screenTex.colorSpace = THREE.SRGBColorSpace;
      const panel = new THREE.MeshBasicMaterial({
        ...(screenTex ? { map: screenTex } : { color: 0x0d1014 }),
        toneMapped: false,
      });

      const logoTex = canvasTex(1024, 300, (g) => drawLogo(g, 1024, 300));
      const logoMat = new THREE.MeshPhysicalMaterial({
        color: 0x5f656d, // only a shade under the shell -> etched, not a sticker
        metalness: 1,
        roughness: 0.72,
        transparent: true,
        ...(logoTex ? { alphaMap: logoTex } : {}),
      });

      const mats: InstanceType<typeof THREE.Material>[] = [
        alu,
        aluDark,
        graphite,
        keycap,
        rubber,
        panel,
        logoMat,
      ];

      // ---- build ------------------------------------------------------------
      const laptop = new THREE.Group();

      // base slab: tight corner radius, plenty of segments -> no faceting
      const base = new THREE.Mesh(new RoundedBoxGeometry(W, BASE_H, D, 5, 0.028), alu);
      base.position.y = BASE_H / 2;
      base.castShadow = true;
      base.receiveShadow = true;
      laptop.add(base);

      // keyboard recess
      const KB_W = 2.62;
      const KB_D = 1.0;
      const KB_Z = -0.34;
      const well = new THREE.Mesh(
        new RoundedBoxGeometry(KB_W + 0.06, 0.012, KB_D + 0.06, 3, 0.012),
        graphite,
      );
      well.position.set(0, BASE_H - 0.004, KB_Z);
      well.receiveShadow = true;
      laptop.add(well);

      // keycaps: one InstancedMesh, per-instance scale for varied widths
      const rows: number[][] = [
        [1.6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.9],
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.4],
        [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.1],
        [2.4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.4],
      ];
      const rowH = [0.076, 0.13, 0.13, 0.13, 0.13];
      const GAP = 0.016;
      const totalH = rowH.reduce((a, b) => a + b, 0) + GAP * rows.length;
      const keyGeo = new RoundedBoxGeometry(1, 0.024, 1, 2, 0.14);
      const keyCount = rows.reduce((a, r) => a + r.length, 0) + 1;
      const keys = new THREE.InstancedMesh(keyGeo, keycap, keyCount);
      keys.castShadow = true;
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const v3 = new THREE.Vector3();
      const s3 = new THREE.Vector3();
      let ki = 0;
      let zCursor = KB_Z - totalH / 2;
      rows.forEach((row, ri) => {
        const h = rowH[ri]!;
        const units = row.reduce((a, b) => a + b, 0);
        const unitW = (KB_W - GAP * (row.length - 1)) / units;
        let xCursor = -KB_W / 2;
        row.forEach((u) => {
          const kw = unitW * u;
          v3.set(xCursor + kw / 2, BASE_H + 0.004, zCursor + h / 2);
          s3.set(kw, 1, h);
          m4.compose(v3, q, s3);
          keys.setMatrixAt(ki++, m4);
          xCursor += kw + GAP;
        });
        zCursor += h + GAP;
      });
      // spacebar row
      v3.set(0, BASE_H + 0.004, zCursor + 0.06);
      s3.set(KB_W * 0.42, 1, 0.12);
      m4.compose(v3, q, s3);
      keys.setMatrixAt(ki++, m4);
      keys.instanceMatrix.needsUpdate = true;
      laptop.add(keys);

      // trackpad — a hair proud of the deck, with a dark seam beneath
      const seam = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.006, 0.92, 3, 0.02), graphite);
      seam.position.set(0, BASE_H - 0.001, 0.52);
      laptop.add(seam);
      const pad = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.01, 0.88, 3, 0.018), aluDark);
      pad.position.set(0, BASE_H + 0.002, 0.52);
      pad.receiveShadow = true;
      laptop.add(pad);

      // hinge barrel
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, W - 0.5, 20), graphite);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(0, BASE_H - 0.012, -D / 2 + 0.05);
      laptop.add(hinge);

      // feet
      const footGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.018, 16);
      [
        [-W / 2 + 0.22, -D / 2 + 0.2],
        [W / 2 - 0.22, -D / 2 + 0.2],
        [-W / 2 + 0.22, D / 2 - 0.2],
        [W / 2 - 0.22, D / 2 - 0.2],
      ].forEach(([fx, fz]) => {
        const f = new THREE.Mesh(footGeo, rubber);
        f.position.set(fx!, -0.009, fz!);
        laptop.add(f);
      });

      // ---- lid --------------------------------------------------------------
      const lid = new THREE.Group();
      const shell = new THREE.Mesh(new RoundedBoxGeometry(W, LID_H, LID_T, 5, 0.024), alu);
      shell.position.y = LID_H / 2;
      shell.castShadow = true;
      shell.receiveShadow = true;
      lid.add(shell);

      // black bezel face + display, both inset into the front of the shell
      const bezel = new THREE.Mesh(
        new RoundedBoxGeometry(W - 0.03, LID_H - 0.03, 0.006, 3, 0.02),
        graphite,
      );
      bezel.position.set(0, LID_H / 2, LID_T / 2 - 0.001);
      lid.add(bezel);

      const SCR_W = W - 0.115;
      const SCR_H = LID_H - 0.135;
      const display = new THREE.Mesh(new THREE.PlaneGeometry(SCR_W, SCR_H), panel);
      display.position.set(0, LID_H / 2 + 0.008, LID_T / 2 + 0.004);
      lid.add(display);

      // glass sheet over the panel: picks up environment reflections
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(W - 0.06, LID_H - 0.06),
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0,
          roughness: 0.06,
          transparent: true,
          opacity: 0.05,
        }),
      );
      glass.position.set(0, LID_H / 2, LID_T / 2 + 0.006);
      lid.add(glass);
      mats.push(glass.material as InstanceType<typeof THREE.Material>);

      // camera notch
      const notch = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.05, 0.004, 2, 0.018), graphite);
      notch.position.set(0, LID_H - 0.055, LID_T / 2 + 0.006);
      lid.add(notch);

      // soft bloom stand-in: additive halo hugging the panel
      const halo = canvasTex(256, 256, (g) => {
        const rad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
        rad.addColorStop(0, "rgba(174,201,255,0.55)");
        rad.addColorStop(0.55, "rgba(140,170,230,0.16)");
        rad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = rad;
        g.fillRect(0, 0, 256, 256);
      });
      if (halo) {
        const glowMat = new THREE.MeshBasicMaterial({
          map: halo,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
          opacity: 0.42,
        });
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(SCR_W * 1.12, SCR_H * 1.18), glowMat);
        glow.position.set(0, LID_H / 2 + 0.008, LID_T / 2 + 0.02);
        lid.add(glow);
        mats.push(glowMat);
      }

      // engraved FYRIA on the outside of the lid
      const logoW = W * 0.27;
      const logo = new THREE.Mesh(new THREE.PlaneGeometry(logoW, logoW * (300 / 1024)), logoMat);
      logo.position.set(0, LID_H * 0.52, -LID_T / 2 - 0.0015);
      logo.rotation.y = Math.PI;
      lid.add(logo);

      lid.position.set(0, BASE_H - 0.01, -D / 2 + 0.05);
      lid.rotation.x = LID_TILT;
      laptop.add(lid);

      // ---- ground: catches the cast shadow, otherwise invisible -------------
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.42 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.012;
      ground.receiveShadow = true;
      scene.add(ground);
      mats.push(ground.material as InstanceType<typeof THREE.Material>);

      // fake ambient occlusion puddle so the laptop is grounded even where the
      // directional shadow falls off
      const ao = canvasTex(256, 256, (g) => {
        const rad = g.createRadialGradient(128, 128, 4, 128, 128, 126);
        rad.addColorStop(0, "rgba(0,0,0,0.55)");
        rad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = rad;
        g.fillRect(0, 0, 256, 256);
      });
      if (ao) {
        const aoMat = new THREE.MeshBasicMaterial({
          map: ao,
          transparent: true,
          depthWrite: false,
          opacity: 0.85,
        });
        const aoPlane = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.5, D * 1.9), aoMat);
        aoPlane.rotation.x = -Math.PI / 2;
        aoPlane.position.set(0, -0.008, 0.1);
        scene.add(aoPlane);
        mats.push(aoMat);
      }

      // pivot so rotation happens about the laptop's own centre
      const pivot = new THREE.Group();
      laptop.position.set(0, -0.42, 0.15);
      pivot.add(laptop);
      scene.add(pivot);

      // ---- framing ----------------------------------------------------------
      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        const aspect = w / h;
        camera.aspect = aspect;
        // pull back on narrow viewports so the laptop never crops
        const dist = aspect < 0.85 ? 8.6 : aspect < 1.3 ? 7.6 : 6.9;
        camera.position.set(0, 2.25, dist);
        camera.lookAt(0, 0.05, 0);
        camera.updateProjectionMatrix();
        setPixelRatio();
        renderer.setSize(w, h, false);
      };
      resize();

      const ro = new ResizeObserver(() => {
        resize();
        if (still) renderer.render(scene, camera);
      });
      ro.observe(host);
      window.addEventListener("resize", resize);

      host.dataset["ready"] = "true";
      // paint immediately so the hero is never blank while waiting for rAF
      pivot.rotation.y = -0.42;
      renderer.render(scene, camera);

      // ---- static branch: one frame, then nothing ---------------------------
      if (still) {
        pivot.rotation.y = -0.42; // three-quarter hero angle
        renderer.render(scene, camera);
        cleanup = () => {
          ro.disconnect();
          window.removeEventListener("resize", resize);
          scene.traverse((o) => {
            const mesh = o as InstanceType<typeof THREE.Mesh>;
            if (mesh.geometry) mesh.geometry.dispose();
          });
          keyGeo.dispose();
          footGeo.dispose();
          mats.forEach((m) => m.dispose());
          disposables.forEach((d) => d.dispose());
          envRT.texture.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
        return;
      }

      // ---- animation: constant yaw + sine float + eased pointer parallax ----
      const TURN = 40; // seconds per revolution
      const SPEED = (Math.PI * 2) / TURN;
      let elapsed = 0;
      let last = performance.now();
      let raf = 0;
      let running = true;
      let targetX = 0;
      let targetY = 0;
      let curX = 0;
      let curY = 0;

      const onPointer = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        targetY = ((e.clientX - r.left) / r.width - 0.5) * 0.26;
        targetX = ((e.clientY - r.top) / r.height - 0.5) * 0.14;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!running) return;
        elapsed += dt;

        // eased parallax, never snaps
        curX += (targetX - curX) * Math.min(dt * 2.4, 1);
        curY += (targetY - curY) * Math.min(dt * 2.4, 1);

        pivot.rotation.y = elapsed * SPEED + curY;
        pivot.rotation.x = Math.sin(elapsed * 0.31) * 0.028 + curX;
        pivot.position.y = Math.sin(elapsed * 0.47) * 0.05;
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

      const onLost = (e: Event) => e.preventDefault();
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (mesh.geometry) mesh.geometry.dispose();
        });
        keyGeo.dispose();
        footGeo.dispose();
        mats.forEach((m) => m.dispose());
        disposables.forEach((d) => d.dispose());
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
