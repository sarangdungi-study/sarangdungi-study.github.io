// 사랑둥이. 해시 주소로 화면을 바꿔요: #/ #/problems #/p/ID #/concepts #/c/ID #/notes #/feedback
;(function () {
  const $app = document.getElementById('app')
  const P = (id) => PROBLEMS.find((p) => p.id === id)
  const C = (id) => CONCEPTS[id]
  const S = (id) => SUBJECTS.find((s) => s.id === id) || { name: id, color: 'var(--pink)', units: [] }
  const unitName = (s, u) => (S(s).units.find((x) => x.id === u) || {}).name || u
  const usedBy = (cid) => PROBLEMS.filter((p) => p.concepts.includes(cid))
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
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
  const ui = { subj: 'all', sort: 'default', kind: 'real', noteSort: 'due', csubj: 'all', q: '' }
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
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler)
      keyHandler = null
    }
    document.getElementById('who').innerHTML = u ? `<span class="dot"></span>${esc(u.name)}` : '로그인'
    document.querySelectorAll('#nav a').forEach((a) => {
      const on = a.dataset.r === r || (a.dataset.r === 'problems' && r === 'p') || (a.dataset.r === 'concepts' && r === 'c')
      a.classList.toggle('on', on)
    })
    document.body.classList.toggle('out', !u)
    if (!u) return loginView()
    const views = { '': home, problems, p: problem, concepts, c: concept, notes, feedback, map: mapView }
    ;(views[r] || home)(id, q)
    window.scrollTo(0, 0)
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
    const next = PROBLEMS.find((p) => p.kind === 'real' && !st.last[p.id]) || PROBLEMS[0]
    $app.innerHTML = `
      <div class="hero">
        <div class="card today">
          <div class="date">${todayLabel()}</div>
          ${st.streak > 1 ? `<span class="note hand">${st.streak}일째!</span>` : ''}
          <h1><span class="hl">${esc(u.name)}</span>, 오늘도 정답게.</h1>
          <p>${due.length ? `다시 풀 문제가 ${due.length}개 있어요. 복습부터 하고 넘어가요.` : '막히면 개념으로 내려갔다가 다시 올라오면 돼요.'}</p>
          <a class="btn main" href="#/p/${(due[0] || next).id}">${due.length ? '복습 시작' : '다음 문제 풀기'}</a>
        </div>
        <div class="stats">
          <div class="stat"><div class="k">푼 문제</div><div class="v">${st.solved}<small>/${PROBLEMS.length}</small></div></div>
          <div class="stat"><div class="k">정답률</div><div class="v">${st.rate}<small>%</small></div></div>
          <div class="stat"><div class="k">오답노트</div><div class="v">${st.notes}</div></div>
          <div class="stat ${st.due ? 'hot' : ''}"><div class="k">오늘 복습</div><div class="v">${st.due}</div></div>
        </div>
      </div>

      <div class="sec"><div class="doors">
        <a class="door" href="#/problems"><span class="art">${ICON.up}</span><div><b>실전 문제부터</b>
          <span>수능형 문제를 먼저 풀고, 막힌 개념으로 내려가요.</span><div class="tag hand">고2 · 고1은 여기부터</div></div></a>
        <a class="door" href="#/concepts"><span class="art">${ICON.down}</span><div><b>기초 개념부터</b>
          <span>개념 영상을 보고, 그 개념을 쓰는 문제로 올라가요.</span><div class="tag hand">처음 배우는 단원이면</div></div></a>
      </div></div>

      <div class="sec"><div class="sec-h"><h2>과목별 진도</h2></div>
        <div class="subjects">${SUBJECTS.map((s) => {
          const all = PROBLEMS.filter((p) => p.subject === s.id),
            done = all.filter((p) => st.last[p.id]).length
          return `<a class="subj-tile" style="--c:${s.color}" href="#/problems" data-subj="${s.id}"><b>${s.name}</b>
            <div class="u">${s.units.map((x) => x.name).join(', ')}</div>
            <div class="bar"><i style="width:${all.length ? (done / all.length) * 100 : 0}%"></i></div>
            <div class="n"><span>푼 문제</span><span class="mono">${done}/${all.length}</span></div></a>`
        }).join('')}</div></div>

      ${
        due.length
          ? `<div class="sec"><div class="sec-h"><h2>오늘 다시 풀 문제</h2><a class="more" href="#/notes">오답노트 →</a></div>
        <div class="pgrid">${due.map((p) => pCard(p)).join('')}</div></div>`
          : ''
      }

      <div class="sec"><div class="sec-h"><h2>자주 막히는 개념</h2><a class="more" href="#/concepts">개념 지도 →</a></div>
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
    )
  }

  // ───────── 문제 목록
  const SORTS = {
    default: ['기본 순서', () => 0],
    level: ['쉬운 순', (a, b) => a.level - b.level],
    levelDesc: ['어려운 순', (a, b) => b.level - a.level],
    points: ['배점 높은 순', (a, b) => b.points - a.points],
    wrong: ['많이 틀린 순', (a, b) => Store.stat(b.id).wrong - Store.stat(a.id).wrong],
    unsolved: ['안 푼 것 먼저', (a, b) => (Store.stat(a.id).tries > 0) - (Store.stat(b.id).tries > 0)],
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
  function problems() {
    $app.innerHTML = `<h1>문제</h1><p class="lead">수능형 실전 문제와 기초 문제. 막히면 문제 안에서 개념으로 내려갈 수 있어요.</p>
      <div class="filters">
        <label class="search">${ICON.search}<input id="q" placeholder="문제·개념 찾기 (예: 접선, 유음화)" value="${esc(ui.q)}"></label>
        <select id="sort">${Object.entries(SORTS)
          .map(([k, [n]]) => `<option value="${k}" ${ui.sort === k ? 'selected' : ''}>${n}</option>`)
          .join('')}</select>
      </div>
      <div class="filters">${subjSeg('subj')}
        <div class="seg" data-k="kind">${[
          ['real', '실전'],
          ['easy', '기초'],
          ['all', '모두'],
        ]
          .map(([v, n]) => `<button data-v="${v}" class="${ui.kind === v ? 'on' : ''}">${n}</button>`)
          .join('')}</div>
      </div>
      <div id="plist"></div>`
    const paint = () => {
      const q = ui.q.trim().toLowerCase()
      let list = PROBLEMS.filter((p) => (ui.subj === 'all' || p.subject === ui.subj) && (ui.kind === 'all' || p.kind === ui.kind))
      if (q)
        list = list.filter((p) =>
          (strip(p.body) + ' ' + p.concepts.map((k) => C(k).name).join(' ') + ' ' + unitName(p.subject, p.unit)).toLowerCase().includes(q),
        )
      list = list
        .map((p, i) => [p, i])
        .sort((a, b) => SORTS[ui.sort][1](a[0], b[0]) || a[1] - b[1])
        .map((x) => x[0])
      document.getElementById('plist').innerHTML = list.length
        ? `<div class="pgrid">${list.map((p) => pCard(p)).join('')}</div>`
        : '<div class="empty">맞는 문제가 없어요.</div>'
    }
    paint()
    bindSeg(problems)
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
      <div class="top"><span class="chip subj">${sub.name} · ${unitName(p.subject, p.unit)}</span><span class="pts">${p.points}점</span></div>
      <div class="q">${strip(p.body)}</div>
      <div class="bot"><span class="kind">${p.kind === 'real' ? '실전' : '기초'} · ${p.slot}</span>${mark}${s.wrong ? `<span class="chip warn">${s.wrong}번 틀림</span>` : ''}
        <span class="dots" title="난이도">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.level ? 'on' : ''}"></i>`).join('')}</span></div></a>`
  }

  // ───────── 문제 하나: 풀기 → 막힌 곳 → 기초 → 쉬운 문제 → 힌트·풀이
  function problem(id, q) {
    const p = P(id)
    if (!p) return home()
    const sub = S(p.subject)
    const st = (live[id] = live[id] || { pick: '', graded: null, stuck: [], open: false, hint: false, sol: false })
    const from = q.get('from')
    const stage = st.sol ? 5 : st.hint ? 4 : st.stuck.length ? 3 : st.open || st.graded !== null ? 2 : 1
    $app.innerHTML = `
      ${from && C(from) ? `<a class="crumb" href="#/c/${from}">← ${C(from).name}</a>` : `<a class="crumb" href="#/problems">← 문제 목록</a>`}
      <div class="stepper">${['풀기', '막힌 곳', '기초 보기', '힌트', '풀이'].map((n, i) => `<span class="${i < stage ? 'done' : ''}">${n}</span>`).join('')}</div>
      <div class="solve" style="--c:${sub.color}">
        <div class="card qcard ${st.ink ? 'inking' : ''}">
          ${st.ink ? Ink.toolbarHtml() : ''}
          <div class="head"><span class="chip subj">${sub.name} · ${unitName(p.subject, p.unit)}</span>
            <span class="chip">${p.kind === 'real' ? '실전' : '기초'} · ${p.slot}</span><span class="chip pink mono">${p.points}점</span>
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
                ? '<div class="result ok">정답이에요. 풀이도 한 번 보고 가요.</div>'
                : '<div class="result bad">틀렸어요. 아래에서 막힌 곳을 골라 봐요.</div>'
          }
        </div>
      </div>
      <div class="steps">${st.open || st.graded !== null ? stepsHtml(p, st) : ''}</div>
      <p class="small muted" style="margin-top:22px">이 문제가 이상하거나 비슷한 문제가 더 필요하면 → <a style="color:var(--pink-ink);font-weight:700" href="#/feedback?pid=${p.id}">요청 남기기</a></p>`

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
              ${p.video ? `<div class="vwrap"><video src="${p.video}" controls playsinline preload="metadata"></video></div>` : ''}
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
      <div class="filters">${subjSeg('csubj')}</div>
      ${subs
        .map((s) =>
          s.units
            .map((u) => {
              const cs = Object.entries(CONCEPTS)
                .filter(([, c]) => c.subject === s.id && c.unit === u.id)
                .sort((a, b) => a[1].order - b[1].order)
              return `<div class="unit" style="--c:${s.color}"><div class="unit-h"><i></i><h2>${s.name} · ${u.name}</h2></div>
          <div class="chain">${cs.map(([k]) => cNode(k, weak[k])).join('')}</div></div>`
            })
            .join(''),
        )
        .join('')}`
    bindSeg(concepts)
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
        <div class="card concept-card"><div class="qbox" style="font-size:19px">${c.summary}</div>
          ${!Explain.has(id) && c.video ? `<div class="vwrap"><video src="${c.video}" controls playsinline preload="metadata"></video></div>` : ''}</div>
        ${MEMOS[id] ? `<div class="memo"><span class="hand">외우는 법</span><div>${MEMOS[id]}</div></div>` : ''}
        </div>
      </div>
      ${easy.length ? `<div class="sec"><div class="sec-h"><h2>먼저 쉬운 문제로</h2></div><div class="pgrid">${easy.map((p) => pCard(p, id)).join('')}</div></div>` : ''}
      ${real.length ? `<div class="sec"><div class="sec-h"><h2>이 개념을 쓰는 실전 문제</h2></div><div class="pgrid">${real.map((p) => pCard(p, id)).join('')}</div></div>` : ''}
      ${from && P(from) ? `<div class="sec"><a class="btn main" href="#/p/${from}">원래 문제로 돌아가기 →</a></div>` : ''}`
    if (Explain.has(id)) Explain.mount($app.querySelector('.ex-host'), id)
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
        (b.onclick = () => {
          if (confirm('오답노트에서 뺄까요?')) {
            Store.removeNote(b.dataset.del)
            notes()
          }
        }),
    )
  }

  // ───────── 한국사 지도: 핀을 누르면 그곳 사건, '어디였지?' 퀴즈
  const ERAS = [
    ['all', '전체'],
    ['open', '흥선 대원군 ~ 대한 제국'],
    ['colony', '일제 강점기'],
    ['modern', '광복 이후'],
  ]
  const mapState = { era: 'all', sel: null, quiz: null, score: [0, 0] }
  const proj = (lat, lon) => [(lon - KMAP.lon0) * KMAP.k * KMAP.s, (KMAP.lat1 - lat) * KMAP.s]
  const placeName = (id) => (HISTORY_PLACES.find((p) => p.id === id) || {}).name
  function mapView() {
    const evs = HISTORY_EVENTS.filter((e) => mapState.era === 'all' || e.era === mapState.era)
    const placeIds = [...new Set(evs.map((e) => e.place))]
    const places = HISTORY_PLACES.filter((p) => placeIds.includes(p.id))
    const q = mapState.quiz
    const sel = mapState.sel && places.find((p) => p.id === mapState.sel)
    const selEvs = sel ? evs.filter((e) => e.place === sel.id).sort((a, b) => a.year - b.year) : []
    const pinHtml = places
      .map((p) => {
        const [x, y] = proj(p.lat, p.lon)
        const on = sel && sel.id === p.id
        const hit = q && q.answered && q.ev.place === p.id
        const L = { r: [16, 7, 'start'], l: [-16, 7, 'end'], lb: [-14, 24, 'end'], rt: [14, -10, 'start'], lt: [-12, -12, 'end'] }[
          p.label || 'r'
        ]
        const label = q && !q.answered ? '' : `<text x="${L[0]}" y="${L[1]}" text-anchor="${L[2]}">${p.name}</text>`
        return `<g class="pin ${on ? 'on' : ''} ${hit ? 'hit' : ''}" data-p="${p.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="26" class="pin-hit"/><circle r="11" class="pin-dot"/>${label}</g>`
      })
      .join('')
    let side = '<div class="empty">지도에서 핀을 눌러 보세요.</div>'
    if (q) {
      const res = q.answered
        ? `<div class="result ${q.ok ? 'ok' : 'bad'}">${q.ok ? '맞았어요!' : `정답은 ${placeName(q.ev.place)}이에요.`}</div><p>${q.ev.desc}</p><button class="btn main sm" id="nextQ">다음 문제</button>`
        : '<p class="muted">지도에서 이 일이 일어난 곳을 눌러요.</p>'
      side = `<div class="card"><div class="hand" style="color:var(--marker-ink)">어디였지?</div><h2 style="margin:6px 0">${q.ev.title} <span class="mono muted">(${q.ev.year})</span></h2>${res}</div>`
    } else if (sel) {
      const list = selEvs
        .map((e) => {
          const link = e.concept
            ? `<a class="small" style="color:var(--marker-ink);font-weight:800" href="#/c/${e.concept}">개념 보기 →</a>`
            : ''
          return `<div class="ev"><span class="mono ev-year">${e.year}</span><div><b>${e.title}</b><div class="small">${e.desc}</div>${link}</div></div>`
        })
        .join('')
      side = `<div class="card"><h2>${sel.name}</h2>${list}</div>`
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
    $app.querySelectorAll('#era button').forEach((b) => {
      b.onclick = () => {
        mapState.era = b.dataset.v
        mapState.sel = null
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
        } else if (!mapState.quiz) mapState.sel = id
        mapView()
        // 휴대폰(세로)에서는 설명 카드가 지도 아래라 그쪽으로 내려 준다
        if (matchMedia('(orientation: portrait)').matches)
          document.querySelector('.map-side').scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
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

  document.getElementById('who').onclick = () => {
    if (Store.user() && confirm('나갈까요?')) {
      Store.logout()
      location.hash = '#/'
      render()
    }
  }
  window.addEventListener('hashchange', render)
  render()
})()
