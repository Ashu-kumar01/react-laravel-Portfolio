/*
 * Animation math shared by the avatar (procedural or GLB). Pure functions:
 * time/pointer/scroll in, numbers out — the components apply them in useFrame.
 */

/** Frame-rate independent exponential smoothing toward `target`. */
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt))

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/** Slow, natural idle: breathing, a hint of weight shift and head drift. */
export function idle(t) {
  const breath = Math.sin(t * 1.55) // ~4 s breath cycle
  return {
    breath,
    chestScale: [1 + breath * 0.008, 1 + breath * 0.006, 1 + breath * 0.018],
    shoulderLift: breath * 0.0035,
    sway: Math.sin(t * 0.45) * 0.008, // radians (~0.5°)
    headDrift: { x: Math.sin(t * 0.6) * 0.012, y: Math.sin(t * 0.33) * 0.02, z: Math.sin(t * 0.41) * 0.01 },
  }
}

/** 0 = open, 1 = closed. A quick blink every ~4.7 s, with an occasional double blink. */
export function blink(t) {
  const period = 4.7
  const p = t % period
  const closing = (start) => {
    const d = p - start
    return d > 0 && d < 0.16 ? Math.sin((d / 0.16) * Math.PI) : 0
  }
  return Math.max(closing(0), Math.floor(t / period) % 3 === 1 ? closing(0.28) : 0)
}

/** Pointer (-1…1) → clamped rotation targets for each part of the body. */
export function followTargets(pointer, limits, hovered) {
  const x = clamp(pointer.x, -1, 1)
  const y = clamp(pointer.y, -1, 1)
  return {
    bodyY: x * (limits.bodyY + (hovered ? limits.hoverY : 0)),
    chestY: x * limits.chestY,
    chestX: y * limits.chestX,
    headY: x * limits.headY,
    headX: y * limits.headX,
  }
}

/** Scroll progress (0…1) → how far the character recedes. */
export function scrollPose(progress, cfg) {
  const p = clamp(progress, 0, 1)
  const eased = p * p * (3 - 2 * p)
  return { z: -cfg.depth * eased, rotY: cfg.turn * eased, scale: 1 - cfg.shrink * eased, y: cfg.lift * eased }
}
