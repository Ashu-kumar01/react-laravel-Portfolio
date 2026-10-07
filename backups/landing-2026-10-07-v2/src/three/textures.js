import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { TOKEN_COLORS } from './codeSnippets'
import { MONO, SANS } from './fonts'

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function toTexture(canvas) {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter // no mipmaps: less memory, still crisp at these sizes
  texture.generateMipmaps = false
  texture.anisotropy = 4
  return texture
}

/** Draws a code editor panel. Returns { texture, aspect }. */
export function createCodePanelTexture(panel, { scale = 2 } = {}) {
  const fontSize = 15 * scale
  const lineHeight = 25 * scale
  const padX = 20 * scale
  const header = 36 * scale
  const width = 460 * scale
  const height = header + 18 * scale + Math.max(panel.lines.length, 2) * lineHeight + 8 * scale

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Body
  roundedRect(ctx, 1, 1, width - 2, height - 2, 14 * scale)
  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, 'rgba(22, 26, 33, 0.94)')
  bg.addColorStop(1, 'rgba(13, 15, 19, 0.94)')
  ctx.fillStyle = bg
  ctx.fill()
  ctx.lineWidth = 1.5 * scale
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.stroke()

  // Header
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(1, header, width - 2, 1 * scale)
  ;['#ff6a45', '#f5c26b', '#6fe3b4'].forEach((color, i) => {
    ctx.beginPath()
    ctx.arc(padX + i * 16 * scale, header / 2, 4.5 * scale, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.75
    ctx.fill()
    ctx.globalAlpha = 1
  })
  ctx.font = `500 ${12 * scale}px ${MONO}`
  ctx.fillStyle = 'rgba(236,235,231,0.5)'
  ctx.textBaseline = 'middle'
  ctx.fillText(panel.file, padX + 56 * scale, header / 2 + 1)

  // Code
  ctx.font = `500 ${fontSize}px ${MONO}`
  panel.lines.forEach((segments, i) => {
    const y = header + 18 * scale + i * lineHeight + lineHeight / 2
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillText(String(i + 1).padStart(2, ' '), padX, y)
    let x = padX + 34 * scale
    for (const [text, type] of segments) {
      ctx.fillStyle = TOKEN_COLORS[type] ?? TOKEN_COLORS.var
      ctx.fillText(text, x, y)
      x += ctx.measureText(text).width
    }
  })

  return { texture: toTexture(canvas), aspect: width / height }
}

/** Pill-shaped technology label. */
export function createChipTexture({ label, dot }, { scale = 2 } = {}) {
  const fontSize = 15 * scale
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.font = `500 ${fontSize}px ${SANS}`
  const textWidth = ctx.measureText(label).width
  const height = 38 * scale
  const width = Math.ceil(textWidth + 50 * scale)
  canvas.width = width
  canvas.height = height

  roundedRect(ctx, 1, 1, width - 2, height - 2, height / 2 - 1)
  ctx.fillStyle = 'rgba(18, 21, 27, 0.9)'
  ctx.fill()
  ctx.lineWidth = 1.5 * scale
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(18 * scale, height / 2, 4 * scale, 0, Math.PI * 2)
  ctx.fillStyle = dot
  ctx.fill()

  ctx.font = `500 ${fontSize}px ${SANS}`
  ctx.fillStyle = 'rgba(236,235,231,0.92)'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 30 * scale, height / 2 + 1)

  return { texture: toTexture(canvas), aspect: width / height }
}
