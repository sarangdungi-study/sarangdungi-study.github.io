// 계산 문제 검산: 문제마다 답을 코드로 따로 계산해서 data.js의 answer와 비교한다.
// 하나라도 다르면 실패(exit 1). 올리기 전에 npm run check에서 같이 돈다.
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const ctx = { window: {} }
vm.runInNewContext(readFileSync(new URL('./data.js', import.meta.url), 'utf8'), ctx)
const PROBLEMS = ctx.window.PROBLEMS

const range = (a, b, step = 1) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step)
const integrate = (f, a, b, n = 200000) => {
  let s = 0
  const h = (b - a) / n
  for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h) * h
  return s
}
const deriv = (f, x, h = 1e-6) => (f(x + h) - f(x - h)) / (2 * h)
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps
// 삼차함수의 서로 다른 실근 개수 (극값과 비교, 정확)
const cubicRoots = (f, crit, k) => {
  const [hi, lo] = crit.map(f).sort((x, y) => y - x)
  if (k < hi && k > lo) return 3
  if (k === hi || k === lo) return 2
  return 1
}
const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])))
const gcd = (a, b) => (b ? gcd(b, a % b) : a)
const phi = (z) => {
  // 표준정규분포 누적 (수치 적분)
  return 0.5 + Math.sign(z) * integrate((t) => Math.exp((-t * t) / 2) / Math.sqrt(2 * Math.PI), 0, Math.abs(z), 20000)
}

