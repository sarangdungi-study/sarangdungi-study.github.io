// 개념 장면 여섯 번째 묶음 (2차 목표 첫 묶음 개념)
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  function derive(lines, o = {}) {
    return function (a) {
      const { c, k } = a
      const size = o.size || 34
      const gap = o.gap || 76
      lines.forEach(([at, tex, note], i) => {
        const y = 80 + i * gap
        const al = k(at, at + 0.5)
        if (i === lines.length - 1) a.hl(56, y + size * 0.35, a.width(tex, { ...M, size }) + 8, 12, k(at + 0.5, at + 1.1))
        a.text(tex, 60, y, { ...M, size, alpha: al })
        if (note) a.text(note, o.noteX || 540, y, { size: 22, font: a.HAND, color: c.marker, alpha: k(at + 0.3, at + 0.8) })
        if (i) a.arrow(36, y - gap + 16, 36, y - 16, { color: c.pencil, head: 7, alpha: al })
      })
    }
  }
  const cards = (items, color) => (a) => {
    const { c, k } = a
    const per = items.length > 4 ? 3 : 2
    const w = per === 3 ? 236 : 360
    items.forEach(([title, body, at], i) => {
      const x = 30 + (i % per) * (w + 14)
      const y = 40 + Math.floor(i / per) * 220
      a.box(x, y, w, 200, { fill: c.paper2, stroke: a.t >= at ? c[color] : c.rule, width: 2, r: 14 })
      a.text(title, x + w / 2, y + 44, { size: 26, weight: 900, align: 'center', color: c[color], alpha: k(at, at + 0.4) })
      a.wrap(body, x + 18, y + 100, w - 36, { size: 19, weight: 700, alpha: k(at + 0.2, at + 0.6), lh: 30 })
    })
  }
  const sentences = (rows) => (a) => {
    const { c, k } = a
    rows.forEach(([text, tag, col, at], i) => {
      const y = 70 + i * 82
      a.text(text, 50, y, { size: 26, weight: 800, alpha: k(at, at + 0.4) })
      a.text(tag, 750, y, { size: 22, weight: 900, align: 'right', color: c[col] || c.ink, alpha: k(at + 0.4, at + 0.8) })
    })
  }

  S['a-logineq'] = {
    len: 9,
    steps: [
      [0, '로그 부등식은 <b>진수 조건부터</b>: x − 1 &gt; 0'],
      [2.6, '밑 2 &gt; 1이니까 부등호 그대로: x − 1 &lt; 2³ = 8'],
      [5, '둘을 합치면 1 &lt; x &lt; 9 → 정수 2, 3, …, 8 (7개)'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('log₂(x − 1) < 3', 60, 70, { ...M, size: 34 })
      const sx = (v) => 60 + v * 70
      a.line(40, 260, 760, 260, { width: 2, alpha: k(0.4, 0.8) })
      for (let v = 0; v <= 10; v++) {
        a.line(sx(v), 252, sx(v), 268, { alpha: k(0.4, 0.8) })
        a.text(v, sx(v), 292, { size: 18, align: 'center', font: a.MONO, alpha: k(0.4, 0.8) })
      }
      a.line(sx(1), 200, 760, 200, { color: c.amber, width: 5, alpha: k(0.8, 1.4) })
      a.ring(sx(1), 200, 8, { color: c.amber, width: 3, alpha: k(0.8, 1.4) })
      a.text('진수 > 0: x > 1', sx(5), 180, { size: 20, weight: 800, color: c.amber, alpha: k(1, 1.4) })
      a.line(40, 230, sx(9), 230, { color: c.math, width: 5, alpha: k(2.6, 3.2) })
      a.ring(sx(9), 230, 8, { color: c.math, width: 3, alpha: k(2.6, 3.2) })
      for (let v = 2; v <= 8; v++) a.dot(sx(v), 260, { r: 8, color: c.green, alpha: k(5 + v * 0.1, 5.3 + v * 0.1) })
      a.text('정수 7개', 400, 380, { size: 34, weight: 900, align: 'center', alpha: k(6.4, 6.9) })
    },
  }

  S['a-trigraph'] = {
    len: 9,
    steps: [
      [0, 'y = sin x는 −1부터 1까지 출렁여요.'],
      [2.4, '3을 곱하면 −3 ~ 3, 1을 더하면 −2 ~ 4로 올라가요.'],
      [5.4, '2x가 들어가면 두 배 빨리 출렁여서 주기가 2π → π'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 40, 720, 400], 0, 2 * Math.PI, -3, 5)
      ax.draw({ p: k(0, 0.4) })
      ax.curve((x) => Math.sin(x), { color: c.pencil, width: 2, p: k(0.2, 1.4) })
      ax.curve((x) => 3 * Math.sin(2 * x) + 1, { color: c.math, width: 3, p: k(2.4, 4.4) })
      a.line(40, ax.sy(4), 760, ax.sy(4), { color: c.marker, dash: [6, 5], alpha: k(4.4, 4.8) })
      a.line(40, ax.sy(-2), 760, ax.sy(-2), { color: c.marker, dash: [6, 5], alpha: k(4.4, 4.8) })
      a.text('최댓값 4', 640, ax.sy(4) - 14, { size: 20, weight: 800, color: c.marker, alpha: k(4.4, 4.8) })
      a.text('최솟값 −2', 640, ax.sy(-2) + 22, { size: 20, weight: 800, color: c.marker, alpha: k(4.6, 5) })
      a.text('주기 π', ax.sx(Math.PI / 2), 60, { size: 22, weight: 800, align: 'center', color: c.math, alpha: k(5.4, 5.8) })
    },
  }

  S['a-trigval'] = {
    len: 9,
    steps: [
      [0, '7π/6은 π보다 조금 더 → <b>3사분면</b>, sin은 음수: −1/2'],
      [4, '5π/3은 2π보다 조금 덜 → <b>4사분면</b>, cos은 양수: 1/2'],
    ],
    draw(a) {
      const { c, k } = a
      const cx = 260,
        cy = 250,
        r = 170
      a.line(cx - 200, cy, cx + 200, cy, { color: c.sub })
      a.line(cx, cy - 200, cx, cy + 200, { color: c.sub })
      a.ring(cx, cy, r, { color: c.ink, width: 2, p: k(0, 0.8) })
      const pt = (ang, col, at, lab) => {
        const x = cx + r * Math.cos(ang),
          y = cy - r * Math.sin(ang)
        a.line(cx, cy, x, y, { color: col, width: 3, alpha: k(at, at + 0.4) })
        a.dot(x, y, { r: 8, color: col, alpha: k(at, at + 0.4) })
        a.text(lab, x + (Math.cos(ang) > 0 ? 12 : -90), y + 26, { size: 22, weight: 800, color: col, alpha: k(at, at + 0.4) })
      }
      pt((7 * Math.PI) / 6, c.marker, 0.8, '7π/6')
      pt((5 * Math.PI) / 3, c.math, 4, '5π/3')
      a.text('sin(7π/6) = −1/2', 480, 160, { size: 26, weight: 900, font: a.MONO, color: c.marker, alpha: k(1.8, 2.3) })
      a.text('cos(5π/3) = 1/2', 480, 240, { size: 26, weight: 900, font: a.MONO, color: c.math, alpha: k(5, 5.5) })
      a.text('합 = 0', 480, 330, { size: 32, weight: 900, alpha: k(6.4, 6.9) })
    },
  }

  S['m-liminf'] = {
    len: 8,
    steps: [
      [0, 'x가 아주 커지면 최고차항만 남아요.'],
      [2.6, '분자, 분모를 x²으로 나누면 3/x, 1/x²은 0으로 가요.'],
      [5, '남는 건 2/1 = 2 (최고차항 계수의 비)'],
    ],
    draw: derive(
      [
        [0, '(2x² + 3x) / (x² + 1)', ''],
        [2.6, '= (2 + 3/x) / (1 + 1/x²)', 'x²으로 나눔'],
        [5, '→ 2 / 1 = 2', ''],
      ],
      { gap: 100 },
    ),
  }

  S['m-cont'] = {
    len: 9,
    steps: [
      [0, 'x &lt; 1에서는 x² + a, x ≥ 1에서는 2x + 3'],
      [3, '연속이려면 경계 x = 1에서 두 그래프가 <b>끊기지 않고 만나야</b> 해요.'],
      [5.4, '1 + a = 5 → a = 4'],
    ],
    draw(a) {
      const { c, k, t } = a
      const aa = t < 3 ? 1 : 1 + 3 * Math.min(1, (t - 3) / 2)
      const ax = a.axes([40, 30, 440, 430], -2, 3, -1, 9)
      ax.draw({ p: k(0, 0.4) })
      ax.curve((x) => x * x + aa, { color: c.math, width: 3, from: -2, to: 1 })
      ax.curve((x) => 2 * x + 3, { color: c.amber, width: 3, from: 1, to: 3 })
      a.ring(ax.sx(1), ax.sy(1 + aa), 7, { color: c.math, width: 3 })
      a.dot(ax.sx(1), ax.sy(5), { r: 7, color: c.amber })
      a.text(`a = ${aa.toFixed(1)}`, 520, 160, { size: 32, weight: 900, font: a.MONO })
      a.text('1 + a = 2 + 3', 520, 240, { ...M, size: 30, alpha: k(5.4, 5.9) })
      a.text('→ a = 4', 520, 300, { size: 30, weight: 900, color: c.marker, alpha: k(6, 6.5) })
    },
  }

  S['m-intodd'] = {
    len: 9,
    steps: [
      [0, 'y = x³은 원점 대칭이라 −1~0과 0~1의 넓이가 <b>서로 지워져요</b>: 0'],
      [4.4, 'y = 3x²은 y축 대칭이라 0~1 넓이의 두 배: 2 × 1 = 2'],
    ],
    draw(a) {
      const { c, k } = a
      const area = (ax, f, x0, x1) => {
        const pts = [[ax.sx(x0), ax.sy(0)]]
        for (let i = 0; i <= 30; i++) {
          const x = x0 + ((x1 - x0) * i) / 30
          pts.push([ax.sx(x), ax.sy(f(x))])
        }
        pts.push([ax.sx(x1), ax.sy(0)])
        return pts
      }
      const ax = a.axes([30, 60, 350, 360], -1.4, 1.4, -1.5, 3.5)
      ax.draw({ p: k(0, 0.4) })
      a.fillPoly(
        area(ax, (x) => x ** 3, -1, 0),
        c.red,
        0.35 * k(0.6, 1.2),
      )
      a.fillPoly(
        area(ax, (x) => x ** 3, 0, 1),
        c.green,
        0.35 * k(1.2, 1.8),
      )
      ax.curve((x) => x ** 3, { color: c.ink, width: 3 })
      a.text('= 0', 200, 450, { size: 30, weight: 900, align: 'center', alpha: k(2.4, 2.8) })
      const bx = a.axes([420, 60, 350, 360], -1.4, 1.4, -1.5, 3.5)
      bx.draw({ p: k(4.4, 4.8) })
      a.fillPoly(
        area(bx, (x) => 3 * x * x, -1, 1),
        c.math,
        0.35 * k(4.8, 5.6),
      )
      bx.curve((x) => 3 * x * x, { color: c.ink, width: 3, p: k(4.4, 5) })
      a.text('= 2 × 1 = 2', 595, 450, { size: 30, weight: 900, align: 'center', alpha: k(6, 6.5) })
    },
  }

  S['p-addrule'] = {
    len: 8,
    steps: [
      [0, 'A와 B를 더하면 겹친 부분 A ∩ B를 <b>두 번</b> 센 거예요.'],
      [3.4, '그래서 한 번 빼요: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)'],
    ],
    draw(a) {
      const { c, k } = a
      const circ = (x, col, lab, at) => {
        const pts = []
        for (let i = 0; i <= 60; i++) pts.push([x + 140 * Math.cos((i / 60) * Math.PI * 2), 230 + 140 * Math.sin((i / 60) * Math.PI * 2)])
        a.fillPoly(pts, col, 0.3 * k(at, at + 0.5))
        a.poly(pts, { color: col, width: 3, alpha: k(at, at + 0.5) })
        a.text(lab, x + (x < 300 ? -60 : 60), 230, { size: 34, weight: 900, align: 'center', color: col, alpha: k(at, at + 0.5) })
      }
      circ(220, c.math, 'A', 0.2)
      circ(380, c.amber, 'B', 0.8)
      a.text('두 번!', 300, 120, { size: 26, font: a.HAND, color: c.red, align: 'center', alpha: k(1.8, 2.2) })
      a.text('0.5 + 0.4 − 0.7 = 0.2', 560, 420, { size: 26, weight: 900, font: a.MONO, align: 'center', alpha: k(4.6, 5.1) })
    },
  }

  S['p-indep'] = {
    len: 8,
    steps: [
      [0, '넓이로 그리면: 가로를 A(1/3), 세로를 B(1/4)로 나눠요.'],
      [3, '서로 영향을 안 주면(독립) 겹친 칸의 넓이는 그냥 곱: 1/3 × 1/4 = 1/12'],
    ],
    draw(a) {
      const { c, k } = a
      const X = 100,
        Y = 50,
        W = 360,
        H = 360
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 4; j++) {
          const hit = i === 0 && j === 0
          a.box(X + (W / 3) * i, Y + (H / 4) * j, W / 3, H / 4, {
            fill: hit ? c.marker : i === 0 ? c.math : j === 0 ? c.amber : c.paper2,
            alpha: hit ? 0.7 * k(3, 3.6) : i === 0 || j === 0 ? 0.25 : 1,
            r: 0,
          })
          a.box(X + (W / 3) * i, Y + (H / 4) * j, W / 3, H / 4, { stroke: c.ink, width: 1.5, r: 0 })
        }
      a.text('A = 1/3', X + W / 6, Y - 16, { size: 20, weight: 800, align: 'center', color: c.math })
      a.text('B = 1/4', X - 46, Y + H / 8, { size: 20, weight: 800, align: 'center', color: c.amber })
      a.text('1/3 × 1/4 = 1/12', 490, 230, { size: 26, weight: 900, font: a.MONO, alpha: k(3.4, 3.9) })
    },
  }

  S['p-expect'] = {
    len: 8,
    steps: [
      [0, '값마다 확률을 무게처럼 곱해요.'],
      [3, '1 × 1/2 + 2 × 1/3 + 3 × 1/6 = 5/3'],
    ],
    draw(a) {
      const { c, k } = a
      const data = [
        [1, 1 / 2, '1/2'],
        [2, 1 / 3, '1/3'],
        [3, 1 / 6, '1/6'],
      ]
      data.forEach(([v, p, lab], i) => {
        const x = 120 + i * 180
        const h = p * 520
        a.box(x, 400 - h * k(0.3 + i * 0.4, 0.8 + i * 0.4), 100, h * k(0.3 + i * 0.4, 0.8 + i * 0.4), { fill: c.math, alpha: 0.6, r: 6 })
        a.text(lab, x + 50, 380 - h, { size: 22, weight: 900, align: 'center', alpha: k(0.6 + i * 0.4, 1 + i * 0.4) })
        a.text(`X = ${v}`, x + 50, 430, { size: 20, weight: 800, align: 'center' })
      })
      const ex = 120 + ((5 / 3 - 1) / 2) * 360 + 50
      a.line(ex, 60, ex, 410, { color: c.marker, width: 3, dash: [8, 6], alpha: k(3, 3.6) })
      a.text('E(X) = 5/3', ex + 10, 70, { size: 26, weight: 900, color: c.marker, alpha: k(3, 3.6) })
    },
  }

  S['k-coord'] = {
    len: 9,
    steps: [
      [0, '<b>대등</b>: 앞뒤를 바꿔도 뜻이 같아요 (-고, -지만, -거나).'],
      [4, '<b>종속</b>: 앞이 뒤의 이유 · 조건 · 목적이에요 (-아서, -면, -려고).'],
    ],
    draw: sentences([
      ['산은 높고 물은 깊다.', '대등', 'green', 0.3],
      ['물은 깊고 산은 높다. (바꿔도 같음)', '', 'green', 1.6],
      ['비가 와서 길이 젖었다.', '종속 · 이유', 'marker', 4],
      ['봄이 오면 꽃이 핀다.', '종속 · 조건', 'marker', 4.8],
      ['책을 빌리려고 도서관에 갔다.', '종속 · 목적', 'marker', 5.6],
    ]),
  }

  S['k-fortis'] = {
    len: 8,
    steps: [
      [0, '받침 ㄱ · ㄷ · ㅂ 뒤에 오는 ㄱ · ㄷ · ㅂ · ㅅ · ㅈ은 된소리가 돼요.'],
      [3.4, '국밥 → [국빱], 덮개 → [덥깨]'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('국', 160, 170, { size: 90, weight: 900, alpha: k(0.2, 0.6) })
      a.text('밥', 280, 170, { size: 90, weight: 900, alpha: k(0.2, 0.6), color: k(3.4, 3.8) > 0.5 ? c.pencil : c.ink })
      a.arrow(400, 160, 470, 160, { color: c.sub, p: k(2.6, 3.2) })
      a.text('[국', 500, 170, { size: 80, weight: 900, color: c.kor, alpha: k(3.4, 3.8) })
      a.text('빱]', 640, 170, { size: 80, weight: 900, color: c.marker, alpha: k(3.4, 3.8) })
      a.text('ㄱ 받침 + ㅂ → ㅃ', 400, 330, { size: 30, weight: 800, align: 'center', font: a.MONO, alpha: k(4.6, 5) })
    },
  }

  S['k-word'] = {
    len: 8,
    steps: [
      [0, '<b>합성어</b>: 혼자 쓰이는 말 + 혼자 쓰이는 말 (손 + 발)'],
      [3.6, '<b>파생어</b>: 혼자 못 쓰이는 접사가 붙어요 (덧- + 신)'],
    ],
    draw(a) {
      const { c, k } = a
      const blk = (x, y, t, col, at) => {
        a.box(x, y, 130, 80, { fill: col, alpha: 0.3 * k(at, at + 0.4), r: 12 })
        a.text(t, x + 65, y + 42, { size: 34, weight: 900, align: 'center', alpha: k(at, at + 0.4) })
      }
      blk(80, 90, '손', c.math, 0.3)
      a.text('+', 240, 132, { size: 34, weight: 900 })
      blk(270, 90, '발', c.math, 0.7)
      a.text('= 손발 (합성어)', 440, 132, { size: 28, weight: 900, alpha: k(1.4, 1.8) })
      blk(80, 280, '덧-', c.marker, 3.6)
      a.text('+', 240, 322, { size: 34, weight: 900, alpha: k(3.6, 4) })
      blk(270, 280, '신', c.math, 4)
      a.text('= 덧신 (파생어)', 440, 322, { size: 28, weight: 900, alpha: k(4.6, 5) })
      a.text('접사', 145, 390, { size: 22, font: a.HAND, color: c.marker, alpha: k(5.4, 5.8) })
    },
  }

  S['k-rhetoric'] = {
    len: 11,
    steps: [
      [0, '<b>의인</b>: 사람이 아닌 것을 사람처럼'],
      [2.2, '<b>직유</b>: ~처럼, ~같이로 직접 비교'],
      [4.4, '<b>은유</b>: A는 B다로 바로 연결'],
      [6.6, '<b>역설</b>: 겉으로는 말이 안 되는데 그 속에 진실이 있어요.'],
    ],
    draw: sentences([
      ['바다가 웃는다.', '의인', 'kor', 0.3],
      ['구름처럼 흘러간다.', '직유', 'math', 2.2],
      ['내 마음은 호수요.', '은유', 'green', 4.4],
      ['찬란한 슬픔의 봄', '역설', 'marker', 6.6],
    ]),
  }

  S['e-topic'] = {
    len: 9,
    steps: [
      [0, '문장마다 하는 말을 한 줄로 줄여 봐요.'],
      [3.4, '전부를 덮는 말: 작게 시작해서 습관을 만든다'],
      [6, '한 문장에만 나오는 말(운동화)은 너무 좁아요.'],
    ],
    draw(a) {
      const { c, k } = a
      const lines = ['큰 결심은 → 금방 실패', '아주 작은 행동부터 (운동화 신기)', '익숙해지면 조금씩 늘림', '작은 시작이 오래가는 변화로']
      lines.forEach((l, i) => a.text(l, 60, 80 + i * 60, { size: 24, weight: 700, alpha: k(0.3 + i * 0.6, 0.7 + i * 0.6) }))
      a.box(40, 340, 720, 70, { stroke: c.eng, width: 3, r: 14, alpha: k(3.4, 3.9) })
      a.text('starting small to build lasting habits', 400, 376, {
        size: 26,
        weight: 900,
        align: 'center',
        color: c.eng,
        alpha: k(3.4, 3.9),
      })
      a.text('너무 좁음 ✗ running shoes', 60, 450, { size: 22, font: a.HAND, color: c.red, alpha: k(6, 6.4) })
    },
  }

  S['e-irrel'] = {
    len: 8,
    steps: [
      [0, '중심: 벌이 농작물의 꽃가루를 옮겨 준다 → 그런데 벌이 줄고 있다'],
      [3.6, '③ 꿀의 역사는 같은 “벌” 이야기지만 <b>흐름이 달라요</b>.'],
    ],
    draw(a) {
      const { c, k } = a
      const ls = ['① 꽃가루를 옮김', '② 없으면 수확 감소', '③ 꿀은 수천 년 감미료', '④ 그런데 벌이 감소', '⑤ 식량 가격 걱정']
      ls.forEach((l, i) => {
        const off = i === 2
        a.text(l, 80 + (off ? 60 * k(3.6, 4.4) : 0), 70 + i * 74, {
          size: 26,
          weight: 800,
          color: off && a.t > 3.6 ? c.red : c.ink,
          alpha: k(0.3 + i * 0.4, 0.7 + i * 0.4),
        })
        if (off) a.strike(80 + 60 * k(3.6, 4.4), 70 + i * 74, a.width(l, { size: 26, weight: 800 }), k(4.4, 5))
      })
      a.line(60, 50, 60, 390, { color: c.green, width: 4, alpha: k(2, 2.6) })
    },
  }

  S['e-verbform'] = {
    len: 8,
    steps: [
      [0, '<b>앞으로 할 일</b> 동사는 to부정사: plan, want, decide, hope'],
      [3.6, '<b>이미 하고 있는 일</b> 동사는 -ing: enjoy, finish, avoid, mind'],
    ],
    draw: cards(
      [
        ['to 부정사', 'plan to start · want to go · decide to stay · hope to win', 0.3],
        ['동명사 -ing', 'enjoy reading · finish writing · avoid eating · mind waiting', 3.6],
      ],
      'eng',
    ),
  }

  S['s-plate'] = {
    len: 10,
    steps: [
      [0, '<b>발산형</b>: 판이 서로 멀어지며 해령이 생겨요.'],
      [3.4, '<b>수렴형</b>: 판이 부딪쳐 한쪽이 들어가며 해구가 생겨요.'],
      [6.6, '<b>보존형</b>: 판이 옆으로 어긋나요 (변환 단층).'],
    ],
    draw(a) {
      const { c, k, t } = a
      const row = (y, kind, at) => {
        const m = Math.min(1, Math.max(0, (t - at) / 2)) * 30
        if (kind === 'div') {
          a.box(60 - m, y, 300, 50, { fill: c.sci, alpha: 0.6, r: 4 })
          a.box(420 + m, y, 300, 50, { fill: c.sci, alpha: 0.6, r: 4 })
          a.arrow(300 - m, y + 25, 220 - m, y + 25, { color: c.red, width: 3 })
          a.arrow(480 + m, y + 25, 560 + m, y + 25, { color: c.red, width: 3 })
        } else if (kind === 'conv') {
          a.box(60 + m, y, 330, 50, { fill: c.math, alpha: 0.5, r: 4 })
          a.box(390 - m, y, 330, 50, { fill: c.sci, alpha: 0.6, r: 4 })
          a.arrow(200, y + 25, 300 + m, y + 25, { color: c.red, width: 3 })
          a.arrow(600, y + 25, 500 - m, y + 25, { color: c.red, width: 3 })
        } else {
          a.box(60, y - m / 3, 330, 50, { fill: c.sci, alpha: 0.6, r: 4 })
          a.box(392, y + m / 3, 330, 50, { fill: c.sci, alpha: 0.6, r: 4 })
          a.arrow(220, y + 25 - m / 3, 160, y + 25 - m / 3, { color: c.red, width: 3 })
          a.arrow(560, y + 25 + m / 3, 620, y + 25 + m / 3, { color: c.red, width: 3 })
        }
      }
      row(60, 'div', 0.4)
      a.text('발산형 · 해령', 60, 40, { size: 20, weight: 900, align: 'left', alpha: k(0.4, 0.8) })
      row(200, 'conv', 3.4)
      a.text('수렴형 · 해구', 60, 180, { size: 20, weight: 900, align: 'left', alpha: k(3.4, 3.8) })
      row(340, 'tra', 6.6)
      a.text('보존형 · 변환 단층', 60, 320, { size: 20, weight: 900, align: 'left', alpha: k(6.6, 7) })
    },
  }

  S['s-photo'] = {
    len: 8,
    steps: [
      [0, '<b>엽록체</b>: 빛에너지로 이산화 탄소와 물에서 포도당을 만들어요 (광합성).'],
      [3.6, '<b>미토콘드리아</b>: 포도당을 분해해서 생명 활동 에너지를 얻어요 (세포 호흡).'],
    ],
    draw: cards(
      [
        ['엽록체', '광합성: 빛 + 이산화 탄소 + 물 → 포도당 + 산소', 0.3],
        ['미토콘드리아', '세포 호흡: 포도당 + 산소 → 에너지 + 이산화 탄소 + 물', 3.6],
      ],
      'sci',
    ),
  }

  S['s-redox'] = {
    len: 8,
    steps: [
      [0, '철(Fe)이 산소와 만나 녹(산화 철)이 돼요.'],
      [3, '산소를 <b>얻었으니 산화</b>. 그 산소는 환원돼요. 산화와 환원은 늘 같이 일어나요.'],
    ],
    draw(a) {
      const { c, k } = a
      a.dot(200, 220, { r: 60, color: c.pencil, alpha: k(0.2, 0.6) })
      a.text('Fe', 200, 222, { size: 32, weight: 900, align: 'center', color: '#fff', alpha: k(0.2, 0.6) })
      a.dot(360, 160, { r: 30, color: c.red, alpha: k(0.8, 1.2) })
      a.text('O', 360, 162, { size: 24, weight: 900, align: 'center', color: '#fff', alpha: k(0.8, 1.2) })
      a.arrow(440, 220, 520, 220, { color: c.sub, p: k(1.6, 2.2) })
      a.dot(620, 220, { r: 70, color: c.amber, alpha: 0.85 * k(2.2, 2.8) })
      a.text('녹', 620, 222, { size: 34, weight: 900, align: 'center', alpha: k(2.2, 2.8) })
      a.text('산소를 얻음 = 산화', 400, 400, { size: 32, weight: 900, align: 'center', color: c.marker, alpha: k(3, 3.5) })
    },
  }

  S['c-culture'] = {
    len: 9,
    steps: [
      [0, '<b>문화 상대주의</b>: 그 사회의 환경과 역사 속에서 이해해요.'],
      [3, '<b>자문화 중심주의</b>: 내 문화가 더 낫다고 봐요.'],
      [5.6, '<b>문화 사대주의</b>: 다른 문화가 더 낫다고 보고 내 문화를 낮춰요.'],
    ],
    draw: cards(
      [
        ['문화 상대주의', '그 사회의 맥락 속에서 이해', 0.3],
        ['자문화 중심주의', '내 문화가 우월하다', 3],
        ['문화 사대주의', '남의 문화가 우월하다', 5.6],
      ],
      'soc',
    ),
  }

  S['c-climate'] = {
    len: 14,
    steps: [
      [0, '기후는 <b>기온과 강수량</b>으로 나눠요. 위에서부터 차례로 물어보면 돼요.'],
      [2.5, '① 비가 증발량보다 적어요? → <b>건조</b> 기후 (사막 · 초원)'],
      [5, '② 가장 따뜻한 달(최난월)도 <b>10℃ 미만</b>? → <b>한대</b> 기후'],
      [7.5, '③ 가장 추운 달(최한월)이 <b>18℃ 이상</b>? → <b>열대</b> 기후'],
      [10, '④ 최한월이 <b>−3℃ 이상</b>이면 <b>온대</b>, −3℃ 미만이면 <b>냉대</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const rows = [
        ['강수량 < 증발량 ?', '건조', c.amber, 2.5],
        ['최난월 < 10℃ ?', '한대', c.math, 5],
        ['최한월 ≥ 18℃ ?', '열대', c.red, 7.5],
        ['최한월 ≥ −3℃ ?', '온대', c.green, 10],
      ]
      rows.forEach(([q, ans, col, t0], i) => {
        const y = 40 + i * 100
        const al = k(t0 - 0.3, t0 + 0.3)
        a.box(40, y, 330, 64, { fill: c.paper2, stroke: c.ink, width: 2, r: 12, alpha: al })
        a.text(q, 205, y + 32, { size: 24, weight: 800, align: 'center', alpha: al })
        a.arrow(372, y + 32, 470, y + 32, { color: col, width: 3, p: k(t0 + 0.3, t0 + 0.9) })
        a.text('예', 420, y + 14, { size: 16, weight: 800, align: 'center', color: col, alpha: k(t0 + 0.6, t0 + 0.9) })
        a.box(480, y + 4, 150, 56, { fill: col, alpha: 0.25 * k(t0 + 0.8, t0 + 1.2), r: 12 })
        a.text(ans, 555, y + 32, { size: 28, weight: 900, align: 'center', color: col, alpha: k(t0 + 0.8, t0 + 1.2) })
        if (i < 3) {
          a.arrow(205, y + 66, 205, y + 98, { color: c.sub, width: 2, head: 7, p: k(t0 + 1, t0 + 1.5) })
          a.text('아니요', 225, y + 82, { size: 14, weight: 800, color: c.sub, alpha: k(t0 + 1, t0 + 1.5) })
        }
      })
      a.arrow(205, 406, 205, 450, { color: c.sub, width: 2, head: 7, p: k(11, 11.5) })
      a.text('아니요', 225, 428, { size: 14, weight: 800, color: c.sub, alpha: k(11, 11.5) })
      a.box(130, 452, 150, 40, { fill: c.soc, alpha: 0.25 * k(11.3, 11.8), r: 10 })
      a.text('냉대', 205, 472, { size: 24, weight: 900, align: 'center', color: c.soc, alpha: k(11.3, 11.8) })
      // 오른쪽 온도계: 18℃ · 10℃ · −3℃ 기준선
      const ty = (v) => 440 - ((v + 20) / 50) * 380
      a.line(720, ty(30), 720, ty(-20), { color: c.ink, width: 6, alpha: k(0, 0.5) })
      ;[
        [18, '18℃', c.red],
        [10, '10℃', c.math],
        [-3, '−3℃', c.green],
      ].forEach(([v, lab, col], i) => {
        const al = k([7.5, 5, 10][i], [8, 5.5, 10.5][i])
        a.line(700, ty(v), 760, ty(v), { color: col, width: 3, alpha: al })
        a.text(lab, 690, ty(v), { size: 18, weight: 900, align: 'end', color: col, alpha: al })
      })
    },
  }

  S['h-three'] = {
    len: 9,
    steps: [
      [0, '삼국은 차례로 전성기를 맞아요: 4세기 백제 → 5세기 고구려 → 6세기 신라'],
      [3, '전성기를 맞은 나라가 <b>한강 유역</b>을 차지했어요.'],
    ],
    draw: cards(
      [
        ['백제 · 4세기', '근초고왕: 마한 정복, 영토 최대', 0.3],
        ['고구려 · 5세기', '광개토 대왕(4세기 말~) · 장수왕: 평양 천도, 남진', 1.6],
        ['신라 · 6세기', '진흥왕: 한강 차지, 순수비', 3],
      ],
      'his',
    ),
  }

  S['h-arm'] = {
    len: 8,
    steps: [
      [0, '1920년 6월 <b>봉오동 전투</b>: 홍범도의 대한 독립군 등이 일본군을 크게 이겼어요.'],
      [3.6, '1920년 10월 <b>청산리 대첩</b>: 김좌진의 북로 군정서, 홍범도 부대 등이 함께 싸워 이겼어요.'],
    ],
    draw: cards(
      [
        ['봉오동 전투', '1920.6 · 홍범도(대한 독립군) 등', 0.3],
        ['청산리 대첩', '1920.10 · 김좌진(북로 군정서), 홍범도 부대 등', 3.6],
      ],
      'his',
    ),
  }

  S['h-econ'] = {
    len: 9,
    steps: [
      [0, '1960년대 경공업 → 1970년대 중화학 공업, 새마을 운동 · 경부 고속 국도(1970)'],
      [4.4, '1990년대 금융 실명제(1993), 외환 위기(1997)'],
    ],
    draw(a) {
      const { c, k } = a
      const ev = [
        ['1960s', '경공업 수출', 0.3],
        ['1970', '새마을 운동 · 경부 고속 국도', 1.6],
        ['1970s', '중화학 공업', 2.8],
        ['1993', '금융 실명제', 4.4],
        ['1997', '외환 위기', 5.6],
      ]
      a.line(60, 240, 740, 240, { color: c.rule, width: 3 })
      ev.forEach(([y, n, at], i) => {
        const x = 100 + i * 150
        a.dot(x, 240, { r: 9, color: c.his, alpha: k(at, at + 0.4) })
        a.text(y, x, 200, { size: 22, weight: 900, font: a.MONO, align: 'center', color: c.his, alpha: k(at, at + 0.4) })
        a.wrap(n, x - 65, 290, 130, { size: 18, weight: 800, alpha: k(at + 0.2, at + 0.6), lh: 26 })
      })
    },
  }

  S['br-neg'] = {
    len: 9,
    steps: [
      [0, '수직선에서 0을 기준으로 오른쪽은 양수, 왼쪽은 음수예요.'],
      [3, '3에서 5만큼 내려가면 0을 지나 −2까지 가요.'],
      [6, '왼쪽으로 갈수록 작아요: −5 &lt; −2 &lt; 0 &lt; 2'],
    ],
    draw(a) {
      const { c, k, t } = a
      const sx = (v) => 400 + v * 60
      a.line(60, 250, 740, 250, { width: 3 })
      for (let v = -5; v <= 5; v++) {
        a.line(sx(v), 240, sx(v), 260, { width: 2 })
        a.text(v, sx(v), 290, { size: 22, weight: 800, align: 'center', font: a.MONO, color: v < 0 ? c.math : v > 0 ? c.red : c.ink })
      }
      a.text('음수 ←', 120, 200, { size: 24, weight: 900, color: c.math, alpha: k(0.6, 1) })
      a.text('→ 양수', 600, 200, { size: 24, weight: 900, color: c.red, alpha: k(0.6, 1) })
      const p = Math.min(1, Math.max(0, (t - 3) / 2))
      const v = 3 - 5 * p
      if (t > 3) {
        a.arrow(sx(3), 220, sx(v), 220, { color: c.marker, width: 4 })
        a.dot(sx(v), 250, { r: 12, color: c.marker })
        a.text(v.toFixed(1), sx(v), 330, { size: 28, weight: 900, align: 'center', color: c.marker })
      }
    },
  }

  S['br-x'] = {
    len: 8,
    steps: [
      [0, '□ + 3 = 7: 상자에 들어갈 수는 4'],
      [3, '상자에 <b>x</b>라는 이름표를 붙이면 x + 3 = 7. 똑같이 x = 4'],
    ],
    draw(a) {
      const { c, k } = a
      a.box(120, 90, 80, 80, { stroke: c.ink, width: 3, r: 10 })
      a.text('+ 3 = 7', 230, 132, { size: 44, weight: 900 })
      const p = k(3, 4)
      a.box(120, 260, 80, 80, { stroke: c.marker, width: 3, r: 10, alpha: 1 - p * 0.6 })
      a.text('x', 160, 302, {
        ...{ italic: true, font: '"Cambria Math", "Times New Roman", serif', weight: 400 },
        size: 56,
        align: 'center',
        color: c.marker,
        alpha: p,
      })
      a.text('+ 3 = 7', 230, 302, { size: 44, weight: 900, alpha: p })
      a.text('□ = 4', 560, 132, { size: 40, weight: 900, color: c.green, alpha: k(1.2, 1.6) })
      a.text('x = 4', 560, 302, { size: 40, weight: 900, color: c.green, alpha: k(4.6, 5) })
    },
  }

  S['br-dec'] = {
    len: 8,
    steps: [
      [0, '3/4을 100칸으로 나누면 75칸이에요.'],
      [3.4, '100칸 중 75칸 = 0.75'],
    ],
    draw(a) {
      const { c, k } = a
      for (let i = 0; i < 100; i++) {
        const x = 80 + (i % 10) * 32
        const y = 60 + Math.floor(i / 10) * 32
        a.box(x, y, 28, 28, { fill: i < 75 ? c.math : c.paper2, alpha: i < 75 ? 0.6 * k(0.4 + i * 0.03, 0.6 + i * 0.03) : 1, r: 3 })
      }
      a.text('3/4 = 75/100', 470, 180, { size: 34, weight: 900, alpha: k(3, 3.4) })
      a.text('= 0.75', 470, 250, { size: 44, weight: 900, color: c.marker, alpha: k(3.4, 3.9) })
    },
  }
})()
