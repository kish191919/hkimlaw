/* 김형걸 이민법 변호사 홈페이지 시안 · 공통 인터랙션 (외부 라이브러리 없음) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  if (/(^|[?&])embed/.test(location.search)) root.classList.add('is-embed');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var params = new URLSearchParams(location.search);
  var HUB = {
    green: 'practice-green-card.html', nonimm: 'practice-nonimmigrant-visa.html',
    citizen: 'practice-citizenship.html', defense: 'practice-removal-defense.html'
  };

  /* ---------- 토스트 ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 3200);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toast]');
    if (!t) return;
    e.preventDefault();
    toast(t.getAttribute('data-toast'));
  });

  /* ---------- 포커스 가두기 (모바일 메뉴 · 비자 진단 창) ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function focusables(box) {
    return $$(FOCUSABLE, box).filter(function (el) { return el.offsetWidth || el.offsetHeight || el.getClientRects().length; });
  }
  function trap(box, e) {
    var f = focusables(box);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- 헤더 · 맨 위로 ---------- */
  var header = $('[data-header]');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    updateProcess();
    updateProgress();
  }
  $$('[data-top]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 모바일 메뉴 ---------- */
  var navBtn = $('[data-nav-toggle]');
  var mnav = $('#mnav');
  function navOpen() { return document.body.classList.contains('nav-open'); }
  function setNav(open) {
    if (open === navOpen()) return;
    document.body.classList.toggle('nav-open', open);
    if (navBtn) navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && mnav) setTimeout(function () { var c = $('[data-nav-close]', mnav); if (c) c.focus(); }, 40);
    if (!open && navBtn && mnav && mnav.contains(document.activeElement)) navBtn.focus();
  }
  if (navBtn) navBtn.addEventListener('click', function () { setNav(!navOpen()); });
  $$('[data-nav-close], .mnav a').forEach(function (el) { el.addEventListener('click', function () { setNav(false); }); });

  /* ---------- 최신 소식 띠 ---------- */
  $$('[data-ticker]').forEach(function (t) {
    var items = $$('.ticker__item', t);
    if (!items.length) return;
    var i = 0, hover = false;
    items[0].classList.add('is-active');
    if (items.length < 2) return;
    t.addEventListener('mouseenter', function () { hover = true; });
    t.addEventListener('mouseleave', function () { hover = false; });
    t.addEventListener('focusin', function () { hover = true; });
    t.addEventListener('focusout', function () { hover = false; });
    setInterval(function () {
      if (hover || document.body.classList.contains('motion-paused')) return;
      var cur = items[i];
      i = (i + 1) % items.length;
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      setTimeout(function () { cur.classList.remove('is-leaving'); }, 650);
      items[i].classList.add('is-active');
    }, 4200);
  });

  /* ---------- 스크롤 등장 ---------- */
  var hasIO = 'IntersectionObserver' in window;
  var revealIO = hasIO ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }) : null;
  $$('[data-reveal]').forEach(function (el) { revealIO ? revealIO.observe(el) : el.classList.add('is-in'); });

  /* ---------- 숫자 카운터 ---------- */
  function fmt(n) { return n.toLocaleString('en-US'); }
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = fmt(target) + suffix; return; }
    var t0 = performance.now(), dur = 1700;
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var counters = $$('[data-count]');
  if (hasIO && !reduce && !root.classList.contains('is-embed')) {
    counters.forEach(function (el) { el.textContent = '0' + (el.getAttribute('data-suffix') || ''); });
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); countIO.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  /* ---------- 움직임 멈춤(히어로 영상 대체 모션) ---------- */
  var motionBtns = $$('[data-motion-toggle]');
  function setMotion(paused) {
    document.body.classList.toggle('motion-paused', paused);
    motionBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', paused ? 'true' : 'false');
      var label = $('[data-label]', b);
      if (label) label.textContent = paused ? '움직임 재생' : '움직임 멈춤';
      var use = $('use', b);
      if (use) use.setAttribute('href', paused ? '#i-play' : '#i-pause');
    });
  }
  motionBtns.forEach(function (b) {
    b.addEventListener('click', function () { setMotion(!document.body.classList.contains('motion-paused')); });
  });
  if (reduce) setMotion(true);

  /* ---------- 상담 절차 경로 (스크롤에 따라 그려짐) ---------- */
  var processes = $$('[data-process]').map(function (sec) {
    return { sec: sec, svg: $('.process__svg', sec), track: $('.process__track', sec), line: $('.process__line', sec), dots: $$('.step__dot', sec), len: 0, stops: [] };
  }).filter(function (p) { return p.svg && p.line && p.dots.length > 1; });

  function layoutProcess(p) {
    var r = p.sec.getBoundingClientRect();
    p.svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
    var pts = p.dots.map(function (d) {
      var b = d.getBoundingClientRect();
      return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2];
    });
    var d = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C ' + c1[0] + ' ' + c1[1] + ', ' + c2[0] + ' ' + c2[1] + ', ' + p2[0] + ' ' + p2[1];
    }
    p.line.setAttribute('d', d);
    if (p.track) p.track.setAttribute('d', d);
    p.len = p.line.getTotalLength();
    p.line.style.strokeDasharray = p.len + ' ' + p.len;
    var samples = 160, best = pts.map(function () { return { dist: Infinity, at: 0 }; });
    for (var s = 0; s <= samples; s++) {
      var at = (s / samples) * p.len, pt = p.line.getPointAtLength(at);
      pts.forEach(function (q, k) {
        var dd = (pt.x - q[0]) * (pt.x - q[0]) + (pt.y - q[1]) * (pt.y - q[1]);
        if (dd < best[k].dist) best[k] = { dist: dd, at: at };
      });
    }
    p.stops = best.map(function (b) { return b.at / p.len; });
  }
  function updateProcess() {
    var vh = window.innerHeight;
    processes.forEach(function (p) {
      if (!p.len) return;
      var r = p.sec.getBoundingClientRect();
      var prog = reduce ? 1 : clamp((vh * 0.78 - r.top) / (r.height * 0.8), 0, 1);
      p.line.style.strokeDashoffset = p.len * (1 - prog);
      p.dots.forEach(function (dot, k) {
        var step = dot.closest('.step');
        if (step) step.classList.toggle('is-lit', prog > 0.01 && prog >= p.stops[k] - 0.005);
      });
    });
  }
  function layoutAll() { processes.forEach(layoutProcess); updateProcess(); }

  /* ---------- 탭 ---------- */
  $$('[data-tabs]').forEach(function (w) {
    var tabs = $$('[role="tab"]', w);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          select(tabs[n], true);
        }
      });
    });
  });

  /* ---------- 캐러셀 버튼 ---------- */
  $$('[data-carousel]').forEach(function (c) {
    var track = $('[data-carousel-track]', c);
    if (!track) return;
    var go = function (dir) { track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' }); };
    var prev = $('[data-carousel-prev]', c), next = $('[data-carousel-next]', c);
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
  });

  /* ---------- 게시판: 분류 · 업무분야 · 검색 · 페이지 ---------- */
  function initBoard(board) {
    var items = $$('[data-item]', board);
    var filters = $$('[data-filter]', board);
    var area = $('[data-filter-area]', board);
    var q = $('[data-filter-q]', board);
    var count = $('[data-board-count]', board);
    var empty = $('[data-board-empty]', board);
    var pager = $('[data-pager]', board);
    var per = parseInt(board.getAttribute('data-per') || '10', 10);
    var listTop = $('.board-tools', board) || board;
    var state = { cat: params.get('cat') || 'all', area: params.get('area') || 'all', q: (params.get('q') || '').trim().toLowerCase(), page: 1 };
    if (q && state.q) q.value = params.get('q').trim();
    if (!filters.some(function (b) { return b.getAttribute('data-filter') === state.cat; })) state.cat = 'all';
    if (area) {
      area.value = state.area;
      if (area.value !== state.area) { state.area = 'all'; area.value = 'all'; }
    }
    function match(el) {
      if (state.cat !== 'all' && el.getAttribute('data-cat') !== state.cat) return false;
      if (state.area !== 'all' && (' ' + el.getAttribute('data-area') + ' ').indexOf(' ' + state.area + ' ') < 0) return false;
      if (state.q && el.getAttribute('data-text').indexOf(state.q) < 0) return false;
      return true;
    }
    function button(label, page, opts) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
      if (opts && opts.current) b.setAttribute('aria-current', 'page');
      if (opts && opts.disabled) b.disabled = true;
      b.addEventListener('click', function () { state.page = page; render(true); });
      return b;
    }
    function render(scroll) {
      var list = items.filter(match);
      var pages = Math.max(1, Math.ceil(list.length / per));
      state.page = clamp(state.page, 1, pages);
      items.forEach(function (el) { el.hidden = true; });
      list.slice((state.page - 1) * per, state.page * per).forEach(function (el) { el.hidden = false; });
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === state.cat ? 'true' : 'false'); });
      if (count) count.innerHTML = '총 <b>' + list.length + '</b>개 글' + (pages > 1 ? ' · ' + state.page + ' / ' + pages + '쪽' : '');
      if (empty) empty.hidden = list.length > 0;
      if (pager) {
        pager.innerHTML = '';
        if (pages > 1) {
          pager.appendChild(button('‹', state.page - 1, { aria: '이전 쪽', disabled: state.page === 1 }));
          for (var i = 1; i <= pages; i++) pager.appendChild(button(String(i), i, { aria: i + '쪽', current: i === state.page }));
          pager.appendChild(button('›', state.page + 1, { aria: '다음 쪽', disabled: state.page === pages }));
        }
      }
      if (scroll) listTop.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    filters.forEach(function (b) {
      b.addEventListener('click', function () { state.cat = b.getAttribute('data-filter'); state.page = 1; render(); });
    });
    $$('[data-set-filter]', board).forEach(function (b) {
      b.addEventListener('click', function () { state.cat = b.getAttribute('data-set-filter'); state.page = 1; render(true); });
    });
    if (area) area.addEventListener('change', function () { state.area = area.value; state.page = 1; render(); });
    if (q) q.addEventListener('input', function () { state.q = q.value.trim().toLowerCase(); state.page = 1; render(); });
    /* 시연판(live.js)이 글을 새로 채운 뒤 다시 계산한다 */
    board._vkRefresh = function () {
      items = $$('[data-item]', board);
      filters.forEach(function (b) {
        var c = b.getAttribute('data-filter');
        var n = c === 'all' ? items.length : items.filter(function (el) { return el.getAttribute('data-cat') === c; }).length;
        var small = $('small', b);
        if (small) small.textContent = n;
      });
      render(false);
    };
    render(false);
  }
  $$('[data-board]').forEach(initBoard);

  /* ---------- 페이지 안 메뉴(서브 내비) 현재 위치 ---------- */
  var subnav = $('[data-subnav]');
  if (subnav && hasIO) {
    var sLinks = $$('a[href^="#"]', subnav);
    var sMap = {};
    sLinks.forEach(function (a) { sMap[a.getAttribute('href').slice(1)] = a; });
    var row = $('.container', subnav);
    var sIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = sMap[en.target.id];
        if (!a) return;
        sLinks.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'location');
        if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: a.offsetLeft - row.clientWidth / 2 + a.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(sMap).forEach(function (id) { var s = document.getElementById(id); if (s) sIO.observe(s); });
  }

  /* ---------- 상담 폼(시안: 전송하지 않음) ---------- */
  function syncConditional(f) {
    $$('[data-show-if]', f).forEach(function (box) {
      var rule = box.getAttribute('data-show-if').split('=');
      var picked = f.querySelector('[name="' + rule[0] + '"]:checked');
      box.hidden = !(picked && picked.value === rule[1]);
    });
  }
  function syncCounter(f) {
    $$('[data-counter-for]', f).forEach(function (c) {
      var ta = document.getElementById(c.getAttribute('data-counter-for'));
      if (ta) c.textContent = fmt(ta.value.length) + ' / ' + fmt(parseInt(ta.getAttribute('maxlength') || '1000', 10));
    });
  }
  $$('form[data-mock-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      $$('[required]', f).forEach(function (inp) {
        var bad;
        if (inp.type === 'checkbox') bad = !inp.checked;
        else if (inp.type === 'radio') bad = !f.querySelector('input[name="' + inp.name + '"]:checked');
        else bad = !String(inp.value).trim();
        var wrap = inp.closest('.field, .check');
        if (wrap) wrap.classList.toggle('is-invalid', bad);
        if (bad && !firstBad) firstBad = inp;
      });
      if (firstBad) { firstBad.focus(); toast(f.getAttribute('data-msg-bad') || '필수 항목을 확인해 주세요.'); return; }
      f.reset();
      setTimeout(function () { syncConditional(f); syncCounter(f); }, 0);
      toast(f.getAttribute('data-msg-ok') || '시안이라 실제로 전송되지는 않습니다. 실제 사이트에서는 접수 확인 메일이 발송됩니다.');
    });
    function clear(e) {
      var wrap = e.target.closest('.field, .check');
      if (wrap) wrap.classList.remove('is-invalid');
      syncConditional(f);
      syncCounter(f);
    }
    f.addEventListener('input', clear);
    f.addEventListener('change', clear);
    syncConditional(f);
    syncCounter(f);
  });

  /* 비자 진단 결과에서 넘어온 경우 상담 신청서 채우기 */
  (function prefill() {
    var f = $('form[data-mock-form][data-prefill]');
    if (!f) return;
    var areaVal = params.get('area'), note = params.get('note');
    var sel = f.querySelector('[name="area"]');
    if (areaVal && sel) { sel.value = areaVal; if (sel.value !== areaVal) sel.value = ''; }
    var msg = f.querySelector('[name="message"]');
    if (note && msg) msg.value = note + '\n';
    syncCounter(f);
    if (note) toast('1분 비자 진단 결과로 상담 신청서를 채워 두었습니다.');
  })();

  /* ---------- 링크 복사 ---------- */
  $$('[data-copy-link]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = location.href;
      var done = function () { toast('링크를 복사했습니다.'); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
      else toast('링크: ' + url);
    });
  });

  /* ---------- 읽기 진행 막대 · 목차 ---------- */
  var progressEl = $('[data-progress]');
  var articleEl = $('[data-article]');
  function updateProgress() {
    if (!progressEl || !articleEl) return;
    var r = articleEl.getBoundingClientRect();
    var total = r.height - window.innerHeight * 0.6;
    progressEl.style.transform = 'scaleX(' + clamp(-r.top / Math.max(total, 1), 0, 1) + ')';
  }
  var tocIO = null;
  function initToc() {
    var toc = $('[data-toc]');
    if (!toc || !hasIO) return;
    if (tocIO) tocIO.disconnect();
    var links = $$('a[href^="#"]', toc).filter(function (a) {
      return (a.parentNode === toc || a.parentNode.hasAttribute('data-post-toc-links')) && a.getAttribute('href').length > 1;
    });
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    tocIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        if (map[en.target.id]) map[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) tocIO.observe(h); });
  }
  initToc();

  /* ---------- LA 스카이라인 (A안 히어로) ---------- */
  $$('[data-skyline]').forEach(function (svg) {
    var NS = 'http://www.w3.org/2000/svg', W = 1600, H = 440;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    var seed = 17;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var mk = function (tag, attrs, parent) {
      var el = document.createElementNS(NS, tag);
      for (var k in attrs) el.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(el);
      return el;
    };
    var stars = mk('g', { 'class': 'sky-stars' });
    for (var s = 0; s < 46; s++) mk('circle', { cx: rnd() * W, cy: rnd() * H * 0.45, r: (rnd() * 1.1 + 0.35).toFixed(2), 'class': 'star s' + Math.floor(rnd() * 4) }, stars);
    var far = mk('g', { 'class': 'sky-far' });
    var x = 0;
    while (x < W) { var fw = 26 + rnd() * 64, fh = 70 + rnd() * 150; mk('rect', { x: x, y: H - fh, width: fw, height: fh }, far); x += fw + rnd() * 5; }
    var near = mk('g', { 'class': 'sky-near' });
    var lights = mk('g', { 'class': 'sky-lights' });
    x = -12; var n = 0;
    while (x < W) {
      var w = 48 + rnd() * 86, h = 100 + rnd() * 170, top;
      n++;
      if (n === 8) { /* 왕관형 고층 타워 */
        h = 372; top = H - h;
        mk('rect', { x: x, y: top, width: w, height: h }, near);
        mk('rect', { x: x + w * 0.12, y: top - 16, width: w * 0.76, height: 16 }, near);
        mk('rect', { x: x + w * 0.3, y: top - 28, width: w * 0.4, height: 12 }, near);
        mk('rect', { x: x + w * 0.48, y: top - 54, width: 3, height: 26 }, near);
      } else if (n === 13) { /* 첨탑형 타워 */
        h = 342; top = H - h + 46;
        mk('path', { d: 'M' + x + ' ' + H + ' V' + top + ' L' + (x + w * 0.5) + ' ' + (top - 76) + ' L' + (x + w) + ' ' + top + ' V' + H + ' Z' }, near);
        mk('rect', { x: x + w * 0.5 - 1, y: top - 118, width: 2, height: 44, 'class': 'spire' }, near);
      } else {
        top = H - h;
        mk('rect', { x: x, y: top, width: w, height: h }, near);
      }
      var cols = Math.max(2, Math.floor(w / 15)), rows = Math.floor((H - top - 24) / 17);
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          if (rnd() > 0.2) continue;
          mk('rect', { x: (x + 7 + c * ((w - 14) / cols)).toFixed(1), y: (top + 16 + r * 17).toFixed(1), width: 4, height: 6, 'class': 'win w' + Math.floor(rnd() * 5) }, lights);
        }
      }
      x += w + 2 + rnd() * 9;
    }
  });

  /* ---------- 1분 비자 진단 ---------- */
  var quiz = $('#quiz');
  var lastOpener = null;
  var Q = [
    { key: 'where', q: '지금 어디에 계신가요?', opts: [['us', '미국에 있어요'], ['kr', '한국에 있어요'], ['etc', '그 외 국가에 있어요']] },
    { key: 'goal', q: '가장 가까운 목표는 무엇인가요?', opts: [
      ['family', '가족과 함께 미국에서 살고 싶어요'],
      ['work', '미국에서 일하고 싶어요 (취업·NIW·간호사)'],
      ['study', '유학하거나 사업·투자를 하고 싶어요'],
      ['citizen', '영주권자인데 시민권을 받고 싶어요'],
      ['defense', '이민법원 통지나 과거 기록 문제가 있어요']] },
    { key: 'stage', q: '지금 상황에 가장 가까운 것은?', opts: [['new', '처음 알아보는 중이에요'], ['filed', '이미 서류를 냈어요 (진행 중)'], ['issue', '거절·지연·추가 서류 요청(RFE)을 받았어요']] }
  ];
  var R = {
    family: { area: 'green', anchor: 't-family', title: '이민비자·영주권 › 가족초청', text: '시민권자·영주권자 가족 초청, 배우자 초청, 신분조정(I-485) 또는 영사수속이 해당될 수 있습니다.', reads: ['시민권자 배우자 초청 - 반드시 같이 살아야 하나요?', 'ESTA(무비자) 입국 후 시민권자와 결혼 - 영주권 승인'] },
    work: { area: 'green', anchor: 't-employment', title: '이민비자·영주권 › 취업이민', text: '취업이민(EB-2·EB-3), 국가이익면제(NIW), 간호사(RN) 취업이민, 취업비자(H-1B) 등이 해당될 수 있습니다.', reads: ['화학공학 석사학위 소지자 NIW 승인', '취업이민 영주권을 진행하려고 하는데요'] },
    study: { area: 'nonimm', anchor: 't-student', title: '비이민비자 › 유학·투자', text: '학생비자(F-1)와 OPT, 소액투자비자(E-2), 주재원비자(L-1) 등이 해당될 수 있습니다.', reads: ['유학생비자 최대 4년, D/S제도 폐지', '유학생들의 취업이민 진행 시 유의사항'] },
    citizen: { area: 'citizen', anchor: 't-n400', title: '시민권 › 귀화 신청', text: '귀화 신청(N-400) 자격, 체류 기간, 인터뷰와 시험 준비가 해당될 수 있습니다.', reads: ['영구영주권(정식영주권) 승인 없이 시민권 신청?', '비시민권자의 유권자 등록과 투표권 행사'] },
    defense: { area: 'defense', anchor: 't-court', title: '추방재판·이민구제', text: '추방재판 대응, 웨이버(I-601·I-601A), 과거 기록 문제 검토가 필요할 수 있습니다. 기한이 있는 경우가 많아 빠른 상담을 권합니다.', reads: ['601 waiver 승인 케이스 공유', '20년 동안 가족을 돌본 아들, I-601 Waiver 승인 사례'] }
  };
  var AREA_LABEL = { green: '이민비자·영주권', nonimm: '비이민비자', citizen: '시민권', defense: '추방재판·이민구제' };
  var answers = {}, step = 0;

  function renderQuiz() {
    var body = $('[data-quiz-body]', quiz);
    var bar = $('.quiz__progress span', quiz);
    if (step < Q.length) {
      var item = Q[step];
      bar.style.width = ((step) / Q.length * 100) + '%';
      var html = '<p class="quiz__step">STEP ' + (step + 1) + ' / ' + Q.length + '</p>' +
        '<h2 class="quiz__q" id="quiz-title">' + item.q + '</h2><div class="quiz__options">';
      item.opts.forEach(function (o) {
        html += '<button type="button" class="quiz__opt" data-val="' + o[0] + '"><span>' + o[1] + '</span><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></button>';
      });
      html += '</div>';
      if (step > 0) html += '<button type="button" class="quiz__back" data-quiz-back><svg class="ic" aria-hidden="true"><use href="#i-arrow-left"/></svg>이전 질문</button>';
      body.innerHTML = html;
      $$('.quiz__opt', body).forEach(function (b) {
        b.addEventListener('click', function () { answers[item.key] = b.getAttribute('data-val'); step++; renderQuiz(); });
      });
      var back = $('[data-quiz-back]', body);
      if (back) back.addEventListener('click', function () { step--; renderQuiz(); });
      var first = $('.quiz__opt', body);
      if (first) first.focus();
    } else {
      bar.style.width = '100%';
      var res = R[answers.goal] || R.family;
      var hub = HUB[res.area];
      var urgent = answers.stage === 'issue' || answers.goal === 'defense';
      var where = answers.where === 'kr' ? '한국에 계셔도 전화·화상·카카오톡으로 상담할 수 있습니다.' : (answers.where === 'etc' ? '해외에 계셔도 전화·화상 상담이 가능합니다.' : '로스앤젤레스 윌셔 사무실 방문 상담도 가능합니다.');
      var html2 = '<div class="quiz__result"><p class="quiz__step">진단 결과</p><h2 id="quiz-title">' + res.title + '</h2><p>' + res.text + ' ' + where + '</p>' +
        (urgent ? '<p class="quiz__badge"><svg class="ic" aria-hidden="true"><use href="#i-clock"/></svg>기한이 중요한 상황일 수 있어요. 빠른 상담을 권합니다.</p>' : '') +
        '<div class="quiz__reads"><a href="' + hub + '#' + res.anchor + '"><svg class="ic" aria-hidden="true"><use href="#i-compass"/></svg>' + AREA_LABEL[res.area] + ' 안내 페이지 보기</a>' +
        res.reads.map(function (t) { return '<a href="' + hub + '#related"><svg class="ic" aria-hidden="true"><use href="#i-doc"/></svg>' + t + '</a>'; }).join('') + '</div>' +
        '<div class="quiz__actions"><button type="button" class="btn btn--primary" data-quiz-apply>이 결과로 상담 신청</button><button type="button" class="btn btn--ghost" data-quiz-restart>다시 하기</button></div>' +
        '<p class="quiz__fine">간단한 안내이며 법률 자문이 아닙니다. 정확한 판단은 상담에서 사실관계를 확인한 뒤 드립니다.</p></div>';
      body.innerHTML = html2;
      $('[data-quiz-restart]', body).addEventListener('click', function () { answers = {}; step = 0; renderQuiz(); });
      $('[data-quiz-apply]', body).addEventListener('click', function () {
        var stage = (Q[2].opts.filter(function (o) { return o[0] === answers.stage; })[0] || ['', ''])[1];
        var note = '[1분 비자 진단] ' + res.title + ' / ' + stage;
        var form = $('form[data-mock-form]');
        var sel = form && form.querySelector('[name="area"]');
        if (!sel) {
          location.href = 'contact.html?area=' + res.area + '&note=' + encodeURIComponent(note) + '#form';
          return;
        }
        sel.value = res.area;
        var msg = form.querySelector('[name="message"]');
        if (msg) msg.value = note + '\n';
        syncCounter(form);
        closeQuiz(true);
        (form.closest('section') || form).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        toast(AREA_LABEL[res.area] + ' 상담으로 신청서를 채워 두었습니다.');
        setTimeout(function () { var n = form.querySelector('[name="name"]'); if (n) n.focus({ preventScroll: true }); }, reduce ? 0 : 600);
      });
      $('[data-quiz-apply]', body).focus();
    }
  }
  function quizOpen() { return quiz && quiz.classList.contains('is-open'); }
  function openQuiz(opener) {
    if (!quiz) return;
    lastOpener = opener || null;
    answers = {}; step = 0;
    quiz.classList.add('is-open');
    quiz.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderQuiz();
  }
  function closeQuiz(keepFocus) {
    if (!quizOpen()) return;
    quiz.classList.remove('is-open');
    quiz.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastOpener && !keepFocus) lastOpener.focus();
  }
  $$('[data-quiz-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); setNav(false); openQuiz(b); }); });
  if (quiz) {
    quiz.addEventListener('click', function (e) { if (e.target === quiz || e.target.closest('[data-quiz-dismiss]')) closeQuiz(); });
  }

  /* ---------- 키보드: Esc 닫기 · Tab 가두기 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (quizOpen()) closeQuiz();
      else setNav(false);
      return;
    }
    if (e.key !== 'Tab') return;
    if (quizOpen()) trap($('.modal__panel', quiz), e);
    else if (navOpen() && mnav) trap(mnav, e);
  });

  /* ---------- 시연판(live.js)에 넘기는 기능 ---------- */
  window.VKMockup = {
    toast: toast,
    initToc: initToc,
    refreshBoard: function (board) { if (board && board._vkRefresh) board._vkRefresh(); },
    layout: layoutAll
  };

  /* ---------- 연도 ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 시작 ---------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layoutAll, 150); });
  window.addEventListener('load', layoutAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAll);
  layoutAll();
  onScroll();
})();
