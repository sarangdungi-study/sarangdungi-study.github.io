// 사랑둥이(수능 공부 사이트) 저장소: 구글 시트 + Apps Script 웹 앱.
// 게임에서 쓴 방식(play_log.gs)을 그대로 따라요: text/plain POST, LockService, 비밀번호는 소금 친 해시, 글자 칸.
// 붙이는 법: 시트 → 확장 프로그램 → Apps Script → 이 파일 통째로 붙여 저장 → 배포(웹 앱, 실행: 나, 액세스: 모든 사용자).
// 고친 뒤에는: 배포 → 배포 관리 → 연필 → 버전 '새 버전' → 배포 (주소 그대로).
//
// 탭 (처음 쓰일 때 자동으로 생겨요)
//   계정     아이디 · 비밀번호(해시) · 초기화 · 만든 날 · 마지막 접속 · 접속 횟수
//            비밀번호 잊으면 '초기화' 칸에 아무 글자 → 다음에 넣는 비밀번호가 새 비밀번호
//   기록     아이디 · 문제 · 맞음 · 막힌 개념 · 푼 때(ms) · 받은 때
//   오답노트 아이디 · 문제 · 칸 · 복습일(ms) · 메모 · 넣은 때(ms)   (아이디+문제마다 한 줄)
//   요청     번호 · 아이디 · 종류 · 과목 · 문제 · 내용 · 상태 · 보낸 때(ms) · 답
//
// 관리용(수능 세션 Claude가 요청을 읽고 상태를 바꿀 때): 스크립트 속성 ADMIN_KEY에 긴 무작위 글자를 넣어 두세요.

var TAB = {
  account: ["계정", ["아이디", "비밀번호", "초기화", "만든 날", "마지막 접속", "접속 횟수"]],
  attempt: ["기록", ["아이디", "문제", "맞음", "막힌 개념", "푼 때", "받은 때"]],
  note: ["오답노트", ["아이디", "문제", "칸", "복습일", "메모", "넣은 때"]],
  feedback: ["요청", ["번호", "아이디", "종류", "과목", "문제", "내용", "상태", "보낸 때", "답"]],
};
var FB_KINDS = ["more", "explain", "concept", "error"];

function doGet() { return json({ ok: true }); }

