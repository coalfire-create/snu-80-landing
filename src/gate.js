// Cinematic interactive canvas: SNU Signature '샤' Gate with students walking in and stars streaming into the portal.

export class GateExperience {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.stars = []
    this.starCount = 280
    this.mouse = { x: -1000, y: -1000, active: false }
    this.time = 0
    this.scrollSpeed = 1
    this.animId = null

    this.resize()
    this.initStars()
    this.bindEvents()
    this.loop = this.loop.bind(this)
    this.loop()
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect()
    this.width = rect.width || window.innerWidth
    this.height = Math.min(window.innerHeight * 0.75, 620)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.scale(dpr, dpr)

    // Gate center position
    this.gateX = this.width * 0.5
    this.gateY = this.height * 0.52
    this.gateScale = Math.min(this.width / 950, 1)
  }

  initStars() {
    this.stars = []
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push(this.createStar(true))
    }
  }

  createStar(scatter = false) {
    const angle = Math.random() * Math.PI * 2
    // Spawn from outer regions
    const dist = scatter
      ? 120 + Math.random() * (Math.max(this.width, this.height) * 0.7)
      : Math.max(this.width, this.height) * (0.45 + Math.random() * 0.35)

    const x = this.gateX + Math.cos(angle) * dist
    const y = this.gateY + Math.sin(angle) * dist * 0.7 - Math.random() * 80

    // Hue: Platinum White, SNU Cyan Blue, Warm Gold
    const colors = [
      'rgba(240, 245, 255, ',
      'rgba(180, 220, 255, ',
      'rgba(100, 180, 255, ',
      'rgba(255, 225, 140, ',
      'rgba(255, 255, 255, ',
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]

    return {
      x,
      y,
      prevX: x,
      prevY: y,
      trail: [],
      maxTrail: 4 + Math.floor(Math.random() * 6),
      speed: 0.8 + Math.random() * 1.6,
      angle,
      color,
      size: 1.2 + Math.random() * 2.2,
      spin: (Math.random() - 0.5) * 0.04,
      life: 0,
      maxLife: 200 + Math.random() * 300,
      glow: Math.random() > 0.4,
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize()
    })

    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = e.clientX - rect.left
      this.mouse.y = e.clientY - rect.top
      this.mouse.active = true
    }

    this.canvas.addEventListener('mousemove', onMove)
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false
    })
  }

  update() {
    this.time += 0.02
    const gx = this.gateX
    const gy = this.gateY

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i]
      s.life++

      // Gravitational attraction toward the Gate portal center
      const dx = gx - s.x
      const dy = gy - s.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Store history for smooth glowing trail
      s.trail.push({ x: s.x, y: s.y })
      if (s.trail.length > s.maxTrail) s.trail.shift()

      // Spiral vortex force toward the center
      const pull = (0.012 + (180 / Math.max(dist, 40)) * 0.008) * s.speed * this.scrollSpeed
      const tangentX = -dy * s.spin
      const tangentY = dx * s.spin

      s.x += dx * pull + tangentX
      s.y += dy * pull + tangentY

      // Mouse influence
      if (this.mouse.active) {
        const mdx = this.mouse.x - s.x
        const mdy = this.mouse.y - s.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < 180) {
          const mForce = (1 - mdist / 180) * 1.5
          s.x += (mdx / mdist) * mForce * 2
          s.y += (mdy / mdist) * mForce * 2
        }
      }

      // Reached the gate portal core -> Absorbed into light and respawn
      if (dist < 22 || s.life > s.maxLife) {
        this.stars[i] = this.createStar(false)
      }
    }
  }

  drawGate() {
    const ctx = this.ctx
    const cx = this.gateX
    const cy = this.gateY
    const s = this.gateScale

    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(s, s)

    // 1. Portal Glow (진리의 빛 코어)
    const portalPulse = 0.85 + Math.sin(this.time * 2.5) * 0.15
    const glowGrad = ctx.createRadialGradient(0, 40, 5, 0, 40, 160 * portalPulse)
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    glowGrad.addColorStop(0.2, 'rgba(120, 185, 255, 0.75)')
    glowGrad.addColorStop(0.5, 'rgba(40, 95, 255, 0.35)')
    glowGrad.addColorStop(0.8, 'rgba(232, 184, 90, 0.12)')
    glowGrad.addColorStop(1, 'rgba(3, 4, 13, 0)')

    ctx.fillStyle = glowGrad
    ctx.beginPath()
    ctx.arc(0, 40, 160 * portalPulse, 0, Math.PI * 2)
    ctx.fill()

    // 2. Light beam rays emerging from the gate into the future
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    for (let r = 0; r < 5; r++) {
      const rayAngle = -Math.PI / 2 + (r - 2) * 0.35 + Math.sin(this.time + r) * 0.05
      ctx.beginPath()
      ctx.moveTo(0, 40)
      ctx.lineTo(Math.cos(rayAngle - 0.08) * 380, Math.sin(rayAngle - 0.08) * 380 + 40)
      ctx.lineTo(Math.cos(rayAngle + 0.08) * 380, Math.sin(rayAngle + 0.08) * 380 + 40)
      ctx.closePath()
      const rayGrad = ctx.createRadialGradient(0, 40, 10, 0, 40, 380)
      rayGrad.addColorStop(0, 'rgba(200, 230, 255, 0.28)')
      rayGrad.addColorStop(0.6, 'rgba(60, 120, 255, 0.08)')
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = rayGrad
      ctx.fill()
    }
    ctx.restore()

    // 3. Ground perspective path (캠퍼스 진입로)
    ctx.beginPath()
    ctx.moveTo(-160, 160)
    ctx.lineTo(160, 160)
    ctx.lineTo(24, 45)
    ctx.lineTo(-24, 45)
    ctx.closePath()
    const pathGrad = ctx.createLinearGradient(0, 160, 0, 45)
    pathGrad.addColorStop(0, 'rgba(20, 26, 60, 0.85)')
    pathGrad.addColorStop(1, 'rgba(180, 220, 255, 0.65)')
    ctx.fillStyle = pathGrad
    ctx.fill()

    // Road glowing perspective grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.lineWidth = 1.5
    for (const offset of [-80, -30, 0, 30, 80]) {
      ctx.beginPath()
      ctx.moveTo(offset * 1.8, 160)
      ctx.lineTo(offset * 0.25, 45)
      ctx.stroke()
    }

    // 4. The Iconic SNU '샤' Gate Sculpture Architecture (국립서울대학교 정문 조형물)
    // Left 'ㄱ', Center 'ㅅ' (High Tower), Right 'ㄷ'
    ctx.shadowColor = 'rgba(90, 150, 255, 0.6)'
    ctx.shadowBlur = 18

    // Center 'ㅅ' Triangle Tower (국립서울대의 중심 아치)
    ctx.fillStyle = '#f0f3fa'
    ctx.strokeStyle = '#3d5bff'
    ctx.lineWidth = 2.5

    // Left slant of 'ㅅ'
    ctx.beginPath()
    ctx.moveTo(-18, -145)
    ctx.lineTo(0, -170) // Peak
    ctx.lineTo(18, -145)
    ctx.lineTo(8, -140)
    ctx.lineTo(-75, 45)  // Left leg bottom
    ctx.lineTo(-115, 45)
    ctx.lineTo(-18, -145)
    ctx.closePath()
    const sGrad1 = ctx.createLinearGradient(-115, 45, 0, -170)
    sGrad1.addColorStop(0, '#c4d3ee')
    sGrad1.addColorStop(1, '#ffffff')
    ctx.fillStyle = sGrad1
    ctx.fill()
    ctx.stroke()

    // Right slant of 'ㅅ'
    ctx.beginPath()
    ctx.moveTo(0, -170) // Peak
    ctx.lineTo(18, -145)
    ctx.lineTo(115, 45) // Right leg bottom
    ctx.lineTo(75, 45)
    ctx.lineTo(0, -135)
    ctx.closePath()
    const sGrad2 = ctx.createLinearGradient(0, -170, 115, 45)
    sGrad2.addColorStop(0, '#ffffff')
    sGrad2.addColorStop(1, '#9db4db')
    ctx.fillStyle = sGrad2
    ctx.fill()
    ctx.stroke()

    // Left 'ㄱ' Canopy Beam (국립서울대의 'ㄱ')
    ctx.beginPath()
    ctx.moveTo(-185, -50)
    ctx.lineTo(-75, -50)
    ctx.lineTo(-75, -28)
    ctx.lineTo(-165, -28)
    ctx.lineTo(-165, 45)
    ctx.lineTo(-195, 45)
    ctx.lineTo(-195, -50)
    ctx.closePath()
    const gGrad = ctx.createLinearGradient(-195, 45, -75, -50)
    gGrad.addColorStop(0, '#a5bcdb')
    gGrad.addColorStop(1, '#ffffff')
    ctx.fillStyle = gGrad
    ctx.fill()
    ctx.stroke()

    // Right 'ㄷ' Structure (국립서울대의 'ㄷ')
    ctx.beginPath()
    ctx.moveTo(75, -20)
    ctx.lineTo(175, -20)
    ctx.lineTo(175, 0)
    ctx.lineTo(105, 0)
    ctx.lineTo(105, 25)
    ctx.lineTo(185, 25)
    ctx.lineTo(185, 45)
    ctx.lineTo(75, 45)
    ctx.closePath()
    const dGrad = ctx.createLinearGradient(75, -20, 185, 45)
    dGrad.addColorStop(0, '#ffffff')
    dGrad.addColorStop(1, '#8ea8d6')
    ctx.fillStyle = dGrad
    ctx.fill()
    ctx.stroke()

    ctx.shadowBlur = 0

    // 5. Students Walking Into the Gate (정문 안으로 걸어 들어가는 학생들의 실루엣)
    this.drawStudents(ctx)

    ctx.restore()
  }

  drawStudents(ctx) {
    // Walking step oscillation
    const walk1 = Math.sin(this.time * 5) * 4
    const walk2 = Math.cos(this.time * 4.6) * 3.5
    const walk3 = Math.sin(this.time * 5.2 + 1.5) * 4

    // Helper: Draw a walking student silhouette with backpack & book
    const drawStudent = (x, y, scale, legSwing, backpack = true, book = false) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)

      // Silhouette dark color with glowing rim light from the portal ahead
      ctx.fillStyle = '#080c1d'
      ctx.strokeStyle = 'rgba(180, 215, 255, 0.75)'
      ctx.lineWidth = 1.2

      // Head
      ctx.beginPath()
      ctx.arc(0, -52, 7.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Neck & Torso
      ctx.beginPath()
      ctx.moveTo(-7, -42)
      ctx.lineTo(7, -42)
      ctx.lineTo(9, -18)
      ctx.lineTo(-9, -18)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Backpack
      if (backpack) {
        ctx.beginPath()
        ctx.roundRect(-15, -40, 8, 18, 4)
        ctx.fill()
        ctx.stroke()
      }

      // Book in hand
      if (book) {
        ctx.beginPath()
        ctx.rect(8, -24, 7, 10)
        ctx.fillStyle = '#d4af37'
        ctx.fill()
        ctx.fillStyle = '#080c1d'
      }

      // Left Leg
      ctx.beginPath()
      ctx.moveTo(-5, -18)
      ctx.lineTo(-5 - legSwing, 0)
      ctx.lineWidth = 4
      ctx.strokeStyle = '#080c1d'
      ctx.stroke()

      // Right Leg
      ctx.beginPath()
      ctx.moveTo(5, -18)
      ctx.lineTo(5 + legSwing, 0)
      ctx.stroke()

      ctx.restore()
    }

    // Student 1: Center-left, walking toward the gate
    drawStudent(-45, 125, 0.72, walk1, true, false)

    // Student 2: Center-right, walking with friend
    drawStudent(35, 132, 0.78, walk2, true, true)

    // Student 3: Farther in the distance near the gate portal
    drawStudent(-10, 75, 0.42, walk3, true, false)

    // Student 4: Farther right in distance
    drawStudent(18, 68, 0.38, -walk1, false, false)
  }

  drawStars() {
    const ctx = this.ctx

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i]

      // Draw star trail streaming toward gate
      if (s.trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(s.trail[0].x, s.trail[0].y)
        for (let j = 1; j < s.trail.length; j++) {
          ctx.lineTo(s.trail[j].x, s.trail[j].y)
        }
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = `${s.color}${Math.min(s.life / 20, 0.65)})`
        ctx.lineWidth = s.size * 0.85
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Star head glowing particle
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fillStyle = `${s.color}1)`
      ctx.fill()

      if (s.glow) {
        ctx.shadowColor = s.color.replace('rgba', 'rgb').replace(', ', ')')
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    // Background cosmic gradient
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height)
    bgGrad.addColorStop(0, 'rgba(4, 6, 18, 0.75)')
    bgGrad.addColorStop(0.6, 'rgba(8, 14, 38, 0.88)')
    bgGrad.addColorStop(1, 'rgba(4, 6, 18, 0.95)')
    this.ctx.fillStyle = bgGrad
    this.ctx.fillRect(0, 0, this.width, this.height)

    this.update()
    this.drawStars() // Stars stream behind and around the gate
    this.drawGate()  // Gate and students in front of the stream

    this.animId = requestAnimationFrame(this.loop)
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId)
  }
}
