// 개념 장면 다섯 번째 묶음: 고등 보강 개념
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
    items.forEach(([title, body, at], i) => {
      const x = 30 + (i % 3) * 250
      const y = 40 + Math.floor(i / 3) * 220
      a.box(x, y, 236, 200, { fill: c.paper2, stroke: a.t >= at ? c[color] : c.rule, width: 2, r: 14 })
      a.text(title, x + 118, y + 44, { size: 28, weight: 900, align: 'center', color: c[color], alpha: k(at, at + 0.4) })
      a.wrap(body, x + 18, y + 100, 200, { size: 19, weight: 700, alpha: k(at + 0.2, at + 0.6), lh: 30 })
    })
  }

  S['a-sincos'] = {
    len: 8,
    steps: [
      [0, 'sinθ + cosθ = 1/2: 양변을 제곱해요.'],
      [2.4, 'sin²θ + cos²θ = 1이라서 1 + 2sinθcosθ가 남아요.'],
      [5, 'sinθcosθ = −3/8'],
    ],
    draw: derive([
      [0, 'sinθ + cosθ = 1/2', ''],
      [1.2, '(sinθ + cosθ)² = 1/4', '양변 제곱'],
      [2.4, '1 + 2sinθcosθ = 1/4', 'sin² + cos² = 1'],
      [5, 'sinθcosθ = −3/8', ''],
    ]),
  }

  S['a-sine'] = {
    len: 9,
    steps: [
      [0, '삼각형은 언제나 원 하나에 딱 들어가요 (외접원).'],
      [2.6, '변 BC와 그 맞은편 각 A를 짝지어요.'],
      [5, '<b>a / sin A = 2R</b>: 6 / sin 30° = 12 = 2R → R = 6'],
    ],
    draw(a) {
      const { c, k } = a
      const cx = 240,
        cy = 250,
        R = 170
      a.ring(cx, cy, R, { color: c.ink, width: 2, p: k(0, 1) })
      const pt = (deg) => [cx + R * Math.cos((deg * Math.PI) / 180), cy - R * Math.sin((deg * Math.PI) / 180)]
      const A = pt(90),
        B = pt(210),
        C = pt(330)
      a.poly([A, B, C, A], { color: c.math, width: 3, p: k(0.8, 1.8) })
      a.line(B[0], B[1], C[0], C[1], { color: c.marker, width: 6, alpha: k(2.6, 3) })
      a.text('A', A[0] - 8, A[1] - 20, { size: 24, weight: 900 })
      a.text('B', B[0] - 26, B[1] + 6, { size: 24, weight: 900 })
      a.text('C', C[0] + 10, C[1] + 6, { size: 24, weight: 900 })
      a.text('a', (B[0] + C[0]) / 2, B[1] + 26, { ...M, size: 26, color: c.marker, alpha: k(2.6, 3) })
      a.line(cx, cy, cx + R, cy, { color: c.green, width: 3, dash: [6, 5], alpha: k(3.6, 4) })
      a.text('R', cx + R / 2, cy - 14, { ...M, size: 24, color: c.green, alpha: k(3.6, 4) })
      a.text('a / sin A = 2R', 470, 180, { ...M, size: 34, alpha: k(5, 5.5) })
      a.text('6 / (1/2) = 12 → R = 6', 470, 260, { ...M, size: 26, color: c.marker, alpha: k(6, 6.5) })
    },
  }

  S['m-closedmax'] = {
    len: 9,
    steps: [
      [0, '구간 [−2, 2]만 봐요. 그래프를 이 구간에서 잘라요.'],
      [2.4, '후보는 <b>극값</b>과 <b>양 끝값</b>이에요.'],
      [5.4, '후보를 모두 비교: 3, −1, −1, 3 → 최댓값 3, 최솟값 −1'],
    ],
    draw(a) {
      const { c, k } = a
      const f = (x) => x ** 3 - 3 * x + 1
      const ax = a.axes([40, 30, 460, 430], -2.6, 2.6, -3, 5)
      ax.draw({ p: k(0, 0.5) })
      ax.curve(f, { color: c.pencil, width: 2, p: k(0.3, 1.2) })
      ax.curve(f, { color: c.math, width: 4, from: -2, to: 2, p: k(1, 2) })
      const cand = [
        [-2, '끝'],
        [-1, '극대'],
        [1, '극소'],
        [2, '끝'],
      ]
      cand.forEach(([x, lab], i) => {
        a.dot(ax.sx(x), ax.sy(f(x)), { r: 9, color: lab === '끝' ? c.amber : c.marker, alpha: k(2.4 + i * 0.4, 2.8 + i * 0.4) })
        a.text(`${lab} ${f(x)}`, ax.sx(x) - 20, ax.sy(f(x)) + (f(x) > 1 ? -22 : 26), {
          size: 18,
          weight: 800,
          alpha: k(2.4 + i * 0.4, 2.8 + i * 0.4),
        })
      })
      a.text('최댓값 3', 560, 180, { size: 32, weight: 900, color: c.marker, alpha: k(5.4, 5.9) })
      a.text('최솟값 −1', 560, 250, { size: 32, weight: 900, color: c.amber, alpha: k(6, 6.5) })
    },
  }

  S['m-integral'] = {
    len: 8,
    steps: [
      [0, '먼저 부정적분: 3x² → x³, 2x → x²'],
      [2.8, '위끝 2를 넣은 값에서 아래끝 0을 넣은 값을 빼요.'],
      [5, '8 − 4 − 0 = 4'],
    ],
    draw: derive([
      [0, '∫₀² (3x² − 2x) dx', ''],
      [1.4, '= [x³ − x²]₀²', '지수 +1, 나누기'],
      [2.8, '= (8 − 4) − (0 − 0)', 'F(위) − F(아래)'],
      [5, '= 4', ''],
    ]),
  }

  S['p-samep'] = {
    len: 9,
    steps: [
      [0, 'A, A, B, B, C를 서로 다른 것처럼 세면 5! = 120가지'],
      [3, '그런데 A끼리, B끼리 자리를 바꿔도 <b>같은 배열</b>이에요.'],
      [5.6, '그만큼 나눠요: 120 ÷ (2! × 2!) = 30'],
    ],
    draw(a) {
      const { c, k, t } = a
      const letters = ['A', 'A', 'B', 'B', 'C']
      const swap = t > 3 && t < 5.4 ? Math.sin((t - 3) * Math.PI) : 0
      letters.forEach((L, i) => {
        let x = 120 + i * 110
        if (i === 0) x += 110 * Math.max(0, swap)
        if (i === 1) x -= 110 * Math.max(0, swap)
        const col = L === 'A' ? c.math : L === 'B' ? c.amber : c.green
        a.box(x, 140, 90, 90, { fill: col, alpha: 0.35 * k(0.2 + i * 0.2, 0.5 + i * 0.2), r: 14 })
        a.text(L, x + 45, 186, { size: 40, weight: 900, align: 'center', alpha: k(0.2 + i * 0.2, 0.5 + i * 0.2) })
      })
      a.text('= 같은 배열', 330, 280, { size: 26, font: a.HAND, color: c.marker, alpha: k(3.4, 3.8) })
      a.text('5! / (2! × 2!) = 120 / 4 = 30', 400, 400, { size: 32, weight: 900, align: 'center', font: a.MONO, alpha: k(5.6, 6.1) })
    },
  }

  S['p-reprep'] = {
    len: 8,
    steps: [
      [0, '1, 2, 3으로 네 자리 수: 자리마다 3가지씩 고를 수 있어요 (같은 숫자 다시 써도 돼요).'],
      [4, '3 × 3 × 3 × 3 = 3⁴ = <b>81</b>'],
    ],
    draw(a) {
      const { c, k } = a
      for (let i = 0; i < 4; i++) {
        const x = 90 + i * 160
        a.box(x, 120, 130, 130, { stroke: c.ink, width: 2, r: 16, alpha: k(0.2 + i * 0.3, 0.5 + i * 0.3) })
        ;['1', '2', '3'].forEach((d, j) =>
          a.text(d, x + 30 + j * 35, 185, { size: 30, weight: 900, color: c.math, alpha: k(0.6 + i * 0.4, 0.9 + i * 0.4) }),
        )
        a.text('3가지', x + 65, 290, { size: 22, weight: 800, align: 'center', color: c.marker, alpha: k(1 + i * 0.4, 1.3 + i * 0.4) })
      }
      a.text('3 × 3 × 3 × 3 = 81', 400, 400, { size: 36, weight: 900, align: 'center', font: a.MONO, alpha: k(4, 4.5) })
    },
  }

  S['b-remainder'] = {
    len: 7,
    steps: [
      [0, 'f(x)를 x − 1로 나누면 f(x) = (x − 1)Q(x) + R'],
      [2.4, 'x = 1을 넣으면 (x − 1)Q(x) 부분이 0이 돼서 <b>R = f(1)</b>'],
    ],
    draw: derive(
      [
        [0, 'f(x) = (x − 1) Q(x) + R', ''],
        [2.4, 'f(1) = 0 × Q(1) + R', 'x = 1 넣기'],
        [4, 'R = f(1) = 1 + 2 − 5 = −2', ''],
      ],
      { gap: 100 },
    ),
  }

  S['b-complex'] = {
    len: 7,
    steps: [
      [0, '(2 + i)(2 − i)는 (a + b)(a − b) = a² − b² 꼴이에요.'],
      [2.4, 'i² = −1이라서 4 − (−1) = 5. 켤레끼리 곱하면 실수가 돼요.'],
    ],
    draw: derive([
      [0, '(2 + i)(2 − i)', ''],
      [1.2, '= 2² − i²', '합차 공식'],
      [2.4, '= 4 − (−1)', 'i² = −1'],
      [3.8, '= 5', ''],
    ]),
  }

  S['b-dist'] = {
    len: 8,
    steps: [
      [0, '두 점 (1, 2), (4, 6)을 잇고, 가로·세로로 직각삼각형을 만들어요.'],
      [2.6, '가로 3, 세로 4 → 빗변 = √(3² + 4²) = <b>5</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([60, 30, 420, 430], 0, 6, 0, 7)
      ax.draw({ p: k(0, 0.5) })
      const P = [ax.sx(1), ax.sy(2)],
        Q = [ax.sx(4), ax.sy(6)],
        R = [ax.sx(4), ax.sy(2)]
      a.line(P[0], P[1], R[0], R[1], { color: c.amber, width: 4, alpha: k(1, 1.5) })
      a.line(R[0], R[1], Q[0], Q[1], { color: c.amber, width: 4, alpha: k(1.4, 1.9) })
      a.line(P[0], P[1], Q[0], Q[1], { color: c.marker, width: 5, alpha: k(2, 2.6) })
      a.dot(P[0], P[1], { r: 8 })
      a.dot(Q[0], Q[1], { r: 8 })
      a.text('3', (P[0] + R[0]) / 2, P[1] + 26, { size: 24, weight: 900, color: c.amber, align: 'center', alpha: k(1, 1.5) })
      a.text('4', R[0] + 14, (R[1] + Q[1]) / 2, { size: 24, weight: 900, color: c.amber, alpha: k(1.4, 1.9) })
      a.text('5', (P[0] + Q[0]) / 2 - 30, (P[1] + Q[1]) / 2 - 10, { size: 26, weight: 900, color: c.marker, alpha: k(2.6, 3) })
      a.text('√(3² + 4²) = 5', 520, 220, { ...M, size: 32, alpha: k(2.6, 3.1) })
    },
  }

  S['b-matrix'] = {
    len: 7,
    steps: [[0, '같은 꼴의 행렬끼리 <b>같은 자리 성분끼리</b> 더해요.']],
    draw(a) {
      const { c, k } = a
      const mat = (x, vals, col, at) => {
        a.text('(', x - 16, 170, { size: 120, weight: 200, alpha: k(at, at + 0.4) })
        a.text(')', x + 116, 170, { size: 120, weight: 200, alpha: k(at, at + 0.4) })
        vals.forEach((v, i) =>
          a.text(v, x + 20 + (i % 2) * 60, 135 + Math.floor(i / 2) * 70, { size: 34, weight: 900, color: col, alpha: k(at, at + 0.4) }),
        )
      }
      mat(60, [1, 2, 3, 4], c.math, 0.2)
      a.text('+', 230, 170, { size: 40, weight: 900 })
      mat(290, [0, 1, 1, 0], c.amber, 0.6)
      a.text('=', 460, 170, { size: 40, weight: 900, alpha: k(1.6, 2) })
      mat(520, [1, 3, 4, 4], c.marker, 2.4)
      a.text('같은 자리끼리: 1+0, 2+1, 3+1, 4+0', 400, 380, { size: 24, weight: 800, align: 'center', alpha: k(3.4, 3.9) })
    },
  }

  S['k-pos'] = {
    len: 8,
    steps: [
      [0, '‘새 옷’의 <b>새</b>는 모양이 절대 안 바뀌어요 → 관형사'],
      [3.4, '‘새롭다’는 새로운, 새로워서… 모양이 바뀌어요(활용) → 형용사'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('새', 120, 160, { size: 80, weight: 900, color: c.kor, alpha: k(0, 0.4) })
      a.text('옷', 230, 160, { size: 60, weight: 800, alpha: k(0, 0.4) })
      a.text('관형사: 안 변함', 120, 250, { size: 26, font: a.HAND, color: c.marker, alpha: k(1.2, 1.6) })
      const forms = ['새롭다', '새로운', '새로워서', '새롭고']
      forms.forEach((f, i) =>
        a.text(f, 460, 110 + i * 70, { size: 40, weight: 900, color: i ? c.sub : c.kor, alpha: k(3.4 + i * 0.4, 3.8 + i * 0.4) }),
      )
      a.text('형용사: 변함(활용)', 460, 420, { size: 26, font: a.HAND, color: c.marker, alpha: k(5.4, 5.8) })
    },
  }

  S['k-comp'] = {
    len: 7,
    steps: [
      [0, '‘되다, 아니다’ 앞에서 이/가가 붙어 꼭 필요한 말이 <b>보어</b>예요.'],
      [3, '물이 / <b>얼음이</b> / 되었다 → 주어 / 보어 / 서술어'],
    ],
    draw(a) {
      const { c, k } = a
      const parts = [
        ['물이', '주어', c.math],
        ['얼음이', '보어', c.marker],
        ['되었다', '서술어', c.green],
      ]
      let x = 120
      parts.forEach(([w, r, col], i) => {
        const o = { size: 46, weight: 900 }
        a.text(w, x, 180, { ...o, alpha: k(0.3 + i * 0.4, 0.7 + i * 0.4) })
        const wd = a.width(w, o)
        a.box(x - 10, 130, wd + 20, 100, { stroke: col, width: 3, r: 12, alpha: k(3 + i * 0.4, 3.4 + i * 0.4) })
        a.text(r, x + wd / 2, 280, { size: 26, weight: 800, align: 'center', color: col, alpha: k(3 + i * 0.4, 3.4 + i * 0.4) })
        x += wd + 70
      })
    },
  }

  S['e-vocab'] = {
    len: 8,
    steps: [
      [0, '잎이 쓴맛이 나면 곤충은 잎을 먹고 싶을까요?'],
      [3, '쓴맛은 곤충을 <b>쫓아내는</b> 쪽이에요. attracts(끌어들이다)는 반대 뜻 → repels'],
    ],
    draw(a) {
      const { c, k } = a
      const o = { size: 26, weight: 600 }
      a.text('chemicals make leaves taste bitter,', 60, 140, { ...o, alpha: k(0, 0.4) })
      a.text('which', 60, 200, { ...o, alpha: k(0.4, 0.8) })
      const w = a.width('which ', o)
      a.text('attracts', 60 + w, 200, { ...o, weight: 800, color: c.red, alpha: k(0.4, 0.8) })
      a.strike(60 + w, 200, a.width('attracts', { ...o, weight: 800 }), k(3, 3.6))
      a.text('repels', 60 + w, 250, { ...o, weight: 900, color: c.green, alpha: k(3.6, 4.1) })
      a.text('hungry insects.', 60 + w + a.width('attracts ', { ...o, weight: 800 }), 200, { ...o, alpha: k(0.4, 0.8) })
      a.text('쓴맛 → 쫓아냄', 60, 380, { size: 30, font: a.HAND, color: c.marker, alpha: k(4.4, 4.8) })
    },
  }

  S['s-energy'] = {
    len: 9,
    steps: [
      [0, '코일 안에서 자석을 돌려요 (운동 에너지).'],
      [3, '코일에 전류가 흘러요: <b>전자기 유도</b>'],
      [5.6, '발전기 = 운동 에너지 → 전기 에너지. (전동기는 반대: 전기 → 운동)'],
    ],
    draw(a) {
      const { c, k, t } = a
      const cx = 220,
        cy = 240
      for (let i = 0; i < 6; i++) a.ring(cx, cy, 120 + i * 6, { color: c.amber, width: 2 })
      const ang = t * 3
      a.line(cx - 80 * Math.cos(ang), cy - 80 * Math.sin(ang), cx, cy, { color: c.red, width: 18 })
      a.line(cx, cy, cx + 80 * Math.cos(ang), cy + 80 * Math.sin(ang), { color: c.math, width: 18 })
      a.text('N', cx + 70 * Math.cos(ang), cy + 70 * Math.sin(ang), { size: 18, weight: 900, align: 'center', color: '#fff' })
      a.line(cx + 160, cy, 560, cy, { color: c.ink, width: 3, alpha: k(3, 3.4) })
      const glow = a.t > 3 ? 0.4 + 0.3 * Math.sin(t * 6) : 0
      a.dot(600, cy, { r: 40, color: c.sci, alpha: glow })
      a.ring(600, cy, 40, { color: c.ink, width: 3, alpha: k(3, 3.4) })
      a.text('운동 → 전기', 480, 400, { size: 32, weight: 900, color: c.marker, alpha: k(5.6, 6) })
    },
  }

  S['s-cell'] = {
    len: 9,
    steps: [
      [0, '세포막 왼쪽은 산소가 많고(농도 높음), 오른쪽은 적어요.'],
      [2.4, '산소는 <b>저절로</b> 농도가 낮은 쪽으로 퍼져요 → 확산. 에너지가 필요 없어요.'],
    ],
    draw(a) {
      const { c, k, t } = a
      a.box(395, 40, 10, 420, { fill: c.sci, alpha: 0.6, r: 4 })
      a.text('세포막', 400, 30, { size: 18, weight: 800, align: 'center', color: c.sub })
      const p = Math.min(1, Math.max(0, (t - 2.4) / 5))
      for (let i = 0; i < 24; i++) {
        const sx = 60 + ((i * 53) % 300)
        const sy = 70 + ((i * 97) % 360)
        const move = i % 2 === 0 ? p : 0
        const x = sx + move * (420 - 0)
        a.dot(Math.min(x, 740), sy, { r: 9, color: c.math })
      }
      a.text('높음', 200, 470, { size: 22, weight: 800, align: 'center', color: c.sub })
      a.text('낮음', 600, 470, { size: 22, weight: 800, align: 'center', color: c.sub })
      a.arrow(250, 250, 550, 250, { color: c.marker, width: 4, p: k(2.4, 3.2) })
    },
  }

  S['c-external'] = {
    len: 9,
    steps: [
      [0, '양봉업자의 벌이 과수원 꽃가루를 옮겨 줘요.'],
      [3, '과수원은 수확이 늘었지만 <b>대가를 내지 않았어요</b>.'],
      [5.6, '대가 없이 남에게 이익 → <b>외부 경제</b> (반대면 외부 불경제)'],
    ],
    draw(a) {
      const { c, k, t } = a
      a.box(60, 180, 180, 140, { fill: c.amber, alpha: 0.3, r: 14 })
      a.text('양봉업자', 150, 250, { size: 24, weight: 900, align: 'center' })
      a.box(560, 180, 180, 140, { fill: c.green, alpha: 0.3, r: 14 })
      a.text('과수원', 650, 250, { size: 24, weight: 900, align: 'center' })
      const x = 260 + ((t * 120) % 280)
      a.dot(x, 200 + 20 * Math.sin(t * 6), { r: 10, color: c.amber, alpha: k(0.4, 0.8) })
      a.arrow(250, 360, 550, 360, { color: c.green, width: 3, p: k(3, 3.6) })
      a.text('이익 (수확 ↑)', 400, 390, { size: 22, weight: 800, align: 'center', color: c.green, alpha: k(3, 3.6) })
      a.arrow(550, 430, 250, 430, { color: c.red, width: 3, dash: [8, 6], p: k(3.8, 4.4) })
      a.text('대가 없음', 400, 460, { size: 22, weight: 800, align: 'center', color: c.red, alpha: k(3.8, 4.4) })
      a.text('외부 경제', 400, 90, { size: 40, weight: 900, align: 'center', color: c.soc, alpha: k(5.6, 6.1) })
    },
  }

  S['h-joseon'] = {
    len: 10,
    steps: [
      [0, '조선 왕별 대표 업적을 카드로 정리해요.'],
      [1, '<b>세종</b> 훈민정음 · <b>성종</b> 경국대전 완성 · <b>광해군</b> 대동법 시작'],
      [5, '<b>영조</b> 탕평비 · 균역법 · <b>정조</b> 규장각 · 수원 화성'],
    ],
    draw: cards(
      [
        ['세종', '훈민정음 창제', 1],
        ['성종', '경국대전 완성', 2],
        ['광해군', '대동법 (경기도에서 시작)', 3],
        ['영조', '탕평비 · 균역법', 5],
        ['정조', '규장각 · 수원 화성', 6],
      ],
      'his',
    ),
  }

  S['h-goryeo'] = {
    len: 9,
    steps: [
      [0, '고려 왕별 대표 업적'],
      [1, '<b>태조</b> 후삼국 통일 · <b>광종</b> 노비안검법, 과거제'],
      [4.4, '<b>성종</b> 시무 28조, 12목 · <b>공민왕</b> 반원 개혁, 쌍성총관부 수복'],
    ],
    draw: cards(
      [
        ['태조', '후삼국 통일 · 북진 정책', 1],
        ['광종', '노비안검법 · 과거제', 2],
        ['성종', '최승로 시무 28조 · 12목', 4.4],
        ['공민왕', '반원 개혁 · 쌍성총관부 수복', 5.6],
      ],
      'his',
    ),
  }
})()
