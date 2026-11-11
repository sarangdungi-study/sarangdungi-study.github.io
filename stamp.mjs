// 올리기 전에 실행: css·js 주소에 버전을 붙여서 휴대폰이 옛 파일을 캐시로 쓰지 않게 한다
import { readFileSync, writeFileSync } from 'node:fs'

const v = Date.now().toString(36)
const html = readFileSync('index.html', 'utf8').replace(
  /(href|src)="(style\.css|data\.js|store\.js|ink\.js|app\.js)(\?v=[\w]+)?"/g,
  `$1="$2?v=${v}"`,
)
writeFileSync('index.html', html)
console.log('버전', v)
