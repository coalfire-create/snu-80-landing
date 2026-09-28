// Each generator returns a Float32Array of `count` xyz positions.

function rand(a, b) {
  return a + Math.random() * (b - a)
}

// Sample points from rendered text. Pixels with alpha become candidate positions.
export function textShape(count, text, { width = 11, font = '900 220px "Noto Serif KR", serif', depth = 0.35, y = 0 } = {}) {
  const cw = 1400
  const ch = 420
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = font
  // Shrink to fit.
  let size = parseInt(font.match(/(\d+)px/)[1], 10)
  while (ctx.measureText(text).width > cw * 0.94 && size > 20) {
    size -= 6
    ctx.font = font.replace(/\d+px/, `${size}px`)
  }
  ctx.fillText(text, cw / 2, ch / 2)

  const data = ctx.getImageData(0, 0, cw, ch).data
  const pts = []
  let minX = cw, maxX = 0, minY = ch, maxY = 0
  for (let py = 0; py < ch; py += 2) {
    for (let px = 0; px < cw; px += 2) {
      if (data[(py * cw + px) * 4 + 3] > 128) {
        pts.push(px, py)
        minX = Math.min(minX, px); maxX = Math.max(maxX, px)
        minY = Math.min(minY, py); maxY = Math.max(maxY, py)
      }
    }
  }

  // Scale the glyphs' bounding box to `width` world units, centered.
  const scale = width / Math.max(1, maxX - minX)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * (pts.length / 2)) * 2
    out[i * 3] = (pts[j] - cx + rand(-1, 1)) * scale
    out[i * 3 + 1] = -(pts[j + 1] - cy + rand(-1, 1)) * scale + y
    out[i * 3 + 2] = rand(-depth, depth)
  }
  return out
}

import snuPath from './snu_path.js'

// Authentic Seoul National University Official Seal formed exclusively by starlight particles.
// Uses Path2D and high-resolution stroke rasterization so every contour (laurel wreath, crossed pen & torch,
// open book with VERITAS LUX MEA, and the central shield) is unmistakably clear and crisp.
let cachedEmblemPoints = null

function getEmblemPoints() {
  if (cachedEmblemPoints) return cachedEmblemPoints

  const cw = 1100
  const ch = 1140
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  // Clean black background
  ctx.clearRect(0, 0, cw, ch)

  // Map SVG viewBox (162.86 x 168.93) to canvas (cw x ch)
  const scaleX = cw / 162.86012
  const scaleY = ch / 168.93428
  ctx.scale(scaleX, scaleY)
  ctx.translate(-212.27147, 92.121406)
  ctx.transform(1.6999673, 0, 0, 1.6999673, -205.58145, 5.3577358)

  // Fill the seal exactly as the SVG does. Stroking it instead (at ~11x scale)
  // swelled every line past the gaps between letters and leaves.
  ctx.fillStyle = '#ffffff'
  ctx.fill(new Path2D(snuPath), 'nonzero')

  const data = ctx.getImageData(0, 0, cw, ch).data
  const inside = (x, y) => x >= 0 && y >= 0 && x < cw && y < ch && data[(y * cw + x) * 4 + 3] > 128
  const edgePts = []
  const fillPts = []
  let minX = cw, maxX = 0, minY = ch, maxY = 0

  // Inked pixels that touch a gap within 3px form the contour; the rest is body.
  const R = 3
  for (let py = 0; py < ch; py += 2) {
    for (let px = 0; px < cw; px += 2) {
      if (!inside(px, py)) continue
      const edge = !inside(px - R, py) || !inside(px + R, py) || !inside(px, py - R) || !inside(px, py + R)
      ;(edge ? edgePts : fillPts).push(px, py)
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
    }
  }

  cachedEmblemPoints = { edgePts, fillPts, minX, maxX, minY, maxY }
  console.log('[SNU 3D Particle Seal] Contours generated:', edgePts.length / 2, 'Interior points:', fillPts.length / 2)
  return cachedEmblemPoints
}

