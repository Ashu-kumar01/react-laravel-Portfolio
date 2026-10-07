/*
 * Camera framing and movement limits. Waist-up portrait framing keeps the face
 * large and the character the visual hero; units are metres (avatar ≈ 1.8 m).
 */

export const CAMERA = {
  fov: 30,
  near: 0.1,
  far: 30,
  position: [0, 1.4, 2.75],
  target: [0, 1.3, 0],
}

/** How far the camera drifts with the pointer (world units). */
export const PARALLAX = { x: 0.12, y: 0.06 }

/** Scroll response (progress 0 → 1 across the hero): moves back, turns slightly, shrinks. */
export const SCROLL = { depth: 0.9, turn: 0.2, shrink: 0.1, lift: 0.08 }

const deg = (d) => (d * Math.PI) / 180

/**
 * Pointer-follow limits in radians. Totals stay inside the brief:
 * yaw (Y) 5 + 3 + 7 = 15°, pitch (X) 2 + 5 = 7°.
 */
export const FOLLOW = {
  bodyY: deg(5),
  chestY: deg(3),
  chestX: deg(2),
  headY: deg(7),
  headX: deg(5),
  hoverY: deg(3), // extra turn while the character is hovered
}
