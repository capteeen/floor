import catalog from "@/nft-images/collections.json";
import { nftSrc } from "@/lib/format";
import * as THREE from "three";

function orbNftSources() {
  const groups = catalog.collections.map((collection) =>
    collection.files.filter((file) => file.startsWith("nft-")).map(nftSrc),
  );
  const tiles: string[] = [];
  const max = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < max; index++) {
    for (const group of groups) {
      if (group[index]) tiles.push(group[index]);
    }
  }
  return tiles;
}

const TILE_SRC = orbNftSources();
const TW = 256;
const TH = 256;
const COLS = 12;
const ROWS = Math.max(1, Math.ceil(TILE_SRC.length / COLS));
const TILES = TILE_SRC.length;
const SEG = 7;
const PER = 4 * (SEG + 1);
const HOVER_POP = 1.12;
const AUTO = (Math.PI * 2) / 20;
const SPHERE = {
  R: 1,
  nEquator: 20,
  latLimit: 84,
  gap: 0.1,
};
const ASPECTS = [1, 1, 1, 1.04, 0.96, 1.02, 0.98, 1];

type Card = {
  lat: number;
  lon: number;
  rad: number;
  w: number;
  h: number;
  roll: number;
  tile: number;
  vBase: number;
  outline: Array<[number, number]>;
  basis: {
    n: [number, number, number];
    R: [number, number, number];
    U: [number, number, number];
  };
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, values: T[]) {
  return values[Math.min(values.length - 1, (random() * values.length) | 0)];
}

function rr(random: () => number, min: number, max: number) {
  return min + random() * (max - min);
}

let atlasCanvasPromise: Promise<HTMLCanvasElement> | null = null;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const imageRatio = image.width / image.height;
  const tileRatio = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;
  if (imageRatio > tileRatio) {
    sw = image.height * tileRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / tileRatio;
    sy = (image.height - sh) / 2;
  }
  context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

function getAtlasCanvas() {
  if (!atlasCanvasPromise) {
    atlasCanvasPromise = (async () => {
      const canvas = document.createElement("canvas");
      canvas.width = TW * COLS;
      canvas.height = TH * ROWS;
      const context = canvas.getContext("2d");
      if (!context) return canvas;
      context.fillStyle = "#07080c";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const images = await Promise.all(TILE_SRC.map(loadImage));
      images.forEach((image, index) => {
        if (!image) return;
        drawCover(context, image, (index % COLS) * TW, ((index / COLS) | 0) * TH, TW, TH);
      });
      return canvas;
    })();
  }
  return atlasCanvasPromise;
}

function buildCards() {
  const random = mulberry32(424242);
  const out: Array<Omit<Card, "vBase" | "outline" | "basis"> & Partial<Card>> = [];
  const lim = (SPHERE.latLimit * Math.PI) / 180;
  const cellEq = (2 * Math.PI) / SPHERE.nEquator;
  const nRings = Math.max(1, Math.round((lim * 2) / (cellEq / 1.5)));
  const pitch = (lim * 2) / nRings;

  for (let j = 0; j <= nRings; j++) {
    const lat = -lim + j * pitch;
    const cl = Math.max(0.05, Math.cos(lat));
    const n = Math.max(1, Math.round(SPHERE.nEquator * cl));
    const cellW = (2 * Math.PI * cl) / n;
    const cellH = pitch;
    const maxW = cellW * (1 - SPHERE.gap);
    const maxH = cellH * (1 - SPHERE.gap);
    const off = random() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const asp = pick(random, ASPECTS);
      const roll = rr(random, -0.045, 0.045);
      const ca = Math.cos(roll);
      const sa = Math.abs(Math.sin(roll));
      let w = Math.min(maxW / (ca + sa / asp), maxH / (ca / asp + sa));
      w *= rr(random, 0.86, 0.96);
      const h = w / asp;
      const slackLon = Math.max(0, (cellW - (w * ca + h * sa)) / 2);
      out.push({
        lat,
        lon: off + (i / n) * Math.PI * 2 + (slackLon / cl) * rr(random, -0.85, 0.85),
        rad: SPHERE.R * (1 + rr(random, 0, 0.02)),
        w,
        h,
        roll,
        tile: 0,
      });
    }
  }

  const idx = out.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const k = (random() * (i + 1)) | 0;
    [idx[i], idx[k]] = [idx[k], idx[i]];
  }
  idx.forEach((origin, i) => {
    out[origin].tile = i % TILES;
  });

  const dir = out.map((card) => {
    const cl = Math.cos(card.lat);
    return [cl * Math.sin(card.lon), Math.sin(card.lat), cl * Math.cos(card.lon)] as const;
  });
  const minDot = Math.cos(0.62);
  const clash = (i: number) => {
    for (let j = 0; j < out.length; j++) {
      if (j === i || out[j].tile !== out[i].tile) continue;
      const d = dir[i][0] * dir[j][0] + dir[i][1] * dir[j][1] + dir[i][2] * dir[j][2];
      if (d > minDot) return true;
    }
    return false;
  };

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < out.length; i++) {
      if (!clash(i)) continue;
      for (let t = 0; t < 24; t++) {
        const k = (random() * out.length) | 0;
        if (k === i) continue;
        const a = out[i].tile;
        const b = out[k].tile;
        out[i].tile = b;
        out[k].tile = a;
        if (!clash(i) && !clash(k)) break;
        out[i].tile = a;
        out[k].tile = b;
      }
    }
  }

  return out as Card[];
}