export function snuOfficialEmblemShape(count, size = 9.4, { depth = 0.18, y = 0.05 } = {}) {
  const { edgePts, fillPts, minX, maxX, minY, maxY } = getEmblemPoints()
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const scale = size / Math.max(maxX - minX, maxY - minY)

  const out = new Float32Array(count * 3)

  // Half the particles trace the contours so every symbol reads clearly
  const edgeCount = Math.floor(count * 0.6)
  const edgeTotal = edgePts.length / 2

  for (let i = 0; i < edgeCount; i++) {
    const idx = Math.floor(Math.random() * edgeTotal) * 2
    const px = (edgePts[idx] - cx + rand(-0.6, 0.6)) * scale
    const py = -(edgePts[idx + 1] - cy + rand(-0.6, 0.6)) * scale + y
    out[i * 3] = px
    out[i * 3 + 1] = py
    out[i * 3 + 2] = rand(-depth * 0.4, depth * 0.4)
  }

  // ...and most of the rest fill the inked body evenly
  const fillCount = Math.floor(count * 0.35)
  const fillTotal = fillPts.length / 2
  for (let i = edgeCount; i < edgeCount + fillCount; i++) {
    const idx = Math.floor(Math.random() * fillTotal) * 2
    const px = (fillPts[idx] - cx + rand(-1, 1)) * scale
    const py = -(fillPts[idx + 1] - cy + rand(-1, 1)) * scale + y
    out[i * 3] = px
    out[i * 3 + 1] = py
    out[i * 3 + 2] = rand(-depth * 0.7, depth * 0.7)
  }

  // The remaining 5% form a faint dust haze around the emblem
  for (let i = edgeCount + fillCount; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const r = (size * 0.45) + Math.pow(Math.random(), 2) * (size * 0.3)
    out[i * 3] = Math.cos(a) * r
    out[i * 3 + 1] = Math.sin(a) * r + y
    out[i * 3 + 2] = rand(-0.35, 0.35)
  }

  return out
}

// Fibonacci sphere with orbiting rings and a dense cluster marking Seoul.
export function globeShape(count, radius = 3.1) {
  const out = new Float32Array(count * 3)
  const sphereCount = Math.floor(count * 0.72)
  const seoulCount = Math.floor(count * 0.04)
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < sphereCount; i++) {
    const y = 1 - (i / (sphereCount - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    out[i * 3] = Math.cos(th) * r * radius
    out[i * 3 + 1] = y * radius
    out[i * 3 + 2] = Math.sin(th) * r * radius
  }

  // Seoul: lat 37.46N, lon 126.95E
  const lat = (37.46 * Math.PI) / 180
  const lon = (126.95 * Math.PI) / 180
  for (let i = sphereCount; i < sphereCount + seoulCount; i++) {
    const la = lat + rand(-0.06, 0.06)
    const lo = lon + rand(-0.06, 0.06)
    const rr = radius * rand(1.0, 1.25)
    out[i * 3] = Math.cos(la) * Math.cos(lo) * rr
    out[i * 3 + 1] = Math.sin(la) * rr
    out[i * 3 + 2] = -Math.cos(la) * Math.sin(lo) * rr
  }

  // Two tilted rings
  for (let i = sphereCount + seoulCount; i < count; i++) {
    const ring = i % 2
    const a = Math.random() * Math.PI * 2
    const rr = radius * (ring ? rand(1.45, 1.6) : rand(1.8, 1.86))
    const tilt = ring ? 0.45 : -0.3
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    out[i * 3] = x
    out[i * 3 + 1] = z * Math.sin(tilt) + rand(-0.03, 0.03)
    out[i * 3 + 2] = z * Math.cos(tilt)
  }
  return out
}

// Flat grid; the vertex shader lifts it into a scrolling ridge terrain (Gwanak-san).
export function terrainShape(count) {
  const out = new Float32Array(count * 3)
  const cols = Math.ceil(Math.sqrt(count * 1.4))
  const rows = Math.ceil(count / cols)
  for (let i = 0; i < count; i++) {
    const cx = i % cols
    const rz = Math.floor(i / cols)
    out[i * 3] = (cx / (cols - 1) - 0.5) * 30
    out[i * 3 + 1] = 0
    out[i * 3 + 2] = (rz / (rows - 1)) * 34 - 30 // -30 .. 4
  }
  return out
}

// A tilted rotunda of particles that frames the colleges carousel.
export function ringShape(count) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const band = Math.random()
    let r, y
    if (band < 0.6) {
      r = 5.4 + Math.pow(Math.random(), 3) * 1.2
      y = rand(-0.12, 0.12)
    } else if (band < 0.85) {
      r = 4.2 + rand(-0.05, 0.05)
      y = rand(-1.6, 1.6)
    } else {
      r = rand(0, 7.5)
      y = rand(-4, 4) * Math.pow(Math.random(), 2)
    }
    out[i * 3] = Math.cos(a) * r
    out[i * 3 + 1] = y
    out[i * 3 + 2] = Math.sin(a) * r
  }
  return out
}
