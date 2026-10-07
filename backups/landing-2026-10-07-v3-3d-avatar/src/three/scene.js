/*
 * Scene-wide configuration for the hero's 3D developer avatar.
 * Pure data — no React and no `three` import, so it is safe to load eagerly.
 */

/**
 * Render tiers chosen by `useSceneQuality`:
 *  - full:   capable desktops
 *  - lite:   tablets and low-end laptops
 *  - mobile: phones — lower DPR, fewer particles/motifs, no shadow maps, simpler lights
 * `shadowMap` is the soft (PCF) key-light shadow resolution; 0 disables shadows.
 */
export const QUALITY = {
  full: { dpr: [1, 1.75], antialias: true, particles: 120, shadowMap: 1024, environment: true, fill: true, tech: 7 },
  lite: { dpr: [1, 1.5], antialias: true, particles: 60, shadowMap: 512, environment: true, fill: true, tech: 4 },
  mobile: { dpr: [1, 1.25], antialias: false, particles: 24, shadowMap: 0, environment: false, fill: false, tech: 2 },
}

/**
 * Optional production model. Set VITE_AVATAR_MODEL_URL to a .glb/.gltf (Draco supported),
 * e.g. `/models/developer-avatar.glb` served from `public/models/`. When unset, the
 * built-in stylised procedural avatar is rendered instead — nothing to download.
 */
export const AVATAR_MODEL_URL = import.meta.env.VITE_AVATAR_MODEL_URL || ''

/** Self-hosted Draco decoder (copied from three/examples into public/draco). */
export const DRACO_DECODER_PATH = `${import.meta.env.BASE_URL}draco/`

/** A loaded GLB is normalised to this height (metres) with its feet at y = 0. */
export const AVATAR_HEIGHT = 1.8

/** Shared palette for the scene — calm navy with blue/purple accents. */
export const PALETTE = {
  skin: '#c08867',
  hair: '#121012',
  stubble: '#2a201c',
  blazer: '#1b2746',
  lapel: '#152038',
  trousers: '#161c30',
  shirt: '#f2f3f5',
  eye: '#f1ede6',
  iris: '#3a2418',
  lip: '#9c6150',
  accentBlue: '#7aa2ff',
  accentPurple: '#a78bfa',
  react: '#61dafb',
  laravel: '#ff5a4f',
}
