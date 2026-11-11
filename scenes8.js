// 2차 목표 묶음에서 새로 생긴 개념 그림
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  S['m-sqrtlim'] = {
    len: 12,
    steps: [
      [0, 'x에 큰 수를 넣어 봐요. √(x² + 4x) − x는 0이 아니라 <b>2</b>에 가까워져요.'],
      [5, '∞ − ∞는 0이 아니에요. 분모를 1로 보고 분자, 분모에 √(x² + 4x) + x를 곱해 <b>유리화</b>해요.'],
      [9, '분자, 분모를 x로 나누면 4 / (√(1 + 4/x) + 1) → 4 / 2 = <b>2</b>'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('√(x² + 4x) − x', 40, 50, { ...M, size: 36 })
      a.text('x', 60, 110, { size: 22, weight: 800, color: c.sub, alpha: k(0.4, 0.8) })
      a.text('값', 240, 110, { size: 22, weight: 800, color: c.sub, alpha: k(0.4, 0.8) })
      a.line(40, 130, 380, 130, { color: c.rule, alpha: k(0.4, 0.8) })
      ;[10, 100, 1000].forEach((x, i) => {
        const v = Math.sqrt(x * x + 4 * x) - x
        const t0 = 1 + i * 1.2
        a.text(String(x), 60, 170 + i * 52, { size: 28, font: a.MONO, alpha: k(t0, t0 + 0.4) })
        a.text(v.toFixed(3), 240, 170 + i * 52, { size: 28, weight: 800, font: a.MONO, color: c.math, alpha: k(t0, t0 + 0.4) })
      })
      a.text('→ 2', 240, 330, { size: 32, weight: 900, font: a.MONO, color: c.marker, alpha: k(4.4, 4.8) })
      a.text('∞ − ∞ ≠ 0', 60, 330, { size: 26, weight: 900, color: c.red, alpha: k(4.4, 4.8) })

      a.line(420, 40, 420, 460, { color: c.rule, alpha: k(5, 5.3) })
      a.text('(√(x² + 4x) − x)(√(x² + 4x) + x)', 440, 90, { ...M, size: 20, alpha: k(5, 5.5) })
      a.line(440, 115, 780, 115, { color: c.ink, alpha: k(5.3, 5.7) })
      a.text('√(x² + 4x) + x', 610, 140, { ...M, size: 20, align: 'center', alpha: k(5.3, 5.7) })
      a.text('=', 440, 210, { size: 28, alpha: k(6.6, 7) })
      a.text('4x', 620, 190, { ...M, size: 30, align: 'center', alpha: k(6.6, 7) })
      a.hl(598, 205, 44, 6, k(7, 7.5))
      a.line(480, 220, 760, 220, { color: c.ink, alpha: k(6.6, 7) })
      a.text('√(x² + 4x) + x', 620, 250, { ...M, size: 24, align: 'center', alpha: k(6.6, 7) })
      a.text('=', 440, 340, { size: 28, alpha: k(9, 9.4) })
      a.text('4', 620, 320, { ...M, size: 30, align: 'center', alpha: k(9, 9.4) })
      a.line(480, 350, 760, 350, { color: c.ink, alpha: k(9, 9.4) })
      a.text('√(1 + 4/x) + 1', 620, 380, { ...M, size: 24, align: 'center', alpha: k(9, 9.4) })
      a.text('→ 4 / 2 = 2', 520, 440, { size: 32, weight: 900, color: c.marker, alpha: k(10, 10.5) })
    },
  }

  S['k-reading'] = {
    len: 12,
    steps: [
      [0, '선택지를 읽고, 같은 내용을 말하는 <b>지문의 근거 문장</b>을 찾아요.'],
      [4, '선택지의 “<b>항상</b>”처럼 센 말에 동그라미. 지문은 “알아보지 못할 <b>수 있다</b>”고 했어요.'],
      [8, '지문보다 세게 말했으니 <b>불일치</b>. 근거에 밑줄을 그으면 헷갈리지 않아요.'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('지문', 40, 40, { size: 22, weight: 900, color: c.kor, alpha: k(0, 0.4) })
      a.box(40, 60, 720, 170, { stroke: c.rule, alpha: k(0, 0.4) })
      const lines = [
        '같은 병원체가 다시 들어오면 기억 세포가 이를 빠르게',
        '알아보아, … 더 많은 항체가 만들어진다. … 다만 병원체가',
        '모양을 크게 바꾸면 기억 세포가 알아보지 못할 수 있어,',
        '독감처럼 해마다 백신을 새로 맞아야 하는 경우도 있다.',
      ]
      const lw = a.width(lines[2], { size: 22, weight: 600 })
      if (k(2.4, 3.4) > 0) a.hl(56, 160, lw + 8, 24, k(2.4, 3.4))
      lines.forEach((s, i) => a.text(s, 60, 95 + i * 38, { size: 22, weight: 600, alpha: k(0.2 + i * 0.2, 0.6 + i * 0.2) }))

      a.text('선택지 4번', 40, 290, { size: 22, weight: 900, color: c.kor, alpha: k(1, 1.4) })
      const choice = '기억 세포는 모양이 크게 바뀐 병원체도 항상 알아본다.'
      a.text(choice, 60, 335, { size: 24, weight: 700, alpha: k(1, 1.4) })
      const pre = a.width('기억 세포는 모양이 크게 바뀐 병원체도 ', { size: 24, weight: 700 })
      const w = a.width('항상', { size: 24, weight: 700 })
      a.ring(60 + pre + w / 2, 335, 25, { p: k(4, 4.8) })
      const pre2 = a.width('모양을 크게 바꾸면 기억 세포가 알아보지 못할 ', { size: 22, weight: 600 })
      a.arrow(60 + pre + w / 2, 309, 60 + pre2 + 14, 192, { color: c.red, width: 3, p: k(5, 6) })
      a.text('항상 ≠ 수 있다', 470, 400, { size: 28, weight: 900, color: c.red, alpha: k(6, 6.5) })
      a.text('✗ 불일치', 60, 430, { size: 40, weight: 900, color: c.red, alpha: k(8, 8.5) })
    },
  }
})()
