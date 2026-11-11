// 초등 분수 · 중등 방정식 장면: 피자와 막대로 눈에 보이게
;(function () {
  const S = (window.SCENES = window.SCENES || {})

  // 원(피자)을 n조각으로 나누고 앞에서부터 k조각 칠하기
  function pie(a, cx, cy, r, n, k, o = {}) {
    const { c } = a
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2
      const a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2
      const pts = [[cx, cy]]
      for (let s = 0; s <= 12; s++) {
        const t = a0 + ((a1 - a0) * s) / 12
        pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)])
      }
      a.fillPoly(pts, i < k ? o.color || c.amber : c.paper2, i < k ? 0.8 : 1)
      a.line(cx, cy, cx + r * Math.cos(a0), cy + r * Math.sin(a0), { color: c.ink, width: 2, alpha: o.alpha ?? 1 })
    }
    a.ring(cx, cy, r, { color: c.ink, width: 3, alpha: o.alpha ?? 1 })
  }
  // 막대를 n칸으로 나누고 k칸 칠하기
  function bar(a, x, y, w, h, n, k, col, al = 1) {
    const { c } = a
    for (let i = 0; i < n; i++) {
      a.box(x + (w / n) * i, y, w / n, h, { fill: i < k ? col : c.paper2, alpha: (i < k ? 0.75 : 1) * al, r: 0 })
      a.box(x + (w / n) * i, y, w / n, h, { stroke: c.ink, width: 2, r: 0, alpha: al })
    }
  }
  const fracText = (a, n, d, x, y, size = 40, col) => {
    a.text(n, x, y - size * 0.6, { size, weight: 900, align: 'center', color: col })
    a.line(x - size * 0.5, y, x + size * 0.5, y, { width: 3, color: col })
    a.text(d, x, y + size * 0.6, { size, weight: 900, align: 'center', color: col })
  }

  S['f-mean'] = {
    len: 9,
    steps: [
      [0, '피자 한 판을 <b>똑같이</b> 8조각으로 나눠요.'],
      [2.6, '그중 3조각을 먹었어요.'],
      [5, '아래(분모)는 나눈 조각 수 <b>8</b>, 위(분자)는 먹은 조각 수 <b>3</b> → <b>3/8</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const n = Math.round(1 + 7 * k(0.4, 2.2))
      const eaten = Math.round(3 * k(2.6, 4.2))
      pie(a, 250, 250, 170, n, eaten)
      a.text(`${n}조각`, 250, 460, { size: 26, weight: 800, align: 'center', color: c.sub })
      if (a.t > 5) {
        fracText(a, 3, 8, 590, 240, 64)
        a.text('먹은 조각', 680, 200, { size: 22, color: c.amber, weight: 800, alpha: k(5.4, 5.8) })
        a.text('나눈 조각', 680, 285, { size: 22, color: c.sub, weight: 800, alpha: k(5.8, 6.2) })
      }
    },
  }

  S['f-equiv'] = {
    len: 10,
    steps: [
      [0, '2/3은 3칸 중 2칸이에요.'],
      [2.4, '각 칸을 4개로 더 잘게 나누면 12칸 중 8칸이 돼요.'],
      [5.6, '칠한 양은 그대로예요. <b>2/3 = 8/12</b> (분모, 분자에 똑같이 4를 곱함)'],
    ],
    draw(a) {
      const { c, k } = a
      bar(a, 80, 120, 640, 90, 3, 2, c.math)
      fracText(a, 2, 3, 760, 165, 34)
      const al = k(2.4, 3)
      bar(a, 80, 300, 640, 90, 12, Math.round(8 * k(3, 4.6)), c.math, al)
      if (a.t > 4.6) fracText(a, 8, 12, 760, 345, 34)
      a.line(80 + (640 * 2) / 3, 100, 80 + (640 * 2) / 3, 410, { color: c.red, width: 3, dash: [8, 6], alpha: k(5.6, 6) })
      a.text('× 4', 760, 255, { size: 28, font: a.HAND, color: c.marker, alpha: k(5.6, 6) })
    },
  }

  S['f-mixed'] = {
    len: 9,
    steps: [
      [0, '2와 1/3은 피자 2판과 1/3판이에요.'],
      [2.8, '모두 1/3 조각으로 세면 3 + 3 + 1 = 7조각 → <b>7/3</b>'],
      [6, '거꾸로 7/3은 3조각씩 묶으면 2판 하고 1조각 → <b>2와 1/3</b>'],
    ],
    draw(a) {
      const { c, k } = a
      pie(a, 150, 220, 110, 3, 3)
      pie(a, 400, 220, 110, 3, 3)
      pie(a, 650, 220, 110, 3, 1)
      const cnt = Math.round(7 * k(2.8, 5))
      a.text(`1/3 조각 ${cnt}개`, 400, 400, { size: 34, weight: 900, align: 'center', alpha: k(2.8, 3.2) })
      a.text('2와 1/3 = 7/3', 400, 460, { size: 30, weight: 800, align: 'center', color: c.marker, alpha: k(6, 6.4) })
    },
  }

  S['f-add'] = {
    len: 11,
    steps: [
      [0, '분모가 같으면 칸의 크기가 같아서 <b>칸 수(분자)만</b> 더해요. 3/7 + 2/7 = 5/7'],
      [4, '분모가 다르면 칸 크기가 달라서 바로 못 더해요. 1/2 + 1/3'],
      [6.4, '둘 다 6칸으로 맞추면(통분) 3/6 + 2/6 = <b>5/6</b>'],
    ],
    draw(a) {
      const { c, k, t } = a
      if (t < 4) {
        bar(a, 60, 100, 560, 70, 7, 3, c.math)
        bar(a, 60, 200, 560, 70, 7, 2, c.amber, k(0.8, 1.2))
        bar(a, 60, 330, 560, 70, 7, 5, c.green, k(2, 2.6))
        a.text('3/7', 660, 135, { size: 30, weight: 900 })
        a.text('2/7', 660, 235, { size: 30, weight: 900, alpha: k(0.8, 1.2) })
        a.text('5/7', 660, 365, { size: 34, weight: 900, color: c.green, alpha: k(2, 2.6) })
        return
      }
      const n2 = t < 6.4 ? 2 : 6
      const n3 = t < 6.4 ? 3 : 6
      bar(a, 60, 100, 560, 70, n2, t < 6.4 ? 1 : 3, c.math)
      bar(a, 60, 200, 560, 70, n3, t < 6.4 ? 1 : 2, c.amber)
      a.text(t < 6.4 ? '1/2' : '3/6', 660, 135, { size: 30, weight: 900 })
      a.text(t < 6.4 ? '1/3' : '2/6', 660, 235, { size: 30, weight: 900 })
      bar(a, 60, 330, 560, 70, 6, 5, c.green, k(7.6, 8.2))
      a.text('5/6', 660, 365, { size: 34, weight: 900, color: c.green, alpha: k(7.6, 8.2) })
    },
  }

  S['f-mul'] = {
    len: 9,
    steps: [
      [0, '2/3 × 3/4는 “3/4의 2/3”이에요. 먼저 3/4을 칠해요.'],
      [3, '그 칠한 부분을 다시 3줄로 나눠 2줄만 남겨요.'],
      [6, '12칸 중 6칸 = <b>6/12 = 1/2</b>. 분자는 분자끼리, 분모는 분모끼리 곱한 것과 같아요.'],
    ],
    draw(a) {
      const { c, k } = a
      const X = 150,
        Y = 60,
        W = 400,
        H = 360
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 3; j++) {
          const inA = i < 3
          const inB = j < 2
          let col = c.paper2
          let al = 1
          if (inA && a.t > 0.8) {
            col = c.math
            al = 0.3 * k(0.8, 1.6)
          }
          if (inA && inB && a.t > 3) {
            col = c.marker
            al = 0.75 * k(3, 4)
          }
          a.box(X + (W / 4) * i, Y + (H / 3) * j, W / 4, H / 3, { fill: col, alpha: al, r: 0 })
          a.box(X + (W / 4) * i, Y + (H / 3) * j, W / 4, H / 3, { stroke: c.ink, width: 2, r: 0 })
        }
      a.text('3/4', X + (W * 3) / 8, Y - 24, { size: 24, weight: 800, align: 'center', color: c.math, alpha: k(0.8, 1.2) })
      a.text('2/3', X - 40, Y + H / 3, { size: 24, weight: 800, align: 'center', color: c.marker, alpha: k(3, 3.4) })
      a.text('= 6/12 = 1/2', 590, 240, { size: 34, weight: 900, alpha: k(6, 6.5) })
    },
  }

  S['f-div'] = {
    len: 10,
    steps: [
      [0, '3/4 ÷ 1/2은 “3/4 안에 1/2이 몇 번 들어가나?”예요.'],
      [2.8, '1/2 막대로 재 보면 한 번 들어가고 반이 더 들어가요 → <b>1과 1/2 = 3/2</b>'],
      [6.4, '계산은 <b>뒤집어서 곱하기</b>: 3/4 × 2/1 = 6/4 = 3/2'],
    ],
    draw(a) {
      const { c, k } = a
      bar(a, 80, 90, 640, 70, 4, 3, c.math)
      a.text('3/4', 740, 125, { size: 28, weight: 900 })
      const p = k(2.8, 4.4)
      a.box(80, 200, 320, 60, { fill: c.amber, alpha: 0.75 * Math.min(1, p * 2), r: 6 })
      a.box(80, 200, 320, 60, { stroke: c.ink, width: 2, r: 6, alpha: Math.min(1, p * 2) })
      a.text('1/2 → 1번', 240, 230, { size: 22, weight: 800, align: 'center', alpha: Math.min(1, p * 2) })
      const p2 = Math.max(0, p * 2 - 1)
      a.box(400, 200, 160, 60, { fill: c.amber, alpha: 0.5 * p2, r: 6 })
      a.box(400, 200, 320, 60, { stroke: c.ink, width: 2, dash: [6, 5], r: 6, alpha: p2 })
      a.text('반 번', 480, 230, { size: 22, weight: 800, align: 'center', alpha: p2 })
      a.text('1과 1/2번 = 3/2', 400, 320, { size: 32, weight: 900, align: 'center', alpha: k(4.4, 4.8) })
      a.text('3/4 ÷ 1/2 = 3/4 × 2/1 = 3/2', 400, 420, { size: 30, weight: 800, align: 'center', color: c.marker, alpha: k(6.4, 6.9) })
    },
  }

  S['mid-sys'] = {
    len: 10,
    steps: [
      [0, '연립방정식 x + y = 7, x − y = 1'],
      [1.6, '두 식을 <b>더하면</b> y가 없어져요: 2x = 8'],
      [4.4, 'x = 4를 한 식에 넣으면 y = 3'],
      [6.6, '그래프로 보면 두 직선이 만나는 점 (4, 3)이 해예요.'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('  x + y = 7', 60, 80, { size: 30, weight: 700, font: a.MONO })
      a.text('+ x − y = 1', 60, 125, { size: 30, weight: 700, font: a.MONO })
      a.line(60, 150, 330, 150, { width: 3, alpha: k(1.6, 2) })
      a.text('  2x     = 8', 60, 185, { size: 30, weight: 800, font: a.MONO, color: c.marker, alpha: k(1.8, 2.4) })
      a.strike(160, 80, 40, k(2.2, 2.8))
      a.strike(160, 125, 40, k(2.2, 2.8))
      a.text('x = 4,  y = 3', 60, 260, { size: 34, weight: 900, alpha: k(4.4, 4.9) })
      const ax = a.axes([420, 40, 340, 400], -1, 8, -1, 8)
      ax.draw({ p: k(6.6, 7) })
      ax.curve((x) => 7 - x, { color: c.math, width: 3, p: k(6.8, 7.6) })
      ax.curve((x) => x - 1, { color: c.amber, width: 3, p: k(7, 7.8) })
      a.dot(ax.sx(4), ax.sy(3), { r: 9, color: c.red, alpha: k(7.8, 8.2) })
      a.text('(4, 3)', ax.sx(4) + 12, ax.sy(3) - 16, { size: 20, weight: 800, alpha: k(7.8, 8.2) })
    },
  }
})()
