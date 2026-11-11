// 개념 장면 두 번째 묶음
;(function () {
  const S = (window.SCENES = window.SCENES || {})
  const M = { italic: true, font: '"Cambria Math", "STIX Two Math", "Times New Roman", serif', weight: 400 }

  S['p-binom'] = {
    len: 10,
    steps: [
      [0, '분산은 값들이 얼마나 <b>퍼져 있는지</b>예요. 점 다섯 개로 볼게요.'],
      [2.4, '3을 곱하면 간격이 3배로 벌어져요. 분산은 간격의 제곱이라 <b>9배</b>.'],
      [5.6, '1을 더하면 통째로 옆으로 옮겨질 뿐 퍼짐은 그대로예요. <b>분산 변화 없음</b>.'],
      [8, '<b>V(3X + 1) = 9V(X)</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const base = [-2, -1, 0, 1, 2]
      const mul = 1 + 2 * k(2.4, 4)
      const sh = k(5.6, 7)
      const cx = 400
      const unit = 34
      const row = (y, label, f, col, al) => {
        a.line(60, y, 740, y, { color: c.rule, alpha: al })
        a.text(label, 60, y - 34, { ...M, size: 26, alpha: al })
        base.forEach((v) => a.dot(cx + f(v) * unit, y, { r: 10, color: col, alpha: al }))
      }
      row(140, 'X', (v) => v, c.math, 1)
      row(290, '3X', (v) => v * mul, c.marker, k(2.4, 2.8))
      row(430, '3X + 1', (v) => v * 3 + 1.5 * sh, c.green, k(5.6, 6))
      a.text('퍼짐 ×3 → 분산 ×9', 520, 250, { size: 24, weight: 800, color: c.marker, alpha: k(4, 4.4) })
      a.text('옮기기만 → 분산 그대로', 470, 390, { size: 24, weight: 800, color: c.green, alpha: k(7, 7.4) })
    },
  }

  S['k-add'] = {
    len: 11,
    steps: [
      [0, '받침은 <b>ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ</b> 일곱 소리로만 나요. 꽃[꼳], 잎[입]'],
      [2.6, '꽃잎은 합성어이고 뒷말이 ‘이’로 시작해서 <b>ㄴ이 덧붙어요</b>. [꽃닙]'],
      [5.2, '받침 ㅊ은 ㄷ, ㅍ은 ㅂ으로 (음절의 끝소리 규칙). [꼳닙]'],
      [7.8, 'ㄷ이 ㄴ 앞에서 ㄴ으로 (비음화). <b>[꼰닙]</b>'],
    ],
    draw(a) {
      const { c, k } = a
      'ㄱㄴㄷㄹㅁㅂㅇ'.split('').forEach((j, i) => {
        a.box(60 + i * 64, 30, 54, 54, { stroke: c.kor, r: 10, alpha: k(0.2 + i * 0.1, 0.5 + i * 0.1) })
        a.text(j, 87 + i * 64, 58, { size: 28, weight: 900, align: 'center', color: c.kor, alpha: k(0.2 + i * 0.1, 0.5 + i * 0.1) })
      })
      a.text('받침 대표음 7개', 530, 58, { size: 22, font: a.HAND, color: c.marker, alpha: k(1, 1.4) })
      const rows = [
        ['꽃잎', '', 1.6],
        ['[꽃닙]', 'ㄴ 첨가', 2.6],
        ['[꼳닙]', '음절의 끝소리 규칙', 5.2],
        ['[꼰닙]', '비음화', 7.8],
      ]
      rows.forEach(([w, rule, at], i) => {
        const y = 150 + i * 88
        a.text(w, 120, y, { size: 44, weight: 900, alpha: k(at, at + 0.4), color: i === 3 ? c.kor : c.ink })
        if (i) a.arrow(80, y - 66, 80, y - 22, { color: c.sub, alpha: k(at, at + 0.4) })
        if (rule) a.text(rule, 330, y, { size: 26, weight: 800, color: c.marker, alpha: k(at + 0.3, at + 0.7) })
      })
    },
  }

  S['k-honor'] = {
    len: 10,
    steps: [
      [0, '높임은 <b>누구를</b> 높이는지로 나눠요.'],
      [1, '<b>주체 높임</b>: 문장의 주어를 높여요. 께서, -시-, 잡수시다, 계시다'],
      [5, '<b>객체 높임</b>: 목적어나 부사어를 높여요. 모시다, 드리다, 여쭙다, 께'],
      [8.4, '주어가 ‘나’인데 높임 말이 있으면 객체 높임을 의심해요.'],
    ],
    draw(a) {
      const { c, k } = a
      const o = { size: 34, weight: 800 }
      const s1 = ['할머니께서', ' 진지를 ', '잡수신다', '.']
      let x = 80
      const pos1 = []
      s1.forEach((p) => {
        pos1.push([x, a.width(p, o)])
        x += a.width(p, o)
      })
      a.hl(pos1[0][0], 150, pos1[0][1], 18, k(1.6, 2.2))
      s1.forEach((p, i) => a.text(p, pos1[i][0], 140, { ...o, alpha: k(0.6, 1), color: i === 2 ? c.kor : c.ink }))
      a.arrow(pos1[2][0] + pos1[2][1] / 2, 110, pos1[0][0] + pos1[0][1] / 2, 110, { color: c.marker, width: 3, p: k(2.4, 3.2) })
      a.text('주체 높임', pos1[0][0], 60, { size: 26, weight: 900, color: c.marker, alpha: k(3, 3.4) })
      const s2 = ['나는 ', '할아버지를', ' ', '모시고', ' 갔다.']
      x = 80
      const pos2 = []
      s2.forEach((p) => {
        pos2.push([x, a.width(p, o)])
        x += a.width(p, o)
      })
      a.hl(pos2[1][0], 350, pos2[1][1], 18, k(5.6, 6.2))
      s2.forEach((p, i) => a.text(p, pos2[i][0], 340, { ...o, alpha: k(4.6, 5), color: i === 3 ? c.kor : c.ink }))
      a.arrow(pos2[3][0] + pos2[3][1] / 2, 310, pos2[1][0] + pos2[1][1] / 2, 310, { color: c.math, width: 3, p: k(6.4, 7.2) })
      a.text('객체 높임', pos2[1][0], 260, { size: 26, weight: 900, color: c.math, alpha: k(7, 7.4) })
      a.text('주어 ‘나’는 안 높임', pos2[0][0], 410, { size: 22, font: a.HAND, color: c.red, alpha: k(8.4, 8.8) })
    },
  }

  S['k-hunmin'] = {
    len: 12,
    steps: [
      [0, '기본자 다섯은 소리 내는 곳의 모양을 본떴어요 (상형).'],
      [3, '소리가 세질수록 획을 하나씩 더했어요 (가획).'],
      [8, '획은 더했지만 소리가 세지지 않은 셋은 따로 <b>이체자</b>: ㆁ ㄹ ㅿ'],
    ],
    draw(a) {
      const { c, k } = a
      const rows = [
        ['어금니', ['ㄱ', 'ㅋ'], 'ㆁ'],
        ['혀', ['ㄴ', 'ㄷ', 'ㅌ'], 'ㄹ'],
        ['입술', ['ㅁ', 'ㅂ', 'ㅍ'], ''],
        ['이', ['ㅅ', 'ㅈ', 'ㅊ'], 'ㅿ'],
        ['목구멍', ['ㅇ', 'ㆆ', 'ㅎ'], ''],
      ]
      a.text('상형', 150, 30, { size: 20, weight: 900, color: c.kor, align: 'center' })
      a.text('가획 →', 330, 30, { size: 20, weight: 900, color: c.kor, align: 'center', alpha: k(3, 3.4) })
      a.text('이체', 650, 30, { size: 20, weight: 900, color: c.red, align: 'center', alpha: k(8, 8.4) })
      rows.forEach(([organ, js, ex], i) => {
        const y = 80 + i * 86
        a.text(organ, 40, y, { size: 20, color: c.sub, alpha: k(0.3 + i * 0.3, 0.6 + i * 0.3) })
        js.forEach((j, q) => {
          const at = q === 0 ? 0.3 + i * 0.3 : 3 + i * 0.4 + q * 0.3
          a.box(120 + q * 110, y - 30, 64, 60, { stroke: q === 0 ? c.kor : c.rule, width: 2, r: 10, alpha: k(at, at + 0.3) })
          a.text(j, 152 + q * 110, y + 2, { size: 34, weight: 900, align: 'center', alpha: k(at, at + 0.3) })
          if (q) a.arrow(120 + q * 110 - 40, y, 120 + q * 110 - 6, y, { color: c.sub, head: 7, alpha: k(at, at + 0.3) })
        })
        if (ex) {
          a.box(618, y - 30, 64, 60, { stroke: c.red, width: 3, r: 10, alpha: k(8 + i * 0.2, 8.4 + i * 0.2) })
          a.text(ex, 650, y + 2, { size: 34, weight: 900, align: 'center', color: c.red, alpha: k(8 + i * 0.2, 8.4 + i * 0.2) })
        }
      })
    },
  }

  S['e-blank'] = {
    len: 10,
    steps: [
      [0, '빈칸 문장에 <b>not A</b>가 있으면, 빈칸은 A와 반대쪽 말이에요.'],
      [2.6, '글 앞부분이 같은 말을 이미 했어요: 익숙함을 이해로 <b>착각</b>한다.'],
      [5.4, '보기 중에 ‘착각’과 같은 뜻을 찾아 넣어요.'],
    ],
    draw(a) {
      const { c, k } = a
      a.box(40, 40, 720, 110, { fill: c.paper2, r: 12 })
      a.text('the sense of ease is', 64, 80, { size: 24, weight: 600 })
      const bw = 210
      a.box(300, 62, bw, 36, { stroke: c.marker, width: 2, dash: [6, 5], r: 6 })
      a.text(', not a sign of mastery.', 520, 80, { size: 24, weight: 600 })
      a.hl(526, 92, 220, 12, k(0.6, 1.2))
      a.text('the feeling is easily mistaken for understanding', 64, 124, { size: 20, color: c.sub, alpha: k(2.6, 3) })
      a.hl(250, 134, 180, 10, k(3, 3.6))
      const opts = ['a reliable measure', 'the result of hard practice', 'an illusion of knowing']
      opts.forEach((o, i) => {
        const y = 230 + i * 70
        const right = i === 2
        const fly = right ? k(6.6, 7.6) : 0
        const x = 80 + (310 - 80) * fly
        const yy = y + (80 - y) * fly
        a.text(o, x, yy, { size: 24, weight: 800, color: right ? c.green : c.ink, alpha: k(5.4, 5.8) })
        if (!right) a.strike(80, y, a.width(o, { size: 24, weight: 800 }), k(6 + i * 0.3, 6.4 + i * 0.3))
      })
    },
  }

  S['e-insert'] = {
    len: 10,
    steps: [
      [0, '주어진 문장: <b>In other words</b>, cramming works for tomorrow but not for next month.'],
      [2, '‘다시 말해’는 앞에서 한 말을 정리해요. 앞에 <b>내일은 됨</b>과 <b>한 달 뒤엔 안 됨</b>이 둘 다 있어야 해요.'],
      [4.6, '③에 넣으면 아직 ‘한 달 뒤’ 이야기가 나오기 전이라 안 돼요.'],
      [7, '④에 넣으면 앞의 두 이야기를 정리하고, 뒤에 새 연구 이야기가 이어져요.'],
    ],
    draw(a) {
      const { c, k, t } = a
      const lines = [
        'Students study for hours the night before.',
        'It feels efficient: scores are often decent.',
        'A month later, much of it is gone.',
        'Spread-out study is remembered longer.',
        'The gaps give the brain time to store it.',
      ]
      lines.forEach((l, i) => {
        const y = 70 + i * 80
        a.text(`(${i + 1})`, 40, y - 26, { size: 18, weight: 800, font: a.MONO, color: c.pencil })
        a.text(l, 100, y, { size: 22, weight: 600, color: i === 1 || i === 2 ? c.ink : c.sub })
        if (i === 1 && t > 2) a.hl(100, y + 10, a.width(l, { size: 22, weight: 600 }), 10, k(2.4, 3))
        if (i === 2 && t > 2) a.hl(100, y + 10, a.width(l, { size: 22, weight: 600 }), 10, k(3, 3.6))
      })
      const slotY = (i) => 70 + i * 80 - 26
      const at3 = k(4.6, 5.2)
      const at4 = k(7, 7.6)
      const y = t < 7 ? slotY(2) : slotY(3)
      const al = t < 4.6 ? 0 : t < 7 ? at3 : at4
      a.box(560, y - 22, 210, 44, { fill: t < 7 ? c.red : c.green, alpha: al * 0.2, stroke: t < 7 ? c.red : c.green, r: 10 })
      a.text('In other words, …', 575, y, { size: 18, weight: 800, alpha: al })
      a.text(t < 7 ? '아직 일러요' : '여기!', 650, y + 40, { size: 22, font: a.HAND, color: t < 7 ? c.red : c.green, alpha: al })
    },
  }

  S['e-summary'] = {
    len: 9,
    steps: [
      [0, '예시가 두 개 나오면 둘의 공통점이 요약이에요.'],
      [3.4, '둘 다 <b>직접 만든 것</b>에 <b>더 높은 값</b>을 매겼어요.'],
      [6, '요약문: People tend to <b>overvalue</b> things they have <b>assembled</b> themselves.'],
    ],
    draw(a) {
      const { c, k } = a
      a.box(40, 40, 330, 150, { fill: c.paper2, r: 12, alpha: k(0.4, 0.8) })
      a.text('종이 동물을 직접 접은 사람', 60, 90, { size: 20, weight: 800, alpha: k(0.4, 0.8) })
      a.text('→ 훨씬 비싸게 사겠다', 60, 140, { size: 20, color: c.marker, weight: 800, alpha: k(1, 1.4) })
      a.box(430, 40, 330, 150, { fill: c.paper2, r: 12, alpha: k(1.8, 2.2) })
      a.text('가구를 직접 조립한 사람', 450, 90, { size: 20, weight: 800, alpha: k(1.8, 2.2) })
      a.text('→ 더 가치 있다고 느낌', 450, 140, { size: 20, color: c.marker, weight: 800, alpha: k(2.4, 2.8) })
      a.arrow(205, 200, 380, 270, { color: c.sub, p: k(3.4, 4) })
      a.arrow(595, 200, 420, 270, { color: c.sub, p: k(3.4, 4) })
      a.text('직접 만든 것 = 더 높게 평가', 400, 300, { size: 28, weight: 900, align: 'center', alpha: k(4, 4.4) })
      a.text('(A) overvalue   (B) assembled', 400, 400, { size: 30, weight: 800, align: 'center', color: c.eng, alpha: k(6, 6.4) })
      a.hl(205, 414, 390, 10, k(6.6, 7.2))
    },
  }

  S['h-democ'] = {
    len: 11,
    steps: [
      [0, '민주화의 흐름을 네 칸으로 외워요.'],
      [1, '<b>1960 4·19 혁명</b>: 부정 선거에 맞서 이승만 정부가 물러남'],
      [3.2, '<b>1972 유신 헌법</b>: 대통령 권한이 커지고 간선제로'],
      [5.4, '<b>1980 5·18 민주화 운동</b>: 광주에서 신군부에 맞섬'],
      [7.6, '<b>1987 6월 민주 항쟁</b>: 결과로 대통령 직선제 개헌'],
    ],
    draw(a) {
      const { c, k } = a
      const ev = [
        ['1960', '4·19 혁명', '이승만 하야', '혁'],
        ['1972', '유신 헌법', '간선제 · 독재', '유'],
        ['1980', '5·18 민주화 운동', '광주', '광'],
        ['1987', '6월 민주 항쟁', '직선제 개헌', '직'],
      ]
      a.line(60, 200, 740, 200, { color: c.rule, width: 3 })
      ev.forEach(([y, n, r, key], i) => {
        const x = 110 + i * 190
        const at = 1 + i * 2.2
        a.dot(x, 200, { r: 9, color: c.his, alpha: k(at, at + 0.4) })
        a.text(y, x, 160, { size: 26, weight: 900, font: a.MONO, align: 'center', color: c.his, alpha: k(at, at + 0.4) })
        a.text(n, x, 250, { size: 21, weight: 800, align: 'center', alpha: k(at + 0.2, at + 0.6) })
        a.text(r, x, 290, { size: 18, align: 'center', color: c.sub, alpha: k(at + 0.4, at + 0.8) })
        a.text(key, x, 390, { size: 48, weight: 900, align: 'center', color: c.marker, alpha: k(9.4 + i * 0.2, 9.8 + i * 0.2) })
      })
    },
  }

  S['s-valence'] = {
    len: 10,
    steps: [
      [0, '전자는 안쪽 껍질부터 2개, 8개씩 채워요.'],
      [2.6, '<b>가장 바깥 껍질의 전자</b>가 원자가 전자예요. Na는 1개.'],
      [5.4, 'Cl은 7개. 하나 받으면 8개가 돼서 안정해져요.'],
      [7.6, 'Na는 1개를 주고, Cl은 1개를 받아요 → Na⁺, Cl⁻'],
    ],
    draw(a) {
      const { c, k } = a
      const atom = (cx, cy, shells, name, at) => {
        a.dot(cx, cy, { r: 18, color: c.sci, alpha: k(at, at + 0.4) })
        a.text(name, cx, cy + 1, { size: 16, weight: 900, align: 'center', color: c.paper, alpha: k(at, at + 0.4) })
        shells.forEach((n, i) => {
          const r = 44 + i * 36
          a.ring(cx, cy, r, { color: c.rule, width: 2, p: k(at + 0.2 + i * 0.3, at + 0.6 + i * 0.3) })
          const outer = i === shells.length - 1
          for (let e = 0; e < n; e++) {
            const ang = (e / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2
            a.dot(cx + r * Math.cos(ang), cy + r * Math.sin(ang), {
              r: 6,
              color: outer ? c.marker : c.ink,
              alpha: k(at + 0.6 + i * 0.3, at + 1 + i * 0.3),
            })
          }
        })
      }
      atom(210, 250, [2, 8, 1], 'Na', 0)
      atom(590, 250, [2, 8, 7], 'Cl', 2.4)
      a.text('바깥 1개', 210, 450, { size: 26, weight: 900, align: 'center', color: c.marker, alpha: k(2.6, 3) })
      a.text('바깥 7개', 590, 450, { size: 26, weight: 900, align: 'center', color: c.marker, alpha: k(5.4, 5.8) })
      a.arrow(320, 120, 480, 120, { color: c.marker, width: 3, p: k(7.6, 8.4) })
      a.text('전자 1개', 400, 96, { size: 20, weight: 800, align: 'center', alpha: k(8, 8.4) })
    },
  }

  S['e-svc'] = {
    len: 8,
    steps: [
      [0, '관계절을 접고 남은 뼈대에서 S, V, C를 찾아요.'],
      [2.6, 'that my teacher recommended last week를 접어요.'],
      [4.6, '<b>The book (S) was (V) interesting (C)</b>'],
    ],
    draw(a) {
      const { c, k } = a
      const o = { size: 24, weight: 600 }
      const parts = ['The book ', '(that my teacher recommended last week)', ' was', ' surprisingly interesting.']
      const fold = k(3, 4.2)
      const ws = parts.map((p) => a.width(p, o))
      const total = ws[0] + ws[1] * (1 - fold) + ws[2] + ws[3]
      let x = 400 - total / 2
      const xs = []
      parts.forEach((p, i) => {
        xs.push(x)
        if (i === 1) {
          a.hl(x, 210, ws[1] * (1 - fold), 14, k(2.6, 3))
          a.text(p, x, 200, { ...o, color: c.sub, alpha: 1 - fold })
          x += ws[1] * (1 - fold)
        } else {
          a.text(p, x, 200, { ...o, weight: i === 2 ? 800 : 600 })
          x += ws[i]
        }
      })
      a.text('S', xs[0] + ws[0] / 2 - 8, 260, { size: 28, weight: 900, color: c.eng, alpha: k(4.6, 5) })
      a.text('V', xs[2] + ws[2] / 2, 260, { size: 28, weight: 900, color: c.eng, alpha: k(4.8, 5.2) })
      a.text('C', xs[3] + ws[3] * 0.7, 260, { size: 28, weight: 900, color: c.eng, alpha: k(5, 5.4) })
    },
  }
})()
