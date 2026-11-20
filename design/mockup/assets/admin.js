/* 관리자 글쓰기 화면 시안 · 동작 (외부 라이브러리 없음, 아무것도 저장·전송하지 않음) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TYPES = {
    news: [['bulletin', '영주권 문호'], ['policy', '정책·규정'], ['court', '법원 판결'], ['notice', '이민국 공지']],
    column: [['guide', '실무 가이드'], ['qna', 'Q&A 해설'], ['case', '승인 사례'], ['view', '변호사의 시선']]
  };
  var BOARD_LABEL = { news: '이민법 소식', column: '전문가 칼럼' };
  var DOMAIN = 'https://vincentkimlaw.com';

  var title = $('#w-title'), body = $('#w-body'), typeBox = $('[data-type-options]');
  var sums = $$('[data-sum]'), progress = $('[data-progress-text]');
  var ogBox = $('[data-og]'), ogTitle = $('[data-og-title]'), ogBoard = $('[data-og-board]');
  var caseBox = $('[data-case-only]'), whenInput = $('[data-when]');

  /* ---------- 토스트 ---------- */
  var toastBox = $('[data-toast-box]'), toastTimer;
  function toast(msg) {
    toastBox.textContent = msg;
    toastBox.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.classList.remove('is-show'); }, 3200);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toast]');
    if (t) { e.preventDefault(); toast(t.getAttribute('data-toast')); }
  });

  /* ---------- 게시판 · 글 유형 ---------- */
  function board() { return ($('input[name="board"]:checked') || {}).value || 'column'; }
  function type() { return ($('input[name="type"]:checked') || {}).value || ''; }
  function renderTypes(selected) {
    var b = board();
    typeBox.innerHTML = TYPES[b].map(function (t) {
      return '<label><input type="radio" name="type" value="' + t[0] + '"' + (t[0] === selected ? ' checked' : '') + '><span>' + t[1] + '</span></label>';
    }).join('');
    $$('[data-pick-board]').forEach(function (btn) { btn.setAttribute('aria-pressed', btn.getAttribute('data-pick-board') === b ? 'true' : 'false'); });
    ogBoard.textContent = BOARD_LABEL[b];
    ogBox.classList.toggle('is-news', b === 'news');
    update();
  }
  function setBoard(b, typ) {
    var r = $('input[name="board"][value="' + b + '"]');
    if (r) r.checked = true;
    renderTypes(typ || '');
  }
  $$('input[name="board"]').forEach(function (r) { r.addEventListener('change', function () { renderTypes(''); }); });
  $$('[data-pick-board]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBoard(btn.getAttribute('data-pick-board'));
      toast(BOARD_LABEL[board()] + ' 게시판에 씁니다. 글 유형을 골라 주세요.');
    });
  });

  /* ---------- 글 템플릿 ---------- */
  function rows(labels, cols) {
    return labels.map(function (l) {
      var tds = ''; for (var i = 0; i < cols; i++) tds += '<td></td>';
      return '<tr><th scope="row">' + l + '</th>' + tds + '</tr>';
    }).join('');
  }
  function sec(h, hint) { return '<h2>' + h + '</h2><p class="ph">' + hint + '</p>'; }
  var TEMPLATES = {
    bulletin: {
      board: 'news', type: 'bulletin', title: '2026년 12월 영주권 문호', areas: ['가족이민', '취업이민'],
      html: '<p class="ph">[한 줄 요약] 이번 달 가장 큰 변화를 한 문장으로 적어 주세요.</p>' +
        '<h2>가족이민 문호 (Final Action Date)</h2><table><thead><tr><th scope="col">순위</th><th scope="col">이번 달</th><th scope="col">지난달</th><th scope="col">변동</th></tr></thead><tbody>' + rows(['F1', 'F2A', 'F2B', 'F3', 'F4'], 3) + '</tbody></table>' +
        '<h2>취업이민 문호 (Final Action Date)</h2><table><thead><tr><th scope="col">순위</th><th scope="col">이번 달</th><th scope="col">지난달</th><th scope="col">변동</th></tr></thead><tbody>' + rows(['EB-1', 'EB-2', 'EB-3', 'EB-5'], 3) + '</tbody></table>' +
        sec('이번 달 USCIS 접수 기준', '가족이민·취업이민 각각 Final Action Date와 Dates for Filing 중 어느 표를 쓰는지 적어 주세요.') +
        '<h2>변호사 코멘트</h2><ul><li class="ph">코멘트 1</li><li class="ph">코멘트 2</li><li class="ph">코멘트 3</li></ul>' +
        '<p class="locked" contenteditable="false">출처: 미 국무부 Visa Bulletin, USCIS 접수 기준 안내 (자동 삽입)</p>'
    },
    news: {
      board: 'news', type: 'policy', title: '', areas: [],
      html: sec('한 줄 요약', '무엇이 바뀌었는지 한 문장으로') + sec('무엇이 바뀌었나', '바뀐 내용') + sec('누구에게 영향이 있나', '해당하는 분') +
        sec('시행일', '언제부터 적용되는지') + sec('지금 해야 할 일', '독자가 할 일 2~3가지') + sec('출처', '공식 발표 링크')
    },
    qna: {
      board: 'column', type: 'qna', title: '', areas: [],
      html: sec('질문', '카페 질문을 알아볼 수 없게 다듬어 적어 주세요') + sec('결론부터', '한두 문장으로') + sec('자세한 설명', '근거와 함께') +
        sec('근거', '법령·USCIS 정책 매뉴얼 링크') + sec('주의할 점', '예외나 위험') + sec('관련 글', '함께 읽으면 좋은 글')
    },
    'case': {
      board: 'column', type: 'case', title: '', areas: [],
      html: sec('사건 유형', '예: 시민권자 배우자 초청, I-601 웨이버') + sec('진행 기간', '접수부터 승인까지') + sec('핵심 쟁점', '어려웠던 점') +
        sec('진행 전략', '어떻게 풀었는지') + sec('결과', '승인 날짜') + sec('시사점', '비슷한 상황의 분께') +
        '<p class="locked" contenteditable="false">개별 사건의 결과는 사실관계와 법적 상황에 따라 다르며, 과거의 결과가 향후 유사한 사건의 결과를 보장하지 않습니다. (자동 삽입)</p>'
    }
  };
  $$('[data-template]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = TEMPLATES[btn.getAttribute('data-template')];
      setBoard(t.board, t.type);
      title.value = t.title;
      body.innerHTML = t.html;
      sums.forEach(function (s, i) { s.value = ''; s.placeholder = '요약 ' + (i + 1); });
      $$('input[name="area"]').forEach(function (c) { c.checked = t.areas.indexOf(c.value) >= 0; });
      $$('[data-case-req]').forEach(function (c) { c.checked = false; });
      update();
      (t.title ? body : title).focus();
      toast('‘' + btn.textContent.trim() + '’ 틀을 불러왔습니다. 회색 글씨 자리만 채우시면 됩니다.');
    });
  });

  /* ---------- 글자 모양 ---------- */
  function exec(cmd, val) { try { document.execCommand(cmd, false, val); } catch (e) { /* 지원하지 않는 브라우저 */ } }
  $$('[data-cmd]').forEach(function (b) {
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    b.addEventListener('click', function () {
      body.focus();
      var c = b.getAttribute('data-cmd');
      if (c === 'bold' || c === 'italic') exec(c);
      else if (c === 'h2') exec('formatBlock', 'h2');
      else if (c === 'ul') exec('insertUnorderedList');
      else if (c === 'quote') exec('formatBlock', 'blockquote');
    });
  });
  body.addEventListener('focusin', function (e) {
    var ph = e.target.closest && e.target.closest('.ph');
    if (ph) ph.classList.remove('ph');
  });
  body.addEventListener('click', function (e) {
    var ph = e.target.closest('.ph');
    if (ph) { ph.classList.remove('ph'); ph.textContent = ''; }
  });
  /* 카페 글 붙여넣기: 서식 정리 */
  body.addEventListener('paste', function (e) {
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (!text) return;
    e.preventDefault();
    var html = text.replace(/\r/g, '').split(/\n{2,}/).map(function (p) {
      var esc = p.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
      return esc ? '<p>' + esc + '</p>' : '';
    }).join('');
    exec('insertHTML', html);
    toast('붙여 넣은 글의 글자 모양을 정리했습니다.');
  });

  /* ---------- 사진 ---------- */
  var drop = $('[data-drop]'), fileInput = $('[data-file]'), thumbs = $('[data-thumbs]');
  function addFiles(files) {
    var imgs = Array.prototype.filter.call(files || [], function (f) { return /^image\//.test(f.type); });
    if (!imgs.length) { toast('사진 파일만 올릴 수 있습니다.'); return; }
    imgs.forEach(function (f) {
      var url = URL.createObjectURL(f);
      var fig = document.createElement('figure');
      fig.innerHTML = '<img alt=""><figcaption>1600px · WebP</figcaption>';
      fig.querySelector('img').src = url;
      thumbs.appendChild(fig);
      var inBody = document.createElement('figure');
      inBody.innerHTML = '<img alt=""><figcaption>사진 설명을 적어 주세요 (화면을 읽어 주는 프로그램이 읽습니다)</figcaption>';
      inBody.querySelector('img').src = url;
      body.appendChild(inBody);
    });
    toast(imgs.length + '장을 올렸습니다. 크기를 줄이고 WebP로 바꿨습니다. (시안: 실제로 서버에 올라가지는 않습니다)');
  }
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  $('[data-pick-image]').addEventListener('click', function () { fileInput.click(); });

  /* ---------- 발행 전 확인 ---------- */
  function checks() {
    var areas = $$('input[name="area"]:checked');
    return {
      title: title.value.trim().length > 0,
      type: !!type(),
      area: areas.length > 0,
      summary: sums.every(function (s) { return s.value.trim().length > 0; }),
      caseOk: type() !== 'case' || $$('[data-case-req]').every(function (c) { return c.checked; })
    };
  }
  function update() {
    var c = checks();
    var n = [c.title, c.type, c.area, c.summary].filter(Boolean).length;
    progress.textContent = n + ' / 4';
    progress.classList.toggle('is-done', n === 4 && c.caseOk);
    $('[data-check="type"]').classList.toggle('is-done', c.type);
    $('[data-check="area"]').classList.toggle('is-done', c.area);
    $('[data-check="summary"]').classList.toggle('is-done', c.summary);
    $('[data-check="image"]').classList.add('is-done');
    caseBox.hidden = type() !== 'case';
    caseBox.classList.toggle('is-done', c.caseOk);
    ogTitle.textContent = title.value.trim() || '제목을 입력하면 여기에 표시됩니다';
    $$('.chk.is-missing').forEach(function (el) {
      var k = el.getAttribute('data-check');
      if ((k && c[k]) || (el === caseBox && c.caseOk)) el.classList.remove('is-missing');
    });
  }
  document.addEventListener('input', update);
  document.addEventListener('change', function (e) {
    if (e.target.name === 'when') whenInput.hidden = e.target.value !== 'later';
    update();
  });

  /* ---------- SNS 공유 키트 ---------- */
  var kit = $('#kit'), kitText = $('#kit-text'), kitTabs = $$('[data-kit]'), publishBtn = $('[data-publish]');
  var kitData = {};
  function tag(s) { return '#' + s.replace(/[\s·()]/g, ''); }
  function buildKit() {
    var b = board(), t = title.value.trim(), s = sums.map(function (x) { return x.value.trim(); });
    var areas = $$('input[name="area"]:checked').map(function (c) { return c.value; });
    var url = function (src) { return DOMAIN + '/' + b + '/1236?utm_source=' + src + '&utm_medium=social&utm_campaign=' + b; };
    kitData = {
      kakao: '[' + BOARD_LABEL[b] + '] ' + t + '\n\n• ' + s[0] + '\n• ' + s[1] + '\n• ' + s[2] + '\n\n👉 ' + url('kakao'),
      naver: t + '\n\n' + s.join('\n') + '\n\n▶ 홈페이지에서 전문 보기\n' + url('naver') +
        '\n\n────────\n김형걸 이민법 변호사 (Vincent Kim)\n전화 (213) 703-6828 · 카카오톡 hkimlaw16',
      threads: s[0] + '\n\n' + s[1] + ' ' + s[2] + '\n\n자세히: ' + url('threads') + '\n\n#미국이민 #이민법 ' + areas.map(tag).join(' '),
      insta: '[1장 · 표지] ' + t + '\n[2장] ' + s[0] + '\n[3장] ' + s[1] + '\n[4장] ' + s[2] +
        '\n[5장 · 마무리] 내 상황이 궁금하다면 프로필 링크에서 상담 신청\n\n캡션: ' + s[0] + ' 자세한 내용은 프로필 링크에서. #미국이민 ' + areas.map(tag).join(' '),
      shorts: '(0~5초) 질문으로 시작: “' + t + '”\n\n(5~45초) 핵심 세 가지\n1. ' + s[0] + '\n2. ' + s[1] + '\n3. ' + s[2] +
        '\n\n(45~55초) 마무리: 자세한 내용은 프로필 링크의 홈페이지 글에서 확인하세요. 김형걸 변호사였습니다.'
    };
  }
  function showKit(key) {
    kitTabs.forEach(function (b) {
      var on = b.getAttribute('data-kit') === key;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on) $('#kit-panel').setAttribute('aria-labelledby', b.id);
    });
    kitText.value = kitData[key];
  }
  kitTabs.forEach(function (b, i) {
    b.id = 'kit-tab-' + i;
    b.addEventListener('click', function () { showKit(b.getAttribute('data-kit')); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var n = kitTabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + kitTabs.length) % kitTabs.length];
      n.focus(); showKit(n.getAttribute('data-kit'));
    });
  });
  $('[data-kit-copy]').addEventListener('click', function () {
    var done = function () { toast('문구를 복사했습니다. 붙여 넣기만 하시면 됩니다.'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(kitText.value).then(done, function () { kitText.select(); toast('문구를 선택했습니다. 복사(⌘C 또는 Ctrl+C)해 주세요.'); });
    } else {
      kitText.focus(); kitText.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) done(); else toast('문구를 선택했습니다. 복사(⌘C 또는 Ctrl+C)해 주세요.');
    }
  });
  function openKit() {
    buildKit();
    var later = ($('input[name="when"]:checked') || {}).value === 'later';
    var d = new Date(whenInput.value);
    $('[data-kit-status]').textContent = later && !isNaN(d)
      ? (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + d.getHours() + '시 ' + String(d.getMinutes()).padStart(2, '0') + '분에 발행하도록 예약했습니다'
      : BOARD_LABEL[board()] + '에 발행했습니다 (시안)';
    showKit('kakao');
    kit.classList.add('is-open');
    kit.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { kitTabs[0].focus(); }, reduce ? 0 : 60);
  }
  function closeKit() {
    if (!kit.classList.contains('is-open')) return;
    kit.classList.remove('is-open');
    kit.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    publishBtn.focus();
  }
  $('[data-kit-close]').addEventListener('click', closeKit);
  kit.addEventListener('click', function (e) { if (e.target === kit) closeKit(); });
  document.addEventListener('keydown', function (e) {
    if (!kit.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeKit(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('button, a[href], textarea', kit).filter(function (el) { return el.offsetWidth || el.offsetHeight; });
    var first = f[0], last = f[f.length - 1];
    if (!kit.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  publishBtn.addEventListener('click', function () {
    var c = checks();
    var missing = [];
    if (!c.title) missing.push(['제목', title, null]);
    if (!c.type) missing.push(['글 유형', $('input[name="type"]'), $('[data-check="type"]')]);
    if (!c.area) missing.push(['업무분야', $('input[name="area"]'), $('[data-check="area"]')]);
    if (!c.summary) missing.push(['3줄 요약', sums.filter(function (s) { return !s.value.trim(); })[0], $('[data-check="summary"]')]);
    if (!c.caseOk) missing.push(['승인 사례 확인', $('[data-case-req]'), caseBox]);
    if (missing.length) {
      missing.forEach(function (m) { if (m[2]) m[2].classList.add('is-missing'); });
      if (missing[0][1]) missing[0][1].focus();
      toast(missing.map(function (m) { return m[0]; }).join(', ') + '을(를) 채워 주세요.');
      return;
    }
    openKit();
  });

  renderTypes('guide');
})();
