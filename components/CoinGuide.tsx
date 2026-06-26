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

        // ---- seguimiento por scroll: la moneda guía y se posa según la sección ----
        // sel = sección (detección de la activa, por orden de DOM); anchor = elemento de
        // referencia; at(rect,vw,vh) = centro objetivo de la moneda (px de viewport).
        // jump   = salta por encima de varios elementos (izq→der).
        // seg    = salta por N segmentos de un único elemento (p.ej. imagen de sellos).
        // invite = "amaga el click" (2 toques) sobre controles y luego se posa en `at`.
        // flip   = voltea cada card al pasar la moneda (testimonios).
        type Vec = { x: number; y: number };
        type GuideEntry = {
          key: string;
          sel: string;
          anchor?: string;
          at?: (r: DOMRect, vw: number, vh: number) => Vec;
          jump?: string;
          seg?: number;
          invite?: string;
          flip?: boolean;
          drop?: boolean; // al entrar (bajando): planea a la izq-arriba y cae con rebote
        };
        const GUIDE: GuideEntry[] = [
          // 1 inicio — arriba-derecha, a la altura de la cara / lado "Cotizar"
          { key: "hero", sel: ".hero", at: (_r, vw) => ({ x: vw - 95, y: 175 }) },
          // 2 video — rueda arriba-izquierda y CAE con rebote a la esquina inferior izq.
          { key: "video", sel: ".herovid", anchor: ".herovid-frame", drop: true, at: (r) => ({ x: 95, y: r.bottom - 58 }) },
          // 3 números — salta +165 → +6 → 4 (el conteo ya arranca solo al entrar)
          { key: "stats", sel: ".statband", jump: ".statband .stat" },
          // 4 PlanetGOLD — a la derecha de la frase
          { key: "planet", sel: ".trust", anchor: ".planet-stat", at: (r, vw) => ({ x: Math.min(r.right + 70, vw - 80), y: r.top + r.height * 0.42 }) },
          // 5 carrusel — arriba-derecha (sigue junto a "según PlanetGOLD")
          { key: "carousel", sel: ".carousel", at: (r, vw, vh) => ({ x: vw - 90, y: Math.max(r.top + 70, vh * 0.16) }) },
          // 6 ¿Por qué Meproind? — gira a la izquierda, parte baja, junto a "Mesa MEPROIND"
          { key: "why", sel: "#comparativa", anchor: ".vcard.win", at: (r) => ({ x: r.left - 18, y: r.top + r.height * 0.42 }) },
          // 7 método tradicional — al medio-izquierda de los 2 renglones del título
          { key: "mercury", sel: ".mercury", anchor: ".mercury .shead h2", at: (r) => ({ x: r.left + 24, y: r.top + r.height / 2 }) },
          // 8 10% más / 1 kilo — lado derecho
          { key: "value", sel: ".valueband", at: (r, vw) => ({ x: vw - 92, y: r.top + r.height / 2 }) },
          // 9 modelos XL — amaga click en "Más popular", luego gira a la izq. junto a XL-25
          { key: "models", sel: ".models", anchor: ".msel-tabs", invite: ".msel-tab-badge", at: (r) => ({ x: r.left - 12, y: r.top + r.height / 2 }) },
          // 10 Trabaja 100X — gira a la izquierda
          { key: "speed", sel: ".claim", at: (r) => ({ x: 96, y: r.top + r.height / 2 }) },
          // 11 simulador — amaga click en campos + cotizar, luego arriba-derecha (oro recuperado)
          { key: "sim", sel: ".sim", anchor: ".sim-right", invite: ".sim-field, .reco-cta .btn-o", at: (r) => ({ x: r.right - 64, y: r.top + 82 }) },
          // 12 anatomía — derecha, por encima de la foto del punto seleccionado
          { key: "anatomy", sel: ".anatomy", anchor: ".anat-panel", at: (r) => ({ x: r.right - 46, y: Math.max(r.top - 6, 96) }) },
          // 13 comparativa técnica — izquierda, baja con el usuario
          { key: "compare", sel: ".comparison", at: (_r, _vw, vh) => ({ x: 92, y: vh * 0.42 }) },
          // 14 GoldTech — derecha (al nivel del icono de WhatsApp), junto a "Tecnología propia"
          { key: "goldtech", sel: "#tecnologia", anchor: ".gtag", at: (r, vw) => ({ x: vw - 78, y: r.top + r.height / 2 }) },
          // 15 Conoce Meproind — amaga play, luego junto al borde izq. del video (un poco más arriba)
          { key: "video2", sel: ".videosec", anchor: ".videosec video", invite: ".videosec video", at: (r) => ({ x: r.left - 6, y: r.top + r.height * 0.36 }) },
          // 16 sellos garantía — salta sobre los 3 sellos (imagen única → 3 segmentos)
          { key: "seals", sel: ".seals", anchor: ".seals img", seg: 3 },
          // 17 prensa — a la derecha de "Reportado por El Comercio", girando
          { key: "press", sel: ".press", anchor: ".press .shead h2", at: (r, vw) => ({ x: Math.min(r.right + 60, vw - 80), y: r.top + r.height / 2 }) },
          // 18 testimonios — salta y voltea los 4 cards (der→izq), queda junto al card izquierdo
          { key: "testi", sel: ".testimonials", jump: ".tgrid .tcard", flip: true, at: (r) => ({ x: r.left - 30, y: r.top + r.height / 2 }) },
          // 19 visítenos — amaga click en Maps/Waze, luego gira a la derecha de "Waze"
          { key: "location", sel: ".location", anchor: ".location .btn-ghost-ink", invite: ".location .btn-o, .location .btn-ghost-ink", at: (r, vw) => ({ x: Math.min(r.right + 56, vw - 80), y: r.top + r.height / 2 }) },
          // 20 hablemos de su operación — amaga "Cotizar/Llamar", luego esquina inferior izq.
          { key: "cta", sel: ".ctaband", invite: ".ctaband .btn-wa, .ctaband .btn-ghost", at: (_r, _vw, vh) => ({ x: 96, y: vh - 110 }) },
        ];

        let curX = 0;
        let curY = 0;
        let posInit = false;
        let lastScrollY = window.scrollY;
        let scrollDir = 1; // +1 baja, -1 sube (para reproducir las animaciones al revés)
        // estado de la sección "especial" en curso (salto/amago)
        let sec = { key: "", t0: 0, done: false, reversed: false };
        // estado de la animación de entrada "caída + rebote" (hero → video)
        let prevActiveKey = "";
        let enterRunning = false;
        let enterT0 = 0;
        let enterFrom: Vec = { x: 0, y: 0 };
        let enterPlayedKey = ""; // sección cuya caída ya se reprodujo en esta visita
        let enterEntry: GuideEntry | null = null; // sección destino de la caída (fija)
        // rodadura (solo durante la entrada inicio→video): se acopla al avance horizontal
        let coinVX = 0; // velocidad horizontal (px/frame)
        let rollZ = 0; // ángulo de rodadura en el plano (eje Z, como rueda)

        const clearFlips = () => {
          document
            .querySelectorAll(".tcard.coin-flip")
            .forEach((e) => e.classList.remove("coin-flip"));
        };

        // easings para la entrada: cúbico (planeo que desacelera) + rebote (aterrizaje)
        const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
        const easeOutBounce = (p: number) => {
          const n1 = 7.5625;
          const d1 = 2.75;
          if (p < 1 / d1) return n1 * p * p;
          if (p < 2 / d1) {
            p -= 1.5 / d1;
            return n1 * p * p + 0.75;
          }
          if (p < 2.5 / d1) {
            p -= 2.25 / d1;
            return n1 * p * p + 0.9375;
          }
          p -= 2.625 / d1;
          return n1 * p * p + 0.984375;
        };

        // calcula el objetivo durante un salto/amago (timeline determinista por t0)
        function hopTarget(active: GuideEntry): Vec | null {
          const mode = active.jump ? "jump" : active.seg ? "seg" : "invite";
          type Item = { left: number; top: number; width: number; height: number; el?: Element };
          let items: Item[] = [];
          if (active.seg) {
            const a = document.querySelector(active.anchor ?? active.sel);
            if (!a) return null;
            const ar = a.getBoundingClientRect();
            const colW = ar.width / active.seg;
            for (let k = 0; k < active.seg; k++)
              items.push({ left: ar.left + colW * k, top: ar.top, width: colW, height: ar.height });
          } else {
            const sel = (active.jump ?? active.invite) as string;
            const els = Array.from(document.querySelectorAll(sel));
            if (!els.length) return null;
            items = els.map((el) => {
              const r = el.getBoundingClientRect();
              return { left: r.left, top: r.top, width: r.width, height: r.height, el };
            });
          }
          if (sec.reversed) items = items.slice().reverse(); // al subir: der→izq
          const lastI = items.length - 1;
          const period = mode === "invite" ? 720 : 440; // ms por elemento
          const ph = (performance.now() - sec.t0) / period;
          const i = Math.min(Math.max(Math.floor(ph), 0), lastI);
          if (ph >= lastI + (mode === "invite" ? 0.9 : 0.7)) sec.done = true;
          const it = items[i];
          if (active.flip && it.el) it.el.classList.add("coin-flip");
          const cx = it.left + it.width / 2;
          const frac = Math.min(Math.max(ph - i, 0), 1);
          if (mode === "invite") {
            // 2 toques hacia abajo sobre el control (invita a hacer click)
            const dip = Math.abs(Math.sin(frac * Math.PI * 2)) * (it.height * 0.5 + 20);
            return { x: cx, y: it.top - 4 + dip };
          }
          // salto: arco por encima del elemento
          const a = Math.min(frac / 0.5, 1);
          const amp = mode === "seg" ? it.height * 0.28 + 12 : it.height * 0.5 + 14;
          return { x: cx, y: it.top + it.height / 2 - Math.sin(a * Math.PI) * amp };
        }

        function updateGuidePos() {
          if (!host) return;
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const w = host.offsetWidth || 120;
          const now = performance.now();
          const sy = window.scrollY;
          if (sy > lastScrollY + 1) scrollDir = 1;
          else if (sy < lastScrollY - 1) scrollDir = -1;
          lastScrollY = sy;

          // sección activa por orden de DOM (umbral 0.58)
          let active: GuideEntry = GUIDE[0];
          for (const g of GUIDE) {
            const el = document.querySelector(g.sel);
            if (el && el.getBoundingClientRect().top <= vh * 0.58) active = g;
          }
          // override: una sección "especial" en la ventana de foco toma el control para
          // ADELANTARSE al usuario; arma su timeline una sola vez. Los saltos se adelantan
          // más (0.72); los amagos esperan a estar más en pantalla (0.5).
          let armed: GuideEntry | null = null;
          for (const g of GUIDE) {
            if (!(g.jump || g.seg || g.invite)) continue;
            const el = document.querySelector(g.sel);
            if (!el) continue;
            const r = el.getBoundingClientRect();
            const lead = g.invite ? 0.5 : 0.72;
            if (r.top < vh * lead && r.bottom > vh * 0.18) {
              armed = g;
              break;
            }
          }
          // mientras dura la caída no se arma ninguna sección especial (si no, el salto
          // de los números arrancaría tarde y quedaría a medias al terminar la caída)
          if (!enterRunning) {
            if (armed) {
              if (sec.key !== armed.key) {
                clearFlips();
                sec = { key: armed.key, t0: now, done: false, reversed: scrollDir < 0 };
              }
              active = armed;
            } else if (sec.key) {
              clearFlips();
              sec = { key: "", t0: 0, done: false, reversed: false };
            }
          }

          // ── entrada "caída + rebote": al pasar (bajando) a una sección con drop ──
          // OJO: una vez iniciada se completa ENTERA (no se cancela aunque la sección
          // activa ya pase a los números), por eso se fija `enterEntry` como destino.
          if (!enterRunning && enterPlayedKey && active.key !== enterPlayedKey) {
            enterPlayedKey = ""; // ya cayó y salió → se rearma para la próxima visita
          }
          if (
            !reduce &&
            active.drop &&
            scrollDir > 0 &&
            active.key !== prevActiveKey &&
            !enterRunning &&
            enterPlayedKey !== active.key &&
            posInit
          ) {
            enterRunning = true;
            enterT0 = now;
            enterFrom = { x: curX, y: curY };
            enterPlayedKey = active.key;
            enterEntry = active; // destino fijo de la caída
          }
          prevActiveKey = active.key;

          if (enterRunning && enterEntry) {
            const DUR = 1500; // más lento → se aprecia el recorrido + la caída
            const e = (now - enterT0) / DUR;
            const aEl = document.querySelector(enterEntry.anchor ?? enterEntry.sel);
            if (e >= 1 || !aEl || !enterEntry.at) {
              enterRunning = false; // terminó → continúa el lerp normal (ya está en reposo)
            } else {
              const rc = enterEntry.at(aEl.getBoundingClientRect(), vw, vh);
              const rex = rc.x - w / 2;
              const rey = rc.y - w / 2;
              const wy = Math.max(rey - 320, 8); // punto alto a la izquierda, antes de caer
              const tA = 0.5; // 1er tiempo (planeo der→izq) = la mitad del recorrido
              let px: number;
              let py: number;
              let sqX = 1;
              let sqY = 1;
              if (e < tA) {
                const a = easeOutCubic(e / tA);
                px = enterFrom.x + (rex - enterFrom.x) * a;
                py = enterFrom.y + (wy - enterFrom.y) * a;
              } else {
                const b = (e - tA) / (1 - tA); // 2º tiempo: caída con rebote (gravedad)
                const yb = easeOutBounce(b);
                px = rex;
                py = wy + (rey - wy) * yb;
                const settle = 1 - b * b; // el aplastón se desvanece al final (sin "pop")
                const impact = Math.max(0, 1 - Math.abs(yb - 1) / 0.1) * settle; // toque
                sqY = 1 - 0.16 * impact;
                sqX = 1 + 0.12 * impact;
              }
              curX = px;
              curY = py;
              host.style.transform = `translate(${Math.round(px)}px, ${Math.round(py)}px) scaleX(${sqX.toFixed(3)}) scaleY(${sqY.toFixed(3)})`;
              return; // omite el lerp normal mientras dura la caída
            }
          }

          // objetivo
          let t: Vec | null = null;
          const running =
            !!(active.jump || active.seg || active.invite) &&
            sec.key === active.key &&
            !sec.done;
          if (running) t = hopTarget(active);
          if (!t && active.at) {
            const a = document.querySelector(active.anchor ?? active.sel);
            if (a) t = active.at(a.getBoundingClientRect(), vw, vh);
          }
          if (!t) return; // sin objetivo → mantiene la última posición (p.ej. salto ya hecho)

          // mantener la moneda dentro del viewport
          const pad = 6 + w / 2;
          t = {
            x: Math.max(pad, Math.min(vw - pad, t.x)),
            y: Math.max(pad, Math.min(vh - pad, t.y)),
          };

          const tx = t.x - w / 2;
          const ty = t.y - w / 2;
          if (!posInit) {
            curX = tx;
            curY = ty;
            posInit = true;
          }

          // lerp + tope de velocidad → transiciones suaves (comportamiento normal del
          // resto de secciones; la entrada inicio→video tiene su propia caída arriba).
          let dx = (tx - curX) * 0.17;
          let dy = (ty - curY) * 0.17;
          const dist = Math.hypot(dx, dy);
          const maxStep = running ? 42 : 15;
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
          const beforeX = curX;
          updateGuidePos(); // mueve curX/curY (puede salir antes en saltos/caída)
          coinVX = posInit ? curX - beforeX : 0; // desplazamiento horizontal este frame
          // RODADURA solo en la entrada inicio→video:
          //  • planeo a la izquierda (hay avance horizontal) → rueda en el PLANO (eje Z),
          //    sin deslizamiento (ángulo = distancia/radio), con la cara al frente → se ve
          //    como una rueda/moneda rodando.
          //  • caída (sin avance) → cara al frente y la rueda se nivela para aterrizar
          //    derecha; después llega el rebote (su squash lo pone la entrada).
          // Resto del tiempo (cualquier otra sección): giro de reposo normal (eje Y).
          const TAU = Math.PI * 2;
          const Rpx = (host!.offsetWidth || 120) * 0.42; // radio aprox. de la moneda en px
          const rotY = coinGroup.rotation.y;
          if (enterRunning) {
            if (Math.abs(coinVX) > 0.6) rollZ -= coinVX / Rpx; // rueda al planear
            else rollZ += (Math.round(rollZ / TAU) * TAU - rollZ) * 0.16; // nivela al caer
            coinGroup.rotation.y += (Math.round(rotY / TAU) * TAU - rotY) * 0.14; // cara al frente
          } else {
            coinGroup.rotation.y += dt * 1.05; // giro de reposo normal
            rollZ += (Math.round(rollZ / TAU) * TAU - rollZ) * 0.16; // rueda nivelada
          }
          coinGroup.rotation.z = rollZ;
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
