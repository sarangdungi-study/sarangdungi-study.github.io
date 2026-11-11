// 연습장: 문제 칸 위에 펜슬로 끄적이기.
// 펜슬(pointerType 'pen')만 그리고, 손가락은 브라우저 스크롤 그대로 화면을 넘긴다.
// iPad는 펜슬 터치(touchType 'stylus')만 기본 동작을 막아서 펜슬로 쓸 때 화면이 안 밀린다.
// '손가락도'를 켜면 손가락으로도 그린다.
// 획은 칸 너비 기준 비율로 저장해서 화면 크기가 바뀌어도 자리가 유지된다.
;(function () {
  const TOOLS = {
    pencil: { color: 'var(--ink)', width: 2.2, alpha: 1 },
    red: { color: 'var(--red-pen)', width: 2.4, alpha: 1 },
    marker: { color: 'var(--marker)', width: 14, alpha: 0.35 },
  }
  const state = { tool: 'pencil', finger: false }

  const storeKey = (key) => `ink:${key}`
  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(storeKey(key))) || []
    } catch (e) {
      return []
    }
  }
  function save(key, strokes) {
    try {
      if (strokes.length) localStorage.setItem(storeKey(key), JSON.stringify(strokes))
      else localStorage.removeItem(storeKey(key))
    } catch (e) {
      /* 저장소가 가득 차도 그리기는 계속 */
    }
  }

  function cssColor(el, value) {
    const m = value.match(/^var\((--[\w-]+)\)$/)
    return m ? getComputedStyle(el).getPropertyValue(m[1]).trim() : value
  }

  function toolbarHtml() {
    const b = (id, label, on) => `<button type="button" data-ink="${id}" class="${on ? 'on' : ''}">${label}</button>`
    return `<div class="ink-bar">
      ${b('pencil', '연필', state.tool === 'pencil')}${b('red', '빨간 펜', state.tool === 'red')}${b('marker', '형광펜', state.tool === 'marker')}${b('eraser', '지우개', state.tool === 'eraser')}
      <span class="sep"></span>${b('undo', '되돌리기')}${b('clear', '전부 지우기')}
      <label class="finger"><input type="checkbox" data-ink="finger" ${state.finger ? 'checked' : ''}> 손가락도</label>
    </div>`
  }

  // card: 그릴 칸(.qcard), key: 저장 이름
  function attach(card, key) {
    const canvas = document.createElement('canvas')
    canvas.className = 'ink-layer'
    card.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    let strokes = load(key)
    let cur = null
    let tap = null

    function size() {
      const r = card.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      canvas.style.width = r.width + 'px'
      canvas.style.height = r.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw()
    }

    function drawStroke(s) {
      const w = canvas.clientWidth
      const t = TOOLS[s.tool]
      ctx.save()
      ctx.globalAlpha = t.alpha
      ctx.strokeStyle = cssColor(card, t.color)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const pts = s.pts
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1]
        const [x1, y1, p] = pts[i]
        ctx.lineWidth = s.tool === 'marker' ? t.width : t.width * (0.5 + (p || 0.5))
        ctx.beginPath()
        ctx.moveTo(x0 * w, y0 * w)
        ctx.lineTo(x1 * w, y1 * w)
        ctx.stroke()
      }
      ctx.restore()
    }
    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      strokes.forEach(drawStroke)
    }

    function point(e) {
      const r = canvas.getBoundingClientRect()
      const w = r.width
      return [(e.clientX - r.left) / w, (e.clientY - r.top) / w, e.pointerType === 'pen' ? e.pressure : 0.5]
    }
    function canDraw(e) {
      return e.pointerType === 'pen' || e.pointerType === 'mouse' || state.finger
    }
    function eraseAt(p) {
      const near = 14 / canvas.clientWidth
      const before = strokes.length
      strokes = strokes.filter((s) => !s.pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < near))
      if (strokes.length !== before) {
        redraw()
        save(key, strokes)
      }
    }

    canvas.addEventListener('pointerdown', (e) => {
      if (!canDraw(e)) {
        tap = { x: e.clientX, y: e.clientY, id: e.pointerId }
        return
      }
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      const p = point(e)
      if (state.tool === 'eraser') {
        cur = { erase: true }
        eraseAt(p)
        return
      }
      cur = { tool: state.tool, pts: [p] }
    })
    canvas.addEventListener('pointermove', (e) => {
      if (tap && e.pointerId === tap.id) {
        if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 8) tap = null
        return
      }
      if (!cur) return
      e.preventDefault()
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
      for (const ev of evs) {
        const p = point(ev)
        if (cur.erase) eraseAt(p)
        else {
          cur.pts.push(p)
          drawStroke({ tool: cur.tool, pts: cur.pts.slice(-2) })
        }
      }
    })
    const end = (e) => {
      // 손가락으로 톡 누른 건 아래 버튼(보기 등)에 넘겨준다
      if (tap && e.type === 'pointerup' && e.pointerId === tap.id) {
        canvas.style.pointerEvents = 'none'
        const below = document.elementFromPoint(e.clientX, e.clientY)
        canvas.style.pointerEvents = ''
        if (below) below.click()
      }
      tap = null
      if (!cur) return
      if (!cur.erase && cur.pts.length > 1) {
        strokes.push(cur)
        save(key, strokes)
      }
      cur = null
    }
    canvas.addEventListener('pointerup', end)
    canvas.addEventListener('pointercancel', end)

    // 펜슬 터치는 스크롤을 막고, 손가락 터치는 그대로 둔다 (손가락도 켜면 다 막음)
    const blockStylus = (e) => {
      if (state.finger || [...e.touches].some((t) => t.touchType === 'stylus')) e.preventDefault()
    }
    canvas.addEventListener('touchstart', blockStylus, { passive: false })
    canvas.addEventListener('touchmove', blockStylus, { passive: false })
    canvas.classList.toggle('finger', state.finger)

    card.querySelectorAll('[data-ink]').forEach((el) => {
      const act = el.dataset.ink
      if (act === 'finger') {
        el.onchange = () => {
          state.finger = el.checked
          canvas.classList.toggle('finger', state.finger)
        }
        return
      }
      el.onclick = () => {
        if (act === 'undo') {
          strokes.pop()
          redraw()
          save(key, strokes)
        } else if (act === 'clear') {
          if (!strokes.length) return
          window.Ask('연습장을 전부 지울까요?', { desc: '지우면 되돌릴 수 없어요.', ok: '전부 지우기', danger: true }).then((yes) => {
            if (!yes) return
            strokes = []
            redraw()
            save(key, strokes)
          })
        } else {
          state.tool = act
          card.querySelectorAll('.ink-bar [data-ink]').forEach((x) => x.classList.toggle('on', x.dataset.ink === act))
        }
      }
    })

    const ro = new ResizeObserver(size)
    ro.observe(card)
    size()
  }

  const has = (key) => load(key).length > 0

  window.Ink = { attach, toolbarHtml, has }
})()
