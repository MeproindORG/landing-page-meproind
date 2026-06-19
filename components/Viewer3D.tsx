"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, Clock, Coins } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { fmtMass, fmtUsd } from "@/lib/calc";

interface Viewer3DProps {
  /** ley de oro (g/t) — controla la proporción de partículas doradas */
  grade: number;
  /** oro recuperado por día (g) — alimenta el contador de tiempo acelerado */
  gramsPerDay: number;
  /** US$ por gramo de oro (precio en vivo) — para el valor del contador */
  usdPerGram: number;
}

/** días simulados por segundo real (tiempo acelerado) */
const TIME_SCALE = 2.6;

function goldFractionFromGrade(grade: number): number {
  return Math.min(Math.max(0.18 + grade * 0.025, 0.2), 0.65);
}

export default function Viewer3D({ grade, gramsPerDay, usdPerGram }: Viewer3DProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const simRef = useRef(true);
  const paramsRef = useRef({
    goldFraction: goldFractionFromGrade(grade),
    gramsPerDay,
    usdPerGram,
  });

  const [simOn, setSimOn] = useState(true);
  const [spinOn, setSpinOn] = useState(true);
  const [hud, setHud] = useState({ days: 0, grams: 0, usd: 0 });

  // Mantener los parámetros vivos para que el loop lea siempre el valor actual.
  useEffect(() => {
    paramsRef.current = {
      goldFraction: goldFractionFromGrade(grade),
      gramsPerDay,
      usdPerGram,
    };
  }, [grade, gramsPerDay, usdPerGram]);

  const toggleSim = () => {
    simRef.current = !simRef.current;
    setSimOn(simRef.current);
  };
  const toggleSpin = () => {
    const c = controlsRef.current;
    if (!c) return;
    c.autoRotate = !c.autoRotate;
    setSpinOn(c.autoRotate);
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      simRef.current = false;
      setSimOn(false);
    }
    const W = () => stage.clientWidth || 760;
    const H = () => stage.clientHeight || 475;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
    camera.position.set(8.8, 5.4, 9.4);

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
    key.shadow.camera.far = 50;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
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

    // ---- deck vibrante ----
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

    // ---- tolva de alimentación (estática) ----
    const matOre = new THREE.MeshStandardMaterial({ color: 0x8a6a3c, roughness: 0.85 });
    const hopper = new THREE.Group();
    hopper.position.set(-2.55, 2.12, 0.9);
    const funnel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.15, 0.6, 22, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x6c6c72, roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide }),
    );
    funnel.castShadow = true;
    hopper.add(funnel);
    const hopRim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.03, 8, 26), matSteel);
    hopRim.rotation.x = Math.PI / 2;
    hopRim.position.y = 0.3;
    hopper.add(hopRim);
    const oreHeap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.22, 18), matOre);
    oreHeap.position.y = 0.16;
    hopper.add(oreHeap);
    scene.add(hopper);
    [
      [-2.95, 0.9],
      [-2.15, 0.9],
    ].forEach((p) => {
      const postH = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.05, 10), matSteel);
      postH.position.set(p[0], 1.02, p[1]);
      postH.castShadow = true;
      scene.add(postH);
    });

    // ---- trabajadores estilizados que interactúan con la mesa ----
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd8a87a, roughness: 0.7 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.6 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x9a7b4a, roughness: 0.7 });
    function buildWorker(clothColor: number, vestColor: number) {
      const cloth = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.75 });
      const vest = new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.5, metalness: 0.1 });
      const g = new THREE.Group();
      [-0.11, 0.11].forEach((x) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.7, 12), cloth);
        leg.position.set(x, 0.37, 0);
        leg.castShadow = true;
        g.add(leg);
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.27), bootMat);
        b.position.set(x, 0.05, 0.05);
        b.castShadow = true;
        g.add(b);
      });
      // tronco articulado (pivote en la cadera) — permite agacharse
      const hip = new THREE.Group();
      hip.position.set(0, 0.72, 0);
      g.add(hip);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.56, 0.24), cloth);
      torso.position.set(0, 0.28, 0);
      torso.castShadow = true;
      hip.add(torso);
      const vestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.42, 0.26), vest);
      vestMesh.position.set(0, 0.28, 0);
      vestMesh.castShadow = true;
      hip.add(vestMesh);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), skinMat);
      head.position.set(0, 0.7, 0);
      head.castShadow = true;
      hip.add(head);
      const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.03, 22), matY);
      hatBrim.position.set(0, 0.78, 0.04);
      hip.add(hatBrim);
      const hatDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        matY,
      );
      hatDome.position.set(0, 0.78, 0);
      hatDome.castShadow = true;
      hip.add(hatDome);
      const lShoulder = new THREE.Group();
      lShoulder.position.set(-0.24, 0.52, 0.05);
      hip.add(lShoulder);
      const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.5, 12), cloth);
      lArm.position.set(0, -0.2, 0.04);
      lArm.castShadow = true;
      lShoulder.add(lArm);
      const rShoulder = new THREE.Group();
      rShoulder.position.set(0.24, 0.52, 0.05);
      hip.add(rShoulder);
      const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.5, 12), cloth);
      rArm.position.set(0, -0.2, 0.04);
      rArm.castShadow = true;
      rShoulder.add(rArm);
      const hand = new THREE.Group();
      hand.position.set(0, -0.42, 0.06);
      rShoulder.add(hand);
      g.userData = { hip, lShoulder, rShoulder, hand };
      return g;
    }

    // Operario A — agarra mineral del montículo y lo echa a la tolva
    const feeder = buildWorker(0x2f4d6e, 0xf2a800);
    feeder.position.set(-4.3, 0, 2.25);
    feeder.rotation.y = 2.32; // mira hacia la tolva
    feeder.scale.setScalar(2.0);
    const shovel = new THREE.Group();
    const sHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 8), handleMat);
    sHandle.position.set(0, -0.18, 0.12);
    sHandle.rotation.x = -0.5;
    sHandle.castShadow = true;
    shovel.add(sHandle);
    const bladePivot = new THREE.Group();
    bladePivot.position.set(0, -0.4, 0.32);
    shovel.add(bladePivot);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.02, 0.24), matSteel);
    blade.castShadow = true;
    bladePivot.add(blade);
    const bladeLip = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.07, 0.02), matSteel);
    bladeLip.position.set(0, 0.025, 0.12);
    bladePivot.add(bladeLip);
    const oreLoad = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), matOre);
    oreLoad.scale.set(1, 0.45, 1);
    oreLoad.position.set(0, 0.05, 0);
    bladePivot.add(oreLoad);
    (feeder.userData.hand as THREE.Group).add(shovel);
    feeder.userData.bladePivot = bladePivot;
    feeder.userData.oreLoad = oreLoad;
    scene.add(feeder);

    // montículos de mineral (fuente) — todos cónicos; el operario palea del más cercano
    (
      [
        [-3.27, 0.63, 0.58, 0.6], // principal (donde cae la pala)
        [-4.75, 2.95, 0.46, 0.4],
        [-5.05, 2.35, 0.4, 0.34],
      ] as const
    ).forEach((m) => {
      const mound = new THREE.Mesh(new THREE.ConeGeometry(m[2], m[3], 18), matOre);
      mound.position.set(m[0], m[3] / 2, m[1]);
      mound.castShadow = true;
      mound.receiveShadow = true;
      scene.add(mound);
    });

    // Operario B — recibe el concentrado de oro en una batea (plana, al frente)
    const collector = buildWorker(0x3b3f46, 0xf2a800);
    collector.position.set(4.3, 0, 0.3);
    collector.rotation.y = -Math.PI / 2; // mira hacia -x (la mesa)
    collector.scale.setScalar(2.0);
    const panHolder = new THREE.Group();
    panHolder.position.set(0, 0.04, 0.52); // al frente, a la altura del tablero (cintura)
    (collector.userData.hip as THREE.Group).add(panHolder);
    const pan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.17, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: 0x4a3a22, roughness: 0.6, metalness: 0.4 }),
    );
    pan.castShadow = true;
    pan.receiveShadow = true;
    panHolder.add(pan);
    const panGold = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.12, 0.045, 20),
      new THREE.MeshStandardMaterial({ color: 0xffb23e, roughness: 0.4, metalness: 0.4 }),
    );
    panGold.position.y = 0.05;
    panHolder.add(panGold);
    // ambos brazos al frente, sosteniendo la batea
    (collector.userData.rShoulder as THREE.Group).rotation.x = -1.2;
    (collector.userData.lShoulder as THREE.Group).rotation.x = -1.2;
    collector.userData.pan = pan;
    scene.add(collector);

    // ---- partículas de mineral en la mesa (oro vs relave) ----
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
      data[i] = {
        gold: Math.random() < paramsRef.current.goldFraction,
        x: -2.35 + Math.random() * 0.5,
        z: 0.35 + Math.random() * 0.75,
      };
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

    // ---- gotas de agua ----
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

    // ---- chorro de mineral de la tolva hacia la mesa ----
    const FN = 70;
    const fGeo = new THREE.BufferGeometry();
    const fpos = new Float32Array(FN * 3);
    const fdata: { x: number; y: number; z: number; v: number }[] = [];
    function fspawn(i: number) {
      fdata[i] = {
        x: -2.55 + (Math.random() - 0.5) * 0.18,
        y: 2.0 + Math.random() * 0.18,
        z: 0.9 + (Math.random() - 0.5) * 0.18,
        v: 0,
      };
    }
    for (let i = 0; i < FN; i++) fspawn(i);
    fGeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
    const feedPts = new THREE.Points(
      fGeo,
      new THREE.PointsMaterial({
        size: 0.1,
        map: sprite,
        color: 0xc79a5b,
        transparent: true,
        opacity: 0.96,
        alphaTest: 0.05,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    scene.add(feedPts);

    // ---- concentrado de oro que sale de la mesa y cae a la batea del operario B ----
    const GN = 52;
    const gGeo = new THREE.BufferGeometry();
    const gpos = new Float32Array(GN * 3);
    const gdata: { x: number; y: number; z: number }[] = [];
    const goldTarget = new THREE.Vector3(3.55, 1.25, 0.5); // batea (se recalcula cada frame)
    function gspawn(i: number) {
      gdata[i] = { x: 2.95 + Math.random() * 0.3, y: 1.56 + Math.random() * 0.08, z: 0.1 + Math.random() * 0.4 };
    }
    for (let i = 0; i < GN; i++) gspawn(i);
    gGeo.setAttribute("position", new THREE.BufferAttribute(gpos, 3));
    const goldStream = new THREE.Points(
      gGeo,
      new THREE.PointsMaterial({
        size: 0.13,
        map: sprite,
        color: 0xffb23e,
        transparent: true,
        opacity: 1,
        alphaTest: 0.05,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    scene.add(goldStream);
    function updateGold(dt: number) {
      for (let i = 0; i < GN; i++) {
        const d = gdata[i];
        d.x += (goldTarget.x - d.x) * dt * 2.1;
        d.z += (goldTarget.z - d.z) * dt * 2.1;
        d.y += (goldTarget.y + 0.05 - d.y) * dt * 2.1 - dt * 0.05;
        const dx = d.x - goldTarget.x;
        const dy = d.y - goldTarget.y;
        const dz = d.z - goldTarget.z;
        if (dx * dx + dy * dy + dz * dz < 0.025) gspawn(i);
        const o = i * 3;
        gpos[o] = d.x;
        gpos[o + 1] = d.y;
        gpos[o + 2] = d.z;
      }
      gGeo.attributes.position.needsUpdate = true;
    }

    // ---- mineral que el operario lanza de la pala hacia la tolva (al voltear) ----
    const TON = 26;
    const toGeo = new THREE.BufferGeometry();
    const topos = new Float32Array(TON * 3).fill(-999);
    const todata: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number }[] = [];
    for (let i = 0; i < TON; i++) todata[i] = { x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, life: 0 };
    toGeo.setAttribute("position", new THREE.BufferAttribute(topos, 3));
    const thrownOre = new THREE.Points(
      toGeo,
      new THREE.PointsMaterial({
        size: 0.15,
        map: sprite,
        color: 0xc79a5b,
        transparent: true,
        opacity: 0.97,
        alphaTest: 0.05,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    scene.add(thrownOre);
    const HOPPER_MOUTH = new THREE.Vector3(-2.55, 2.3, 0.9);
    const bladeWp = new THREE.Vector3();
    const TG = 3.6; // gravedad de escena para el arco
    function emitThrow() {
      blade.getWorldPosition(bladeWp);
      const T = 0.62;
      let emitted = 0;
      for (let i = 0; i < TON && emitted < 14; i++) {
        const d = todata[i];
        if (d.life > 0) continue;
        d.x = bladeWp.x;
        d.y = bladeWp.y;
        d.z = bladeWp.z;
        d.vx = (HOPPER_MOUTH.x - bladeWp.x) / T + (Math.random() - 0.5) * 0.5;
        d.vz = (HOPPER_MOUTH.z - bladeWp.z) / T + (Math.random() - 0.5) * 0.5;
        d.vy = (HOPPER_MOUTH.y - bladeWp.y) / T + 0.5 * TG * T;
        d.life = T;
        emitted++;
      }
    }
    function updateThrownOre(dt: number) {
      for (let i = 0; i < TON; i++) {
        const d = todata[i];
        const o = i * 3;
        if (d.life > 0) {
          d.vy -= TG * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.z += d.vz * dt;
          d.life -= dt;
          topos[o] = d.x;
          topos[o + 1] = d.life > 0 ? d.y : -999;
          topos[o + 2] = d.z;
        } else {
          topos[o + 1] = -999;
        }
      }
      toGeo.attributes.position.needsUpdate = true;
    }

    function updateFeed(dt: number) {
      for (let i = 0; i < FN; i++) {
        const d = fdata[i];
        d.v += dt * 3.2;
        d.y -= d.v * dt;
        if (d.y < 1.72) fspawn(i);
        const o = i * 3;
        fpos[o] = d.x;
        fpos[o + 1] = d.y;
        fpos[o + 2] = d.z;
      }
      fGeo.attributes.position.needsUpdate = true;
    }
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
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.target.set(-0.2, 1.4, 0);
    controls.update();
    controlsRef.current = controls;
    setSpinOn(controls.autoRotate);

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let theta = 0;
    let simDays = 0;
    let uiAccum = 0;
    const pinW = new THREE.Vector3();
    const headW = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const xAxis = new THREE.Vector3(1, 0, 0);

    // Ciclo del operario que alimenta: agacha al montículo → carga → sube → vuelca en la tolva.
    // Keyframes: c (fase 0..1), hip (inclinación), sh (hombro: − = al frente), tip (vaciar pala), load (mineral en pala).
    const FEED_CYCLE = 3.6;
    const fK = [
      { hip: 0.8, sh: -0.98, tip: 0.0, load: 0.0 }, // 0 cavar (fondo)
      { hip: 0.8, sh: -1.0, tip: 0.0, load: 1.0 }, //  1 cargado
      { hip: 0.3, sh: -0.7, tip: 0.0, load: 1.0 }, //  2 sube
      { hip: 0.0, sh: -1.15, tip: 0.1, load: 1.0 }, // 3 al frente
      { hip: 0.0, sh: -1.25, tip: 1.2, load: 0.0 }, // 4 vuelca (lanza el mineral)
      { hip: 0.4, sh: -0.7, tip: 0.2, load: 0.0 }, //  5 regresa
    ];
    // Catmull-Rom cíclico: el brazo fluye continuo por los keyframes (sin frenar en cada uno).
    const crom = (p0: number, p1: number, p2: number, p3: number, t: number) => {
      const t2 = t * t;
      const t3 = t2 * t;
      return (
        0.5 *
        (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
      );
    };
    function animateFeeder(time: number) {
      const c = (time % FEED_CYCLE) / FEED_CYCLE;
      const m = fK.length; // 6 keyframes uniformes
      const f = c * m;
      const i = Math.floor(f) % m;
      const t = f - Math.floor(f);
      const p0 = fK[(i - 1 + m) % m];
      const p1 = fK[i];
      const p2 = fK[(i + 1) % m];
      const p3 = fK[(i + 2) % m];
      (feeder.userData.hip as THREE.Group).rotation.x = crom(p0.hip, p1.hip, p2.hip, p3.hip, t);
      (feeder.userData.rShoulder as THREE.Group).rotation.x = crom(p0.sh, p1.sh, p2.sh, p3.sh, t);
      (feeder.userData.bladePivot as THREE.Group).rotation.x = crom(p0.tip, p1.tip, p2.tip, p3.tip, t);
      const load = Math.min(Math.max(crom(p0.load, p1.load, p2.load, p3.load, t), 0), 1);
      const ol = feeder.userData.oreLoad as THREE.Mesh;
      const s = Math.max(load, 0.001);
      ol.scale.set(s, s * 0.45, s);
      ol.visible = load > 0.05;
    }

    let raf = 0;
    let prevCycle = 0;
    function loop() {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      // operario A: ciclo de paleo (carga la tolva); operario B: recoge el concentrado
      animateFeeder(t);
      (collector.userData.pan as THREE.Mesh).rotation.z = Math.sin(t * 1.6) * 0.12;
      (collector.userData.hip as THREE.Group).rotation.x = 0.05 + Math.sin(t * 1.6) * 0.03;

      if (simRef.current) {
        theta += dt * 28;
        fwGroup.rotation.z = theta;
        deckShake.position.x = -Math.sin(theta) * 0.1;
        updateParticles(dt);
        updateWater(dt);
        updateFeed(dt);
        (collector.userData.pan as THREE.Mesh).getWorldPosition(goldTarget);
        updateGold(dt);
        const cyc = (t % FEED_CYCLE) / FEED_CYCLE;
        if (prevCycle < 0.66 && cyc >= 0.66) emitThrow();
        prevCycle = cyc;
        updateThrownOre(dt);
        // tiempo acelerado + oro acumulado
        simDays += dt * TIME_SCALE;
        if (simDays >= 365) simDays = 0;
        uiAccum += dt;
        if (uiAccum >= 0.12) {
          uiAccum = 0;
          const grams = paramsRef.current.gramsPerDay * simDays;
          setHud({ days: Math.floor(simDays), grams, usd: grams * paramsRef.current.usdPerGram });
        }
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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      controlsRef.current = null;
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
    <>
      <div className="viewer3d-stage" ref={stageRef}>
        <div className="sim-3d-overlay">
          <div className="s3o-row">
            <Clock />
            <span>
              Tiempo simulado: <b>{hud.days} días</b>
            </span>
          </div>
          <div className="s3o-row s3o-gold">
            <Coins />
            <span>
              Oro recuperado: <b>{fmtMass(hud.grams)}</b>
              <em>{fmtUsd(hud.usd)}</em>
            </span>
          </div>
        </div>
        <div className="v3d-legend">
          <span className="v3d-dot" style={{ background: "#FC8F33" }} />
          Oro → concentrado
          <span className="v3d-dot" style={{ background: "#9a9aa2", marginLeft: 14 }} />
          Relave → descarga
        </div>
        <div className="v3d-controls">
          <button type="button" onClick={toggleSim}>
            {simOn ? "Pausar" : "Reanudar"}
          </button>
          <button type="button" onClick={toggleSpin}>
            {spinOn ? "Detener giro" : "Girar"}
          </button>
        </div>
      </div>
      <div className="v3d-hint">
        <RotateCw />
        Arrastre para girar &nbsp;·&nbsp; rueda para acercar &nbsp;·&nbsp; el contador usa
        tiempo acelerado
      </div>
    </>
  );
}
