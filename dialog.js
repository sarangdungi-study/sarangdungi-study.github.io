// 사이트 디자인에 맞춘 확인 창 (브라우저 기본 confirm 대신). Ask(제목, {설명, ok, cancel, danger}) → Promise<boolean>
;(function () {
  function Ask(title, o = {}) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div')
      wrap.className = 'dlg-back'
      wrap.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
        <div class="dlg-title">${title}</div>
        ${o.desc ? `<div class="dlg-desc">${o.desc}</div>` : ''}
        <div class="dlg-acts">
          <button type="button" class="btn ghost dlg-no">${o.cancel || '취소'}</button>
          <button type="button" class="btn ${o.danger ? 'danger' : 'main'} dlg-yes">${o.ok || '확인'}</button>
        </div></div>`
      const close = (v) => {
        wrap.classList.add('out')
        document.removeEventListener('keydown', onKey)
        setTimeout(() => wrap.remove(), 160)
        resolve(v)
      }
      const onKey = (e) => {
        if (e.key === 'Escape') close(false)
        if (e.key === 'Enter') close(true)
      }
      wrap.addEventListener('click', (e) => {
        if (e.target === wrap) close(false)
      })
      wrap.querySelector('.dlg-no').onclick = () => close(false)
      wrap.querySelector('.dlg-yes').onclick = () => close(true)
      document.addEventListener('keydown', onKey)
      document.body.appendChild(wrap)
      wrap.querySelector('.dlg-yes').focus()
    })
  }
  window.Ask = Ask
})()
