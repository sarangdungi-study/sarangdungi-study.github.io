// 영어 듣기: 브라우저에 들어 있는 음성(speechSynthesis)을 쓴다. 돈 드는 API 없음.
// 아이패드·아이폰은 Samantha 같은 영어 음성이 기본으로 있다.
;(function () {
  const synth = window.speechSynthesis
  let voice = null

  function pickVoice() {
    if (!synth) return
    const vs = synth.getVoices().filter((v) => /^en(-|_)/i.test(v.lang))
    const prefer = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Daniel']
    voice = prefer.map((n) => vs.find((v) => v.name.includes(n))).find(Boolean) || vs.find((v) => /en-US/i.test(v.lang)) || vs[0] || null
  }
  if (synth) {
    pickVoice()
    synth.addEventListener?.('voiceschanged', pickVoice)
  }

  // 문제 번호 표시(①, ( ③ ))와 빈칸 밑줄은 읽지 않는다
  const clean = (t) =>
    t
      .replace(/\(\s*[①②③④⑤]\s*\)/g, ' ')
      .replace(/[①②③④⑤]/g, ' ')
      .replace(/_{2,}/g, ' blank ')
      .replace(/\s+/g, ' ')
      .trim()

  function say(text, rate = 0.95, onend) {
    if (!synth) return false
    // 아이폰 사파리: 말하는 중이 아닐 때 cancel() 바로 뒤 speak()는 소리 없이 묻히는 일이 있다
    if (synth.speaking || synth.pending) synth.cancel()
    if (synth.paused) synth.resume()
    if (!voice) pickVoice()
    const u = new SpeechSynthesisUtterance(clean(text))
    u.lang = 'en-US'
    if (voice) u.voice = voice
    u.rate = rate
    u.onend = onend || null
    u.onerror = onend || null
    synth.speak(u)
    return true
  }
  function stop() {
    if (synth) synth.cancel()
  }

  window.Speak = { supported: !!synth, say, stop, speaking: () => !!(synth && synth.speaking) }
})()