function doPost(e) {
  var q = JSON.parse(e.postData.contents);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (q.action && q.action.indexOf("admin") === 0) return json(admin(q));
    var name = String(q.name || "").trim().slice(0, 20), pw = String(q.pw || "");
    if (q.action === "login") return json(login(name, pw));
    if (!checkPw(name, pw)) return json({ ok: false, error: "다시 로그인해 주세요." });
    if (q.action === "record") {
      var a = q.attempt;
      appendRow("attempt", [name, a.pid, a.correct ? 1 : 0, (a.stuck || []).join(","), a.ts, new Date()]);
      if (q.note) upsertNote(name, a.pid, q.note);
    } else if (q.action === "stuck") {
      var sh = sheet("attempt"), v = sh.getDataRange().getValues();
      for (var r = v.length - 1; r >= 1; r--) {
        if (same(v[r][0], name) && String(v[r][1]) === q.pid && Number(v[r][4]) === Number(q.ts)) {
          sh.getRange(r + 1, 4).setValue((q.stuck || []).join(",")); break;
        }
      }
    } else if (q.action === "memo") {
      var n = findNote(name, q.pid); if (n) sheet("note").getRange(n.line, 5).setValue(String(q.memo).slice(0, 1000));
    } else if (q.action === "removeNote") {
      var n2 = findNote(name, q.pid); if (n2) sheet("note").deleteRow(n2.line);
    } else if (q.action === "feedback") {
      var f = q.feedback;
      if (FB_KINDS.indexOf(f.kind) < 0) return json({ ok: false, error: "bad" });
      appendRow("feedback", [Utilities.getUuid().slice(0, 8), name, f.kind, String(f.subject).slice(0, 20),
        f.pid || "", String(f.text).slice(0, 300), "접수", f.ts, ""]);
    } else {
      return json({ ok: false, error: "bad" });
    }
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// 로그인: 없으면 새로 만들고, 있으면 비밀번호 확인 → 그 아이 기록을 통째로 돌려줌
function login(name, pw) {
  if (!name || pw.length < 32) return { ok: false, error: "이름과 숫자 4자리를 넣어 주세요." };
  var sh = sheet("account"), v = sh.getDataRange().getValues(), stored = hash(pw);
  var found = -1;
  for (var r = 1; r < v.length; r++) if (same(v[r][0], name)) { found = r; break; }
  if (found < 0) {
    sh.appendRow([name, stored, "", new Date(), new Date(), 1]);
  } else {
    var line = found + 1;
    if (v[found][2] !== "" || v[found][1] === "") sh.getRange(line, 2, 1, 2).setValues([[stored, ""]]);
    else if (v[found][1] !== stored) return { ok: false, error: "비밀번호가 달라요." };
    sh.getRange(line, 5, 1, 2).setValues([[new Date(), Number(v[found][5] || 0) + 1]]);
  }
  return { ok: true, data: userData(name) };
}

function userData(name) {
  var attempts = rows("attempt").filter(function (x) { return same(x[0], name); }).map(function (x) {
    return { pid: String(x[1]), correct: Number(x[2]) === 1, stuck: x[3] ? String(x[3]).split(",") : [], ts: Number(x[4]) };
  });
  var notes = {};
  rows("note").forEach(function (x) {
    if (same(x[0], name)) notes[String(x[1])] = { box: Number(x[2]), due: Number(x[3]), memo: String(x[4]), added: Number(x[5]) };
  });
  var feedback = rows("feedback").filter(function (x) { return same(x[1], name); }).map(function (x) {
    return { id: String(x[0]), kind: x[2], subject: x[3], pid: x[4] || null, text: String(x[5]), status: x[6], ts: Number(x[7]), reply: String(x[8] || "") };
  });
  return { attempts: attempts, notes: notes, feedback: feedback };
}

// 관리: 요청 읽기 · 상태 바꾸기 (ADMIN_KEY가 맞을 때만)
function admin(q) {
  var key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!key || q.key !== key) return { ok: false, error: "no" };
  if (q.action === "adminFeedback") {
    return { ok: true, rows: rows("feedback").map(function (x) {
      return { id: String(x[0]), name: x[1], kind: x[2], subject: x[3], pid: x[4], text: String(x[5]), status: x[6], ts: Number(x[7]), reply: String(x[8] || "") };
    }) };
  }
  if (q.action === "adminSetStatus") {
    var sh = sheet("feedback"), v = sh.getDataRange().getValues();
    for (var r = 1; r < v.length; r++) if (String(v[r][0]) === q.id) {
      sh.getRange(r + 1, 7).setValue(String(q.status).slice(0, 10));
      if (q.reply != null) sh.getRange(r + 1, 9).setValue(String(q.reply).slice(0, 300));
      return { ok: true };
    }
    return { ok: false, error: "not found" };
  }
  if (q.action === "adminStats") {
    return { ok: true, attempts: rows("attempt").map(function (x) {
      return { name: x[0], pid: String(x[1]), correct: Number(x[2]) === 1, stuck: String(x[3] || ""), ts: Number(x[4]) };
    }) };
  }
  return { ok: false, error: "bad" };
}

// ── 도우미
function sheet(key) {
  var b = book(), t = TAB[key];
  var sh = b.getSheetByName(t[0]);
  if (!sh) { sh = b.insertSheet(t[0]); sh.appendRow(t[1]); sh.setFrozenRows(1); }
  return sh;
}
function rows(key) { var v = sheet(key).getDataRange().getValues(); return v.slice(1); }
function appendRow(key, values) {
  var sh = sheet(key), line = sh.getLastRow() + 1;
  sh.getRange(line, 1, 1, values.length).setNumberFormat("@");
  sh.getRange(line, 1, 1, values.length).setValues([values.map(function (x) { return x instanceof Date ? x.toISOString() : x; })]);
}
function findNote(name, pid) {
  var v = sheet("note").getDataRange().getValues();
  for (var r = 1; r < v.length; r++) if (same(v[r][0], name) && String(v[r][1]) === pid) return { line: r + 1 };
  return null;
}
function upsertNote(name, pid, n) {
  var found = findNote(name, pid), sh = sheet("note");
  var values = [name, pid, n.box, n.due, n.memo || "", n.added];
  if (found) { sh.getRange(found.line, 1, 1, 6).setNumberFormat("@"); sh.getRange(found.line, 1, 1, 6).setValues([values]); }
  else appendRow("note", values);
}
function checkPw(name, pw) {
  var v = sheet("account").getDataRange().getValues(), h = hash(pw);
  for (var r = 1; r < v.length; r++) if (same(v[r][0], name)) return v[r][2] === "" && v[r][1] === h;
  return false;
}
function same(a, b) { return String(a).toLowerCase() === String(b).toLowerCase(); }
function hash(text) {
  var props = PropertiesService.getScriptProperties();
  var salt = props.getProperty("SALT");
  if (!salt) { salt = Utilities.getUuid(); props.setProperty("SALT", salt); }
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + text)
    .map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
}
function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function book() {
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("BOOK_ID");
  if (id) return SpreadsheetApp.openById(id);
  var b = SpreadsheetApp.create("사랑둥이 기록");
  props.setProperty("BOOK_ID", b.getId());
  return b;
}
