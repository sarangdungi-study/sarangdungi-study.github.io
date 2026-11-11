// 올리기 전에 실행: css·js 주소에 버전을 붙여서 휴대폰이 옛 파일을 캐시로 쓰지 않게 한다
import { readFileSync, writeFileSync } from 'node:fs'

const v = Date.now().toString(36)
const html = readFileSync('index.html', 'utf8').replace(
  /(href|src)="(style\.css|data\.js|store\.js|ink\.js|explain\.js|scenes\.js|scenes2\.js|scenes3\.js|scenes4\.js|scenes5\.js|scenes6\.js|scenes7\.js|scenes8\.js|scenes9\.js|map-data\.js|hismap\.js|hisdetail\.js|speak\.js|dialog\.js|app\.js)(\?v=[\w]+)?"/g,
  `$1="$2?v=${v}"`,
)
writeFileSync('index.html', html)
console.log('버전', v)
