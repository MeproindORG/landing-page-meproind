"use client";

import { useEffect, useRef } from "react";

/**
 * Moneda de oro 3D (Three.js) que hará de guía por el sitio.
 *
 * ETAPA 1 (actual): sólo la moneda girando en una posición fija (arriba-derecha)
 * para validar el look. Geometría realista: canto estriado + biseles (chaflanes),
 * rim (anillo) elevado real y símbolo $ EXTRUIDO en relieve real (TextGeometry),
 * con fallback a relieve por bump si la fuente no carga.
 *
 * Optimizada para baja conectividad: `three` se importa en diferido, el render se
 * pausa con la pestaña oculta y respeta `prefers-reduced-motion`.
 */
export default function CoinGuide() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } = await import(
          "three/examples/jsm/environments/RoomEnvironment.js"
        );
        if (disposed || !host) return;

        const size = () => Math.max(host.clientWidth || 128, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.22, 5.3);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(size(), size());
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        host.appendChild(renderer.domElement);

        let pmrem: THREE.PMREMGenerator | null = null;
        try {
          pmrem = new THREE.PMREMGenerator(renderer);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        } catch {
          /* IBL opcional */
        }

        scene.add(new THREE.HemisphereLight(0xfff4e6, 0x2a2620, 0.5));
        const key = new THREE.DirectionalLight(0xfff1e0, 1.5);
        key.position.set(2.5, 4.5, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xfc8f33, 0.9);
        rim.position.set(-4, -1.5, -3);
        scene.add(rim);

        // ---- $ extruido (relieve real). Si la fuente no carga → fallback a bump ----
        let dollarGeo: THREE.BufferGeometry | null = null;
        try {
          const { FontLoader } = await import("three/examples/jsm/loaders/FontLoader.js");
          const { TextGeometry } = await import(
            "three/examples/jsm/geometries/TextGeometry.js"
          );
          const fontMod = await import(
            "three/examples/fonts/helvetiker_bold.typeface.json"
          );
          const font = new FontLoader().parse((fontMod as any).default ?? fontMod);
          const tg = new TextGeometry("$", {
            font,
            size: 1,
            height: 0.04,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.016,
            bevelSegments: 2,
          });
          tg.computeBoundingBox();
          const bb = tg.boundingBox!;
          const gh = bb.max.y - bb.min.y || 1;
          const s = 0.98 / gh; // altura objetivo del $ en unidades de moneda
          tg.scale(s, s, 1);
          tg.computeBoundingBox();
          const b2 = tg.boundingBox!;
          tg.translate(-(b2.max.x + b2.min.x) / 2, -(b2.max.y + b2.min.y) / 2, 0);
          dollarGeo = tg;
        } catch {
          dollarGeo = null;
        }
        const hasRealDollar = !!dollarGeo;

        // ---- textura de la cara: oro intenso + ($ por bump sólo si no hay 3D) ----
        const S = 512;
        const faceCanvas = document.createElement("canvas");
        faceCanvas.width = faceCanvas.height = S;
        const fx = faceCanvas.getContext("2d")!;
        const bumpCanvas = document.createElement("canvas");
        bumpCanvas.width = bumpCanvas.height = S;
        const bx = bumpCanvas.getContext("2d")!;

        const faceTex = new THREE.CanvasTexture(faceCanvas);
        const bumpTex = new THREE.CanvasTexture(bumpCanvas);
        faceTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const faceTexFlip = new THREE.CanvasTexture(faceCanvas);
        const bumpTexFlip = new THREE.CanvasTexture(bumpCanvas);
        faceTexFlip.anisotropy = faceTex.anisotropy;
        [faceTexFlip, bumpTexFlip].forEach((tx) => {
          tx.wrapS = THREE.RepeatWrapping;
          tx.repeat.x = -1;
          tx.offset.x = 1;
        });

        function paintFace() {
          const g = fx.createRadialGradient(
            S * 0.42, S * 0.36, S * 0.06,
            S * 0.5, S * 0.5, S * 0.6,
          );
          g.addColorStop(0, "#ffc21a");
          g.addColorStop(0.5, "#e3a006");
          g.addColorStop(0.82, "#bd8408");
          g.addColorStop(1, "#946408");
          fx.clearRect(0, 0, S, S);
          fx.fillStyle = g;
          fx.beginPath();
          fx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
          fx.fill();

          bx.clearRect(0, 0, S, S);
          bx.fillStyle = "#808080";
          bx.beginPath();
          bx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
          bx.fill();

          if (!hasRealDollar) {
            // fallback: $ por relieve (bump) si no se pudo cargar la fuente
            const font = `bold ${Math.round(S * 0.5)}px Arial, sans-serif`;
            fx.font = bx.font = font;
            fx.textAlign = bx.textAlign = "center";
            fx.textBaseline = bx.textBaseline = "middle";
            fx.fillStyle = "#c8900a";
            fx.fillText("$", S / 2, S / 2);
            bx.save();
            bx.filter = "blur(2px)";
            bx.fillStyle = "#ffffff";
            bx.fillText("$", S / 2, S / 2);
            bx.restore();
          }
          [faceTex, bumpTex, faceTexFlip, bumpTexFlip].forEach((tx) => (tx.needsUpdate = true));
        }
        paintFace();

        // ---- estrías del canto (reeding) via bump ----
        const reedCanvas = document.createElement("canvas");
        reedCanvas.width = 1024;
        reedCanvas.height = 8;
        const rc = reedCanvas.getContext("2d")!;
        rc.fillStyle = "#808080";
        rc.fillRect(0, 0, 1024, 8);
        const reeds = 96;
        const stride = 1024 / reeds;
        for (let i = 0; i < reeds; i++) {
          rc.fillStyle = "#ffffff";
          rc.fillRect(i * stride, 0, stride * 0.42, 8);
          rc.fillStyle = "#454545";
          rc.fillRect(i * stride + stride * 0.42, 0, stride * 0.12, 8);
        }
        const reedTex = new THREE.CanvasTexture(reedCanvas);
        reedTex.wrapS = reedTex.wrapT = THREE.RepeatWrapping;

        const faceProps = {
          color: 0xffffff,
          bumpScale: 0.06,
          metalness: 0.9,
          roughness: 0.42,
          envMapIntensity: 0.5,
        };
        const faceMat = new THREE.MeshStandardMaterial({ ...faceProps, map: faceTex, bumpMap: bumpTex });
        const faceMatBack = new THREE.MeshStandardMaterial({ ...faceProps, map: faceTexFlip, bumpMap: bumpTexFlip });
        const edgeMat = new THREE.MeshStandardMaterial({
          color: 0xd49810, metalness: 0.95, roughness: 0.4, envMapIntensity: 0.5,
          bumpMap: reedTex, bumpScale: 0.03,
        });
        const bevelMat = new THREE.MeshStandardMaterial({
          color: 0xdca015, metalness: 0.95, roughness: 0.36, envMapIntensity: 0.55,
        });
        const dollarMat = new THREE.MeshStandardMaterial({
          color: 0xf0b012, metalness: 0.95, roughness: 0.32, envMapIntensity: 0.6,
          side: THREE.DoubleSide,
        });

        // ---- geometría: canto estriado + biseles + caras + rim + $ extruido ----
        const RADIUS = 1.15;
        const THICK = 0.24;
        const BEVEL = 0.08;
        const faceR = RADIUS - BEVEL;
        const halfStraight = THICK / 2 - BEVEL;
        const coinGroup = new THREE.Group();

        const edge = new THREE.Mesh(
          new THREE.CylinderGeometry(RADIUS, RADIUS, halfStraight * 2, 140, 1, true),
          edgeMat,
        );
        edge.rotation.x = Math.PI / 2;
        coinGroup.add(edge);

        const bevelFront = new THREE.Mesh(
          new THREE.CylinderGeometry(faceR, RADIUS, BEVEL, 140, 1, true), bevelMat,
        );
        bevelFront.rotation.x = Math.PI / 2;
        bevelFront.position.z = halfStraight + BEVEL / 2;
        coinGroup.add(bevelFront);
        const bevelBack = new THREE.Mesh(
          new THREE.CylinderGeometry(RADIUS, faceR, BEVEL, 140, 1, true), bevelMat,
        );
        bevelBack.rotation.x = Math.PI / 2;
        bevelBack.position.z = -(halfStraight + BEVEL / 2);
        coinGroup.add(bevelBack);

        const front = new THREE.Mesh(new THREE.CircleGeometry(faceR, 140), faceMat);
        front.position.z = THICK / 2;
        coinGroup.add(front);
        const back = new THREE.Mesh(new THREE.CircleGeometry(faceR, 140), faceMatBack);
        back.rotation.y = Math.PI;
        back.position.z = -THICK / 2;
        coinGroup.add(back);

        // rim (anillo) elevado real
        const rimGeo = new THREE.TorusGeometry(faceR - 0.05, 0.022, 18, 130);
        const rimFront = new THREE.Mesh(rimGeo, bevelMat);
        rimFront.position.z = THICK / 2 + 0.005;
        coinGroup.add(rimFront);
        const rimBack = new THREE.Mesh(rimGeo, bevelMat);
        rimBack.position.z = -(THICK / 2 + 0.005);
        coinGroup.add(rimBack);

        // $ EXTRUIDO en relieve real (delante y detrás)
        let dFront: THREE.Mesh | null = null;
        let dBack: THREE.Mesh | null = null;
        if (dollarGeo) {
          dFront = new THREE.Mesh(dollarGeo, dollarMat);
          dFront.position.z = THICK / 2 - 0.008; // base levemente embebida
          coinGroup.add(dFront);
          dBack = new THREE.Mesh(dollarGeo, dollarMat);
          dBack.position.z = -(THICK / 2 - 0.008);
          dBack.scale.z = -1; // se eleva hacia -Z y se lee derecho desde atrás
          coinGroup.add(dBack);
        }

        scene.add(coinGroup);

        const onResize = () => renderer.setSize(size(), size());
        window.addEventListener("resize", onResize);

        let raf = 0;
        let lastT = performance.now();
        let visible = !document.hidden;
        const onVis = () => {
          visible = !document.hidden;
          if (visible && !reduce) {
            lastT = performance.now();
            if (!raf) loop();
          }
        };
        document.addEventListener("visibilitychange", onVis);

        // ---- seguimiento por scroll: la moneda se posiciona según la sección ----
        // sel = sección (para detectar la activa); anchor = elemento de referencia
        // (opcional); at(rect, vw, vh) = centro objetivo de la moneda en px de viewport.
        type GuideEntry = {
          sel: string;
          anchor?: string;
          jump?: string; // selector de elementos sobre los que la moneda salta (izq→der)
          at?: (r: DOMRect, vw: number, vh: number) => { x: number; y: number };
        };
        const GUIDE: GuideEntry[] = [
          // inicio: arriba-derecha, a la altura de la cara / lado "Cotizar"
          { sel: ".hero", at: (_r, vw) => ({ x: vw - 95, y: 175 }) },
          // video: abajo a la izquierda (hacia el borde), acompaña al video al subir
          { sel: ".herovid", anchor: ".herovid-frame", at: (r) => ({ x: 75, y: r.bottom - 50 }) },
          // números: salta sobre cada número (+165 → +6 → 4); el ciclo se bloquea hasta completar
          { sel: ".statband", jump: ".statband .stat" },
          // PlanetGOLD: a la derecha del texto
          { sel: ".trust", anchor: ".planet-stat", at: (r, vw) => ({ x: Math.min(r.right + 72, vw - 48), y: r.top + r.height * 0.4 }) },
        ];
        let curX = 0;
        let curY = 0;
        let posInit = false;
        let jumpStartT = 0;
        let jumpArmed = false;
        let jumpDone = false;
        function updateGuidePos() {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const w = host.offsetWidth || 120;
          // sección activa por umbral (entradas sin salto)
          let active: GuideEntry = GUIDE[0];
          for (const g of GUIDE) {
            if (g.jump) continue;
            const el = document.querySelector(g.sel);
            if (el && el.getBoundingClientRect().top <= vh * 0.58) active = g;
          }
          // números: activa al entrar al foco y BLOQUEA hasta completar 165→6→4
          const statsEntry = GUIDE.find((g) => g.jump);
          const sb = statsEntry ? document.querySelector(statsEntry.sel) : null;
          const sbr = sb ? sb.getBoundingClientRect() : null;
          const sbVisible = !!sbr && sbr.bottom > 0 && sbr.top < vh;
          if (!sbVisible) {
            jumpArmed = false;
            jumpDone = false; // banda fuera de vista → lista para la próxima visita
          }
          if (statsEntry && sbr) {
            const inZone = !jumpDone && sbr.top < vh * 0.72 && sbr.bottom > vh * 0.15;
            if (inZone || (jumpArmed && !jumpDone && sbVisible)) active = statsEntry;
          }
          let t: { x: number; y: number } | null = null;
          if (active.jump) {
            const els = Array.from(document.querySelectorAll(active.jump));
            if (els.length) {
              const f = els[0].getBoundingClientRect();
              const fcx = f.left + f.width / 2;
              const fcy = f.top + f.height / 2;
              if (!jumpArmed) {
                // viaja al 1.º número; arma el ciclo cuando LLEGA cerca → 165→6→4 desde el inicio
                if (Math.hypot(curX - (fcx - w / 2), curY - (fcy - w / 2)) < 50) {
                  jumpStartT = performance.now();
                  jumpArmed = true;
                }
                t = { x: fcx, y: fcy };
              } else {
                const period = 560; // ms por número
                const lastI = els.length - 1;
                const ph = (performance.now() - jumpStartT) / period;
                const i = Math.min(Math.floor(ph), lastI);
                if (ph >= lastI + 0.7) jumpDone = true; // completó + hold en el último (4)
                const frac = ph - i;
                const a = Math.min(frac / 0.45, 1);
                const r = els[i].getBoundingClientRect();
                const hop = -Math.sin(a * Math.PI) * (r.height * 0.45 + 12);
                t = { x: r.left + r.width / 2, y: r.top + r.height / 2 + hop };
              }
            }
          }
          if (!t) {
            const anchorEl = document.querySelector(active.anchor ?? active.sel);
            if (!anchorEl || !active.at) return;
            t = active.at(anchorEl.getBoundingClientRect(), vw, vh);
          }
          const tx = t.x - w / 2;
          const ty = t.y - w / 2;
          if (!posInit) {
            curX = tx;
            curY = ty;
            posInit = true;
          }
          // lerp + tope de velocidad → transiciones grandes suaves; durante el salto el tope
          // sube para alcanzar números separados.
          let dx = (tx - curX) * 0.17;
          let dy = (ty - curY) * 0.17;
          const dist = Math.hypot(dx, dy);
          const maxStep = active.jump && jumpArmed ? 42 : 15;
          if (dist > maxStep) {
            dx = (dx / dist) * maxStep;
            dy = (dy / dist) * maxStep;
          }
          curX += dx;
          curY += dy;
          host.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        }

        function loop() {
          raf = requestAnimationFrame(loop);
          const now = performance.now();
          const dt = Math.min((now - lastT) / 1000, 0.05);
          lastT = now;
          if (!visible) return;
          coinGroup.rotation.y += dt * 1.05;
          updateGuidePos();
          renderer.render(scene, camera);
        }
        updateGuidePos(); // posición inicial (también para reduce-motion)
        renderer.render(scene, camera);
        if (!reduce) loop();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVis);
          [faceTex, bumpTex, faceTexFlip, bumpTexFlip, reedTex].forEach((t) => t.dispose());
          [edge, bevelFront, bevelBack, front, back, rimFront, rimBack].forEach((m) =>
            m.geometry.dispose(),
          );
          if (dollarGeo) dollarGeo.dispose();
          [faceMat, faceMatBack, edgeMat, bevelMat, dollarMat].forEach((m) => m.dispose());
          if (pmrem) pmrem.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode === host) {
            host.removeChild(renderer.domElement);
          }
        };
      } catch {
        /* sin WebGL → simplemente no se muestra la moneda */
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div className="coin-guide" ref={hostRef} aria-hidden="true" />;
}
