"use client";

import { useEffect, useRef } from "react";
import { RotateCw } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Reveal from "./Reveal";

/**
 * Modelo procedural de la mesa gravimétrica con simulación de separación.
 * Motor coaxial (volante + biela) que reciproca el deck; partículas de oro
 * (concentrado) y relave (descarga); gotas de agua. OrbitControls para orbitar.
 */
export default function Viewer3D() {
  const stageRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const spinRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = () => stage.clientWidth || 760;
    const H = () => stage.clientHeight || 475;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
    camera.position.set(7.2, 4.6, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    stage.appendChild(renderer.domElement);

    let pmrem: THREE.PMREMGenerator | null = null;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    } catch {
      /* IBL opcional */
    }

    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x2a2620, 0.5));
    const key = new THREE.DirectionalLight(0xfff1e0, 2.0);
    key.position.set(8, 11, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 45;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xfc8f33, 0.7);
    rim.position.set(-7, 3, -6);
    scene.add(rim);

    const matDeck = new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.42, metalness: 0.12 });
    const matRiffle = new THREE.MeshStandardMaterial({ color: 0x242428, roughness: 0.4, metalness: 0.16 });
    const matApron = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.45, metalness: 0.25 });
    const matY = new THREE.MeshStandardMaterial({ color: 0xf2a800, roughness: 0.42, metalness: 0.35 });
    const matW = new THREE.MeshStandardMaterial({ color: 0xeeede8, roughness: 0.5, metalness: 0.05 });
    const matD = new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.45, metalness: 0.45 });
    const matSteel = new THREE.MeshStandardMaterial({ color: 0xb8b8bc, roughness: 0.28, metalness: 0.9 });

    // ---- bastidor amarillo estático + transmisión ----
    const base = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.18, 1.05, 0.18);
    (
      [
        [2.7, 0.52, 1.25],
        [2.7, 0.52, -1.25],
        [-2.7, 0.52, 1.25],
        [-2.7, 0.52, -1.25],
      ] as const
    ).forEach((p) => {
      const l = new THREE.Mesh(legGeo, matY);
      l.position.set(p[0], p[1], p[2]);
      l.castShadow = true;
      base.add(l);
    });
    [1.25, -1.25].forEach((zz) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.16, 0.16), matY);
      r.position.set(0, 1.02, zz);
      r.castShadow = true;
      base.add(r);
    });
    [2.7, -2.7].forEach((xx) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.66), matY);
      r.position.set(xx, 1.02, 0);
      r.castShadow = true;
      base.add(r);
    });
    [1.25, -1.25].forEach((zz) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.13, 0.13), matY);
      r.position.set(0, 0.18, zz);
      r.castShadow = true;
      base.add(r);
    });
    const drive = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.7, 1.0), matY);
    drive.position.set(-2.55, 0.5, 0.85);
    drive.castShadow = true;
    base.add(drive);
    const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.85, 28), matD);
    motorBody.rotation.x = Math.PI / 2;
    motorBody.position.set(-2.55, 0.85, 0.35);
    motorBody.castShadow = true;
    base.add(motorBody);
    const motorFin = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.1, 28), matSteel);
    motorFin.rotation.x = Math.PI / 2;
    motorFin.position.set(-2.55, 0.85, 0.0);
    base.add(motorFin);

    const fwGroup = new THREE.Group();
    fwGroup.position.set(-2.55, 0.85, 1.12);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.78, 16), matSteel);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 0, -0.42);
    fwGroup.add(shaft);
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 40), matD);
    flywheel.rotation.x = Math.PI / 2;
    flywheel.castShadow = true;
    fwGroup.add(flywheel);
    const fwInner = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.13, 40), matSteel);
    fwInner.rotation.x = Math.PI / 2;
    fwGroup.add(fwInner);
    for (let s = 0; s < 4; s++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 0.04), matD);
      sp.rotation.z = (s * Math.PI) / 4;
      fwGroup.add(sp);
    }
    const eccPin = new THREE.Object3D();
    eccPin.position.set(0, 0.18, 0.09);
    fwGroup.add(eccPin);
    const eccMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), matSteel);
    eccMesh.rotation.x = Math.PI / 2;
    eccMesh.position.set(0, 0.18, 0.05);
    fwGroup.add(eccMesh);
    base.add(fwGroup);
    const rod = new THREE.Mesh(new THREE.BoxGeometry(1, 0.09, 0.09), matSteel);
    rod.castShadow = true;
    scene.add(rod);
    scene.add(base);

    // ---- deck vibrante (cuerpo negro + ranuras finas + bordes blancos) ----
    const deckPivot = new THREE.Group();
    deckPivot.position.set(0, 1.5, 0);
    deckPivot.rotation.x = THREE.MathUtils.degToRad(-4.0);
    const deckShake = new THREE.Group();
    deckPivot.add(deckShake);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(5.95, 0.4, 2.82), matApron);
    apron.position.set(0, -0.13, 0);
    apron.castShadow = true;
    apron.receiveShadow = true;
    deckShake.add(apron);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.07, 2.5), matDeck);
    deck.position.set(0.05, 0.085, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    deckShake.add(deck);
    const riffles = new THREE.Group();
    const ridgeGeo = new THREE.BoxGeometry(5.4, 0.03, 0.028);
    for (let k = 0; k < 34; k++) {
      const bar = new THREE.Mesh(ridgeGeo, matRiffle);
      bar.position.set(0.05, 0.12, 1.18 - k * 0.072);
      riffles.add(bar);
    }
    deckShake.add(riffles);
    const launder = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.2, 0.26), matW);
    launder.position.set(0, 0.13, 1.36);
    launder.castShadow = true;
    deckShake.add(launder);
    const lowLip = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.1, 0.14), matW);
    lowLip.position.set(0, 0.06, -1.32);
    deckShake.add(lowLip);
    const headTrim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.5), matW);
    headTrim.position.set(-2.78, 0.1, 0);
    deckShake.add(headTrim);
    const feed = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.34, 1.0), matW);
    feed.position.set(-2.45, 0.22, 0.85);
    feed.castShadow = true;
    deckShake.add(feed);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.1, 12), matY);
    post.position.set(-2.4, 0.7, 1.45);
    post.castShadow = true;
    deckShake.add(post);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), matY);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(-2.0, 1.2, 1.45);
    handle.castShadow = true;
    deckShake.add(handle);
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(5.3, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x7fbce0, transparent: true, opacity: 0.18, roughness: 0.06, metalness: 0 }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0.1, 0.13, -0.05);
    deckShake.add(water);
    const headAnchor = new THREE.Object3D();
    headAnchor.position.set(-2.95, -0.6, 1.05);
    deckShake.add(headAnchor);
    scene.add(deckPivot);
    const concTrough = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 2.6), matD);
    concTrough.position.set(3.15, 1.42, 0);
    concTrough.castShadow = true;
    scene.add(concTrough);
    const tailTrough = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.14, 0.4), matD);
    tailTrough.position.set(0, 1.28, -1.68);
    tailTrough.castShadow = true;
    scene.add(tailTrough);

    // ---- partículas (sprite redondo suave) ----
    const psc = document.createElement("canvas");
    psc.width = psc.height = 64;
    const pcx = psc.getContext("2d")!;
    const grd = pcx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.55, "rgba(255,255,255,0.96)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    pcx.fillStyle = grd;
    pcx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(psc);

    const N = 720;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const data: { gold: boolean; x: number; z: number }[] = [];
    const GOLD = new THREE.Color(0xffab3d);
    const TAIL = new THREE.Color(0xe6e6ec);
    function spawn(i: number) {
      data[i] = { gold: Math.random() < 0.46, x: -2.35 + Math.random() * 0.5, z: 0.35 + Math.random() * 0.75 };
    }
    function setCol(i: number) {
      const c = data[i].gold ? GOLD : TAIL;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    for (let i = 0; i < N; i++) {
      spawn(i);
      setCol(i);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.13,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        alphaTest: 0.05,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    deckShake.add(points);

    const WN = 380;
    const wGeo = new THREE.BufferGeometry();
    const wpos = new Float32Array(WN * 3);
    const wdata: { x: number; z: number }[] = [];
    function wspawn(i: number) {
      wdata[i] = { x: -2.3 + Math.random() * 5.0, z: 1.1 + Math.random() * 0.28 };
    }
    for (let i = 0; i < WN; i++) wspawn(i);
    wGeo.setAttribute("position", new THREE.BufferAttribute(wpos, 3));
    const waterPts = new THREE.Points(
      wGeo,
      new THREE.PointsMaterial({
        size: 0.06,
        map: sprite,
        color: 0xaee2ff,
        transparent: true,
        opacity: 0.62,
        alphaTest: 0.03,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    deckShake.add(waterPts);

    function updateWater(dt: number) {
      for (let i = 0; i < WN; i++) {
        const d = wdata[i];
        d.z -= dt * 1.45;
        d.x += dt * 0.12 + (Math.random() - 0.5) * 0.02;
        if (d.z < -1.32) wspawn(i);
        const o = i * 3;
        wpos[o] = d.x;
        wpos[o + 1] = 0.135;
        wpos[o + 2] = d.z;
      }
      wGeo.attributes.position.needsUpdate = true;
    }
    function updateParticles(dt: number) {
      for (let i = 0; i < N; i++) {
        const d = data[i];
        if (d.gold) {
          d.x += dt * 0.9;
          d.z -= dt * 0.03;
        } else {
          d.x += dt * 0.5;
          d.z -= dt * 0.8;
        }
        d.x += (Math.random() - 0.5) * 0.01;
        d.z += (Math.random() - 0.5) * 0.01;
        if (d.x > 2.7 || d.z < -1.4) {
          spawn(i);
          setCol(i);
          pGeo.attributes.color.needsUpdate = true;
        }
        const o = i * 3;
        pos[o] = d.x;
        pos[o + 1] = 0.19;
        pos[o + 2] = d.z;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.28 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.9;
    controls.minDistance = 5.5;
    controls.maxDistance = 17;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.target.set(0, 1.4, 0);
    controls.update();

    let sim = !reduceMotion;
    const pBtn = playRef.current;
    const sBtn = spinRef.current;
    const onPlay = () => {
      sim = !sim;
      if (pBtn) pBtn.textContent = sim ? "Pausar simulación" : "Iniciar simulación";
    };
    const onSpin = () => {
      controls.autoRotate = !controls.autoRotate;
      if (sBtn) sBtn.textContent = controls.autoRotate ? "Detener giro" : "Girar solo";
    };
    if (pBtn) {
      pBtn.textContent = sim ? "Pausar simulación" : "Iniciar simulación";
      pBtn.addEventListener("click", onPlay);
    }
    if (sBtn) {
      sBtn.textContent = controls.autoRotate ? "Detener giro" : "Girar solo";
      sBtn.addEventListener("click", onSpin);
    }

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let theta = 0;
    const pinW = new THREE.Vector3();
    const headW = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const xAxis = new THREE.Vector3(1, 0, 0);
    let raf = 0;
    function loop() {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (sim) {
        theta += dt * 28;
        fwGroup.rotation.z = theta;
        deckShake.position.x = -Math.sin(theta) * 0.1;
        updateParticles(dt);
        updateWater(dt);
      }
      eccPin.getWorldPosition(pinW);
      headAnchor.getWorldPosition(headW);
      mid.addVectors(pinW, headW).multiplyScalar(0.5);
      rod.position.copy(mid);
      dir.subVectors(headW, pinW);
      rod.scale.x = Math.max(dir.length(), 0.001);
      rod.quaternion.setFromUnitVectors(xAxis, dir.normalize());
      controls.update();
      renderer.render(scene, camera);
    }
    loop();

    // ---- cleanup (importante por el doble-montaje de React Strict Mode) ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (pBtn) pBtn.removeEventListener("click", onPlay);
      if (sBtn) sBtn.removeEventListener("click", onSpin);
      controls.dispose();
      sprite.dispose();
      if (pmrem) pmrem.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="section" style={{ background: "var(--dark)", color: "#fff" }}>
      <div className="wrap">
        <Reveal className="shead center" style={{ marginLeft: "auto", marginRight: "auto" }}>
          <span className="eyebrow">Vista 3D</span>
          <h2 style={{ color: "#fff" }}>
            Explore la mesa en <span className="o">3D</span>
          </h2>
        </Reveal>
        <Reveal>
          <div className="viewer3d-stage" ref={stageRef}>
            <div className="v3d-legend">
              <span className="v3d-dot" style={{ background: "#FC8F33" }} />
              Oro → concentrado
              <span className="v3d-dot" style={{ background: "#9a9aa2", marginLeft: 14 }} />
              Relave → descarga
            </div>
            <div className="v3d-controls">
              <button ref={playRef} type="button">
                Pausar simulación
              </button>
              <button ref={spinRef} type="button">
                Detener giro
              </button>
            </div>
          </div>
          <div className="v3d-hint">
            <RotateCw />
            Arrastre para girar &nbsp;·&nbsp; rueda para acercar &nbsp;·&nbsp; simulación de
            separación en vivo
          </div>
        </Reveal>
      </div>
    </section>
  );
}