function cardOutline(w: number, h: number, rad: number, seg: number) {
  const a = w / 2;
  const b = h / 2;
  const q = Math.min(rad, a * 0.9, b * 0.9);
  const pts: Array<[number, number]> = [];
  const corners: Array<[number, number, number]> = [
    [a - q, b - q, 0],
    [-a + q, b - q, Math.PI / 2],
    [-a + q, -b + q, Math.PI],
    [a - q, -b + q, -Math.PI / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let s = 0; s <= seg; s++) {
      const t = a0 + (s / seg) * (Math.PI / 2);
      pts.push([cx + Math.cos(t) * q, cy + Math.sin(t) * q]);
    }
  }
  return pts;
}

function cardBasis(card: Card) {
  const cl = Math.cos(card.lat);
  const sl = Math.sin(card.lat);
  const cs = Math.cos(card.lon);
  const sn = Math.sin(card.lon);
  const n: [number, number, number] = [cl * sn, sl, cl * cs];
  const u: [number, number, number] = [-sl * sn, cl, -sl * cs];
  const g: [number, number, number] = [
    u[1] * n[2] - u[2] * n[1],
    u[2] * n[0] - u[0] * n[2],
    u[0] * n[1] - u[1] * n[0],
  ];
  const cr = Math.cos(card.roll);
  const sr = Math.sin(card.roll);
  return {
    n,
    R: [g[0] * cr + u[0] * sr, g[1] * cr + u[1] * sr, g[2] * cr + u[2] * sr] as [number, number, number],
    U: [u[0] * cr - g[0] * sr, u[1] * cr - g[1] * sr, u[2] * cr - g[2] * sr] as [number, number, number],
  };
}

function writeCard(pos: Float32Array, card: Card, scale: number, radMul: number) {
  const basis = card.basis;
  const rad = card.rad * radMul;
  const ox = basis.n[0] * rad;
  const oy = basis.n[1] * rad;
  const oz = basis.n[2] * rad;
  let p = card.vBase * 3;
  pos[p++] = ox;
  pos[p++] = oy;
  pos[p++] = oz;
  for (let i = 0; i < card.outline.length; i++) {
    const x = card.outline[i][0] * scale;
    const y = card.outline[i][1] * scale;
    pos[p++] = ox + basis.R[0] * x + basis.U[0] * y;
    pos[p++] = oy + basis.R[1] * x + basis.U[1] * y;
    pos[p++] = oz + basis.R[2] * x + basis.U[2] * y;
  }
}

