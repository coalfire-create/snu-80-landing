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

// Celestial Cosmic Aura that frames the official SNU seal medallion in 3D space.
// Creates a majestic nebula of starlight, golden coronal rays, and celestial orbital rings.
export function snuOfficialEmblemShape(count, size = 8.5, { depth = 0.4, y = 0.0 } = {}) {
  const out = new Float32Array(count * 3)

  // 1. Concentric orbital celestial rings around the emblem (40% of particles)
  const ringCount = Math.floor(count * 0.42)
  for (let i = 0; i < ringCount; i++) {
    const ringIdx = i % 3
    const angle = Math.random() * Math.PI * 2
    // Radii outside the central medallion (medallion radius ~ 2.6)
    let r = 2.9 + ringIdx * 0.75 + Math.random() * 0.35
    const tilt = (ringIdx - 1) * 0.18
    const px = Math.cos(angle) * r
    const pz = Math.sin(angle) * r
    out[i * 3] = px
    out[i * 3 + 1] = pz * Math.sin(tilt) + y + rand(-0.06, 0.06)
    out[i * 3 + 2] = pz * Math.cos(tilt) * 0.4 + rand(-0.15, 0.15)
  }

  // 2. Majestic Laurel Corona / Starlight Rays (35% of particles)
  const coronaCount = Math.floor(count * 0.35)
  for (let i = ringCount; i < ringCount + coronaCount; i++) {
    const angle = Math.random() * Math.PI * 2
    // Radiating spikes mimicking the sacred laurel crown & torch flames
    const ray = Math.sin(angle * 14) * 0.4 + Math.cos(angle * 6) * 0.2
    const r = 2.8 + ray + Math.random() * 1.6
    out[i * 3] = Math.cos(angle) * r + rand(-0.05, 0.05)
    out[i * 3 + 1] = Math.sin(angle) * r + y + rand(-0.05, 0.05)
    out[i * 3 + 2] = rand(-depth, depth)
  }

  // 3. Ethereal background cosmic dust & stardust field (23% of particles)
  for (let i = ringCount + coronaCount; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.pow(Math.random(), 0.7) * 4.8
    out[i * 3] = Math.cos(a) * r
    out[i * 3 + 1] = Math.sin(a) * r + y
    out[i * 3 + 2] = -0.6 - Math.random() * 0.8 // Placed gently behind the emblem
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
