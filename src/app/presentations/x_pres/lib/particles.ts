// Inline 2D simplex noise — no external dependency
// Based on the public-domain algorithm by Stefan Gustavson

const perm = new Uint8Array(512);
const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

// Seed permutation table once
(function seedPerm() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates shuffle with a deterministic seed
  let seed = 12345;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0x100000000;
  };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})();

function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

export function noise2D(x: number, y: number): number {
  // Skewing factors for 2D simplex
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;

  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  let i1: number, j1: number;
  if (x0 > y0) { i1 = 1; j1 = 0; }
  else          { i1 = 0; j1 = 1; }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  const ii = i & 255;
  const jj = j & 255;
  const gi0 = perm[ii + perm[jj]] % 12;
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot2(grad3[gi0], x0, y0); }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot2(grad3[gi1], x1, y1); }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot2(grad3[gi2], x2, y2); }

  // Scale to [-1, 1]
  return 70 * (n0 + n1 + n2);
}

// ---------------------------------------------------------------------------
// Typed-array particle system
// ---------------------------------------------------------------------------

export const N = 600;

export const positions   = new Float32Array(N * 2);
export const velocities  = new Float32Array(N * 2);
export const confidence  = new Float32Array(N);   // 0..3  (0=none, 3=all-arcs)
export const alpha       = new Float32Array(N);
export const glyphIndex  = new Uint8Array(N);

// Target "home" positions for the assemble phase
const homeX = new Float32Array(N);
const homeY = new Float32Array(N);

// Noise time offset per particle so they don't all move identically
const noiseOffset = new Float32Array(N);

export type Phase = "disperse" | "triangulate" | "converge" | "lock" | "assemble";

export function getPhase(elapsed: number): Phase {
  if (elapsed < 200)  return "disperse";
  if (elapsed < 700)  return "triangulate";
  if (elapsed < 1100) return "converge";
  if (elapsed < 1300) return "lock";
  return "assemble";
}

// ---------------------------------------------------------------------------
// Spatial hash for neighbor repulsion
// ---------------------------------------------------------------------------
const CELL_SIZE = 20;
const spatialHash = new Map<number, number[]>();

function hashCell(cx: number, cy: number): number {
  return (cx & 0xffff) | ((cy & 0xffff) << 16);
}

function buildSpatialHash() {
  spatialHash.clear();
  for (let i = 0; i < N; i++) {
    const cx = Math.floor(positions[i * 2] / CELL_SIZE);
    const cy = Math.floor(positions[i * 2 + 1] / CELL_SIZE);
    const key = hashCell(cx, cy);
    let bucket = spatialHash.get(key);
    if (!bucket) { bucket = []; spatialHash.set(key, bucket); }
    bucket.push(i);
  }
}

