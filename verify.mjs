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
  s3: () => Math.sqrt(2 * 10 * 20),
  s4: () => (6 / 2) * 4,
  's-e2': () => (40 * 10) / 20,
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
