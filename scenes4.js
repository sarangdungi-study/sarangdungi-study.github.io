// 개념 장면 네 번째 묶음: 중학교·공통수학·나머지 개념
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  // 식을 한 줄씩 써 내려가는 장면. lines: [시각, 식, 옆 메모]
  function derive(lines, o = {}) {
    return function (a) {
      const { c, k } = a
      const size = o.size || 36
      const gap = o.gap || 74
      const y0 = o.y0 || 80
      lines.forEach(([at, tex, note], i) => {
        const y = y0 + i * gap
        const al = k(at, at + 0.5)
        if (i === lines.length - 1) a.hl(56, y + size * 0.35, a.width(tex, { ...M, size }) + 8, 12, k(at + 0.5, at + 1.1))
        a.text(tex, 60, y, { ...M, size, alpha: al })
        if (note) a.text(note, o.noteX || 520, y, { size: 22, font: a.HAND, color: c.marker, alpha: k(at + 0.3, at + 0.8) })
        if (i) a.arrow(36, y - gap + 16, 36, y - 16, { color: c.pencil, head: 7, alpha: al })
      })
    }
  }

  // ───── 중1
  S['m1-prime'] = {
    len: 10,
    steps: [
      [0, '72를 소수가 나올 때까지 계속 나눠요 (소인수분해 나무).'],
      [4.4, '<b>72 = 2³ × 3²</b>. 끝에 남은 수가 모두 소수예요.'],
      [6.6, '36 = 2² × 3², 60 = 2² × 3 × 5 → 공통 부분 2² × 3 = <b>12</b>가 최대공약수'],
    ],
    draw(a) {
      const { c, k } = a
      const node = (x, y, v, at, prime) => {
        a.ring(x, y, 24, { color: prime ? c.marker : c.ink, width: prime ? 3 : 2, alpha: k(at, at + 0.3) })
        a.text(v, x, y + 1, { size: 20, weight: 900, align: 'center', alpha: k(at, at + 0.3), color: prime ? c.marker : c.ink })
      }
      const edge = (x1, y1, x2, y2, at) => a.line(x1, y1 + 24, x2, y2 - 24, { color: c.sub, alpha: k(at, at + 0.3) })
      node(200, 50, 72, 0)
      edge(200, 50, 130, 120, 0.6)
      edge(200, 50, 270, 120, 0.6)
      node(130, 120, 2, 0.8, true)
      node(270, 120, 36, 0.8)
      edge(270, 120, 200, 190, 1.4)
      edge(270, 120, 340, 190, 1.4)
      node(200, 190, 2, 1.6, true)
      node(340, 190, 18, 1.6)
      edge(340, 190, 270, 260, 2.2)
      edge(340, 190, 410, 260, 2.2)
      node(270, 260, 2, 2.4, true)
      node(410, 260, 9, 2.4)
      edge(410, 260, 340, 330, 3)
      edge(410, 260, 480, 330, 3)
      node(340, 330, 3, 3.2, true)
      node(480, 330, 3, 3.2, true)
      a.text('72 = 2³ × 3²', 560, 120, { ...M, size: 34, alpha: k(4.4, 5) })
      a.text('36 = 2² × 3²', 60, 420, { ...M, size: 26, alpha: k(6.6, 7) })
      a.text('60 = 2² × 3 × 5', 300, 420, { ...M, size: 26, alpha: k(6.8, 7.2) })
      a.text('최대공약수 2² × 3 = 12', 560, 300, { size: 24, weight: 900, color: c.marker, alpha: k(7.6, 8.1) })
    },
  }

  S['m1-int'] = {
    len: 9,
    steps: [
      [0, '(−3) × 4 − (−10) ÷ 2: <b>곱셈·나눗셈 먼저</b>'],
      [3, '빼기 음수는 <b>더하기 양수</b>로 바꿔요.'],
      [5.4, '−12 + 5 = <b>−7</b>'],
    ],
    draw: derive([
      [0, '(−3) × 4 − (−10) ÷ 2', ''],
      [1.4, '= (−12) − (−5)', '곱셈·나눗셈 먼저'],
      [3, '= −12 + 5', '빼기 음수 → 더하기'],
      [5.4, '= −7', ''],
    ]),
  }

  S['m1-prop'] = {
    len: 10,
    steps: [
      [0, '<b>정비례</b> y = 3x: x가 2배가 되면 y도 2배. 원점을 지나는 직선이에요.'],
      [4.4, '<b>반비례</b> y = 24/x: x가 2배가 되면 y는 반. 곱 xy가 항상 24예요.'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 40, 340, 400], 0, 8, 0, 25)
      ax.draw({ p: k(0, 0.5), ystep: 5 })
      ax.curve((x) => 3 * x, { color: c.math, width: 3, p: k(0.4, 1.8) })
      a.text('y = 3x', 260, 70, { ...M, size: 26, color: c.math, alpha: k(1.6, 2) })
      const bx = a.axes([420, 40, 340, 400], 0, 8, 0, 25)
      bx.draw({ p: k(4.4, 4.9), ystep: 5 })
      bx.curve((x) => 24 / x, { color: c.marker, width: 3, p: k(4.8, 6.4), from: 1, to: 8 })
      a.text('y = 24/x', 620, 70, { ...M, size: 26, color: c.marker, alpha: k(6, 6.4) })
      a.text('xy = 24', 620, 120, { size: 22, font: a.HAND, color: c.red, alpha: k(7, 7.4) })
    },
  }

  S['mid-expr'] = {
    len: 8,
    steps: [
      [0, 'a = −2일 때 a² − 3a: 음수는 <b>괄호 옷을 입혀서</b> 넣어요.'],
      [3.4, '(−2)² = 4, −3 × (−2) = +6 → <b>10</b>'],
    ],
    draw: derive([
      [0, 'a² − 3a', 'a = −2'],
      [1.4, '= (−2)² − 3 × (−2)', '괄호 꼭!'],
      [3.4, '= 4 + 6', ''],
      [5, '= 10', ''],
    ]),
  }

  S['b-lin'] = {
    len: 9,
    steps: [
      [0, 'x가 있는 항은 왼쪽, 숫자는 오른쪽으로 옮겨요.'],
      [2, '옮기면 <b>부호가 바뀌어요</b> (이항). −7이 넘어가면 +7.'],
      [5, '정리하면 x = 12'],
    ],
    draw: derive(
      [
        [0, '3x − 7 = 2x + 5', ''],
        [2, '3x − 2x = 5 + 7', '넘어가면 부호 반대'],
        [5, 'x = 12', ''],
      ],
      { gap: 100 },
    ),
  }

  S['mid-word'] = {
    len: 9,
    steps: [
      [0, '“어떤 수”를 <b>x로 두고</b> 문장을 그대로 식으로 옮겨요.'],
      [2.6, '“3배에서 4를 빼면 11” → 3x − 4 = 11'],
      [5, 'x = 5. 답이 문제 조건에 맞는지 다시 넣어 확인해요.'],
    ],
    draw(a) {
      const { c, k } = a
      const parts = [
        ['어떤 수의', 'x', 0.4],
        ['3배에서', '3x', 1.2],
        ['4를 빼면', '− 4', 2],
        ['11', '= 11', 2.8],
      ]
      let x = 60
      parts.forEach(([w, e, at]) => {
        a.text(w, x, 120, { size: 28, weight: 800, alpha: k(at - 0.4, at) })
        a.arrow(x + 40, 145, x + 40, 205, { color: c.sub, p: k(at, at + 0.4) })
        a.text(e, x + 20, 240, { ...M, size: 34, color: c.marker, alpha: k(at + 0.3, at + 0.7) })
        x += 175
      })
      a.text('3x − 4 = 11 → 3x = 15 → x = 5', 60, 340, { ...M, size: 32, alpha: k(5, 5.5) })
      a.text('확인: 3 × 5 − 4 = 11 ✓', 60, 410, { size: 24, font: a.HAND, color: c.green, alpha: k(6.6, 7) })
    },
  }

  // ───── 중2
  S['m2-exp'] = {
    len: 9,
    steps: [
      [0, '2³ × 2⁴: 2를 3번, 4번 곱한 것 → 모두 7번. <b>곱하면 지수를 더해요</b>.'],
      [4.4, '2⁷ ÷ 2⁵: 위아래 2가 5개씩 지워져요. <b>나누면 지수를 빼요</b>.'],
    ],
    draw(a) {
      const { c, k } = a
      for (let i = 0; i < 7; i++) {
        const al = k(0.3 + i * 0.25, 0.6 + i * 0.25)
        a.box(60 + i * 64, 80, 54, 54, { stroke: i < 3 ? c.math : c.amber, width: 2, r: 8, alpha: al })
        a.text('2', 87 + i * 64, 108, { size: 26, weight: 900, align: 'center', alpha: al })
      }
      a.text('2³ × 2⁴ = 2⁷', 530, 108, { ...M, size: 32, alpha: k(2.6, 3) })
      for (let i = 0; i < 7; i++) {
        const gone = i < 5 && a.t > 5.4
        a.text('2', 87 + i * 64, 260, { size: 26, weight: 900, align: 'center', alpha: k(4.4, 4.8), color: gone ? c.pencil : c.ink })
        if (i < 5) {
          a.text('2', 87 + i * 64, 340, { size: 26, weight: 900, align: 'center', alpha: k(4.4, 4.8), color: gone ? c.pencil : c.ink })
          a.line(70 + i * 64, 270, 104 + i * 64, 250, { color: c.red, width: 3, alpha: k(5.4 + i * 0.15, 5.6 + i * 0.15) })
          a.line(70 + i * 64, 350, 104 + i * 64, 330, { color: c.red, width: 3, alpha: k(5.4 + i * 0.15, 5.6 + i * 0.15) })
        }
      }
      a.line(60, 300, 500, 300, { width: 2, alpha: k(4.4, 4.8) })
      a.text('2⁷ ÷ 2⁵ = 2²', 530, 300, { ...M, size: 32, alpha: k(6.8, 7.2) })
    },
  }

  S['m2-rep'] = {
    len: 9,
    steps: [
      [0, 'x = 0.272727…로 두고, 순환마디가 두 자리라서 <b>100을 곱해요</b>.'],
      [3, '두 식을 빼면 끝없는 부분이 <b>똑같이 지워져요</b>.'],
      [5.6, '99x = 27 → x = 27/99 = 3/11'],
    ],
    draw: derive([
      [0, '100x = 27.272727…', ''],
      [1.2, '     x =   0.272727…', ''],
      [3, '  99x = 27', '빼면 꼬리가 사라짐'],
      [5.6, 'x = 27/99 = 3/11', ''],
    ]),
  }

  S['m2-ineq'] = {
    len: 10,
    steps: [
      [0, '3x − 5 &lt; x + 7: 방정식처럼 옮겨요 → 2x &lt; 12 → x &lt; 6'],
      [3.6, '수직선에 그리면 6은 <b>빈 동그라미</b>(포함 안 함). 자연수는 1, 2, 3, 4, 5'],
      [7, '주의: 음수로 곱하거나 나누면 <b>부등호 방향이 바뀌어요</b>. −2x &lt; 4 → x &gt; −2'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('3x − 5 < x + 7  →  2x < 12  →  x < 6', 60, 80, { ...M, size: 30, alpha: k(0, 0.5) })
      const sx = (v) => 80 + v * 70
      a.line(40, 230, 760, 230, { width: 2, alpha: k(3.6, 4) })
      for (let v = 0; v <= 9; v++) {
        a.line(sx(v), 222, sx(v), 238, { alpha: k(3.6, 4) })
        a.text(v, sx(v), 262, { size: 20, align: 'center', font: a.MONO, alpha: k(3.6, 4) })
      }
      a.line(sx(6), 200, sx(0) - 30, 200, { color: c.marker, width: 5, alpha: k(4.2, 4.8) })
      a.ring(sx(6), 200, 9, { color: c.marker, width: 3, alpha: k(4.2, 4.8) })
      for (let v = 1; v <= 5; v++) a.dot(sx(v), 230, { r: 8, color: c.green, alpha: k(5 + v * 0.15, 5.3 + v * 0.15) })
      a.text('−2x < 4  →  x > −2', 60, 380, { ...M, size: 30, alpha: k(7, 7.5) })
      a.text('뒤집힘!', 420, 380, { size: 26, font: a.HAND, color: c.red, alpha: k(7.6, 8) })
    },
  }

  S['m2-prob'] = {
    len: 9,
    steps: [
      [0, '주사위 두 개를 던지면 모든 경우는 6 × 6 = <b>36가지</b>'],
      [3, '같은 눈은 대각선 6칸 → 6/36 = <b>1/6</b>'],
      [5.6, '확률 = (그 경우의 수) ÷ (모든 경우의 수)'],
    ],
    draw(a) {
      const { c, k } = a
      const X = 120,
        Y = 50,
        s = 58
      for (let i = 0; i < 6; i++) {
        a.text(i + 1, X + s * i + s / 2, Y - 18, { size: 18, align: 'center', font: a.MONO, color: c.sub })
        a.text(i + 1, X - 20, Y + s * i + s / 2, { size: 18, align: 'center', font: a.MONO, color: c.sub })
        for (let j = 0; j < 6; j++) {
          const diag = i === j
          a.box(X + s * j, Y + s * i, s - 4, s - 4, {
            fill: diag && a.t > 3 ? c.marker : c.paper2,
            alpha: diag && a.t > 3 ? 0.7 * k(3 + i * 0.2, 3.3 + i * 0.2) : k(0.2 + (i * 6 + j) * 0.04, 0.4 + (i * 6 + j) * 0.04),
            r: 6,
          })
        }
      }
      a.text('6 / 36 = 1/6', 520, 200, { size: 36, weight: 900, alpha: k(4.4, 4.9) })
    },
  }

  // ───── 중3
  S['m3-root'] = {
    len: 9,
    steps: [
      [0, '√48: 48 안에서 <b>제곱수</b>를 찾아요. 48 = 16 × 3'],
      [2.8, '√16 = 4가 근호 밖으로 나와서 4√3'],
      [5, '근호 안이 같으면 더할 수 있어요. 2√3 + 3√3 = 5√3'],
    ],
    draw: derive([
      [0, '√48 = √(16 × 3)', '16 = 4²'],
      [2.8, '= 4√3', '밖으로!'],
      [5, '√12 + √27 = 2√3 + 3√3', ''],
      [6.6, '= 5√3', ''],
    ]),
  }

  S['m3-expand'] = {
    len: 10,
    steps: [
      [0, '(a + b)²은 한 변이 a + b인 정사각형의 넓이예요.'],
      [2.6, '넓이를 나누면 a² + ab + ab + b² → <b>a² + 2ab + b²</b>'],
      [6.4, '그래서 (x + 3)² = x² + 6x + 9. 가운데 항 2ab를 빼먹지 마세요.'],
    ],
    draw(a) {
      const { c, k } = a
      const X = 80,
        Y = 60,
        A = 230,
        B = 110
      const sq = (x, y, w, h, col, lab, at) => {
        a.box(x, y, w, h, { fill: col, alpha: 0.45 * k(at, at + 0.4), r: 0 })
        a.box(x, y, w, h, { stroke: c.ink, width: 2, r: 0, alpha: k(0, 0.4) })
        a.text(lab, x + w / 2, y + h / 2, { ...M, size: 30, align: 'center', alpha: k(at, at + 0.4) })
      }
      sq(X, Y, A, A, c.math, 'a²', 2.6)
      sq(X + A, Y, B, A, c.amber, 'ab', 3.2)
      sq(X, Y + A, A, B, c.amber, 'ab', 3.6)
      sq(X + A + 0, Y + A, B, B, c.green, 'b²', 4)
      a.text('a', X + A / 2, Y - 18, { ...M, size: 24, align: 'center' })
      a.text('b', X + A + B / 2, Y - 18, { ...M, size: 24, align: 'center' })
      a.text('(a + b)² = a² + 2ab + b²', 470, 180, { ...M, size: 28, alpha: k(4.6, 5.1) })
      a.text('(x + 3)² = x² + 6x + 9', 470, 280, { ...M, size: 28, color: c.marker, alpha: k(6.4, 6.9) })
    },
  }

  S['m3-formula'] = {
    len: 9,
    steps: [
      [0, 'x² − 4x + 1 = 0은 인수분해가 안 돼요. 근의 공식을 써요.'],
      [2.4, 'x의 계수 −4가 짝수라서 b′ = −2인 <b>짝수 공식</b>이 편해요.'],
      [5.4, 'x = 2 ± √3'],
    ],
    draw: derive(
      [
        [0, 'x² − 4x + 1 = 0', 'b′ = −2 → 짝수 공식'],
        [2.4, 'x = (−b′ ± √(b′² − ac)) / a', ''],
        [4, 'x = 2 ± √(4 − 1)', ''],
        [5.4, 'x = 2 ± √3', ''],
      ],
      { noteX: 480 },
    ),
  }

  S['m3-trig'] = {
    len: 10,
    steps: [
      [0, '직각삼각형에서 각 A를 기준으로 봐요. 각 A의 <b>맞은편 변이 높이</b>예요.'],
      [3, 'sin A = 높이/빗변 = 6/10 = 3/5'],
      [5.4, 'cos A = 밑변/빗변 = 8/10, tan A = 높이/밑변 = 6/8'],
    ],
    draw(a) {
      const { c, k } = a
      const A = [80, 400],
        Cc = [400, 400],
        B = [400, 160]
      a.poly([A, Cc, B, A], { color: c.ink, width: 3, p: k(0, 1) })
      a.box(380, 380, 20, 20, { stroke: c.ink, width: 2, r: 0, alpha: k(0.8, 1.2) })
      a.text('A', A[0] - 22, A[1] + 6, { size: 24, weight: 900 })
      a.text('B', B[0] + 12, B[1] - 6, { size: 24, weight: 900 })
      a.text('C', Cc[0] + 12, Cc[1] + 10, { size: 24, weight: 900 })
      a.line(B[0], B[1], Cc[0], Cc[1], { color: c.marker, width: 6, alpha: k(1.4, 1.9) })
      a.text('높이 6', 420, 280, { size: 22, weight: 800, color: c.marker, alpha: k(1.4, 1.9) })
      a.line(A[0], A[1], B[0], B[1], { color: c.math, width: 6, alpha: k(2, 2.5) })
      a.text('빗변 10', 180, 250, { size: 22, weight: 800, color: c.math, alpha: k(2, 2.5) })
      a.text('밑변 8', 220, 435, { size: 22, weight: 800, color: c.sub, alpha: k(2.4, 2.9) })
      a.text('sin A = 6/10', 520, 180, { size: 28, weight: 900, font: a.MONO, alpha: k(3, 3.5) })
      a.text('cos A = 8/10', 520, 250, { size: 28, weight: 900, font: a.MONO, alpha: k(5.4, 5.9) })
      a.text('tan A = 6/8', 520, 320, { size: 28, weight: 900, font: a.MONO, alpha: k(6, 6.5) })
    },
  }

  S['b-quadfac'] = {
    len: 9,
    steps: [
      [0, 'x² − 4x − 21: <b>곱해서 −21, 더해서 −4</b>인 두 수를 찾아요.'],
      [3, '−7과 3 → (x − 7)(x + 3) = 0'],
      [5.4, '곱이 0이면 둘 중 하나가 0 → x = 7 또는 x = −3'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('x² − 4x − 21 = 0', 60, 80, { ...M, size: 36 })
      const pairs = [
        ['1 × (−21)', '−20'],
        ['3 × (−7)', '−4'],
        ['−3 × 7', '4'],
      ]
      pairs.forEach(([p, s], i) => {
        const y = 170 + i * 50
        const ok = i === 1
        a.text(p, 80, y, { size: 24, font: a.MONO, alpha: k(0.8 + i * 0.5, 1.2 + i * 0.5), color: ok && a.t > 3 ? c.green : c.ink })
        a.text('합 ' + s, 300, y, {
          size: 24,
          font: a.MONO,
          alpha: k(0.8 + i * 0.5, 1.2 + i * 0.5),
          color: ok && a.t > 3 ? c.green : c.sub,
        })
        if (ok) a.hl(70, y - 18, 330 * k(3, 3.6), 36, c.hl)
      })
      a.text('(x − 7)(x + 3) = 0', 470, 220, { ...M, size: 32, alpha: k(3.4, 3.9) })
      a.text('x = 7 또는 x = −3', 470, 300, { size: 28, weight: 900, color: c.marker, alpha: k(5.4, 5.9) })
    },
  }

  S['b-linfunc'] = {
    len: 9,
    steps: [
      [0, '두 점 (1, 3), (4, 9)를 지나는 직선'],
      [2, '기울기 = y의 증가량 ÷ x의 증가량 = 6 ÷ 3 = <b>2</b>'],
      [5, '다른 직선과의 교점은 두 식을 같다고 놓고 풀어요.'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 30, 440, 430], -1, 7, -1, 12)
      ax.draw({ p: k(0, 0.5), ystep: 2 })
      ax.curve((x) => 2 * x + 1, { color: c.math, width: 3, p: k(0.4, 1.6) })
      a.dot(ax.sx(1), ax.sy(3), { r: 8, color: c.ink, alpha: k(0.6, 1) })
      a.dot(ax.sx(4), ax.sy(9), { r: 8, color: c.ink, alpha: k(0.6, 1) })
      a.line(ax.sx(1), ax.sy(3), ax.sx(4), ax.sy(3), { color: c.marker, width: 3, dash: [6, 5], alpha: k(2, 2.5) })
      a.line(ax.sx(4), ax.sy(3), ax.sx(4), ax.sy(9), { color: c.marker, width: 3, dash: [6, 5], alpha: k(2.4, 2.9) })
      a.text('+3', (ax.sx(1) + ax.sx(4)) / 2, ax.sy(3) + 22, { size: 22, weight: 800, color: c.marker, align: 'center', alpha: k(2, 2.5) })
      a.text('+6', ax.sx(4) + 12, ax.sy(6), { size: 22, weight: 800, color: c.marker, alpha: k(2.4, 2.9) })
      a.text('기울기 = 6/3 = 2', 510, 140, { size: 28, weight: 900, alpha: k(3, 3.5) })
      ax.curve((x) => -x + 7, { color: c.amber, width: 3, p: k(5, 6) })
      a.dot(ax.sx(2), ax.sy(5), { r: 9, color: c.red, alpha: k(6, 6.4) })
      a.text('2x + 1 = −x + 7 → x = 2', 500, 300, { ...M, size: 26, alpha: k(6.2, 6.7) })
    },
  }

  S['b-quadfunc'] = {
    len: 9,
    steps: [
      [0, 'y = x² − 4x + 7을 완전제곱식으로 바꿔요.'],
      [2.6, 'y = (x − 2)² + 3 → 꼭짓점 (2, 3)'],
      [5, 'x² 계수가 양수라 아래로 볼록 → 꼭짓점의 y값 <b>3이 최솟값</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 30, 400, 430], -1, 5, -1, 12)
      ax.draw({ p: k(0, 0.5), ystep: 2 })
      ax.curve((x) => x * x - 4 * x + 7, { color: c.math, width: 3, p: k(0.4, 1.8) })
      a.dot(ax.sx(2), ax.sy(3), { r: 9, color: c.marker, alpha: k(2.6, 3) })
      a.text('(2, 3)', ax.sx(2) + 14, ax.sy(3) + 22, { size: 22, weight: 800, alpha: k(2.6, 3) })
      a.text('y = x² − 4x + 7', 480, 120, { ...M, size: 28 })
      a.text('= (x − 2)² + 3', 500, 180, { ...M, size: 28, alpha: k(1.6, 2.2) })
      a.text('최솟값 3', 500, 290, { size: 32, weight: 900, color: c.marker, alpha: k(5, 5.5) })
    },
  }

  S['b-count'] = {
    len: 8,
    steps: [
      [0, '두 주사위 눈의 합이 7인 경우를 표로 빠짐없이 세요.'],
      [3, '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) → <b>6가지</b>. 서로 다른 주사위라 (1,6)과 (6,1)은 따로 세요.'],
    ],
    draw(a) {
      const { c, k } = a
      const X = 150,
        Y = 50,
        s = 58
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 6; j++) {
          const hit = i + j + 2 === 7
          a.box(X + s * j, Y + s * i, s - 4, s - 4, { fill: hit && a.t > 3 ? c.math : c.paper2, alpha: hit && a.t > 3 ? 0.6 : 1, r: 6 })
          a.text(i + j + 2, X + s * j + (s - 4) / 2, Y + s * i + (s - 4) / 2 + 1, {
            size: 18,
            align: 'center',
            font: a.MONO,
            color: hit ? c.ink : c.pencil,
            alpha: k(0.4, 1.4),
          })
        }
      a.text('6가지', 560, 220, { size: 40, weight: 900, alpha: k(4, 4.5) })
    },
  }

  S['b-perm'] = {
    len: 10,
    steps: [
      [0, '5명 중 <b>회장 · 부회장</b>: 자리가 달라서 순서가 있어요 → 5 × 4 = 20 (순열)'],
      [4.4, '5명 중 <b>대표 2명</b>: 자리가 같아서 (A, B)와 (B, A)가 같은 경우 → 20 ÷ 2 = 10 (조합)'],
    ],
    draw(a) {
      const { c, k } = a
      const seat = (x, y, lab, col, at) => {
        a.box(x, y, 150, 70, { stroke: col, width: 3, r: 14, alpha: k(at, at + 0.4) })
        a.text(lab, x + 75, y + 36, { size: 24, weight: 900, align: 'center', color: col, alpha: k(at, at + 0.4) })
      }
      seat(60, 60, '회장 (5)', c.math, 0.4)
      seat(240, 60, '부회장 (4)', c.amber, 0.8)
      a.text('5 × 4 = 20', 460, 96, { size: 32, weight: 900, font: a.MONO, alpha: k(1.6, 2.1) })
      seat(60, 260, '대표', c.green, 4.4)
      seat(240, 260, '대표', c.green, 4.6)
      a.text('A B = B A', 120, 380, { size: 26, weight: 800, font: a.MONO, color: c.sub, alpha: k(5.4, 5.8) })
      a.text('20 ÷ 2 = 10', 460, 296, { size: 32, weight: 900, font: a.MONO, alpha: k(6.2, 6.7) })
    },
  }

  S['b-disc'] = {
    len: 10,
    steps: [
      [0, '판별식 D = b² − 4ac는 그래프가 x축과 몇 번 만나는지 알려 줘요.'],
      [2, 'D &gt; 0 두 점, D = 0 한 점(중근), D &lt; 0 안 만남'],
      [6, '두 근의 합 = −b/a, 곱 = c/a. 근을 몰라도 합과 곱은 바로 나와요.'],
    ],
    draw(a) {
      const { c, k } = a
      const cases = [
        ['D > 0', 2, c.green],
        ['D = 0', 0, c.amber],
        ['D < 0', -2, c.red],
      ]
      cases.forEach(([lab, sh, col], i) => {
        const ax = a.axes([30 + i * 255, 60, 230, 260], -3, 3, -3, 5)
        ax.draw({ p: k(0.2, 0.6) })
        ax.curve((x) => x * x - sh, { color: col, width: 3, p: k(2 + i * 0.6, 2.8 + i * 0.6) })
        a.text(lab, 145 + i * 255, 350, {
          size: 26,
          weight: 900,
          align: 'center',
          font: a.MONO,
          color: col,
          alpha: k(2 + i * 0.6, 2.6 + i * 0.6),
        })
      })
      a.text('두 근의 합 = −b/a,   곱 = c/a', 400, 430, { size: 26, weight: 800, font: a.MONO, align: 'center', alpha: k(6, 6.5) })
    },
  }

  S['b-factor'] = {
    len: 9,
    steps: [
      [0, 'x³ − 6x² + 11x − 6: 상수항 6의 약수 ±1, ±2, …를 넣어 봐요.'],
      [2.4, 'x = 1을 넣으면 0 → <b>(x − 1)이 인수</b>예요 (인수정리).'],
      [4.6, '(x − 1)로 나누면 x² − 5x + 6 = (x − 2)(x − 3)'],
    ],
    draw: derive(
      [
        [0, 'f(x) = x³ − 6x² + 11x − 6', ''],
        [1.2, 'f(1) = 1 − 6 + 11 − 6 = 0', '0이 됐다!'],
        [3, '= (x − 1)(x² − 5x + 6)', '(x − 1)로 나눔'],
        [4.6, '= (x − 1)(x − 2)(x − 3)', ''],
      ],
      { size: 32 },
    ),
  }

  // ───── 고2 수학
  S['a-arith'] = {
    len: 9,
    steps: [
      [0, '등차수열은 같은 수 d씩 커져요.'],
      [2.6, 'a₅에서 a₁₀까지는 다섯 칸 → a₁₀ − a₅ = <b>5d</b> = 15 → d = 3'],
      [5.6, '합은 (첫째항 + 끝항) × 개수 ÷ 2'],
    ],
    draw(a) {
      const { c, k } = a
      for (let n = 1; n <= 10; n++) {
        const v = 1 + (n - 1) * 3
        const h = v * 9
        const x = 50 + (n - 1) * 70
        const hot = n === 5 || n === 10
        a.box(x, 400 - h * k(0.2 + n * 0.12, 0.5 + n * 0.12), 50, h * k(0.2 + n * 0.12, 0.5 + n * 0.12), {
          fill: hot ? c.marker : c.math,
          alpha: 0.6,
          r: 4,
        })
        a.text(v, x + 25, 380 - h, { size: 18, weight: 800, align: 'center', font: a.MONO, alpha: k(0.4 + n * 0.12, 0.7 + n * 0.12) })
        a.text(`a${n}`, x + 25, 425, { size: 16, align: 'center', color: c.sub })
      }
      a.text('5칸 차이 = 5d = 28 − 13 → d = 3', 50, 50, { size: 24, weight: 900, alpha: k(2.6, 3.1) })
      a.text('S₁₀ = 10 × (1 + 28) ÷ 2 = 145', 50, 92, { size: 22, font: a.MONO, alpha: k(5.6, 6.1) })
    },
  }

  S['a-geo'] = {
    len: 9,
    steps: [
      [0, '첫째항 3, 공비 2: 매번 두 배가 돼요.'],
      [3, '합 Sₙ = 3(2ⁿ − 1). 처음으로 1000을 넘는 n을 찾아요.'],
      [5.6, 'S₈ = 765, S₉ = 1533 → <b>n = 9</b>'],
    ],
    draw(a) {
      const { c, k } = a
      let sum = 0
      for (let n = 1; n <= 9; n++) {
        const v = 3 * 2 ** (n - 1)
        sum += v
        const x = 60 + (n - 1) * 78
        const h = Math.min(330, sum * 0.21)
        const at = 0.3 + n * 0.45
        a.box(x, 400 - h * k(at, at + 0.4), 56, h * k(at, at + 0.4), { fill: sum > 1000 ? c.marker : c.math, alpha: 0.6, r: 4 })
        a.text(sum, x + 28, 390 - h, { size: 15, weight: 800, align: 'center', font: a.MONO, alpha: k(at + 0.2, at + 0.5) })
        a.text(`S${n}`, x + 28, 425, { size: 15, align: 'center', color: c.sub })
      }
      a.line(40, 400 - 1000 * 0.21, 760, 400 - 1000 * 0.21, { color: c.red, dash: [8, 6], alpha: k(3, 3.4) })
      a.text('1000', 700, 400 - 1000 * 0.21 - 14, { size: 18, color: c.red, font: a.MONO, alpha: k(3, 3.4) })
    },
  }

  S['a-logrule'] = {
    len: 8,
    steps: [
      [0, '같은 밑의 로그끼리 빼면 <b>진수끼리 나눠요</b>.'],
      [3, '밑이 4이고 진수가 16 = 4²이면 log₄ 16 = 2'],
    ],
    draw: derive(
      [
        [0, 'log₂ 12 − log₂ 3', ''],
        [1.4, '= log₂ (12 ÷ 3) = log₂ 4 = 2', '빼기 = 나누기'],
        [3, 'log₄ 16 = log₄ 4² = 2', ''],
        [4.6, '2 + 2 = 4', ''],
      ],
      { size: 32 },
    ),
  }

  S['a-cosine'] = {
    len: 9,
    steps: [
      [0, '세 변 7, 5, 3을 알면 코사인법칙으로 각을 구해요.'],
      [2.4, '각 A의 <b>맞은편 변 a = 7</b>이 빼기(−a²)로 들어가요.'],
      [5.4, 'cos A = (25 + 9 − 49) / 30 = −1/2 → A = 120°'],
    ],
    draw(a) {
      const { c, k } = a
      // AB = 3, AC = 5, ∠A = 120° (1 = 50px) → BC = 7
      const A = [200, 380]
      const B = [350, 380]
      const ang = (120 * Math.PI) / 180
      const Cc = [A[0] + 250 * Math.cos(ang), A[1] - 250 * Math.sin(ang)]
      a.poly([A, B, Cc, A], { color: c.ink, width: 3, p: k(0, 1) })
      a.line(B[0], B[1], Cc[0], Cc[1], { color: c.marker, width: 6, alpha: k(2.4, 2.9) })
      a.text('A', A[0] + 6, A[1] + 26, { size: 24, weight: 900 })
      a.text('B', B[0] + 8, B[1] + 20, { size: 24, weight: 900 })
      a.text('C', Cc[0] - 26, Cc[1], { size: 24, weight: 900 })
      a.text('3', (A[0] + B[0]) / 2, A[1] + 24, { size: 22, weight: 800, align: 'center' })
      a.text('5', (A[0] + Cc[0]) / 2 - 18, (A[1] + Cc[1]) / 2, { size: 22, weight: 800 })
      a.text('a = 7', (B[0] + Cc[0]) / 2 + 14, (B[1] + Cc[1]) / 2, { size: 22, weight: 800, color: c.marker, alpha: k(2.4, 2.9) })
      a.text('cos A = (5² + 3² − 7²) / (2·5·3)', 350, 160, { size: 20, font: a.MONO, weight: 700, alpha: k(3.4, 3.9) })
      a.text('= −1/2  →  A = 120°', 410, 230, { size: 26, font: a.MONO, weight: 800, alpha: k(5.4, 5.9) })
    },
  }

  S['m-limit0'] = {
    len: 9,
    steps: [
      [0, '분모가 0으로 가는데 극한값이 5처럼 있으면, <b>분자도 0으로 가야</b> 해요.'],
      [3, '그래서 x = 2를 넣은 분자 = 0 → 4 + 2a + b = 0'],
      [5.4, '인수분해해서 (x − 2)를 지우고 극한을 구해요.'],
    ],
    draw: derive(
      [
        [0, 'lim(x→2) (x² + ax + b)/(x − 2) = 5', ''],
        [1.6, '분모 → 0', '분자도 → 0 이어야'],
        [3, '4 + 2a + b = 0', ''],
        [4.6, '(x − 2)(x + 2 + a) / (x − 2) → 4 + a = 5', ''],
      ],
      { size: 28 },
    ),
  }

  S['m-noext'] = {
    len: 9,
    steps: [
      [0, '삼차함수가 극값이 있으면 f′(x)가 x축을 두 번 뚫고 지나가요.'],
      [3.4, '극값이 없으려면 f′(x) ≥ 0: 이차함수 f′이 x축에 <b>닿거나 위에</b> 있어야 → 판별식 ≤ 0'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 50, 330, 380], -3, 3, -3, 6)
      ax.draw({ p: k(0, 0.4) })
      ax.curve((x) => x * x - 2, { color: c.red, width: 3, p: k(0.4, 1.4) })
      a.text('극값 있음 (D > 0)', 200, 460, { size: 22, weight: 800, align: 'center', color: c.red, alpha: k(1.4, 1.8) })
      const bx = a.axes([430, 50, 330, 380], -3, 3, -3, 6)
      bx.draw({ p: k(3.4, 3.8) })
      bx.curve((x) => x * x, { color: c.green, width: 3, p: k(3.8, 4.8) })
      bx.curve((x) => x * x + 1.5, { color: c.green, width: 2, dash: [6, 5], p: k(4.4, 5.4) })
      a.text('극값 없음 (D ≤ 0)', 600, 460, { size: 22, weight: 800, align: 'center', color: c.green, alpha: k(5, 5.4) })
    },
  }

  S['m-area'] = {
    len: 9,
    steps: [
      [0, 'y = x와 y = x² − 2x가 만나는 x = 0, 3 사이의 넓이'],
      [3, '이 구간에서는 직선이 위에 있어요 → <b>∫(위 − 아래)</b>'],
      [5.6, '∫₀³ (3x − x²) dx = 9/2'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([40, 30, 420, 430], -1, 4, -2, 5)
      ax.draw({ p: k(0, 0.5) })
      const pts = [[ax.sx(0), ax.sy(0)]]
      for (let i = 0; i <= 40; i++) {
        const x = (3 * i) / 40
        pts.push([ax.sx(x), ax.sy(x)])
      }
      for (let i = 40; i >= 0; i--) {
        const x = (3 * i) / 40
        pts.push([ax.sx(x), ax.sy(x * x - 2 * x)])
      }
      a.fillPoly(pts, c.marker, 0.3 * k(3, 3.8))
      ax.curve((x) => x, { color: c.math, width: 3, p: k(0.4, 1.4) })
      ax.curve((x) => x * x - 2 * x, { color: c.amber, width: 3, p: k(0.8, 1.8) })
      a.text('위: y = x', 500, 120, { ...M, size: 26, color: c.math, alpha: k(3, 3.4) })
      a.text('아래: y = x² − 2x', 500, 170, { ...M, size: 26, color: c.amber, alpha: k(3.2, 3.6) })
      a.text('S = 9/2', 520, 300, { size: 36, weight: 900, alpha: k(5.6, 6.1) })
    },
  }

  S['p-circle'] = {
    len: 9,
    steps: [
      [0, '둥근 탁자는 돌려서 같은 배치를 한 번만 세요. 한 명을 먼저 앉히고 나머지를 줄 세워요 → (n − 1)!'],
      [4, '이웃해야 하는 두 명은 <b>한 덩어리</b>로 묶고, 덩어리 안 순서 2!을 곱해요.'],
    ],
    draw(a) {
      const { c, k } = a
      a.ring(260, 250, 140, { color: c.ink, width: 3, p: k(0, 0.8) })
      const names = ['A', 'B', '1', '2', '3', '4']
      names.forEach((nm, i) => {
        const ang = -Math.PI / 2 + (i / 6) * Math.PI * 2
        const x = 260 + 190 * Math.cos(ang)
        const y = 250 + 190 * Math.sin(ang)
        const pair = i < 2
        a.dot(x, y, { r: 26, color: pair && a.t > 4 ? c.marker : c.paper2, alpha: k(0.6 + i * 0.2, 0.9 + i * 0.2) })
        a.text(nm, x, y + 1, { size: 22, weight: 900, align: 'center', alpha: k(0.6 + i * 0.2, 0.9 + i * 0.2) })
      })
      a.text('6명: (6 − 1)! = 120', 490, 150, { size: 22, weight: 900, font: a.MONO, alpha: k(2, 2.5) })
      a.text('A, B 이웃:', 490, 260, { size: 22, weight: 800, alpha: k(4.6, 5) })
      a.text('(5 − 1)! × 2 = 48', 490, 310, { size: 22, weight: 900, font: a.MONO, color: c.marker, alpha: k(5.4, 5.9) })
    },
  }

  S['p-comp'] = {
    len: 8,
    steps: [
      [0, '동전 4개: 모든 경우 2⁴ = 16가지'],
      [2.4, '“앞면이 <b>적어도 하나</b>” = 전체에서 “앞면이 하나도 없음”(뒤뒤뒤뒤 1가지)만 빼면 돼요.'],
      [5, '1 − 1/16 = 15/16'],
    ],
    draw(a) {
      const { c, k } = a
      for (let i = 0; i < 16; i++) {
        const x = 60 + (i % 8) * 86
        const y = 100 + Math.floor(i / 8) * 110
        const allBack = i === 15
        a.box(x, y, 74, 80, {
          fill: allBack && a.t > 2.4 ? c.red : c.math,
          alpha: allBack && a.t > 2.4 ? 0.5 : 0.25 * k(0.2 + i * 0.06, 0.5 + i * 0.06),
          r: 10,
        })
        const bits = (15 - i).toString(2).padStart(4, '0').replace(/1/g, '앞').replace(/0/g, '뒤')
        a.text(bits.slice(0, 2), x + 37, y + 28, { size: 16, weight: 800, align: 'center', alpha: k(0.2 + i * 0.06, 0.5 + i * 0.06) })
        a.text(bits.slice(2), x + 37, y + 54, { size: 16, weight: 800, align: 'center', alpha: k(0.2 + i * 0.06, 0.5 + i * 0.06) })
      }
      a.text('1 − 1/16 = 15/16', 400, 400, { size: 36, weight: 900, align: 'center', alpha: k(5, 5.5) })
    },
  }

  S['p-binomthm'] = {
    len: 9,
    steps: [
      [0, '(x + 2)⁵는 (x + 2)를 5번 곱한 것. 각 괄호에서 x 또는 2를 하나씩 골라요.'],
      [3, 'x³이 되려면 5개 중 3개에서 x, 나머지 2개에서 2 → ₅C₃ × 2² = 40'],
    ],
    draw(a) {
      const { c, k } = a
      for (let i = 0; i < 5; i++) {
        const x = 60 + i * 140
        a.box(x, 100, 120, 80, { stroke: c.ink, width: 2, r: 14, alpha: k(0.2 + i * 0.2, 0.5 + i * 0.2) })
        const pickX = i < 3
        a.text('x', x + 35, 140, {
          ...M,
          size: 32,
          align: 'center',
          color: pickX && a.t > 3 ? c.math : c.ink,
          alpha: k(0.2 + i * 0.2, 0.5 + i * 0.2),
        })
        a.text('2', x + 85, 140, {
          size: 30,
          weight: 800,
          align: 'center',
          color: !pickX && a.t > 3 ? c.marker : c.ink,
          alpha: k(0.2 + i * 0.2, 0.5 + i * 0.2),
        })
        if (a.t > 3) a.ring(x + (pickX ? 35 : 85), 140, 26, { color: pickX ? c.math : c.marker, p: k(3 + i * 0.2, 3.4 + i * 0.2) })
      }
      a.text('₅C₃ × x³ × 2² = 10 × 4 = 40', 400, 320, { size: 32, weight: 900, align: 'center', alpha: k(5, 5.5) })
    },
  }

  // ───── 국어 · 영어 · 과학 · 사회 · 한국사
  S['k-causative'] = {
    len: 9,
    steps: [
      [0, '<b>사동</b>: 남에게 무엇을 하게 <b>시켜요</b>. 엄마가 아이에게 밥을 먹였다.'],
      [4.4, '<b>피동</b>: 남에게 <b>당해요</b>. 쥐가 고양이에게 잡혔다.'],
    ],
    draw(a) {
      const { c, k } = a
      const o = { size: 32, weight: 800 }
      a.text('엄마가 아이에게 밥을 ', 60, 140, { ...o, alpha: k(0, 0.5) })
      const w = a.width('엄마가 아이에게 밥을 ', o)
      a.text('먹였다', 60 + w, 140, { ...o, color: c.kor, alpha: k(0, 0.5) })
      a.arrow(130, 175, 280, 175, { color: c.math, width: 3, p: k(1.2, 2) })
      a.text('시킴 → 사동', 130, 220, { size: 26, font: a.HAND, color: c.math, alpha: k(2, 2.4) })
      a.text('쥐가 고양이에게 ', 60, 340, { ...o, alpha: k(4.4, 4.9) })
      const w2 = a.width('쥐가 고양이에게 ', o)
      a.text('잡혔다', 60 + w2, 340, { ...o, color: c.kor, alpha: k(4.4, 4.9) })
      a.arrow(250, 375, 90, 375, { color: c.marker, width: 3, p: k(5.6, 6.4) })
      a.text('당함 → 피동', 90, 420, { size: 26, font: a.HAND, color: c.marker, alpha: k(6.4, 6.8) })
    },
  }

  S['e-gist'] = {
    len: 9,
    steps: [
      [0, '요지는 글쓴이가 하고 싶은 말 한 줄이에요. 예시와 연구 결과는 걷어 내요.'],
      [3.4, '마지막 문장의 <b>in other words</b>가 그 한 줄을 다시 말해요.'],
      [6, '“잠을 줄이면 공부한 것을 잃는다” → 요지'],
    ],
    draw(a) {
      const { c, k } = a
      const lines = [
        ['Many students give up sleep to study more…', 'sub'],
        ['Yet sleep is when the brain sorts the day’s information…', 'sub'],
        ['Students who stay up late often remember less…', 'sub'],
        ['In other words, cutting sleep is a way to lose what you studied.', 'key'],
      ]
      lines.forEach(([t, kind], i) => {
        const y = 80 + i * 70
        const fade = kind === 'sub' && a.t > 3.4 ? 0.35 : 1
        a.text(t, 50, y, {
          size: 21,
          weight: kind === 'key' ? 800 : 500,
          color: kind === 'key' ? c.ink : c.sub,
          alpha: k(0.2 + i * 0.4, 0.6 + i * 0.4) * fade,
        })
        if (kind === 'key') a.hl(46, y + 12, a.width(t, { size: 21, weight: 800 }) + 8, 12, k(3.4, 4))
      })
      a.text('요지: 잠을 줄이면 공부한 것을 잃는다', 400, 420, { size: 28, weight: 900, align: 'center', color: c.eng, alpha: k(6, 6.5) })
    },
  }

  S['s-newton'] = {
    len: 9,
    steps: [
      [0, '멈춰 있던 2 kg 물체를 6 N으로 4초 동안 밀어요.'],
      [3, '받은 충격량 = 힘 × 시간 = 6 × 4 = 24'],
      [5.4, '충격량 = 운동량의 변화 → 24 = 2 × v → <b>v = 12 m/s</b>'],
    ],
    draw(a) {
      const { c, k, t } = a
      a.line(40, 300, 760, 300, { width: 3 })
      const sim = Math.min(4, Math.max(0, (t - 0.6) * 1.4))
      const x = 80 + 15 * sim * sim
      a.box(x, 220, 90, 80, { fill: c.sci, alpha: 0.8, r: 8 })
      a.text('2 kg', x + 45, 262, { size: 22, weight: 900, align: 'center' })
      if (sim < 4) a.arrow(x - 70, 260, x - 4, 260, { color: c.red, width: 4 })
      a.text('6 N', x - 60, 236, { size: 20, weight: 800, color: c.red, alpha: sim < 4 ? 1 : 0 })
      a.text(`t = ${sim.toFixed(1)} s`, 60, 80, { size: 26, font: a.MONO })
      a.text('충격량 = 6 × 4 = 24', 60, 380, { size: 26, weight: 800, font: a.MONO, alpha: k(3, 3.5) })
      a.text('24 = 2 × v  →  v = 12 m/s', 60, 440, { size: 26, weight: 900, font: a.MONO, color: c.marker, alpha: k(5.4, 5.9) })
    },
  }

  S['c-rights'] = {
    len: 10,
    steps: [
      [0, '기본권 다섯: <b>평 · 자 · 참 · 사 · 청</b>'],
      [1, '평등권 차별받지 않음 · 자유권 간섭받지 않음 · 참정권 정치 참여'],
      [5, '사회권 인간다운 생활 · 청구권 다른 권리를 지키기 위한 권리 (재판 청구권)'],
    ],
    draw(a) {
      const { c, k } = a
      const cards = [
        ['평등권', '차별 X', 1],
        ['자유권', '간섭 X', 2],
        ['참정권', '선거권', 3],
        ['사회권', '교육 · 근로', 5],
        ['청구권', '재판 · 청원', 6],
      ]
      cards.forEach(([n, ex, at], i) => {
        const x = 30 + i * 150
        a.box(x, 140, 136, 200, { fill: c.paper2, stroke: a.t >= at ? c.soc : c.rule, width: 2, r: 14 })
        a.text(n[0], x + 68, 200, { size: 56, weight: 900, align: 'center', color: c.soc, alpha: k(at, at + 0.4) })
        a.text(n, x + 68, 265, { size: 22, weight: 900, align: 'center', alpha: k(at, at + 0.4) })
        a.text(ex, x + 68, 305, { size: 18, align: 'center', color: c.sub, alpha: k(at + 0.2, at + 0.6) })
      })
    },
  }

  S['h-liberation'] = {
    len: 10,
    steps: [
      [0, '1945 광복 → 모스크바 3국 외상 회의 (신탁 통치 문제)'],
      [2.6, '1946 미·소 공동 위원회, 좌우 합작 운동'],
      [5, '1948 5·10 총선거 → 대한민국 정부 수립 (8월 15일)'],
      [7.4, '1950 6·25 전쟁'],
    ],
    draw(a) {
      const { c, k } = a
      const ev = [
        ['1945', '광복 · 모스크바 회의', 0],
        ['1946', '미소 공위 · 좌우 합작', 2.6],
        ['1948', '5·10 총선거 · 정부 수립', 5],
        ['1950', '6·25 전쟁', 7.4],
      ]
      a.line(60, 230, 740, 230, { color: c.rule, width: 3 })
      ev.forEach(([y, n, at], i) => {
        const x = 110 + i * 190
        a.dot(x, 230, { r: 10, color: c.his, alpha: k(at, at + 0.4) })
        a.text(y, x, 190, { size: 28, weight: 900, font: a.MONO, align: 'center', color: c.his, alpha: k(at, at + 0.4) })
        a.wrap(n, x - 80, 280, 160, { size: 20, weight: 800, alpha: k(at + 0.2, at + 0.6) })
      })
    },
  }
})()