function getNeighbors(i: number, radius: number): number[] {
  const px = positions[i * 2];
  const py = positions[i * 2 + 1];
  const r2 = radius * radius;
  const cx0 = Math.floor((px - radius) / CELL_SIZE);
  const cx1 = Math.floor((px + radius) / CELL_SIZE);
  const cy0 = Math.floor((py - radius) / CELL_SIZE);
  const cy1 = Math.floor((py + radius) / CELL_SIZE);
  const result: number[] = [];
  for (let cx = cx0; cx <= cx1; cx++) {
    for (let cy = cy0; cy <= cy1; cy++) {
      const bucket = spatialHash.get(hashCell(cx, cy));
      if (!bucket) continue;
      for (const j of bucket) {
        if (j === i) continue;
        const dx = positions[j * 2] - px;
        const dy = positions[j * 2 + 1] - py;
        if (dx * dx + dy * dy < r2) result.push(j);
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
export function initParticles(
  originX: number,
  originY: number,
  spreadRadius: number,
): void {
  for (let i = 0; i < N; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r     = Math.random() * spreadRadius;
    positions[i * 2]     = originX + Math.cos(angle) * r;
    positions[i * 2 + 1] = originY + Math.sin(angle) * r;
    velocities[i * 2]    = (Math.random() - 0.5) * 0.5;
    velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.5;
    confidence[i]  = 0;
    alpha[i]       = 0.6 + Math.random() * 0.4;
    glyphIndex[i]  = Math.floor(Math.random() * 64);
    noiseOffset[i] = Math.random() * 100;
    homeX[i] = 0;
    homeY[i] = 0;
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
export function updateParticles(
  phase: Phase,
  targetX: number,
  targetY: number,
  arcHits: Set<number>[],     // one Set per arc; Set contains particle indices
  dt: number,                 // milliseconds since last frame
): void {
  const dtS = dt / 1000;      // seconds

  if (phase === "disperse" || phase === "triangulate") {
    // Noise-driven drift
    const noiseScale = 0.004;
    const noiseSpeed = 0.3 * dtS;
    for (let i = 0; i < N; i++) {
      const px = positions[i * 2];
      const py = positions[i * 2 + 1];
      const nx = noise2D(px * noiseScale + noiseOffset[i], py * noiseScale);
      const ny = noise2D(px * noiseScale, py * noiseScale + noiseOffset[i] + 50);
      velocities[i * 2]     += nx * 20 * dtS;
      velocities[i * 2 + 1] += ny * 20 * dtS;

      if (phase === "triangulate") {
        velocities[i * 2]     *= 0.96;
        velocities[i * 2 + 1] *= 0.96;
      }

      positions[i * 2]     += velocities[i * 2] * noiseSpeed * 60;
      positions[i * 2 + 1] += velocities[i * 2 + 1] * noiseSpeed * 60;

      // Increment confidence from arc hits
      if (phase === "triangulate") {
        let hits = 0;
        for (const arcSet of arcHits) {
          if (arcSet.has(i)) hits++;
        }
        if (hits > 0) {
          confidence[i] = Math.min(3, confidence[i] + hits * 0.05);
        }
      }
    }
  }

  if (phase === "converge") {
    buildSpatialHash();
    const attractionStrength = 0.6;
    const repulsionRadius    = 18;
    const repulsionStrength  = 80;
    const damping            = 0.88;

    for (let i = 0; i < N; i++) {
      const px = positions[i * 2];
      const py = positions[i * 2 + 1];
      const isGold = confidence[i] >= 2;

      if (isGold) {
        // Attract toward target
        const dx = targetX - px;
        const dy = targetY - py;
        const d  = Math.sqrt(dx * dx + dy * dy) + 0.001;
        velocities[i * 2]     += (dx / d) * attractionStrength;
        velocities[i * 2 + 1] += (dy / d) * attractionStrength;

        // Neighbor repulsion
        const neighbors = getNeighbors(i, repulsionRadius);
        for (const j of neighbors) {
          const ox = px - positions[j * 2];
          const oy = py - positions[j * 2 + 1];
          const od = Math.sqrt(ox * ox + oy * oy) + 0.001;
          const force = repulsionStrength / (od * od + 1);
          velocities[i * 2]     += (ox / od) * force * dtS;
          velocities[i * 2 + 1] += (oy / od) * force * dtS;
        }
      } else {
        // Non-gold particles fade and drift
        alpha[i] *= 0.97;
      }

      velocities[i * 2]     *= damping;
      velocities[i * 2 + 1] *= damping;
      positions[i * 2]       += velocities[i * 2];
      positions[i * 2 + 1]   += velocities[i * 2 + 1];
    }
  }

  if (phase === "lock") {
    // Freeze and slightly fade
    for (let i = 0; i < N; i++) {
      velocities[i * 2]     *= 0.7;
      velocities[i * 2 + 1] *= 0.7;
      positions[i * 2]       += velocities[i * 2];
      positions[i * 2 + 1]   += velocities[i * 2 + 1];
      alpha[i] *= 0.94;
    }
  }

  if (phase === "assemble") {
    // Gold particles fly outward from center to home positions
    for (let i = 0; i < N; i++) {
      if (confidence[i] < 2) continue;
      const px = positions[i * 2];
      const py = positions[i * 2 + 1];
      const hx = homeX[i] || targetX;
      const hy = homeY[i] || targetY;
      const dx = hx - px;
      const dy = hy - py;
      velocities[i * 2]     += dx * 0.08;
      velocities[i * 2 + 1] += dy * 0.08;
      velocities[i * 2]     *= 0.85;
      velocities[i * 2 + 1] *= 0.85;
      positions[i * 2]       += velocities[i * 2];
      positions[i * 2 + 1]   += velocities[i * 2 + 1];
      alpha[i] = Math.min(1, alpha[i] + 0.03);
    }
  }
}

// Allow external code to seed home positions for the assemble phase
export function setHomePositions(
  targetX: number,
  targetY: number,
  spreadRadius: number,
): void {
  for (let i = 0; i < N; i++) {
    if (confidence[i] >= 2) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 40 + Math.random() * spreadRadius;
      homeX[i] = targetX + Math.cos(angle) * r;
      homeY[i] = targetY + Math.sin(angle) * r;
    }
  }
}
