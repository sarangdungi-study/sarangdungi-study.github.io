// 수능 공부방. 해시 주소로 화면을 바꿔요: #/ #/problems #/p/ID #/concepts #/c/ID #/notes #/feedback
;(function () {
  const $app = document.getElementById('app')
  const P = id => PROBLEMS.find(p => p.id === id)
  const C = id => CONCEPTS[id]
  const subjName = id => (SUBJECTS.find(s => s.id === id) || {}).name || id
  const unitName = (s, u) => ((SUBJECTS.find(x => x.id === s) || { units: [] }).units.find(x => x.id === u) || {}).name || u
  const usedBy = cid => PROBLEMS.filter(p => p.concepts.includes(cid))
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const strip = h => h.replace(/<[^>]+>/g, '')
  const day = ts => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()}` }
  const circled = n => '①②③④⑤'[n - 1]

  // 문제마다 이번 화면에서의 상태 (새로고침하면 처음부터)
  const live = {}
  const ui = { subj: 'all', sort: 'default', kind: 'real', noteSort: 'due', csubj: 'all' }

  function parseHash() {
    const [path, qs] = location.hash.slice(2).split('?')
    const parts = path.split('/')
    return { r: parts[0] || '', id: parts[1], q: new URLSearchParams(qs || '') }
  }

  function render() {
    const { r, id, q } = parseHash()
    const u = Store.user()
    document.getElementById('who').textContent = u ? `${u.name} · 나가기` : '로그인'
    document.querySelectorAll('#nav a').forEach(a => {
      const on = a.dataset.r === r || (a.dataset.r === 'problems' && r === 'p') || (a.dataset.r === 'concepts' && r === 'c')
      a.classList.toggle('on', on)
    })
    if (!u && r !== 'login') return loginView()
    const views = { '': home, problems, p: problem, concepts, c: concept, notes, feedback, login: loginView }
    ;(views[r] || home)(id, q)
    window.scrollTo(0, 0)
  }

  // ───────── 로그인
  function loginView() {
    $app.innerHTML = `<div class="login card">
      <h1>들어가기</h1>
      <p class="muted small">처음이면 이름(별명)을 정해서 넣으면 바로 만들어져요. 비밀번호는 삼촌이 알려 준 4자리예요.</p>
      <label>이름(별명)<input id="ln" autocomplete="username"></label>
      <label>비밀번호 4자리<input id="lp" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password"></label>
      <div class="err" id="le"></div>
      <button class="btn main" id="lb" style="width:100%">들어가기</button></div>`
    const go = async () => {
      const e = await Store.login(document.getElementById('ln').value, document.getElementById('lp').value)
      if (e) document.getElementById('le').textContent = e
      else { location.hash = '#/'; render() }
    }
    document.getElementById('lb').onclick = go
    document.getElementById('lp').onkeydown = ev => { if (ev.key === 'Enter') go() }
  }

  // ───────── 홈: 두 입구 + 오늘 복습 + 약한 개념
  function home() {
    const u = Store.user()
    const due = Object.entries(u.notes).filter(([, n]) => n.due <= Date.now()).map(([pid]) => P(pid)).filter(Boolean)
    const weak = Object.entries(Store.weakConcepts()).sort((a, b) => b[1] - a[1]).slice(0, 4)
    $app.innerHTML = `
      <h1>${esc(u.name)}, 오늘은 어디서 시작할까요?</h1>
      <div class="doors">
        <a class="door up" href="#/problems"><b>실전 문제부터</b>
          <span class="muted">수능형 문제를 먼저 풀고, 막힌 개념으로 내려가요.</span><br><span class="arrow">고2·고1 추천 →</span></a>
        <a class="door" href="#/concepts"><b>기초 개념부터</b>
          <span class="muted">개념 영상을 보고, 그 개념을 쓰는 문제로 올라가요.</span><br><span class="arrow">처음 배우는 단원 →</span></a>
      </div>
      <h2>오늘 다시 풀 문제 <span class="chip gray">${due.length}</span></h2>
      ${due.length ? `<div class="plist">${due.map(pItem).join('')}</div>` : '<p class="muted">오늘 복습할 문제가 없어요.</p>'}
      <h2>자주 막히는 개념</h2>
      ${weak.length ? `<div class="chain">${weak.map(([cid, n]) => cNode(cid, `${n}번 막힘`)).join('')}</div>` : '<p class="muted">아직 기록이 없어요. 문제를 풀면 여기에 쌓여요.</p>'}`
  }

  // ───────── 문제 목록 (정렬·필터)
  const SORTS = {
    default: ['기본', (a, b) => 0],
    level: ['쉬운 순', (a, b) => a.level - b.level],
    levelDesc: ['어려운 순', (a, b) => b.level - a.level],
    points: ['배점 높은 순', (a, b) => b.points - a.points],
    wrong: ['많이 틀린 순', (a, b) => Store.stat(b.id).wrong - Store.stat(a.id).wrong],
    unsolved: ['안 푼 것 먼저', (a, b) => (Store.stat(a.id).tries > 0) - (Store.stat(b.id).tries > 0)],
    recent: ['최근 푼 순', (a, b) => ((Store.stat(b.id).last || {}).ts || 0) - ((Store.stat(a.id).last || {}).ts || 0)],
  }
  function subjSeg(key) {
    return `<div class="seg" data-k="${key}">${[['all', '전체'], ...SUBJECTS.map(s => [s.id, s.name])]
      .map(([v, n]) => `<button data-v="${v}" class="${ui[key] === v ? 'on' : ''}">${n}</button>`).join('')}</div>`
  }
  function bindSeg(cb) {
    $app.querySelectorAll('.seg[data-k]').forEach(seg => seg.querySelectorAll('button').forEach(b => {
      b.onclick = () => { ui[seg.dataset.k] = b.dataset.v; cb() }
    }))
  }
  function problems() {
    let list = PROBLEMS.filter(p => (ui.subj === 'all' || p.subject === ui.subj) && (ui.kind === 'all' || p.kind === ui.kind))
    list = list.map((p, i) => [p, i]).sort((a, b) => SORTS[ui.sort][1](a[0], b[0]) || a[1] - b[1]).map(x => x[0])
    $app.innerHTML = `<h1>문제</h1>
      <div class="row">${subjSeg('subj')}</div>
      <div class="row" style="margin:12px 0 18px">
        <div class="seg" data-k="kind">${[['real', '실전'], ['easy', '기초'], ['all', '모두']].map(([v, n]) => `<button data-v="${v}" class="${ui.kind === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <select id="sort">${Object.entries(SORTS).map(([k, [n]]) => `<option value="${k}" ${ui.sort === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
      </div>
      <div class="plist">${list.map(pItem).join('') || '<p class="muted">문제가 없어요.</p>'}</div>`
    bindSeg(problems)
    document.getElementById('sort').onchange = e => { ui.sort = e.target.value; problems() }
  }
  function pItem(p) {
    const s = Store.stat(p.id)
    const mark = !s.tries ? '' : s.last.correct ? '<span class="chip ok">맞힘</span>' : '<span class="chip bad">틀림</span>'
    return `<a class="pitem" href="#/p/${p.id}"><div class="txt">
      <div class="meta"><span class="chip ${p.kind === 'real' ? '' : 'gray'}">${p.kind === 'real' ? '실전' : '기초'}</span>
        <span class="chip gray">${subjName(p.subject)} · ${unitName(p.subject, p.unit)}</span>
        <span class="chip gray">난이도 ${'●'.repeat(p.level)}${'○'.repeat(5 - p.level)}</span>${mark}
        ${s.wrong ? `<span class="chip warn">${s.wrong}번 틀림</span>` : ''}</div>
      <div class="q">${strip(p.body)}</div></div><span class="pts">${p.points}점</span></a>`
  }

  // ───────── 문제 하나: 풀기 → 어디서 막혔나 → 기초·쉬운 문제 → 힌트 → 풀이 → 흔한 실수
  function problem(id, q) {
    const p = P(id); if (!p) return home()
    const st = live[id] = live[id] || { pick: null, graded: null, stuck: [], open: false, hint: false, sol: false }
    const from = q.get('from')
    $app.innerHTML = `
      ${from && C(from) ? `<a class="back" href="#/c/${from}">← ${C(from).name}(으)로 돌아가기</a>` : `<a class="back" href="#/problems">← 문제 목록</a>`}
      <div class="row" style="margin-bottom:10px"><span class="chip">${p.kind === 'real' ? '실전' : '기초'}</span>
        <span class="chip gray">${subjName(p.subject)} · ${unitName(p.subject, p.unit)}</span>
        <span class="chip gray">${p.slot}</span><span class="chip gray">${p.points}점</span></div>
      <div class="card"><div class="qbox">${p.body}</div>
        ${p.type === 'choice'
          ? `<div class="choices">${p.choices.map((c, i) => `<button data-i="${i + 1}" class="${st.pick === i + 1 ? 'on' : ''}">${circled(i + 1)} ${c}</button>`).join('')}</div>`
          : `<div class="ansrow"><input id="ans" inputmode="numeric" placeholder="답" value="${st.pick ?? ''}"></div>`}
        <div class="ansrow"><button class="btn main" id="grade">채점</button><button class="btn" id="stuckBtn">막혔어요</button></div>
        ${st.graded === null ? '' : st.graded
          ? '<div class="result ok">맞았어요! 풀이도 한 번 확인해 보세요.</div>'
          : '<div class="result bad">아쉬워요. 어디서 막혔는지 골라 볼까요?</div>'}
      </div>
      <div class="steps">${st.open || st.graded !== null ? stepsHtml(p, st) : ''}</div>
      <p class="small muted" style="margin-top:22px">이 문제가 이상하거나 비슷한 문제가 더 필요하면 → <a href="#/feedback?pid=${p.id}">피드백 남기기</a></p>`

    $app.querySelectorAll('.choices button').forEach(b => b.onclick = () => { st.pick = +b.dataset.i; problem(id, q) })
    const inp = document.getElementById('ans')
    if (inp) inp.oninput = () => { st.pick = inp.value.trim() }
    document.getElementById('grade').onclick = () => {
      if (st.pick === null || st.pick === '') return
      st.graded = Number(st.pick) === p.answer
      Store.record(p.id, st.graded, st.stuck)
      if (!st.graded) st.open = true
      problem(id, q)
    }
    document.getElementById('stuckBtn').onclick = () => { st.open = true; problem(id, q) }
    $app.querySelectorAll('.stuck button').forEach(b => b.onclick = () => {
      const k = b.dataset.c
      st.stuck = st.stuck.includes(k) ? st.stuck.filter(x => x !== k) : [...st.stuck, k]
      if (st.graded !== null) Store.setStuck(p.id, st.stuck)
      problem(id, q)
    })
    const h = document.getElementById('hintBtn'); if (h) h.onclick = () => { st.hint = true; problem(id, q) }
    const s = document.getElementById('solBtn'); if (s) s.onclick = () => { st.sol = true; problem(id, q) }
  }
  function stepsHtml(p, st) {
    const easy = (p.similar || []).map(P).filter(Boolean)
    const stuckC = st.stuck.map(k => [k, C(k)]).filter(x => x[1])
    return `
      <div class="step"><div class="head"><span class="num">1</span>어디서 막혔나요? (여러 개 골라도 돼요)</div>
        <div class="stuck">${p.concepts.map(k => `<button data-c="${k}" class="${st.stuck.includes(k) ? 'on' : ''}">${C(k).name}</button>`).join('')}</div></div>
      <div class="step"><div class="head"><span class="num">2</span>막힌 개념 기초 보기</div>
        <div class="body">${stuckC.length
          ? `<div class="links">${stuckC.map(([k, c]) => `<a href="#/c/${k}?from=${p.id}"><span>${c.name}</span><span>${c.video ? '영상 ▶' : '설명 →'}</span></a>`).join('')}</div>`
          : '<span class="muted small">위에서 막힌 개념을 고르면 여기에 나와요.</span>'}</div></div>
      ${easy.length ? `<div class="step"><div class="head"><span class="num">3</span>비슷한 쉬운 문제</div>
        <div class="links">${easy.map(e => `<a href="#/p/${e.id}"><span>${strip(e.body).slice(0, 60)}</span><span>${e.points}점 →</span></a>`).join('')}</div></div>` : ''}
      <div class="step"><div class="head"><span class="num">${easy.length ? 4 : 3}</span>원래 문제로 돌아와서</div>
        <div class="body">
          ${st.hint ? `<div><b>힌트</b> ${p.hint}</div>` : '<button class="btn" id="hintBtn">힌트 보기</button>'}
          ${st.hint ? (st.sol ? `<div style="margin-top:12px"><b>풀이</b><div class="qbox" style="font-size:19px">${p.solution}</div>
              ${p.video ? `<div class="vwrap"><video src="${p.video}" controls playsinline preload="metadata"></video></div>` : ''}
              ${p.mistakes.length ? `<div style="margin-top:12px"><b>흔한 실수</b>${p.mistakes.map(m => `<div class="mist">${m}</div>`).join('')}</div>` : ''}</div>`
            : '<div style="margin-top:12px"><button class="btn" id="solBtn">풀이 보기</button></div>') : ''}
        </div></div>`
  }

  // ───────── 개념 지도
  function concepts() {
    const subs = SUBJECTS.filter(s => ui.csubj === 'all' || s.id === ui.csubj)
    const weak = Store.weakConcepts()
    $app.innerHTML = `<h1>개념</h1><p class="muted">위에서 아래로 순서대로 보면 돼요. 각 개념에서 그 개념을 쓰는 실전 문제로 올라갈 수 있어요.</p>
      <div class="row" style="margin-bottom:12px">${subjSeg('csubj')}</div>
      ${subs.map(s => s.units.map(u => {
        const cs = Object.entries(CONCEPTS).filter(([, c]) => c.subject === s.id && c.unit === u.id).sort((a, b) => a[1].order - b[1].order)
        return `<div class="unit"><h2>${s.name} · ${u.name}</h2><div class="chain">${cs.map(([k]) => cNode(k, weak[k] ? `${weak[k]}번 막힘` : '')).join('')}</div></div>`
      }).join('')).join('')}`
    bindSeg(concepts)
  }
  function cNode(k, extra) {
    const c = C(k); const real = usedBy(k).filter(p => p.kind === 'real').length; const easy = usedBy(k).length - real
    return `<a class="cnode" href="#/c/${k}"><span class="ord">${c.order}</span><div class="txt"><b>${c.name}</b>
      <div class="small muted">${c.video ? '영상 있음 · ' : ''}${real ? `실전 ${real}문제` : `기초 ${easy}문제`}에 쓰여요</div></div>
      ${extra ? `<span class="chip bad">${extra}</span>` : ''}</a>`
  }
  function concept(id, q) {
    const c = C(id); if (!c) return concepts()
    const from = q.get('from')
    const easy = usedBy(id).filter(p => p.kind === 'easy')
    const real = usedBy(id).filter(p => p.kind === 'real')
    $app.innerHTML = `
      ${from && P(from) ? `<a class="back" href="#/p/${from}">← 원래 문제로 돌아가기</a>` : `<a class="back" href="#/concepts">← 개념 지도</a>`}
      <div class="row" style="margin-bottom:8px"><span class="chip gray">${subjName(c.subject)} · ${unitName(c.subject, c.unit)}</span></div>
      <h1>${c.name}</h1>
      <div class="card"><div class="qbox" style="font-size:19px">${c.summary}</div>
        ${c.video ? `<div class="vwrap"><video src="${c.video}" controls playsinline preload="metadata"></video></div>` : ''}</div>
      ${easy.length ? `<h2>먼저 쉬운 문제로</h2><div class="plist">${easy.map(p => pItem(p).replace(`#/p/${p.id}`, `#/p/${p.id}?from=${id}`)).join('')}</div>` : ''}
      ${real.length ? `<h2>이 개념을 쓰는 실전 문제</h2><div class="plist">${real.map(p => pItem(p).replace(`#/p/${p.id}`, `#/p/${p.id}?from=${id}`)).join('')}</div>` : ''}
      ${from && P(from) ? `<p style="margin-top:22px"><a class="btn main" href="#/p/${from}">원래 문제로 돌아가기</a></p>` : ''}`
  }

  // ───────── 오답노트
  const NSORTS = {
    due: ['복습할 날 순', (a, b) => a.n.due - b.n.due],
    wrong: ['많이 틀린 순', (a, b) => Store.stat(b.p.id).wrong - Store.stat(a.p.id).wrong],
    recent: ['최근 추가 순', (a, b) => b.n.added - a.n.added],
    subject: ['과목 순', (a, b) => SUBJECTS.findIndex(s => s.id === a.p.subject) - SUBJECTS.findIndex(s => s.id === b.p.subject)],
    points: ['배점 높은 순', (a, b) => b.p.points - a.p.points],
  }
  function notes() {
    const u = Store.user()
    const items = Object.entries(u.notes).map(([pid, n]) => ({ p: P(pid), n })).filter(x => x.p)
      .filter(x => ui.subj === 'all' || x.p.subject === ui.subj).sort(NSORTS[ui.noteSort][1])
    $app.innerHTML = `<h1>나만의 오답노트</h1>
      <p class="muted">틀린 문제가 자동으로 모여요. 다시 맞히면 복습 간격이 1일 → 3일 → 7일 → 14일 → 30일로 늘어나요.</p>
      <div class="row">${subjSeg('subj')}</div>
      <div class="row" style="margin:12px 0 18px"><select id="nsort">${Object.entries(NSORTS).map(([k, [n]]) => `<option value="${k}" ${ui.noteSort === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      ${items.length ? `<div class="plist">${items.map(({ p, n }) => {
        const s = Store.stat(p.id); const due = n.due <= Date.now()
        return `<div class="card">${pItem(p)}
          <div class="row small" style="margin-top:10px"><span class="chip ${due ? 'bad' : 'gray'}">${due ? '오늘 복습' : `${day(n.due)} 복습`}</span>
            <span class="muted">시도 ${s.tries}번 · 틀림 ${s.wrong}번</span>
            ${(s.last && s.last.stuck.length) ? `<span class="muted">막힌 곳: ${s.last.stuck.map(k => C(k).name).join(', ')}</span>` : ''}</div>
          <textarea data-memo="${p.id}" placeholder="내가 왜 틀렸는지 한 줄 메모">${esc(n.memo || '')}</textarea>
          <div class="row" style="margin-top:8px"><button class="btn ghost small" data-del="${p.id}">오답노트에서 빼기</button></div></div>`
      }).join('')}</div>` : '<p class="muted">아직 틀린 문제가 없어요.</p>'}`
    bindSeg(notes)
    document.getElementById('nsort').onchange = e => { ui.noteSort = e.target.value; notes() }
    $app.querySelectorAll('textarea[data-memo]').forEach(t => t.onchange = () => Store.setMemo(t.dataset.memo, t.value))
    $app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('오답노트에서 뺄까요?')) { Store.removeNote(b.dataset.del); notes() } })
  }

  // ───────── 피드백·출제 요청 (수능 공부 관련만)
  const FB_KINDS = [
    ['more', '이런 문제 더 내 주세요'],
    ['explain', '이 풀이가 이해 안 돼요'],
    ['concept', '이 개념 설명이 필요해요'],
    ['error', '문제·답에 오류가 있어요'],
  ]
  function feedback(_, q) {
    const pid = q.get('pid'); const p = pid && P(pid)
    const mine = Store.myFeedback().slice().reverse()
    $app.innerHTML = `<h1>피드백 · 출제 요청</h1>
      <p class="muted">수능 공부에 관한 것만 받아요. 남겨 주면 확인해서 새 문제나 설명을 만들어 올려요.</p>
      <div class="card">
        <label class="small muted">무엇이 필요해요?</label>
        <div class="seg" id="fk" style="margin:6px 0 14px">${FB_KINDS.map(([v, n], i) => `<button data-v="${v}" class="${i === 0 ? 'on' : ''}">${n}</button>`).join('')}</div>
        <div class="row" style="margin-bottom:12px">
          <label class="small muted">과목 <select id="fs">${SUBJECTS.map(s => `<option value="${s.id}" ${p && p.subject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label>
          ${p ? `<span class="chip gray">문제: ${strip(p.body).slice(0, 28)}…</span>` : ''}
        </div>
        <textarea id="ft" maxlength="300" placeholder="예: 곡선 밖의 점에서 접선 긋는 문제 3개 더 / 2번 풀이에서 b를 왜 구하는지 모르겠어요"></textarea>
        <div class="row" style="margin-top:10px"><button class="btn main" id="fb">보내기</button><span class="err" id="fe"></span></div>
      </div>
      <h2>내가 보낸 것</h2>
      ${mine.length ? `<div class="plist">${mine.map(f => `<div class="pitem"><div class="txt"><div class="meta">
        <span class="chip gray">${(FB_KINDS.find(k => k[0] === f.kind) || [, ''])[1]}</span><span class="chip gray">${subjName(f.subject)}</span>
        <span class="chip ${f.status === '반영' ? 'ok' : 'warn'}">${f.status}</span></div><div>${esc(f.text)}</div>${f.reply ? `<div class="small muted" style="margin-top:6px">↳ ${esc(f.reply)}</div>` : ''}</div>
        <span class="small muted">${day(f.ts)}</span></div>`).join('')}</div>` : '<p class="muted">아직 없어요.</p>'}`
    let kind = 'more'
    $app.querySelectorAll('#fk button').forEach(b => b.onclick = () => {
      kind = b.dataset.v; $app.querySelectorAll('#fk button').forEach(x => x.classList.toggle('on', x === b))
    })
    document.getElementById('fb').onclick = () => {
      const text = document.getElementById('ft').value.trim()
      if (text.length < 4) { document.getElementById('fe').textContent = '조금 더 자세히 써 주세요.'; return }
      Store.sendFeedback({ kind, subject: document.getElementById('fs').value, pid: pid || null, text })
      location.hash = '#/feedback'; render()
    }
  }

  document.getElementById('who').onclick = () => { if (Store.user()) Store.logout(); location.hash = '#/'; render() }
  window.addEventListener('hashchange', render)
  render()
})()
