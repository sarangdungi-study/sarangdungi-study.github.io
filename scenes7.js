// 처음에 영상 파일(범생코드 스타일)로 만들었던 개념 8개를 공책 디자인으로 다시 그림
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  S['m-limit'] = {
    len: 11,
    steps: [
      [0, '곡선 y = x²/2 위의 점 P(1, ½)과 Q를 잇는 직선(할선)을 그어요.'],
      [2.6, 'Q를 P 쪽으로 점점 가까이 → h가 0으로 가요.'],
      [7.6, 'h → 0이면 할선이 <b>접선</b>이 돼요. 그 기울기가 미분계수 f′(1) = 1'],
    ],
    draw(a) {
      const { c, k, t } = a
      const f = (x) => (x * x) / 2
      const ax = a.axes([40, 30, 460, 430], -1, 4, -1, 7)
      ax.draw({ p: k(0, 0.5) })
      ax.curve(f, { color: c.ink, width: 3, p: k(0.3, 1.5) })
      const h = t < 2.6 ? 2.6 : t < 7.6 ? Math.max(0.01, 2.6 * Math.pow(0.01 / 2.6, (t - 2.6) / 5)) : 0.01
      const m = (f(1 + h) - f(1)) / h
      const tangent = t >= 7.6
      if (t > 1.6) {
        ax.curve((x) => f(1) + m * (x - 1), { color: tangent ? c.marker : c.amber, width: tangent ? 4 : 3 })
        a.dot(ax.sx(1), ax.sy(f(1)), { r: 8, color: c.marker })
        if (!tangent) a.dot(ax.sx(1 + h), ax.sy(f(1 + h)), { r: 8, color: c.amber })
        a.text('P', ax.sx(1) - 24, ax.sy(f(1)) - 12, { size: 22, weight: 900 })
        if (!tangent) a.text('Q', ax.sx(1 + h) + 12, ax.sy(f(1 + h)) - 10, { size: 22, weight: 900, color: c.amber })
      }
      a.text(tangent ? 'h → 0' : `h = ${h.toFixed(2)}`, 540, 160, { size: 30, weight: 800, font: a.MONO, color: c.math, alpha: k(2.6, 3) })
      a.text(`기울기 = ${tangent ? '1' : m.toFixed(3)}`, 540, 220, {
        size: 30,
        weight: 900,
        font: a.MONO,
        color: tangent ? c.marker : c.amber,
        alpha: k(1.6, 2),
      })
      a.text('f′(1) = 1', 540, 320, { ...M, size: 36, alpha: k(8, 8.5) })
    },
  }

  S['m-incdec'] = {
    len: 10,
    steps: [
      [0, 'f(x) = x³ − 3x와 그 도함수 f′(x) = 3(x + 1)(x − 1)'],
      [2.6, 'f′ &gt; 0인 곳에서 f는 올라가고, f′ &lt; 0인 곳에서 내려가요.'],
      [6, '부호가 <b>+ → −</b>로 바뀌는 x = −1에서 극대, <b>− → +</b>인 x = 1에서 극소'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 20, 480, 300], -2.4, 2.4, -3, 3)
      ax.draw({ p: k(0, 0.4) })
      ax.curve((x) => x ** 3 - 3 * x, { color: c.math, width: 3, p: k(0.3, 1.6) })
      const y = 380
      a.line(40, y, 520, y, { color: c.sub, alpha: k(2.6, 3) })
      const seg = [
        [-2.4, -1, '+', c.green],
        [-1, 1, '−', c.red],
        [1, 2.4, '+', c.green],
      ]
      seg.forEach(([x0, x1, sg, col], i) => {
        a.box(ax.sx(x0), y - 18, ax.sx(x1) - ax.sx(x0), 36, { fill: col, alpha: 0.2 * k(2.6 + i * 0.4, 3 + i * 0.4), r: 0 })
        a.text(sg, (ax.sx(x0) + ax.sx(x1)) / 2, y, {
          size: 30,
          weight: 900,
          align: 'center',
          color: col,
          alpha: k(2.6 + i * 0.4, 3 + i * 0.4),
        })
      })
      a.text('f′의 부호', 40, y + 46, { size: 20, weight: 800, color: c.sub, alpha: k(2.6, 3) })
      a.dot(ax.sx(-1), ax.sy(2), { r: 9, color: c.marker, alpha: k(6, 6.4) })
      a.dot(ax.sx(1), ax.sy(-2), { r: 9, color: c.marker, alpha: k(6.4, 6.8) })
      a.text('극대 (−1, 2)', 560, 120, { size: 28, weight: 900, color: c.marker, alpha: k(6, 6.4) })
      a.text('극소 (1, −2)', 560, 190, { size: 28, weight: 900, color: c.marker, alpha: k(6.4, 6.8) })
    },
  }

  S['m-outside'] = {
    len: 11,
    steps: [
      [0, '점 (0, −16)은 곡선 y = x³ 위에 있지 않아요. 여기서 곡선에 접선을 그어요.'],
      [2.6, '접점을 (t, t³)로 두면 접선은 y = 3t²(x − t) + t³'],
      [5.4, '(0, −16)을 넣으면 −16 = −2t³ → t = 2'],
      [8, '접점 (2, 8), 기울기 3 × 2² = <b>12</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 20, 420, 440], -1.5, 3.2, -20, 30)
      ax.draw({ p: k(0, 0.4), ystep: 10 })
      ax.curve((x) => x ** 3, { color: c.ink, width: 3, p: k(0.3, 1.6) })
      a.dot(ax.sx(0), ax.sy(-16), { r: 9, color: c.red, alpha: k(0.8, 1.2) })
      a.text('(0, −16)', ax.sx(0) + 14, ax.sy(-16), { size: 20, weight: 800, color: c.red, alpha: k(0.8, 1.2) })
      ax.curve((x) => 12 * x - 16, { color: c.marker, width: 3, p: k(8, 9) })
      a.dot(ax.sx(2), ax.sy(8), { r: 9, color: c.marker, alpha: k(8, 8.4) })
      a.text('(2, 8)', ax.sx(2) + 12, ax.sy(8) + 20, { size: 20, weight: 800, alpha: k(8, 8.4) })
      a.text('y = 3t²(x − t) + t³', 490, 120, { ...M, size: 26, alpha: k(2.6, 3) })
      a.text('−16 = −2t³', 490, 200, { ...M, size: 28, alpha: k(5.4, 5.8) })
      a.text('t = 2', 490, 260, { ...M, size: 28, alpha: k(6.2, 6.6) })
      a.text('기울기 = 12', 490, 350, { size: 32, weight: 900, color: c.marker, alpha: k(8.4, 8.9) })
    },
  }

  // 국어 음운 변동 공통: 단어 → [발음], 바뀐 글자에 표시
  function sound(rows, rule) {
    return function (a) {
      const { c, k } = a
      rows.forEach(([w, p, at], i) => {
        const y = 100 + i * 120
        a.text(w, 120, y, { size: 56, weight: 900, alpha: k(at, at + 0.4) })
        a.arrow(300, y, 380, y, { color: c.sub, p: k(at + 0.6, at + 1) })
        a.text(p, 410, y, { size: 56, weight: 900, color: c.kor, alpha: k(at + 1, at + 1.4) })
      })
      a.text(rule, 400, 450, {
        size: 28,
        weight: 900,
        align: 'center',
        color: c.marker,
        alpha: k(rows[rows.length - 1][2] + 1.8, rows[rows.length - 1][2] + 2.3),
      })
    }
  }
  S['k-nasal'] = {
    len: 9,
    steps: [
      [0, '받침 ㄱ, ㄷ, ㅂ 뒤에 ㄴ이나 ㅁ이 오면'],
      [2.4, '받침이 같은 자리의 콧소리 ㅇ, ㄴ, ㅁ으로 바뀌어요 (비음화).'],
    ],
    draw: sound(
      [
        ['국물', '[궁물]', 0.3],
        ['받는', '[반는]', 1.8],
        ['밥물', '[밤물]', 3.3],
      ],
      'ㄱ → ㅇ,  ㄷ → ㄴ,  ㅂ → ㅁ',
    ),
  }
  S['k-liquid'] = {
    len: 8,
    steps: [
      [0, 'ㄴ과 ㄹ이 만나면'],
      [2.4, 'ㄴ이 ㄹ로 바뀌어요 (유음화). 앞에 있든 뒤에 있든!'],
    ],
    draw: sound(
      [
        ['신라', '[실라]', 0.3],
        ['칼날', '[칼랄]', 1.8],
      ],
      'ㄴ + ㄹ, ㄹ + ㄴ → ㄹㄹ',
    ),
  }
  S['k-palatal'] = {
    len: 8,
    steps: [
      [0, '받침 ㄷ, ㅌ 뒤에 모음 ‘이’가 오면'],
      [2.4, 'ㄷ은 ㅈ, ㅌ은 ㅊ으로 바뀌어요 (구개음화).'],
    ],
    draw: sound(
      [
        ['굳이', '[구지]', 0.3],
        ['같이', '[가치]', 1.8],
      ],
      'ㄷ + 이 → 지,  ㅌ + 이 → 치',
    ),
  }

  S['e-relclause'] = {
    len: 9,
    steps: [
      [0, 'that, who, which가 보이면 거기서 <b>괄호를 열어요</b>.'],
      [2.6, '그 덩어리 안의 동사(recommended)까지 묶고 괄호를 닫아요.'],
      [5, '괄호를 접으면 뼈대만 남아요: The book was interesting.'],
    ],
    draw(a) {
      const { c, k } = a
      const o = { size: 23, weight: 600 }
      const pre = 'The book '
      const cl = 'that my teacher recommended last week'
      const post = ' was interesting.'
      const fold = k(5, 6.2)
      const wPre = a.width(pre, o)
      const wCl = a.width(cl, o)
      const total = wPre + wCl * (1 - fold) + a.width(post, o)
      const x0 = 400 - total / 2
      a.text(pre, x0, 200, o)
      a.hl(x0 + wPre, 212, wCl * (1 - fold), 14, k(2.6, 3.2))
      a.text('(', x0 + wPre - 10, 200, { ...o, size: 30, color: c.marker, alpha: k(0.6, 1) * (1 - fold) })
      a.text(cl, x0 + wPre, 200, { ...o, color: c.sub, alpha: 1 - fold })
      a.text(')', x0 + wPre + wCl, 200, { ...o, size: 30, color: c.marker, alpha: k(2.6, 3) * (1 - fold) })
      a.text(post, x0 + wPre + wCl * (1 - fold), 200, { ...o, weight: 800 })
      a.text('The book was interesting.', 400, 330, { size: 30, weight: 900, align: 'center', color: c.eng, alpha: k(6.2, 6.7) })
    },
  }

  S['s-ionic'] = {
    len: 10,
    steps: [
      [0, 'Na는 바깥 전자 1개, Cl은 바깥 전자 7개'],
      [2.6, 'Na가 전자 1개를 Cl에게 줘요.'],
      [5.4, 'Na⁺와 Cl⁻가 되어 서로 끌어당겨요 → <b>이온 결합</b> (NaCl)'],
    ],
    draw(a) {
      const { c, k, t } = a
      const atom = (cx, n, name, col) => {
        a.dot(cx, 230, { r: 22, color: col })
        a.text(name, cx, 231, { size: 18, weight: 900, align: 'center', color: '#fff' })
        a.ring(cx, 230, 90, { color: c.rule, width: 2 })
        for (let e = 0; e < n; e++) {
          const ang = (e / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2
          a.dot(cx + 90 * Math.cos(ang), 230 + 90 * Math.sin(ang), { r: 7, color: c.marker })
        }
      }
      const p = Math.min(1, Math.max(0, (t - 2.6) / 2))
      const gap = 5.4 < t ? Math.min(1, (t - 5.4) / 1.5) * 60 : 0
      atom(200 + gap, p >= 1 ? 0 : 0, 'Na', c.sci)
      atom(560 - gap, 7, 'Cl', c.green)
      // 옮겨 가는 전자
      const ex = 200 + gap + 90 + (560 - gap - 90 - (200 + gap + 90)) * p
      a.dot(p < 1 ? (t < 2.6 ? 200 + 90 : ex) : 560 - gap - 90, 230, { r: 8, color: c.red })
      if (t > 5.4) {
        a.text('Na⁺', 200 + gap, 360, { size: 32, weight: 900, align: 'center', color: c.sci })
        a.text('Cl⁻', 560 - gap, 360, { size: 32, weight: 900, align: 'center', color: c.green })
        a.text('끌어당김', 380, 140, { size: 26, font: a.HAND, color: c.marker, align: 'center', alpha: k(6.4, 6.8) })
      }
    },
  }
})()
