// 개념 설명 움직이는 그림: 장면(SCENES[id])을 캔버스에 그리고, 자막은 캔버스 아래 글자로 보여 준다.
// 색은 사이트 토큰을 그대로 읽어서 라이트/다크 모두 맞는다. 좌표는 800 × 500 기준.
;(function () {
  const SCENES = (window.SCENES = window.SCENES || {})
  const W = 800
  const H = 500
  const FONT = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
  const MONO = '"JetBrains Mono", Consolas, monospace'
  const MATH = '"Cambria Math", "STIX Two Math", "Times New Roman", serif'
  const HAND = '"Nanum Pen Script", sans-serif'

  const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)
  const clamp01 = (x) => Math.min(1, Math.max(0, x))

  function palette(el) {
    const cs = getComputedStyle(el)
    const v = (n) => cs.getPropertyValue(n).trim()
    return {
      paper: v('--sheet'),
      paper2: v('--paper-2'),
      ink: v('--ink'),
      sub: v('--ink-2'),
      pencil: v('--pencil'),
      rule: v('--rule-2'),
      marker: v('--marker'),
      hl: v('--marker-hl'),
      red: v('--red-pen'),
      green: v('--green-pen'),
      amber: v('--amber'),
      math: v('--math'),
      kor: v('--kor'),
      eng: v('--eng'),
      sci: v('--sci'),
      soc: v('--soc'),
      his: v('--his'),
    }
  }

  // 장면 그리기 도구
  function tools(g, c, t) {
    const api = {
      W,
      H,
      c,
      t,
      ease,
      FONT,
      MONO,
      MATH,
      HAND,
      // a초~b초 사이 0→1
      k: (a, b) => ease((t - a) / (b - a)),
      lin: (a, b) => clamp01((t - a) / (b - a)),
      text(s, x, y, o = {}) {
        g.save()
        g.globalAlpha = o.alpha ?? 1
        // 손글씨 글꼴은 같은 크기에서 작아 보여서 1.4배
        g.font = `${o.italic ? 'italic ' : ''}${o.weight || 700} ${(o.size || 26) * (o.font === HAND ? 1.4 : 1)}px ${o.font || FONT}`
        g.fillStyle = o.color || c.ink
        g.textAlign = o.align || 'left'
        g.textBaseline = 'middle'
        g.fillText(String(s), x, y)
        g.restore()
      },
      width(s, o = {}) {
        // 손글씨 글꼴은 같은 크기에서 작아 보여서 1.4배
        g.font = `${o.italic ? 'italic ' : ''}${o.weight || 700} ${(o.size || 26) * (o.font === HAND ? 1.4 : 1)}px ${o.font || FONT}`
        return g.measureText(String(s)).width
      },
      // 줄바꿈해서 쓰기, 마지막 줄 아래 y를 돌려준다
      wrap(str, x, y, maxW, o = {}) {
        const lh = o.lh || (o.size || 26) * 1.45
        let lineStr = ''
        let yy = y
        for (const w of String(str).split(' ')) {
          const test = lineStr ? lineStr + ' ' + w : w
          if (api.width(test, o) > maxW && lineStr) {
            api.text(lineStr, x, yy, o)
            lineStr = w
            yy += lh
          } else lineStr = test
        }
        if (lineStr) api.text(lineStr, x, yy, o)
        return yy + lh
      },
      line(x1, y1, x2, y2, o = {}) {
        g.save()
        g.globalAlpha = o.alpha ?? 1
        g.strokeStyle = o.color || c.ink
        g.lineWidth = o.width || 2
        g.lineCap = 'round'
        if (o.dash) g.setLineDash(o.dash)
        g.beginPath()
        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        g.stroke()
        g.restore()
      },
      // p: 0~1 만큼만 그리기
      poly(pts, o = {}) {
        if (pts.length < 2 || (o.p ?? 1) <= 0) return
        const n = Math.max(2, Math.round(pts.length * (o.p ?? 1)))
        g.save()
        g.globalAlpha = o.alpha ?? 1
        g.strokeStyle = o.color || c.ink
        g.lineWidth = o.width || 3
        g.lineJoin = 'round'
        g.lineCap = 'round'
        if (o.dash) g.setLineDash(o.dash)
        g.beginPath()
        g.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < n; i++) g.lineTo(pts[i][0], pts[i][1])
        g.stroke()
        g.restore()
      },
      fillPoly(pts, color, alpha = 1) {
        if (pts.length < 3) return
        g.save()
        g.globalAlpha = alpha
        g.fillStyle = color
        g.beginPath()
        g.moveTo(pts[0][0], pts[0][1])
        pts.slice(1).forEach((p) => g.lineTo(p[0], p[1]))
        g.closePath()
        g.fill()
        g.restore()
      },
      dot(x, y, o = {}) {
        g.save()
        g.globalAlpha = o.alpha ?? 1
        g.fillStyle = o.color || c.ink
        g.beginPath()
        g.arc(x, y, o.r || 6, 0, Math.PI * 2)
        g.fill()
        g.restore()
      },
      ring(x, y, r, o = {}) {
        g.save()
        g.globalAlpha = o.alpha ?? 1
        g.strokeStyle = o.color || c.red
        g.lineWidth = o.width || 3
        g.beginPath()
        g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (o.p ?? 1))
        g.stroke()
        g.restore()
      },
      box(x, y, w, h, o = {}) {
        g.save()
        g.globalAlpha = o.alpha ?? 1
        const r = o.r ?? 10
        g.beginPath()
        g.roundRect(x, y, w, h, r)
        if (o.fill) {
          g.fillStyle = o.fill
          g.fill()
        }
        if (o.stroke) {
          g.strokeStyle = o.stroke
          g.lineWidth = o.width || 2
          if (o.dash) g.setLineDash(o.dash)
          g.stroke()
        }
        g.restore()
      },
      // 형광펜 칠 (p만큼 왼쪽부터)
      hl(x, y, w, h, p = 1, color) {
        g.save()
        g.fillStyle = color || c.hl
        g.fillRect(x, y, w * clamp01(p), h)
        g.restore()
      },
      arrow(x1, y1, x2, y2, o = {}) {
        const p = o.p ?? 1
        const ex = x1 + (x2 - x1) * p
        const ey = y1 + (y2 - y1) * p
        api.line(x1, y1, ex, ey, o)
        if (p < 0.98) return
        const a = Math.atan2(y2 - y1, x2 - x1)
        const s = o.head || 10
        g.save()
        g.globalAlpha = o.alpha ?? 1
        g.fillStyle = o.color || c.ink
        g.beginPath()
        g.moveTo(x2, y2)
        g.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45))
        g.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45))
        g.closePath()
        g.fill()
        g.restore()
      },
      // 빨간 펜 줄 긋기
      strike(x, y, w, p = 1) {
        api.line(x - 4, y, x - 4 + (w + 8) * clamp01(p), y, { color: c.red, width: 3 })
      },
      // 좌표평면: box = [x, y, w, h], 범위 x0~x1, y0~y1
      axes(box, x0, x1, y0, y1) {
        const [bx, by, bw, bh] = box
        const sx = (x) => bx + ((x - x0) / (x1 - x0)) * bw
        const sy = (y) => by + bh - ((y - y0) / (y1 - y0)) * bh
        return {
          sx,
          sy,
          draw(o = {}) {
            const p = o.p ?? 1
            for (let x = Math.ceil(x0); x <= x1; x++) api.line(sx(x), by, sx(x), by + bh, { color: c.rule, width: 1, alpha: 0.5 * p })
            for (let y = Math.ceil(y0); y <= y1; y += o.ystep || 1)
              api.line(bx, sy(y), bx + bw, sy(y), { color: c.rule, width: 1, alpha: 0.5 * p })
            if (y0 <= 0 && y1 >= 0) api.arrow(bx, sy(0), bx + bw * p, sy(0), { color: c.sub, width: 2, p: 1, head: 8 })
            if (x0 <= 0 && x1 >= 0) api.arrow(sx(0), by + bh, sx(0), by + bh - bh * p, { color: c.sub, width: 2, p: 1, head: 8 })
          },
          curve(f, o = {}) {
            const from = o.from ?? x0
            const to = o.to ?? x1
            const pts = []
            for (let i = 0; i <= 160; i++) {
              const x = from + ((to - from) * i) / 160
              const y = f(x)
              if (Number.isFinite(y) && y >= y0 - 2 && y <= y1 + 2) pts.push([sx(x), sy(y)])
            }
            // 좌표 칸 밖으로 나간 부분은 자른다
            g.save()
            g.beginPath()
            g.rect(bx, by, bw, bh)
            g.clip()
            api.poly(pts, o)
            g.restore()
            return pts
          },
        }
      },
    }
    return api
  }

  function mount(host, id) {
    const scene = SCENES[id]
    if (!scene) return
    host.innerHTML = `<div class="explain">
      <canvas width="${W}" height="${H}"></canvas>
      <div class="ex-cap"></div>
      <div class="ex-ctl"><button type="button" class="ex-play">일시정지</button><div class="ex-bar"><i></i></div><button type="button" class="ex-again">처음부터</button></div>
    </div>`
    const canvas = host.querySelector('canvas')
    const cap = host.querySelector('.ex-cap')
    const bar = host.querySelector('.ex-bar i')
    const playBtn = host.querySelector('.ex-play')
    const g = canvas.getContext('2d')
    let t = 0
    let playing = false
    let last = 0
    let raf = 0

    function size() {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth || W
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(((w * H) / W) * dpr)
      draw()
    }
    function draw() {
      const c = palette(host)
      const s = canvas.width / W
      g.setTransform(s, 0, 0, s, 0, 0)
      g.clearRect(0, 0, W, H)
      g.fillStyle = c.paper
      g.fillRect(0, 0, W, H)
      scene.draw(tools(g, c, t))
      const step = [...scene.steps].reverse().find((x) => x[0] <= t + 0.01)
      const text = step ? step[1] : ''
      if (cap.dataset.text !== text) {
        cap.dataset.text = text
        cap.innerHTML = text
      }
      bar.style.width = `${(t / scene.len) * 100}%`
    }
    function frame(now) {
      if (!playing) return
      t = Math.min(scene.len, t + (now - last) / 1000)
      last = now
      draw()
      if (t >= scene.len) {
        playing = false
        playBtn.textContent = '다시 보기'
        return
      }
      raf = requestAnimationFrame(frame)
    }
    function play() {
      if (t >= scene.len) t = 0
      playing = true
      playBtn.textContent = '일시정지'
      last = performance.now()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(frame)
    }
    function pause() {
      playing = false
      playBtn.textContent = '재생'
    }
    playBtn.onclick = () => (playing ? pause() : play())
    host.querySelector('.ex-again').onclick = () => {
      t = 0
      play()
    }
    canvas.onclick = () => (playing ? pause() : play())

    new ResizeObserver(size).observe(canvas)
    // 화면에 보일 때 처음 한 번 자동 재생
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        play()
        io.disconnect()
      }
    })
    io.observe(canvas)
    host.explainSeek = (sec) => {
      pause()
      t = sec
      draw()
    }
    size()
  }

  // 검수용: 한 장면의 t초 화면을 새 캔버스로 그려 돌려준다
  function snapshot(id, t, el) {
    const cv = document.createElement('canvas')
    cv.width = W
    cv.height = H
    const g = cv.getContext('2d')
    const c = palette(el || document.body)
    g.fillStyle = c.paper
    g.fillRect(0, 0, W, H)
    SCENES[id].draw(tools(g, c, t))
    return cv
  }

  window.Explain = { mount, snapshot, has: (id) => !!SCENES[id], W, H }
})()