function buildGeometry(cards: Card[]) {
  const vCount = cards.length * (PER + 1);
  const pos = new Float32Array(vCount * 3);
  const uv = new Float32Array(vCount * 2);
  const col = new Float32Array(vCount * 3).fill(1);
  const idx = new Uint32Array(cards.length * PER * 3);
  const tileU = 1 / COLS;
  const tileV = 1 / ROWS;
  const inset = 0.5 / TW;
  let up = 0;
  let ip = 0;
  let vbase = 0;

  for (const card of cards) {
    card.basis = cardBasis(card);
    card.outline = cardOutline(card.w, card.h, card.w * 0.065, SEG);
    card.vBase = vbase;
    writeCard(pos, card, 1, 1);

    const cl = card.tile % COLS;
    const row = (card.tile / COLS) | 0;
    const asp = card.w / card.h;
    const tileAsp = TW / TH;
    const us = asp > tileAsp ? 1 : asp / tileAsp;
    const vs = asp > tileAsp ? tileAsp / asp : 1;
    uv[up++] = (cl + 0.5) * tileU;
    uv[up++] = (row + 0.5) * tileV;
    for (let i = 0; i < card.outline.length; i++) {
      const lu = 0.5 + (card.outline[i][0] / card.w) * us;
      const lv = 0.5 + (card.outline[i][1] / card.h) * vs;
      uv[up++] = (cl + Math.min(1 - inset, Math.max(inset, lu))) * tileU;
      uv[up++] = (row + (1 - Math.min(1 - inset, Math.max(inset, lv)))) * tileV;
    }
    for (let i = 0; i < PER; i++) {
      idx[ip++] = vbase;
      idx[ip++] = vbase + 1 + i;
      idx[ip++] = vbase + 1 + ((i + 1) % PER);
    }
    vbase += PER + 1;
  }

  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3);
  const colAttr = new THREE.BufferAttribute(col, 3);
  geometry.setAttribute("position", posAttr);
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setAttribute("color", colAttr);
  geometry.setIndex(new THREE.BufferAttribute(idx, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.35);
  return { geometry, pos, posAttr, colAttr };
}

