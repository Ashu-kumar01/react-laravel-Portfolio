/*
 * Studio lighting rig: warm key, soft cool fill and subtle blue/purple rims.
 * Intensities assume three.js physically based lighting (R3F default).
 */

export const LIGHTS = {
  ambient: { intensity: 0.28, color: '#c9d2ff' },
  key: { position: [-1.8, 3.0, 2.6], intensity: 2.4, color: '#fff2e6' },
  fill: { position: [2.2, 1.6, 2.4], intensity: 0.7, color: '#dbe4ff' },
  rimPurple: { position: [1.3, 2.1, -1.6], intensity: 9, distance: 6, color: '#a78bfa' },
  rimBlue: { position: [-1.4, 1.9, -1.5], intensity: 7, distance: 6, color: '#6f9bff' },
}

/** Rim lights brighten by this factor while the character is hovered. */
export const HOVER_RIM_BOOST = 1.45

/**
 * Soft studio environment built from light panels (no HDR download):
 * gives fabric, skin and hair subtle, realistic reflections.
 */
export const ENVIRONMENT_PANELS = [
  { form: 'rect', intensity: 1.6, color: '#ffffff', position: [0, 4, 2], rotation: [Math.PI / 2, 0, 0], scale: [6, 3, 1] },
  { form: 'rect', intensity: 0.9, color: '#ffe9dc', position: [-4, 1.5, 1], rotation: [0, Math.PI / 2, 0], scale: [3, 4, 1] },
  { form: 'rect', intensity: 0.7, color: '#b9c6ff', position: [4, 1.5, -1], rotation: [0, -Math.PI / 2, 0], scale: [3, 4, 1] },
  { form: 'ring', intensity: 0.8, color: '#a78bfa', position: [0, 2, -4], rotation: [0, 0, 0], scale: [2, 2, 1] },
]
