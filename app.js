// 사랑둥이. 해시 주소로 화면을 바꿔요: #/ #/problems #/p/ID #/concepts #/c/ID #/notes #/feedback
;(function () {
  const $app = document.getElementById('app')
  const P = (id) => PROBLEMS.find((p) => p.id === id)
  const C = (id) => CONCEPTS[id]
  const S = (id) => SUBJECTS.find((s) => s.id === id) || { name: id, color: 'var(--pink)', units: [] }
  const unitName = (s, u) => (S(s).units.find((x) => x.id === u) || {}).name || u
  const usedBy = (cid) => PROBLEMS.filter((p) => p.concepts.includes(cid))
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  // 만든 날: 2026-11-02 → 11.02
  const madeLabel = (p) => (p.made ? p.made.slice(5).replace('-', '.') : '')
  const strip = (h) => h.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '')
  const day = (ts) => {
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  const dayKey = (ts) => new Date(ts).toDateString()
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
    up: '<svg viewBox="0 0 48 48"><path d="M8 38h10V28h10V18h10V8"/><path d="M32 8h6v6"/></svg>',
    down: '<svg viewBox="0 0 48 48"><circle cx="24" cy="10" r="5"/><circle cx="12" cy="36" r="5"/><circle cx="36" cy="36" r="5"/><path d="M21 14l-6 17M27 14l6 17"/></svg>',
  }

  const live = {} // 문제마다 이번 화면에서의 상태
  const ui = {
    ugroup: 'all',
    unit: 'all',
    usubj: 'all',
    subj: 'all',
    sort: 'default',
    kind: 'real',
    noteSort: 'due',
    csubj: 'all',
    q: '',
    grade: 'all',
  }
  // 내 학년: 이름마다 따로 기억 (동생은 중1, 형은 고2·고3)
  const GRADES = [
    ['all', '전체'],
    ['초등', '초등'],
    ['중1', '중1'],
    ['중2', '중2'],
    ['중3', '중3'],
    ['고1', '고1'],
    ['고2·3', '고2·고3'],
  ]
  const MID_CONCEPT_GRADE = {
    'mid-expr': '중1',
    'b-lin': '중1',
    'mid-word': '중1',
    'b-linfunc': '중2',
    'b-count': '중2',
    'mid-sys': '중2',
    'b-quadfac': '중3',
    'b-quadfunc': '중3',
  }
  // 문제 하나가 어느 학년 것인지 (여러 학년일 수 있음)
  function gradesOf(p) {
    if (p.unit === 'elem') return ['초등']
    if (p.unit === 'bridge') return ['초등', '중1']
    if (p.unit === 'mid') return [(p.slot || '').slice(0, 2)]
    if (p.unit === 'basic') return ['고1']
    if (p.subject === 'math') return ['고2·3']
    return ['고1', '고2·3']
  }
  function gradesOfUnit(subject, unit) {
    if (unit === 'elem') return ['초등']
    if (unit === 'bridge') return ['초등', '중1']
    if (unit === 'mid') return ['중1', '중2', '중3']
    if (unit === 'basic') return ['고1']
    if (subject === 'math') return ['고2·3']
    return ['고1', '고2·3']
  }
  function gradesOfConcept(id) {
    const c = C(id)
    if (c.grade) return [c.grade]
    if (c.unit === 'mid') return [MID_CONCEPT_GRADE[id] || '중1']
    return gradesOfUnit(c.subject, c.unit)
  }
  const myGradeKey = () => `grade:${(Store.user() || {}).name || ''}`
  function loadGrade() {
    // 시트에 저장된 값이 먼저, 없으면 이 기기에 남은 값
    let local = null
    try {
      local = localStorage.getItem(myGradeKey())
    } catch (e) {
      local = null
    }
    ui.grade = Store.getSetting('grade') || local || 'all'
  }
  const inGrade = (gs) => ui.grade === 'all' || gs.includes(ui.grade)
  const gradeSeg = () =>
    `<div class="seg" id="gradeSeg"><span class="seg-label">내 학년</span>${GRADES.map(([v, n]) => `<button data-v="${v}" class="${ui.grade === v ? 'on' : ''}">${n}</button>`).join('')}</div>`
  function bindGrade(cb) {
    $app.querySelectorAll('#gradeSeg button').forEach((b) => {
      b.onclick = () => {
        ui.grade = b.dataset.v
        try {
          localStorage.setItem(myGradeKey(), ui.grade)
        } catch (e) {
          /* 저장 못 해도 이번 화면에서는 적용 */
        }
        Store.setSetting('grade', ui.grade)
        cb()
      }
    })
  }
  let keyHandler = null

  // ───────── 테마
  const themeBtn = document.getElementById('theme')
  const isDark = () => {
    const t = document.documentElement.dataset.theme
    return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  }
  const paintTheme = () => {
    themeBtn.innerHTML = isDark() ? ICON.sun : ICON.moon
  }
  themeBtn.onclick = () => {
    const t = isDark() ? 'light' : 'dark'
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem('theme', t)
    } catch (e) {
      /* 저장소를 못 쓰는 브라우저면 넘어감 */
    }
    paintTheme()
  }
  try {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme)
  } catch (e) {
    /* 저장소를 못 쓰는 브라우저면 넘어감 */
  }
  paintTheme()

  // ───────── 길잡이
  function parseHash() {
    const [path, qs] = location.hash.slice(2).split('?')
    const parts = path.split('/')
    return { r: parts[0] || '', id: parts[1], q: new URLSearchParams(qs || '') }
  }
  function render() {
    const { r, id, q } = parseHash()
    const u = Store.user()
    clearInterval(examTimer)
    clearTimeout(carTimer)
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler)
      keyHandler = null
    }
    document.getElementById('who').innerHTML = u ? `<span class="dot"></span>${esc(u.name)}` : '로그인'
    document.querySelectorAll('#nav a').forEach((a) => {
      const on =
        a.dataset.r === r ||
        (a.dataset.r === 'problems' && (r === 'p' || r === 'exams' || r === 'exam')) ||
        (a.dataset.r === 'concepts' && (r === 'c' || r === 'l' || r === 'ladders'))
      a.classList.toggle('on', on)
    })
    document.body.classList.toggle('out', !u)
    if (!u) {
      buildToc()
      return loginView()
    }
    loadGrade()
    const views = {
      '': home,
      problems,
      p: problem,
      concepts,
      c: concept,
      notes,
      feedback,
      map: mapView,
      ladders,
      l: ladder,
      path: mathPath,
      guide: guidePage,
      exams,
      exam,
    }
    ;(views[r] || home)(id, q)
    window.scrollTo(0, 0)
    buildToc()
  }

  // ───────── 긴 화면 길잡이: 옆 목차(가로 화면) + 떠 있는 버튼(목차 · 맨 위로)
  let tocObs = null
  document.addEventListener('click', (e) => {
    const m = document.getElementById('fabMenu')
    if (m && !m.contains(e.target)) m.classList.remove('open')
  })
  function buildToc() {
    if (tocObs) tocObs.disconnect()
    document.getElementById('toc')?.remove()
    document.getElementById('fab')?.remove()
    document.getElementById('fabMenu')?.remove()
    const secs = [...$app.querySelectorAll('[data-toc]')]
    if (secs.length < 3) return
    const rail = document.createElement('nav')
    rail.id = 'toc'
    rail.setAttribute('aria-label', '이 화면 목차')
    rail.innerHTML = secs
      .map((el, i) => `<button type="button" data-t="${i}"><span class="lab">${el.dataset.toc}</span><i></i></button>`)
      .join('')
    const fab = document.createElement('button')
    fab.id = 'fab'
    fab.type = 'button'
    fab.setAttribute('aria-label', '목차 열기')
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 6h16M4 12h10M4 18h13"/></svg>'
    const menu = document.createElement('div')
    menu.id = 'fabMenu'
    menu.innerHTML = `<div class="fm-h">이 화면에 있는 것</div>${secs.map((el, i) => `<button type="button" data-t="${i}"><span class="n mono">${i + 1}</span>${el.dataset.toc}</button>`).join('')}<button type="button" class="top" data-t="top">↑ 맨 위로</button>`
    document.body.append(rail, fab, menu)
    const go = (t) => {
      menu.classList.remove('open')
      if (t === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' })
      const el = secs[Number(t)]
      const y = el.getBoundingClientRect().top + window.scrollY - 84
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
    rail.querySelectorAll('button').forEach((b) => (b.onclick = () => go(b.dataset.t)))
    menu.querySelectorAll('button').forEach((b) => (b.onclick = () => go(b.dataset.t)))
    fab.onclick = (e) => {
      e.stopPropagation()
      menu.classList.toggle('open')
    }
    const setOn = (i) => {
      rail.querySelectorAll('button').forEach((b) => b.classList.toggle('on', Number(b.dataset.t) === i))
      menu.querySelectorAll('button[data-t]').forEach((b) => b.classList.toggle('on', Number(b.dataset.t) === i))
    }
    setOn(0)
    tocObs = new IntersectionObserver(
      (ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) setOn(secs.indexOf(en.target))
        })
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    secs.forEach((el) => tocObs.observe(el))
  }

  // ───────── 로그인
  function loginView() {
    $app.innerHTML = `<div class="login">
      <span class="logo"><svg viewBox="0 0 64 64"><path d="M32 52 13 33a11 11 0 0 1 19-13 11 11 0 0 1 19 13Z"/></svg></span>
      <h1>사랑<span style="color:var(--pink)">둥이</span></h1>
      <p class="muted">수능, 정답게 같이 풀자</p>
      <form id="lf" class="card" autocomplete="on">
        <label for="ln">이름 (별명)</label>
        <input id="ln" class="field" autocomplete="username" placeholder="처음이면 정해서 넣기">
        <label for="lp">비밀번호 4자리</label>
        <input id="lp" class="field pin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="····">
        <div class="err" id="le"></div>
        <button class="btn main" id="lb" style="width:100%">들어가기</button>
      </form></div>`
    document.getElementById('lf').onsubmit = async (ev) => {
      ev.preventDefault()
      const b = document.getElementById('lb')
      b.disabled = true
      b.textContent = '들어가는 중…'
      const e = await Store.login(document.getElementById('ln').value, document.getElementById('lp').value)
      if (e) {
        document.getElementById('le').textContent = e
        b.disabled = false
        b.textContent = '들어가기'
      } else {
        location.hash = '#/'
        render()
      }
    }
  }

  // ───────── 기록 숫자
  function myStats() {
    const u = Store.user()
    const last = {}
    for (const a of u.attempts) last[a.pid] = a
    const solved = Object.keys(last).length
    const right = Object.values(last).filter((a) => a.correct).length
    const days = new Set(u.attempts.map((a) => dayKey(a.ts)))
    let streak = 0
    for (let d = new Date(); days.has(d.toDateString()); d.setDate(d.getDate() - 1)) streak++
    const due = Object.entries(u.notes).filter(([pid, n]) => n.due <= Date.now() && P(pid)).length
    return { solved, rate: solved ? Math.round((right / solved) * 100) : 0, notes: Object.keys(u.notes).length, due, streak, last }
  }

  function todayLabel() {
    const d = new Date()
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${'일월화수목금토'[d.getDay()]}요일`
  }

  // ───────── 홈
  // ───────── 모의고사: 정해진 구성대로 문제를 뽑아 시간 안에 풀고, 다 낸 뒤에 채점
  const isReal = (p) => p.kind === 'real'
  const inG = (g) => (p) => gradesOf(p).includes(g)
  const EXAMS = [
    {
      id: 'math-full',
      name: '수학 모의고사',
      grade: '고2·3',
      min: 100,
      desc: '수능처럼 30문항 100점. 공통(대수 · 미적분Ⅰ) 22 + 확률과 통계 8',
      pool: (p) => p.subject === 'math' && inG('고2·3')(p) && isReal(p),
      plan: [
        ['alg', 2, 2],
        ['alg', 3, 4],
        ['alg', 4, 5],
        ['calc', 2, 1],
        ['calc', 3, 4],
        ['calc', 4, 6],
        ['prob', 2, 1],
        ['prob', 3, 4],
        ['prob', 4, 3],
      ],
    },
    {
      id: 'math-mini',
      name: '수학 미니 모의고사',
      grade: '고2·3',
      min: 45,
      desc: '15문항 50점. 대수 · 미적분Ⅰ · 확률과 통계',
      pool: (p) => p.subject === 'math' && inG('고2·3')(p) && isReal(p),
      plan: [
        ['alg', 2, 1],
        ['alg', 3, 2],
        ['alg', 4, 3],
        ['calc', 2, 1],
        ['calc', 3, 2],
        ['calc', 4, 2],
        ['prob', 3, 2],
        ['prob', 4, 2],
      ],
    },
    {
      id: 'kor-mini',
      name: '국어 미니 모의고사',
      grade: '고2·3',
      min: 30,
      desc: '문법 · 문학 · 독서 12문항',
      pool: (p) => p.subject === 'kor' && isReal(p),
      count: 12,
    },
    {
      id: 'eng-mini',
      name: '영어 미니 모의고사',
      grade: '고2·3',
      min: 25,
      desc: '어법 · 빈칸 · 순서 10문항',
      pool: (p) => p.subject === 'eng' && isReal(p),
      count: 10,
    },
    {
      id: 'his-mini',
      name: '한국사 모의고사',
      grade: '고2·3',
      min: 30,
      desc: '수능처럼 20문항 · 전근대사부터 현대사까지',
      pool: (p) => p.subject === 'his' && isReal(p),
      count: 20,
    },
    {
      id: 'tam-mini',
      name: '통합과학 · 통합사회 미니',
      grade: '고1',
      min: 25,
      desc: '과학 · 사회 섞어서 10문항',
      pool: (p) => (p.subject === 'sci' || p.subject === 'soc') && isReal(p),
      count: 10,
    },
    {
      id: 'g-go1',
      name: '고1 수학 단원평가',
      grade: '고1',
      min: 30,
      desc: '공통수학 10문항',
      pool: (p) => p.subject === 'math' && inG('고1')(p),
      count: 10,
    },
    {
      id: 'g-mid3',
      name: '중3 수학 단원평가',
      grade: '중3',
      min: 30,
      desc: '제곱근 · 이차방정식 · 이차함수 10문항',
      pool: (p) => p.subject === 'math' && inG('중3')(p),
      count: 10,
    },
    {
      id: 'g-mid2',
      name: '중2 수학 단원평가',
      grade: '중2',
      min: 30,
      desc: '식의 계산 · 연립방정식 · 일차함수 10문항',
      pool: (p) => p.subject === 'math' && inG('중2')(p),
      count: 10,
    },
    {
      id: 'g-mid1',
      name: '중1 수학 단원평가',
      grade: '중1',
      min: 30,
      desc: '정수 · 문자와 식 · 일차방정식 10문항',
      pool: (p) => p.subject === 'math' && inG('중1')(p),
      count: 10,
    },
    {
      id: 'g-elem',
      name: '초등 수학 단원평가',
      grade: '초등',
      min: 30,
      desc: '분수 · 소수 10문항',
      pool: (p) => p.subject === 'math' && inG('초등')(p),
      count: 10,
    },
  ]
  const unitOk = (u) => (p) => (u === 'calc' ? p.unit.startsWith('calc1') : p.unit === u)
  const shuffle = (a) => {
    const b = a.slice()
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[b[i], b[j]] = [b[j], b[i]]
    }
    return b
  }
  // 문제 고르기: 같은 지문 문제(set)는 함께, 점수 낮은 것부터
  function buildExam(E) {
    const pool = PROBLEMS.filter(E.pool)
    const out = []
    const take = (list, n) => {
      let got = 0
      for (const p of list) {
        if (got >= n) break
        if (out.includes(p)) continue
        const grp = p.set ? pool.filter((x) => x.set === p.set) : [p]
        if (got + grp.length > n && got > 0) continue
        grp.forEach((x) => out.includes(x) || out.push(x))
        got += grp.length
      }
    }
    if (E.plan) E.plan.forEach(([u, pt, n]) => take(shuffle(pool.filter((p) => unitOk(u)(p) && p.points === pt)), n))
    else take(shuffle(pool), E.count)
    const order = (p) => (p.set ? Math.min(...out.filter((x) => x.set === p.set).map((x) => x.points)) : p.points)
    // 수학은 공통 먼저, 선택(확률과 통계)은 뒤에
    const part = (p) => (p.unit === 'prob' ? 1 : 0)
    out.sort((a, b) => part(a) - part(b) || order(a) - order(b) || (a.set || a.id).localeCompare(b.set || b.id) || a.id.localeCompare(b.id))
    return out.map((p) => p.id)
  }
  const examPlanSize = (E) => (E.plan ? E.plan.reduce((a, x) => a + x[2], 0) : E.count)
  const examReady = (E) =>
    PROBLEMS.filter(E.pool).length >= examPlanSize(E) &&
    (!E.plan || E.plan.every(([u, pt, n]) => PROBLEMS.filter(E.pool).filter((p) => unitOk(u)(p) && p.points === pt).length >= n))
  const examKey = () => `exam:${myName()}`
  const examLogKey = () => `examlog:${myName()}`
  const readJson = (k, d) => {
    try {
      return JSON.parse(lsGet(k) || 'null') || d
    } catch (e) {
      return d
    }
  }
  let examTimer = null
  const mmss = (ms) => {
    const t = Math.max(0, Math.round(ms / 1000))
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
  }
  const isRight = (p, a) => a !== undefined && a !== '' && a !== '-' && Number(a) === p.answer

  function exams() {
    const log = readJson(examLogKey(), [])
    const cur = readJson(examKey(), null)
    const list = EXAMS.filter((E) => inGrade([E.grade]))
    $app.innerHTML = `<a class="crumb" href="#/problems">← 문제</a><h1>모의고사</h1>
      <p class="lead">시간을 재고 한 번에 풀어요. 다 낼 때까지 정답은 안 보여요. 틀린 문제는 오답노트로 들어가요.</p>
      <div class="filters">${gradeSeg()}</div>
      ${cur && EXAMS.find((E) => E.id === cur.eid) ? `<a class="card path-card" href="#/exam/${cur.eid}"><div><b>보던 시험이 있어요: ${EXAMS.find((E) => E.id === cur.eid).name}</b><div class="small muted">남은 시간 ${mmss(cur.end - Date.now())}</div></div><span class="btn main sm">이어서 풀기 →</span></a>` : ''}
      <div class="exam-grid">${
        list
          .map((E) => {
            const mine = log.filter((x) => x.eid === E.id)
            const last = mine[mine.length - 1]
            const ok = examReady(E)
            return `<a class="card exam-card ${ok ? '' : 'off'}" href="${ok ? `#/exam/${E.id}` : 'javascript:void 0'}">
              <div class="filters" style="margin:0"><span class="chip">${E.grade === '고2·3' ? '고2·고3' : E.grade}</span>${last ? `<span class="chip pink mono">지난 점수 ${last.score}/${last.total}</span>` : ''}</div>
              <b>${E.name}</b><div class="small muted">${E.desc}</div>
              <div class="exam-meta"><span>${examPlanSize(E)}문항</span><span>${E.min}분</span>${mine.length ? `<span>${mine.length}번 봄</span>` : ''}</div>
              ${ok ? '' : '<div class="small" style="color:var(--red-pen)">문제를 더 채우는 중이에요</div>'}</a>`
          })
          .join('') || '<div class="empty">이 학년 모의고사는 아직 준비 중이에요.</div>'
      }</div>
      ${
        log.length
          ? `<div class="sec"><div class="sec-h"><h2>지난 시험</h2></div><div class="exam-log">${log
              .slice(-8)
              .reverse()
              .map((x) => {
                const E = EXAMS.find((e) => e.id === x.eid)
                return `<a class="exam-row" href="#/exam/${x.eid}?r=${x.ts}"><span>${E ? E.name : x.eid}</span><span class="small muted">${new Date(x.ts).toLocaleDateString('ko-KR')}</span><b class="mono">${x.score}/${x.total}</b></a>`
              })
              .join('')}</div></div>`
          : ''
      }`
    bindGrade(exams)
  }

  function exam(eid, q) {
    const E = EXAMS.find((x) => x.id === eid)
    if (!E) return exams()
    if (q.get('r')) return examResult(E, Number(q.get('r')))
    let cur = readJson(examKey(), null)
    if (cur && cur.eid !== eid) {
      $app.innerHTML = `<a class="crumb" href="#/exams">← 모의고사</a><div class="card"><b>다른 시험을 보는 중이에요.</b><p class="muted">「${(EXAMS.find((x) => x.id === cur.eid) || {}).name}」를 먼저 마치거나 그만둬야 새 시험을 볼 수 있어요.</p>
        <div class="filters"><a class="btn main sm" href="#/exam/${cur.eid}">그 시험으로 →</a><button class="btn ghost sm" id="quit">그 시험 그만두기</button></div></div>`
      document.getElementById('quit').onclick = async () => {
        if (await Ask('그 시험을 그만둘까요?', { desc: '쓴 답은 지워지고 기록에 남지 않아요.', ok: '그만두기', danger: true })) {
          lsSet(examKey(), 'null')
          exam(eid, q)
        }
      }
      return
    }
    if (!cur) {
      const ok = examReady(E)
      $app.innerHTML = `<a class="crumb" href="#/exams">← 모의고사</a>
        <div class="card exam-start"><span class="hand" style="color:var(--marker-ink)">${E.grade === '고2·3' ? '고2·고3' : E.grade}</span><h1>${E.name}</h1><p class="lead">${E.desc}</p>
          <div class="exam-meta big"><span><b>${examPlanSize(E)}</b>문항</span><span><b>${E.min}</b>분</span></div>
          <ul class="rules"><li>시작하면 시간이 흘러요. 시간이 다 되면 자동으로 내요.</li><li>다 낼 때까지 정답과 풀이는 안 보여요.</li><li>다른 화면에 갔다 와도 이어서 풀 수 있어요.</li><li>틀린 문제는 오답노트로 들어가요.</li></ul>
          ${ok ? '<button class="btn main" id="go" style="width:100%">시작하기</button>' : '<div class="result bad">이 시험은 문제를 더 채우는 중이에요.</div>'}</div>`
      const go = document.getElementById('go')
      if (go)
        go.onclick = () => {
          cur = { eid, pids: buildExam(E), ans: {}, at: 0, start: Date.now(), end: Date.now() + E.min * 60000 }
          lsSet(examKey(), JSON.stringify(cur))
          exam(eid, q)
        }
      return
    }
    const save = () => lsSet(examKey(), JSON.stringify(cur))
    const pids = cur.pids.filter((x) => P(x))
    const N = pids.length
    const answered = () => pids.filter((x) => cur.ans[x] !== undefined && cur.ans[x] !== '' && cur.ans[x] !== '-').length
    function draw() {
      const i = Math.min(cur.at, N - 1)
      const p = P(pids[i])
      const a = cur.ans[p.id] ?? ''
      const sub = S(p.subject)
      $app.innerHTML = `<div class="exam-bar"><b>${E.name}</b><span class="exam-time mono" id="etime">${mmss(cur.end - Date.now())}</span>
          <span class="small muted" id="ecount">답 ${answered()}/${N}</span><button class="btn main sm" id="submit">내기</button></div>
        <div class="omr">${pids
          .map(
            (x, k) =>
              `<button data-go="${k}" class="${k === i ? 'now' : ''} ${cur.ans[x] !== undefined && cur.ans[x] !== '' && cur.ans[x] !== '-' ? 'done' : ''}">${k + 1}</button>`,
          )
          .join('')}</div>
        <div class="solve" style="--c:${sub.color}">
          <div class="card qcard"><div class="head"><span class="chip pink mono">${i + 1}번</span><span class="chip subj">${sub.name} · ${unitName(p.subject, p.unit)}</span><span class="chip mono">${p.points}점</span></div>
            <div class="qbox">${p.body}</div>
            ${p.type === 'choice' ? `<div class="choices">${p.choices.map((c, k) => `<button data-i="${k + 1}" class="${Number(a) === k + 1 ? 'on' : ''}"><span class="n">${k + 1}</span>${c}</button>`).join('')}</div>` : ''}
          </div>
          <div class="card answer">
            ${
              p.type === 'choice'
                ? `<div class="lab">고른 답</div><div class="display ${a ? '' : 'empty-v'}">${a ? '①②③④⑤'[a - 1] : '보기를 골라요'}</div>`
                : `<div class="lab">내 답</div><div class="display ${a === '' ? 'empty-v' : ''}">${a === '' ? '숫자를 눌러요' : esc(a)}</div>
                 <div class="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '⌫'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>`
            }
            <div class="acts" style="margin-top:12px"><button class="btn ghost" id="prev" ${i === 0 ? 'disabled' : ''}>← 이전</button><button class="btn main" id="next">${i === N - 1 ? '다 풀었으면 내기' : '다음 →'}</button></div>
          </div>
        </div>`
      const set = (v) => {
        cur.ans[p.id] = v
        save()
        draw()
      }
      $app
        .querySelectorAll('.choices button')
        .forEach((b) => (b.onclick = () => set(Number(cur.ans[p.id]) === Number(b.dataset.i) ? '' : Number(b.dataset.i))))
      $app.querySelectorAll('.pad button').forEach(
        (b) =>
          (b.onclick = () => {
            let v = String(cur.ans[p.id] ?? '')
            const k = b.dataset.k
            if (k === '⌫') v = v.slice(0, -1)
            else if (k === '−') v = v.startsWith('-') ? v.slice(1) : '-' + v
            else if (v.replace('-', '').length < 6) v += k
            set(v)
          }),
      )
      $app.querySelectorAll('.omr button').forEach(
        (b) =>
          (b.onclick = () => {
            cur.at = Number(b.dataset.go)
            save()
            draw()
            window.scrollTo(0, 0)
          }),
      )
      document.getElementById('prev').onclick = () => {
        cur.at = Math.max(0, i - 1)
        save()
        draw()
        window.scrollTo(0, 0)
      }
      document.getElementById('next').onclick = () => {
        if (i === N - 1) return submit(false)
        cur.at = i + 1
        save()
        draw()
        window.scrollTo(0, 0)
      }
      document.getElementById('submit').onclick = () => submit(false)
    }
    let sent = false
    async function submit(timeUp) {
      if (sent) return
      const left = N - answered()
      if (
        !timeUp &&
        !(await Ask(left ? `${left}문제를 안 풀었어요. 낼까요?` : '답안지를 낼까요?', {
          desc: '내면 바로 채점하고, 답은 더 못 바꿔요.',
          ok: '내기',
        }))
      )
        return
      if (sent) return
      sent = true
      clearInterval(examTimer)
      const now = Date.now()
      let score = 0
      let total = 0
      pids.forEach((x) => {
        const p = P(x)
        total += p.points
        const a = cur.ans[x]
        const ans = a !== undefined && a !== '' && a !== '-'
        if (isRight(p, a)) score += p.points
        if (ans) Store.record(x, isRight(p, a), [])
      })
      const log = readJson(examLogKey(), [])
      log.push({ eid, pids, ans: cur.ans, score, total, used: Math.min(now, cur.end) - cur.start, ts: now, timeUp: !!timeUp })
      lsSet(examLogKey(), JSON.stringify(log.slice(-30)))
      lsSet(examKey(), 'null')
      location.hash = `#/exam/${eid}?r=${now}`
    }
    draw()
    examTimer = setInterval(() => {
      const el = document.getElementById('etime')
      if (!el) return clearInterval(examTimer)
      const left = cur.end - Date.now()
      el.textContent = mmss(left)
      el.classList.toggle('low', left < 5 * 60000)
      if (left <= 0) submit(true)
    }, 1000)
  }

  function examResult(E, ts) {
    const r = readJson(examLogKey(), []).find((x) => x.ts === ts)
    if (!r) return exams()
    const ps = r.pids.map(P).filter(Boolean)
    const byUnit = {}
    ps.forEach((p) => {
      const k = `${S(p.subject).name} · ${unitName(p.subject, p.unit)}`
      byUnit[k] = byUnit[k] || { ok: 0, n: 0, c: S(p.subject).color }
      byUnit[k].n++
      if (isRight(p, r.ans[p.id])) byUnit[k].ok++
    })
    const okN = ps.filter((p) => isRight(p, r.ans[p.id])).length
    $app.innerHTML = `<a class="crumb" href="#/exams">← 모의고사</a>
      <div class="card exam-score"><div><span class="hand" style="color:var(--marker-ink)">${r.timeUp ? '시간이 다 돼서 냈어요' : '수고했어요!'}</span><h1>${E.name}</h1>
        <div class="small muted">${new Date(r.ts).toLocaleString('ko-KR')} · 걸린 시간 ${mmss(r.used)} / ${E.min}:00</div></div>
        <div class="big-score"><b class="mono">${r.score}</b><span>/ ${r.total}점</span><div class="small muted">${okN} / ${ps.length}문항 맞힘</div></div></div>
      <div class="sec"><div class="sec-h"><h2>단원별</h2></div><div class="unit-bars">${Object.entries(byUnit)
        .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)
        .map(
          ([k, v]) =>
            `<div class="unit-bar" style="--c:${v.c}"><span>${k}</span><div class="bar"><i style="width:${(v.ok / v.n) * 100}%"></i></div><b class="mono">${v.ok}/${v.n}</b></div>`,
        )
        .join('')}</div></div>
      <div class="sec"><div class="sec-h"><h2>문항별</h2><span class="small muted">눌러서 풀이 보기</span></div><div class="exam-log">${ps
        .map((p, k) => {
          const a = r.ans[p.id]
          const has = a !== undefined && a !== '' && a !== '-'
          const ok = isRight(p, a)
          const show = (v) => (p.type === 'choice' ? `${v}번` : String(v).replace('-', '−'))
          return `<a class="exam-row ${ok ? 'ok' : 'bad'}" href="#/p/${p.id}"><span class="mark">${ok ? '○' : has ? '✕' : '–'}</span><span><b>${k + 1}번</b> <span class="small muted">${unitName(p.subject, p.unit)} · ${p.points}점</span></span>
            <span class="small">내 답 <b>${has ? show(a) : '안 풂'}</b>${ok ? '' : ` · 정답 <b>${show(p.answer)}</b>`}</span></a>`
        })
        .join('')}</div></div>
      <div class="filters" style="margin-top:18px"><a class="btn main" href="#/exam/${E.id}">한 번 더 보기</a><a class="btn ghost" href="#/notes">오답노트 →</a></div>`
  }

  // ───────── 홈 맨 위 슬라이드: 랜덤 강의 + 사용 가이드 (유튜브처럼 자동으로 넘어감)
  let carTimer = null
  let carAbort = null
  // 가이드용 작은 한반도: 실제 지도 모양 + 핀 몇 개
  function miniMap() {
    const pin = (id, on) => {
      const p = HISTORY_PLACES.find((x) => x.id === id)
      if (!p) return ''
      const [x, y] = proj(p.lat, p.lon)
      return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${on ? 22 : 16}" class="${on ? 'pin-on' : ''}"/>`
    }
    return `<svg viewBox="0 0 ${KMAP.w} ${KMAP.h}" class="g-mini">${KMAP.land.map((l) => `<path class="${l.c}" d="${l.d}"/>`).join('')}${['pyongyang', 'busan', 'gyeongju', 'seoul'].map((id) => pin(id)).join('')}${pin('ganghwa', true)}</svg>`
  }
  const guides = () => [
    {
      type: 'guide',
      tag: '사용 가이드 1',
      title: '문제 풀고 막히면 이렇게',
      desc: '틀리면 막힌 곳을 고르고, 그 개념 강의를 본 다음, 비슷한 쉬운 문제로 다시 올라와요. 틀린 문제는 오답노트가 날짜 맞춰 다시 내 줘요.',
      cta: ['문제 풀러 가기', '#/problems'],
      visual: `<div class="g-flow">
          <div class="g-step"><span class="g-n">1</span><b>어디서 막혔나요?</b><div class="g-chips"><span>다항함수 미분법</span><span>접선의 방정식</span></div></div>
          <div class="g-step"><span class="g-n">2</span><b>막힌 개념 기초 보기</b><div class="g-row">다항함수 미분법 <i>강의 보기 ▶</i></div></div>
          <div class="g-step"><span class="g-n">3</span><b>비슷한 쉬운 문제로 연습</b><div class="g-row">곡선 y = x² + 2 위의 점 (1, 3)… <i>2점 →</i></div></div>
          <div class="g-step"><span class="g-n">4</span><b>오답노트에서 다시</b><div class="g-row">하루 · 3일 · 7일 뒤 복습</div></div>
        </div>`,
    },
    {
      type: 'guide',
      tag: '사용 가이드 2',
      title: '한국사 지도 보는 법',
      desc: '시대를 고르고 핀을 누르면 그곳에서 일어난 사건이 나와요. 사건을 누르면 배경 → 전개 → 결과, 인물, 헷갈리는 점까지. 바로 앞 · 다음 사건으로 흐름을 따라가요.',
      cta: ['지도 열기', '#/map'],
      visual: `<div class="g-map">
          ${miniMap()}
          <div class="g-panel"><div class="g-chiprow"><span>흥선 대원군 ~ 대한 제국</span><span>1866.9 (음력)</span></div><b>병인양요</b>
            <div class="g-tl"><span>배경</span><span>전개</span><span>결과 · 의의</span></div>
            <div class="g-trap">헷갈리지 마 · 병인양요는 프랑스, 신미양요는 미국</div>
            <div class="g-nav"><span>← 제너럴 셔먼호 사건</span><span>신미양요 →</span></div></div>
        </div>`,
    },
    {
      type: 'guide',
      tag: '사용 가이드 3',
      title: '이런 것도 있어요',
      desc: '태블릿 펜슬로 문제 위에 바로 끄적이는 연습장, 시간 재고 보는 모의고사, 매일 3문제 랜덤 미션, 초등부터 수능까지 이어지는 수학 길.',
      cta: ['모의고사 보기', '#/exams'],
      visual: `<div class="g-grid">
          <a href="#/problems" class="g-tile"><b>연습장</b><span>연필 · 빨간 펜 · 형광펜 · 전부 지우기</span></a>
          <a href="#/exams" class="g-tile"><b>모의고사</b><span>타이머 · OMR · 단원별 결과</span></a>
          <a href="#/" class="g-tile" data-scroll="mission"><b>랜덤 미션</b><span>과정 고르면 오늘의 3문제</span></a>
          <a href="#/path" class="g-tile"><b>수학 길</b><span>아는 계단은 건너뛰기</span></a>
        </div>`,
    },
  ]
  // 사용 가이드 페이지 (헤더 ? 버튼)
  function guidePage() {
    $app.innerHTML = `<h1>사용 가이드</h1><p class="lead">사랑둥이를 이렇게 쓰면 좋아요.</p>
      <div class="guide-list">${guides()
        .map(
          (g) => `<section class="card guide-card"><div class="car-vis">${g.visual}</div>
          <div class="car-txt"><span class="car-tag">${g.tag}</span><h2>${g.title}</h2><p>${g.desc}</p><a class="btn main sm" href="${g.cta[1]}">${g.cta[0]} →</a></div></section>`,
        )
        .join('')}</div>`
    $app.querySelectorAll('[data-scroll]').forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault()
        location.hash = '#/'
        setTimeout(() => document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
      }
    })
  }
  function carouselSlides() {
    const pool = Object.keys(CONCEPTS).filter((id) => Explain.has(id) && inGrade(gradesOfConcept(id)))
    const pick = shuffle(pool.length >= 3 ? pool : Object.keys(CONCEPTS).filter((id) => Explain.has(id))).slice(0, 3)
    const lec = (id) => ({ type: 'lecture', id })
    // 사용 가이드는 헤더의 ? 버튼(#/guide)으로 옮기고, 슬라이드는 강의만
    const more = shuffle(pool).slice(3, 5)
    return [...pick, ...more].filter(Boolean).map(lec)
  }
  function carouselHtml(slides) {
    return `<section class="car" id="car" aria-roledescription="carousel">
      <div class="car-track">${slides
        .map((sl, i) => {
          if (sl.type === 'lecture') {
            const c = C(sl.id)
            const sub = S(c.subject)
            return `<div class="car-slide" data-i="${i}" style="--c:${sub.color}">
              <div class="car-vis"><div class="car-ex" data-scene="${sl.id}"></div></div>
              <div class="car-txt"><span class="car-tag">오늘의 강의 · ${sub.name}</span><h2>${c.name}</h2>
                <p>${strip(c.easy || c.summary)}</p><a class="btn main sm" href="#/c/${sl.id}">이 개념 공부하기 →</a></div></div>`
          }
          return `<div class="car-slide guide" data-i="${i}">
            <div class="car-vis">${sl.visual}</div>
            <div class="car-txt"><span class="car-tag">${sl.tag}</span><h2>${sl.title}</h2><p>${sl.desc}</p><a class="btn main sm" href="${sl.cta[1]}">${sl.cta[0]} →</a></div></div>`
        })
        .join('')}</div>
      <button type="button" class="car-nav prev" aria-label="이전">‹</button><button type="button" class="car-nav next" aria-label="다음">›</button>
      <div class="car-dots">${slides.map((sl, i) => `<button type="button" data-go="${i}" aria-label="${i + 1}번째"><i></i></button>`).join('')}</div>
    </section>`
  }
  function bindCarousel(slides) {
    const car = document.getElementById('car')
    if (!car) return
    const track = car.querySelector('.car-track')
    let at = 0
    let auto = true
    const dur = (sl) => (sl.type === 'lecture' && window.SCENES && window.SCENES[sl.id] ? window.SCENES[sl.id].len + 2.5 : 9) * 1000
    function go(i) {
      at = (i + slides.length) % slides.length
      track.style.transform = `translateX(${-at * 100}%)`
      car.querySelectorAll('.car-dots button').forEach((b, k) => {
        b.classList.toggle('on', k === at)
        const bar = b.querySelector('i')
        bar.style.transition = 'none'
        bar.style.width = '0'
        if (k === at && auto) {
          void bar.offsetWidth
          bar.style.transition = `width ${dur(slides[at])}ms linear`
          bar.style.width = '100%'
        }
      })
      const host = car.querySelector(`.car-slide[data-i="${at}"] .car-ex`)
      if (host && !host.dataset.on) {
        host.dataset.on = '1'
        Explain.mount(host, host.dataset.scene)
      }
      clearTimeout(carTimer)
      if (auto) carTimer = setTimeout(() => go(at + 1), dur(slides[at]))
    }
    const stop = () => {
      auto = false
      clearTimeout(carTimer)
      car.querySelectorAll('.car-dots i').forEach((b) => {
        b.style.transition = 'none'
        b.style.width = '0'
      })
    }
    car.querySelector('.prev').onclick = () => {
      stop()
      go(at - 1)
    }
    car.querySelector('.next').onclick = () => {
      stop()
      go(at + 1)
    }
    car.querySelectorAll('.car-dots button').forEach((b) => {
      b.onclick = () => {
        stop()
        go(Number(b.dataset.go))
      }
    })
    // 강의를 직접 만지면(재생 · 일시정지) 자동 넘김을 멈춤
    car.addEventListener('click', (e) => {
      if (e.target.closest('.explain')) stop()
    })
    // 손가락 · 마우스로 끌어서 넘기기: 끄는 동안 화면이 따라오고, 놓으면 넘어감
    if (carAbort) carAbort.abort()
    carAbort = new AbortController()
    const sig = { signal: carAbort.signal }
    let x0 = null
    let dx = 0
    let moved = false
    const W = () => car.clientWidth || 1
    track.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a, .ex-ctl')) return
      x0 = e.clientX
      dx = 0
      moved = false
      track.style.transition = 'none'
    })
    window.addEventListener(
      'pointermove',
      (e) => {
        if (x0 == null) return
        dx = e.clientX - x0
        if (Math.abs(dx) > 8) moved = true
        if (moved) track.style.transform = `translateX(calc(${-at * 100}% + ${dx}px))`
      },
      sig,
    )
    const end = () => {
      if (x0 == null) return
      x0 = null
      track.style.transition = ''
      if (Math.abs(dx) > Math.min(80, W() * 0.15)) {
        stop()
        go(at + (dx < 0 ? 1 : -1))
      } else go(at)
    }
    window.addEventListener('pointerup', end, sig)
    window.addEventListener('pointercancel', end, sig)
    // 끌었을 때는 강의 그림 클릭(재생/정지)으로 치지 않음
    track.addEventListener(
      'click',
      (e) => {
        if (moved) {
          e.stopPropagation()
          e.preventDefault()
          moved = false
        }
      },
      true,
    )
    track.addEventListener('dragstart', (e) => e.preventDefault())
    car.querySelectorAll('[data-scroll]').forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault()
        document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    go(0)
  }

  // ───────── 오늘의 랜덤 미션: 과정을 고르면 그 과정 문제 3개를 뽑아 줌 (오늘 하루는 그대로)
  const MCOURSES = GRADES.filter((g) => g[0] !== 'all')
  const myName = () => (Store.user() || {}).name || ''
  const lsGet = (k) => {
    try {
      return localStorage.getItem(k)
    } catch (e) {
      return null
    }
  }
  const lsSet = (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch (e) {
      /* 저장 못 해도 이번 화면에서는 보임 */
    }
  }
  const missionCourse = () => lsGet(`mcourse:${myName()}`) || (ui.grade !== 'all' ? ui.grade : '')
  function missionPick(course, reroll) {
    const key = `mission:${myName()}:${dayKey(Date.now())}:${course}`
    if (!reroll) {
      try {
        const ids = JSON.parse(lsGet(key) || 'null')
        if (Array.isArray(ids) && ids.length && ids.every((x) => P(x))) return ids
      } catch (e) {
        /* 깨졌으면 새로 뽑기 */
      }
    }
    const pool = PROBLEMS.filter((p) => gradesOf(p).includes(course))
    const fresh = pool.filter((p) => !lastCorrect(p.id))
    const src = (fresh.length >= 3 ? fresh : pool).slice()
    for (let i = src.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[src[i], src[j]] = [src[j], src[i]]
    }
    const ids = src.slice(0, 3).map((p) => p.id)
    lsSet(key, JSON.stringify(ids))
    return ids
  }
  // 오늘 푼 기록이 있으면 그 마지막 기록
  const doneToday = (pid) => {
    const l = Store.stat(pid).last
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return l && l.ts >= d.getTime() ? l : null
  }
  function missionHtml() {
    const course = missionCourse()
    const seg = `<div class="seg mseg"><span class="seg-label">과정</span>${MCOURSES.map(([v]) => `<button data-mc="${v}" class="${course === v ? 'on' : ''}">${v}</button>`).join('')}</div>`
    if (!course)
      return `<div class="sec-h"><h2>오늘의 랜덤 미션</h2></div>${seg}<div class="small muted">과정을 고르면 오늘 풀 문제 3개를 뽑아 줘요.</div>`
    const ids = missionPick(course)
    const res = ids.map(doneToday)
    const n = res.filter(Boolean).length
    const items = ids
      .map((id, i) => {
        const p = P(id),
          sub = S(p.subject),
          r = res[i]
        return `<a class="m-item ${r ? (r.correct ? 'ok' : 'bad') : ''}" style="--c:${sub.color}" href="#/p/${id}?mission=${encodeURIComponent(course)}&i=${i}">
          <span class="m-n">${r ? (r.correct ? '○' : '✕') : i + 1}</span>
          <div class="m-b"><span class="small muted">${sub.name} · ${unitName(p.subject, p.unit)}</span><div class="m-q">${esc(strip(p.body))}</div></div></a>`
      })
      .join('')
    return `<div class="sec-h"><h2>오늘의 랜덤 미션</h2><span class="m-count hand">${n} / ${ids.length}</span></div>${seg}
      <div class="m-list">${items}</div>
      ${n === ids.length ? '<div class="result ok">오늘 미션 완료! 내일 또 새로 뽑아 줄게요.</div>' : ''}
      <div class="m-foot"><span class="small muted">${n ? '푼 문제는 다시 풀 수 있어요.' : '마음에 안 들면 다시 뽑아도 돼요.'}</span><button type="button" class="btn ghost sm" id="reroll">다시 뽑기</button></div>`
  }
  function bindMission() {
    const box = document.getElementById('mission')
    if (!box) return
    box.querySelectorAll('[data-mc]').forEach((b) => {
      b.onclick = () => {
        lsSet(`mcourse:${myName()}`, b.dataset.mc)
        box.innerHTML = missionHtml()
        bindMission()
      }
    })
    const rr = document.getElementById('reroll')
    if (rr)
      rr.onclick = () => {
        missionPick(missionCourse(), true)
        box.innerHTML = missionHtml()
        bindMission()
      }
  }
  // 문제 화면에서: 다음 미션 문제 또는 완료
  function missionNext(course, i) {
    const ids = missionPick(course)
    for (let k = 1; k <= ids.length; k++) {
      const j = (i + k) % ids.length
      if (!doneToday(ids[j]))
        return `<a class="btn main sm" style="margin-top:10px;width:100%" href="#/p/${ids[j]}?mission=${encodeURIComponent(course)}&i=${j}">다음 미션 문제 →</a>`
    }
    return '<a class="btn main sm" style="margin-top:10px;width:100%" href="#/">오늘 미션 완료! 홈으로 →</a>'
  }

  function home() {
    const u = Store.user(),
      st = myStats()
    const due = Object.entries(u.notes)
      .filter(([, n]) => n.due <= Date.now())
      .map(([pid]) => P(pid))
      .filter(Boolean)
    const weak = Object.entries(Store.weakConcepts())
      .filter(([k]) => C(k))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    const mine = PROBLEMS.filter((p) => inGrade(gradesOf(p)))
    const next = mine.find((p) => p.kind === 'real' && !st.last[p.id]) || mine.find((p) => !st.last[p.id]) || mine[0] || PROBLEMS[0]
    const mySolved = mine.filter((p) => st.last[p.id]).length
    const slides = carouselSlides()
    $app.innerHTML = `
      ${carouselHtml(slides)}
      <div class="filters">${gradeSeg()}</div>
      <div class="hero" data-toc="오늘">
        <div class="card today">
          <div class="date">${todayLabel()}</div>
          ${st.streak > 1 ? `<span class="note hand">${st.streak}일째!</span>` : ''}
          <h1><span class="hl">${esc(u.name)}</span>, 오늘도 정답게.</h1>
          <p>${due.length ? `다시 풀 문제가 ${due.length}개 있어요. 복습부터 하고 넘어가요.` : '막히면 개념으로 내려갔다가 다시 올라오면 돼요.'}</p>
          <a class="btn main" href="#/p/${(due[0] || next).id}">${due.length ? '복습 시작' : '다음 문제 풀기'}</a>
        </div>
        <div class="stats">
          <div class="stat"><div class="k">푼 문제${ui.grade === 'all' ? '' : ` (${GRADES.find((g) => g[0] === ui.grade)[1]})`}</div><div class="v">${mySolved}<small>/${mine.length}</small></div></div>
          <div class="stat"><div class="k">정답률</div><div class="v">${st.rate}<small>%</small></div></div>
          <div class="stat"><div class="k">오답노트</div><div class="v">${st.notes}</div></div>
          <div class="stat ${st.due ? 'hot' : ''}"><div class="k">오늘 복습</div><div class="v">${st.due}</div></div>
        </div>
      </div>

      <div class="sec" data-toc="공부 시작"><div class="doors">
        <a class="door" href="#/problems"><span class="art">${ICON.up}</span><div><b>실전 문제부터</b>
          <span>실전 문제를 먼저 풀고, 막힌 개념으로 내려가요.</span><div class="tag hand">실력 확인은 여기부터</div></div></a>
        <a class="door" href="#/concepts"><span class="art">${ICON.down}</span><div><b>기초 개념부터</b>
          <span>개념 영상을 보고, 그 개념을 쓰는 문제로 올라가요.</span><div class="tag hand">처음 배우는 단원이면</div></div></a>
      </div></div>

      <div class="card mission-card" id="mission" data-toc="랜덤 미션">${missionHtml()}</div>

      <a class="card path-card exam-entry" href="#/exams" data-toc="모의고사"><div><b>모의고사</b><div class="small muted">시간 재고 한 번에 풀기. 다 낸 뒤에 점수와 단원별 결과가 나와요.</div></div><span class="btn main sm">시험 보러 가기 →</span></a>

      <a class="card path-card" href="#/path" data-toc="수학 길"><div><b>수학 길</b><div class="small muted">초등 분수부터 수능까지 한 줄로 이어진 계단. 아는 건 건너뛰고 위로!</div></div><span class="btn main sm">지금 위치 보기 →</span></a>

      <div class="sec" data-toc="계단 오르기"><div class="sec-h"><h2>계단 오르기</h2><a class="more" href="#/ladders">전체 보기 →</a></div>
        <div class="ladder-row">${LADDERS.filter((L) => inGrade(L.grades))
          .map(ladderCard)
          .join('')}</div></div>

      <div class="sec" data-toc="과목별 진도"><div class="sec-h"><h2>과목별 진도</h2></div>
        <div class="subjects">${SUBJECTS.map((s) => {
          const all = mine.filter((p) => p.subject === s.id),
            done = all.filter((p) => st.last[p.id]).length
          if (!all.length) return ''
          return `<a class="subj-tile" style="--c:${s.color}" href="#/problems" data-subj="${s.id}"><b>${s.name}</b>
            <div class="u">${s.units
              .filter((x) => inGrade(gradesOfUnit(s.id, x.id)))
              .map((x) => x.name)
              .join(', ')}</div>
            <div class="bar"><i style="width:${all.length ? (done / all.length) * 100 : 0}%"></i></div>
            <div class="n"><span>푼 문제</span><span class="mono">${done}/${all.length}</span></div></a>`
        }).join('')}</div></div>

      ${
        due.length
          ? `<div class="sec" data-toc="다시 풀 문제"><div class="sec-h"><h2>오늘 다시 풀 문제</h2><a class="more" href="#/notes">오답노트 →</a></div>
        <div class="pgrid">${due.map((p) => pCard(p)).join('')}</div></div>`
          : ''
      }

      <div class="sec" data-toc="막히는 개념"><div class="sec-h"><h2>자주 막히는 개념</h2><a class="more" href="#/concepts">개념 지도 →</a></div>
        ${
          weak.length
            ? `<div class="chain">${weak.map(([k, n]) => cNode(k, n)).join('')}</div>`
            : '<div class="empty">아직 기록이 없어요. 문제를 풀면 여기에 쌓여요.</div>'
        }</div>`
    $app.querySelectorAll('[data-subj]').forEach(
      (a) =>
        (a.onclick = () => {
          ui.subj = a.dataset.subj
          ui.kind = 'all'
        }),
      bindGrade(home),
    )
    bindMission()
    bindCarousel(slides)
  }

  // ───────── 문제 목록
  const SORTS = {
    default: ['기본 순서', () => 0],
    level: ['쉬운 순', (a, b) => a.level - b.level],
    levelDesc: ['어려운 순', (a, b) => b.level - a.level],
    points: ['배점 높은 순', (a, b) => b.points - a.points],
    wrong: ['많이 틀린 순', (a, b) => Store.stat(b.id).wrong - Store.stat(a.id).wrong],
    unsolved: ['안 푼 것 먼저', (a, b) => (Store.stat(a.id).tries > 0) - (Store.stat(b.id).tries > 0)],
    made: ['새로 만든 순', (a, b) => (b.made || '').localeCompare(a.made || '')],
    recent: ['최근 푼 순', (a, b) => ((Store.stat(b.id).last || {}).ts || 0) - ((Store.stat(a.id).last || {}).ts || 0)],
  }
  function subjSeg(key) {
    return `<div class="seg" data-k="${key}">${[['all', '전체', ''], ...SUBJECTS.map((s) => [s.id, s.name, s.color])]
      .map(
        ([v, n, c]) =>
          `<button data-v="${v}" class="${ui[key] === v ? 'on' : ''}" style="--c:${c}">${c ? '<span class="sw"></span>' : ''}${n}</button>`,
      )
      .join('')}</div>`
  }
  function bindSeg(cb) {
    $app.querySelectorAll('.seg[data-k]').forEach((seg) =>
      seg.querySelectorAll('button').forEach((b) => {
        b.onclick = () => {
          ui[seg.dataset.k] = b.dataset.v
          cb()
        }
      }),
    )
  }
  // 단원 키워드: '문법 · 음운 변동' → 영역 '문법', 단원 '음운 변동'
  const unitObj = (p) => S(p.subject).units.find((u) => u.id === p.unit) || { name: p.unit }
  const unitGroup = (u) => u.name.split(' · ')[0]
  const unitShort = (u) => u.name.split(' · ').slice(1).join(' · ') || u.name
  function unitSeg(base) {
    if (ui.subj === 'all') return ''
    const units = S(ui.subj).units.filter((u) => base.some((p) => p.unit === u.id))
    if (units.length < 2) return ''
    const groups = [...new Set(units.map(unitGroup))]
    const n = (f) => base.filter(f).length
    const btn = (v, label, on, cnt) =>
      `<button data-v="${esc(v)}" class="${on ? 'on' : ''}">${label}${cnt != null ? ` <small class="cnt">${cnt}</small>` : ''}</button>`
    let h = `<div class="filters useg-row"><div class="seg useg" data-k="ugroup"><span class="seg-label">단원</span>${btn('all', '전체', ui.ugroup === 'all')}${groups
      .map((g) =>
        btn(
          g,
          g,
          ui.ugroup === g,
          n((p) => unitGroup(unitObj(p)) === g),
        ),
      )
      .join('')}</div>`
    const sub = units.filter((u) => unitGroup(u) === ui.ugroup)
    if (ui.ugroup !== 'all' && sub.length > 1)
      h += `<div class="seg useg" data-k="unit">${btn('all', `${ui.ugroup} 전체`, ui.unit === 'all')}${sub
        .map((u) =>
          btn(
            u.id,
            unitShort(u),
            ui.unit === u.id,
            n((p) => p.unit === u.id),
          ),
        )
        .join('')}</div>`
    return h + '</div>'
  }
  function problems() {
    // 과목이 바뀌면 단원 고르기는 처음부터
    if (ui.usubj !== ui.subj) {
      ui.usubj = ui.subj
      ui.ugroup = 'all'
      ui.unit = 'all'
    }
    const base = PROBLEMS.filter(
      (p) => inGrade(gradesOf(p)) && (ui.subj === 'all' || p.subject === ui.subj) && (ui.kind === 'all' || p.kind === ui.kind),
    )
    if (ui.ugroup !== 'all' && !base.some((p) => unitGroup(unitObj(p)) === ui.ugroup)) ui.ugroup = 'all'
    // 고른 단원이 지금 영역에 없으면 단원 선택을 풀어요 (단어의 짜임 고른 채 독서를 누른 경우)
    if (ui.unit !== 'all' && !base.some((p) => p.unit === ui.unit && unitGroup(unitObj(p)) === ui.ugroup)) ui.unit = 'all'
    $app.innerHTML = `<div class="sec-h" style="margin:0"><h1>문제</h1><a class="btn ghost sm" href="#/exams">모의고사 →</a></div><p class="lead">학년과 과목을 고르면 맞는 문제만 보여요. 막히면 문제 안에서 개념으로 내려갈 수 있어요.</p>
      <div class="filters">
        <label class="search">${ICON.search}<input id="q" placeholder="문제·개념 찾기 (예: 접선, 유음화)" value="${esc(ui.q)}"></label>
        <select id="sort">${Object.entries(SORTS)
          .map(([k, [n]]) => `<option value="${k}" ${ui.sort === k ? 'selected' : ''}>${n}</option>`)
          .join('')}</select>
      </div>
      <div class="filters">${gradeSeg()}</div>
      <div class="filters">${subjSeg('subj')}
        <div class="seg" data-k="kind">${[
          ['real', '실전'],
          ['easy', '기초'],
          ['all', '모두'],
        ]
          .map(([v, n]) => `<button data-v="${v}" class="${ui.kind === v ? 'on' : ''}">${n}</button>`)
          .join('')}</div>
      </div>
      ${unitSeg(base)}
      <div id="plist"></div>`
    const paint = () => {
      const q = ui.q.trim().toLowerCase()
      let list = base.filter(
        (p) => (ui.ugroup === 'all' || unitGroup(unitObj(p)) === ui.ugroup) && (ui.unit === 'all' || p.unit === ui.unit),
      )
      if (q)
        list = list.filter((p) =>
          (strip(p.body) + ' ' + p.concepts.map((k) => C(k).name).join(' ') + ' ' + unitName(p.subject, p.unit)).toLowerCase().includes(q),
        )
      list = list
        .map((p, i) => [p, i])
        .sort((a, b) => SORTS[ui.sort][1](a[0], b[0]) || a[1] - b[1])
        .map((x) => x[0])
      document.getElementById('plist').innerHTML = list.length
        ? `<div class="pcount small muted">${list.length}문제</div><div class="pgrid">${list.map((p) => pCard(p)).join('')}</div>`
        : '<div class="empty">맞는 문제가 없어요.</div>'
    }
    // 카드 위 과목 · 단원 칩을 누르면 그 단원만 보기
    document.getElementById('plist').onclick = (e) => {
      const t = e.target.closest('[data-fu]')
      if (!t) return
      e.preventDefault()
      const p = P(t.dataset.fu)
      ui.subj = ui.usubj = p.subject
      ui.ugroup = unitGroup(unitObj(p))
      ui.unit = p.unit
      problems()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    paint()
    bindSeg(problems)
    bindGrade(problems)
    document.getElementById('sort').onchange = (e) => {
      ui.sort = e.target.value
      paint()
    }
    document.getElementById('q').oninput = (e) => {
      ui.q = e.target.value
      paint()
    }
  }
  function pCard(p, from) {
    const s = Store.stat(p.id),
      sub = S(p.subject)
    const mark = !s.tries ? '' : s.last.correct ? '<span class="chip ok">맞힘</span>' : '<span class="chip bad">틀림</span>'
    return `<a class="pcard" style="--c:${sub.color}" href="#/p/${p.id}${from ? `?from=${from}` : ''}">
      <div class="top"><span class="chip subj" data-fu="${p.id}" title="이 단원만 보기">${sub.name} · ${unitName(p.subject, p.unit)}</span><span class="pts">${p.points}점</span></div>
      <div class="q">${strip(p.body)}</div>
      <div class="bot"><span class="kind">${p.kind === 'real' ? '실전' : '기초'} · ${p.slot}</span>${p.made ? `<span class="made mono" title="만든 날">${madeLabel(p)}</span>` : ''}${mark}${s.wrong ? `<span class="chip warn">${s.wrong}번 틀림</span>` : ''}
        <span class="dots" title="난이도">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.level ? 'on' : ''}"></i>`).join('')}</span></div></a>`
  }

  // ───────── 계단: 같은 주제를 쉬운 단계부터. 단계 안에서 2문제 맞히면 다음 단계가 열림
  const lastCorrect = (pid) => {
    const l = Store.stat(pid).last
    return !!(l && l.correct)
  }
  // 건너뛰기 시험에서 맞힌 단계: 이름마다 기기에 기억
  const skipKey = () => `skip:${(Store.user() || {}).name || ''}`
  function skips() {
    const set = new Set()
    try {
      JSON.parse(Store.getSetting('skips') || '[]').forEach((x) => set.add(x))
    } catch (e) {
      /* 시트 값이 깨졌으면 무시 */
    }
    try {
      JSON.parse(localStorage.getItem(skipKey()) || '[]').forEach((x) => set.add(x))
    } catch (e) {
      /* 기기 저장소를 못 쓰면 무시 */
    }
    return set
  }
  function addSkip(lid, i) {
    const set = skips()
    set.add(`${lid}:${i}`)
    try {
      localStorage.setItem(skipKey(), JSON.stringify([...set]))
    } catch (e) {
      /* 저장 못 해도 이번 화면에서는 통과로 보임 */
    }
    Store.setSetting('skips', JSON.stringify([...set]))
  }
  function stepState(L) {
    const sk = skips()
    const out = []
    L.steps.forEach((st, i) => {
      const correct = st.problems.filter(lastCorrect).length
      const need = Math.min(2, st.problems.length)
      const skipped = sk.has(`${L.id}:${i}`)
      const open = true // 잠그지 않음: 아무 단계나 바로 풀 수 있게
      out.push({ correct, need, cleared: correct >= need || skipped, skipped, open })
    })
    return out
  }
  const ladderDone = (L) => stepState(L).every((x) => x.cleared)
  const nextLadder = (L) => {
    const i = MATH_PATH.indexOf(L.id)
    return i >= 0 && i < MATH_PATH.length - 1 ? LADDERS.find((x) => x.id === MATH_PATH[i + 1]) : null
  }
  // 건너뛰기 시험 문제: 단계의 마지막(가장 어려운) 문제
  const testPid = (L, i) => L.steps[i].problems[L.steps[i].problems.length - 1]

  // ───────── 수학 한 줄 길: 계단을 이어서 초등에서 수능까지
  function mathPath() {
    const Ls = MATH_PATH.map((id) => LADDERS.find((x) => x.id === id)).filter(Boolean)
    const here = Ls.findIndex((L) => !ladderDone(L))
    const nodes = Ls.map((L, i) => {
      const ss = stepState(L)
      const done = ss.filter((x) => x.cleared).length
      const pct = Math.round((done / L.steps.length) * 100)
      const now = i === here
      return `<a class="path-node ${now ? 'now' : ''} ${pct === 100 ? 'done' : ''}" href="#/l/${L.id}">
        <span class="path-dot">${pct === 100 ? '✓' : i + 1}</span>
        <div class="path-body"><div class="filters" style="margin:0 0 4px"><b>${L.name}</b><span class="chip">${L.grades.join(' · ')}</span>${now ? '<span class="chip pink">지금 여기</span>' : ''}</div>
          <div class="small muted">${L.desc}</div>
          <div class="bar" style="--c:var(--math);margin-top:8px"><i style="width:${pct}%"></i></div></div></a>`
    }).join('')
    $app.innerHTML = `<h1>수학 길</h1>
      <p class="lead">초등 분수부터 수능까지 계단이 한 줄로 이어져 있어요. 아는 계단은 <b>건너뛰기 시험</b>으로 빨리 지나가고, 막히는 곳부터 차근차근 올라가요.</p>
      <div class="path">${nodes}</div>`
  }
  function ladderCard(L) {
    const ss = stepState(L)
    const done = ss.filter((x) => x.cleared).length
    const sub = S(L.subject)
    return `<a class="ladder-card" style="--c:${sub.color}" href="#/l/${L.id}">
      <div class="mini-stairs">${L.steps.map((_, i) => `<i class="${ss[i].cleared ? 'on' : i === ss.findIndex((x) => !x.cleared) ? 'now' : ''}" style="height:${8 + Math.round((i / Math.max(1, L.steps.length - 1)) * 32)}px"></i>`).join('')}</div>
      <span class="chip" style="justify-self:start">${L.level}</span><b>${L.name}</b><span class="small muted">${L.desc}</span>
      <span class="small mono" style="font-weight:800">${done} / ${L.steps.length} 단계</span></a>`
  }
  function ladders() {
    $app.innerHTML = `<h1>계단 오르기</h1><p class="lead">같은 주제를 쉬운 단계부터 하나씩 올라가요. 어느 단계든 바로 풀어도 되고, 2문제를 맞히면 그 단계는 ‘통과’예요.</p>
      <div class="filters">${gradeSeg()}</div>
      ${['초등', '중등', '고등']
        .map((lv) => {
          const ls = LADDERS.filter((L) => L.level === lv && inGrade(L.grades))
          return ls.length
            ? `<div class="sec"><div class="sec-h"><h2>${lv}</h2></div><div class="ladder-row">${ls.map(ladderCard).join('')}</div></div>`
            : ''
        })
        .join('')}
      ${(() => {
        const up = { 초등: '중1', 중1: '중2', 중2: '중3', 중3: '고1', 고1: '고2·3' }[ui.grade]
        if (!up) return ''
        const ls = LADDERS.filter((L) => L.grades.includes(up) && !inGrade(L.grades))
        return ls.length
          ? `<div class="sec"><div class="sec-h"><h2>한 학년 위 미리 보기 (${up})</h2><a class="more" href="#/path">수학 길 →</a></div><div class="ladder-row preview">${ls.map(ladderCard).join('')}</div></div>`
          : ''
      })()}`
    bindGrade(ladders)
  }
  function ladder(id) {
    const L = LADDERS.find((x) => x.id === id)
    if (!L) return ladders()
    const ss = stepState(L)
    const sub = S(L.subject)
    const steps = L.steps
      .map((st, i) => {
        const s0 = ss[i]
        const pills = st.problems
          .map((pid) => {
            const stt = Store.stat(pid)
            const cls = !stt.tries ? '' : stt.last.correct ? 'ok' : 'bad'
            return s0.open
              ? `<a class="pill ${cls}" href="#/p/${pid}?ladder=${L.id}">${P(pid).points}점 ${cls === 'ok' ? '맞힘' : cls === 'bad' ? '다시' : '풀기'}</a>`
              : `<span class="pill locked">잠김</span>`
          })
          .join('')
        return `<div class="stair ${s0.cleared ? 'cleared' : s0.open ? 'open' : 'locked'}" style="--i:${i}">
          <div class="stair-no mono">${i + 1}</div>
          <div class="stair-body">
            <div class="filters" style="margin:0 0 6px"><b>${st.name}</b><span class="chip">${st.tag}</span>${s0.cleared ? `<span class="chip ok">${s0.skipped && s0.correct < s0.need ? '건너뜀' : '통과'}</span>` : ''}</div>
            <div class="small muted">맞힌 문제 ${s0.correct} / ${s0.need}
              · <a href="#/c/${st.concept}" style="color:var(--marker-ink);font-weight:800">${C(st.concept).name} ${hasMovie(st.concept) ? '영상 ▶' : '설명 →'}</a></div>
            <div class="pills">${pills}</div>
          </div></div>`
      })
      .reverse()
      .join('')
    const nx = nextLadder(L)
    const firstTodo = ss.findIndex((x) => !x.cleared)
    $app.innerHTML = `<a class="crumb" href="${MATH_PATH.includes(L.id) ? '#/path' : '#/ladders'}">← ${MATH_PATH.includes(L.id) ? '수학 길' : '계단 목록'}</a>
      <h1 style="--c:${sub.color}">${L.name}</h1><p class="lead">${L.desc}. 아래 1단계부터 올라가요.</p>
      ${
        firstTodo >= 0
          ? `<div class="card test-card"><div><b>이미 아는 것 같아요?</b><div class="small muted">단계마다 한 문제씩 풀어 봐요. 맞힌 단계는 건너뛰고, 틀린 단계부터 배우면 돼요.</div></div>
             <a class="btn main sm" href="#/p/${testPid(L, firstTodo)}?test=${L.id}&i=${firstTodo}">건너뛰기 시험</a></div>`
          : ''
      }
      <div class="stairs">${steps}</div>
      ${
        nx
          ? `<div class="card next-card ${ladderDone(L) ? 'ready' : ''}"><div><span class="hand" style="color:var(--marker-ink)">${ladderDone(L) ? '다 올랐어요!' : '다 오르면'}</span>
             <div><b>다음 계단: ${nx.name}</b> <span class="chip">${nx.grades.join(' · ')}</span></div></div>
             <a class="btn ${ladderDone(L) ? 'main' : 'ghost'} sm" href="#/l/${nx.id}">${ladderDone(L) ? '올라가기 →' : '미리 보기 →'}</a></div>`
          : ''
      }`
  }
  // 건너뛰기 시험: 맞히면 다음 단계 확인, 틀리면 그 단계부터 배우기
  function testNext(L, i, ok) {
    if (!ok)
      return `<a class="btn main sm" style="margin-top:10px;width:100%" href="#/l/${L.id}">여기 「${L.steps[i].name}」부터 배우면 돼요 →</a>`
    const ss = stepState(L)
    let j = i + 1
    while (j < L.steps.length && ss[j].cleared) j++
    if (j < L.steps.length)
      return `<a class="btn main sm" style="margin-top:10px;width:100%" href="#/p/${testPid(L, j)}?test=${L.id}&i=${j}">통과! 다음 단계 확인 →</a>`
    const nx = nextLadder(L)
    return `<a class="btn main sm" style="margin-top:10px;width:100%" href="${nx ? `#/l/${nx.id}` : '#/path'}">${L.name} 전부 통과! ${nx ? `다음 계단 「${nx.name}」 →` : '수학 길로 →'}</a>`
  }
  function nextInLadder(L, pid) {
    const ss = stepState(L)
    for (let i = 0; i < L.steps.length; i++) {
      if (!ss[i].open) break
      const todo = L.steps[i].problems.find((x) => x !== pid && !lastCorrect(x))
      if (todo) return todo
    }
    return null
  }

  // ───────── 문제 하나: 풀기 → 막힌 곳 → 기초 → 쉬운 문제 → 힌트·풀이
  function problem(id, q) {
    const p = P(id)
    if (!p) return home()
    const sub = S(p.subject)
    const st = (live[id] = live[id] || { pick: '', graded: null, stuck: [], open: false, hint: false, sol: false })
    const from = q.get('from')
    const lad = q.get('ladder') && LADDERS.find((x) => x.id === q.get('ladder'))
    const testL = q.get('test') && LADDERS.find((x) => x.id === q.get('test'))
    const testI = testL ? Number(q.get('i')) : -1
    const misC = q.get('mission') && MCOURSES.some((g) => g[0] === q.get('mission')) ? q.get('mission') : null
    const misI = misC ? Number(q.get('i')) || 0 : -1
    const nextP = lad && st.graded ? nextInLadder(lad, p.id) : null
    const stage = st.sol ? 5 : st.hint ? 4 : st.stuck.length ? 3 : st.open || st.graded !== null ? 2 : 1
    $app.innerHTML = `
      ${testL ? `<div class="test-banner">건너뛰기 시험 · ${testL.name} ${testI + 1}단계 「${testL.steps[testI].name}」</div>` : ''}
      ${misC ? `<div class="test-banner">오늘의 랜덤 미션 · ${misI + 1} / 3</div>` : ''}
      ${misC ? '<a class="crumb" href="#/">← 오늘의 미션</a>' : testL ? `<a class="crumb" href="#/l/${testL.id}">← ${testL.name}</a>` : lad ? `<a class="crumb" href="#/l/${lad.id}">← ${lad.name}</a>` : from && C(from) ? `<a class="crumb" href="#/c/${from}">← ${C(from).name}</a>` : `<a class="crumb" href="#/problems">← 문제 목록</a>`}
      <div class="stepper">${['풀기', '막힌 곳', '기초 보기', '힌트', '풀이'].map((n, i) => `<span class="${i < stage ? 'done' : ''}">${n}</span>`).join('')}</div>
      <div class="solve" style="--c:${sub.color}">
        <div class="card qcard ${st.ink ? 'inking' : ''}">
          ${st.ink ? Ink.toolbarHtml() : ''}
          <div class="head"><span class="chip subj">${sub.name} · ${unitName(p.subject, p.unit)}</span>
            <span class="chip">${p.kind === 'real' ? '실전' : '기초'} · ${p.slot}</span><span class="chip pink mono">${p.points}점</span>${p.made ? `<span class="chip" title="만든 날">${madeLabel(p)} 만듦</span>` : ''}
            ${p.subject === 'eng' && Speak.supported ? '<button type="button" class="ink-toggle listen" id="listenBtn">듣기</button><button type="button" class="ink-toggle listen" id="slowBtn">천천히</button>' : ''}
            <button type="button" class="ink-toggle" id="inkBtn">${st.ink ? '연습장 닫기' : Ink.has(inkKey(p.id)) ? '연습장 (쓴 것 있음)' : '연습장'}</button>${gradeMark(st.graded)}</div>
          <div class="qbox">${p.body}</div>
          ${
            p.type === 'choice'
              ? `<div class="choices">${p.choices
                  .map((c, i) => {
                    const n = i + 1
                    const cls = st.graded === null ? (st.pick === n ? 'on' : '') : st.pick === n ? (st.graded ? 'right' : 'wrong') : ''
                    return `<button data-i="${n}" class="${cls}"><span class="n">${n}</span>${c}</button>`
                  })
                  .join('')}</div>`
              : ''
          }
          ${st.ink ? '<div class="ink-space"><span class="hand">연습</span></div>' : ''}
        </div>
        <div class="card answer">
          ${
            p.type === 'choice'
              ? `<div class="lab">고른 답</div><div class="display ${st.pick ? '' : 'empty-v'}">${st.pick ? '①②③④⑤'[st.pick - 1] : '보기를 골라요'}</div>`
              : `<div class="lab">내 답</div><div class="display ${st.pick === '' ? 'empty-v' : ''}">${st.pick === '' ? '숫자를 눌러요' : esc(st.pick)}</div>
               <div class="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '⌫'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}</div>`
          }
          <div class="acts" style="${p.type === 'choice' ? 'margin-top:12px' : ''}">
            <button class="btn main" id="grade">채점하기</button>
            <button class="btn ghost" id="stuckBtn">막혔어요</button>
          </div>
          ${
            st.graded === null
              ? ''
              : st.graded
                ? `<div class="result ok">정답이에요. 풀이도 한 번 보고 가요.</div>${testL ? testNext(testL, testI, true) : ''}${misC ? missionNext(misC, misI) : ''}${lad ? `<a class="btn main sm" style="margin-top:10px;width:100%" href="${nextP ? `#/p/${nextP}?ladder=${lad.id}` : `#/l/${lad.id}`}">${nextP ? '계단 다음 문제 →' : '계단으로 돌아가기'}</a>` : ''}`
                : `<div class="result bad">틀렸어요. 아래에서 막힌 곳을 골라 봐요.</div>${testL ? testNext(testL, testI, false) : ''}${misC ? missionNext(misC, misI) : ''}`
          }
          ${reportBox('문제 ' + p.id, p.subject, p.id)}
        </div>
      </div>
      <div class="steps">${st.open || st.graded !== null ? stepsHtml(p, st) : ''}</div>
      <p class="small muted" style="margin-top:22px">비슷한 문제가 더 필요하면 → <a style="color:var(--marker-ink);font-weight:700" href="#/feedback?pid=${p.id}">요청 남기기</a></p>`

    const again = () => {
      const y = scrollY
      problem(id, q)
      scrollTo(0, y)
    }
    document.getElementById('inkBtn').onclick = () => {
      st.ink = !st.ink
      again()
    }
    if (st.ink) Ink.attach($app.querySelector('.qcard'), inkKey(p.id))
    bindReports()
    $app.querySelectorAll('.ex-host[data-scene]').forEach((h) => Explain.mount(h, h.dataset.scene))
    // 영어 듣기: 지문 상자나 기울임 문장만 골라 읽는다 (한국어 지시문은 빼고)
    const listen = (rate, btn) => {
      if (Speak.speaking()) {
        Speak.stop()
        $app.querySelectorAll('.listen').forEach((b) => b.classList.remove('on'))
        return
      }
      const box = $app.querySelector('.qcard .qbox')
      const parts = box.querySelectorAll('.passage, i')
      const text = parts.length ? [...parts].map((e) => e.innerText).join(' ') : box.innerText.replace(/[ㄱ-ㅎ가-힣]+/g, ' ')
      btn.classList.add('on')
      Speak.say(text, rate, () => btn.classList.remove('on'))
    }
    const lb = document.getElementById('listenBtn')
    if (lb) lb.onclick = () => listen(0.95, lb)
    const sb = document.getElementById('slowBtn')
    if (sb) sb.onclick = () => listen(0.7, sb)
    $app.querySelectorAll('.choices button').forEach(
      (b) =>
        (b.onclick = () => {
          if (st.graded === null || !st.graded) {
            st.graded = null
            st.pick = +b.dataset.i
            again()
          }
        }),
    )
    const press = (k) => {
      if (st.graded) return
      st.graded = null
      if (k === '⌫') st.pick = st.pick.slice(0, -1)
      else if (k === '−') st.pick = st.pick.startsWith('-') ? st.pick.slice(1) : '-' + st.pick
      else if (st.pick.replace('-', '').length < 4) st.pick += k
      again()
    }
    $app.querySelectorAll('.pad button').forEach((b) => (b.onclick = () => press(b.dataset.k)))
    if (p.type !== 'choice') {
      keyHandler = (e) => {
        if (e.target.closest && e.target.closest('input,textarea,select')) return
        if (/^\d$/.test(e.key)) press(e.key)
        else if (e.key === 'Backspace') press('⌫')
        else if (e.key === '-') press('−')
        else if (e.key === 'Enter') document.getElementById('grade').click()
      }
      document.addEventListener('keydown', keyHandler)
    }
    document.getElementById('grade').onclick = () => {
      if (st.pick === '' || st.pick === '-' || st.graded !== null) return
      st.graded = Number(st.pick) === p.answer
      if (testL && st.graded) addSkip(testL.id, testI)
      Store.record(p.id, st.graded, st.stuck)
      if (!st.graded) st.open = true
      again()
    }
    document.getElementById('stuckBtn').onclick = () => {
      st.open = true
      again()
      document.querySelector('.steps').scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    $app.querySelectorAll('.stuck button').forEach(
      (b) =>
        (b.onclick = () => {
          const k = b.dataset.c
          st.stuck = st.stuck.includes(k) ? st.stuck.filter((x) => x !== k) : [...st.stuck, k]
          if (st.graded !== null) Store.setStuck(p.id, st.stuck)
          again()
        }),
    )
    const h = document.getElementById('hintBtn')
    if (h)
      h.onclick = () => {
        st.hint = true
        again()
      }
    const s = document.getElementById('solBtn')
    if (s)
      s.onclick = () => {
        st.sol = true
        again()
      }
  }
  const hasMovie = (cid) => Explain.has(cid) || !!(C(cid) && C(cid).video)
  const inkKey = (pid) => `${Store.user().name}:${pid}`

  // 채점 펜: 맞으면 동그라미, 틀리면 빗금
  function gradeMark(graded) {
    if (graded === null) return ''
    return graded
      ? '<svg class="mark" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24"/></svg>'
      : '<svg class="mark" viewBox="0 0 64 64"><path d="M14 50 50 14"/></svg>'
  }
  function stepsHtml(p, st) {
    const easy = (p.similar || []).map(P).filter(Boolean)
    const stuckC = st.stuck.map((k) => [k, C(k)]).filter((x) => x[1])
    let n = 0
    return `
      <div class="step"><div class="h"><span class="no">${++n}</span>어디서 막혔나요? <span class="muted small">여러 개 골라도 돼요</span></div>
        <div class="b stuck">${p.concepts.map((k) => `<button data-c="${k}" class="${st.stuck.includes(k) ? 'on' : ''}">${C(k).name}</button>`).join('')}</div></div>
      <div class="step"><div class="h"><span class="no">${++n}</span>막힌 개념 기초 보기</div>
        <div class="b">${
          stuckC.length
            ? `<div class="links">${stuckC.map(([k, c]) => `<a href="#/c/${k}?from=${p.id}"><span>${c.name}${MEMOS[k] ? `<small class="memo-line">${MEMOS[k].match(/<b>(.*?)<\/b>/)?.[1] || ''}</small>` : ''}</span><span class="go">${hasMovie(k) ? '영상 보기 ▶' : '설명 보기 →'}</span></a>`).join('')}</div>`
            : '<span class="muted small">위에서 막힌 개념을 고르면 여기에 나와요.</span>'
        }</div></div>
      ${
        easy.length
          ? `<div class="step"><div class="h"><span class="no">${++n}</span>비슷한 쉬운 문제로 연습</div>
        <div class="b links">${easy.map((e) => `<a href="#/p/${e.id}"><span>${strip(e.body).slice(0, 56)}…</span><span class="go mono">${e.points}점 →</span></a>`).join('')}</div></div>`
          : ''
      }
      <div class="step"><div class="h"><span class="no">${++n}</span>원래 문제로 돌아와서</div>
        <div class="b">
          ${st.hint ? `<div class="sol"><span class="tag hand">힌트</span>${p.hint}</div>` : '<button class="btn sm" id="hintBtn">힌트 보기</button>'}
          ${
            st.hint
              ? st.sol
                ? `<div class="sol"><span class="tag hand">풀이</span><br>${p.solution}</div>
              ${p.scene && Explain.has(p.scene) ? `<div class="ex-host sol-ex" data-scene="${p.scene}"></div>` : ''}
              ${p.mistakes.length ? `<div style="margin-top:14px"><b>흔한 실수</b>${p.mistakes.map((m) => `<div class="mist">${m}</div>`).join('')}</div>` : ''}`
                : '<div style="margin-top:10px"><button class="btn sm" id="solBtn">풀이 보기</button></div>'
              : ''
          }
        </div></div>`
  }

  // ───────── 개념 지도
  function concepts() {
    const subs = SUBJECTS.filter((s) => ui.csubj === 'all' || s.id === ui.csubj)
    const weak = Store.weakConcepts()
    $app.innerHTML = `<h1>개념 지도</h1><p class="lead">위에서 아래로 순서대로 보면 돼요. 각 개념에서 그 개념을 쓰는 실전 문제로 올라가요.</p>
      <div class="filters">${gradeSeg()}</div>
      <div class="filters">${subjSeg('csubj')}</div>
      ${subs
        .map((s) =>
          s.units
            .filter((u) => inGrade(gradesOfUnit(s.id, u.id)))
            .map((u) => {
              const cs = Object.entries(CONCEPTS)
                .filter(([k, c]) => c.subject === s.id && c.unit === u.id && inGrade(gradesOfConcept(k)))
                .sort((a, b) => a[1].order - b[1].order)
              return `<div class="unit" style="--c:${s.color}"><div class="unit-h"><i></i><h2>${s.name} · ${u.name}</h2></div>
          <div class="chain">${cs.map(([k]) => cNode(k, weak[k])).join('')}</div></div>`
            })
            .join(''),
        )
        .join('')}`
    bindSeg(concepts)
    bindGrade(concepts)
  }
  function cNode(k, stuckN) {
    const c = C(k),
      real = usedBy(k).filter((p) => p.kind === 'real').length,
      easy = usedBy(k).length - real
    return `<a class="cnode" style="--c:${S(c.subject).color}" href="#/c/${k}"><span class="ord">${String(c.order).padStart(2, '0')}</span>
      <div class="t"><b>${c.name}</b><div>${hasMovie(k) ? '영상 · ' : ''}${real ? `실전 ${real}문제` : `기초 ${easy}문제`}에 쓰여요</div></div>
      ${stuckN ? `<span class="chip bad">${stuckN}번 막힘</span>` : ''}</a>`
  }
  function concept(id, q) {
    const c = C(id)
    if (!c) return concepts()
    const from = q.get('from'),
      sub = S(c.subject)
    const easy = usedBy(id).filter((p) => p.kind === 'easy'),
      real = usedBy(id).filter((p) => p.kind === 'real')
    $app.innerHTML = `
      ${from && P(from) ? `<a class="crumb" href="#/p/${from}">← 원래 문제로</a>` : `<a class="crumb" href="#/concepts">← 개념 지도</a>`}
      <div style="--c:${sub.color}"><span class="chip subj">${sub.name} · ${unitName(c.subject, c.unit)}</span></div>
      <h1 style="margin-top:10px">${c.name}</h1>
      <div class="concept-grid">
        ${Explain.has(id) ? '<div class="ex-host"></div>' : ''}
        <div class="concept-side">
        ${c.easy ? `<div class="card easy-card"><span class="hand">쉬운 말로</span><div>${c.easy}</div></div>` : ''}
        <div class="card concept-card"><div class="qbox" style="font-size:19px">${c.summary}</div>
          ${!Explain.has(id) && c.video ? `<div class="vwrap"><video src="${c.video}" controls playsinline preload="metadata"></video></div>` : ''}</div>
        ${MEMOS[id] ? `<div class="memo"><span class="hand">외우는 법</span><div>${MEMOS[id]}</div></div>` : ''}
        ${reportBox('개념 ' + id + ' ' + c.name, c.subject)}
        </div>
      </div>
      ${easy.length ? `<div class="sec"><div class="sec-h"><h2>먼저 쉬운 문제로</h2></div><div class="pgrid">${easy.map((p) => pCard(p, id)).join('')}</div></div>` : ''}
      ${real.length ? `<div class="sec"><div class="sec-h"><h2>이 개념을 쓰는 실전 문제</h2></div><div class="pgrid">${real.map((p) => pCard(p, id)).join('')}</div></div>` : ''}
      ${from && P(from) ? `<div class="sec"><a class="btn main" href="#/p/${from}">원래 문제로 돌아가기 →</a></div>` : ''}`
    if (Explain.has(id)) Explain.mount($app.querySelector('.ex-host'), id)
    bindReports()
  }

  // ───────── 오답노트
  const NSORTS = {
    due: ['복습할 날 순', (a, b) => a.n.due - b.n.due],
    wrong: ['많이 틀린 순', (a, b) => Store.stat(b.p.id).wrong - Store.stat(a.p.id).wrong],
    recent: ['최근 추가 순', (a, b) => b.n.added - a.n.added],
    subject: ['과목 순', (a, b) => SUBJECTS.findIndex((s) => s.id === a.p.subject) - SUBJECTS.findIndex((s) => s.id === b.p.subject)],
    points: ['배점 높은 순', (a, b) => b.p.points - a.p.points],
  }
  function notes() {
    const u = Store.user()
    const items = Object.entries(u.notes)
      .map(([pid, n]) => ({ p: P(pid), n }))
      .filter((x) => x.p)
      .filter((x) => ui.subj === 'all' || x.p.subject === ui.subj)
      .sort(NSORTS[ui.noteSort][1])
    $app.innerHTML = `<h1>나만의 오답노트</h1>
      <p class="lead">틀린 문제가 자동으로 모여요. 다시 맞히면 복습 간격이 1 → 3 → 7 → 14 → 30일로 늘어나요.</p>
      <div class="filters">${subjSeg('subj')}<select id="nsort">${Object.entries(NSORTS)
        .map(([k, [n]]) => `<option value="${k}" ${ui.noteSort === k ? 'selected' : ''}>${n}</option>`)
        .join('')}</select></div>
      ${
        items.length
          ? `<div class="ngrid">${items
              .map(({ p, n }) => {
                const s = Store.stat(p.id),
                  due = n.due <= Date.now()
                return `<div class="card ncard">${pCard(p)}
          <div class="meta"><span class="chip ${due ? 'pink' : ''}">${due ? '오늘 복습' : `${day(n.due)} 복습`}</span>
            <span class="muted">시도 ${s.tries} · 틀림 ${s.wrong}</span>
            ${s.last && s.last.stuck.length ? `<span class="muted">· 막힌 곳 ${s.last.stuck.map((k) => (C(k) ? C(k).name : k)).join(', ')}</span>` : ''}</div>
          <textarea data-memo="${p.id}" placeholder="왜 틀렸는지 한 줄 메모">${esc(n.memo || '')}</textarea>
          <div class="act"><a class="btn sm main" href="#/p/${p.id}">다시 풀기</a><button class="btn sm ghost" data-del="${p.id}">노트에서 빼기</button></div></div>`
              })
              .join('')}</div>`
          : '<div class="empty">아직 틀린 문제가 없어요.</div>'
      }`
    bindSeg(notes)
    document.getElementById('nsort').onchange = (e) => {
      ui.noteSort = e.target.value
      notes()
    }
    $app.querySelectorAll('textarea[data-memo]').forEach((t) => (t.onchange = () => Store.setMemo(t.dataset.memo, t.value)))
    $app.querySelectorAll('[data-del]').forEach(
      (b) =>
        (b.onclick = async () => {
          if (await Ask('오답노트에서 뺄까요?', { desc: '푼 기록은 그대로 남고, 오답노트 목록에서만 빠져요.', ok: '빼기', danger: true })) {
            Store.removeNote(b.dataset.del)
            notes()
          }
        }),
    )
  }

  // ───────── 이상한 곳 알려 주기: 문제·개념·지도 어디서든 같은 쪽지
  const REPORT_REASONS = ['답이 틀린 것 같아요', '풀이·설명이 틀린 것 같아요', '문제가 이해 안 돼요', '글자·그림이 이상해요']
  const reportBox = (tag, subject, pid) =>
    `<div class="report" data-tag="${esc(tag)}" data-subject="${subject}" data-pid="${pid || ''}"><button type="button" class="report-open">이상한 곳 알려 주기</button></div>`
  function bindReports() {
    $app.querySelectorAll('.report').forEach((box) => {
      const open = box.querySelector('.report-open')
      if (open) open.onclick = () => openReport(box)
    })
  }
  function openReport(box) {
    box.innerHTML = `<div class="report-panel">
      <div class="small" style="font-weight:800">무엇이 이상해요?</div>
      <div class="stuck report-reasons">${REPORT_REASONS.map((r, i) => `<button type="button" data-i="${i}">${r}</button>`).join('')}</div>
      <textarea maxlength="200" placeholder="어디가 이상한지 한 줄 (안 써도 돼요)"></textarea>
      <div class="filters" style="margin:10px 0 0"><button type="button" class="btn sm main report-send" disabled>보내기</button><button type="button" class="btn sm ghost report-cancel">취소</button></div>
    </div>`
    let pick = null
    const send = box.querySelector('.report-send')
    box.querySelectorAll('.report-reasons button').forEach((b) => {
      b.onclick = () => {
        pick = +b.dataset.i
        box.querySelectorAll('.report-reasons button').forEach((x) => x.classList.toggle('on', x === b))
        send.disabled = false
      }
    })
    box.querySelector('.report-cancel').onclick = () => {
      box.innerHTML = '<button type="button" class="report-open">이상한 곳 알려 주기</button>'
      bindReports()
    }
    send.onclick = () => {
      const memo = box.querySelector('textarea').value.trim()
      const text = `[${box.dataset.tag}] ${REPORT_REASONS[pick]}${memo ? ' · ' + memo : ''}`.slice(0, 300)
      Store.sendFeedback({ kind: 'error', subject: box.dataset.subject, pid: box.dataset.pid || null, text })
      box.innerHTML = '<div class="report-done">고마워요! 확인하고 고칠게요. 요청 화면에서 처리 상황을 볼 수 있어요.</div>'
    }
  }

  // ───────── 한국사 지도: 핀을 누르면 그곳 사건, '어디였지?' 퀴즈
  const ERAS = [
    ['all', '전체'],
    ['pre', '선사'],
    ['three', '삼국'],
    ['nsk', '남북국 · 후삼국'],
    ['goryeo', '고려'],
    ['joseon1', '조선 전기'],
    ['joseon2', '조선 후기'],
    ['open', '흥선 대원군 ~ 대한 제국'],
    ['colony', '일제 강점기'],
    ['modern', '광복 이후'],
  ]
  const mapState = { era: 'all', sel: null, ev: null, quiz: null, score: [0, 0] }
  // 연도 다음에 달로: 같은 해 사건도 일어난 순서대로
  const evOrd = (e) => e.year + (e.m || 0) / 100
  // 화면에 보이는 때: 1592.4 처럼 달까지 (같은 해 사건 구분용)
  const evWhen = (e) => {
    if (e.when) return e.when
    if (!e.m || e.mOrder) return String(e.year)
    const mo = Math.floor(e.m)
    const d = Math.round((e.m - mo) * 100)
    return `${e.year}.${mo}${d ? '.' + d : ''}`
  }
  const evWhenLong = (e) => {
    if (e.when || !e.m || e.mOrder) return evWhen(e)
    const mo = Math.floor(e.m)
    const d = Math.round((e.m - mo) * 100)
    return `${e.year}년 ${mo}월${d ? ` ${d}일` : ''}${e.year < 1896 ? ' (음력)' : ''}`
  }
  const evKey = (e) => `${e.place}|${e.title}`
  const DETAIL = () => window.HISTORY_DETAIL || {}
  const proj = (lat, lon) => [(lon - KMAP.lon0) * KMAP.k * KMAP.s, (KMAP.lat1 - lat) * KMAP.s]
  const keyLine = (e) => (e.key ? `<div class="ev-key"><span class="hand">꼭 기억</span>${e.key}</div>` : '')
  const placeName = (id) => (HISTORY_PLACES.find((p) => p.id === id) || {}).name
  function mapView() {
    const evs = HISTORY_EVENTS.filter((e) => mapState.era === 'all' || e.era === mapState.era)
    const placeIds = [...new Set(evs.map((e) => e.place))]
    const places = HISTORY_PLACES.filter((p) => placeIds.includes(p.id))
    const q = mapState.quiz
    const sel = mapState.sel && places.find((p) => p.id === mapState.sel)
    const selEvs = sel ? evs.filter((e) => e.place === sel.id).sort((a, b) => evOrd(a) - evOrd(b)) : []
    const pinHtml = places
      .map((p) => {
        const [x, y] = proj(p.lat, p.lon)
        const on = sel && sel.id === p.id
        const hit = q && q.answered && q.ev.place === p.id
        const L = {
          r: [16, 7, 'start'],
          l: [-16, 7, 'end'],
          lb: [-14, 24, 'end'],
          rt: [14, -10, 'start'],
          lt: [-12, -12, 'end'],
          rb: [14, 24, 'start'],
        }[p.label || 'r'] || [16, 7, 'start']
        const label = q && !q.answered ? '' : `<text x="${L[0]}" y="${L[1]}" text-anchor="${L[2]}">${p.name}</text>`
        return `<g class="pin ${on ? 'on' : ''} ${hit ? 'hit' : ''}" data-p="${p.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="26" class="pin-hit"/><circle r="11" class="pin-dot"/>${label}</g>`
      })
      .join('')
    let side = '<div class="empty">지도에서 핀을 눌러 보세요.</div>'
    if (q) {
      const res = q.answered
        ? `<div class="result ${q.ok ? 'ok' : 'bad'}">${q.ok ? '맞았어요!' : `정답은 ${placeName(q.ev.place)}이에요.`}</div><p>${q.ev.desc}</p>${keyLine(q.ev)}<button class="btn main sm" id="nextQ" style="margin-top:12px">다음 문제</button>`
        : '<p class="muted">지도에서 이 일이 일어난 곳을 눌러요.</p>'
      side = `<div class="card"><div class="hand" style="color:var(--marker-ink)">어디였지?</div><h2 style="margin:6px 0">${q.ev.title} <span class="mono muted">(${evWhenLong(q.ev)})</span></h2>${res}</div>`
    } else if (sel) {
      const list = selEvs
        .map((e) => {
          const link = e.concept
            ? `<a class="small" style="color:var(--marker-ink);font-weight:800" href="#/c/${e.concept}">개념 보기 →</a>`
            : ''
          return `<div class="ev" data-ev="${esc(evKey(e))}" role="button" tabindex="0"><span class="mono ev-year">${evWhen(e)}</span><div><b>${e.title}</b><div class="small">${e.desc}</div>${keyLine(e)}${link}<div class="ev-more">자세히 보기 →</div></div></div>`
        })
        .join('')
      side = `<div class="card"><h2>${sel.name}</h2>${list}${reportBox('지도 ' + sel.name, 'his')}</div>`
      const cur = mapState.ev && selEvs.find((e) => evKey(e) === mapState.ev)
      if (cur) side = evDetail(cur, sel)
    }
    $app.innerHTML = `<h1>한국사 지도</h1>
      <p class="lead">핀을 누르면 그곳에서 일어난 일이 나와요. ‘어디였지?’를 누르면 사건이 나오고, 지도에서 그 자리를 찍어 맞혀요.</p>
      <div class="filters">
        <div class="seg" id="era">${ERAS.map(([v, n]) => `<button data-v="${v}" class="${mapState.era === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <button class="btn sm ${q ? '' : 'main'}" id="quizBtn">${q ? '퀴즈 그만' : '어디였지? 퀴즈'}</button>
        ${mapState.score[1] ? `<span class="chip">맞힘 ${mapState.score[0]} / ${mapState.score[1]}</span>` : ''}
      </div>
      <div class="map-wrap">
        <div class="card map-card">
          <svg id="kmap" viewBox="0 0 ${KMAP.w} ${KMAP.h}" role="img" aria-label="한반도 지도">
            ${KMAP.land.map((l) => `<path class="land ${l.c}" d="${l.d}"/>`).join('')}
            ${pinHtml}
          </svg>
        </div>
        <div class="map-side">${side}</div>
      </div>`
    bindReports()
    const openEv = (k) => {
      mapState.ev = k
      mapView()
      document.querySelector('.map-side').scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    $app.querySelectorAll('.ev[data-ev]').forEach((el) => {
      el.onclick = (e) => {
        if (e.target.closest('a')) return
        openEv(el.dataset.ev)
      }
      el.onkeydown = (e) => {
        if (e.key === 'Enter') openEv(el.dataset.ev)
      }
    })
    const back = document.getElementById('evBack')
    if (back) back.onclick = () => openEv(null)
    $app.querySelectorAll('[data-jump]').forEach((b) => {
      b.onclick = () => {
        const t = HISTORY_EVENTS.find((e) => evKey(e) === b.dataset.jump)
        if (!t) return
        if (mapState.era !== 'all') mapState.era = t.era
        mapState.sel = t.place
        openEv(evKey(t))
      }
    })
    $app.querySelectorAll('#era button').forEach((b) => {
      b.onclick = () => {
        mapState.era = b.dataset.v
        mapState.sel = null
        mapState.ev = null
        if (mapState.quiz) newQuiz()
        mapView()
      }
    })
    document.getElementById('quizBtn').onclick = () => {
      if (mapState.quiz) mapState.quiz = null
      else newQuiz()
      mapView()
    }
    const nx = document.getElementById('nextQ')
    if (nx) {
      nx.onclick = () => {
        newQuiz()
        mapView()
      }
    }
    $app.querySelectorAll('.pin').forEach((g) => {
      g.onclick = () => {
        const id = g.dataset.p
        if (mapState.quiz && !mapState.quiz.answered) {
          mapState.quiz.answered = true
          mapState.quiz.ok = HISTORY_EVENTS.some((e) => e.title === mapState.quiz.ev.title && e.place === id) // 부마처럼 여러 곳이면 어느 곳이든 정답
          mapState.score = [mapState.score[0] + (mapState.quiz.ok ? 1 : 0), mapState.score[1] + 1]
        } else if (!mapState.quiz) {
          mapState.sel = id
          mapState.ev = null
        }
        mapView()
        // 휴대폰(세로)에서는 설명 카드가 지도 아래라 그쪽으로 내려 준다
        if (matchMedia('(orientation: portrait)').matches)
          document.querySelector('.map-side').scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }
  // 사건 하나 자세히: 배경 → 전개 → 결과, 인물, 헷갈리는 점, 앞뒤 사건
  function evDetail(e, place) {
    const d = DETAIL()[evKey(e)]
    const all = [...HISTORY_EVENTS].sort((a, b) => evOrd(a) - evOrd(b))
    const i = all.findIndex((x) => evKey(x) === evKey(e))
    const prev = all[i - 1]
    const next = all[i + 1]
    const eraName = (ERAS.find((x) => x[0] === e.era) || [])[1] || ''
    const jump = (x, dir) =>
      x
        ? `<button type="button" class="ev-jump ${dir}" data-jump="${esc(evKey(x))}"><span class="small muted">${dir === 'prev' ? '← 바로 앞 사건' : '바로 다음 사건 →'}</span><b>${x.title}</b><span class="mono small">${evWhen(x)} · ${placeName(x.place)}</span></button>`
        : '<span></span>'
    const body = d
      ? `<div class="ev-flow">
          <div class="st"><span class="tag">배경</span><div>${d.bg}</div></div>
          <div class="st"><span class="tag">전개</span><ol>${d.flow.map((x) => `<li>${x}</li>`).join('')}</ol></div>
          <div class="st"><span class="tag">결과 · 의의</span><div>${d.result}</div></div>
        </div>
        ${d.people && d.people.length ? `<div class="ev-sub">인물</div><div class="ev-people">${d.people.map(([n, r]) => `<div><b>${n}</b><span>${r}</span></div>`).join('')}</div>` : ''}
        ${d.trap ? `<div class="ev-trap"><span class="hand">헷갈리지 마</span>${d.trap}</div>` : ''}`
      : '<p class="muted small">자세한 설명은 준비 중이에요.</p>'
    return `<div class="card ev-detail">
      <button type="button" class="crumb" id="evBack">← ${place.name} 사건 목록</button>
      <div class="filters" style="margin:6px 0 0"><span class="chip">${eraName}</span><span class="chip">${evWhenLong(e)}</span><span class="chip">${placeName(e.place)}</span></div>
      <h2 style="margin:10px 0 6px">${e.title}</h2>
      <p>${e.desc}</p>${keyLine(e)}
      ${body}
      <div class="ev-nav">${jump(prev, 'prev')}${jump(next, 'next')}</div>
      ${reportBox('지도 ' + e.title, 'his')}</div>`
  }
  function newQuiz() {
    const evs = HISTORY_EVENTS.filter((e) => mapState.era === 'all' || e.era === mapState.era)
    const prev = mapState.quiz && mapState.quiz.ev
    let ev = evs[Math.floor(Math.random() * evs.length)]
    if (prev && evs.length > 1) while (ev === prev) ev = evs[Math.floor(Math.random() * evs.length)]
    mapState.quiz = { ev, answered: false, ok: false }
  }

  // ───────── 요청 (수능 공부 관련만)
  const FB_KINDS = [
    ['more', '이런 문제 더 내 주세요'],
    ['explain', '풀이가 이해 안 돼요'],
    ['concept', '개념 설명이 필요해요'],
    ['error', '문제·답이 이상해요'],
  ]
  function feedback(_, q) {
    const pid = q.get('pid'),
      p = pid && P(pid)
    const mine = Store.myFeedback().slice().reverse()
    $app.innerHTML = `<h1>요청</h1><p class="lead">수능 공부에 관한 것만 받아요. 남기면 확인해서 새 문제나 설명을 만들어 올려요.</p>
      <div class="card">
        <div class="small muted" style="font-weight:800;margin-bottom:8px">무엇이 필요해요?</div>
        <div class="seg" id="fk" style="margin-bottom:14px">${FB_KINDS.map(([v, n], i) => `<button data-v="${v}" class="${i === 0 ? 'on' : ''}">${n}</button>`).join('')}</div>
        <div class="filters" style="margin-bottom:12px"><select id="fs">${SUBJECTS.map((s) => `<option value="${s.id}" ${p && p.subject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
          ${p ? `<span class="chip">문제: ${strip(p.body).slice(0, 26)}…</span>` : ''}</div>
        <textarea id="ft" maxlength="300" placeholder="예: 곡선 밖의 점에서 접선 긋는 문제 3개 더 / 2번 풀이에서 b를 왜 구하는지 모르겠어요"></textarea>
        <div class="filters" style="margin:12px 0 0"><button class="btn main" id="fb">보내기</button><span class="err" id="fe"></span></div>
      </div>
      <div class="sec"><div class="sec-h"><h2>내가 보낸 것</h2></div>
      ${
        mine.length
          ? `<div class="links">${mine
              .map(
                (f) => `<div class="card fcard">
        <div class="filters" style="margin-bottom:8px"><span class="chip">${(FB_KINDS.find((k) => k[0] === f.kind) || [null, ''])[1]}</span>
          <span class="chip subj" style="--c:${S(f.subject).color}">${S(f.subject).name}</span>
          <span class="chip ${f.status === '반영' ? 'ok' : f.status === '보류' ? '' : 'warn'}">${f.status}</span><span class="muted small mono" style="margin-left:auto">${day(f.ts)}</span></div>
        <div>${esc(f.text)}</div>${f.reply ? `<div class="sol" style="font-size:15px">↳ ${esc(f.reply)}</div>` : ''}</div>`,
              )
              .join('')}</div>`
          : '<div class="empty">아직 보낸 요청이 없어요.</div>'
      }</div>`
    let kind = 'more'
    $app.querySelectorAll('#fk button').forEach(
      (b) =>
        (b.onclick = () => {
          kind = b.dataset.v
          $app.querySelectorAll('#fk button').forEach((x) => x.classList.toggle('on', x === b))
        }),
    )
    document.getElementById('fb').onclick = () => {
      const text = document.getElementById('ft').value.trim()
      if (text.length < 4) {
        document.getElementById('fe').textContent = '조금 더 자세히 써 주세요.'
        return
      }
      Store.sendFeedback({ kind, subject: document.getElementById('fs').value, pid: pid || null, text })
      location.hash = '#/feedback'
      render()
    }
  }

  document.getElementById('who').onclick = async () => {
    if (Store.user() && (await Ask('나갈까요?', { desc: '푼 기록은 저장돼 있어서 다시 들어오면 그대로예요.', ok: '나가기' }))) {
      Store.logout()
      location.hash = '#/'
      render()
    }
  }
  window.addEventListener('hashchange', render)
  render()
})()