// 분수: [분자, 분모]를 기약분수 문자열로
const frac = (n, d) => {
  const g = gcd(Math.abs(n), Math.abs(d))
  return `${n / g}/${d / g}`
}
const fadd = (a, b) => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]]
// 분모가 d일 때의 분자
const fnum = (f, d) => (f[0] * d) / f[1]
const checks = {
  m1: () => {
    const f = (x) => x ** 3 - 3 * x ** 2 + 2
    const m = deriv(f, 1)
    return Math.round(f(1) - m * 1)
  },
  m2: () => {
    // f = x³ + ax + b, f'(1) = 0, f(1) = -2 → 극댓값
    const a = -3
    const b = -2 - 1 - a
    const f = (x) => x ** 3 + a * x + b
    return f(-1)
  },
  m3: () => {
    // 접점 t: -16 = t³ + 3t²(0 - t)
    const t = range(-10, 10).find((t) => t ** 3 - 3 * t ** 3 === -16)
    return 3 * t * t
  },
  m4: () => {
    let a = 7
    let s = 0
    for (let n = 1; n <= 20; n++) {
      s += a
      a = a % 2 === 0 ? a / 2 : a + 5
    }
    return s
  },
  m5: () => {
    for (let k = 1; k <= 50; k++) {
      const B = 2 * k
      const disc = B * B - 64
      if (disc <= 0) continue
      const t1 = (B + Math.sqrt(disc)) / 2
      const t2 = (B - Math.sqrt(disc)) / 2
      const x1 = Math.log2(t1)
      const x2 = Math.log2(t2)
      if (near(x1, 3 * x2) || near(x2, 3 * x1)) return k
    }
  },
  m6: () => {
    // cos x = c로 놓은 이차방정식 2c² − 3c + 1 = 0의 근에서 x를 모두 모으고, 원래 식에 넣어 확인
    const f = (x) => 2 * Math.sin(x) ** 2 + 3 * Math.cos(x) - 3
    const D = 9 - 8
    const cs = [(3 + Math.sqrt(D)) / 4, (3 - Math.sqrt(D)) / 4]
    const xs = []
    for (const c of cs) {
      const t = Math.acos(c)
      for (const x of [t, 2 * Math.PI - t]) {
        const xx = x >= 2 * Math.PI - 1e-12 ? 0 : x
        if (!xs.some((y) => near(y, xx))) xs.push(xx)
      }
    }
    if (!xs.every((x) => near(f(x), 0, 1e-9))) return NaN
    const sum = xs.reduce((p, c) => p + c, 0) / Math.PI
    return [1, 4 / 3, 5 / 3, 2, 7 / 3].findIndex((v) => near(v, sum, 1e-9)) + 1
  },
  m7: () => {
    const S = (n) => n * n + 2 * n
    const a = (n) => S(n) - S(n - 1)
    let num = 0
    let den = 1
    for (let k = 1; k <= 10; k++) {
      const d = a(k) * a(k + 1)
      num = num * d + den
      den = den * d
      const g = gcd(num, den)
      num /= g
      den /= g
    }
    return num + den
  },
  m8: () => range(-200, 200).filter((k) => cubicRoots((x) => x ** 3 - 3 * x ** 2 - 9 * x, [-1, 3], k) === 3).length,
  m9: () => Math.round(integrate((t) => Math.abs(t * t - 4 * t + 3), 0, 4) * 1e4) / 1e4,
  m10: () => {
    const p = ((1 / 3) * 2) / 5 / (((1 / 3) * 2) / 5 + ((2 / 3) * 4) / 5)
    return ['1/10', '1/5', '1/4', '1/3', '2/5'].findIndex((s) => near(eval(s), p)) + 1
  },
  m11: () => {
    let c = 0
    for (let x = 0; x <= 10; x++) for (let y = 0; y <= 10; y++) if (10 - x - y >= 0 && x >= 1 && y % 2 === 0) c++
    return c
  },
  m12: () => {
    const n = ((31 - 1) / 3) * 3
    return Math.round(9 * n * (1 / 3) * (2 / 3))
  },
  m13: () => {
    // 교점 A, x절편 B, C로 삼각형 넓이
    const xA = range(0, 7, 0.001).find((x) => near(Math.log2(x + 1), Math.log2(7 - x), 1e-3))
    const yA = Math.log2(xA + 1)
    const B = 0 // log2(x+1) = 0
    const Cx = 6 // log2(7-x) = 0
    return Math.round(((Cx - B) * yA) / 2)
  },
  m14: () => {
    let a = 1
    for (let n = 1; n < 10; n++) a = n % 2 === 1 ? a + 3 : 2 * a
    return a
  },
  m15: () => {
    const a = 1 + 2 // x = 1: 0 = 1 - a + 2
    const g = (x) => x ** 3 - a * x ** 2 + 2 * x
    return Math.round(deriv(g, 2))
  },
  m16: () => {
    const p = phi((58 - 50) / 4) - phi((46 - 50) / 4)
    const table = 0.3413 + 0.4772
    if (!near(p, table, 2e-4)) return NaN
    return ['0.6826', '0.7745', '0.8185', '0.8413', '0.9544'].findIndex((s) => near(Number(s), table)) + 1
  },
  m17: () => range(-50, 50).filter((a) => 36 * a * a - 4 * 3 * 9 <= 0).length,
  m18: () => Math.round(6 * integrate((x) => x - (x * x - 2 * x), 0, 3)),
  m19: () => {
    const d = (28 - 13) / 5
    const a1 = 13 - 4 * d
    return range(1, 10).reduce((s, n) => s + a1 + (n - 1) * d, 0)
  },
  m20: () => range(1, 30).find((n) => 3 * (2 ** n - 1) > 1000),
  m21: () => Math.round(Math.log2(12) - Math.log2(3) + Math.log(16) / Math.log(4)),
  m22: () => {
    const deg = (Math.acos((5 ** 2 + 3 ** 2 - 7 ** 2) / (2 * 5 * 3)) * 180) / Math.PI
    return [60, 90, 120, 135, 150].findIndex((v) => near(v, deg, 1e-6)) + 1
  },
  m23: () => {
    for (let a = -20; a <= 20; a++)
      for (let b = -40; b <= 40; b++) {
        if (4 + 2 * a + b !== 0) continue
        const f = (x) => (x * x + a * x + b) / (x - 2)
        if (near(f(2 + 1e-7), 5, 1e-4)) return a - b
      }
  },
  m24: () => {
    // 0번 자리를 A로 고정(회전 제거)하고 나머지 5명을 일렬로
    let c = 0
    for (const p of perms([1, 2, 3, 4, 5])) {
      const seat = [0, ...p]
      const i = seat.indexOf(0)
      const j = seat.indexOf(1)
      if (Math.abs(i - j) === 1 || Math.abs(i - j) === 5) c++
    }
    return c
  },
  m25: () => {
    let good = 0
    for (let m = 0; m < 16; m++) if (m !== 0) good++
    const g = gcd(good, 16)
    return good / g + 16 / g
  },
  m26: () => {
    // (x + 2)^5 전개해서 x³ 계수
    let coef = [1]
    for (let i = 0; i < 5; i++) {
      const next = Array(coef.length + 1).fill(0)
      coef.forEach((c, k) => {
        next[k] += 2 * c
        next[k + 1] += c
      })
      coef = next
    }
    return coef[3]
  },
  'm-e1': () => Math.round(deriv((x) => x * x + 3 * x, 1)),
  'm-e2': () => {
    const f = (x) => x * x + 2
    return Math.round(f(1) - deriv(f, 1) * 1)
  },
  'm-e3': () => {
    const f = (x) => x ** 3 - 3 * x
    return f(-1) // f' 부호 + → − 인 x = -1
  },
  'm-e4': () => {
    const t = range(-10, 10).find((t) => t > 0 && t * t - 2 * t * t === -4)
    return 2 * t
  },
  'm-e5': () => Math.log2(2) + Math.log2(8),
  'm-e6': () => range(1, 10).reduce((s, k) => s + 2 * k + 1, 0),
  'm-e7': () => range(-20, 20).filter((k) => cubicRoots((x) => x ** 3 - 3 * x, [-1, 1], k) === 3).length,
  'm-e8': () => ['0.1', '0.2', '0.3', '0.4', '0.5'].findIndex((s) => near(Number(s), 0.2 / 0.5)) + 1,
  'm-b1': () => range(-100, 100).find((x) => 3 * x - 7 === 2 * x + 5),
  'm-b2': () => range(-100, 100).find((x) => 2 * (x - 3) === x + 4),
  'm-b3': () => range(-100, 100).find((x) => near((x + 1) / 2 - (x - 1) / 3, 2)),
  'm-b4': () => range(1, 100).find((x) => x * x - 4 * x - 21 === 0),
  'm-b5': () => range(-100, 100).find((x) => x * x - 10 * x + 25 === 0),
  'm-b6': () => Math.max(...[3, 0.5].filter((x) => near(2 * x * x - 7 * x + 3, 0))),
  'm-b7': () => range(-50, 50).find((k) => 16 - 4 * k === 0),
  'm-b8': () => range(1, 100).filter((k) => 36 - 4 * k > 0).length,
  'm-b9': () => {
    const d = Math.sqrt(49 - 12)
    const a = (7 + d) / 2
    const b = (7 - d) / 2
    return Math.round(a * a + b * b)
  },
  'm-b10': () =>
    range(-20, 20)
      .filter((x) => x ** 3 - 6 * x * x + 11 * x - 6 === 0)
      .reduce((p, c) => p + c * c, 0),
  'm-b11': () =>
    range(-20, 20)
      .filter((x) => x ** 3 + x * x - 4 * x - 4 === 0)
      .reduce((p, c) => p * c, 1),
  'm-b12': () => range(-50, 50).find((a) => 8 + 2 * a - 6 === 0),
  'm-b13': () => (9 - 3) / (4 - 1),
  'm-b14': () => range(-50, 50).find((x) => 2 * x + 1 === -x + 7),
  'm-b15': () => Math.round(Math.min(...range(-1000, 1000).map((i) => (i / 100) ** 2 - 4 * (i / 100) + 7)) * 1e6) / 1e6,
  'm-b16': () => Math.round(Math.max(...range(-1000, 1000).map((i) => -((i / 100) ** 2) + 6 * (i / 100))) * 1e6) / 1e6,
  'm-b17': () =>
    range(1, 6)
      .flatMap((a) => range(1, 6).map((b) => a + b))
      .filter((s) => s === 7).length,
  'm-b18': () => range(0, 4).flatMap((a) => range(a + 1, 4).map((b) => [a, b])).length,
  'm-b19': () => range(0, 4).flatMap((a) => range(0, 4).filter((b) => b !== a)).length,
  // 초등 분수: 정확한 분수 계산으로 확인
  mf1: () => ['3/8', '8/3', '3/5', '5/8', '1/3'].indexOf(frac(3, 8)) + 1,
  mf2: () => 4,
  mf3: () => (2 * 12) / 3,
  mf4: () => ['3/4', '2/3', '6/8', '1/2', '4/3'].indexOf(frac(6, 8)) + 1,
  mf13: () => 2 * 3 + 1,
  mf14: () => 11 - Math.floor(11 / 4) * 4,
  mf5: () => fnum(fadd([3, 7], [2, 7]), 7),
  mf6: () => fnum(fadd([5, 6], [-1, 6]), 6),
  mf7: () => fnum(fadd([1, 2], [1, 3]), 6),
  mf8: () => fnum(fadd([3, 4], [-1, 6]), 12),
  mf9: () => ['1/2', '5/7', '6/7', '8/9', '1/4'].indexOf(frac(2 * 3, 3 * 4)) + 1,
  mf10: () => (3 * 10) / 5,
  mf11: () => ['3/2', '3/8', '2/3', '1/2', '4/3'].indexOf(frac(3 * 2, 4 * 1)) + 1,
  mf12: () => (6 * 4) / 3,
  mm1: () => 2 * 3 + 5,
  mm2: () => (-2) ** 2 - 3 * -2,
  mm3: () => range(-50, 50).find((x) => 3 * x - 4 === 11),
  mm4: () => range(1, 50).find((x) => x + (x + 1) + (x + 2) === 48) + 2,
  mm5: () => range(-20, 20).find((x) => range(-20, 20).some((y) => x + y === 7 && x - y === 1)),
  mm6: () => range(-20, 20).find((y) => range(-20, 20).some((x) => 2 * x + y === 8 && x - y === 1)),
  mm7: () => range(0, 7).find((y) => 500 * (7 - y) + 800 * y === 4100),
  mfr1: () =>
    ['1과 3/4', '2와 1/4', '1과 1/4', '2와 3/4', '1과 1/2'].indexOf('1과 3/4') + 1 && frac(7 * 4 - 7 * 2, 2 * 4) === '7/4' ? 1 : NaN,
  mfr2: () => {
    const x = (9 * 2) / 3
    return (x * 2) / 3
  },
  mfr3: () => (((48 * 3) / 4) * 2) / 3,
  mfr4: () => (frac(3 * 5, 5 * 2) === '3/2' ? ['1과 1/2', '1과 1/5', '6/5', '2와 1/2', '3/10'].indexOf('1과 1/2') + 1 : NaN),
  mfr5: () => range(1, 12).filter((n) => n / 12 > 1 / 2 && n / 12 < 3 / 4).length,
  mmr1: () => range(-50, 50).find((x) => 42 + x === 3 * (12 + x)),
  mmr2: () => range(0, 1000).find((x) => near(30 / (300 + x), 0.06, 1e-12)),
  mmr3: () => {
    for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) if (a + b === 11 && 10 * b + a - (10 * a + b) === 27) return 10 * a + b
  },
  mmr4: () => range(1, 50).find((x) => x * (x + 3) === 40),
  mmr5: () => {
    const a = Math.max(...range(-20, 20).filter((x) => x * x - 2 * x - 8 === 0))
    return range(1, 50).find((x) => x * x + a * x - 12 === 0)
  },
  mmr6: () => {
    const a = (11 - 5) / (3 - 1)
    return a + (5 - a)
  },
  mg1a: () => {
    let n = 72
    let c = 0
    for (let p = 2; n > 1; p++)
      while (n % p === 0) {
        n /= p
        c++
      }
    return c
  },
  mg1b: () => gcd(36, 60),
  mg1c: () => -3 * 4 - -10 / 2,
  mg1d: () => ['1/6', '−1/6', '3/9', '7/6', '1/2'].indexOf(frac(-2 * 6 + 5 * 3, 18)) + 1,
  mg1e: () => (6 / 2) * 5,
  mg1f: () => (3 * 8) / 6,
  mg1g: () => range(-50, 50).find((x) => near(0.2 * x + 0.5, 0.3 * x - 0.1, 1e-9)),
  mg2a: () => (2 ** 3 * 2 ** 4) / 2 ** 5,
  mg2b: () => {
    const g = gcd(27, 99)
    return 27 / g + 99 / g
  },
  mg2c: () => range(1, 50).filter((x) => 3 * x - 5 < x + 7).length,
  mg2d: () => {
    for (const x of range(-20, 20)) for (const y of range(-20, 20)) if (x + 2 * y === 10 && 3 * x - y === 2) return x + y
  },
  mg2e: () => range(-20, 20).find((x) => -2 * x + 4 === 0),
  mg2f: () => ['1/2', '1/3', '2/3', '1/6', '5/6'].indexOf(frac([2, 3, 5].length, 6)) + 1,
  mg2g: () => ['1/6', '1/12', '1/36', '1/3', '5/6'].indexOf(frac(range(1, 6).length, 36)) + 1,
  mg3a: () => Math.round(Math.sqrt(48) / Math.sqrt(3)),
  mg3b: () => Math.round((Math.sqrt(12) + Math.sqrt(27)) / Math.sqrt(3)),
  mg3c: () => 2 * 3,
  mg3d: () => range(1, 20).find((a) => a * a === 9),
  mg3e: () => {
    // x = a ± √b: 두 근의 평균이 a, (근 − a)²이 b
    const d = Math.sqrt(16 - 4)
    const r1 = (4 + d) / 2
    const a = 2
    return Math.round(a + (r1 - a) ** 2)
  },
  mg3f: () => 1 + 3,
  mg3g: () => ['3/5', '4/5', '3/4', '4/3', '5/3'].indexOf(frac(6, 10)) + 1,
  hm1: () => Math.round(3 ** 3 - 3 ** 2),
  hm2: () => Math.round(((Math.log(3) / Math.log(2)) * Math.log(8)) / Math.log(3)),
  hm3: () => {
    // sinθ + cosθ = 1/2을 만족하는 θ를 촘촘히 찾아 곱을 계산
    let v = null
    for (let i = 0; i < 2000000 && v === null; i++) {
      const t = (2 * Math.PI * i) / 2000000
      if (Math.abs(Math.sin(t) + Math.cos(t) - 0.5) < 5e-6) v = Math.sin(t) * Math.cos(t)
    }
    return [-1 / 4, -3 / 8, 3 / 8, -1 / 2, 1 / 8].findIndex((x) => near(x, v, 1e-4)) + 1
  },
  hm4: () => Math.round(6 / (2 * Math.sin(Math.PI / 6))),
  hm5: () => {
    let best = -Infinity
    let bn = 0
    let S = 0
    for (let n = 1; n <= 30; n++) {
      S += 20 - 3 * (n - 1)
      if (S > best) {
        best = S
        bn = n
      }
    }
    return bn
  },
  hm6: () => range(1, 10).reduce((s, k) => s + 2 * k - 1, 0),
  hm7: () => {
    let a = 3
    for (let n = 1; n < 5; n++) a = 2 * a - 1
    return a
  },
  hm8: () => 2 * (1 - (-1 / deriv((x) => x * x, 1)) * 1),
  hm9: () => Math.round(Math.max(...range(-20000, 20000).map((i) => (i / 10000) ** 3 - 3 * (i / 10000) + 1)) * 1e6) / 1e6,
  hm10: () => {
    const v = (t) => 3 * t * t - 12 * t + 9
    const ts = []
    for (let i = 1; i < 10000; i++)
      if (Math.sign(v(i / 1000)) !== Math.sign(v((i - 1) / 1000)) && v((i - 1) / 1000) !== 0) ts.push(Math.round(i / 1000))
    return ts.reduce((a, b) => a + b, 0)
  },
  hm11: () => Math.round(integrate((x) => 3 * x * x - 2 * x, 0, 2) * 1e6) / 1e6,
  hm12: () => new Set(perms('AABBC'.split('')).map((p) => p.join(''))).size,
  hm13: () => {
    let c = 0
    for (const a of [1, 2, 3])
      for (const b of [1, 2, 3]) for (const d of [1, 2, 3]) for (const e of [1, 2, 3]) c += a && b && d && e ? 1 : 0
    return c
  },
  hm14: () => {
    // 공 5개(흰 0~2, 검 3~4)에서 2개 고르기를 모두 세기
    let all = 0
    let white = 0
    for (let a = 0; a < 5; a++)
      for (let b = a + 1; b < 5; b++) {
        all++
        if (a < 3 && b < 3) white++
      }
    return ['1/5', '3/10', '9/25', '2/5', '3/5'].indexOf(frac(white, all)) + 1
  },
  hm15: () => range(0, 100).find((m) => (64 - m) / 2 === 2),
  hm16: () => {
    const p = 20 / 100
    return Math.sqrt(100 * p * (1 - p))
  },
  hb1: () => 1 ** 3 + 2 * 1 - 5,
  hb2: () => 2 * 2 - -1,
  hb3: () => Math.hypot(4 - 1, 6 - 2),
  hb4: () => [1, 2, 3, 4].reduce((a, b) => a + b) + [0, 1, 1, 0].reduce((a, b) => a + b),
  ha1: () => range(-50, 50).filter((x) => x - 1 > 0 && Math.log2(x - 1) < 3).length,
  ha2: () => [1, 3].map((t) => Math.log(t) / Math.log(3)).reduce((a, b) => a + b, 0),
  ha3: () => {
    const ys = range(0, 70000).map((i) => 3 * Math.sin(2 * (i / 10000)) + 1)
    return Math.round(Math.max(...ys) + Math.min(...ys))
  },
  ha4: () => ['0', '1', '−1', '1/2', '−1/2'].indexOf(near(Math.sin((7 * Math.PI) / 6) + Math.cos((5 * Math.PI) / 3), 0) ? '0' : 'x') + 1,
  ha5: () => {
    const r = Math.cbrt(48 / 6)
    return Math.round((6 / r) * r ** 6)
  },
  ha6: () => range(1, 100).find((n) => (n * (n + 1)) / 2 === 55),
  ha7: () => 2 ** 6 - 1 - (2 ** 5 - 1),
  hc1: () => Math.round(((2 * 1e6 ** 2 + 3 * 1e6) / (1e6 ** 2 + 1)) * 1e4) / 1e4,
  hc2: () => Math.round(((1.0000001 ** 2 - 1) / 0.0000001) * 1e4) / 1e4,
  hc3: () => range(-50, 50).find((a) => 1 + a === 2 * 1 + 3),
  hc4: () => Math.round(deriv((x) => x ** 3, 2)),
  hc5: () =>
    // f′(1) = 0이고, x = 1 앞뒤로 f′의 부호가 실제로 바뀌어야 극값
    range(-50, 50).find((a) => {
      const fp = (x) => 3 * x * x + 2 * a * x - 9
      return near(fp(1), 0) && Math.sign(fp(0.99)) !== Math.sign(fp(1.01))
    }),
  hc6: () => range(-50, 50).find((k) => range(-300, 300).every((i) => 3 * (i / 50) ** 2 - 6 * (i / 50) + k >= -1e-12)),
  hc7: () => Math.round(integrate((x) => x * x, 0, 3) * 1e6) / 1e6,
  hc8: () => Math.round(integrate((x) => x ** 3 + 3 * x * x, -1, 1) * 1e6) / 1e6,
  hp1: () => new Set(perms('aaabb'.split('')).map((p) => p.join(''))).size,
  hp2: () => {
    let c = 0
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4 - a; b++) c++
    return c
  },
  hp3: () => ['0.1', '0.2', '0.3', '0.4', '0.9'].findIndex((x) => near(Number(x), 0.5 + 0.4 - 0.7)) + 1,
  hp4: () => (['1/12', '7/12', '1/7', '1/2', '5/12'].indexOf(frac(1, 12)) + 1 && frac(1 * 1, 3 * 4) === '1/12' ? 1 : NaN),
  hp5: () => ['1', '3/2', '5/3', '2', '7/3'].indexOf(frac(1 * 3 + 2 * 2 + 3 * 1, 6)) + 1,
  br1: () => 0 - 3,
  br2: () => ['−5', '2', '같다'].indexOf(Math.max(-5, 2) === 2 ? '2' : '') + 1,
  br3: () => 3 - 5,
  br4: () => range(-20, 20).find((x) => x + 3 === 7),
  br5: () => range(-20, 20).find((x) => x + 3 === 7),
  br6: () => range(-20, 20).find((x) => 4 * x === 20),
  br7: () => ['0.75', '0.34', '3.4', '0.43', '0.7'].findIndex((x) => near(Number(x), 3 / 4)) + 1,
  br8: () => 0.5 * 10,
  br9: () => ['0.25', '0.4', '2.5', '0.5', '0.2'].findIndex((x) => near(Number(x), 2 / 5)) + 1,
  ma1: () => Math.round(Math.log2(32) - Math.log(27) / Math.log(3)),
  ma2: () => range(-10, 10).find((x) => 3 ** (x + 1) === 81),
  ma3: () => {
    const t = Math.atan(2)
    return Math.round((Math.sin(t) + Math.cos(t)) / (Math.sin(t) - Math.cos(t)))
  },
  ma4: () => range(-50, 50).find((x) => 7 - x === 15 - 7),
  ma5: () => range(1, 50).find((x) => x * x === 2 * 18),
  ma6: () => range(1, 5).reduce((s, k) => s + k * k, 0),
  ma7: () => Math.round(9 + 25 - 2 * 3 * 5 * Math.cos(Math.PI / 3)),
  mc1: () => Math.round(deriv((x) => 2 * x ** 3 - 3 * x * x, 2)),
  mc2: () => Math.round(0 - deriv((x) => x ** 3 - x, 1) * 1),
  mc3: () => {
    const f = (x) => x ** 3 - 12 * x
    const fp = (x) => 3 * x * x - 12
    const c = range(-50, 50).filter((x) => fp(x) === 0 && fp(x - 0.01) > 0 && fp(x + 0.01) < 0)
    return f(c[0])
  },
  mc4: () => Math.round(deriv((t) => t * t - 4 * t, 1)),
  mc5: () => Math.round(integrate((x) => 2 * x + 1, 1, 3)),
  mc6: () => Math.round(3 * integrate((x) => Math.abs(x * x - 4), -2, 2)),
  mc7: () => Math.round(Math.sqrt(1e12 + 4e6) - 1e6),
  mp1: () => perms([0, 1, 2, 3, 4]).filter((p) => Math.abs(p.indexOf(0) - p.indexOf(1)) === 1).length,
  mp2: () => {
    let c = 0
    for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let d = b + 1; d < 6; d++) c++
    return c
  },
  mp3: () =>
    ['1/9', '5/36', '1/6', '7/36', '1/12'].indexOf(
      frac(
        range(1, 6)
          .flatMap((a) => range(1, 6).map((b) => a + b))
          .filter((s) => s === 8).length,
        36,
      ),
    ) + 1,
  mp4: () =>
    ['1/4', '1/16', '3/8', '1/2', '5/16'].indexOf(
      frac(
        range(0, 15).filter(
          (m) =>
            m
              .toString(2)
              .split('')
              .filter((b) => b === '1').length === 2,
        ).length,
        16,
      ),
    ) + 1,
  mp5: () => ['0.4772', '0.0228', '0.5228', '0.9772', '0.9544'].findIndex((x) => near(Number(x), 0.5 + 0.4772)) + 1,
  mp6: () => {
    let c = 0
    for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (6 - x - y >= 1) c++
    return c
  },
  s3: () => Math.sqrt(2 * 10 * 20),
  s4: () => (6 / 2) * 4,
  's-e2': () => (40 * 10) / 20,
  hk1: () => {
    let s = 0
    for (let a = 1; a <= 20000; a++) {
      let x = a
      for (let n = 1; n < 7; n++) x = x % 2 === 0 ? x / 2 : x + 5
      if (x === 1) s += a
    }
    return s
  },
  hk2: () => {
    const vals = new Set()
    for (let a1 = -300; a1 <= 300; a1++)
      for (let d = -100; d <= 100; d++) {
        const a = (n) => a1 + (n - 1) * d
        if (Math.abs(a(3)) !== Math.abs(a(8))) continue
        let s10 = 0
        for (let k = 1; k <= 10; k++) s10 += Math.abs(a(k))
        if (s10 !== 50 || a1 <= 0) continue
        let s15 = 0
        for (let k = 1; k <= 15; k++) s15 += Math.abs(a(k))
        vals.add(s15)
      }
    return [...vals].reduce((p, v) => p + v, 0)
  },
  hk3: () => {
    const cs = (c) => (Math.abs(c) < 1 - 1e-12 ? 2 : Math.abs(Math.abs(c) - 1) < 1e-12 ? 1 : 0)
    const ans = new Set()
    for (let a = 0.25; a <= 10; a += 0.25)
      for (let b = -10; b <= 10; b += 0.25) {
        const N = (t) => (t < 0 ? 0 : t === 0 ? cs(-b / a) : cs((t - b) / a) + cs((-t - b) / a))
        const crit = [0, Math.abs(b - a), Math.abs(b + a)].sort((x, y) => x - y)
        const pts = []
        for (const c of crit) pts.push(c, c + 0.01)
        for (let t = 0.005; t <= 25; t += 0.01) pts.push(t)
        const t3 = new Set(),
          t1 = new Set()
        for (const t of pts) {
          const v = N(t)
          if (v === 3) t3.add(Math.round(t * 1000))
          if (v === 1) t1.add(Math.round(t * 1000))
        }
        if (t3.size === 1 && t3.has(1000) && t1.size === 1 && t1.has(5000)) {
          let s = 0
          for (let k = 1; k <= 5; k++) s += k * N(k)
          ans.add(s)
        }
      }
    return ans.size === 1 ? [...ans][0] : 'not unique ' + [...ans]
  },
  hk4: () => {
    const f = (n) => {
      let c = 0
      for (let x = 1; x <= 2 ** n; x++) for (let y = 1; y <= n; y++) if (Math.log2(x) <= y + 1e-12 && y <= n - Math.log2(x) + 1e-12) c++
      return c
    }
    return f(10) + f(11)
  },
  hk5: () => {
    let s = 0
    for (let n = 1; n <= 20; n++) {
      let c = 0
      for (let x = 1; x <= 2 ** 21; x++) {
        const s1 = Math.sign(x - 2 ** n),
          s2 = Math.sign(x - 81)
        if (s1 * s2 < 0) c++
      }
      if (c >= 40 && c <= 100) s += n
    }
    return s
  },
  hk6: () => {
    const vals = new Set()
    for (let a1 = -2000; a1 <= 2000; a1++)
      for (let r = -30; r <= 30; r++) {
        if (a1 === 0 || r === 0) continue
        const a = (n) => a1 * r ** (n - 1)
        if (a(1) + a(2) + a(3) + a(4) !== 40) continue
        if (a(1) * a(2) >= 0) continue
        if (Math.abs(a(1)) + Math.abs(a(2)) + Math.abs(a(3)) + Math.abs(a(4)) >= 100) continue
        vals.add(a(6))
      }
    if (vals.size !== 1) return 'bad'
    return [-486, -162, 162, 486, 1458].indexOf([...vals][0]) + 1
  },
  hk7: () => {
    let s = 0
    for (let k = 1; k <= 3000; k++) {
      let x = 10
      for (let n = 1; n < 20; n++) x = x >= 0 ? x - 3 : x + k
      if (x === 10) s += k
    }
    return s
  },
  hk8: () => {
    const R = 7 / Math.sqrt(3)
    const res = new Set()
    for (let B = Math.PI / 2 + 1e-4; B < Math.PI; B += 1e-6) {
      const AC = Math.sqrt(25 + 9 - 30 * Math.cos(B))
      const r = AC / (2 * Math.sin(B))
      if (Math.abs(r - R) > 1e-5) continue
      const P = [5, 0],
        Q = [0, 0],
        Cc = [3 * Math.cos(B), 3 * Math.sin(B)]
      const ax = P[0],
        ay = P[1],
        bx = Q[0],
        by = Q[1],
        cx = Cc[0],
        cy = Cc[1]
      const dd = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
      const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / dd
      const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / dd
      const rr = Math.hypot(ax - ux, ay - uy)
      const side = (p) => (cx - ax) * (p[1] - ay) - (cy - ay) * (p[0] - ax)
      let prev = null
      const M = 200000
      for (let i = 0; i <= M; i++) {
        const th = (2 * Math.PI * i) / M
        const D = [ux + rr * Math.cos(th), uy + rr * Math.sin(th)]
        if (side(D) * side(Q) >= 0) {
          prev = null
          continue
        }
        const g = Math.hypot(D[0] - ax, D[1] - ay) + Math.hypot(D[0] - cx, D[1] - cy) - 8
        if (prev && prev[0] * g <= 0) {
          const pts = [P, Q, Cc, D]
          let ar = 0
          for (let j = 0; j < 4; j++) {
            const p1 = pts[j],
              p2 = pts[(j + 1) % 4]
            ar += p1[0] * p2[1] - p2[0] * p1[1]
          }
          res.add(Math.round((ar / 2) ** 2))
        }
        prev = [g]
      }
    }
    return res.size === 1 ? Math.round([...res][0]) : 'bad ' + [...res]
  },
  hk9: () => {
    const cnt = (F, lo, hi, h) => {
      let c = 0,
        prev = F(lo),
        pp = null
      for (let x = lo + h; x <= hi; x += h) {
        const v = F(x)
        if (v === 0) c++
        else if (prev !== 0 && prev * v < 0) c++
        else if (
          pp !== null &&
          prev !== 0 &&
          Math.abs(prev) < Math.abs(pp) &&
          Math.abs(prev) < Math.abs(v) &&
          Math.abs(prev) < 1e-5 &&
          prev * v > 0 &&
          prev * pp > 0
        )
          c++
        pp = prev
        prev = v
      }
      return c
    }
    const g = (t) => (t < 0 ? 0 : cnt((x) => (x ** 3 - 3 * x) ** 2 - t * t, -4, 4, 1 / 8192))
    const T = []
    for (let t = -3; t <= 3; t += 0.25) T.push(t)
    const e = 1e-3
    const G = T.map((t) => [g(t - e), g(t), g(t + e)])
    const found = []
    for (let a = -6; a <= 6; a++)
      for (let b = -6; b <= 6; b++)
        for (let c = -6; c <= 6; c++)
          for (let d = -6; d <= 6; d++) {
            const p = (t) => t ** 4 + a * t ** 3 + b * t ** 2 + c * t + d
            let ok = true
            for (let i = 0; i < T.length && ok; i++) {
              const t = T[i]
              const hl = G[i][0] * p(t - e),
                h0 = G[i][1] * p(t),
                hr = G[i][2] * p(t + e)
              if (Math.abs((h0 - hl) / e - (hr - h0) / e) > 0.5 || Math.abs(hr - hl) > 0.1) ok = false
            }
            if (ok) found.push(p)
          }
    if (found.length !== 1) return 'found ' + found.length
    const p = found[0]
    return g(1) * p(1) + g(3) * p(3)
  },
  hk10: () => {
    const sums = new Set()
    for (let a = -8; a <= 8; a++)
      for (let b = -10; b <= 10; b++) {
        const f = (x) => x ** 3 + a * x ** 2 + b * x,
          fp = (x) => 3 * x * x + 2 * a * x + b
        const h = (k) => {
          let c = 0,
            step = 1 / 32,
            prev = f(-16) - k
          for (let x = -16 + step; x <= 16; x += step) {
            const v = f(x) - k
            if (v === 0) {
              if (Math.abs(fp(x)) > 1e-9) c++
            } else if (prev !== 0 && prev * v < 0 && Math.abs(fp(x)) > 1e-3) c++
            prev = v
          }
          return c
        }
        const ks = []
        for (let k = -40; k <= 40; k += 0.5) ks.push(k)
        const hv = ks.map(h)
        const disc = new Set()
        for (let i = 0; i < ks.length - 1; i++)
          if (hv[i] !== hv[i + 1]) {
            disc.add(ks[i])
            disc.add(ks[i + 1])
          }
        const exact = [...disc].filter((k) => {
          const i = ks.indexOf(k)
          return h(k - 0.01) !== hv[i] || h(k + 0.01) !== hv[i]
        })
        const between = []
        for (let i = 0; i < ks.length - 1; i++)
          if (hv[i] !== hv[i + 1] && !exact.includes(ks[i]) && !exact.includes(ks[i + 1])) between.push(ks[i])
        if (exact.length === 2 && exact.includes(-4) && exact.includes(0) && between.length === 0) sums.add(f(2))
      }
    return [...sums].reduce((s, v) => s + v, 0)
  },
  hk11: () => {
    let c = 0
    for (let a = -10; a <= 10; a++)
      for (let b = -10; b <= 10; b++) {
        const fp = (x) => 4 * x ** 3 + 3 * a * x ** 2 + 2 * b * x
        let last = 0,
          hasMax = false
        for (let x = -20; x <= 20; x += 1 / 1024) {
          const s = Math.sign(fp(x))
          if (s === 0) continue
          if (last > 0 && s < 0) hasMax = true
          last = s
        }
        if (!hasMax) c++
      }
    return c
  },
  hk12: () => {
    const f = (x) => x ** 3 - 3 * x ** 2
    let c = 0
    for (let t = -130; t <= 10; t++) {
      const F = (x) => f(f(x)) - t
      let n = 0,
        h = 1 / 8192,
        prev = F(-3),
        pp = null
      for (let x = -3 + h; x <= 5; x += h) {
        const v = F(x)
        if (v === 0) n++
        else if (prev !== 0 && prev * v < 0) n++
        else if (
          pp !== null &&
          prev !== 0 &&
          prev * v > 0 &&
          prev * pp > 0 &&
          Math.abs(prev) < Math.abs(pp) &&
          Math.abs(prev) < Math.abs(v) &&
          Math.abs(prev) < 1e-4
        )
          n++
        pp = prev
        prev = v
      }
      if (n === 3) c++
    }
    return c
  },
  hk13: () => {
    const simp = (f, a, b, n = 6000) => {
      const h = (b - a) / n
      let s = f(a) + f(b)
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
      return (s * h) / 3
    }
    const G = (k) => {
      const v = (t) => t * t - 4 * t + k
      return simp((t) => Math.abs(v(t)), 0, 6) - simp(v, 0, 6) - 9
    }
    const sols = []
    let prev = G(-20)
    for (let k = -20 + 0.01; k <= 20; k += 0.01) {
      const g = G(k)
      if (prev * g <= 0) sols.push(k)
      prev = g
    }
    if (sols.length !== 1) return 'sols ' + sols
    let lo = sols[0] - 0.01,
      hi = sols[0]
    for (let i = 0; i < 50; i++) {
      const m = (lo + hi) / 2
      if (G(m) * G(lo) <= 0) hi = m
      else lo = m
    }
    const v = (t) => t * t - 4 * t + lo
    return Math.round(4 * simp((t) => Math.abs(v(t)), 0, 6) * 1000) / 1000
  },
  hk14: () => {
    const simp = (f, a, b, n = 4000) => {
      const h = (b - a) / n
      let s = f(a) + f(b)
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
      return (s * h) / 3
    }
    const bis = (F, lo, hi) => {
      for (let i = 0; i < 60; i++) {
        const m = (lo + hi) / 2
        if (F(lo) * F(m) <= 0) hi = m
        else lo = m
      }
      return (lo + hi) / 2
    }
    const areas = (m) => {
      const F = (x) => x ** 3 - 6 * x * x + 9 * x - m * x
      const roots = []
      const st = 1 / 1024
      let prev = F(st)
      for (let x = 2 * st; x < 10; x += st) {
        const v = F(x)
        if (v === 0) roots.push(x)
        else if (prev !== 0 && prev * v < 0) roots.push(bis(F, x - st, x))
        prev = v
      }
      return [simp((x) => Math.abs(F(x)), 0, roots[0]), simp((x) => Math.abs(F(x)), roots[0], roots[1])]
    }
    const D = (m) => {
      const [a, b] = areas(m)
      return a - b
    }
    const sols = []
    let prev = null
    for (let m = 0.05; m < 8.99; m += 0.05) {
      const g = D(m)
      if (prev !== null && prev * g <= 0) sols.push(m)
      prev = g
    }
    if (sols.length !== 1) return 'sols ' + sols
    const m = bis(D, sols[0] - 0.05, sols[0])
    const [s1, s2] = areas(m)
    return Math.round((m + s1 + s2) * 1000) / 1000
  },
  hk15: () => {
    const simp = (f, a, b, n = 600) => {
      const h = (b - a) / n
      let s = f(a) + f(b)
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
      return (s * h) / 3
    }
    const res = new Set()
    for (let i = -36; i <= 36; i++)
      for (let j = -36; j <= 36; j++) {
        const a = i / 6,
          b = j / 6
        const f = (x) => {
          const q = Math.floor(x / 3),
            u = x - 3 * q
          return a * u * u + b * u + 6 * q
        }
        if (Math.abs(f(3 - 1e-9) - f(3)) > 1e-6 || Math.abs(f(-1e-9) - f(0)) > 1e-6) continue
        let I = 0
        for (let s = 0; s < 3; s++) I += simp(f, s + 1e-12, s + 1 - 1e-12)
        if (Math.abs(I - 3) > 1e-6) continue
        let J = 0
        for (let s = 1; s < 10; s++) J += simp(f, s + 1e-12, s + 1 - 1e-12)
        res.add(Math.round(J * 1e5) / 1e5)
      }
    return res.size === 1 ? [...res][0] : 'bad ' + [...res]
  },
  hk16: () => {
    const simp = (f, a, b, n = 200) => {
      const h = (b - a) / n
      let s = f(a) + f(b)
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
      return (s * h) / 3
    }
    const f = (x) => Math.abs(x * x - 2 * x)
    const I = (t) => {
      let v = 0
      const pts = [t, ...[0, 2].filter((z) => z > t && z < t + 3), t + 3]
      for (let i = 0; i < pts.length - 1; i++) v += simp(f, pts[i], pts[i + 1])
      return v
    }
    let best = Infinity,
      bt = 0
    for (let t = -5; t <= 5; t += 0.001) {
      const v = I(t)
      if (v < best) {
        best = v
        bt = t
      }
    }
    let lo = bt - 0.002,
      hi = bt + 0.002
    for (let i = 0; i < 80; i++) {
      const m1 = lo + (hi - lo) / 3,
        m2 = hi - (hi - lo) / 3
      if (I(m1) < I(m2)) hi = m2
      else lo = m1
    }
    best = I((lo + hi) / 2)
    for (let q = 1; q <= 100; q++) {
      const p = Math.round(best * q)
      if (Math.abs(p / q - best) < 1e-7 && gcd(p, q) === 1) return p + q
    }
    return 'no frac ' + best
  },
  hk17: () => {
    let cnt = 0
    const f = (x) => x ** 3 - 3 * x,
      fp = (x) => 3 * x * x - 3
    for (let a = -3; a <= 3; a++)
      for (let b = -100; b <= 100; b++) {
        const H = (t) => fp(t) * (a - t) + f(t) - b
        let n = 0,
          h = 1 / 1024,
          prev = H(-20),
          pp = null
        for (let t = -20 + h; t <= 20; t += h) {
          const v = H(t)
          if (v === 0) n++
          else if (prev !== 0 && prev * v < 0) n++
          else if (
            pp !== null &&
            prev !== 0 &&
            prev * v > 0 &&
            prev * pp > 0 &&
            Math.abs(prev) < Math.abs(pp) &&
            Math.abs(prev) < Math.abs(v) &&
            Math.abs(prev) < 1e-6
          )
            n++
          pp = prev
          prev = v
        }
        if (n === 3) cnt++
      }
    return [60, 62, 64, 66, 68].indexOf(cnt) + 1
  },
  hk18: () => {
    const vals = []
    for (let a = -20; a <= 20; a++)
      for (let b = -20; b <= 20; b++) {
        const f = (x) => x ** 3 + a * x * x + b * x - 4
        const h = 1 / 1024
        const raw = []
        let prev = f(-40)
        for (let x = -40 + h; x <= 40; x += h) {
          const v = f(x)
          if (v === 0) raw.push([x, x])
          else if (prev !== 0 && prev * v < 0) raw.push([x - h, x])
          prev = v
        }
        const R = raw.map(([lo, hi]) => {
          if (lo === hi) return lo
          for (let i = 0; i < 60; i++) {
            const m = (lo + hi) / 2
            if (f(lo) * f(m) <= 0) hi = m
            else lo = m
          }
          return (lo + hi) / 2
        })
        const e = 1e-6
        const limExists = R.filter((r) => Math.abs(Math.abs(f(r + e)) / e - Math.abs(f(r - e)) / -e) < 1e-3)
        const nondiff = R.filter(
          (r) => Math.abs((Math.abs(f(r)) - Math.abs(f(r - e))) / e - (Math.abs(f(r + e)) - Math.abs(f(r))) / e) > 1e-3,
        )
        if (limExists.length >= 1 && nondiff.length === 1 && Math.abs(nondiff[0] - 1) < 1e-6) vals.push(f(3))
      }
    const s = vals.reduce((p, v) => p + v, 0)
    return [48, 50, 52, 54, 56].indexOf(s) + 1
  },
  hk19: () => {
    let c = 0
    for (let a = 0; a <= 11; a++)
      for (let b = 0; b <= 11; b++)
        for (let cc = 0; cc <= 11; cc++)
          for (let d = 0; d <= 11; d++) {
            if (a + b + cc + d !== 11) continue
            if ([a, b, cc, d].filter((v) => v % 2 === 1).length !== 3) continue
            if (d > 4) continue
            c++
          }
    return c
  },
  hk20: () => {
    let c = 0
    for (let i = 0; i < 3125; i++) {
      const f = [0]
      let t = i
      for (let k = 0; k < 5; k++) {
        f.push((t % 5) + 1)
        t = Math.floor(t / 5)
      }
      let ok = true
      for (let x = 1; x <= 5; x++) if (f[f[x]] !== f[x]) ok = false
      if (ok && f[1] !== 1 && f[5] !== 5) c++
    }
    return c
  },
  hk21: () => {
    const C = (n, r) => {
      let v = 1n
      for (let i = 0n; i < BigInt(r); i++) v = (v * (BigInt(n) - i)) / (i + 1n)
      return v
    }
    const L = 8n * C(8, 1) * C(8, 2) * C(8, 3) * C(8, 4)
    let all = 0n,
      two = 0n
    for (let coin = 0; coin < 8; coin++) {
      const k = [0, 1, 2].filter((j) => (coin >> j) & 1).length
      const sz = k + 1
      for (let m = 0; m < 256; m++) {
        let pc = 0,
          w = 0
        for (let j = 0; j < 8; j++)
          if ((m >> j) & 1) {
            pc++
            if (j < 4) w++
          }
        if (pc !== sz || w !== 2) continue
        const wt = L / (8n * C(8, sz))
        all += wt
        if (k === 2) two += wt
      }
    }
    const G = (a, b) => (b ? G(b, a % b) : a)
    const g = G(two, all)
    return Number(two / g + all / g)
  },
  hk22: () => {
    const xs = []
    for (let a = 1; a <= 7; a++) for (let b = a + 1; b <= 7; b++) for (let c = b + 1; c <= 7; c++) xs.push(c - a)
    const n = xs.length
    const Y = xs.map((x) => 5 * x + 1)
    const m = Y.reduce((s, v) => s + v, 0) / n
    const v = Y.reduce((s, y) => s + (y - m) ** 2, 0) / n
    return [32, 36, 40, 44, 48].indexOf(Math.round(v * 1e9) / 1e9) + 1
  },
  hk23: () => {
    const P = (z) => 0.5 * (1 + erfL(z / Math.SQRT2))
    function erfL(x) {
      const t = 1 / (1 + 0.3275911 * Math.abs(x))
      const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
      return x >= 0 ? y : -y
    }
    const sols = []
    for (let m = 0; m <= 20; m += 0.5)
      for (let s = 0.5; s <= 10; s += 0.25) {
        const g = (k) => P((k + 6 - m) / s) - P((k - m) / s)
        let best = -1,
          bk = null
        for (let k = -10; k <= 30; k += 0.05) {
          const v = g(k)
          if (v > best + 1e-12) {
            best = v
            bk = k
          }
        }
        if (Math.abs(bk - 7) > 0.03) continue
        if (Math.abs(g(4) + g(10) - 0.8664) > 2e-3) continue
        sols.push([m, s])
      }
    if (sols.length !== 1) return 'sols ' + JSON.stringify(sols)
    const [m, s] = sols[0]
    return Math.round(10000 * (P((4 - m) / s) + 1 - P((18 - m) / s)))
  },
  hk24: () => {
    const C = (n, r) => {
      let v = 1n
      for (let i = 0n; i < BigInt(r); i++) v = (v * (BigInt(n) - i)) / (i + 1n)
      return v
    }
    let s = 0
    for (let n = 1; n <= 60; n++)
      for (let a = 1; a <= 100; a++) {
        const coef = (e) => {
          let t = 0n
          for (let r = 0; r <= n; r++) if (2 * n - 3 * r === e) t += C(n, r) * BigInt(a) ** BigInt(r)
          return t
        }
        const c0 = coef(0),
          c3 = coef(3)
        if (c0 !== 0n && c0 === 2n * c3) s += n + a
      }
    return s
  },
  hk25: () => {
    let a = 1,
      s = 1
    for (let n = 1; n < 400; n++) {
      a = a > n ? a - n : a + n
      if (a === 1) s += n + 1
    }
    return s
  },
  hk26: () => {
    const cnt = (n) => {
      const F = (x) => Math.sin(x) - x / (n * Math.PI)
      const L = n * Math.PI + 1,
        N = 200000,
        h = (2 * L) / N
      let c = 0
      let prev = F(-L + h / 3)
      for (let i = 1; i <= N; i++) {
        const v = F(-L + i * h + h / 3)
        if (prev * v < 0) c++
        prev = v
      }
      return c
    }
    let s = 0
    for (let n = 1; n <= 20; n++) s += cnt(n)
    return s
  },
  hk27: () => {
    let c = 0
    for (let m = 1; m <= 64; m++)
      for (let n = 1; n <= 64; n++) {
        const v = Math.log2(m) - Math.log2(n) / 2
        if (Math.abs(v - Math.round(v)) < 1e-9) c++
      }
    return c
  },
  hk28: () => {
    let c = 0
    for (let k = 1; k <= 5000; k++) {
      let m = 0
      for (let x = -60; x <= 60; x++) if ((2 ** x - 8) * (3 ** x - k) <= 0) m++
      if (m === 2) c++
    }
    return c
  },
  hk29: () => {
    const ks = []
    let out
    for (let k = 0.5; k <= 5; k += 0.5) {
      const a = 4 * k,
        b = 5 * k,
        c = 6 * k
      const B = [0, 0],
        C = [a, 0]
      const Ax = (c * c - b * b + a * a) / (2 * a),
        A = [Ax, Math.sqrt(c * c - Ax * Ax)]
      const area = (a * A[1]) / 2
      if (Math.abs(area - 15 * Math.sqrt(7)) > 1e-9) continue
      ks.push(k)
      const D2 = (P, Q) => (P[0] - Q[0]) ** 2 + (P[1] - Q[1]) ** 2
      const ox = a / 2,
        oy = (D2(A, [0, 0]) - a * A[0]) / (2 * A[1]),
        R = Math.hypot(ox, oy)
      const side = (P) => Math.sign((C[0] - A[0]) * (P[1] - A[1]) - (C[1] - A[1]) * (P[0] - A[0]))
      let best = null
      const M = 400000
      for (let i = 0; i < M; i++) {
        const th = (2 * Math.PI * i) / M,
          D = [ox + R * Math.cos(th), oy + R * Math.sin(th)]
        if (side(D) === side(B)) continue
        const e = Math.abs(Math.sqrt(D2(A, D)) - Math.sqrt(D2(C, D)))
        if (!best || e < best.e) best = { e, D }
      }
      out = Math.round(D2(B, best.D) * 100) / 100
    }
    return ks.length === 1 ? out : 'k ' + ks
  },
  hk30: () => {
    const res = new Set()
    for (let a4 = -400; a4 <= 400; a4++)
      for (let d4 = -40; d4 <= 40; d4++) {
        const a1 = a4 / 4,
          d = d4 / 4
        const T = (n) => n * a1 + ((n * (n - 1)) / 2) * d
        if (Math.abs(T(6) - T(13)) > 1e-9) continue
        let mn = Infinity
        for (let n = 1; n <= 3000; n++) mn = Math.min(mn, T(n))
        if (T(3000) < T(2999) + 1e-12) continue
        if (Math.abs(mn + 90) > 1e-9) continue
        let s = 0
        for (let k = 1; k <= 30; k++) s += Math.abs(a1 + (k - 1) * d)
        res.add(s)
      }
    return res.size === 1 ? [...res][0] : 'multi ' + [...res]
  },
  hk31: () => {
    let c = 0
    for (let a = 1; a <= 364; a++)
      for (let r = 2; r <= 364; r++) {
        let s = a,
          t = a
        for (let m = 2; m <= 12 && s < 364; m++) {
          t *= r
          s += t
          if (s === 364) {
            c++
            break
          }
        }
      }
    return c
  },
  hk32: () => {
    const roots = (k) => {
      const F = (x) => 2 * Math.sin(x) ** 2 + 3 * Math.cos(x) - k
      const N = 12000,
        h = (2 * Math.PI) / N,
        r = []
      for (let i = 0; i < N; i++) {
        const x = i * h,
          v = F(x),
          w = F(x + h),
          u = F(x - h)
        if (Math.abs(v) < 1e-12) r.push(x)
        else if (v * w < 0) r.push(x + h / 2)
        else if (Math.abs(v) < 1e-6 && u * w > 0 && Math.abs(v) <= Math.abs(u) && Math.abs(v) <= Math.abs(w)) r.push(x)
      }
      const m = []
      for (const x of r) if (!m.length || x - m[m.length - 1] > 0.01) m.push(x)
      return m
    }
    const ks = []
    for (let j = -400; j <= 400; j++) {
      const k = j / 100
      if (roots(k).length === 3) ks.push(k)
    }
    if (roots(25 / 8).length === 3) ks.push(25 / 8)
    if (ks.length !== 1) return 'ks ' + ks
    const s = roots(ks[0]).reduce((p, v) => p + v, 0) / Math.PI
    const ch = [1, 4 / 3, 5 / 3, 2, 7 / 3]
    return ch.findIndex((v) => Math.abs(v - s) < 1e-3) + 1
  },
  hk33: () => {
    const res = new Set()
    const f = (x) => (x < 0 ? x + 3 : x * x)
    for (let a2 = -40; a2 <= 40; a2++)
      for (let b4 = -80; b4 <= 80; b4++) {
        const a = a2 / 2,
          b = b4 / 4,
          g = (x) => x * x + a * x + b
        const gf = (x) => g(f(x)),
          fg = (x) => f(g(x))
        const pts = [0]
        const D = a * a - 4 * b
        if (D >= 0) pts.push((-a - Math.sqrt(D)) / 2, (-a + Math.sqrt(D)) / 2)
        const cont = (F) => pts.every((p) => Math.abs(F(p - 1e-9) - F(p)) < 1e-6 && Math.abs(F(p + 1e-9) - F(p)) < 1e-6)
        if (!cont(gf) || !cont(fg)) continue
        if (Math.abs(fg(1) - gf(1)) > 1e-9) continue
        res.add(f(g(5)))
      }
    return res.size === 1 ? [...res][0] : 'multi ' + [...res]
  },
  hk34: () => {
    const vals = []
    for (let j = -400; j <= 400; j++) {
      const q = j / 20
      const f = (x) => x ** 3 + 2 * x * x + q * x,
        fp = (x) => deriv(f, x, 1e-6)
      const lead = (f(1e5) - 1e15) / 1e10
      if (Math.abs(lead - 2) > 1e-3 || Math.abs(f(1e-7) / 1e-7 - q) > 1e-3) continue
      const rs = []
      for (let x = -15; x <= 15; x += 0.01) {
        const v = f(x),
          w = f(x + 0.01)
        if (Math.abs(v) < 1e-12) rs.push(x)
        else if (v * w < 0) {
          let lo = x,
            hi = x + 0.01
          for (let it = 0; it < 60; it++) {
            const m = (lo + hi) / 2
            if (f(lo) * f(m) <= 0) hi = m
            else lo = m
          }
          rs.push(lo)
        }
      }
      const uniq = [...new Set(rs.map((x) => Math.round(x * 1e6)))].map((x) => x / 1e6)
      const good = uniq.filter((a) => Math.abs(fp(a) - 4) < 1e-4)
      if (good.length === 1) vals.push([q, f(2)])
    }
    return vals.length === 3 ? Math.round(vals.reduce((p, v) => p + v[1], 0)) : JSON.stringify(vals)
  },
  hk35: () => {
    const res = []
    const c3 = (x) => x ** 3 - 3 * x - 2
    for (let b4 = -24; b4 <= 24; b4++)
      for (let c4 = -24; c4 <= 24; c4++) {
        const b = b4 / 4,
          c = c4 / 4,
          p = (x) => x * x + b * x + c
        const g = (x) => p(x) * Math.abs(c3(x)),
          hh = (x) => Math.abs(p(x)) * c3(x)
        const pts = [-1, 2]
        const D = b * b - 4 * c
        if (D >= 0) pts.push((-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2)
        const e = 1e-6
        const diff = (F) => pts.every((x) => Math.abs((F(x + e) - F(x)) / e - (F(x) - F(x - e)) / e) < 1e-3)
        if (!diff(g) || !diff(hh) || !(p(0) < 0)) continue
        res.push(Math.round(deriv(g, 3) * 1000) / 1000)
      }
    return res.length === 1 ? res[0] : 'multi ' + res
  },
  hk36: () => {
    let best = -Infinity
    for (let j = -2000; j <= 2000; j++) {
      const a = j / 100,
        f = (x) => x ** 3 + a * x * x - a * a * x
      let ok = true,
        prev = f(-1)
      for (let i = 1; i <= 3000; i++) {
        const v = f(-1 + i * 0.001)
        if (!(v < prev)) {
          ok = false
          break
        }
        prev = v
      }
      if (ok && f(1) > best) best = f(1)
    }
    const ch = [-29, -19, -11, -5, 1]
    return ch.findIndex((v) => Math.abs(v - best) < 1e-9) + 1
  },
  hk37: () => {
    const f = (x) => x ** 3 - 6 * x * x + 9 * x
    const N = 500000,
      h = 5 / N
    let mx = f(0),
      s = 0,
      prevG = f(0)
    for (let i = 1; i <= N; i++) {
      mx = Math.max(mx, f(i * h))
      s += ((prevG + mx) / 2) * h
      prevG = mx
    }
    return Math.round(2 * s * 1000) / 1000
  },
  hk38: () => {
    const f = (x) => x ** 3 - 3 * x * x,
      fp = (x) => 3 * x * x - 6 * x
    const other = (t) => {
      const D = (x) => f(x) - (fp(t) * (x - t) + f(t))
      const roots = []
      for (let x = -60; x < 60; x += 0.05) {
        if (Math.abs(x - t) < 0.1 || Math.abs(x + 0.05 - t) < 0.1) continue
        let lo = x,
          hi = x + 0.05
        if (D(lo) * D(hi) > 0) continue
        for (let it = 0; it < 60; it++) {
          const m = (lo + hi) / 2
          if (D(lo) * D(m) <= 0) hi = m
          else lo = m
        }
        roots.push(lo)
      }
      return roots.length === 1 ? { s: roots[0], D } : null
    }
    const area = (t) => {
      const o = other(t)
      if (!o) return null
      const a = Math.min(o.s, t),
        b = Math.max(o.s, t)
      return { S: integrate((x) => Math.abs(o.D(x)), a, b, 600), s: o.s }
    }
    const out = []
    let prev = null
    for (let i = -300; i <= 300; i++) {
      const t = i / 30 + 0.0007
      if (Math.abs(t - 1) < 0.05) {
        prev = null
        continue
      }
      const A = area(t)
      if (A && prev && (A.S - 108) * (prev.A.S - 108) <= 0) {
        let lo = prev.t,
          hi = t
        for (let it = 0; it < 40; it++) {
          const m = (lo + hi) / 2
          if ((area(m).S - 108) * (area(lo).S - 108) <= 0) hi = m
          else lo = m
        }
        const B = area(lo).s
        if (B > 0) out.push(Math.round(f(B) * 1000) / 1000)
      }
      prev = A ? { t, A } : null
    }
    return out.length === 1 ? out[0] : 'multi ' + out
  },
  hk39: () => {
    const res = new Set()
    for (let a2 = -20; a2 <= 20; a2++)
      for (let b2 = 1; b2 <= 20; b2++) {
        const a = a2 / 2,
          b = b2 / 2,
          gp = (t) => (t - a) * (Math.abs(t) - b)
        let ch = 0,
          prev = gp(-50 + 0.00037)
        for (let x = -50 + 0.00037; x <= 50; x += 0.001) {
          const v = gp(x)
          if (v * prev < 0) ch++
          if (v !== 0) prev = v
        }
        if (ch !== 1) continue
        let mn = Infinity,
          G = 0
        const h = 0.001
        for (let x = 0; x <= 20; x += h) {
          G += ((gp(x) + gp(x + h)) / 2) * h
          mn = Math.min(mn, G)
        }
        G = 0
        for (let x = 0; x >= -20; x -= h) {
          G -= ((gp(x) + gp(x - h)) / 2) * h
          mn = Math.min(mn, G)
        }
        if (Math.abs(mn + 18) > 1e-3) continue
        res.add(Math.round(integrate(gp, 0, 6) * 1000) / 1000)
      }
    return res.size === 1 ? [...res][0] : 'multi ' + [...res]
  },
  hk40: () => {
    const ks = []
    for (let j = 1; j <= 1000; j++) {
      const k = j / 100
      const h = 0.001
      let xP = 0,
        xQ = 0,
        m = 0
      const ds = []
      for (let t = 0; t < 30; t += h) {
        xP += ((3 * t * t - 6 * t + (3 * (t + h) ** 2 - 6 * (t + h))) / 2) * h
        xQ += ((2 * t - k + (2 * (t + h) - k)) / 2) * h
        ds.push(xP - xQ)
      }
      for (let i = 1; i + 1 < ds.length; i++) {
        const [u, v, w] = [ds[i - 1], ds[i], ds[i + 1]]
        if (v * w < 0) m++
        else if (Math.abs(v) < 1e-5 && Math.abs(v) <= Math.abs(u) && Math.abs(v) <= Math.abs(w) && u * w > 0) m++
      }
      if (m === 1) ks.push(k)
    }
    if (ks.length !== 1) return 'ks ' + ks
    const k = ks[0]
    return Math.round(integrate((t) => Math.abs(3 * t * t - 6 * t), 0, 6) + integrate((t) => Math.abs(2 * t - k), 0, 6))
  },
  hk41: () => {
    const N = 7,
      rhs = (x) => 2 * x * x - 6 * x + 3
    const rows = []
    for (let k = 0; k < 12; k++) {
      const x = k - 4.5
      const r = []
      for (let n = 0; n <= N; n++) r.push((n - 3) * x ** n)
      r.push(rhs(x))
      rows.push(r)
    }
    const M = rows.map((r) => r.slice()),
      piv = []
    let row = 0
    for (let col = 0; col <= N && row < M.length; col++) {
      let b = row
      for (let i = row; i < M.length; i++) if (Math.abs(M[i][col]) > Math.abs(M[b][col])) b = i
      if (Math.abs(M[b][col]) < 1e-8) continue
      ;[M[row], M[b]] = [M[b], M[row]]
      for (let i = 0; i < M.length; i++)
        if (i !== row) {
          const q = M[i][col] / M[row][col]
          for (let j = col; j <= N + 1; j++) M[i][j] -= q * M[row][j]
        }
      piv.push(col)
      row++
    }
    for (let i = row; i < M.length; i++) if (Math.abs(M[i][N + 1]) > 1e-6) return 'inconsistent'
    const free = [...Array(N + 1).keys()].filter((c) => !piv.includes(c))
    if (free.length !== 1 || free[0] !== 3) return 'free ' + free
    const coef = (c) => {
      const a = Array(N + 1).fill(0)
      a[3] = c
      piv.forEach((col, i) => {
        a[col] = (M[i][N + 1] - M[i][3] * c) / M[i][col]
      })
      return a
    }
    const ev = (a, x) => a.reduce((s, v, n) => s + v * x ** n, 0),
      dv = (a, x) => a.reduce((s, v, n) => s + (n ? n * v * x ** (n - 1) : 0), 0)
    const noExt = (c) => {
      const a = coef(c)
      let pos = 0,
        neg = 0
      for (let x = -10; x <= 10; x += 0.001) {
        const v = dv(a, x)
        if (v > 1e-12) pos = 1
        else if (v < -1e-12) neg = 1
        if (pos && neg) return false
      }
      return true
    }
    const cs = []
    for (let j = -40; j <= 40; j++) if (noExt(j / 8)) cs.push(j / 8)
    if (!cs.length || cs[0] <= 0 || cs[cs.length - 1] !== 5) return 'bad set ' + cs
    for (let i = 1; i < cs.length; i++) if (Math.abs(cs[i] - cs[i - 1] - 1 / 8) > 1e-9) return 'not interval'
    const f2 = (c) => ev(coef(c), 2),
      slope = f2(1) - f2(0)
    if (slope <= 0) return 'f(2) not increasing in c'
    let lo = cs[0] - 1 / 8,
      hi = cs[0]
    for (let it = 0; it < 40; it++) {
      const m = (lo + hi) / 2
      if (noExt(m)) hi = m
      else lo = m
    }
    if (!noExt(hi)) return 'boundary open'
    const best = f2(hi)
    for (let q = 1; q <= 50; q++) for (let p = 1; p <= 50; p++) if (gcd(p, q) === 1 && Math.abs(p / q - best) < 1e-5) return p + q
    return 'nofrac ' + best
  },
  hk42: () => {
    let best = Infinity
    for (let t = -5; t <= 5; t += 0.01) {
      const s = 2 * t - 5
      const G = (a) => 2 * a * (t - a) + a * a - s
      const tp = []
      for (let a = -20; a <= 20; a += 0.01)
        if (G(a) * G(a + 0.01) <= 0) {
          let lo = a,
            hi = a + 0.01
          for (let i = 0; i < 60; i++) {
            const m = (lo + hi) / 2
            if (G(lo) * G(m) <= 0) hi = m
            else lo = m
          }
          tp.push(lo)
        }
      if (tp.length !== 2) return 'tp'
      const [p, q] = tp
      const L = (x) => Math.max(2 * p * (x - p) + p * p, 2 * q * (x - q) + q * q)
      const S = integrate((x) => x * x - L(x), p, q, 2000)
      best = Math.min(best, S)
    }
    const ch = [4, 14 / 3, 16 / 3, 6, 20 / 3]
    return ch.findIndex((v) => Math.abs(v - best) < 1e-4) + 1
  },
  hk43: () => {
    const out = []
    for (let a = 0; a <= 40; a++)
      for (let n = a; n <= a + 60; n++) {
        if (n === 0 || Math.abs(a / n - 1 / 3) > 1e-12 || Math.abs((n - a) / 60 - 1 / 2) > 1e-12) continue
        const st = []
        for (let i = 0; i < 40; i++) st.push([1, i < a ? 'A' : 'B'])
        for (let i = 0; i < 60; i++) st.push([2, i < n - a ? 'A' : 'B'])
        let same = 0,
          diff = 0
        for (let i = 0; i < 100; i++)
          for (let j = i + 1; j < 100; j++)
            if (st[i][1] === st[j][1]) {
              same++
              if (st[i][0] !== st[j][0]) diff++
            }
        const g = gcd(diff, same)
        out.push(diff / g + same / g)
      }
    return out.length === 1 ? out[0] : 'multi ' + out
  },
  hk44: () => {
    let c = 0
    const r = [1, 2, 3, 4, 5, 6]
    for (const a of r)
      for (const b of r)
        for (const d of r)
          for (const e of r)
            for (const f5 of r)
              for (const f6 of r) {
                const v = [a, b, d, e, f5, f6]
                if (v.some((x, i) => i && v[i - 1] > x)) continue
                if (!(v[2] <= 3 && 3 <= v[3])) continue
                if (v[0] + v[5] !== 7) continue
                c++
              }
    return c
  },
  hk45: () => {
    const C = (n, k) => {
      let r = 1
      for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
      return r
    }
    const ns = []
    for (let n = 1; n <= 60; n++) {
      let e1 = 0,
        e2 = 0
      for (let x = 0; x <= n; x++) {
        const p = C(n, x) * (1 / 3) ** x * (2 / 3) ** (n - x),
          y = 3 * x - (n - x)
        e1 += p * y
        e2 += p * y * y
      }
      if (Math.abs(e2 - 41) < 1e-9) ns.push([n, 9 * (e2 - e1 * e1)])
    }
    return ns.length === 1 ? Math.round(ns[0][1] * 1e6) / 1e6 : JSON.stringify(ns)
  },
  hk46: () => {
    const out = []
    for (let m4 = 0; m4 <= 160; m4++)
      for (let s4 = 1; s4 <= 80; s4++) {
        const m = m4 / 4,
          s = s4 / 4
        if (Math.abs(1 - phi((21 - m) / s) - phi((21 - 2 * m) / s)) > 1e-9) continue
        if (Math.abs(phi((20 - m) / s) - 0.9332) > 5e-4) continue
        out.push(phi((32 - 2 * m) / s) - phi((20 - 2 * m) / s))
      }
    if (out.length !== 1) return 'multi ' + out
    const ch = [0.6826, 0.7745, 0.8185, 0.9104, 0.9772]
    return ch.findIndex((v) => Math.abs(v - out[0]) < 5e-4) + 1
  },
  hk47: () => {
    const s = new Set(perms(['A', 'A', 'A', 'B', 'B', 'C', 'C']).map((p) => p.join('')))
    let c = 0
    for (const w of s) {
      if (w.includes('AA')) continue
      if (w[0] === w[6]) continue
      c++
    }
    return c
  },
  hk49: () => {
    let s = 0
    for (let a = 1; a <= 20000; a++) {
      let x = a
      for (let i = 1; i < 6; i++) x = x % 3 === 0 ? x / 3 : x + 2
      if (x === 1) s += a
    }
    return s
  },
  hk50: () => {
    let tot = 0
    for (let n = 2; n <= 20; n++) {
      const F = (x) => Math.sin(n * x) - Math.sin(x)
      const M = 400000,
        h = (2 * Math.PI) / M
      const v = []
      for (let i = 0; i <= M; i++) v.push(F(i * h))
      let c = 0
      for (let i = 0; i < M; i++) {
        if (Math.abs(v[i]) < 1e-12) {
          c++
          continue
        }
        if (i > 0 && Math.abs(v[i - 1]) >= 1e-12 && v[i - 1] * v[i] < 0) c++
        if (
          i > 0 &&
          i < M - 1 &&
          Math.abs(v[i]) < 1e-4 &&
          Math.abs(v[i]) <= Math.abs(v[i - 1]) &&
          Math.abs(v[i]) <= Math.abs(v[i + 1]) &&
          v[i - 1] * v[i] > 0 &&
          v[i + 1] * v[i] > 0
        )
          c++
      }
      tot += c
    }
    return tot
  },
  hk51: () => {
    let c = 0
    for (let x = -7; x <= 20; x++) for (let y = -20; y <= 20; y++) if (2 ** x - 8 <= y && y <= Math.log2(x + 8) + 1e-12) c++
    return c
  },
  hk52: () => {
    const solve = (F, k) => {
      let lo = -50,
        hi = 50
      for (let i = 0; i < 70; i++) {
        const m = (lo + hi) / 2
        if (F(m) < k) lo = m
        else hi = m
      }
      return lo
    }
    const pts = (k) => {
      const ax = solve((x) => 4 ** x + x, k),
        bx = solve((x) => (x > 0 ? Math.log(x) / Math.log(4) : -1e9) + x, k)
      return [
        [ax, -ax + k],
        [bx, -bx + k],
      ]
    }
    const D = (k) => {
      const [A, B] = pts(k)
      return Math.hypot(A[0] - B[0], A[1] - B[1]) - 3 * Math.SQRT2
    }
    const ks = []
    for (let k = 0.01; k < 30; k += 0.01)
      if (D(k) * D(k + 0.01) <= 0) {
        let lo = k,
          hi = k + 0.01
        for (let i = 0; i < 60; i++) {
          const m = (lo + hi) / 2
          if (D(lo) * D(m) <= 0) hi = m
          else lo = m
        }
        ks.push(lo)
      }
    if (ks.length !== 1) return 'ks ' + ks.length
    const [A, B] = pts(ks[0])
    const S = Math.abs(A[0] * B[1] - A[1] * B[0]) / 2
    return [6.5, 7, 7.5, 8, 8.5].findIndex((v) => Math.abs(v - S) < 1e-6) + 1
  },
  hk53: () => {
    const A = [3 * Math.cos((2 * Math.PI) / 3), 3 * Math.sin((2 * Math.PI) / 3)],
      C = [5, 0]
    const M = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2],
      L = Math.hypot(C[0] - A[0], C[1] - A[1])
    const u = [-(C[1] - A[1]) / L, (C[0] - A[0]) / L]
    const cands = [1, -1].map((s) => [M[0] + (s * u[0] * L * Math.sqrt(3)) / 2, M[1] + (s * u[1] * L * Math.sqrt(3)) / 2])
    const side = (P) => Math.sign((C[0] - A[0]) * (P[1] - A[1]) - (C[1] - A[1]) * (P[0] - A[0]))
    const D = cands.find((P) => side(P) !== side([0, 0]))
    const S = Math.abs(A[0] * D[1] - A[1] * D[0]) / 2
    return Math.round(S * S * 1e6) / 1e6
  },
  hk54: () => {
    const vals = new Set()
    for (let a1 = -40; a1 <= 40; a1++)
      for (let d = -20; d <= 20; d++) {
        const a = (n) => a1 + (n - 1) * d,
          b = (n) => a(n) * a(n + 1)
        let ok = true
        for (let n = 1; n <= 300; n++)
          if (n !== 6 && b(n) <= b(6)) {
            ok = false
            break
          }
        if (!ok) continue
        let s = 0
        for (let k = 1; k <= 12; k++) s += Math.abs(a(k))
        if (s !== 72) continue
        let t = 0
        for (let k = 1; k <= 10; k++) t += b(k)
        vals.add(t)
      }
    return vals.size === 1 ? [...vals][0] : 'multi ' + [...vals]
  },
  hk55: () => {
    const roots = (n, c) => {
      if (c === 0) return 1
      let r = 0,
        prev = (-40) ** n - c
      for (let x = -40 + 0.01; x <= 40; x += 0.01) {
        const v = x ** n - c
        if (v * prev < 0) r++
        prev = v
      }
      return r
    }
    let s = 0
    for (let k = 1; k <= 40; k++) {
      let t = 0
      for (let n = 2; n <= 20; n++) t += roots(n, (n - k) * (n - 2 * k))
      if (t === 23) s += k
    }
    return s
  },
  hk56: () => {
    const a = [0, 1]
    let s = 0
    for (let m = 2; m <= 1 << 14; m++) a[m] = m % 2 ? 2 * a[(m - 1) / 2] : a[m / 2] + 1
    for (let m = 1; m <= 1 << 14; m++) if (a[m] === 8) s += m
    return s
  },
  hk57: () => {
    const out = new Set()
    for (let a = -10; a <= 10; a++)
      for (let b = -10; b <= 10; b++)
        for (let c = -10; c <= 10; c++) {
          const f = (x) => x ** 3 + a * x * x + b * x + c,
            g = (x) => f(Math.abs(x))
          const h = 1e-6
          if (Math.abs((g(h) - g(0)) / h - (g(0) - g(-h)) / h) > 1e-4) continue
          let mn = Infinity
          for (let i = -2000; i <= 2000; i++) mn = Math.min(mn, g(i / 100))
          if (Math.abs(mn + 28) > 1e-3) continue
          const cnt = (k) => {
            let r = 0
            const xs = []
            for (let i = -7500; i <= 7500; i++) xs.push(g(i / 500 + 1e-7 * Math.PI) - k)
            for (let i = 1; i < xs.length; i++) {
              if (Math.abs(xs[i]) < 1e-9) r++
              else if (Math.abs(xs[i - 1]) >= 1e-9 && xs[i - 1] * xs[i] < 0) r++
            }
            return r
          }
          const ks = []
          for (let k = -40; k <= 40; k += 0.5) if (cnt(k) === 3) ks.push(k)
          if (ks.length === 1 && ks[0] === 4) out.add(g(-7))
        }
    return out.size === 1 ? [...out][0] : 'multi ' + [...out]
  },
  hk58: () => {
    const f = (x) => (x < 0 ? x + 3 : x * x - 2 * x - 3)
    let s = 0
    for (let i = -1000; i <= 1000; i++) {
      const a = i / 100,
        g = (x) => f(x) * f(x - a),
        e = 1e-9
      const jump = (x0) => Math.max(Math.abs(g(x0) - g(x0 - e)), Math.abs(g(x0 + e) - g(x0)))
      if (jump(0) < 1e-6 && jump(a) < 1e-6) s += g(4)
    }
    return Math.round(s)
  },
  hk59: () => {
    const out = new Set()
    for (let b = -10; b <= 10; b++)
      for (let c = -10; c <= 10; c++)
        for (let d = -10; d <= 10; d++) {
          const f = (x) => x ** 3 + b * x * x + c * x + d,
            g = (x) => x ** 4 / 4 + (b * x ** 3) / 3 + (c * x * x) / 2 + d * x
          const ext = []
          let prev = f(-11.5)
          for (let j = -459; j <= 460; j++) {
            const x = j / 40 + 1e-7 * Math.PI,
              v = f(x)
            if (prev * v < 0) {
              let lo = x - 0.025,
                hi = x
              for (let i = 0; i < 50; i++) {
                const m = (lo + hi) / 2
                if (f(lo) * f(m) <= 0) hi = m
                else lo = m
              }
              ext.push([lo, prev > 0 ? 'max' : 'min'])
            }
            prev = v
          }
          const mx = ext.filter((e) => e[1] === 'max'),
            mi = ext.filter((e) => e[1] === 'min')
          if (mx.length !== 1 || Math.abs(mx[0][0] - 1) > 1e-6 || mi.length !== 2) continue
          const m1 = g(mi[0][0]),
            m2 = g(mi[1][0])
          if (Math.abs(m1 - m2) > 1e-6 || Math.abs(g(1) - m1 - 4) > 1e-6) continue
          out.add(Math.round(4 * g(5) * 1e6) / 1e6)
        }
    return out.size === 1 ? [...out][0] : 'multi ' + [...out]
  },
  hk60: () => {
    const S = (t) => integrate((x) => Math.abs(x * x - 2 * x - t), 0, 3, 6000)
    let best = Infinity
    for (let i = -320; i <= 640; i++) best = Math.min(best, S(i / 160))
    for (let q = 1; q <= 100; q++) {
      const p = Math.round(best * q)
      if (Math.abs(p / q - best) < 1e-6 && gcd(p, q) === 1) return p + q
    }
    return best
  },
  hk61: () => {
    const out = new Set()
    const root = (F, lo, hi) => {
      const sl = Math.sign(F(lo))
      for (let k = 0; k < 70; k++) {
        const md = (lo + hi) / 2
        if (Math.sign(F(md)) === sl) lo = md
        else hi = md
      }
      return (lo + hi) / 2
    }
    for (let i = -48; i <= 48; i++)
      for (let j = -120; j <= 120; j++) {
        const p = i / 4,
          q = j / 4,
          f = (x) => x ** 3 + p * x * x + q * x
        const D = p * p - 3 * q
        if (D <= 0) continue
        const a = (-p - Math.sqrt(D)) / 3,
          b = (-p + Math.sqrt(D)) / 3,
          M = f(a),
          m = f(b),
          tol = 1e-9 * (1 + Math.abs(M) + Math.abs(m))
        const g = (t) => {
          const c = f(t)
          return Math.abs(c - M) < tol || Math.abs(c - m) < tol ? 2 : c > m && c < M ? 3 : 1
        }
        let hi = b + 1
        while (f(hi) <= M) hi += hi - a
        let lo = a - 1
        while (f(lo) >= m) lo -= b - lo
        const cand = [root((t) => f(t) - m, lo, a), a, b, root((t) => f(t) - M, b, hi)]
        const dis = cand.filter((t) => g(t) !== g(t - 1e-3) || g(t) !== g(t + 1e-3))
        const sum = dis.reduce((s, v) => s + v, 0)
        if (Math.abs(sum - 4) < 1e-6 && Math.abs(Math.max(...dis) - Math.min(...dis) - 6) < 1e-6) out.add(Math.round(4 * f(5) * 1e6) / 1e6)
      }
    return out.size === 1 ? [...out][0] : 'multi ' + [...out]
  },
  hk62: () => {
    const f = (x) => x ** 4 - 2 * x * x,
      fp = (x) => 4 * x ** 3 - 4 * x
    const h = (k) => {
      const as = new Set()
      for (const u of [1 / 3 + Math.sqrt(Math.max(0, 4 - 12 * k)) / 6, 1 / 3 - Math.sqrt(Math.max(0, 4 - 12 * k)) / 6]) {
        if (4 - 12 * k < -1e-12 || u < -1e-12) continue
        for (const a of [Math.sqrt(Math.max(u, 0)), -Math.sqrt(Math.max(u, 0))])
          if (Math.abs(f(a) - a * fp(a) - k) < 1e-9) as.add(a.toFixed(9))
      }
      const lines = new Set(
        [...as].map((a) => {
          const x = +a
          return (fp(x) + 0).toFixed(6) + ',' + (f(x) - x * fp(x) + 0).toFixed(6)
        }),
      )
      return lines.size
    }
    const dk = 1 / 3000
    let S = 0,
      T = 0
    for (let j = -9000; j <= 3000; j++) {
      const k = j * dk
      const v = h(k)
      if (v !== h(k - dk / 7) || v !== h(k + dk / 7)) {
        S += k
        T += v
      }
    }
    const ans = T - 3 * S
    return [4, 6, 8, 10, 12].findIndex((c) => Math.abs(c - ans) < 1e-6) + 1
  },
  hk63: () => {
    const out = []
    const dx = 0.002
    for (let a = -10; a <= 10; a++)
      for (let b = -10; b <= 10; b++) {
        const f = (x) => x ** 3 + a * x * x + b * x
        const xs = [],
          gs = []
        let mx = -Infinity
        for (let i = -6000; i <= 5000; i++) {
          const x = i * dx
          mx = Math.max(mx, f(x))
          xs.push(x)
          gs.push(mx)
        }
        let run = 0,
          best = 0,
          endIdx = -1
        for (let i = 1; i < gs.length; i++) {
          if (Math.abs(gs[i] - 4) < 1e-9 && Math.abs(gs[i - 1] - 4) < 1e-9) {
            run++
            if (run > best) {
              best = run
              endIdx = i
            }
          } else run = 0
        }
        if (best < 100) continue
        let r = endIdx
        while (r + 1 < gs.length && f(xs[r + 1]) <= 4) r++
        let lo = xs[r],
          hi = xs[r] + dx
        for (let i = 0; i < 60; i++) {
          const m = (lo + hi) / 2
          if (f(m) <= 4) lo = m
          else hi = m
        }
        const R = lo,
          e = 1e-6
        const G = (x) => (x <= R ? 4 : f(x)),
          H = (x) => G(x) * (x - 4)
        const jump = Math.abs((H(R + e) - H(R)) / e - (H(R) - H(R - e)) / e)
        if (jump < 1e-3) out.push(f(5))
      }
    return out.reduce((s, v) => s + v, 0)
  },
  hk64: () => {
    const out = new Set()
    const simp = (F, a, b) => ((b - a) / 6) * (F(a) + 4 * F((a + b) / 2) + F(b))
    for (let a = -10; a <= 10; a++)
      for (let b = -10; b <= 10; b++)
        for (let c = -10; c <= 10; c++) {
          if (a === 0) continue
          const G = (x) => x ** 4 + b * x ** 3 + c * x * x
          const f = (t) => (G(t + 1e-3) - 2 * G(t) + G(t - 1e-3)) / 1e-6
          if (Math.abs(f(a) - 8) > 1e-3) continue
          let ok = true
          for (const x of [-1.3, 0.7, 2.1, 3.4]) if (Math.abs(simp((t) => (x - t) * f(t), a, x) - G(x)) > 1e-3) ok = false
          if (ok) out.add(Math.round(f(3)))
        }
    return [...out].reduce((s, v) => s + v, 0)
  },
  hk65: () => {
    const out = new Set()
    const simpson = (f, a, b, n) => {
      const h = (b - a) / n
      let s = f(a) + f(b)
      for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
      return (s * h) / 3
    }
    for (let i = -500; i <= 800; i++) {
      const k = i / 100,
        f = (t) => t * t - 4 * Math.abs(t) + k,
        g = (x) => simpson(f, 0, x, 400)
      const ext = []
      let prev = f(-10)
      for (let x = -10 + 0.01; x <= 10; x += 0.01) {
        const v = f(x)
        if (prev * v < 0) {
          let lo = x - 0.01,
            hi = x
          for (let j = 0; j < 50; j++) {
            const m = (lo + hi) / 2
            if (f(lo) * f(m) <= 0) hi = m
            else lo = m
          }
          ext.push([lo, prev < 0 ? 'min' : 'max'])
        }
        prev = v
      }
      if (ext.length !== 4) continue
      if (ext.some((e) => e[1] === 'min' && Math.abs(g(e[0])) < 1e-6)) out.add(Math.round(3 * g(6) * 1e6) / 1e6)
    }
    return out.size === 1 ? [...out][0] : 'multi ' + [...out]
  },
  hk66: () => {
    const f = (x) => x ** 3 - 3 * x,
      fp = (x) => 3 * x * x - 3
    const other = (a) => {
      const T = (x) => f(x) - (fp(a) * (x - a) + f(a))
      let best = null
      for (let x = -60; x <= 60; x += 0.01) {
        if (Math.abs(x - a) < 0.05) continue
        if (T(x) * T(x + 0.01) <= 0) {
          let lo = x,
            hi = x + 0.01
          for (let i = 0; i < 60; i++) {
            const m = (lo + hi) / 2
            if (T(lo) * T(m) <= 0) hi = m
            else lo = m
          }
          best = lo
        }
      }
      return best
    }
    const area = (a) => {
      const b = other(a),
        c = other(b)
      return [Math.abs((b - a) * (f(c) - f(a)) - (f(b) - f(a)) * (c - a)) / 2, c]
    }
    let lo = 0.5,
      hi = 1.5
    for (let i = 0; i < 50; i++) {
      const m = (lo + hi) / 2
      if (area(m)[0] < 81) lo = m
      else hi = m
    }
    for (let a = 0.05; a < 3; a += 0.05)
      if (Math.abs(a - lo) > 0.06 && (area(a)[0] - 81) * (area(a + 0.05)[0] - 81) < 0) return 'second root'
    const cy = f(area(lo)[1])
    return [44, 48, 52, 56, 60].findIndex((v) => Math.abs(v - cy) < 1e-4) + 1
  },
  hk67: () => {
    let pE = 0,
      pEF = 0
    for (let m = 0; m < 64; m++) {
      let x = 0,
        y = 0,
        touch = false,
        w = 1
      for (let i = 0; i < 6; i++) {
        if ((m >> i) & 1) {
          x++
          w *= 1 / 3
        } else {
          y++
          w *= 2 / 3
        }
        if (x === y) touch = true
      }
      if (y > x) {
        pE += w
        if (!touch) pEF += w
      }
    }
    const r = pEF / pE
    for (let q = 1; q <= 999; q++) {
      const p = Math.round(r * q)
      if (Math.abs(p / q - r) < 1e-12) return p + q
    }
  },
  hk68: () => {
    let c = 0
    for (let a = 0; a <= 13; a++)
      for (let b = 0; b <= 13; b++)
        for (let cc = 0; cc <= 13; cc++)
          for (let d = 0; d <= 13; d++) {
            const e = 13 - a - b - cc - d
            if (e < 0) continue
            if (a < b && cc + d + e <= 8) c++
          }
    return c
  },
  hk69: () => {
    let hit = 0,
      hit4 = 0
    const go = (s, n, w) => {
      if (s >= 6) {
        if (s === 6) {
          hit += w
          if (n === 4) hit4 += w
        }
        return
      }
      go(s + 1, n + 1, (w * 4) / 6)
      go(s + 2, n + 1, (w * 2) / 6)
    }
    go(0, 0, 1)
    const r = hit4 / hit
    for (let q = 1; q <= 999; q++) {
      const p = Math.round(r * q)
      if (Math.abs(p / q - r) < 1e-12) return p + q
    }
  },
  hk70: () => {
    let s = 0
    for (let m = -50; m <= 80; m++) {
      const f = (x) => Math.exp(-((x - m) ** 2) / 32)
      if (!(f(8) < f(20))) continue
      if (phi((18 - m) / 4) - phi((10 - m) / 4) >= 0.6) s += m
    }
    return s
  },
  hk71: () => {
    const S = new Set(perms([1, 1, 2, 2, 3, 3, 4]).map((p) => p.join('')))
    let N = 0,
      M = 0
    for (const w of S) {
      let ok = true
      for (let i = 0; i < 6; i++) if (w[i] === w[i + 1]) ok = false
      if (!ok) continue
      N++
      if (w[3] === '4') M++
    }
    const g = gcd(M, N)
    return M / g + N / g
  },
  hk72: () => {
    let S1 = 0,
      S2 = 0
    for (let m = 0; m < 64; m++) {
      let p = 0,
        X = 0
      for (let i = 0; i < 6; i++) {
        p += (m >> i) & 1 ? 1 : -1
        if (p === 0) X++
      }
      S1 += X
      S2 += X * X
    }
    return Math.round(256 * (S2 / 64 - (S1 / 64) ** 2))
  },
  hk73: () => {
    let a = 1,
      s = 1
    for (let n = 1; n < 100; n++) {
      a = a > n ? a - n : a + n
      if (a === 1) s += n + 1
    }
    return s
  },
  hk74: () => {
    const opts = [20, 24, 26, 28, 30]
    const found = []
    const sum = (r, ab) => {
      let t = 0
      for (let k = 0; k < 6; k++) t += ab ? Math.abs(r) ** k : r ** k
      return t
    }
    for (const sg of [1, -1]) {
      const G = (r) => (sg * sum(r, 1)) / sum(r, 0) - 3
      let prev = G(-60)
      for (let i = 1; i <= 600000; i++) {
        const r = -60 + i * 1e-4
        if (Math.abs(r + 1) < 1e-3 || r >= -1e-9) {
          prev = NaN
          continue
        }
        const v = G(r)
        if (prev * v <= 0) {
          let lo = r - 1e-4,
            hi = r
          for (let j = 0; j < 80; j++) {
            const m = (lo + hi) / 2
            if (G(lo) * G(m) <= 0) hi = m
            else lo = m
          }
          const rr = (lo + hi) / 2,
            a1 = 21 / sum(rr, 0)
          if (Math.sign(a1) === sg && Math.abs(sum(rr, 1) * Math.abs(a1) - 63) < 1e-6 && a1 * rr < a1 * rr ** 4)
            found.push(a1 + a1 * rr ** 3)
        }
        prev = v
      }
    }
    const u = [...new Set(found.map((x) => Math.round(x * 1e6) / 1e6))]
    return u.length === 1 ? opts.findIndex((o) => Math.abs(o - u[0]) < 1e-6) + 1 : 'multi ' + u
  },
  hk75: () => {
    const cnt = (F, a, b, M) => {
      const tol = 1e-8
      let c = 0,
        last = 0,
        inCl = false
      for (let i = 0; i <= M; i++) {
        const v = F(a + ((b - a) * i) / M)
        if (Math.abs(v) < tol) {
          if (!inCl) {
            c++
            inCl = true
          }
          continue
        }
        const s = Math.sign(v)
        if (inCl) {
          inCl = false
          last = s
          continue
        }
        if (last !== 0 && s !== last) c++
        last = s
      }
      return c
    }
    let tot = 0
    for (let k = 1; k <= 40; k++) tot += cnt((x) => 16 * Math.cos(x) ** 2 + 16 * Math.abs(Math.sin(x)) - k, 0, 2 * Math.PI, 400000)
    return tot
  },
  hk76: () => {
    let tot = 0
    for (let n = 1; n <= 20; n++)
      for (let x = 1; x <= 200; x++) {
        const L = Math.log2(x),
          M = Math.log2(x + n) / 2,
          R = Math.log2(2 * x)
        if (L <= M + 1e-12 && M <= R + 1e-12) tot++
      }
    return tot
  },
  hk77: () => {
    const opts = [27, 30, 33, 36, 39]
    const G = (t) => Math.abs(2 ** t - 2 ** (4 - t)) - 15
    const ts = []
    for (let i = 1; i < 200000; i++) {
      const t0 = i * 1e-4,
        t1 = t0 + 1e-4
      if (G(t0) * G(t1) <= 0) {
        let lo = t0,
          hi = t1
        for (let j = 0; j < 80; j++) {
          const m = (lo + hi) / 2
          if (G(lo) * G(m) <= 0) hi = m
          else lo = m
        }
        ts.push(lo)
      }
    }
    const tu = [...new Set(ts.map((x) => Math.round(x * 1e6) / 1e6))]
    ts.length = 0
    ts.push(...tu)
    if (ts.length !== 1) return 'multi ' + ts
    const t = ts[0],
      P = [t, 2 ** t],
      Q = [t, 2 ** (4 - t)],
      R = [4 - Math.log2(P[1]), P[1]]
    const area = Math.abs((Q[0] - P[0]) * (R[1] - P[1]) - (R[0] - P[0]) * (Q[1] - P[1])) / 2
    return opts.findIndex((o) => Math.abs(o - area) < 1e-6) + 1
  },
  hk78: () => {
    const a = [0]
    for (let n = 1; n <= 10; n++) {
      let s = n ** 4
      for (let k = 1; k < n; k++) s -= (n - k + 1) * a[k]
      a.push(s)
    }
    return a[1] + a[10]
  },
  hk79: () => {
    const s = 13,
      bc = (s * s - 49) / 3,
      d = Math.sqrt(s * s - 4 * bc),
      c = (s - d) / 2,
      b = (s + d) / 2
    const A = [0, 0],
      B = [c, 0],
      C = [b * Math.cos(Math.PI / 3), b * Math.sin(Math.PI / 3)]
    if (Math.abs(Math.hypot(B[0] - C[0], B[1] - C[1]) - 7) > 1e-9) return 'bad'
    const D2 = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]))
    const sq = (p) => p[0] ** 2 + p[1] ** 2
    const O = [
      (sq(A) * (B[1] - C[1]) + sq(B) * (C[1] - A[1]) + sq(C) * (A[1] - B[1])) / D2,
      (sq(A) * (C[0] - B[0]) + sq(B) * (A[0] - C[0]) + sq(C) * (B[0] - A[0])) / D2,
    ]
    const R = Math.hypot(O[0], O[1])
    const Mx = (B[0] + C[0]) / 2,
      My = (B[1] + C[1]) / 2
    let ux = Mx - O[0],
      uy = My - O[1]
    const L = Math.hypot(ux, uy)
    ux /= L
    uy /= L
    let Dp = [O[0] + R * ux, O[1] + R * uy]
    const side = (p) => (C[0] - B[0]) * (p[1] - B[1]) - (C[1] - B[1]) * (p[0] - B[0])
    if (side(Dp) * side(A) > 0) Dp = [O[0] - R * ux, O[1] - R * uy]
    return Math.round(3 * sq(Dp) * 1e6) / 1e6
  },
  hk80: () => {
    const f = (x) => x ** 3 - 3 * x * x
    const M = 1600000,
      a = -3,
      b = 5,
      V = new Float64Array(M + 1)
    for (let i = 0; i <= M; i++) V[i] = f(f(a + ((b - a) * i) / M))
    const cnt = (k) => {
      const tol = 1e-6
      let c = 0,
        last = 0,
        inCl = false
      for (let i = 0; i <= M; i++) {
        const v = V[i] - k
        if (Math.abs(v) < tol) {
          if (!inCl) {
            c++
            inCl = true
          }
          continue
        }
        const s = v > 0 ? 1 : -1
        if (inCl) {
          inCl = false
          last = s
          continue
        }
        if (last !== 0 && s !== last) c++
        last = s
      }
      return c
    }
    let n = 0
    for (let k = -300; k <= 100; k++) if (cnt(k) === 3) n++
    return n
  },
  hk81: () => {
    const out = []
    for (const v of [25, -25]) {
      const u = (5 + v) / 3
      const f = (x) => (x - 1) * (x * x + u * x + v),
        df = (x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6
      const roots = []
      for (let i = 0; i < 400000; i++) {
        const x0 = -40 + i * 2e-4,
          x1 = x0 + 2e-4
        if (f(x0) * f(x1) < 0) {
          let lo = x0,
            hi = x1
          for (let j = 0; j < 60; j++) {
            const m = (lo + hi) / 2
            if (f(lo) * f(m) <= 0) hi = m
            else lo = m
          }
          roots.push(lo)
        }
      }
      const nondiff = roots.filter((r) => Math.abs(df(r)) > 1e-6)
      const g = (x) => Math.abs(f(x))
      const locmax = g(-1) > g(-1.001) && g(-1) > g(-0.999)
      if (nondiff.length === 1 && Math.abs(nondiff[0] - 1) < 1e-6 && locmax && Math.abs(g(0) - 25) < 1e-9) out.push(g(3))
    }
    return out.length === 1 ? Math.round(out[0]) : 'multi ' + out
  },
  hk82: () => {
    let c = 0
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 10; b++) {
        let ok = true
        for (let i = 1; i < 2000; i++) {
          const x = 1 + (2 * i) / 2000
          if (3 * x * x - 6 * a * x + 3 * b > 1e-12) {
            ok = false
            break
          }
        }
        if (ok) c++
      }
    return c
  },
  hk83: () => {
    const opts = [12, 14, 16, 18, 20]
    const vals = new Set()
    for (let i = -80; i <= 80; i++)
      for (let j = -80; j <= 80; j++)
        for (let k = -80; k <= 80; k++) {
          const p = i / 4,
            q = j / 4,
            r = k / 4
          if (r !== 0 || q === 0) continue
          const D = p * p - 3 * q
          if (D < 0) continue
          const f = (x) => x ** 3 + p * x * x + q * x + r
          let ok = false
          for (const a of [(-p - Math.sqrt(D)) / 3, (-p + Math.sqrt(D)) / 3])
            if (Math.abs(f(a)) < 1e-9 && Math.abs((f(a + 1e-4) / 1e-8 + f(a - 1e-4) / 1e-8) / 2 - 3) < 1e-3) ok = true
          if (ok) vals.add(f(5))
        }
    const u = [...vals]
    return u.length === 1 ? opts.indexOf(u[0]) + 1 : 'multi ' + u
  },
  hk84: () => {
    const xP = (t) => t ** 3 - 6 * t * t + 9 * t
    const meets = (a) => {
      const ts = []
      const G = (t) => xP(t) - a * t
      for (let i = 1; i < 20000; i++) {
        const t0 = i * 1e-3 + 1e-7,
          t1 = t0 + 1e-3
        if (G(t0) * G(t1) <= 0) {
          let lo = t0,
            hi = t1
          for (let j = 0; j < 60; j++) {
            const m = (lo + hi) / 2
            if (G(lo) * G(m) <= 0) hi = m
            else lo = m
          }
          ts.push(lo)
        }
      }
      return [...new Set(ts.map((x) => Math.round(x * 1e7) / 1e7))]
    }
    const sols = []
    for (let i = 1; i < 900; i++) {
      const a0 = i * 1e-2 + 1e-6,
        a1 = a0 + 1e-2
      const H = (a) => {
        const m = meets(a)
        return m.length === 2 ? m[1] - 2 * m[0] : NaN
      }
      const h0 = H(a0),
        h1 = H(a1)
      if (h0 * h1 <= 0) {
        let lo = a0,
          hi = a1
        for (let j = 0; j < 50; j++) {
          const m = (lo + hi) / 2
          if (H(lo) * H(m) <= 0) hi = m
          else lo = m
        }
        sols.push(lo)
        break
      }
    }
    if (sols.length !== 1) return 'none'
    const T = meets(sols[0])[1]
    let d = 0,
      N = 400000
    for (let i = 0; i < N; i++) d += Math.abs(xP(((i + 1) * T) / N) - xP((i * T) / N))
    return Math.round(d * 1e3) / 1e3
  },
  hk85: () => {
    const fd = (g, x) => (g(x + 1e-6) - g(x - 1e-6)) / 2e-6
    const base = (a, b) => (x) => x ** 3 + a * x * x + b * x
    const resid = (a, b) => {
      const g = base(a, b)
      const dl = (g(2 - 1e-7) - g(2 - 2e-7)) / 1e-7,
        dr = (g(2e-7) - g(1e-7)) / 1e-7
      return [dl - dr, fd(g, 1)]
    }
    const [r0, s0] = resid(0, 0),
      [r1, s1] = resid(1, 0),
      [r2, s2] = resid(0, 1)
    const A = [
        [r1 - r0, r2 - r0],
        [s1 - s0, s2 - s0],
      ],
      rhs = [-r0, -s0],
      det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
    const a = (rhs[0] * A[1][1] - A[0][1] * rhs[1]) / det,
      b = (A[0][0] * rhs[1] - rhs[0] * A[1][0]) / det
    const g = base(a, b),
      k = g(2) - g(0)
    const f = (x) => {
      const j = Math.floor(x / 2)
      return g(x - 2 * j) + j * k
    }
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    let s = 0
    const n = 1000
    for (let i = 0; i < n; i++) {
      const lo = (10 * i) / n,
        hi = (10 * (i + 1)) / n
      for (const [z, w] of gl) s += ((w * (hi - lo)) / 2) * f((lo + hi) / 2 + (z * (hi - lo)) / 2)
    }
    return Math.round(s * 1e6) / 1e6
  },
  hk86: () => {
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    const I = (h, lo, hi, n = 400) => {
      let s = 0
      for (let i = 0; i < n; i++) {
        const p = lo + ((hi - lo) * i) / n,
          q = lo + ((hi - lo) * (i + 1)) / n
        for (const [z, w] of gl) s += ((w * (q - p)) / 2) * h((p + q) / 2 + (z * (q - p)) / 2)
      }
      return s
    }
    const fam = (C) => (x) => -6 * x * x + 12 * x + C
    for (const C of [-6, 0, 5]) {
      const f = fam(C)
      for (const x of [-2, -0.5, 0.7, 1.9, 3.3]) {
        const lhs = I((t) => (x - 2 * t) * f(t), 0, x),
          rhs = x ** 4 - 2 * x ** 3
        if (Math.abs(lhs - rhs) > 1e-8) return 'identity fails C=' + C
      }
    }
    const f = fam(-6)
    if (f(0) !== -6) return 'f0'
    for (let x = -3; x <= 5; x += 0.01) if (f(x) > f(1) + 1e-12) return 'notmax'
    return Math.round(I((x) => Math.abs(f(x)), 0, 1) + I((x) => Math.abs(f(x)), 1, 3))
  },
  hk87: () => {
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    const I = (h) => {
      let s = 0
      const n = 200
      for (let i = 0; i < n; i++) {
        const p = -1 + (2 * i) / n,
          q = -1 + (2 * (i + 1)) / n
        for (const [z, w] of gl) s += ((w * (q - p)) / 2) * h((p + q) / 2 + (z * (q - p)) / 2)
      }
      return s
    }
    const B = [(x) => x * x, (x) => x, () => 1]
    const G = B.map((u) => B.map((v) => I((x) => u(x) * v(x)))),
      y = B.map((u) => I((x) => -(x ** 3) * u(x)))
    const M = G.map((r, i) => [...r, y[i]])
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++)
        if (j !== i) {
          const t = M[j][i] / M[i][i]
          for (let k = 0; k < 4; k++) M[j][k] -= t * M[i][k]
        }
    }
    const c = M.map((r, i) => r[3] / r[i])
    const val = I((x) => (x ** 3 + c[0] * x * x + c[1] * x + c[2]) ** 2)
    for (let q = 1; q < 100000; q++) {
      const p = Math.round(val * q)
      if (Math.abs(val * q - p) < 1e-8) return p + q
    }
    return 'nofrac'
  },
  hk88: () => {
    const opts = [6, 7, 8, 9, 10]
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    const I = (h, lo, hi) => {
      let s = 0
      const n = 400
      for (let i = 0; i < n; i++) {
        const p = lo + ((hi - lo) * i) / n,
          q = lo + ((hi - lo) * (i + 1)) / n
        for (const [z, w] of gl) s += ((w * (q - p)) / 2) * h((p + q) / 2 + (z * (q - p)) / 2)
      }
      return s
    }
    const areas = (m) => {
      const h = (x) => x ** 3 - 6 * x * x + 9 * x - m * x
      const r = [0]
      for (let i = 0; i < 10000; i++) {
        const x0 = 1e-3 * i + 3.7e-7,
          x1 = x0 + 1e-3
        if (h(x0) * h(x1) <= 0) {
          let lo = x0,
            hi = x1
          for (let j = 0; j < 60; j++) {
            const md = (lo + hi) / 2
            if (h(lo) * h(md) <= 0) hi = md
            else lo = md
          }
          r.push(lo)
        }
      }
      if (r.length !== 3) return null
      return [Math.abs(I(h, r[0], r[1])), Math.abs(I(h, r[1], r[2]))]
    }
    const sols = []
    let prev = null
    for (let i = 1; i < 900; i++) {
      const m = i / 100
      const A = areas(m)
      const d = A ? A[0] - A[1] : null
      if (prev !== null && d !== null && prev * d <= 0) sols.push(m)
      prev = d
    }
    if (sols.length !== 1) return 'sols ' + sols
    let lo = sols[0] - 0.01,
      hi = sols[0]
    for (let j = 0; j < 40; j++) {
      const m = (lo + hi) / 2,
        A = areas(m),
        B0 = areas(lo)
      if ((A[0] - A[1]) * (B0[0] - B0[1]) <= 0) hi = m
      else lo = m
    }
    const A = areas((lo + hi) / 2)
    return opts.findIndex((o) => Math.abs(o - (A[0] + A[1])) < 1e-6) + 1
  },
  hk89: () => {
    const A = ['W', 'W', 'W', 'K', 'K']
    let num = 0,
      den = 0
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++) {
        const B = ['W', 'W', 'K', 'K', A[i], A[j]]
        for (let p = 0; p < 6; p++)
          for (let q = p + 1; q < 6; q++) {
            if (B[p] === 'W' && B[q] === 'W') {
              den++
              if (A[i] === 'W' && A[j] === 'W') num++
            }
          }
      }
    const g = gcd(num, den)
    return num / g + den / g
  },
  hk90: () => {
    let c = 0
    for (let i = 0; i < 3125; i++) {
      const f = [0]
      let t = i
      for (let k = 0; k < 5; k++) {
        f.push((t % 5) + 1)
        t = Math.floor(t / 5)
      }
      if ([1, 2, 3, 4, 5].every((x) => f[f[x]] === f[x]) && f[1] < f[2] && f[2] < f[3]) c++
    }
    return [27, 30, 33, 36, 39].indexOf(c) + 1
  },
  hk91: () => {
    let s = 0
    for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) for (let c = 1; c <= 4; c++) s += Math.max(a, b, c) - Math.min(a, b, c)
    const g = gcd(s, 64)
    return s / g + 64 / g
  },
  hk92: () => {
    let den = 0,
      num = 0
    for (const p of perms([2, 3, 4, 5, 6])) {
      const c = [1, ...p]
      const adj = (x, y) => {
        const i = c.indexOf(x),
          j = c.indexOf(y)
        return (i - j + 6) % 6 === 1 || (j - i + 6) % 6 === 1
      }
      if (!adj(1, 2)) {
        den++
        if (!adj(3, 4) && !adj(5, 6)) num++
      }
    }
    const g = gcd(num, den)
    const v = num / g + '/' + den / g
    return ['1/3', '7/18', '5/12', '4/9', '1/2'].indexOf(v) + 1
  },
  hk93: () => {
    let s = 0
    for (let n = 1; n <= 25; n++) {
      const F = (x) => 2 ** x - n - Math.log2(x + n)
      const rs = []
      const a = -n + 1e-9,
        h = 1e-4,
        M = Math.ceil((12 - a) / h)
      let x0 = a,
        f0 = F(a)
      for (let i = 1; i <= M; i++) {
        const x1 = a + i * h,
          f1 = F(x1)
        if (f0 === 0) rs.push(x0)
        else if (f0 * f1 < 0) {
          let lo = x0,
            hi = x1
          for (let j = 0; j < 60; j++) {
            const m = (lo + hi) / 2
            if (F(lo) * F(m) <= 0) hi = m
            else lo = m
          }
          rs.push((lo + hi) / 2)
        }
        x0 = x1
        f0 = f1
      }
      const u = [...new Set(rs.map((r) => Math.round(r * 1e7) / 1e7))]
      if (u.length !== 2) return 'roots ' + n + ':' + u
      const b = Math.max(...u)
      let c = 0
      for (let m = 1; m <= b + 1e-7; m++) c++
      s += c
    }
    return s
  },
  hk94: () => {
    const f = (x) => Math.abs(Math.sin(2 * x)) - Math.cos(x)
    const A = 0,
      B = 4 * Math.PI,
      M = 400000,
      h = (B - A) / M
    const X = (i) => A + i * h
    const rs = []
    for (let i = 0; i < M; i++) {
      const a = X(i),
        b = X(i + 1),
        fa = f(a),
        fb = f(b)
      if (Math.abs(fa) < 1e-12) {
        rs.push(a)
        continue
      }
      if (fa * fb < 0) {
        let lo = a,
          hi = b
        for (let j = 0; j < 60; j++) {
          const m = (lo + hi) / 2
          if (f(lo) * f(m) <= 0) hi = m
          else lo = m
        }
        rs.push(lo)
      } else if (i > 0) {
        const fp = f(X(i - 1))
        if (Math.abs(fa) <= Math.abs(fp) && Math.abs(fa) <= Math.abs(fb) && fa * fp > 0 && fa * fb > 0) {
          let lo = X(i - 1),
            hi = b
          for (let j = 0; j < 100; j++) {
            const m1 = lo + (hi - lo) / 3,
              m2 = hi - (hi - lo) / 3
            if (Math.abs(f(m1)) < Math.abs(f(m2))) hi = m2
            else lo = m1
          }
          if (Math.abs(f((lo + hi) / 2)) < 1e-10) rs.push((lo + hi) / 2)
        }
      }
    }
    const u = [...new Set(rs.filter((r) => r < B - 1e-9).map((r) => Math.round(r * 1e6) / 1e6))]
    const k = u.reduce((p, q) => p + q, 0) / Math.PI
    return Math.abs(k - Math.round(k)) < 1e-4 ? u.length + Math.round(k) : 'k ' + k
  },
  hk95: () => {
    const opts = [32 / 5, 34 / 5, 36 / 5, 38 / 5, 8]
    const B = [6, 0],
      C = [4 * Math.cos((2 * Math.PI) / 3), 4 * Math.sin((2 * Math.PI) / 3)],
      u = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)]
    const dx = C[0] - B[0],
      dy = C[1] - B[1],
      det = u[0] * -dy - u[1] * -dx
    const sD = (B[0] * -dy - B[1] * -dx) / det
    const D2 = 2 * (B[0] * C[1] - C[0] * B[1])
    const sq = (p) => p[0] ** 2 + p[1] ** 2
    const O = [(sq(B) * C[1] - sq(C) * B[1]) / D2, (sq(C) * B[0] - sq(B) * C[0]) / D2]
    const sE = 2 * (u[0] * O[0] + u[1] * O[1])
    const DE = sE - sD
    return opts.findIndex((o) => Math.abs(o - DE) < 1e-9) + 1
  },
  hk96: () => {
    let t = 0
    for (let a1 = 1; a1 <= 5000; a1++) {
      let a = a1
      for (let n = 1; n <= 6; n++) a = Math.abs(a - 2 * n)
      if (a === 4) t += a1
    }
    return t
  },
  hk97: () => {
    const near = (n) => {
      let best = 1
      for (let k = 1; k * k <= 4 * n + 4; k++) if (Math.abs(k - Math.sqrt(n)) < Math.abs(best - Math.sqrt(n))) best = k
      return best
    }
    const cnt = {}
    const ms = []
    for (let m = 1; m <= 500; m++) {
      const k = near(m)
      cnt[k] = (cnt[k] || 0) + 1
      let num = 0
      const L = 2520 * 11 * 13
      for (const kk in cnt) num += cnt[kk] * (L / kk)
      if (num === 20 * L) ms.push(m)
    }
    return ms.length === 1 ? ms[0] : 'ms ' + ms
  },
  hk98: () => {
    const opts = [28, 30, 32, 34, 36]
    const f = (x) => Math.sin((Math.PI * x) / 2) - Math.cos((Math.PI * x) / 3)
    const A = 0,
      B = 12,
      M = 240000,
      h = (B - A) / M
    const X = (i) => A + i * h
    const rs = []
    for (let i = 0; i <= M; i++) {
      const a = X(i),
        b = X(i + 1),
        fa = f(a),
        fb = f(b)
      if (Math.abs(fa) < 1e-12) {
        rs.push(a)
        continue
      }
      if (i < M && fa * fb < 0) {
        let lo = a,
          hi = b
        for (let j = 0; j < 60; j++) {
          const m = (lo + hi) / 2
          if (f(lo) * f(m) <= 0) hi = m
          else lo = m
        }
        rs.push(lo)
      } else if (i > 0 && i < M) {
        const fp = f(X(i - 1))
        if (Math.abs(fa) <= Math.abs(fp) && Math.abs(fa) <= Math.abs(fb) && fa * fp > 0 && fa * fb > 0) {
          let lo = X(i - 1),
            hi = b
          for (let j = 0; j < 100; j++) {
            const m1 = lo + (hi - lo) / 3,
              m2 = hi - (hi - lo) / 3
            if (Math.abs(f(m1)) < Math.abs(f(m2))) hi = m2
            else lo = m1
          }
          if (Math.abs(f((lo + hi) / 2)) < 1e-10) rs.push((lo + hi) / 2)
        }
      }
    }
    const u = [...new Set(rs.map((r) => Math.round(r * 1e5) / 1e5))]
    const v = u.length + u.reduce((p, q) => p + q, 0)
    return opts.findIndex((o) => Math.abs(o - v) < 1e-3) + 1
  },
  hk99: () => {
    const A = [0, 0],
      C = [8, 0],
      bx = (25 - 49 + 64) / 16,
      B = [bx, Math.sqrt(25 - bx * bx)]
    const ds = [bx + Math.sqrt(25 - B[1] ** 2), bx - Math.sqrt(25 - B[1] ** 2)].filter((x) => x > 1e-9 && x < 8)
    if (ds.length !== 1) return 'D ' + ds
    const D = [ds[0], 0]
    const sq = (p) => p[0] ** 2 + p[1] ** 2
    const D2 = 2 * (B[0] * (C[1] - D[1]) + C[0] * (D[1] - B[1]) + D[0] * (B[1] - C[1]))
    const O = [
      (sq(B) * (C[1] - D[1]) + sq(C) * (D[1] - B[1]) + sq(D) * (B[1] - C[1])) / D2,
      (sq(B) * (D[0] - C[0]) + sq(C) * (B[0] - D[0]) + sq(D) * (C[0] - B[0])) / D2,
    ]
    const u = [B[0] / 5, B[1] / 5]
    const sE = 2 * (u[0] * (O[0] - A[0]) + u[1] * (O[1] - A[1])) - 5
    const E = [sE * u[0], sE * u[1]]
    const S = Math.abs((D[0] - C[0]) * (E[1] - C[1]) - (E[0] - C[0]) * (D[1] - C[1])) / 2
    return Math.round(S * S * 1e6) / 1e6
  },
  hk100: () => {
    const opts = [16, 24, 28, 32, 40]
    const okA = (q) => {
      const f = (x) => x ** 3 + x * x + q * x
      const h = 1e-7
      return Math.abs(Math.abs(f(h)) / h - Math.abs(f(-h)) / -h) < 1e-4
    }
    const qs = []
    for (let i = -400; i <= 400; i++) if (okA(i / 100)) qs.push(i / 100)
    if (qs.length !== 1 || qs[0] !== 0) return 'q ' + qs
    const L = (p) => {
      const f = (x) => x ** 3 + p * x * x
      const t = 1e6
      return t * (f(2 + 1 / t) - f(2)) - 4
    }
    let lo = -20,
      hi = 20
    for (let j = 0; j < 80; j++) {
      const m = (lo + hi) / 2
      if (L(lo) * L(m) <= 0) hi = m
      else lo = m
    }
    const p = (lo + hi) / 2
    const v = 64 + p * 16
    return opts.findIndex((o) => Math.abs(o - v) < 1e-3) + 1
  },
  hk101: () => {
    let c = 0
    for (let a = -6; a <= 6; a++)
      for (let b = -6; b <= 6; b++) {
        const g = (x) => (x - 1) * (x - 2) * Math.abs(x * x + a * x + b)
        const D = a * a - 4 * b
        let ok = true
        if (D >= 0)
          for (const r of [(-a - Math.sqrt(D)) / 2, (-a + Math.sqrt(D)) / 2]) {
            const h = 1e-6,
              dl = (g(r) - g(r - h)) / h,
              dr = (g(r + h) - g(r)) / h
            if (Math.abs(dl - dr) > 1e-4) ok = false
          }
        if (ok) c++
      }
    return c
  },
  hk102: () => {
    const opts = [128, 136, 144, 152, 160]
    const f = (x) => x ** 4 - 4 * x ** 3 + 2 * x * x,
      d = (x) => 4 * x ** 3 - 12 * x * x + 4 * x
    const G = (p, q) => [d(p) - d(q), f(q) - f(p) - d(p) * (q - p)]
    const sols = []
    for (let p0 = -3; p0 <= 5; p0 += 0.25)
      for (let q0 = p0 + 0.25; q0 <= 5; q0 += 0.25) {
        let p = p0,
          q = q0
        for (let it = 0; it < 60; it++) {
          const g = G(p, q),
            e = 1e-7
          const gp = G(p + e, q),
            gq = G(p, q + e)
          const J = [
            [(gp[0] - g[0]) / e, (gq[0] - g[0]) / e],
            [(gp[1] - g[1]) / e, (gq[1] - g[1]) / e],
          ]
          const det = J[0][0] * J[1][1] - J[0][1] * J[1][0]
          if (Math.abs(det) < 1e-14) break
          p -= (J[1][1] * g[0] - J[0][1] * g[1]) / det
          q -= (-J[1][0] * g[0] + J[0][0] * g[1]) / det
          if (!isFinite(p + q)) break
        }
        const g = G(p, q)
        if (isFinite(p + q) && Math.abs(g[0]) + Math.abs(g[1]) < 1e-9 && q - p > 1e-3)
          sols.push(Math.round(((q - p) ** 2 + (f(q) - f(p)) ** 2) * 1e6) / 1e6)
      }
    const u = [...new Set(sols)]
    return u.length === 1 ? opts.findIndex((o) => Math.abs(o - u[0]) < 1e-6) + 1 : 'multi ' + u
  },
  hk103: () => {
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    const I = (h, lo, hi, n = 50) => {
      let s = 0
      for (let i = 0; i < n; i++) {
        const a = lo + ((hi - lo) * i) / n,
          b = lo + ((hi - lo) * (i + 1)) / n
        for (const [x, w] of gl) s += (w * h((a + b) / 2 + ((b - a) / 2) * x) * (b - a)) / 2
      }
      return s
    }
    const good = []
    for (let pi = -40; pi <= 40; pi++)
      for (let qi = -40; qi <= 40; qi++) {
        const p = pi / 4,
          q = qi / 4
        const gd = (x) => x * (3 * x * x + 2 * p * x + q)
        const ch = []
        let prev = gd(-20)
        for (let i = 1; i <= 4000; i++) {
          const x = -20 + i * 0.01 + 1e-9,
            v = gd(x)
          if (prev * v < 0) ch.push(x)
          if (v !== 0) prev = v
        }
        if (ch.length === 1 && Math.abs(ch[0] - 2) < 0.02 && prev > 0) good.push([p, q])
      }
    if (good.length !== 1) return 'good ' + JSON.stringify(good)
    const [p, q] = good[0]
    const vals = [1.7, -3].map((C) => {
      const f = (x) => x ** 3 + p * x * x + q * x + C
      return 4 * f(4) - I(f, 0, 4)
    })
    return Math.abs(vals[0] - vals[1]) < 1e-9 ? Math.round(vals[0] * 1e6) / 1e6 : 'dep ' + vals
  },
  hk104: () => {
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    const I = (h, lo, hi, n = 40) => {
      let s = 0
      for (let i = 0; i < n; i++) {
        const a = lo + ((hi - lo) * i) / n,
          b = lo + ((hi - lo) * (i + 1)) / n
        for (const [x, w] of gl) s += (w * h((a + b) / 2 + ((b - a) / 2) * x) * (b - a)) / 2
      }
      return s
    }
    const turn = (k) => {
      const v = (t) => 3 * t * t - 12 * t + k
      const rs = []
      let prev = v(1e-9)
      for (let i = 1; i <= 20000; i++) {
        const t1 = i * 1e-3,
          c = v(t1)
        if (prev * c < 0) {
          let lo = t1 - 1e-3,
            hi = t1
          for (let j = 0; j < 60; j++) {
            const m = (lo + hi) / 2
            if (v(lo) * v(m) <= 0) hi = m
            else lo = m
          }
          rs.push((lo + hi) / 2)
        }
        if (c !== 0) prev = c
      }
      return rs
    }
    const H = (k) => {
      const r = turn(k)
      return r.length === 1 ? I((t) => 3 * t * t - 12 * t + k, 0, r[0]) + 100 : NaN
    }
    const ks = []
    for (let k = -200; k < 30; k += 1) {
      const a = H(k),
        b = H(k + 1)
      if (a === 0) ks.push(k)
      else if (a * b < 0) {
        let lo = k,
          hi = k + 1
        for (let j = 0; j < 50; j++) {
          const m = (lo + hi) / 2
          if (H(lo) * H(m) <= 0) hi = m
          else lo = m
        }
        ks.push((lo + hi) / 2)
      }
    }
    if (ks.length !== 1) return 'ks ' + ks
    const k = ks[0],
      r = turn(k)[0],
      v = (t) => 3 * t * t - 12 * t + k
    const d = Math.abs(I(v, 0, r)) + Math.abs(I(v, r, 6))
    return Math.round(d * 1e6) / 1e6
  },
  hk105: () => {
    const gl = [
      [-0.906179845938664, 0.236926885056189],
      [-0.538469310105683, 0.478628670499366],
      [0, 0.568888888888889],
      [0.538469310105683, 0.478628670499366],
      [0.906179845938664, 0.236926885056189],
    ]
    const I = (h, lo, hi, n = 30) => {
      let s = 0
      for (let i = 0; i < n; i++) {
        const a = lo + ((hi - lo) * i) / n,
          b = lo + ((hi - lo) * (i + 1)) / n
        for (const [x, w] of gl) s += (w * h((a + b) / 2 + ((b - a) / 2) * x) * (b - a)) / 2
      }
      return s
    }
    const good = []
    for (let pi = -40; pi <= 40; pi++)
      for (let qi = -40; qi <= 40; qi++)
        for (let ri = -20; ri <= 20; ri++) {
          const p = pi / 4,
            q = qi / 4,
            r = ri / 4
          const F = (x) => x ** 4 / 4 + (p * x ** 3) / 3 + (q * x * x) / 2 + r * x
          const e = 1e-3
          if (
            Math.abs(F(e) / (e * e) - 1) < 0.02 &&
            Math.abs(F(-e) / (e * e) - 1) < 0.02 &&
            Math.abs(F(2 + e) / (e * e)) < 5 &&
            Math.abs(F(2 - e) / (e * e)) < 5
          )
            good.push([p, q, r])
        }
    if (good.length !== 1) return 'good ' + JSON.stringify(good)
    const [p, q, r] = good[0]
    return Math.round(I((x) => x ** 3 + p * x * x + q * x + r, 0, 6) * 1e6) / 1e6
  },
  hk106: () => {
    const res = []
    for (let ai = -100; ai <= 100; ai++)
      for (let b = -10; b <= 10; b += 0.5)
        for (let c = -10; c <= 10; c += 0.5) {
          const a = ai / 20
          const g = (x) => Math.abs(x - a) * (x * x + b * x + c)
          const h = 1e-6
          const lim = (t) => {
            const l = g(t - h) / -h,
              r = g(t + h) / h
            return Math.abs(l - r) < 1e-3 && Math.abs(l) < 1e4 ? (l + r) / 2 : NaN
          }
          const L1 = lim(1),
            L3 = lim(3)
          if (isFinite(L1) && isFinite(L3) && Math.abs(L1 + L3 - 2) < 1e-3) res.push(Math.round(g(-1) * 1e6) / 1e6)
        }
    const u = [...new Set(res)]
    return u.length === 1 ? u[0] : 'multi ' + u
  },
  hk107: () => {
    let c = 0
    for (let w = 0; 3 * w <= 14; w++)
      for (let x = 0; x <= 14; x++)
        for (let y = x; y <= 14; y++) {
          const z = 14 - 3 * w - x - y
          if (z >= 0) c++
        }
    return c
  },
  hk108: () => {
    const C = (n, k) => {
      let r = 1
      for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
      return r
    }
    const out = []
    for (let n = 1; n <= 300; n++) {
      const R = (p) => n * p * (1 - p) ** (n - 1) - 9 * (1 - p) ** n
      let lo = 1e-12,
        hi = 1 - 1e-12
      if (R(lo) * R(hi) > 0) continue
      for (let j = 0; j < 100; j++) {
        const m = (lo + hi) / 2
        if (R(lo) * R(m) <= 0) hi = m
        else lo = m
      }
      const p = (lo + hi) / 2
      let e2 = 0,
        e1 = 0
      for (let k = 0; k <= n; k++) {
        const pr = C(n, k) * p ** k * (1 - p) ** (n - k)
        e2 += k * k * pr
        e1 += k * pr
      }
      if (Math.abs(e2 - 40) < 1e-6) out.push(Math.round((e2 - e1) * 1e6) / 1e6)
    }
    return out.length === 1 ? out[0] : 'out ' + out
  },
  hk109: () => {
    const opts = [0.8185, 0.8664, 0.9104, 0.9332, 0.9544]
    const erf = (x) => {
      const t = 1 / (1 + 0.3275911 * Math.abs(x))
      const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
      return x >= 0 ? y : -y
    }
    const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
    const ms = []
    for (let mi = 0; mi <= 6000; mi++) {
      const m = mi / 100
      if (Math.abs(Phi((20 - m) / 5) - (1 - Phi((40 - m) / 5))) < 1e-9) ms.push(m)
    }
    if (ms.length !== 1) return 'm ' + ms
    const m = ms[0]
    const G = (s) => Phi((s * s - m) / s) - 0.8413
    let lo = 0.01,
      hi = 50
    for (let j = 0; j < 80; j++) {
      const md = (lo + hi) / 2
      if (G(lo) * G(md) <= 0) hi = md
      else lo = md
    }
    const s = (lo + hi) / 2
    const P = Phi((39 - m) / s) - Phi((18 - m) / s)
    return opts.findIndex((o) => Math.abs(o - P) < 2e-3) + 1
  },
  hk110: () => {
    const T = [
      [0.5, 0.1915],
      [1, 0.3413],
      [1.5, 0.4332],
      [2, 0.4772],
    ]
    const zOf = (p) => T.filter(([, q]) => Math.abs(q - p) < 1e-9).map(([z]) => z)
    const z1 = zOf(0.5 - 0.0668),
      z2 = zOf(0.5 - 0.0228),
      zc = zOf(0.8664 / 2)
    if (z1.length !== 1 || z2.length !== 1 || zc.length !== 1) return 'table'
    const s = 14 / (z1[0] + z2[0]),
      m = 56 - z1[0] * s
    for (let n = 1; n <= 10000; n++) if (Math.sqrt(n) / s >= zc[0] - 1e-12) return m === 50 && s === 4 ? n : 'm ' + m
    return 'none'
  },
  hk111: () => {
    let c = 0
    const f = [0, 0, 0, 0, 0, 0]
    const rec = (i, lo) => {
      if (i === 6) {
        if (f[0] + f[5] === 9 && f[2] + f[3] === 9) c++
        return
      }
      for (let v = lo; v <= 8; v++) {
        f[i] = v
        rec(i + 1, v)
      }
    }
    rec(0, 1)
    return [50, 55, 60, 65, 70].indexOf(c) + 1
  },
  hk112: () => {
    const g = (a, b) => (b ? g(b, a % b) : a)
    const out = []
    for (let k = 1; k <= 60; k++) {
      const vals = [...Array(k).fill(1), 2, 4],
        N = vals.length
      const mu = vals.reduce((p, q) => p + q, 0) / N,
        va = vals.reduce((p, q) => p + (q - mu) ** 2, 0) / N
      for (let n = 1; n <= 6; n++) {
        if (Math.abs(mu - 2) > 1e-12 || Math.abs(va / n - 0.5) > 1e-12) continue
        let hit = 0
        const tot = N ** n
        for (let code = 0; code < tot; code++) {
          let c = code,
            s = 0
          for (let j = 0; j < n; j++) {
            s += vals[c % N]
            c = Math.floor(c / N)
          }
          if (s === 2 * n) hit++
        }
        const d = g(hit, tot)
        out.push(hit / d + tot / d)
      }
    }
    return out.length === 1 ? out[0] : 'out ' + out
  },
  hk48: () => {
    const P = perms([0, 1, 2, 3, 4, 5, 6])
    let c = 0
    const cp = (x) => (x === 6 ? -1 : x ^ 1)
    for (const p of P) {
      let ok = true
      for (let i = 0; i < 7; i++)
        if (cp(p[i]) === p[(i + 1) % 7]) {
          ok = false
          break
        }
      if (ok) c++
    }
    return c / 7
  },
}

let bad = 0
let checked = 0
for (const p of PROBLEMS) {
  const fn = checks[p.id]
  if (!fn) continue
  checked++
  const got = fn()
  if (!(got === p.answer || (typeof got === 'number' && near(got, p.answer, 1e-6)))) {
    bad++
    console.log(`틀림 ${p.id}: data.js ${p.answer}, 검산 ${got}`)
  }
}
const missing = PROBLEMS.filter((p) => p.subject === 'math' && !checks[p.id]).map((p) => p.id)
console.log(`검산 ${checked}문제, 틀림 ${bad}개${missing.length ? `, 검산 코드 없는 수학 문제: ${missing.join(' ')}` : ''}`)
process.exit(bad || missing.length ? 1 : 0)
