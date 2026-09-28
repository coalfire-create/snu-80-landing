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

// Seoul National University Official Emblem: Laurel wreath, crossed pen & torch, open book, and motto.
export function snuEmblemShape(count, size = 6.2, { depth = 0.55 } = {}) {
  const cw = 1100
  const ch = 1100
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, cw, ch)

  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cx = cw / 2
  const cy = ch / 2

  // 1. Double Concentric Rings
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.arc(cx, cy, 460, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy, 395, 0, Math.PI * 2)
  ctx.stroke()

  // 2. Circular Text along the Ring
  ctx.save()
  ctx.font = 'bold 36px "Cormorant Garamond", serif'
  const textTop = '· SEOUL NATIONAL UNIVERSITY · EST.1946'
  const textRadius = 428
  const startAngle = -Math.PI * 0.82
  const endAngle = Math.PI * -0.18
  const angleStep = (endAngle - startAngle) / textTop.length
  for (let i = 0; i < textTop.length; i++) {
    const a = startAngle + i * angleStep
    ctx.save()
    ctx.translate(cx + Math.cos(a) * textRadius, cy + Math.sin(a) * textRadius)
    ctx.rotate(a + Math.PI / 2)
    ctx.fillText(textTop[i], 0, 0)
    ctx.restore()
  }
  ctx.restore()

  // 3. Laurel Wreath (월계관) - Left and Right branches
  const drawLaurel = (sign) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(sign, 1)

    // Main stem curve
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(-20, 20, 310, Math.PI * 0.55, Math.PI * 1.35)
    ctx.stroke()

    // Laurel leaves
    for (let t = 0.58; t <= 1.32; t += 0.055) {
      const a = Math.PI * t
      const lx = -20 + Math.cos(a) * 310
      const ly = 20 + Math.sin(a) * 310
      const rot = a + Math.PI / 2

      ctx.save()
      ctx.translate(lx, ly)
      ctx.rotate(rot)

      // Leaf pair
      for (const offset of [-18, 18]) {
        ctx.beginPath()
        ctx.ellipse(offset, -12, 18, 9, Math.PI / 4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
    ctx.restore()
  }
  drawLaurel(1)
  drawLaurel(-1)

  // 4. Crossed Pen & Torch
  ctx.save()
  ctx.translate(cx, cy)

  // Pen (left-bottom to right-top)
  ctx.save()
  ctx.rotate(-Math.PI / 4.2)
  ctx.fillRect(-12, -260, 24, 520)
  // Nib
  ctx.beginPath()
  ctx.moveTo(-16, -260)
  ctx.lineTo(16, -260)
  ctx.lineTo(0, -320)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Torch (right-bottom to left-top)
  ctx.save()
  ctx.rotate(Math.PI / 4.2)
  ctx.fillRect(-14, -250, 28, 500)
  // Torch Head & Flame
  ctx.beginPath()
  ctx.moveTo(-28, -250)
  ctx.lineTo(28, -250)
  ctx.lineTo(20, -290)
  ctx.lineTo(-20, -290)
  ctx.closePath()
  ctx.fill()

  // Flame
  ctx.beginPath()
  ctx.moveTo(0, -350)
  ctx.bezierCurveTo(45, -310, 30, -280, 0, -290)
  ctx.bezierCurveTo(-30, -280, -45, -310, 0, -350)
  ctx.fill()
  ctx.restore()

  ctx.restore()

  // 5. Open Book (펼쳐진 책) in Center
  ctx.save()
  ctx.translate(cx, cy + 30)

  // Book base shape
  ctx.beginPath()
  ctx.moveTo(0, -85)
  // Top left page
  ctx.bezierCurveTo(-70, -115, -180, -95, -240, -65)
  ctx.lineTo(-235, 75)
  // Bottom left page
  ctx.bezierCurveTo(-170, 45, -70, 75, 0, 95)
  // Bottom right page
  ctx.bezierCurveTo(70, 75, 170, 45, 235, 75)
  ctx.lineTo(240, -65)
  // Top right page
  ctx.bezierCurveTo(180, -95, 70, -115, 0, -85)
  ctx.closePath()
  ctx.fill()

  // Inner book lines (shadow/pages)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(0, -85)
  ctx.lineTo(0, 95)
  ctx.stroke()

  // Motto on Book
  ctx.fillStyle = '#000'
  ctx.font = 'bold 30px "Cormorant Garamond", serif'
  ctx.fillText('VERITAS', -115, -10)
  ctx.fillText('LUX MEA', 115, -10)

  ctx.restore()

  // 6. Base Ribbon with 'VERITAS LUX MEA' & SNU Initial
  ctx.save()
  ctx.translate(cx, cy + 240)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(-180, 0)
  ctx.bezierCurveTo(-90, -25, 90, -25, 180, 0)
  ctx.bezierCurveTo(90, 45, -90, 45, -180, 0)
  ctx.fill()
  ctx.restore()

  // Sample points into 3D Float32Array
  const data = ctx.getImageData(0, 0, cw, ch).data
  const pts = []
  let minX = cw, maxX = 0, minY = ch, maxY = 0
  for (let py = 0; py < ch; py += 2) {
    for (let px = 0; px < cw; px += 2) {
      if (data[(py * cw + px) * 4] > 120) {
        pts.push(px, py)
        minX = Math.min(minX, px); maxX = Math.max(maxX, px)
        minY = Math.min(minY, py); maxY = Math.max(maxY, py)
      }
    }
  }

  const scale = size / Math.max(1, maxX - minX)
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * (pts.length / 2)) * 2
    const px = pts[j]
    const py = pts[j + 1]

    // Distance from center for radial depth curvature (coin relief effect)
    const dx = (px - cx) * scale
    const dy = -(py - cy) * scale
    const r = Math.sqrt(dx * dx + dy * dy)

    out[i * 3] = dx + rand(-0.02, 0.02)
    out[i * 3 + 1] = dy + rand(-0.02, 0.02)
    // Curvature: outer ring curves slightly backwards, central elements pop forward
    const relief = (1 - Math.min(r / (size * 0.5), 1)) * depth * 0.8
    out[i * 3 + 2] = relief + rand(-depth * 0.25, depth * 0.25)
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
