// 저장소. API_URL이 비어 있으면 이 기기(localStorage)에 저장해요.
// 나중에 구글 Apps Script 웹 앱 주소를 넣으면 구글 시트로 저장해요.
window.API_URL = 'https://script.google.com/macros/s/AKfycbzcbVthRsV2whu_pSTPyKyNbxAcTq9xEWhyjoceSHWE3MMThshtM8cRuIZ6bqBxt1Dc/exec'
;(function () {
  const KEY = 'study-v2'
  const REVIEW_DAYS = [1, 3, 7, 14, 30] // 맞힐 때마다 다음 칸으로

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { users: {}, current: null }
    } catch (e) {
      return { users: {}, current: null }
    }
  }
  function saveAll(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db))
    } catch (e) {
      /* 저장소를 못 쓰는 브라우저면 넘어감 */
    }
  }
  async function remote(action, payload) {
    if (!window.API_URL) return null
    // Apps Script는 text/plain으로 보내야 CORS 사전 요청이 안 생겨요.
    const res = await fetch(window.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    })
    return res.json()
  }

  const SHARED = 'd940b84044b93b8c8124eccb78aa8832c6c3d0b3858cafe590d15bb2e5a3bc96'
  async function sha(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  async function hashPw(name, pin) {
    const text = 'suneung-study:' + name.toLowerCase() + ':' + pin
    if (crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
    let h = 0
    for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0 // 아주 옛 브라우저용
    return ('x' + h).padEnd(32, '0')
  }

  let db = loadAll()

  window.Store = {
    user() {
      return db.current ? db.users[db.current] : null
    },

    async login(name, pin) {
      name = name.trim().slice(0, 20)
      if (!name || !/^\d{4}$/.test(pin)) return '이름과 숫자 4자리를 넣어 주세요.'
      // 비밀번호는 모두 같은 4자리 (삼촌이 알려 준 번호). 번호 자체는 코드에 두지 않고 해시만 비교해요
      if ((await sha('sarang-shared:' + pin)) !== SHARED) return '비밀번호가 달라요. 삼촌한테 물어보세요.'
      const pw = await hashPw(name, pin) // 비밀번호 원문은 어디에도 남기지 않아요
      if (window.API_URL) {
        let r
        try {
          r = await remote('login', { name, pw })
        } catch (e) {
          return '인터넷 연결을 확인해 주세요.'
        }
        if (!r || !r.ok) return (r && r.error) || '잠시 뒤에 다시 해 주세요.'
        db.users[name] = { name, pw, ...r.data } // 시트가 기준
      } else {
        const u = db.users[name]
        if (u && u.pw !== pw) return '비밀번호가 달라요.'
        if (!u) db.users[name] = { name, pw, attempts: [], notes: {}, feedback: [] }
      }
      db.current = name
      saveAll(db)
      return null
    },

    logout() {
      db.current = null
      saveAll(db)
    },

    // 한 번 푼 기록. stuck: 막혔다고 고른 개념들
    record(pid, correct, stuck) {
      const u = this.user()
      if (!u) return
      const a = { pid, correct, stuck: stuck || [], ts: Date.now() }
      u.attempts.push(a)
      const n = u.notes[pid] || { box: 0, memo: '', added: Date.now() }
      if (correct) n.box = Math.min(n.box + 1, REVIEW_DAYS.length - 1)
      else n.box = 0
      n.due = Date.now() + REVIEW_DAYS[n.box] * 864e5
      if (!correct || u.notes[pid]) u.notes[pid] = n // 틀린 적 있는 문제만 오답노트에
      saveAll(db)
      remote('record', { name: u.name, pw: u.pw, attempt: a, note: u.notes[pid] || null }).catch(() => {})
    },

    // 채점 뒤에 고른 '막힌 개념'을 마지막 기록에 붙여요
    setStuck(pid, stuck) {
      const u = this.user()
      if (!u) return
      const a = [...u.attempts].reverse().find((x) => x.pid === pid)
      if (!a) return
      a.stuck = stuck
      saveAll(db)
      remote('stuck', { name: u.name, pw: u.pw, pid, ts: a.ts, stuck }).catch(() => {})
    },

    setMemo(pid, memo) {
      const u = this.user()
      if (!u || !u.notes[pid]) return
      u.notes[pid].memo = memo
      saveAll(db)
      remote('memo', { name: u.name, pw: u.pw, pid, memo }).catch(() => {})
    },

    removeNote(pid) {
      const u = this.user()
      if (!u) return
      delete u.notes[pid]
      saveAll(db)
      remote('removeNote', { name: u.name, pw: u.pw, pid }).catch(() => {})
    },

    // 피드백·출제 요청. 수능 공부 관련만 받아요 (종류·과목을 고르게 해서 범위를 묶음)
    sendFeedback(fb) {
      const u = this.user()
      if (!u) return
      const item = { ...fb, name: u.name, ts: Date.now(), status: '접수' }
      u.feedback = u.feedback || []
      u.feedback.push(item)
      saveAll(db)
      remote('feedback', { name: u.name, pw: u.pw, feedback: item }).catch(() => {})
    },
    myFeedback() {
      const u = this.user()
      return (u && u.feedback) || []
    },

    // 문제별 통계
    stat(pid) {
      const u = this.user()
      const at = u ? u.attempts.filter((a) => a.pid === pid) : []
      const wrong = at.filter((a) => !a.correct).length
      return { tries: at.length, wrong, last: at[at.length - 1] || null }
    },

    // 개념별로 틀리거나 막힌 횟수
    weakConcepts() {
      const u = this.user()
      const c = {}
      if (!u) return c
      for (const a of u.attempts) {
        const p = window.PROBLEMS.find((q) => q.id === a.pid)
        if (!p) continue
        if (!a.correct) for (const k of p.concepts) c[k] = (c[k] || 0) + 1
        for (const k of a.stuck) c[k] = (c[k] || 0) + 1
      }
      return c
    },
  }
})()
