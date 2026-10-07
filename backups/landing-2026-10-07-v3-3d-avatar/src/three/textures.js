import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { MONO } from './fonts'

/** Monospace glyph (e.g. "{ }" or "</>") drawn to a transparent texture. Returns { texture, aspect }. */
export function createGlyphTexture(text, color, { size = 96 } = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const font = `500 ${size}px ${MONO}`
  ctx.font = font
  const width = Math.ceil(ctx.measureText(text).width + size * 0.4)
  const height = Math.ceil(size * 1.3)
  canvas.width = width
  canvas.height = height

  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.18
  ctx.fillText(text, width / 2, height / 2)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.generateMipmaps = false
  return { texture, aspect: width / height }
}