export function mountOrbGallery(host: HTMLElement, canvas: HTMLCanvasElement) {
  let disposed = false;
  let frame = 0;
  let renderer: THREE.WebGLRenderer | null = null;
  let geometry: THREE.BufferGeometry | null = null;
  let material: THREE.MeshBasicMaterial | null = null;
  let atlasTex: THREE.CanvasTexture | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const start = async () => {
    try {
    const atlasCanvas = await getAtlasCanvas();
    if (disposed) return;

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(19, 1, 0.1, 60);
    atlasTex = new THREE.CanvasTexture(atlasCanvas);
    atlasTex.flipY = false;
    atlasTex.encoding = THREE.sRGBEncoding;
    atlasTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    atlasTex.minFilter = THREE.LinearMipmapLinearFilter;
    atlasTex.magFilter = THREE.LinearFilter;
    atlasTex.generateMipmaps = true;
    atlasTex.needsUpdate = true;

    const cards = buildCards();
    const hoverT = new Float32Array(cards.length);
    const live = new Set<number>();
    const built = buildGeometry(cards);
    geometry = built.geometry;

    material = new THREE.MeshBasicMaterial({
      map: atlasTex,
      side: THREE.FrontSide,
      vertexColors: true,
      toneMapped: false,
    });
    const cardMesh = new THREE.Mesh(geometry, material);
    const orbGroup = new THREE.Group();
    orbGroup.add(cardMesh);
    scene.add(orbGroup);

    const canHover = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hoverBall = new THREE.Sphere(new THREE.Vector3(), 1.06);
    const hitPt = new THREE.Vector3();

    let yaw = 0;
    let pitch = 0;
    let yawVel = 0;
    let pitchVel = 0;
    let dragging = false;
    let lastPointer: { x: number; y: number } | null = null;
    let hoverPos: { x: number; y: number } | null = null;
    let hoverIdx = -1;
    let dimT = 0;
    let slowT = 0;
    let fitW = 0;
    let fitH = 0;
    let prev = performance.now();

    const fitCamera = (force = false) => {
      if (!renderer) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width < 2 || height < 2) return;
      if (!force && width === fitW && height === fitH) return;
      fitW = width;
      fitH = height;
      const distance = 4;
      const alpha = Math.asin(1 / distance);
      const wide = width > 720;
      const diameter = wide
        ? Math.min(0.62 * width, 0.9 * height)
        : Math.min(0.92 * width, 0.96 * height);
      const halfFov = Math.atan(Math.tan(alpha) * height / diameter);
      camera.fov = Math.max(4, Math.min(100, ((halfFov * 2) * 180) / Math.PI));
      camera.aspect = width / height;
      camera.position.set(0, 0, distance);
      camera.updateProjectionMatrix();
      orbGroup.position.set(wide ? 0.78 : 0, 0, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
    };

    const updateHover = (dt: number) => {
      if (!material) return;
      let want = -1;
      if (hoverPos && !dragging && canHover) {
        ndc.set(hoverPos.x, hoverPos.y);
        raycaster.setFromCamera(ndc, camera);
        hoverBall.center.copy(orbGroup.position);
        if (raycaster.ray.intersectsSphere(hoverBall)) {
          const hit = raycaster.intersectObject(cardMesh, false)[0];
          if (hit && hit.faceIndex !== undefined) want = Math.floor(hit.faceIndex / PER);
          else if (hoverIdx >= 0) want = hoverIdx;
          else if (raycaster.ray.intersectSphere(hoverBall, hitPt)) {
            orbGroup.worldToLocal(hitPt).normalize();
            let best = -1;
            let bestDot = -2;
            for (let i = 0; i < cards.length; i++) {
              const n = cards[i].basis.n;
              const d = n[0] * hitPt.x + n[1] * hitPt.y + n[2] * hitPt.z;
              if (d > bestDot) {
                bestDot = d;
                best = i;
              }
            }
            want = best;
          }
        }
      }

      if (want !== hoverIdx) {
        if (hoverIdx >= 0) live.add(hoverIdx);
        if (want >= 0) live.add(want);
        hoverIdx = want;
      }

      const ease = 1 - Math.pow(0.0009, dt);
      dimT += ((hoverIdx >= 0 ? 1 : 0) - dimT) * ease;
      slowT += ((hoverIdx >= 0 ? 1 : 0) - slowT) * ease;
      const dimTo = 1 - 0.42 * dimT;
      material.color.setScalar(dimTo);

      let movedGeo = false;
      let movedCol = false;
      for (const i of Array.from(live)) {
        const target = i === hoverIdx ? 1 : 0;
        const t = hoverT[i] + (target - hoverT[i]) * ease;
        hoverT[i] = Math.abs(t - target) < 0.0015 ? target : t;
        const card = cards[i];
        const k = 1 + hoverT[i] * (HOVER_POP - 1);
        writeCard(built.pos, card, k, k);
        movedGeo = true;
        const lift = 1 + hoverT[i] * (1 / dimTo - 1);
        const colors = built.colAttr.array as Float32Array;
        const v0 = card.vBase * 3;
        const v1 = v0 + (PER + 1) * 3;
        for (let v = v0; v < v1; v++) colors[v] = lift;
        movedCol = true;
        if (hoverT[i] === 0 && i !== hoverIdx) live.delete(i);
      }
      if (movedGeo) built.posAttr.needsUpdate = true;
      if (movedCol) built.colAttr.needsUpdate = true;
    };

    const tick = (now: number) => {
      if (disposed || !renderer) return;
      frame = window.requestAnimationFrame(tick);
      let dt = (now - prev) / 1000;
      prev = now;
      if (dt > 0.1) dt = 0.1;
      fitCamera();
      if (!dragging) {
        yaw += (AUTO * (reduce ? 0 : 1) * (1 - 0.78 * slowT) + yawVel) * dt;
        yawVel *= Math.pow(0.0016, dt);
        pitch += pitchVel * dt;
        pitchVel *= Math.pow(0.0016, dt);
        pitch *= Math.pow(0.22, dt);
      }
      orbGroup.rotation.set(pitch, yaw, 0);
      updateHover(dt);
      renderer.render(scene, camera);
    };

    const rad = () => Math.min(canvas.clientWidth, canvas.clientHeight) || 1;
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      canvas.classList.add("dragging");
      canvas.setPointerCapture(event.pointerId);
      lastPointer = { x: event.clientX, y: event.clientY };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (canHover && event.pointerType !== "touch") {
        const bounds = canvas.getBoundingClientRect();
        hoverPos = {
          x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          y: -(((event.clientY - bounds.top) / bounds.height) * 2) + 1,
        };
      }
      if (!dragging || !lastPointer) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      lastPointer = { x: event.clientX, y: event.clientY };
      const k = 2.6 / rad();
      yaw += dx * k;
      yawVel = dx * k * 60 * 0.35;
      pitch = Math.max(-0.26, Math.min(0.26, pitch + dy * k * 0.55));
      pitchVel = dy * k * 60 * 0.2;
    };
    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.classList.remove("dragging");
      lastPointer = null;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    };
    const onPointerLeave = (event: PointerEvent) => {
      hoverPos = null;
      endDrag(event);
    };

    const onResize = () => fitCamera(true);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => fitCamera());
      resizeObserver.observe(host);
    }

    fitCamera(true);
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(tick);

    cleanupListeners = () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
    };
    } catch (error) {
      console.error("OrbGallery failed to start", error);
    }
  };

  let cleanupListeners = () => {};
  void start();

  return () => {
    disposed = true;
    if (frame) window.cancelAnimationFrame(frame);
    cleanupListeners();
    resizeObserver?.disconnect();
    geometry?.dispose();
    material?.dispose();
    atlasTex?.dispose();
    renderer?.dispose();
  };
}
