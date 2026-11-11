// 과목 균형 묶음에서 새로 만든 개념 12개의 그림 설명
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  // 상자 하나: 제목 + 줄글
  function card(a, x, y, w, h, title, lines, col, al) {
    a.box(x, y, w, h, { fill: a.c.paper2, stroke: col, width: 2, r: 14, alpha: al })
    a.text(title, x + 16, y + 28, { size: 22, weight: 900, color: col, alpha: al })
    lines.forEach((t, i) => a.text(t, x + 16, y + 64 + i * 30, { size: 18, weight: 600, alpha: al }))
  }

  S['s-earthsys'] = {
    len: 11,
    steps: [
      [0, '지구 시스템: 기권 · 수권 · 지권 · 생물권이 서로 주고받아요.'],
      [3, '물의 순환: 바다에서 <b>증발</b> → 구름 → <b>강수</b>로 다시 땅과 바다로.'],
      [6.5, '탄소의 순환: 광합성으로 CO₂를 흡수하고, 호흡 · 화석 연료 연소로 다시 내보내요.'],
      [9, '화산재(지권)가 햇빛을 가리면 기온(기권)이 내려가요. 한 권의 변화가 다른 권으로 번져요.'],
    ],
    draw(a) {
      const { c, k } = a
      const P = { 기권: [400, 70], 수권: [130, 260], 생물권: [670, 260], 지권: [400, 440] }
      const col = { 기권: c.soc, 수권: c.math, 생물권: c.green, 지권: c.his }
      Object.entries(P).forEach(([n, [x, y]], i) => {
        const al = k(0.2 + i * 0.4, 0.6 + i * 0.4)
        a.box(x - 80, y - 32, 160, 64, { fill: c.paper2, stroke: col[n], width: 3, r: 32, alpha: al })
        a.text(n, x, y, { size: 26, weight: 900, align: 'center', color: col[n], alpha: al })
      })
      a.arrow(170, 222, 340, 108, { color: c.math, width: 3, p: k(3, 4) })
      a.text('증발', 205, 150, { size: 20, weight: 800, color: c.math, alpha: k(3.5, 4) })
      a.arrow(360, 104, 360, 404, { color: c.math, width: 3, p: k(4, 5), dash: [6, 6] })
      a.text('강수', 300, 250, { size: 20, weight: 800, color: c.math, alpha: k(4.5, 5) })
      a.arrow(480, 80, 640, 228, { color: c.green, width: 3, p: k(6.5, 7.5) })
      a.text('광합성 (CO₂ 흡수)', 560, 110, { size: 18, weight: 800, color: c.green, alpha: k(7, 7.5) })
      a.arrow(620, 292, 460, 410, { color: c.amber, width: 3, p: k(7.5, 8.5) })
      a.text('화석 연료 → CO₂', 560, 380, { size: 18, weight: 800, color: c.amber, alpha: k(8, 8.5) })
      a.arrow(440, 406, 440, 104, { color: c.red, width: 4, p: k(9, 10) })
      a.text('화산재 → 기온 ↓', 455, 330, { size: 20, weight: 900, color: c.red, alpha: k(9.5, 10) })
    },
  }

  S['s-momentum'] = {
    len: 11,
    steps: [
      [0, '운동량 p = 질량 × 속도. 무겁고 빠를수록 커요.'],
      [3.5, '충격량 = 힘 × 충돌 시간 = 운동량의 변화량. 그래프에서는 <b>넓이</b>예요.'],
      [7, '넓이(운동량 변화)가 같으면, 시간이 길수록 힘의 크기가 작아져요 → <b>에어백</b>.'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('p = m v', 60, 60, { ...M, size: 44, alpha: k(0, 0.5) })
      a.text('충격량 = F × t = Δp', 330, 60, { ...M, size: 34, alpha: k(3.5, 4) })
      const ax = (x0, label, h, w, col, t0) => {
        a.line(x0, 420, x0 + 300, 420, { color: c.ink, alpha: k(t0, t0 + 0.4) })
        a.line(x0, 420, x0, 140, { color: c.ink, alpha: k(t0, t0 + 0.4) })
        a.text('힘', x0 - 10, 125, { size: 18, weight: 800, align: 'center', alpha: k(t0, t0 + 0.4) })
        a.text('시간', x0 + 300, 446, { size: 18, weight: 800, align: 'end', alpha: k(t0, t0 + 0.4) })
        a.box(x0 + 20, 420 - h * k(t0 + 0.4, t0 + 1.2), w, h * k(t0 + 0.4, t0 + 1.2), { fill: col, alpha: 0.35, r: 0 })
        a.text(label, x0 + 20 + w / 2, 470, { size: 20, weight: 900, align: 'center', color: col, alpha: k(t0 + 1, t0 + 1.4) })
      }
      ax(70, '에어백 없음: 짧고 큰 힘', 240, 60, c.red, 4)
      ax(450, '에어백: 길고 작은 힘', 60, 240, c.green, 6.5)
      a.text('넓이 같음 = 운동량 변화 같음', 600, 250, { size: 22, weight: 900, align: 'center', color: c.marker, alpha: k(8, 8.6) })
    },
  }

  S['s-induction'] = {
    len: 12,
    steps: [
      [0, '자석을 코일 속으로 움직이면 코일 속 자기장이 변해요.'],
      [2.5, '자기장이 변하는 동안 전류가 흘러 검류계 바늘이 움직여요 = <b>전자기 유도</b>. 멈추면 전류 0.'],
      [7, '송전: 손실 전력 = I²R. 전압을 10배로 높이면 전류 1/10 → 손실은 <b>1/100</b>.'],
    ],
    draw(a) {
      const { c, k, t } = a
      for (let i = 0; i < 7; i++) a.ring(260 + i * 22, 200, 50, { color: c.amber, width: 4, alpha: k(0, 0.5) })
      const mx = t < 2.5 ? 40 + 60 * k(0.5, 2.5) : t < 5.5 ? 100 + 110 * k(2.5, 4.5) : 210
      a.box(mx, 180, 90, 40, { fill: c.red, r: 6, alpha: k(0, 0.5) })
      a.box(mx + 45, 180, 45, 40, { fill: c.eng, r: 6, alpha: k(0, 0.5) })
      a.text('N', mx + 22, 200, { size: 20, weight: 900, align: 'center', color: '#fff', alpha: k(0, 0.5) })
      a.text('S', mx + 67, 200, { size: 20, weight: 900, align: 'center', color: '#fff', alpha: k(0, 0.5) })
      const moving = t > 2.5 && t < 4.5
      const ang = moving ? -0.6 : 0
      a.ring(560, 200, 46, { color: c.ink, width: 3, alpha: k(0.5, 1) })
      a.line(560, 200, 560 + 40 * Math.sin(ang), 200 - 40 * Math.cos(ang), { color: c.red, width: 4, alpha: k(0.5, 1) })
      a.text(moving ? '전류 흐름!' : '전류 0', 560, 275, {
        size: 22,
        weight: 900,
        align: 'center',
        color: moving ? c.red : c.sub,
        alpha: k(2.5, 3),
      })
      a.text('검류계', 560, 135, { size: 18, weight: 800, align: 'center', alpha: k(0.5, 1) })
      a.text('손실 전력 = I²R', 60, 360, { ...M, size: 34, alpha: k(7, 7.5) })
      a.text('전압 × 10  →  전류 × 1/10  →  손실 × 1/100', 60, 430, { size: 26, weight: 900, color: c.marker, alpha: k(8, 8.6) })
    },
  }

  S['s-gene'] = {
    len: 11,
    steps: [
      [0, 'DNA 한 가닥의 염기 서열이에요.'],
      [2.5, '<b>전사</b>: 짝을 맞춰 RNA를 만들어요. A → U, T → A, G → C, C → G'],
      [6.5, '<b>번역</b>: RNA 염기 3개(코돈)마다 아미노산 1개 → 이어져서 단백질'],
    ],
    draw(a) {
      const { c, k } = a
      const dna = ['T', 'A', 'C', 'C', 'A', 'T', 'G', 'A', 'A']
      const pair = { A: 'U', T: 'A', G: 'C', C: 'G' }
      a.text('DNA', 40, 110, { size: 24, weight: 900, color: c.sci, alpha: k(0, 0.4) })
      a.text('RNA', 40, 250, { size: 24, weight: 900, color: c.math, alpha: k(2.5, 3) })
      dna.forEach((b, i) => {
        const x = 140 + i * 66
        a.box(x, 85, 52, 50, { fill: c.paper2, stroke: c.sci, width: 2, r: 8, alpha: k(0.2 + i * 0.1, 0.5 + i * 0.1) })
        a.text(b, x + 26, 110, { size: 26, weight: 900, align: 'center', alpha: k(0.2 + i * 0.1, 0.5 + i * 0.1) })
        const t0 = 3 + i * 0.35
        a.arrow(x + 26, 140, x + 26, 220, { color: c.pencil, width: 2, p: k(t0, t0 + 0.3), head: 7 })
        a.box(x, 225, 52, 50, { fill: c.paper2, stroke: c.math, width: 2, r: 8, alpha: k(t0 + 0.3, t0 + 0.5) })
        a.text(pair[b], x + 26, 250, {
          size: 26,
          weight: 900,
          align: 'center',
          color: pair[b] === 'U' ? c.red : c.ink,
          alpha: k(t0 + 0.3, t0 + 0.5),
        })
      })
      ;[0, 1, 2].forEach((j) => {
        const x = 140 + j * 198
        a.hl(x - 2, 282, 190, 8, k(6.5 + j * 0.4, 7 + j * 0.4))
        a.box(x + 45, 330, 100, 56, { fill: c.green, r: 28, alpha: 0.25 * k(7 + j * 0.4, 7.5 + j * 0.4) })
        a.text(`아미노산 ${j + 1}`, x + 95, 358, { size: 18, weight: 900, align: 'center', alpha: k(7 + j * 0.4, 7.5 + j * 0.4) })
      })
      a.text('3염기 = 1아미노산 → 단백질', 400, 450, { size: 26, weight: 900, align: 'center', color: c.marker, alpha: k(8.5, 9) })
    },
  }

  S['s-periodic'] = {
    len: 10,
    steps: [
      [0, '주기율표: 원소를 원자 번호 순서로 늘어놓은 표 (1~3주기 일부)'],
      [3, '<b>같은 족</b>(세로줄)은 원자가 전자 수가 같아 성질이 비슷해요. 1족 Li · Na, 17족 F · Cl'],
      [6.5, '<b>같은 주기</b>(가로줄)는 전자 껍질 수가 같아요.'],
    ],
    draw(a) {
      const { c, k } = a
      const rows = [
        ['H', '', '', '', '', '', '', 'He'],
        ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
        ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
      ]
      const X = 120
      const Y = 90
      const W = 72
      rows.forEach((r, j) =>
        r.forEach((el, i) => {
          if (!el) return
          const g1 = i === 0 && j > 0
          const g17 = i === 6
          const al = k(0.2 + (j * 8 + i) * 0.06, 0.6 + (j * 8 + i) * 0.06)
          const col = g1 && a.t > 3 ? c.red : g17 && a.t > 3 ? c.eng : c.rule
          a.box(X + i * W, Y + j * W, W - 6, W - 6, { fill: c.paper2, stroke: col, width: col === c.rule ? 1.5 : 3, r: 8, alpha: al })
          a.text(el, X + i * W + (W - 6) / 2, Y + j * W + (W - 6) / 2, { size: 24, weight: 900, align: 'center', alpha: al })
        }),
      )
      a.text('1족 알칼리 금속', X, 340, { size: 22, weight: 900, color: c.red, alpha: k(3.5, 4) })
      a.text('17족 할로젠', X + 6 * W - 40, 340, { size: 22, weight: 900, color: c.eng, alpha: k(4, 4.5) })
      a.text('같은 족 = 원자가 전자 수 같음', X, 385, { size: 22, weight: 800, alpha: k(4.5, 5) })
      a.hl(X - 4, Y + 2 * W + 26, 8 * W, 14, k(6.5, 7.3))
      a.text('3주기 = 전자 껍질 3개', X, 440, { size: 22, weight: 800, color: c.marker, alpha: k(7.3, 7.8) })
    },
  }

  S['c-market'] = {
    len: 12,
    steps: [
      [0, '수요 곡선(사려는 양)과 공급 곡선(팔려는 양)이 만나는 점에서 가격이 정해져요 = 균형'],
      [4, '수요가 늘면 수요 곡선이 오른쪽으로 → 균형 가격 ↑, 거래량 ↑'],
      [8.5, '<b>기회비용</b>: 하나를 고르며 포기한 것 중 가장 큰 가치'],
    ],
    draw(a) {
      const { c, k } = a
      const ax = a.axes([60, 40, 400, 360], 0, 10, 0, 10)
      ax.draw({ p: k(0, 0.5) })
      a.text('가격', 50, 30, { size: 18, weight: 800, alpha: k(0, 0.5) })
      a.text('수량', 470, 420, { size: 18, weight: 800, alpha: k(0, 0.5) })
      ax.curve((x) => 10 - x, { color: c.eng, width: 3, p: k(0.5, 1.5) })
      ax.curve((x) => x, { color: c.red, width: 3, p: k(1, 2) })
      a.text('공급', ax.sx(9), ax.sy(9) - 16, { size: 18, weight: 900, color: c.red, alpha: k(1.5, 2) })
      a.text('수요', ax.sx(8.6), ax.sy(1.4) - 16, { size: 18, weight: 900, color: c.eng, alpha: k(1.5, 2) })
      a.dot(ax.sx(5), ax.sy(5), { r: 8, color: c.ink, alpha: k(2, 2.5) })
      const d = 2 * k(4, 5.5)
      if (a.t > 4) {
        ax.curve((x) => 10 + d - x, { color: c.eng, width: 3 })
        a.dot(ax.sx(5 + d / 2), ax.sy(5 + d / 2), { r: 9, color: c.marker })
        a.text('가격 ↑ 거래량 ↑', ax.sx(6.2), ax.sy(6.8), { size: 20, weight: 900, color: c.marker, alpha: k(5.5, 6) })
      }
      a.box(520, 260, 250, 190, { fill: c.paper2, stroke: c.soc, width: 2, r: 14, alpha: k(8.5, 9) })
      a.text('토요일 오후 하나만!', 540, 290, { size: 18, weight: 900, color: c.soc, alpha: k(8.5, 9) })
      ;[
        ['영화', 8, true],
        ['운동', 6, false],
        ['게임', 5, false],
      ].forEach(([n, v, pick], i) => {
        a.text(`${n}  편익 ${v}${pick ? '  ← 선택' : ''}`, 540, 330 + i * 34, {
          size: 18,
          weight: 700,
          alpha: k(9 + i * 0.3, 9.4 + i * 0.3),
        })
      })
      a.text('기회비용 = 6 (가장 큰 포기)', 540, 432, { size: 18, weight: 900, color: c.marker, alpha: k(10.5, 11) })
    },
  }

  S['c-sustain'] = {
    len: 10,
    steps: [
      [0, '인간 중심주의: 자연은 인간을 위한 도구 / 생태 중심주의: 생태계 전체가 도덕적 고려 대상'],
      [4.5, '<b>지속 가능한 발전</b>: 환경 · 경제 · 사회를 함께 생각해 미래 세대의 몫을 남기는 발전'],
    ],
    draw(a) {
      const { c, k } = a
      card(a, 30, 30, 360, 150, '인간 중심주의', ['인간만 가치 있는 존재', '자연 = 도구, 개발 우선'], c.amber, k(0, 0.6))
      card(a, 410, 30, 360, 150, '생태 중심주의', ['생태계 전체가 고려 대상', '인간도 자연의 일부'], c.green, k(1.5, 2.1))
      const R = 85
      const cs = [
        [310, 330, '환경', c.green],
        [490, 330, '경제', c.amber],
        [400, 420, '사회', c.math],
      ]
      cs.forEach(([x, y, n, col], i) => {
        const al = k(4.5 + i * 0.5, 5 + i * 0.5)
        a.ring(x, y, R, { color: col, width: 4, alpha: al })
        a.text(n, x + (x - 400) * 0.45, y + (y - 360) * 0.6, { size: 22, weight: 900, align: 'center', color: col, alpha: al })
      })
      a.box(345, 346, 110, 32, { fill: c.paper2, r: 8, alpha: k(6.5, 7) })
      a.text('지속 가능', 400, 362, { size: 20, weight: 900, align: 'center', color: c.marker, alpha: k(6.5, 7) })
    },
  }

  S['c-welfare'] = {
    len: 9,
    steps: [
      [0, '사회 보장 제도 세 가지를 돈이 어디서 오는지로 구분해요.'],
      [2.5, '<b>사회 보험</b>: 내가 낸 보험료로 위험에 대비 / <b>공공 부조</b>: 세금으로 어려운 사람 지원'],
      [6, '<b>사회 서비스</b>: 돌봄 · 상담처럼 돈이 아닌 서비스로 지원'],
    ],
    draw(a) {
      const { c, k } = a
      card(
        a,
        20,
        80,
        245,
        300,
        '사회 보험',
        ['보험료를 냄', '원칙적 강제 가입', '국민연금', '건강 보험', '고용 · 산재 보험'],
        c.eng,
        k(2.5, 3.1),
      )
      card(a, 278, 80, 245, 300, '공공 부조', ['국가가 세금으로', '생활이 어려운 사람', '국민 기초 생활', '보장 제도'], c.soc, k(3.5, 4.1))
      card(a, 536, 80, 245, 300, '사회 서비스', ['돈이 아닌 서비스', '돌봄 · 상담', '재활 · 일자리', '지원'], c.green, k(6, 6.6))
      a.text('보험은 내가 낸 돈, 부조는 세금', 400, 440, { size: 26, weight: 900, align: 'center', color: c.marker, alpha: k(7, 7.5) })
    },
  }

  S['k-sentpart'] = {
    len: 10,
    steps: [
      [0, '문장: 예쁜 동생이 학교에서 책을 열심히 읽었다.'],
      [2, '<b>주성분</b>: 주어 · 목적어 · 서술어 (+ 보어). 문장의 뼈대예요.'],
      [5.5, '<b>부속 성분</b>: 관형어는 체언을, 부사어는 주로 용언을 꾸며요.'],
    ],
    draw(a) {
      const { c, k } = a
      const ws = [
        ['예쁜', '관형어', 1],
        ['동생이', '주어', 0],
        ['학교에서', '부사어', 1],
        ['책을', '목적어', 0],
        ['열심히', '부사어', 1],
        ['읽었다.', '서술어', 0],
      ]
      let x = 40
      ws.forEach(([w, role, sub], i) => {
        const wd = a.width(w, { size: 32, weight: 800 })
        a.text(w, x, 160, { size: 32, weight: 800, alpha: k(0.2 + i * 0.2, 0.5 + i * 0.2) })
        const t0 = sub ? 5.5 + i * 0.2 : 2 + i * 0.2
        const col = sub ? c.eng : c.kor
        a.hl(x - 2, 178, wd + 4, 8, k(t0, t0 + 0.4), col)
        a.text(role, x + wd / 2, 215, { size: 20, weight: 900, align: 'center', color: col, alpha: k(t0 + 0.2, t0 + 0.6) })
        x += wd + 26
      })
      a.text('주성분 = 뼈대', 40, 320, { size: 24, weight: 900, color: c.kor, alpha: k(3.5, 4) })
      a.text('부속 성분 = 꾸밈', 40, 370, { size: 24, weight: 900, color: c.eng, alpha: k(7, 7.5) })
      a.text('성분은 품사가 아니라 문장 속 역할', 40, 440, { size: 22, weight: 800, color: c.marker, alpha: k(8, 8.5) })
    },
  }

  S['k-tense'] = {
    len: 10,
    steps: [
      [0, '말하는 때(지금)를 기준으로 과거 · 현재 · 미래'],
      [3, '꾸미는 말(관형사형)도 시제가 있어요: 먹은 · 먹는 · 먹을'],
      [6.5, '주의! 형용사 + -(으)ㄴ 은 <b>현재</b>예요. 붉은 꽃 = 지금 붉은 꽃'],
    ],
    draw(a) {
      const { c, k } = a
      a.arrow(60, 140, 740, 140, { color: c.ink, width: 3, p: k(0, 0.8) })
      ;[
        [170, '과거'],
        [400, '현재 (지금)'],
        [630, '미래'],
      ].forEach(([x, n], i) => {
        a.dot(x, 140, { r: 9, color: i === 1 ? c.marker : c.ink, alpha: k(0.5 + i * 0.3, 0.8 + i * 0.3) })
        a.text(n, x, 105, { size: 22, weight: 900, align: 'center', alpha: k(0.5 + i * 0.3, 0.8 + i * 0.3) })
      })
      ;[
        ['먹었다', '먹는다', '먹겠다', 1],
        ['먹은 밥', '먹는 밥', '먹을 밥', 3],
      ].forEach(([p, n, f, t0], j) => {
        ;[p, n, f].forEach((w, i) =>
          a.text(w, [170, 400, 630][i], 210 + j * 60, {
            size: 28,
            weight: 800,
            align: 'center',
            color: j ? c.kor : c.ink,
            alpha: k(t0 + i * 0.3, t0 + 0.4 + i * 0.3),
          }),
        )
      })
      a.box(200, 350, 400, 90, { fill: c.paper2, stroke: c.red, width: 2, r: 14, dash: [6, 6], alpha: k(6.5, 7) })
      a.text('붉은 꽃  →  현재', 400, 395, { size: 30, weight: 900, align: 'center', color: c.red, alpha: k(6.5, 7) })
    },
  }

  S['h-prehist'] = {
    len: 11,
    steps: [
      [0, '구석기: 돌을 깨뜨린 <b>뗀석기</b>, 먹을 것을 찾아 이동하며 살았어요.'],
      [3, '신석기: <b>간석기</b>, 빗살무늬 토기, 농경 시작 → 움집에서 정착'],
      [6, '청동기: 청동기 · <b>고인돌</b>, 계급이 생김 → 첫 국가 <b>고조선</b> (8조법)'],
    ],
    draw(a) {
      const { c, k } = a
      a.arrow(30, 90, 770, 90, { color: c.his, width: 4, p: k(0, 1) })
      card(a, 20, 130, 240, 250, '구석기', ['뗀석기', '사냥 · 채집', '이동 생활', '동굴 · 막집'], c.his, k(0.3, 0.9))
      card(a, 280, 130, 240, 250, '신석기', ['간석기', '빗살무늬 토기', '농경 시작', '움집 · 정착'], c.green, k(3, 3.6))
      card(a, 540, 130, 240, 250, '청동기', ['청동기 · 고인돌', '계급 발생', '→ 고조선 건국', '8조법'], c.amber, k(6, 6.6))
      a.text('뗀 → 간 → 청동', 400, 430, { size: 28, weight: 900, align: 'center', color: c.marker, alpha: k(8.5, 9) })
    },
  }

  S['h-nsk'] = {
    len: 10,
    steps: [
      [0, '남쪽에는 통일 신라, 북쪽에는 발해 → <b>남북국 시대</b>'],
      [2.5, '통일 신라 신문왕: 김흠돌의 난 진압, 국학 설립, 9주 5소경'],
      [6, '발해: 대조영이 고구려 유민 · 말갈인과 건국(698), 3성 6부, 해동성국'],
    ],
    draw(a) {
      const { c, k } = a
      a.text('남북국 시대', 40, 50, { size: 34, weight: 900, color: c.marker, alpha: k(0, 0.6) })
      card(a, 420, 90, 350, 170, '발해 (북)', ['대조영 건국 (698)', '고구려 계승 의식', '3성 6부 · 해동성국'], c.eng, k(6, 6.6))
      card(
        a,
        30,
        290,
        350,
        170,
        '통일 신라 (남)',
        ['신문왕: 국학, 9주 5소경', '김흠돌의 난 진압', '민정 문서 · 청해진'],
        c.his,
        k(2.5, 3.1),
      )
    },
  }
})()
