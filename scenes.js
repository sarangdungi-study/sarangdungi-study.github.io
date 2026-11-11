// 개념 장면 모음. 키는 data.js의 개념 id와 같다. steps: [시각, 자막].
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  // ───── 수학
  S['m-power'] = {
    len: 9,
    steps: [
      [0, '다항함수는 항마다 따로 미분해요.'],
      [1.2, '지수가 앞으로 내려오고, 지수는 하나 줄어요. <b>(xⁿ)′ = n·xⁿ⁻¹</b>'],
      [4, '여러 항이면 하나씩 미분해서 더해요. 상수는 0이에요.'],
      [7, '<b>(x³ − 3x² + 2)′ = 3x² − 6x</b>'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('x', 150, 140, { ...M, size: 96 })
      a.text('3', 205, 92, { ...M, size: 48, color: k(1.2, 1.6) ? c.sub : c.ink })
      a.arrow(270, 140, 380, 140, { color: c.sub, p: k(0.6, 1.2), width: 3 })
      // 지수 3이 앞으로 내려와 계수가 된다
      const p = k(1.4, 2.6)
      a.text('3', 205 + (430 - 205) * p, 92 + (140 - 92) * p, { ...M, size: 48 + 48 * p, color: c.marker, alpha: p > 0 ? 1 : 0 })
      a.text('x', 485, 140, { ...M, size: 96, alpha: k(2.4, 2.9) })
      a.text('2', 540, 92, { ...M, size: 48, alpha: k(2.8, 3.3), color: c.marker })
      a.text('3 − 1', 560, 60, { size: 18, color: c.sub, alpha: k(3, 3.4), font: a.HAND })
      // 여러 항
      const terms = [
        ['x³', '3x²', 110],
        ['− 3x²', '− 6x', 280],
        ['+ 2', '+ 0', 470],
      ]
      terms.forEach(([f0, f1, x], i) => {
        const al = k(4 + i * 0.2, 4.6 + i * 0.2)
        a.text(f0, x, 300, { ...M, size: 46, alpha: al })
        const q = k(4.8 + i * 0.6, 5.4 + i * 0.6)
        a.arrow(x + 30, 330, x + 30, 380, { color: c.sub, p: q, alpha: q > 0 ? 1 : 0 })
        a.text(f1, x, 420, { ...M, size: 46, alpha: q, color: i === 2 ? c.pencil : c.ink })
        if (i === 2) a.strike(x, 420, a.width(f1, { ...M, size: 46 }), k(6.4, 6.9))
      })
      a.hl(100, 400, 330, 44, k(7, 7.8))
    },
  }

  S['m-tangent'] = {
    len: 9,
    steps: [
      [0, '곡선 y = x²/2 위의 점 (2, 2)에서 접선을 그어 봐요.'],
      [2.4, '접선의 <b>기울기는 그 점의 미분계수</b> f′(2) = 2예요.'],
      [4.6, '공식 <b>y = f′(a)(x − a) + f(a)</b>에 기울기와 점을 넣어요.'],
      [7, '<b>y = 2(x − 2) + 2 = 2x − 2</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([50, 40, 400, 420], -1, 4, -2, 6)
      ax.draw({ p: k(0, 0.6) })
      ax.curve((x) => (x * x) / 2, { color: c.ink, width: 3, p: k(0.3, 1.6), from: -1, to: 3.5 })
      if (a.t > 1.6) a.dot(ax.sx(2), ax.sy(2), { color: c.marker, r: 8 })
      a.text('(2, 2)', ax.sx(2) + 14, ax.sy(2) + 20, { size: 20, alpha: k(1.6, 2) })
      ax.curve((x) => 2 * x - 2, { color: c.marker, width: 3, p: k(2.4, 3.8), from: -0.3, to: 3.9 })
      const X = 480
      a.text('y = f′(a)(x − a) + f(a)', X, 110, { ...M, size: 26, alpha: k(4.6, 5) })
      a.hl(X + 32, 125, 64, 8, k(5.2, 5.6))
      a.text('기울기 f′(2) = 2', X, 175, { size: 22, color: c.marker, alpha: k(5.2, 5.6) })
      a.hl(X + 196, 125, 50, 8, k(5.8, 6.2))
      a.text('지나는 점 f(2) = 2', X, 220, { size: 22, color: c.sub, alpha: k(5.8, 6.2) })
      a.text('y = 2(x − 2) + 2', X, 300, { ...M, size: 30, alpha: k(7, 7.4) })
      a.text('= 2x − 2', X + 30, 350, { ...M, size: 30, alpha: k(7.6, 8) })
      a.hl(X + 20, 362, 140, 10, k(8, 8.6))
    },
  }

  S['m-roots'] = {
    len: 11,
    steps: [
      [0, 'f(x) = k의 실근 개수는 y = f(x)와 수평선 y = k가 만나는 점의 개수예요.'],
      [2, '수평선을 위에서 아래로 내려 보면 교점 수가 바뀌어요.'],
      [8.6, '<b>극솟값 &lt; k &lt; 극댓값</b>일 때만 세 점에서 만나요. 끝값에서는 두 점(중근)이에요.'],
    ],
    draw(a) {
      const { c, k, t } = a
      const f = (x) => x * x * x - 3 * x
      const ax = a.axes([40, 30, 440, 440], -2.6, 2.6, -4, 4)
      ax.draw({ p: k(0, 0.6) })
      if (t > 8.6) a.box(40, ax.sy(2), 440, ax.sy(-2) - ax.sy(2), { fill: c.hl, alpha: k(8.6, 9.2), r: 0 })
      ax.curve(f, { color: c.ink, width: 3, p: k(0.3, 1.8) })
      a.dot(ax.sx(-1), ax.sy(2), { color: c.math, alpha: k(1.6, 2) })
      a.dot(ax.sx(1), ax.sy(-2), { color: c.math, alpha: k(1.6, 2) })
      a.text('극댓값 2', ax.sx(-1) - 30, ax.sy(2) - 22, { size: 18, color: c.math, alpha: k(1.6, 2) })
      a.text('극솟값 −2', ax.sx(1) - 10, ax.sy(-2) + 24, { size: 18, color: c.math, alpha: k(1.6, 2) })
      const kk = t < 2 ? 3.5 : t < 8 ? 3.5 - (7 * (t - 2)) / 6 : -3.5
      if (t > 2) {
        a.line(40, ax.sy(kk), 480, ax.sy(kk), { color: c.marker, width: 3 })
        let n = 0
        let prev = f(-2.6) - kk
        for (let x = -2.6; x <= 2.6; x += 0.002) {
          const v = f(x) - kk
          if (v === 0 || Math.sign(v) !== Math.sign(prev)) {
            n++
            a.dot(ax.sx(x), ax.sy(kk), { color: c.red, r: 7 })
          }
          prev = v
        }
        if (Math.abs(Math.abs(kk) - 2) < 0.06) n = 2
        a.text(`k = ${kk.toFixed(1)}`, 530, 180, { size: 30, font: a.MONO, color: c.marker })
        a.text(`교점 ${n}개`, 530, 240, { size: 44, weight: 900, color: n === 3 ? c.green : c.ink })
      }
      a.text('−2 < k < 2 → 세 실근', 520, 360, { size: 26, weight: 800, alpha: k(8.8, 9.4) })
    },
  }

  S['m-dist'] = {
    len: 11,
    steps: [
      [0, '속도 v(t) = t² − 4t + 3 의 그래프예요. 1초와 3초에 부호가 바뀌어요.'],
      [1.6, '넓이를 구간마다 나눠요. 아래쪽 넓이는 뒤로 간 거리예요.'],
      [5.4, '그냥 ∫v dt 하면 앞뒤가 상쇄돼서 <b>위치의 변화 4/3</b>만 나와요.'],
      [7.6, '움직인 거리는 아래 넓이를 뒤집어서 모두 더해요. <b>∫|v| dt = 4</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const v = (x) => x * x - 4 * x + 3
      const ax = a.axes([40, 40, 440, 400], 0, 4.3, -1.6, 3.4)
      ax.draw({ p: k(0, 0.6) })
      const area = (x0, x1, flip) => {
        const pts = [[ax.sx(x0), ax.sy(0)]]
        for (let i = 0; i <= 40; i++) {
          const x = x0 + ((x1 - x0) * i) / 40
          pts.push([ax.sx(x), ax.sy(flip ? Math.abs(v(x)) : v(x))])
        }
        pts.push([ax.sx(x1), ax.sy(0)])
        return pts
      }
      a.fillPoly(area(0, 1), c.green, 0.28 * k(1.6, 2.4))
      const flip = k(7.6, 8.6)
      if (flip < 0.5) a.fillPoly(area(1, 3), c.red, 0.28 * k(2.4, 3.2) * (1 - flip * 2))
      else a.fillPoly(area(1, 3, true), c.green, 0.28 * (flip * 2 - 1))
      a.fillPoly(area(3, 4), c.green, 0.28 * k(3.2, 4))
      ax.curve(v, { color: c.ink, width: 3, p: k(0.3, 1.4), from: 0, to: 4.2 })
      a.text('+4/3', ax.sx(0.35), ax.sy(0.9), { size: 20, color: c.green, alpha: k(2, 2.4) })
      a.text(flip > 0.5 ? '+4/3' : '−4/3', ax.sx(1.75), flip > 0.5 ? ax.sy(0.5) : ax.sy(-0.5), {
        size: 20,
        color: flip > 0.5 ? c.green : c.red,
        alpha: k(2.8, 3.2),
      })
      a.text('+4/3', ax.sx(3.35), ax.sy(0.9), { size: 20, color: c.green, alpha: k(3.6, 4) })
      a.text('위치의 변화', 500, 150, { size: 22, color: c.sub, alpha: k(5.4, 5.8) })
      a.text('4/3 − 4/3 + 4/3 = 4/3', 500, 190, { size: 20, font: a.MONO, alpha: k(5.4, 5.8) })
      a.text('움직인 거리', 500, 290, { size: 22, color: c.sub, alpha: k(8.6, 9) })
      a.text('4/3 + 4/3 + 4/3 = 4', 500, 330, { size: 20, font: a.MONO, weight: 800, alpha: k(8.6, 9) })
      a.hl(496, 342, 240, 10, k(9.2, 9.8))
    },
  }

  S['m-intdef'] = {
    len: 9,
    steps: [
      [0, '∫ₐˣ f(t) dt = g(x) 꼴이 나오면 할 일은 두 가지예요.'],
      [2, '① x에 아래끝 a를 넣으면 왼쪽은 0이에요. 그래서 <b>g(a) = 0</b>'],
      [5, '② 양변을 x로 미분하면 <b>f(x) = g′(x)</b>'],
      [7.4, '미정계수는 ①로, f는 ②로 구해요.'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('∫', 210, 110, { ...M, size: 70, alpha: k(0, 0.5) })
      a.text('1', 250, 145, { ...M, size: 22, alpha: k(0, 0.5) })
      a.text('x', 248, 70, { ...M, size: 22, alpha: k(0, 0.5) })
      a.text('f(t) dt = x³ − ax² + 2x', 275, 110, { ...M, size: 34, alpha: k(0, 0.5) })
      a.box(60, 200, 320, 230, { stroke: c.rule, alpha: k(2, 2.4), r: 14 })
      a.text('① x = 1 넣기', 80, 235, { size: 24, weight: 800, color: c.marker, alpha: k(2, 2.4) })
      a.text('0 = 1 − a + 2', 80, 300, { ...M, size: 30, alpha: k(2.8, 3.2) })
      a.text('a = 3', 80, 360, { ...M, size: 34, alpha: k(3.8, 4.2) })
      a.hl(76, 372, 90, 10, k(4.2, 4.8))
      a.box(420, 200, 320, 230, { stroke: c.rule, alpha: k(5, 5.4), r: 14 })
      a.text('② 양변 미분', 440, 235, { size: 24, weight: 800, color: c.marker, alpha: k(5, 5.4) })
      a.text('f(x) = 3x² − 2ax + 2', 440, 300, { ...M, size: 28, alpha: k(5.8, 6.2) })
      a.text('= 3x² − 6x + 2', 470, 360, { ...M, size: 28, alpha: k(7.4, 7.8) })
      a.hl(466, 372, 200, 10, k(7.8, 8.4))
    },
  }

  S['a-exp'] = {
    len: 10,
    steps: [
      [0, '4ˣ는 (2ˣ)²이에요. 그래서 2ˣ를 한 글자로 바꿀 수 있어요.'],
      [2.2, '<b>2ˣ = t</b>로 두면 이차방정식이 돼요.'],
      [4.6, '인수분해해서 t를 구하고, <b>t &gt; 0</b>인지 확인해요.'],
      [7, '마지막에 t를 다시 2ˣ로 돌려놔요.'],
    ],
    draw(a) {
      const { c, k } = a
      const L1 = ['4ˣ', ' − 10·', '2ˣ', ' + 16 = 0']
      let x = 120
      L1.forEach((s, i) => {
        const w = a.width(s, { ...M, size: 40 })
        if (i === 0 || i === 2) a.hl(x - 2, 112, w + 4, 18, k(1, 1.6))
        a.text(s, x, 100, { ...M, size: 40, alpha: k(0, 0.4) })
        x += w
      })
      a.text('4ˣ = (2ˣ)²', 560, 100, { size: 24, font: a.HAND, color: c.marker, alpha: k(1, 1.6) })
      a.text('t² − 10t + 16 = 0', 120, 190, { ...M, size: 40, alpha: k(2.2, 2.8) })
      a.text('2ˣ = t', 560, 190, { size: 24, font: a.HAND, color: c.marker, alpha: k(2.2, 2.8) })
      a.text('(t − 2)(t − 8) = 0  →  t = 2, 8', 120, 280, { ...M, size: 36, alpha: k(4.6, 5.2) })
      a.ring(640, 280, 46, { p: k(5.6, 6.3) })
      a.text('t > 0 OK', 610, 282, { size: 22, font: a.HAND, color: c.red, alpha: k(5.8, 6.3) })
      a.text('2ˣ = 2 → x = 1,   2ˣ = 8 → x = 3', 120, 380, { ...M, size: 34, alpha: k(7, 7.6) })
      a.hl(116, 394, 480, 10, k(7.8, 8.6))
    },
  }

  S['a-trig'] = {
    len: 10,
    steps: [
      [0, 'sin²x를 1 − cos²x로 바꾸면 cos x 하나에 대한 방정식이 돼요.'],
      [3, '<b>cos x = 1/2</b> 또는 <b>cos x = 1</b>. 단위원에서 x좌표가 그 값인 점을 찾아요.'],
      [6.4, 'cos x = 1인 <b>x = 0</b>도 해예요. 0 ≤ x 범위라서 빠뜨리면 안 돼요.'],
    ],
    draw(a) {
      const { c, k } = a
      const cx = 220
      const cy = 260
      const r = 170
      a.line(cx - r - 20, cy, cx + r + 20, cy, { color: c.sub, alpha: k(0, 0.4) })
      a.line(cx, cy - r - 20, cx, cy + r + 20, { color: c.sub, alpha: k(0, 0.4) })
      a.ring(cx, cy, r, { color: c.ink, width: 2, p: k(0, 1) })
      const half = cx + r / 2
      a.line(half, cy - r - 10, half, cy + r + 10, { color: c.marker, width: 2, dash: [6, 6], alpha: k(3, 3.6) })
      a.text('x = 1/2', half + 6, cy + r + 4, { size: 18, color: c.marker, alpha: k(3, 3.6) })
      const pts = [
        [Math.PI / 3, 'π/3', 3.8],
        [(5 * Math.PI) / 3, '5π/3', 4.4],
        [0, '0', 6.4],
      ]
      pts.forEach(([ang, lab, at]) => {
        const px = cx + r * Math.cos(ang)
        const py = cy - r * Math.sin(ang)
        a.line(cx, cy, px, py, { color: c.red, width: 2, alpha: k(at, at + 0.4) })
        a.dot(px, py, { color: c.red, r: 8, alpha: k(at, at + 0.4) })
        a.text(lab, px + 14, py + (ang > Math.PI ? 18 : -14), { size: 22, color: c.red, weight: 800, alpha: k(at, at + 0.4) })
      })
      const X = 450
      a.text('2sin²x + 3cos x = 3', X, 90, { ...M, size: 28, alpha: k(0, 0.5) })
      a.text('2(1 − cos²x) + 3cos x = 3', X, 145, { ...M, size: 26, alpha: k(1, 1.5) })
      a.text('(2cos x − 1)(cos x − 1) = 0', X, 200, { ...M, size: 26, alpha: k(2, 2.5) })
      a.text('x = 0, π/3, 5π/3', X, 300, { ...M, size: 30, alpha: k(7, 7.5) })
      a.text('합 = 2π', X, 360, { size: 32, weight: 900, alpha: k(8, 8.5) })
      a.hl(X - 4, 372, 120, 10, k(8.5, 9))
    },
  }

  S['a-rec'] = {
    len: 11,
    steps: [
      [0, '규칙대로 앞에서부터 직접 써 봐요. 짝수면 ÷2, 홀수면 +5.'],
      [7, '6, 3, 8, 4, 2, 1이 <b>계속 반복</b>돼요. 반복 한 묶음의 합은 24.'],
      [9, '합은 <b>반복 전 항 + 묶음 × 개수</b>로 구해요. 처음 두 항은 반복이 아니에요.'],
    ],
    draw(a) {
      const { c, k } = a
      const vals = [7, 12, 6, 3, 8, 4, 2, 1, 6, 3, 8, 4, 2, 1]
      vals.forEach((v, i) => {
        const row = i < 7 ? 0 : 1
        const col = i % 7
        const x = 40 + col * 106
        const y = row ? 300 : 120
        const at = 0.4 + i * 0.45
        const al = k(at, at + 0.3)
        if (i >= 2 && a.t > 7) a.box(x - 4, y - 4, 82, 72, { fill: c.hl, alpha: k(7, 7.6), r: 12 })
        a.box(x, y, 74, 64, { stroke: c.ink, width: 2, alpha: al, r: 10 })
        a.text(v, x + 37, y + 33, { size: 28, weight: 800, align: 'center', font: a.MONO, alpha: al })
        a.text(`a${i + 1}`, x + 37, y + 86, { size: 15, color: c.pencil, align: 'center', alpha: al })
        if (col < 6 && i < vals.length - 1) {
          const nal = k(at + 0.3, at + 0.45)
          a.arrow(x + 76, y + 32, x + 104, y + 32, { color: c.sub, head: 7, alpha: nal })
          a.text(v % 2 ? '+5' : '÷2', x + 90, y - 14, {
            size: 18,
            weight: 800,
            font: a.MONO,
            align: 'center',
            color: v % 2 ? c.marker : c.math,
            alpha: nal,
          })
        }
      })
      a.text('7 + 12 + 24 × 3 = 91  (20항까지)', 40, 455, { size: 26, weight: 800, alpha: k(9, 9.5) })
    },
  }

  S['a-sigma'] = {
    len: 10,
    steps: [
      [0, '1/((2k+1)(2k+3))를 두 분수의 차로 쪼개요. 앞에 ½이 붙어요.'],
      [2.6, '늘어놓으면 <b>가운데 항이 서로 지워져요.</b>'],
      [6.6, '첫 항과 마지막 항만 남아요. <b>½(1/3 − 1/23) = 10/69</b>'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('1/((2k+1)(2k+3)) = ½ (1/(2k+1) − 1/(2k+3))', 40, 70, { ...M, size: 28, alpha: k(0, 0.6) })
      // [글자, 지워지는 시각]
      const toks = [
        ['(', 0],
        ['1/3', 0],
        ['−', 0],
        ['1/5', 3.4],
        [')', 0],
        ['+', 0],
        ['(', 0],
        ['1/5', 3.4],
        ['−', 0],
        ['1/7', 4.4],
        [')', 0],
        ['+', 0],
        ['(', 0],
        ['1/7', 4.4],
        ['−', 0],
        ['1/9', 5.4],
        [')', 0],
        ['+ ⋯ +', 0],
        ['(', 0],
        ['1/21', 5.4],
        ['−', 0],
        ['1/23', 0],
        [')', 0],
      ]
      const o = { ...M, size: 34 }
      let x = 40
      let y = 180
      toks.forEach(([s, kill], i) => {
        const w = a.width(s, o)
        if (x + w > 760) {
          x = 40
          y += 80
        }
        const at = 1.4 + i * 0.06
        const gone = kill && a.t > kill + 0.5
        a.text(s, x, y, { ...o, alpha: k(at, at + 0.4), color: gone ? c.pencil : c.ink })
        if (kill) a.strike(x, y, w, k(kill, kill + 0.5))
        if (i === 1 || i === 21) a.hl(x - 2, y + 12, w + 4, 12, k(6.6, 7.2))
        x += w + 10
      })
      a.text('½ × (1/3 − 1/23) = ½ × 20/69 = 10/69', 40, 400, { ...M, size: 32, alpha: k(7, 7.6) })
      a.hl(470, 414, 100, 10, k(8, 8.6))
    },
  }

  S['a-log'] = {
    len: 10,
    steps: [
      [0, 'y = log₂(x + 1)과 y = log₂(7 − x)의 그래프예요.'],
      [1, '점선은 <b>점근선</b>이에요. 그래프가 다가가기만 하고 닿지 않아요.'],
      [3.6, 'x절편은 <b>진수가 1</b>인 곳이에요. x = 0과 x = 6이에요. 점근선(x = −1, x = 7)이 아니에요.'],
      [6.4, '두 진수가 같은 x = 3에서 만나요. 삼각형 넓이는 ½ × 6 × 2 = 6.'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 30, 520, 440], -2, 8.5, -3, 4)
      ax.draw({ p: k(0, 0.6) })
      if (a.t > 7.2)
        a.fillPoly(
          [
            [ax.sx(0), ax.sy(0)],
            [ax.sx(6), ax.sy(0)],
            [ax.sx(3), ax.sy(2)],
          ],
          c.marker,
          0.25 * k(7.2, 7.8),
        )
      a.line(ax.sx(-1), 30, ax.sx(-1), 470, { color: c.pencil, dash: [6, 6], alpha: k(1, 1.5) })
      a.line(ax.sx(7), 30, ax.sx(7), 470, { color: c.pencil, dash: [6, 6], alpha: k(1, 1.5) })
      a.text('x = −1', ax.sx(-1) - 6, 44, { size: 16, color: c.pencil, align: 'right', alpha: k(1, 1.5) })
      a.text('x = 7', ax.sx(7) + 6, 44, { size: 16, color: c.pencil, alpha: k(1, 1.5) })
      ax.curve((x) => Math.log2(x + 1), { color: c.math, width: 3, p: k(1.6, 2.8), from: -0.995, to: 8.4 })
      ax.curve((x) => Math.log2(7 - x), { color: c.marker, width: 3, p: k(2, 3.2), from: -1.9, to: 6.995 })
      a.dot(ax.sx(0), ax.sy(0), { color: c.red, alpha: k(3.6, 4) })
      a.dot(ax.sx(6), ax.sy(0), { color: c.red, alpha: k(3.8, 4.2) })
      a.text('B(0, 0)', ax.sx(0) + 8, ax.sy(0) + 22, { size: 18, color: c.red, alpha: k(3.6, 4) })
      a.text('C(6, 0)', ax.sx(6) - 30, ax.sy(0) + 22, { size: 18, color: c.red, alpha: k(3.8, 4.2) })
      a.dot(ax.sx(3), ax.sy(2), { color: c.ink, r: 7, alpha: k(6.4, 6.8) })
      a.text('A(3, 2)', ax.sx(3) - 30, ax.sy(2) - 22, { size: 18, alpha: k(6.4, 6.8) })
      a.text('점근선 ≠ x절편', 590, 120, { size: 30, font: a.HAND, color: c.red, alpha: k(4.4, 5) })
      a.text('넓이 = 6', 600, 300, { size: 34, weight: 900, alpha: k(8, 8.5) })
    },
  }

  S['p-cond'] = {
    len: 11,
    steps: [
      [0, '넓이로 확률을 그려 봐요. 주사위로 A(1/3)와 B(2/3)를 먼저 나눠요.'],
      [2.2, '각 주머니에서 흰 공이 나올 부분을 칠해요. A는 2/5, B는 4/5.'],
      [4.8, '“흰 공일 때”라고 했으니 <b>흰 공 부분 전체가 분모</b>예요.'],
      [7, '그중 A에서 나온 부분이 분자예요. <b>(2/15) ÷ (10/15) = 1/5</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const X = 50
      const Y = 50
      const Wd = 380
      const Hd = 380
      const aw = Wd / 3
      a.box(X, Y, Wd, Hd, { stroke: c.ink, width: 2, r: 4, alpha: k(0, 0.4) })
      a.line(X + aw, Y, X + aw, Y + Hd, { color: c.ink, width: 2, alpha: k(0.6, 1) })
      a.text('A  1/3', X + aw / 2, Y + Hd + 26, { size: 20, align: 'center', alpha: k(0.6, 1) })
      a.text('B  2/3', X + aw + (Wd - aw) / 2, Y + Hd + 26, { size: 20, align: 'center', alpha: k(0.6, 1) })
      const ha = (Hd * 2) / 5
      const hb = (Hd * 4) / 5
      a.box(X + 2, Y + 2, aw - 4, ha * k(2.2, 3), { fill: c.math, alpha: 0.25, r: 2 })
      a.box(X + aw + 2, Y + 2, Wd - aw - 4, hb * k(2.6, 3.4), { fill: c.math, alpha: 0.25, r: 2 })
      a.text('흰 2/5', X + aw / 2, Y + 40, { size: 18, align: 'center', alpha: k(3, 3.4) })
      a.text('흰 4/5', X + aw + (Wd - aw) / 2, Y + 40, { size: 18, align: 'center', alpha: k(3.4, 3.8) })
      if (a.t > 4.8) {
        a.box(X, Y, aw, ha, { stroke: c.marker, width: 5, r: 2, alpha: k(4.8, 5.3) })
        a.box(X + aw, Y, Wd - aw, hb, { stroke: c.marker, width: 5, r: 2, alpha: k(4.8, 5.3) })
      }
      a.ring(X + aw / 2, Y + ha / 2, 60, { p: k(7, 7.6) })
      const R = 465
      a.text('A∩흰 = 1/3 × 2/5 = 2/15', R, 150, { size: 19, font: a.MONO, alpha: k(3.4, 3.8) })
      a.text('B∩흰 = 2/3 × 4/5 = 8/15', R, 195, { size: 19, font: a.MONO, alpha: k(3.8, 4.2) })
      a.text('흰 전체 = 10/15', R, 260, { size: 22, font: a.MONO, color: c.marker, alpha: k(5, 5.4) })
      a.text('P(A | 흰) = 2/15 ÷ 10/15', R, 340, { size: 19, font: a.MONO, alpha: k(7.4, 7.8) })
      a.text('= 1/5', R + 150, 390, { size: 34, weight: 900, alpha: k(8.2, 8.6) })
      a.hl(R + 146, 404, 100, 10, k(8.6, 9.2))
    },
  }

  S['p-hcomb'] = {
    len: 10,
    steps: [
      [0, 'x + y + z = 10의 해 하나는 <b>공 10개를 칸막이 2개로 나누는 방법</b> 하나예요.'],
      [5, '공 10개와 칸막이 2개, 모두 12자리 중 칸막이 자리 2개를 고르면 돼요. <b>₃H₁₀ = ₁₂C₂ = 66</b>'],
      [7.6, '조건이 있으면 먼저 처리해요. x ≥ 1이면 공 하나를 x에 미리 넣고 9개로 나눠요.'],
    ],
    draw(a) {
      const { c, k, t } = a
      const configs = [
        [3, 4, 3],
        [5, 0, 5],
        [1, 6, 3],
      ]
      const idx = Math.min(2, Math.floor(Math.max(0, t - 0.6) / 1.5))
      const cf = configs[idx]
      const fade = t < 5 ? Math.min(1, ((t - 0.6) % 1.5) / 0.3) : 1
      const items = []
      cf.forEach((n, j) => {
        for (let i = 0; i < n; i++) items.push(j)
        if (j < 2) items.push('|')
      })
      items.forEach((it, i) => {
        const x = 90 + i * 52
        if (it === '|') a.line(x, 150, x, 230, { color: c.marker, width: 6, alpha: fade })
        else a.dot(x, 190, { r: 16, color: [c.math, c.green, c.amber][it], alpha: fade })
      })
      a.text(`x = ${cf[0]},  y = ${cf[1]},  z = ${cf[2]}`, 90, 290, { size: 30, font: a.MONO, alpha: fade })
      a.text('12자리 중 칸막이 2개 → ₁₂C₂ = 66', 90, 370, { size: 30, weight: 800, alpha: k(5, 5.5) })
      a.text('x ≥ 1 → 공 1개 먼저, 나머지 9개 나누기', 90, 440, { size: 26, color: c.marker, alpha: k(7.6, 8.1) })
    },
  }

  S['p-normal'] = {
    len: 10,
    steps: [
      [0, 'N(50, 4²)에서 괄호 안 두 번째 수는 <b>분산</b>이에요. 표준편차 σ는 4.'],
      [2.4, '<b>Z = (X − 50)/4</b>로 바꾸면 46은 −1, 58은 2가 돼요.'],
      [5, '표는 0부터의 넓이예요. 0을 사이에 두면 <b>두 넓이를 더해요</b>.'],
      [7.4, '0.3413 + 0.4772 = <b>0.8185</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const pdf = (z) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)
      const ax = a.axes([40, 60, 720, 300], -3.5, 3.5, 0, 0.45)
      a.line(40, ax.sy(0), 760, ax.sy(0), { color: c.sub, alpha: k(0, 0.4) })
      const shade = (z0, z1, col, al) => {
        const pts = [[ax.sx(z0), ax.sy(0)]]
        for (let i = 0; i <= 40; i++) {
          const z = z0 + ((z1 - z0) * i) / 40
          pts.push([ax.sx(z), ax.sy(pdf(z))])
        }
        pts.push([ax.sx(z1), ax.sy(0)])
        a.fillPoly(pts, col, al)
      }
      shade(-1, 0, c.math, 0.3 * k(5, 5.6))
      shade(0, 2, c.marker, 0.3 * k(5.8, 6.4))
      ax.curve(pdf, { color: c.ink, width: 3, p: k(0.2, 1.6) })
      ;[-1, 0, 1, 2].forEach((z, i) => {
        a.line(ax.sx(z), ax.sy(0), ax.sx(z), ax.sy(0) + 8, { color: c.sub, alpha: k(2.4, 2.8) })
        a.text(String(z), ax.sx(z), ax.sy(0) + 26, { size: 20, align: 'center', font: a.MONO, color: c.math, alpha: k(2.4, 2.8) })
        a.text(String(46 + 4 * i), ax.sx(z), ax.sy(0) + 56, { size: 18, align: 'center', font: a.MONO, color: c.sub, alpha: k(2.4, 2.8) })
      })
      a.text('Z', 760, ax.sy(0) + 26, { size: 18, color: c.math, align: 'right', alpha: k(2.4, 2.8) })
      a.text('X', 760, ax.sy(0) + 56, { size: 18, color: c.sub, align: 'right', alpha: k(2.4, 2.8) })
      a.text('0.3413', ax.sx(-0.5), ax.sy(0.12), { size: 18, align: 'center', font: a.MONO, alpha: k(5.4, 5.8) })
      a.text('0.4772', ax.sx(0.9), ax.sy(0.12), { size: 18, align: 'center', font: a.MONO, alpha: k(6.2, 6.6) })
      a.text('σ = 4', 60, 40, { size: 26, font: a.HAND, color: c.red, alpha: k(0.6, 1.2) })
      a.text('= 0.8185', 560, 40, { size: 30, weight: 900, alpha: k(7.4, 7.9) })
    },
  }

  // ───── 국어
  S['k-type'] = {
    len: 13,
    steps: [
      [0, '<b>교체</b>: 한 소리가 다른 소리로 바뀌어요. 국물 → [궁물]'],
      [3.2, '<b>탈락</b>: 있던 소리 하나가 없어져요. 싫어 → [시러]'],
      [6.4, '<b>첨가</b>: 없던 소리가 생겨요. 솜이불 → [솜니불]'],
      [9.6, '<b>축약</b>: 두 소리가 하나로 합쳐져요. 좋고 → [조코]'],
    ],
    draw(a) {
      const { c, k } = a
      const cards = [
        ['교체', '국물', '[궁물]', 'ㄱ → ㅇ', 0],
        ['탈락', '싫어', '[시러]', 'ㅎ → (없음)', 3.2],
        ['첨가', '솜이불', '[솜니불]', '+ ㄴ', 6.4],
        ['축약', '좋고', '[조코]', 'ㅎ + ㄱ → ㅋ', 9.6],
      ]
      cards.forEach(([name, w0, w1, rule, at], i) => {
        const x = 30 + (i % 2) * 380
        const y = 30 + Math.floor(i / 2) * 230
        const on = a.t >= at && a.t < at + 3.2
        a.box(x, y, 360, 210, {
          fill: on ? c.hl : c.paper2,
          stroke: on ? c.ink : c.rule,
          width: on ? 2 : 1,
          r: 14,
          alpha: k(at, at + 0.4) * 0.6 + 0.4,
        })
        a.text(name, x + 24, y + 40, { size: 28, weight: 900 })
        a.text(w0, x + 24, y + 110, { size: 40, weight: 800, alpha: k(at + 0.3, at + 0.7) })
        a.arrow(
          x + 24 + a.width(w0, { size: 40, weight: 800 }) + 16,
          y + 110,
          x + 24 + a.width(w0, { size: 40, weight: 800 }) + 60,
          y + 110,
          { color: c.sub, p: k(at + 0.8, at + 1.2) },
        )
        a.text(w1, x + 24 + a.width(w0, { size: 40, weight: 800 }) + 76, y + 110, {
          size: 40,
          weight: 800,
          color: c.kor,
          alpha: k(at + 1.2, at + 1.6),
        })
        a.text(rule, x + 24, y + 170, { size: 26, font: a.MONO, color: c.marker, alpha: k(at + 1.8, at + 2.2) })
      })
    },
  }

  S['k-clause'] = {
    len: 13,
    steps: [
      [0, '문장 안에 들어 있는 작은 문장(안긴문장)은 다섯 가지예요.'],
      [0.4, '<b>관형절</b>: 뒤의 명사를 꾸며요. -(으)ㄴ, -는, -(으)ㄹ'],
      [2.9, '<b>명사절</b>: 명사처럼 쓰여요. -(으)ㅁ, -기'],
      [5.4, '<b>부사절</b>: 서술어를 꾸며요. -게, -도록, -이'],
      [7.9, '<b>서술절</b>: 주어 + 서술어가 통째로 서술어예요.'],
      [10.4, '<b>인용절</b>: 남의 말을 옮겨요. -라고, -고'],
    ],
    draw(a) {
      const { c, t } = a
      const data = [
        ['나는 ', '그가 돌아온', ' 사실을 몰랐다.', '관형절'],
        ['나는 ', '그가 범인임', '을 알았다.', '명사절'],
        ['그는 ', '발에 땀이 나도록', ' 뛰었다.', '부사절'],
        ['코끼리는 ', '코가 길다', '.', '서술절'],
        ['그는 ', '“곧 갈게.”라고', ' 말했다.', '인용절'],
      ]
      const i = Math.min(4, Math.max(0, Math.floor((t - 0.4) / 2.5)))
      const local = t - 0.4 - i * 2.5
      const al = Math.min(1, Math.max(0, local / 0.3))
      const [pre, cl, post, name] = data[i]
      const o = { size: 40, weight: 800 }
      const total = a.width(pre + cl + post, o)
      const x0 = 400 - total / 2
      const wPre = a.width(pre, o)
      const wCl = a.width(cl, o)
      a.hl(x0 + wPre - 4, 210, (wCl + 8) * Math.min(1, local / 0.8), 34)
      a.text(pre, x0, 200, { ...o, alpha: al })
      a.text(cl, x0 + wPre, 200, { ...o, alpha: al })
      a.text(post, x0 + wPre + wCl, 200, { ...o, alpha: al, color: c.sub })
      a.box(x0 + wPre - 10, 160, wCl + 20, 84, { stroke: c.marker, width: 3, r: 12, alpha: Math.min(1, Math.max(0, (local - 0.5) / 0.3)) })
      a.text(name, 400, 330, { size: 44, weight: 900, align: 'center', color: c.kor, alpha: Math.min(1, Math.max(0, (local - 0.8) / 0.3)) })
      data.forEach((d, j) => {
        a.text(d[3], 120 + j * 140, 440, { size: 22, weight: 800, align: 'center', color: j === i ? c.ink : c.pencil })
      })
    },
  }

  // ───── 영어
  S['e-mainverb'] = {
    len: 10,
    steps: [
      [0, '주어 뒤에 긴 수식어가 붙으면 진짜 동사가 어디 있는지 헷갈려요.'],
      [2, '수식어(분사구, 관계절)에 <b>괄호를 치고 접어요</b>.'],
      [4.6, '남은 뼈대: <b>Those (S) reported (V)</b>. 동사 자리에는 시제가 있는 동사가 와야 해요.'],
      [7, 'reporting처럼 -ing가 오면 문장에 동사가 없어져서 <b>틀린 문장</b>이에요.'],
    ],
    draw(a) {
      const { c, k } = a
      const o = { size: 21, weight: 600 }
      const parts = ['Those ', '(asked how fast the cars were going)', ' reported', ' higher speeds.']
      const fold = k(3.2, 4.4)
      const ws = parts.map((p) => a.width(p, o))
      const w1 = ws[1] * (1 - fold)
      let x = 400 - (ws[0] + w1 + ws[2] + ws[3]) / 2
      a.text(parts[0], x, 160, o)
      const x1 = x + ws[0]
      a.hl(x1, 170, ws[1] * (1 - fold), 16, k(2, 2.6))
      a.text(parts[1], x1, 160, { ...o, color: c.sub, alpha: 1 - fold })
      x = x1 + w1
      a.text(parts[2], x, 160, { ...o, weight: 800 })
      a.text(parts[3], x + ws[2], 160, o)
      a.text('S', 400 - (ws[0] + w1 + ws[2] + ws[3]) / 2 + ws[0] / 2 - 6, 210, { size: 24, weight: 900, color: c.eng, alpha: k(4.6, 5) })
      a.text('V', x + ws[2] / 2, 210, { size: 24, weight: 900, color: c.eng, alpha: k(4.8, 5.2) })
      a.text('Those (…) reporting higher speeds.', 400, 340, { size: 28, weight: 600, align: 'center', alpha: k(7, 7.4) })
      const xr =
        400 -
        a.width('Those (…) reporting higher speeds.', { size: 28, weight: 600 }) / 2 +
        a.width('Those (…) ', { size: 28, weight: 600 })
      a.strike(xr, 340, a.width('reporting', { size: 28, weight: 600 }), k(7.6, 8.1))
      a.text('동사가 없어요', 400, 400, { size: 28, font: a.HAND, color: c.red, align: 'center', alpha: k(8, 8.4) })
    },
  }

  S['e-order'] = {
    len: 11,
    steps: [
      [0, '주어진 글: 길을 넓히면 막힘이 사라질 거라고 기대한다.'],
      [2, '각 문단 첫머리의 <b>that, This improvement, As a result</b>가 무엇을 받는지 봐요.'],
      [5, '(B) that = 그 기대 → (C) This improvement = 빨라진 길 → (A) As a result = 그 결과'],
      [8.4, '<b>(B) − (C) − (A)</b>'],
    ],
    draw(a) {
      const { c, k } = a
      a.box(40, 30, 720, 70, { fill: c.paper2, r: 12 })
      a.wrap('When a crowded road is widened, most people expect traffic jams to disappear.', 60, 66, 680, { size: 20, weight: 600 })
      const cards = {
        A: ['As a result,', 'the extra space fills up, and congestion returns.'],
        B: ['At first, that', 'is exactly what happens. Cars move faster.'],
        C: ['This improvement,', 'however, does not go unnoticed. More people drive.'],
      }
      const start = { A: 0, B: 1, C: 2 }
      const end = { B: 0, C: 1, A: 2 }
      const m = k(5, 6.4)
      Object.entries(cards).forEach(([key, [head, rest]]) => {
        const x = 40 + (start[key] + (end[key] - start[key]) * m) * 245
        const y = 170
        a.box(x, y, 230, 200, { fill: c.paper, stroke: c.ink, width: 2, r: 12 })
        a.text(`(${key})`, x + 16, y + 30, { size: 22, weight: 900 })
        const hw = a.width(head, { size: 19, weight: 800 })
        a.hl(x + 14, y + 66, Math.min(hw, 200) + 4, 14, k(2, 2.8))
        a.text(head, x + 16, y + 62, { size: 19, weight: 800, color: c.marker })
        a.wrap(rest, x + 16, y + 96, 200, { size: 17, weight: 500, color: c.sub, lh: 26 })
      })
      const ax = [40 + 115, 40 + 245 + 115, 40 + 490 + 115]
      a.arrow(400, 102, ax[0], 168, { color: c.marker, width: 3, p: k(6.6, 7.2) })
      a.arrow(ax[0], 382, ax[1] - 10, 382, { color: c.marker, width: 3, p: k(7.2, 7.8) })
      a.arrow(ax[1], 382, ax[2] - 10, 382, { color: c.marker, width: 3, p: k(7.8, 8.4) })
      a.text('(B) − (C) − (A)', 400, 430, { size: 36, weight: 900, align: 'center', alpha: k(8.4, 8.8) })
    },
  }

  // ───── 통합과학
  S['s-neutral'] = {
    len: 11,
    steps: [
      [0, '묽은 염산에는 H⁺와 Cl⁻가 들어 있어요.'],
      [1.8, 'NaOH를 넣으면 OH⁻는 바로 H⁺와 만나 <b>물(H₂O)</b>이 돼요.'],
      [5.6, 'H⁺는 줄고, 넣어 준 Na⁺는 늘어요. <b>Cl⁻는 반응에 끼지 않아서 그대로</b>예요.'],
      [8.6, '완전히 중화되면 H⁺는 0, 남은 건 Na⁺와 Cl⁻ (소금물)'],
    ],
    draw(a) {
      const { c, k } = a
      const p = a.lin(1.8, 8.4)
      const na = Math.round(6 * p)
      const vals = [
        ['H⁺', 6 - na, c.red],
        ['Cl⁻', 6, c.green],
        ['Na⁺', na, c.math],
        ['OH⁻', 0, c.amber],
        ['H₂O', na, c.sub],
      ]
      a.text('넣은 NaOH', 60, 60, { size: 22, color: c.sub })
      a.box(200, 46, 300, 26, { stroke: c.rule, r: 13 })
      a.box(200, 46, 300 * p, 26, { fill: c.math, alpha: 0.4, r: 13 })
      vals.forEach(([name, n, col], i) => {
        const y = 130 + i * 66
        a.text(name, 60, y + 18, { size: 26, weight: 800, color: col })
        for (let j = 0; j < 6; j++) a.box(160 + j * 56, y, 46, 38, { stroke: c.rule, r: 8 })
        for (let j = 0; j < n; j++) a.box(160 + j * 56, y, 46, 38, { fill: col, alpha: 0.55, r: 8 })
        a.text(n, 520, y + 18, { size: 26, font: a.MONO, weight: 800 })
        if (name === 'Cl⁻') a.ring(527, y + 18, 24, { color: c.green, p: k(5.6, 6.2) })
      })
      a.text('일정!', 570, 214, { size: 28, font: a.HAND, color: c.green, alpha: k(6, 6.4) })
    },
  }

  S['s-fall'] = {
    len: 9,
    steps: [
      [0, '20 m 높이에서 공을 가만히 놓아요. 같은 시간 간격으로 위치를 찍어 볼게요.'],
      [2, '아래로 갈수록 간격이 넓어져요. 속력이 <b>v = gt</b>로 계속 커지기 때문이에요.'],
      [6.4, '<b>20 = ½ × 10 × t²</b> → t = 2초, v = 10 × 2 = <b>20 m/s</b>'],
    ],
    draw(a) {
      const { c, t } = a
      const top = 50
      const ppm = 19
      a.line(120, top, 120, top + 20 * ppm, { color: c.ink, width: 2 })
      for (let m = 0; m <= 20; m += 5) {
        a.line(112, top + m * ppm, 128, top + m * ppm, { color: c.sub })
        a.text(`${20 - m} m`, 100, top + m * ppm, { size: 16, align: 'right', color: c.sub })
      }
      a.line(80, top + 20 * ppm, 400, top + 20 * ppm, { color: c.ink, width: 3 })
      const sim = Math.min(2, Math.max(0, ((t - 1) / 4.6) * 2))
      for (let s = 0; s <= sim + 1e-6; s += 0.4) {
        const h = 5 * s * s
        a.dot(240, top + h * ppm, { r: 10, color: c.pencil, alpha: 0.5 })
        a.text(`${s.toFixed(1)}s`, 262, top + h * ppm, { size: 15, color: c.pencil })
      }
      const h = 5 * sim * sim
      a.dot(240, top + h * ppm, { r: 14, color: c.marker })
      a.text(`t = ${sim.toFixed(2)} s`, 470, 130, { size: 28, font: a.MONO })
      a.text(`떨어진 거리 = ${h.toFixed(1)} m`, 470, 190, { size: 24, font: a.MONO, color: c.sub })
      a.text(`속력 v = ${(10 * sim).toFixed(1)} m/s`, 470, 250, { size: 28, font: a.MONO, weight: 800, color: c.marker })
      a.text('v = √(2gh) = √400 = 20', 450, 360, { size: 21, font: a.MONO, alpha: a.k(7, 7.5) })
    },
  }

  // ───── 통합사회
  S['c-asset'] = {
    len: 10,
    steps: [
      [0, '자산은 세 가지 기준으로 비교해요. 칸이 많을수록 높아요 (일반적인 경향).'],
      [2.6, '<b>안전성</b>: 원금을 잃지 않을 정도. 예금이 가장 높아요.'],
      [4.6, '<b>수익성</b>: 기대 수익. 주식이 가장 높아요.'],
      [6.6, '<b>유동성</b>: 바로 현금으로 바꾸기 쉬운 정도. 부동산이 가장 낮아요.'],
    ],
    draw(a) {
      const { c, k } = a
      const rows = [
        ['예금', [3, 1, 3]],
        ['채권', [2, 2, 2]],
        ['주식', [1, 3, 2]],
        ['부동산', [2, 2, 1]],
      ]
      const cols = ['안전성', '수익성', '유동성']
      cols.forEach((n, j) => a.text(n, 260 + j * 170, 70, { size: 24, weight: 800, align: 'center', color: c.soc }))
      rows.forEach(([name, lv], i) => {
        const y = 140 + i * 80
        a.text(name, 60, y, { size: 26, weight: 800 })
        lv.forEach((n, j) => {
          const at = 2.6 + j * 2
          for (let q = 0; q < 3; q++) {
            const x = 215 + j * 170 + q * 32
            a.box(x, y - 14, 26, 28, { stroke: c.rule, r: 6 })
            if (q < n) a.box(x, y - 14, 26, 28, { fill: c.soc, alpha: 0.7 * k(at + i * 0.15, at + i * 0.15 + 0.4), r: 6 })
          }
        })
      })
      a.ring(260 + 170, 140 + 2 * 80, 56, { p: k(5.4, 6) })
      a.ring(260 + 340, 140 + 3 * 80, 56, { p: k(7.4, 8) })
    },
  }

  S['c-justice'] = {
    len: 10,
    steps: [
      [0, '분배의 정의를 다르게 본 세 입장이에요.'],
      [1.6, '<b>롤스</b>: 가장 불리한 사람에게 이익이 되면 불평등도 허용 (차등의 원칙)'],
      [4.2, '<b>노직</b>: 정당하게 얻은 것은 국가도 가져갈 수 없어요.'],
      [6.6, '<b>공리주의</b>: 사회 전체 행복의 합이 가장 큰 분배'],
    ],
    draw(a) {
      const { c, k } = a
      const cards = [
        ['롤스', '최소 수혜자', '무지의 베일', 1.6],
        ['노직', '소유 권리', '최소 국가', 4.2],
        ['공리주의', '최대 다수', '행복의 합', 6.6],
      ]
      cards.forEach(([n, k1, k2, at], i) => {
        const x = 40 + i * 250
        const on = a.t >= at
        a.box(x, 80, 230, 300, { fill: on ? c.paper2 : c.paper, stroke: on ? c.ink : c.rule, width: 2, r: 16 })
        a.text(n, x + 115, 130, { size: 32, weight: 900, align: 'center', color: on ? c.soc : c.pencil })
        a.hl(x + 30, 214, 170 * k(at + 0.3, at + 0.8), 18)
        a.text(k1, x + 115, 210, { size: 26, weight: 800, align: 'center', alpha: k(at, at + 0.4) })
        a.text(k2, x + 115, 270, { size: 22, align: 'center', color: c.sub, alpha: k(at + 0.4, at + 0.8) })
      })
      a.text('“최소 수혜자” → 롤스', 400, 440, { size: 30, font: a.HAND, color: c.red, align: 'center', alpha: k(8.6, 9) })
    },
  }

  // ───── 한국사
  S['h-open'] = {
    len: 11,
    steps: [
      [0, '개항기 사건을 연도순으로 세워요.'],
      [2.2, '<b>임오군란(1882) → 갑신정변(1884)</b>: 2년 차이라 자주 바꿔 외워요. 군인이 먼저, 개화파가 나중.'],
      [5.2, '1894년에 동학 농민 운동과 갑오개혁이 같이 일어나요.'],
      [7.4, '을미사변(1895) → 아관 파천·독립 협회(1896) → 대한 제국(1897)'],
    ],
    draw(a) {
      const { c, k } = a
      const ev = [
        [1876, '강화도 조약'],
        [1882, '임오군란'],
        [1884, '갑신정변'],
        [1894, '동학 농민 운동 · 갑오개혁'],
        [1895, '을미사변'],
        [1896, '아관 파천 · 독립 협회'],
        [1897, '대한 제국'],
      ]
      a.line(170, 40, 170, 470, { color: c.rule, width: 3 })
      ev.forEach(([y, n], i) => {
        const yy = 60 + i * 66
        const at = 0.3 + i * 1.1
        const hot = i === 1 || i === 2
        if (hot) a.hl(190, yy + 6, a.width(n, { size: 26, weight: 800 }) + 8, 18, k(2.2, 2.8))
        a.text(y, 60, yy, { size: 24, font: a.MONO, weight: 800, color: c.his, alpha: k(at, at + 0.4) })
        a.dot(170, yy, { r: 8, color: c.his, alpha: k(at, at + 0.4) })
        a.text(n, 194, yy, { size: 26, weight: 800, alpha: k(at, at + 0.4) })
      })
      a.text('2년 차!', 560, 160, { size: 34, font: a.HAND, color: c.red, alpha: k(2.6, 3) })
    },
  }

  S['h-colony'] = {
    len: 12,
    steps: [
      [0, '일제 통치는 시기마다 방식이 달라요.'],
      [1.4, '<b>1910년대 무단 통치</b>: 헌병 경찰, 회사령, 토지 조사 사업'],
      [4.6, '<b>1920년대 문화 통치</b>: 보통 경찰, 산미 증식 계획, 치안 유지법(1925)'],
      [7.8, '<b>1930년대 후반~ 민족 말살</b>: 국가 총동원법, 황국 신민 서사, 창씨개명'],
    ],
    draw(a) {
      const { c, k } = a
      const eras = [
        ['1910년대', '무단 통치', ['헌병 경찰', '회사령', '토지 조사 사업'], 1.4],
        ['1920년대', '문화 통치', ['보통 경찰', '산미 증식 계획', '치안 유지법'], 4.6],
        ['1930년대~', '민족 말살', ['국가 총동원법', '황국 신민 서사', '창씨개명'], 7.8],
      ]
      eras.forEach(([y, n, items, at], i) => {
        const x = 30 + i * 250
        a.box(x, 40, 236, 90, { fill: c.paper2, stroke: a.t >= at ? c.his : c.rule, width: 2, r: 12 })
        a.text(y, x + 118, 70, { size: 24, weight: 900, align: 'center', font: a.MONO, color: c.his })
        a.text(n, x + 118, 106, { size: 22, weight: 800, align: 'center' })
        items.forEach((it, j) => {
          const p = k(at + 0.4 + j * 0.6, at + 0.9 + j * 0.6)
          const yy = 400 - (400 - (180 + j * 80)) * p
          a.box(x + 18, yy - 26, 200, 52, { fill: c.paper, stroke: c.ink, r: 26, alpha: p })
          a.text(it, x + 118, yy, { size: 20, weight: 800, align: 'center', alpha: p })
        })
      })
    },
  }
})()
