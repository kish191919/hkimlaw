/* 관리자 글쓰기 화면 (시연판)
   - assets/config.js 에 Supabase 설정이 있으면: 로그인 → 글 저장·발행·예약·고치기·지우기, 사진 올리기.
   - 설정이 없으면: 예전 시안처럼 화면 안에서만 동작하고 아무것도 저장하지 않는다. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = window.VK_CONFIG || {};
  var SITES = cfg.sites || {};
  var LIVE = !!(cfg.supabaseUrl && cfg.supabaseKey && window.supabase);
  var sb = LIVE ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey) : null;
  var LOGIN_DOMAIN = cfg.loginDomain || 'example.com';

  var TYPES = {
    news: [['bulletin', '영주권 문호'], ['policy', '정책·규정'], ['court', '법원 판결'], ['notice', '이민국 공지']],
    column: [['guide', '실무 가이드'], ['qna', 'Q&A 해설'], ['case', '승인 사례'], ['view', '변호사의 시선']]
  };
  var TYPE_LABEL = {};
  Object.keys(TYPES).forEach(function (b) { TYPES[b].forEach(function (t) { TYPE_LABEL[t[0]] = t[1]; }); });
  var BOARD_LABEL = { news: '이민법 소식', column: '전문가 칼럼' };
  var AREA_HUB = {
    '가족이민': 'green', '취업이민': 'green', '간호사 이민': 'green', '영주권 일반': 'green',
    '취업·투자비자': 'nonimm', '학생·교환': 'nonimm', '방문·무비자': 'nonimm',
    '시민권': 'citizen', '추방재판': 'defense', '웨이버': 'defense'
  };
  var PLACEHOLDER = '<p class="ph">여기에 본문을 쓰세요. 카페에 쓴 글을 복사해 붙여 넣어도 됩니다.</p>';

  var title = $('#w-title'), body = $('#w-body'), typeBox = $('[data-type-options]');
  var sums = $$('[data-sum]'), progress = $('[data-progress-text]');
  var ogBox = $('[data-og]'), ogTitle = $('[data-og-title]'), ogBoard = $('[data-og-board]');
  var caseBox = $('[data-case-only]'), whenInput = $('[data-when]');
  var publishBtn = $('[data-publish]'), draftBtn = $('[data-save-draft]'), deleteBtn = $('[data-delete]');
  var state = { editingId: null, editingStatus: null, dirty: false, busy: false, me: null };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function site(key, path) {
    var base = SITES[key];
    if (base) return base.replace(/\/$/, '') + '/' + path.replace(/\.html/, '');
    return key + '/' + path;
  }

  /* ---------- 토스트 ---------- */
  var toastBox = $('[data-toast-box]'), toastTimer;
  function toast(msg, ms) {
    toastBox.textContent = msg;
    toastBox.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastBox.classList.remove('is-show'); }, ms || 3400);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toast]');
    if (t) { e.preventDefault(); toast(t.getAttribute('data-toast')); }
  });
  function fail(prefix, err) {
    var m = (err && err.message) || '';
    if (/JWT|session|not authenticated/i.test(m)) m = '로그인이 끝났습니다. 다시 로그인해 주세요.';
    else if (/row-level security|permission/i.test(m)) m = '글을 쓸 권한이 없는 계정입니다.';
    else if (/Failed to fetch|NetworkError/i.test(m)) m = '인터넷 연결을 확인해 주세요.';
    toast(prefix + (m ? ' ' + m : ''), 5000);
    if (window.console) console.warn(prefix, err);
  }

  /* ---------- 게시판 · 글 유형 ---------- */
  function board() { return ($('input[name="board"]:checked') || {}).value || 'news'; }
  function type() { return ($('input[name="type"]:checked') || {}).value || ''; }
  function renderTypes(selected) {
    var b = board();
    typeBox.innerHTML = TYPES[b].map(function (t) {
      return '<label><input type="radio" name="type" value="' + t[0] + '"' + (t[0] === selected ? ' checked' : '') + '><span>' + t[1] + '</span></label>';
    }).join('');
    $$('[data-pick-board]').forEach(function (btn) { btn.setAttribute('aria-pressed', !state.editingId && btn.getAttribute('data-pick-board') === b ? 'true' : 'false'); });
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

  /* ---------- 새 글 · 고치기 ---------- */
  function okToLeave() {
    return !state.dirty || window.confirm('쓰고 있던 내용이 저장되지 않았습니다. 그래도 넘어갈까요?');
  }
  function resetForm(b) {
    state.editingId = null; state.editingStatus = null; state.editingFuture = false;
    setBoard(b || board());
    title.value = '';
    body.innerHTML = PLACEHOLDER;
    sums.forEach(function (s) { s.value = ''; });
    $$('input[name="area"]').forEach(function (c) { c.checked = false; });
    $$('[data-case-req]').forEach(function (c) { c.checked = false; });
    $('input[name="when"][value="now"]').checked = true;
    whenInput.hidden = true;
    $('[data-thumbs]').innerHTML = '';
    $('[data-mode-title]').textContent = '새 글 쓰기';
    deleteBtn.hidden = true;
    publishBtn.textContent = '발행하기';
    if (history.replaceState) history.replaceState(null, '', location.pathname);
    state.dirty = false;
    update();
  }
  $$('[data-pick-board]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!okToLeave()) return;
      resetForm(btn.getAttribute('data-pick-board'));
      title.focus();
      toast(BOARD_LABEL[board()] + '에 새 글을 씁니다. 글 유형을 골라 주세요.');
    });
  });
  var newBtn = $('[data-new-post]');
  if (newBtn) newBtn.addEventListener('click', function () { if (okToLeave()) { resetForm(); title.focus(); } });

  function localInput(ts) {
    var d = new Date(ts), pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function loadPost(id) {
    if (!LIVE) return;
    sb.from('posts').select('*').eq('id', id).maybeSingle().then(function (res) {
      if (res.error) { fail('글을 불러오지 못했습니다.', res.error); return; }
      var p = res.data;
      if (!p) { toast('글을 찾을 수 없습니다.'); resetForm(); return; }
      state.editingId = p.id; state.editingStatus = p.status;
      setBoard(p.board, p.type);
      title.value = p.title;
      body.innerHTML = p.body_html ? toEditor(p.body_html) : PLACEHOLDER;
      sums.forEach(function (s, i) { s.value = (p.summary || [])[i] || ''; });
      $$('input[name="area"]').forEach(function (c) { c.checked = (p.tags || []).indexOf(c.value) >= 0; });
      $$('[data-case-req]').forEach(function (c) { c.checked = p.type === 'case'; });
      var future = new Date(p.published_at).getTime() > Date.now();
      state.editingFuture = future;
      $('input[name="when"][value="' + (future ? 'later' : 'now') + '"]').checked = true;
      whenInput.hidden = !future;
      whenInput.value = localInput(p.published_at);
      $('[data-mode-title]').textContent = '글 고치기 · ' + (p.status === 'draft' ? '임시 저장 글' : (future ? '예약 글' : '발행된 글'));
      publishBtn.textContent = p.status === 'draft' ? '발행하기' : '고친 내용 발행';
      deleteBtn.hidden = false;
      if (history.replaceState) history.replaceState(null, '', location.pathname + '?id=' + p.id);
      state.dirty = false;
      update();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }, function (err) { fail('글을 불러오지 못했습니다.', err); });
  }

  /* ---------- 글 템플릿 ---------- */
  function rows(labels, cols) {
    return labels.map(function (l) {
      var tds = ''; for (var i = 0; i < cols; i++) tds += '<td></td>';
      return '<tr><th scope="row">' + l + '</th>' + tds + '</tr>';
    }).join('');
  }
  function sec(h, hint) { return '<h2>' + h + '</h2><p class="ph">' + hint + '</p>'; }
  function nextMonthTitle() {
    var d = new Date(); d.setMonth(d.getMonth() + 1);
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 영주권 문호';
  }
  var TEMPLATES = {
    bulletin: {
      board: 'news', type: 'bulletin', title: nextMonthTitle, areas: ['가족이민', '취업이민'],
      html: '<p class="ph">[한 줄 요약] 이번 달 가장 큰 변화를 한 문장으로 적어 주세요.</p>' +
        '<h2>가족이민 문호 (Final Action Date)</h2><table><thead><tr><th scope="col">순위</th><th scope="col">이번 달</th><th scope="col">지난달</th><th scope="col">변동</th></tr></thead><tbody>' + rows(['F1', 'F2A', 'F2B', 'F3', 'F4'], 3) + '</tbody></table>' +
        '<h2>취업이민 문호 (Final Action Date)</h2><table><thead><tr><th scope="col">순위</th><th scope="col">이번 달</th><th scope="col">지난달</th><th scope="col">변동</th></tr></thead><tbody>' + rows(['EB-1', 'EB-2', 'EB-3', 'EB-5'], 3) + '</tbody></table>' +
        sec('이번 달 USCIS 접수 기준', '가족이민·취업이민 각각 Final Action Date와 Dates for Filing 중 어느 표를 쓰는지 적어 주세요.') +
        '<h2>변호사 코멘트</h2><ul><li class="ph">코멘트 1</li><li class="ph">코멘트 2</li><li class="ph">코멘트 3</li></ul>' +
        '<p><a href="https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html">출처: 미 국무부 Visa Bulletin</a></p>'
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
        sec('진행 전략', '어떻게 풀었는지') + sec('결과', '승인 날짜') + sec('시사점', '비슷한 상황의 분께')
    }
  };
  $$('[data-template]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!okToLeave()) return;
      var t = TEMPLATES[btn.getAttribute('data-template')];
      resetForm(t.board);
      setBoard(t.board, t.type);
      title.value = typeof t.title === 'function' ? t.title() : t.title;
      body.innerHTML = t.html;
      $$('input[name="area"]').forEach(function (c) { c.checked = t.areas.indexOf(c.value) >= 0; });
      state.dirty = false;
      update();
      (title.value ? body : title).focus();
      toast('‘' + btn.textContent.trim() + '’ 틀을 불러왔습니다. 회색 글씨 자리만 채우시면 됩니다.');
    });
  });

  /* ---------- 글자 모양 ---------- */
  function exec(cmd, val) { try { return document.execCommand(cmd, false, val); } catch (e) { return false; } }
  $$('[data-cmd]').forEach(function (b) {
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    b.addEventListener('click', function () {
      body.focus();
      var c = b.getAttribute('data-cmd');
      if (c === 'bold' || c === 'italic') exec(c);
      else if (c === 'h2') exec('formatBlock', 'h2');
      else if (c === 'p') exec('formatBlock', 'p');
      else if (c === 'ul') exec('insertUnorderedList');
      else if (c === 'quote') exec('formatBlock', 'blockquote');
      else if (c === 'link') {
        var url = window.prompt('연결할 주소를 붙여 넣으세요 (https://로 시작)', 'https://');
        if (url && /^https?:\/\/\S+$/i.test(url)) exec('createLink', url);
        else if (url) toast('https:// 로 시작하는 주소를 넣어 주세요.');
      }
      state.dirty = true;
    });
  });
  body.addEventListener('focusin', function (e) {
    var ph = e.target.closest && e.target.closest('.ph');
    if (ph) ph.classList.remove('ph');
  });
  body.addEventListener('click', function (e) {
    var ph = e.target.closest('.ph, .cap-ph');
    if (ph) { ph.classList.remove('ph', 'cap-ph'); ph.textContent = ''; }
  });
  /* 카페 글 붙여넣기: 글자 모양 정리 */
  body.addEventListener('paste', function (e) {
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (!text) return;
    e.preventDefault();
    if (/^\s*https?:\/\/\S+\s*$/.test(text) && ytInfo(text.trim())) { addYoutube(text.trim()); return; }
    var html = text.replace(/\r/g, '').split(/\n{2,}/).map(function (p) {
      var t = esc(p.trim()).replace(/\n/g, '<br>');
      return t ? '<p>' + t + '</p>' : '';
    }).join('');
    $$('.ph', body).forEach(function (el) { el.remove(); });
    exec('insertHTML', html);
    state.dirty = true;
    toast('붙여 넣은 글의 글자 모양을 정리했습니다.');
  });

  /* ---------- 사진 · 영상 ---------- */
  var drop = $('[data-drop]'), fileInput = $('[data-file]'), thumbs = $('[data-thumbs]');
  var MAX_VIDEO = 50 * 1024 * 1024, MAX_GIF = 10 * 1024 * 1024;
  var YT_RE = /(?:youtube\.com\/(?:watch\?(?:\S*?&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  var CAP_IMG = '사진 설명을 적어 주세요', CAP_VID = '영상 설명을 적어 주세요';
  var VIDEO_TYPES = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };

  /* 커서가 있던 자리를 기억해 두었다가 사진·영상을 그 문단 아래에 넣는다 */
  var lastRange = null;
  document.addEventListener('selectionchange', function () {
    var sel = window.getSelection();
    if (sel && sel.rangeCount && body.contains(sel.getRangeAt(0).startContainer)) lastRange = sel.getRangeAt(0).cloneRange();
  });
  function insertBlock(node) {
    $$('.ph', body).forEach(function (el) { el.remove(); });
    var at = null;
    if (lastRange && body.contains(lastRange.startContainer)) {
      if (lastRange.startContainer === body) at = body.childNodes[lastRange.startOffset - 1] || null;
      else { at = lastRange.startContainer; while (at && at.parentNode !== body) at = at.parentNode; }
    }
    if (at) body.insertBefore(node, at.nextSibling); else body.appendChild(node);
    if (!node.nextSibling) { var p = document.createElement('p'); p.innerHTML = '<br>'; body.appendChild(p); }
    var r = document.createRange(); r.setStartAfter(node); r.collapse(true); lastRange = r;
    state.dirty = true;
    update();
  }
  function caption(text, ph) {
    var c = document.createElement('figcaption');
    c.setAttribute('contenteditable', 'true');
    c.textContent = text || ph;
    if (!text) c.className = 'cap-ph';
    return c;
  }
  function imageFigure(src, cap) {
    var fig = document.createElement('figure'), im = document.createElement('img');
    im.alt = ''; im.src = src;
    fig.appendChild(im); fig.appendChild(caption(cap, CAP_IMG));
    return fig;
  }
  function youtubeFigure(id, shape, cap) {
    var fig = document.createElement('figure');
    fig.setAttribute('data-media', 'youtube'); fig.setAttribute('data-id', id); fig.setAttribute('data-shape', shape);
    fig.setAttribute('contenteditable', 'false');
    fig.className = 'adm-media adm-media--' + shape;
    fig.innerHTML = '<span class="adm-media__frame"><img alt="" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg">' +
      '<span class="adm-media__badge">▶ YouTube' + (shape === 'short' ? ' Shorts' : '') + '</span></span>';
    fig.appendChild(caption(cap, CAP_VID));
    return fig;
  }
  function videoFigure(src, cap) {
    var fig = document.createElement('figure');
    fig.setAttribute('data-media', 'video'); fig.setAttribute('data-src', src);
    fig.setAttribute('contenteditable', 'false');
    fig.className = 'adm-media adm-media--file';
    var frame = document.createElement('span'), v = document.createElement('video');
    frame.className = 'adm-media__frame';
    v.controls = true; v.preload = 'metadata'; v.setAttribute('playsinline', ''); v.src = src;
    frame.appendChild(v);
    fig.appendChild(frame); fig.appendChild(caption(cap, CAP_VID));
    return fig;
  }
  function ytInfo(url) {
    var m = YT_RE.exec(url || '');
    return m ? { id: m[1], shape: /\/shorts\//.test(url) ? 'short' : 'wide' } : null;
  }
  function addYoutube(url) {
    var v = ytInfo(url);
    if (!v) { toast('유튜브 주소를 확인해 주세요. 예: https://youtube.com/shorts/… 또는 https://youtu.be/…', 6000); return false; }
    insertBlock(youtubeFigure(v.id, v.shape));
    toast(v.shape === 'short' ? '유튜브 숏츠를 넣었습니다. 사이트에서는 세로 화면으로 재생됩니다.' : '유튜브 영상을 넣었습니다.');
    return true;
  }
  /* 저장된 본문(영상은 링크로 저장돼 있다)을 편집 화면용 미리보기로 바꾼다 */
  function toEditor(html) {
    var box = document.createElement('div');
    box.innerHTML = html;
    $$('figure[data-media]', box).forEach(function (f) {
      var cap = f.querySelector('figcaption'), text = cap ? cap.textContent.trim() : '';
      var kind = f.getAttribute('data-media'), id = f.getAttribute('data-id') || '', el = null;
      if (kind === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(id)) el = youtubeFigure(id, f.getAttribute('data-shape') === 'short' ? 'short' : 'wide', text);
      else if (kind === 'video' && f.getAttribute('data-src')) el = videoFigure(f.getAttribute('data-src'), text);
      if (el) f.replaceWith(el);
    });
    return box.innerHTML;
  }
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (b && b.type === 'image/webp') return resolve(b);
          c.toBlob(function (j) { j ? resolve(j) : reject(new Error('사진을 바꾸지 못했습니다.')); }, 'image/jpeg', 0.85);
        }, 'image/webp', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('이 형식의 사진은 읽을 수 없습니다(HEIC 등). JPG나 PNG로 올려 주세요.')); };
      img.src = url;
    });
  }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function upload(blob, ext) {
    var d = new Date();
    var path = 'uploads/' + d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + rid() + '.' + ext;
    return sb.storage.from('post-images').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' }).then(function (res) {
      if (res.error) throw res.error;
      return sb.storage.from('post-images').getPublicUrl(path).data.publicUrl;
    });
  }
  function thumb(src, label, isVideo) {
    var t = document.createElement('figure');
    t.innerHTML = (isVideo ? '<video muted preload="metadata"></video>' : '<img alt="">') + '<figcaption>' + esc(label) + '</figcaption>';
    t.firstChild.src = src;
    thumbs.appendChild(t);
  }
  function videoBlob(f) {
    var ext = ((/\.([a-z0-9]+)$/i.exec(f.name) || [])[1] || '').toLowerCase();
    var type = VIDEO_TYPES[ext] || ({ 'video/mp4': 'video/mp4', 'video/quicktime': 'video/quicktime', 'video/webm': 'video/webm' })[f.type];
    if (!type) return null;
    var outExt = type === 'video/quicktime' ? 'mov' : (type === 'video/webm' ? 'webm' : 'mp4');
    return { blob: f.type === type ? f : new Blob([f], { type: type }), ext: outExt };
  }
  function addFiles(files) {
    var list = Array.prototype.slice.call(files || []);
    var imgs = list.filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
    var vids = list.filter(function (f) { return /^video\//.test(f.type) || /\.(mp4|m4v|mov|webm)$/i.test(f.name); });
    if (!imgs.length && !vids.length) { toast('사진이나 영상 파일만 올릴 수 있습니다.'); return; }
    if (vids.some(function (f) { return f.size > MAX_VIDEO; })) {
      toast('영상 파일은 50MB까지 올릴 수 있습니다. 긴 영상은 유튜브에 올린 뒤 주소를 넣어 주세요.', 7000);
      vids = vids.filter(function (f) { return f.size <= MAX_VIDEO; });
      if (!imgs.length && !vids.length) return;
    }
    if (!LIVE) {
      imgs.forEach(function (f) { insertBlock(imageFigure(URL.createObjectURL(f))); });
      vids.forEach(function (f) { insertBlock(videoFigure(URL.createObjectURL(f))); });
      toast('시안 화면이라 사진·영상은 저장되지 않습니다.');
      return;
    }
    if (!state.me) { toast('로그인한 뒤에 사진·영상을 올릴 수 있습니다.'); return; }
    var what = [imgs.length ? '사진 ' + imgs.length + '장' : '', vids.length ? '영상 ' + vids.length + '개' : ''].filter(Boolean).join(', ');
    toast(what + '을(를) 올리는 중입니다…' + (vids.length ? ' 영상은 크기에 따라 1~2분 걸릴 수 있습니다.' : ''), 180000);
    setBusy(true);
    var jobs = imgs.map(function (f) { return ['img', f]; }).concat(vids.map(function (f) { return ['vid', f]; }));
    jobs.reduce(function (chain, j) {
      var f = j[1];
      return chain.then(function () {
        if (j[0] === 'vid') {
          var v = videoBlob(f);
          if (!v) throw new Error('mp4, mov, webm 영상만 올릴 수 있습니다.');
          return upload(v.blob, v.ext).then(function (url) { insertBlock(videoFigure(url)); thumb(url, (Math.round(f.size / 104857.6) / 10) + 'MB · 영상', true); });
        }
        if (f.type === 'image/gif') {
          if (f.size > MAX_GIF) throw new Error('GIF는 10MB까지 올릴 수 있습니다.');
          return upload(f, 'gif').then(function (url) { insertBlock(imageFigure(url)); thumb(url, Math.round(f.size / 1024) + 'KB · GIF'); });
        }
        return shrink(f).then(function (blob) {
          var webp = blob.type === 'image/webp';
          return upload(blob, webp ? 'webp' : 'jpg').then(function (url) { insertBlock(imageFigure(url)); thumb(url, Math.round(blob.size / 1024) + 'KB · ' + (webp ? 'WebP' : 'JPG')); });
        });
      });
    }, Promise.resolve()).then(function () {
      setBusy(false);
      toast('커서가 있던 자리에 넣었습니다. 아래 설명 칸을 눌러 설명을 적어 주세요.');
    }, function (err) { setBusy(false); fail('올리지 못했습니다.', err); });
  }
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  $('[data-pick-image]').addEventListener('click', function () { fileInput.click(); });
  var ytBtn = $('[data-pick-youtube]');
  if (ytBtn) {
    ytBtn.addEventListener('mousedown', function (e) { e.preventDefault(); });
    ytBtn.addEventListener('click', function () {
      var u = window.prompt('유튜브 영상 주소를 붙여 넣으세요 (숏츠 주소도 됩니다)', 'https://');
      if (u && u.trim() !== 'https://') addYoutube(u.trim());
    });
  }

  /* ---------- 발행 전 확인 ---------- */
  function cleanBody() {
    var box = document.createElement('div');
    box.innerHTML = body.innerHTML;
    $$('.ph', box).forEach(function (el) { el.remove(); });
    $$('figcaption', box).forEach(function (fc) {
      var t = fc.textContent.trim();
      if (fc.classList.contains('cap-ph') || !t || t === CAP_IMG || t === CAP_VID) fc.remove();
    });
    /* 영상은 안전한 표시(링크 + data-*)로 저장하고, 사이트에서 live.js 가 재생기로 바꾼다 */
    $$('figure[data-media]', box).forEach(function (f) {
      var kind = f.getAttribute('data-media'), cap = f.querySelector('figcaption'), out = document.createElement('figure');
      out.setAttribute('data-media', kind);
      if (kind === 'youtube') {
        var id = f.getAttribute('data-id') || '';
        if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { f.remove(); return; }
        out.setAttribute('data-id', id);
        out.setAttribute('data-shape', f.getAttribute('data-shape') === 'short' ? 'short' : 'wide');
        out.innerHTML = '<a href="https://www.youtube.com/watch?v=' + id + '">YouTube 영상 보기</a>';
      } else {
        var src = f.getAttribute('data-src') || '';
        if (!/^https:\/\//.test(src)) { f.remove(); return; }
        out.setAttribute('data-src', src);
        var a = document.createElement('a'); a.href = src; a.textContent = '영상 보기';
        out.appendChild(a);
      }
      if (cap) { var c = document.createElement('figcaption'); c.textContent = cap.textContent.trim(); out.appendChild(c); }
      f.replaceWith(out);
    });
    $$('[contenteditable]', box).forEach(function (el) { el.removeAttribute('contenteditable'); });
    $$('[style]', box).forEach(function (el) { el.removeAttribute('style'); });
    $$('p, h2, h3, li', box).forEach(function (el) { if (!el.textContent.trim() && !el.querySelector('img')) el.remove(); });
    var html = box.innerHTML.trim();
    return window.DOMPurify ? window.DOMPurify.sanitize(html, { FORBID_TAGS: ['style', 'form', 'input', 'button', 'script'], FORBID_ATTR: ['style', 'class'], ALLOWED_ATTR: ['href', 'src', 'alt', 'scope', 'colspan', 'rowspan', 'title'] }) : html;
  }
  function bodyText() { var b = document.createElement('div'); b.innerHTML = cleanBody(); return b.textContent.trim(); }
  function checks() {
    return {
      title: title.value.trim().length > 0,
      type: !!type(),
      area: $$('input[name="area"]:checked').length > 0,
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
  document.addEventListener('input', function (e) {
    if (e.target.closest && e.target.closest('.adm-main, .adm-panel')) state.dirty = true;
    update();
  });
  document.addEventListener('change', function (e) {
    if (e.target.name === 'when') {
      whenInput.hidden = e.target.value !== 'later';
      if (e.target.value === 'later' && !whenInput.value) {
        var d = new Date(Date.now() + 864e5); d.setHours(8, 0, 0, 0);
        whenInput.value = localInput(d);
      }
    }
    if (e.target.closest && e.target.closest('.adm-main, .adm-panel')) state.dirty = true;
    update();
  });

  /* ---------- SNS 공유 키트 ---------- */
  var kit = $('#kit'), kitText = $('#kit-text'), kitTabs = $$('[data-kit]');
  var kitData = {};
  function tag(s) { return '#' + s.replace(/[\s·()]/g, ''); }
  function buildKit(id) {
    var b = board(), t = title.value.trim(), s = sums.map(function (x) { return x.value.trim(); });
    var areas = $$('input[name="area"]:checked').map(function (c) { return c.value; });
    var base = id ? site('a', 'post.html') + '?id=' + id : 'https://vincentkimlaw.com/' + b + '/1236?';
    var url = function (src) { return base + (id ? '&' : '') + 'utm_source=' + src + '&utm_medium=social&utm_campaign=' + b; };
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
    var va = $('[data-kit-view="a"]'), vb = $('[data-kit-view="b"]'), vboard = $('[data-kit-board]');
    if (id) {
      va.href = site('a', 'post.html') + '?id=' + id; vb.href = site('b', 'post.html') + '?id=' + id;
      vboard.href = site('a', b === 'news' ? 'news.html' : 'column.html');
    }
    va.hidden = vb.hidden = vboard.hidden = !id;
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
  function openKit(id, statusText) {
    buildKit(id);
    $('[data-kit-status]').textContent = statusText;
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

  /* ---------- 저장 · 발행 · 지우기 ---------- */
  function validate(forPublish) {
    var c = checks(), missing = [];
    if (!c.title) missing.push(['제목', title, null]);
    if (forPublish) {
      if (!c.type) missing.push(['글 유형', $('input[name="type"]'), $('[data-check="type"]')]);
      if (!c.area) missing.push(['업무분야', $('input[name="area"]'), $('[data-check="area"]')]);
      if (!c.summary) missing.push(['3줄 요약', sums.filter(function (s) { return !s.value.trim(); })[0], $('[data-check="summary"]')]);
      if (!c.caseOk) missing.push(['승인 사례 확인', $('[data-case-req]'), caseBox]);
      if (!bodyText()) missing.push(['본문', body, null]);
    }
    if (!type() && !forPublish) missing.push(['글 유형', $('input[name="type"]'), $('[data-check="type"]')]);
    if (!missing.length) return true;
    missing.forEach(function (m) { if (m[2]) m[2].classList.add('is-missing'); });
    if (missing[0][1]) missing[0][1].focus();
    toast(missing.map(function (m) { return m[0]; }).join(', ') + '을(를) 채워 주세요.');
    return false;
  }
  function record(status) {
    var html = cleanBody();
    var tags = $$('input[name="area"]:checked').map(function (c) { return c.value; });
    var hubs = [];
    tags.forEach(function (t) { var h = AREA_HUB[t]; if (h && hubs.indexOf(h) < 0) hubs.push(h); });
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var img = tmp.querySelector('img[src^="https://"]'), yt = tmp.querySelector('figure[data-media="youtube"]');
    var ytId = yt ? yt.getAttribute('data-id') : null;
    var rec = {
      board: board(), type: type(), title: title.value.trim(),
      summary: sums.map(function (s) { return s.value.trim(); }).filter(Boolean),
      body_html: html, hubs: hubs, tags: tags, status: status,
      cover_url: img ? img.getAttribute('src') : (ytId ? 'https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg' : null),
      video_id: ytId, video_shape: yt ? yt.getAttribute('data-shape') : null
    };
    var later = ($('input[name="when"]:checked') || {}).value === 'later';
    if (later && whenInput.value) rec.published_at = new Date(whenInput.value).toISOString();
    else if (status === 'published' && (!state.editingId || state.editingStatus === 'draft' || state.editingFuture)) rec.published_at = new Date().toISOString();
    return rec;
  }
  function setBusy(on) {
    state.busy = on;
    [publishBtn, draftBtn, deleteBtn].forEach(function (b) { b.disabled = on; });
  }
  function save(status) {
    if (state.busy) return;
    if (!validate(status === 'published')) return;
    if (!LIVE) { openKit(null, '시안 화면이라 저장되지 않았습니다'); return; }
    if (!state.me) { showLogin(); return; }
    var rec = record(status);
    setBusy(true);
    var q = state.editingId
      ? sb.from('posts').update(rec).eq('id', state.editingId).select('id,status,published_at').single()
      : sb.from('posts').insert(rec).select('id,status,published_at').single();
    q.then(function (res) {
      setBusy(false);
      if (res.error) { fail(status === 'published' ? '발행하지 못했습니다.' : '저장하지 못했습니다.', res.error); return; }
      var p = res.data, scheduled = new Date(p.published_at).getTime() > Date.now() + 30000;
      state.editingId = p.id; state.editingStatus = p.status; state.editingFuture = scheduled; state.dirty = false;
      $('[data-mode-title]').textContent = '글 고치기 · ' + (p.status === 'draft' ? '임시 저장 글' : (scheduled ? '예약 글' : '발행된 글'));
      publishBtn.textContent = p.status === 'draft' ? '발행하기' : '고친 내용 발행';
      deleteBtn.hidden = false;
      if (history.replaceState) history.replaceState(null, '', location.pathname + '?id=' + p.id);
      loadMine();
      loadGoal();
      if (p.status === 'draft') { toast('임시 저장했습니다. 아직 사이트에는 보이지 않습니다.'); return; }
      var d = new Date(p.published_at);
      openKit(p.id, scheduled
        ? (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + d.getHours() + '시 ' + String(d.getMinutes()).padStart(2, '0') + '분에 발행되도록 예약했습니다'
        : BOARD_LABEL[board()] + '에 발행했습니다. 사이트에 바로 보입니다');
    }, function (err) { setBusy(false); fail('저장하지 못했습니다.', err); });
  }
  publishBtn.addEventListener('click', function () { save('published'); });
  draftBtn.addEventListener('click', function () { save('draft'); });
  function removePost(id, label) {
    if (!LIVE || !state.me) return;
    if (!window.confirm('“' + label + '” 글을 지울까요? 사이트에서도 바로 사라지고 되돌릴 수 없습니다.')) return;
    setBusy(true);
    sb.from('posts').delete().eq('id', id).then(function (res) {
      setBusy(false);
      if (res.error) { fail('지우지 못했습니다.', res.error); return; }
      toast('글을 지웠습니다.');
      if (state.editingId === id) { state.dirty = false; resetForm(); }
      loadMine(); loadGoal();
    }, function (err) { setBusy(false); fail('지우지 못했습니다.', err); });
  }
  deleteBtn.addEventListener('click', function () { if (state.editingId) removePost(state.editingId, title.value.trim() || '이'); });

  /* ---------- 여기서 쓴 글 · 이번 달 목표 ---------- */
  var dayFmt = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' });
  function loadMine() {
    var box = $('[data-mine]'), list = $('[data-mine-list]');
    if (!LIVE || !state.me) { box.hidden = true; return; }
    sb.from('posts').select('id,board,type,title,status,published_at').eq('source', 'site').order('created_at', { ascending: false }).limit(30).then(function (res) {
      if (res.error) { fail('글 목록을 불러오지 못했습니다.', res.error); return; }
      box.hidden = false;
      var rows = res.data || [];
      if (!rows.length) { list.innerHTML = '<li class="adm-mine__empty">아직 없습니다. 첫 글을 써 보세요.</li>'; return; }
      list.innerHTML = rows.map(function (p) {
        var future = new Date(p.published_at).getTime() > Date.now();
        var badge = p.status === 'draft' ? '<span class="st st--draft">임시</span>' : (future ? '<span class="st st--later">예약</span>' : '<span class="st st--live">발행</span>');
        return '<li><div class="adm-mine__t">' + badge + '<span>' + esc(p.title) + '</span></div>' +
          '<div class="adm-mine__m"><span>' + BOARD_LABEL[p.board] + ' · ' + dayFmt.format(new Date(p.published_at)) + '</span>' +
          (p.status === 'published' && !future ? '<a href="' + site('a', 'post.html') + '?id=' + p.id + '" target="_blank" rel="noopener">보기</a>' : '') +
          '<button type="button" data-edit="' + p.id + '">고치기</button><button type="button" data-del="' + p.id + '" data-title="' + esc(p.title) + '">지우기</button></div></li>';
      }).join('');
    }, function (err) { fail('글 목록을 불러오지 못했습니다.', err); });
  }
  $('[data-mine-list]').addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
    if (ed && okToLeave()) loadPost(parseInt(ed.getAttribute('data-edit'), 10));
    if (del) removePost(parseInt(del.getAttribute('data-del'), 10), del.getAttribute('data-title'));
  });
  function loadGoal() {
    if (!LIVE) return;
    var now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), 1);
    sb.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', start.toISOString()).lte('published_at', now.toISOString())
      .then(function (res) {
        if (res.error) return;
        var n = res.count || 0;
        $('[data-goal-count]').textContent = n;
        var bar = $('[data-goal-bar]');
        bar.setAttribute('aria-valuenow', String(Math.min(n, 8)));
        $('span', bar).style.width = Math.min(100, n / 8 * 100) + '%';
      });
  }

  /* ---------- 로그인 ---------- */
  var loginBox = $('[data-login]'), loginForm = $('[data-login-form]'), loginErr = $('[data-login-err]');
  function showLogin(msg) {
    loginBox.hidden = false;
    document.body.classList.add('is-locked');
    loginErr.textContent = msg || '';
    setTimeout(function () { loginForm.elements.id.focus(); }, 30);
  }
  function hideLogin() { loginBox.hidden = true; document.body.classList.remove('is-locked'); }
  function enter(user) {
    return sb.from('editors').select('display_name').eq('user_id', user.id).maybeSingle().then(function (res) {
      if (res.error || !res.data) {
        sb.auth.signOut();
        state.me = null;
        showLogin('글쓰기 권한이 없는 계정입니다.');
        return;
      }
      state.me = { id: user.id, name: res.data.display_name || user.email };
      $('[data-me-name]').textContent = state.me.name;
      $('[data-logout]').hidden = false;
      hideLogin();
      loadMine();
      loadGoal();
      var id = parseInt(new URLSearchParams(location.search).get('id') || '', 10);
      if (id) loadPost(id);
    });
  }
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = loginForm.elements.id.value.trim(), pw = loginForm.elements.pw.value;
    if (!id || !pw) { loginErr.textContent = '아이디와 비밀번호를 입력해 주세요.'; return; }
    var email = id.indexOf('@') >= 0 ? id : id + '@' + LOGIN_DOMAIN;
    var btn = $('[data-login-btn]');
    btn.disabled = true; btn.textContent = '확인 중…';
    sb.auth.signInWithPassword({ email: email, password: pw }).then(function (res) {
      btn.disabled = false; btn.textContent = '로그인';
      if (res.error) { loginErr.textContent = /Invalid login/i.test(res.error.message) ? '아이디 또는 비밀번호가 맞지 않습니다.' : '로그인하지 못했습니다. ' + res.error.message; return; }
      loginForm.elements.pw.value = '';
      enter(res.data.user);
    }, function () { btn.disabled = false; btn.textContent = '로그인'; loginErr.textContent = '인터넷 연결을 확인해 주세요.'; });
  });
  $('[data-logout]').addEventListener('click', function () {
    if (!okToLeave()) return;
    sb.auth.signOut().then(function () {
      state.me = null; state.dirty = false;
      $('[data-logout]').hidden = true;
      $('[data-me-name]').textContent = '로그아웃됨';
      resetForm();
      showLogin('로그아웃했습니다.');
    });
  });
  window.addEventListener('beforeunload', function (e) {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------- 시작 ---------- */
  $$('[data-site-link]').forEach(function (a) { var k = a.getAttribute('data-site-link'); if (SITES[k]) a.href = SITES[k]; });
  renderTypes('');
  body.innerHTML = PLACEHOLDER;
  update();
  if (LIVE) {
    $('[data-banner-text]').innerHTML = '<b>시연판입니다.</b> 여기서 발행한 글은 시안 사이트 A·B의 게시판·업무분야 페이지에 실제로 실립니다. 시연이 끝나면 지울 수 있습니다.';
    sb.auth.getSession().then(function (res) {
      var user = res.data && res.data.session && res.data.session.user;
      if (user) enter(user); else showLogin();
    });
  }
})();
