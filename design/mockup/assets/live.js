/* 시연판: Supabase에 저장된 글을 사이트에 띄운다.
   - 게시판(이민법 소식·전문가 칼럼), 홈 소식·칼럼, 최신 소식 띠, 업무분야 관련 글, 게시글 상세(post.html?id=)
   - 설정(assets/config.js)이 없거나 불러오기에 실패하면 페이지에 미리 들어 있는 정적 내용을 그대로 둔다.
   - 글 본문은 DOMPurify로 정리한 뒤 넣는다. */
(function () {
  'use strict';
  var cfg = window.VK_CONFIG || {};
  var M = window.VKMockup || {};
  var root = document.documentElement;
  function done() { root.classList.remove('post-loading'); }
  if (!cfg.supabaseUrl || !cfg.supabaseKey || !window.supabase) { done(); return; }

  var ASSET = ((document.currentScript && document.currentScript.src) || '').replace(/live\.js(\?.*)?$/, '') || 'assets/';
  var sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  var theme = root.getAttribute('data-theme') || 'a';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);

  var TYPE = { bulletin: '영주권 문호', policy: '정책·규정', court: '법원 판결', notice: '이민국 공지', guide: '실무 가이드', qna: 'Q&A 해설', 'case': '승인 사례', view: '변호사의 시선' };
  var HUB = {
    green: { name: '이민비자·영주권', slug: 'practice-green-card.html' },
    nonimm: { name: '비이민비자', slug: 'practice-nonimmigrant-visa.html' },
    citizen: { name: '시민권', slug: 'practice-citizenship.html' },
    defense: { name: '추방재판·이민구제', slug: 'practice-removal-defense.html' }
  };
  var ART = { guide: ['art-guide', 'doc', 'PRACTICAL GUIDE'], qna: ['art-qna', 'chat', 'Q&amp;A'], 'case': ['art-case', 'check', 'CASE RESULT'], view: ['art-view', 'pen', 'PERSPECTIVE'],
    bulletin: ['art-guide', 'calendar', 'VISA BULLETIN'], policy: ['art-qna', 'doc', 'POLICY'], court: ['art-view', 'shield', 'COURT'], notice: ['art-qna', 'flag', 'NOTICE'] };
  var LIST_FIELDS = 'id,board,type,title,summary,hubs,tags,external_url,source,published_at,updated_at,has_body,cover_url,video_id,video_shape';
  var STORAGE = cfg.supabaseUrl.replace(/\/$/, '') + '/storage/v1/object/public/post-images/';
  var YT_ID = /^[A-Za-z0-9_-]{11}$/;
  var CAFE_TOAST = '네이버 카페에 올리신 글입니다. 실제 사이트에서는 이 사이트 안의 글 화면으로 열립니다.';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  var dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' });
  function ymd(ts) { return dayFmt.format(new Date(ts)); }               /* 2026-11-17 */
  function dot(ts) { return ymd(ts).replace(/-/g, '.'); }                /* 2026.11.17 */
  function sum1(p) { return (p.summary && p.summary[0]) || ''; }
  function internal(p) { return p.has_body || p.source === 'site'; }
  function link(p) {
    if (internal(p)) return { href: 'post.html?id=' + p.id, attrs: '', ext: false };
    if (p.external_url) return { href: esc(p.external_url), attrs: ' target="_blank" rel="noopener"', ext: true };
    return { href: '#', attrs: ' data-toast="' + CAFE_TOAST + '"', ext: false };
  }
  function nw(l) { return l.ext ? '<span class="sr-only"> (새 창)</span>' : ''; }
  function searchText(p) {
    return esc([p.title, sum1(p), TYPE[p.type]].concat(p.tags || [], (p.hubs || []).map(function (h) { return HUB[h] ? HUB[h].name : ''; })).join(' ').toLowerCase());
  }
  /* 표지 사진: 글쓰기 화면에서 올린 사진(cover_url)이 먼저, 없으면 기존 글의 기본 표지(assets/covers.js) */
  function coverOf(p) {
    if (p.cover_url) return p.cover_url;
    var m = window.VK_COVERS || {};
    var f = (p.external_url && m[p.external_url]) || m[p.title];
    return f ? ASSET + f : '';
  }
  function dataAttrs(p) { return ' data-item data-cat="' + p.type + '" data-area="' + (p.hubs || []).join(' ') + '" data-text="' + searchText(p) + '"'; }
  function isNew(p) { return Date.now() - new Date(p.published_at).getTime() < 3 * 864e5 && p.source === 'site'; }
  function newBadge(p) { return isNew(p) ? '<span class="chip chip--new">NEW</span>' : ''; }

  /* ---------- 조각 ---------- */
  function boardRow(p, n) {
    var l = link(p);
    var hubs = (p.hubs || []).slice(0, 2).map(function (h) { return '<span class="chip chip--line">' + HUB[h].name + '</span>'; }).join('');
    return '<li class="brow"' + dataAttrs(p) + '><a href="' + l.href + '"' + l.attrs + '>' +
      '<span class="brow__no">' + n + '</span><time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time>' +
      '<div class="brow__body"><div class="brow__head"><span class="chip">' + TYPE[p.type] + '</span>' + hubs + newBadge(p) + '</div>' +
      '<h3>' + esc(p.title) + nw(l) + '</h3><p>' + esc(sum1(p)) + '</p></div>' + ic(l.ext ? 'arrow-ur' : 'arrow') + '</a></li>';
  }
  function colCard(p, opt) {
    opt = opt || {};
    var a = ART[p.type] || ART.guide, l = link(p), cover = coverOf(p);
    var art = cover
      ? '<div class="col-card__art ' + a[0] + ' has-cover"><img src="' + esc(cover) + '" alt="" loading="lazy"><span class="col-card__kicker">' + a[2] + '</span></div>'
      : (theme === 'a'
        ? '<div class="col-card__art ' + a[0] + '">' + ic(a[1]) + '<span class="col-card__kicker">' + a[2] + '</span></div>'
        : '<div class="col-card__art ' + a[0] + '"><span class="col-card__kicker">' + a[2] + '</span>' + ic(a[1]) + '</div>');
    var bits = '<span class="chip">' + TYPE[p.type] + '</span>' + newBadge(p) + '<h3>' + esc(p.title) + nw(l) + '</h3>' +
      (opt.summary ? '<p class="col-card__sum">' + esc(sum1(p)) + '</p>' : '') +
      '<time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time>';
    var inner = theme === 'a' ? art + '<div class="col-card__body">' + bits + '</div>' : art + bits;
    return '<a class="col-card" href="' + l.href + '"' + l.attrs + (opt.data ? dataAttrs(p) : '') + '>' + inner + '</a>';
  }
  function caseCard(p) {
    var l = link(p);
    return '<a class="case" href="' + l.href + '"' + l.attrs + '><div class="case__top"><span class="chip">' + esc((p.tags || [])[0] || '승인 사례') + '</span>' +
      '<span class="case__approved">' + ic('check') + 'APPROVED</span></div><h3>' + esc(p.title) + nw(l) + '</h3><p>' + esc(sum1(p)) + '</p>' +
      '<time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time></a>';
  }
  function postRow(p) {
    var l = link(p);
    return '<li><a href="' + l.href + '"' + l.attrs + '><time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time>' +
      '<span class="chip">' + TYPE[p.type] + '</span><strong>' + esc(p.title) + nw(l) + '</strong>' + ic('arrow') + '</a></li>';
  }
  function homeNews(p) {
    var l = link(p), d = dot(p.published_at);
    if (theme === 'a') {
      return '<li class="alert"><a href="' + l.href + '"' + l.attrs + '><time datetime="' + ymd(p.published_at) + '">' + d + '</time>' +
        '<div class="alert__body"><span class="chip">' + TYPE[p.type] + '</span><h3>' + esc(p.title) + nw(l) + '</h3></div>' + ic('arrow-ur') + '</a></li>';
    }
    return '<li class="news-item"><a href="' + l.href + '"' + l.attrs + '><span class="date-badge"><strong>' + d.slice(8) + '</strong><span>' + d.slice(0, 7) + '</span></span>' +
      '<div><span class="chip">' + TYPE[p.type] + '</span><h3>' + esc(p.title) + nw(l) + '</h3><p>' + esc(sum1(p)) + '</p></div>' + ic('arrow') + '</a></li>';
  }
  /* 시안 B 홈 전용 모양 (data-variant). _build/build.py 의 news_tile·col_row·story_slide 와 같은 마크업 */
  var TAG_CODE = { '학생·교환': 'F-1', '취업·투자비자': 'H-1B', '시민권': 'N-400', '방문·무비자': 'ESTA', '영주권 일반': 'I-485', '서류 기한': 'USCIS', '가족이민': 'I-130', '취업이민': 'EB' };
  var TYPE_CODE = { bulletin: 'VISA', policy: 'POLICY', court: 'COURT', notice: 'USCIS' };
  function tileCode(p) {
    var m = /(I-\d{3}[A-Z]?|H-1B|F-1|OPT|ESTA|N-\d{3}|EB-\d|NIW|E-2|L-1|DACA)/.exec(p.title || '');
    if (m) return m[1];
    var tags = p.tags || [];
    for (var i = 0; i < tags.length; i++) if (TAG_CODE[tags[i]]) return TAG_CODE[tags[i]];
    return TYPE_CODE[p.type] || 'NEWS';
  }
  function newsTile(p) {
    var l = link(p);
    return '<li class="ntl"><a href="' + l.href + '"' + l.attrs + '><span class="ntl__code" aria-hidden="true">' + esc(tileCode(p)) + '</span>' +
      '<time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time><h3>' + esc(p.title) + nw(l) + '</h3>' +
      '<span class="ntl__cat">' + TYPE[p.type] + '</span></a></li>';
  }
  function colRow(p) {
    var l = link(p);
    return '<li><a href="' + l.href + '"' + l.attrs + '><span class="colrow__meta"><time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time>' +
      '<span class="chip">' + TYPE[p.type] + '</span>' + newBadge(p) + '</span><h3>' + esc(p.title) + nw(l) + '</h3><p>' + esc(sum1(p)) + '</p></a></li>';
  }
  function storySlide(p) {
    var l = link(p);
    return '<li class="sslide"><span class="sslide__q" aria-hidden="true">' + ic('quote') + '</span><p class="sslide__chip">' + esc((p.tags || []).slice(0, 2).join(' · ') || '승인 사례') + '</p>' +
      '<h3><a href="' + l.href + '"' + l.attrs + '>' + esc(p.title) + nw(l) + '</a></h3><p class="sslide__sum">' + esc(sum1(p)) + '</p>' +
      '<p class="sslide__meta"><time datetime="' + ymd(p.published_at) + '">' + dot(p.published_at) + '</time> · 김형걸 변호사</p></li>';
  }
  /* 홈 영상 칸: 글에 넣은 유튜브 영상 (A: 숏츠 카드, B: 영상 칼럼 카드) */
  function ytThumb(p) { return 'https://i.ytimg.com/vi/' + p.video_id + '/hqdefault.jpg'; }
  function shortCard(p) {
    var l = link(p);
    return '<a class="short has-thumb" href="' + l.href + '"' + l.attrs + '><img class="short__thumb" src="' + ytThumb(p) + '" alt="" loading="lazy">' +
      '<span class="short__play">' + ic('play') + '</span><span class="short__series">' + TYPE[p.type] + '</span><h3>' + esc(p.title) + nw(l) + '</h3>' +
      '<span class="short__meta"><span>' + (p.video_shape === 'short' ? 'YouTube Shorts' : 'YouTube') + '</span><span>' + dot(p.published_at) + '</span></span></a>';
  }
  function vidCard(p) {
    var l = link(p);
    return '<article class="vid"><a class="vthumb" href="' + l.href + '"' + l.attrs + '><img class="vthumb__yt" src="' + ytThumb(p) + '" alt="" loading="lazy">' +
      '<span class="vthumb__series" aria-hidden="true">' + (p.video_shape === 'short' ? 'YOUTUBE SHORTS' : 'YOUTUBE') + '</span>' +
      '<span class="vthumb__play" aria-hidden="true">' + ic('play') + '</span><span class="sr-only">' + esc(p.title) + ' 영상 보기</span></a>' +
      '<h3>' + esc(p.title) + '</h3><p>' + esc(sum1(p)) + '</p></article>';
  }
  function bulletinMonth(p) {
    var m = /(\d{1,2})월/.exec(p.title);
    return m ? m[1] : String(new Date(p.published_at).getMonth() + 1);
  }

  /* ---------- 채우기 ---------- */
  function fillTicker(news) {
    $$('[data-ticker] .ticker__item').forEach(function (a, i) {
      var p = news[i];
      if (!p) return;
      var l = link(p);
      a.setAttribute('href', internal(p) ? l.href : 'news.html');
      var d = $('.ticker__date', a), t = $('.ticker__title', a);
      if (d) d.textContent = dot(p.published_at);
      if (t) t.textContent = p.title;
    });
  }
  function fillVb(el, vb) {
    if (!el || !vb) return;
    var l = link(vb);
    var month = $('.vb-card__month, .vb__month, .board-pin__month', el);
    if (month) month.innerHTML = bulletinMonth(vb) + '<span>월</span>';
    var h = $('h2, h3', el);
    if (h) h.textContent = vb.title;
    var desc = $('.vb__desc, [data-live-vb-desc]', el);
    if (desc) desc.textContent = sum1(vb);
    var btn = $('a.btn', el);
    if (btn) {
      btn.setAttribute('href', internal(vb) ? l.href : vb.external_url || 'news.html?cat=bulletin');
      if (l.ext) { btn.setAttribute('target', '_blank'); btn.setAttribute('rel', 'noopener'); } else { btn.removeAttribute('target'); }
      btn.removeAttribute('data-toast');
    }
  }
  function fillBoards(all) {
    $$('[data-live-board]').forEach(function (board) {
      var kind = board.getAttribute('data-live-board');
      var items = all.filter(function (p) { return p.board === kind; });
      if (!items.length) return;
      if (kind === 'news') {
        var list = $('.brows', board);
        if (list) list.innerHTML = items.map(function (p, i) { return boardRow(p, items.length - i); }).join('');
        fillVb($('[data-live-pin]', board), items.filter(function (p) { return p.type === 'bulletin'; })[0]);
      } else {
        var grid = $('.col-board', board);
        if (grid) grid.innerHTML = items.map(function (p) { return colCard(p, { data: true, summary: true }); }).join('');
        var feat = items.filter(internal)[0];
        var fe = $('[data-live-feature]', board);
        if (fe && feat) {
          var a = ART[feat.type] || ART.guide, href = 'post.html?id=' + feat.id, fc = coverOf(feat);
          var art = $('.col-feature__art', fe);
          if (art) {
            art.className = 'col-feature__art ' + a[0] + (fc ? ' has-cover' : '');
            art.setAttribute('href', href);
            art.innerHTML = fc ? '<img src="' + esc(fc) + '" alt=""><span class="col-card__kicker">' + a[2] + '</span>' : ic(a[1]) + '<span class="col-card__kicker">' + a[2] + '</span>';
          }
          var tags = $('.post-tags', fe);
          if (tags) tags.innerHTML = '<span class="chip">' + TYPE[feat.type] + '</span>' + (feat.hubs || []).slice(0, 1).map(function (h) { return '<span class="chip chip--line">' + HUB[h].name + '</span>'; }).join('');
          var h2 = $('h2 a', fe);
          if (h2) { h2.textContent = feat.title; h2.setAttribute('href', href); }
          var sp = $('[data-live-feature-sum]', fe);
          if (sp) sp.textContent = sum1(feat);
          var meta = $('.col-feature__meta span', fe);
          if (meta) meta.textContent = '김형걸 변호사 · ' + dot(feat.published_at);
          $$('a.btn', fe).forEach(function (b) { b.setAttribute('href', href); });
        }
      }
      if (M.refreshBoard) M.refreshBoard(board);
    });
  }
  function fillHome(all) {
    var news = all.filter(function (p) { return p.board === 'news'; });
    var cols = all.filter(function (p) { return p.board === 'column'; });
    var notCase = function (p) { return p.type !== 'case'; };
    /* 홈에서 같은 글이 두 번 나오지 않게: 영주권 문호는 문호 카드에만, 승인 사례는 승인 사례 섹션에만 */
    $$('[data-live-home="news"]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-limit') || '5', 10);
      var list = news.filter(function (p) { return p.type !== 'bulletin'; }).slice(0, n);
      el.innerHTML = list.map(el.getAttribute('data-variant') === 'tiles' ? newsTile : homeNews).join('');
    });
    $$('[data-live-home="columns"]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-limit') || '6', 10);
      var list = cols.filter(notCase).slice(0, n);
      el.innerHTML = el.getAttribute('data-variant') === 'rows'
        ? list.map(colRow).join('')
        : list.map(function (p) { return colCard(p); }).join('');
    });
    $$('[data-live-home="cases"]').forEach(function (el) {
      var cases = cols.filter(function (p) { return p.type === 'case'; });
      el.innerHTML = el.getAttribute('data-variant') === 'slides'
        ? cases.slice(0, 5).map(storySlide).join('')
        : cases.slice(0, 3).map(caseCard).join('');
    });
    $$('[data-live-vb]').forEach(function (el) { fillVb(el, news.filter(function (p) { return p.type === 'bulletin'; })[0]); });
    var withVideo = all.filter(function (p) { return p.video_id && YT_ID.test(p.video_id); });
    $$('[data-live-home="videos"]').forEach(function (el) {
      if (!withVideo.length) return;  /* 영상이 없으면 예시 카드를 그대로 둔다 */
      var n = parseInt(el.getAttribute('data-limit') || '4', 10), vids = withVideo.slice(0, n);
      el.innerHTML = vids.map(el.getAttribute('data-variant') === 'vids' ? vidCard : shortCard).join('');
      var note = el.parentNode.querySelector('.shorts-note span, .shorts-note');
      if (note) note.lastChild.textContent = '변호사님이 글에 넣은 유튜브 영상이 자동으로 이 자리에 나타납니다.';
    });
  }
  function fillHubs(all) {
    $$('[data-live-hub-count]').forEach(function (el) {
      var k = el.getAttribute('data-live-hub-count');
      el.textContent = all.filter(function (p) { return (p.hubs || []).indexOf(k) >= 0; }).length;
    });
    $$('[data-live-hub-related]').forEach(function (el) {
      var k = el.getAttribute('data-live-hub-related');
      el.innerHTML = all.filter(function (p) { return (p.hubs || []).indexOf(k) >= 0 && p.type !== 'case'; }).slice(0, 6).map(postRow).join('');
    });
    $$('[data-live-hub-cases]').forEach(function (el) {
      var k = el.getAttribute('data-live-hub-cases');
      var cases = all.filter(function (p) { return (p.hubs || []).indexOf(k) >= 0 && p.type === 'case'; }).slice(0, 4);
      el.innerHTML = cases.map(caseCard).join('');
      var sec = el.closest('section');
      if (sec) sec.hidden = !cases.length;
    });
  }

  /* ---------- 게시글 상세 ---------- */
  function cleanBody(html) {
    var safe = window.DOMPurify ? window.DOMPurify.sanitize(html, { ADD_ATTR: ['target'], FORBID_TAGS: ['style', 'form', 'input', 'button'] }) : esc(html);
    var box = document.createElement('div');
    box.innerHTML = safe;
    $$('a[href]', box).forEach(function (a) {
      if (/^https?:/i.test(a.getAttribute('href'))) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    });
    $$('table', box).forEach(function (tb) {
      if (tb.parentNode.classList && tb.parentNode.classList.contains('table-wrap')) return;
      var w = document.createElement('div'); w.className = 'table-wrap';
      tb.parentNode.insertBefore(w, tb); w.appendChild(tb);
    });
    $$('img', box).forEach(function (im) { im.setAttribute('loading', 'lazy'); if (!im.hasAttribute('alt')) im.setAttribute('alt', ''); });
    $$('h2', box).forEach(function (h, i) { h.id = 's' + (i + 1); });
    /* 글쓰기 화면이 링크로 저장해 둔 영상을 재생기로 바꾼다 (유튜브 ID·우리 저장소 주소만 허용) */
    $$('figure[data-media]', box).forEach(function (f) {
      var kind = f.getAttribute('data-media'), wrap = document.createElement('div'), player;
      if (kind === 'youtube') {
        var id = f.getAttribute('data-id') || '';
        if (!YT_ID.test(id)) return;
        var short = f.getAttribute('data-shape') === 'short';
        wrap.className = 'media-embed' + (short ? ' media-embed--short' : '');
        player = document.createElement('iframe');
        player.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
        player.title = 'YouTube 영상';
        player.setAttribute('loading', 'lazy');
        player.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        player.setAttribute('allowfullscreen', '');
        player.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      } else if (kind === 'video') {
        var src = f.getAttribute('data-src') || '';
        if (src.indexOf(STORAGE) !== 0) return;
        wrap.className = 'media-embed media-embed--file';
        player = document.createElement('video');
        player.src = src + '#t=0.1';
        player.controls = true;
        player.preload = 'metadata';
        player.setAttribute('playsinline', '');
      } else return;
      wrap.appendChild(player);
      var a = f.querySelector('a');
      if (a) a.replaceWith(wrap); else f.insertBefore(wrap, f.firstChild);
      f.classList.add('media');
    });
    return box;
  }
  function renderPost(p, all) {
    var art = $('[data-live-post]');
    if (!art) return;
    var boardName = p.board === 'news' ? '이민법 소식' : '전문가 칼럼';
    var boardHref = p.board === 'news' ? 'news.html' : 'column.html';
    var area = (p.hubs || [])[0];
    var titleEnd = document.title.indexOf(' | ');
    document.title = p.title + (titleEnd > 0 ? document.title.slice(titleEnd) : '');

    var crumbs = $('[data-post-crumbs]', art);
    if (crumbs) crumbs.innerHTML = '<a href="index.html">홈</a><span class="sep" aria-hidden="true">›</span><a href="' + boardHref + '">' + boardName +
      '</a><span class="sep" aria-hidden="true">›</span><a href="' + boardHref + '?cat=' + p.type + '">' + TYPE[p.type] + '</a>';
    var tags = $('[data-post-tags]', art);
    if (tags) tags.innerHTML = '<span class="chip">' + TYPE[p.type] + '</span>' +
      (p.hubs || []).map(function (h) { return '<a class="chip chip--line" href="' + HUB[h].slug + '">' + HUB[h].name + '</a>'; }).join('') +
      (p.tags || []).map(function (t) { return '<span class="chip chip--line">' + esc(t) + '</span>'; }).join('');
    var h1 = $('.post-title', art);
    if (h1) h1.textContent = p.title;
    var body = cleanBody(p.body_html || '');
    var text = body.textContent || '';
    var minutes = Math.max(1, Math.round(text.length / 600));
    var meta = $('[data-post-meta]', art);
    if (meta) meta.innerHTML = '<span class="author"><img src="' + ASSET + 'attorney-face.jpg" alt="" width="38" height="38">김형걸 변호사</span>' +
      '<span>작성 ' + dot(p.published_at) + '</span><span class="dot" aria-hidden="true"></span>' +
      '<span>최종 업데이트 ' + dot(p.updated_at || p.published_at) + '</span>' +
      (text ? '<span class="dot" aria-hidden="true"></span><span>읽는 시간 ' + minutes + '분</span>' : '');

    var stale = $('[data-post-stale]', art);
    if (stale) {
      var old = Date.now() - new Date(p.updated_at || p.published_at).getTime() > 365 * 864e5;
      stale.hidden = !old;
      if (old) stale.querySelector('span').textContent = '이 글은 ' + dot(p.updated_at || p.published_at).slice(0, 7).replace('.', '년 ') + '월 기준입니다. 이후 규정이 바뀌었을 수 있으니 최신 정보는 상담으로 확인하세요.';
    }
    var sumBox = $('[data-post-summary]', art);
    if (sumBox) {
      var lines = (p.summary || []).filter(Boolean);
      sumBox.hidden = !lines.length;
      $('ol', sumBox).innerHTML = lines.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    }
    var bodyEl = $('[data-post-body]', art);
    if (bodyEl) {
      bodyEl.innerHTML = '';
      if (p.has_body || (p.body_html || '').trim()) {
        while (body.firstChild) bodyEl.appendChild(body.firstChild);
      } else {
        bodyEl.innerHTML = '<p>' + esc(sum1(p)) + '</p>' + (p.external_url
          ? '<p class="post-external"><a class="btn btn--dark" href="' + esc(p.external_url) + '" target="_blank" rel="noopener">네이버 블로그에서 전문 보기<span class="sr-only"> (새 창)</span> ' + ic('arrow-ur') + '</a></p>' : '');
      }
    }
    var cdis = $('[data-post-case-disclaimer]', art);
    if (cdis) cdis.hidden = p.type !== 'case';
    $$('[data-post-area-link]', document).forEach(function (a) { a.setAttribute('href', 'contact.html' + (area ? '?area=' + area : '') + '#form'); });

    var toc = $('[data-post-toc-links]');
    if (toc) {
      var heads = $$('h2', bodyEl);
      toc.innerHTML = heads.map(function (h) { return '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>'; }).join('');
      var tocNav = toc.closest('.toc');
      if (tocNav) { var t = $('.toc__title', tocNav); if (t) t.hidden = !heads.length; }
      if (M.initToc) M.initToc();
    }
    var same = all.filter(function (x) { return x.board === p.board; });
    var idx = -1;
    same.forEach(function (x, i) { if (x.id === p.id) idx = i; });
    var pn = $('[data-post-prevnext]', art);
    if (pn) {
      var older = same[idx + 1], newer = idx > 0 ? same[idx - 1] : null;
      var cell = function (x, label) {
        if (!x) return '<span class="prevnext__empty"></span>';
        var l = link(x);
        return '<a href="' + l.href + '"' + l.attrs + '><span>' + label + '</span><strong>' + esc(x.title) + '</strong></a>';
      };
      pn.innerHTML = cell(older, '이전 글') + cell(newer, '다음 글');
    }
    var rel = $('[data-post-related]');
    if (rel) {
      var hubs = p.hubs || [];
      var pool = all.filter(function (x) { return x.id !== p.id && (x.hubs || []).some(function (h) { return hubs.indexOf(h) >= 0; }); });
      var pick = pool.filter(internal).concat(pool.filter(function (x) { return !internal(x); })).slice(0, 3);
      if (pick.length) rel.innerHTML = pick.map(function (x) { return colCard(x); }).join('');
      var more = $('[data-post-board-link]');
      if (more) { more.setAttribute('href', boardHref); more.firstChild.textContent = boardName + ' 전체 '; }
    }
  }
  function notFound() {
    var art = $('[data-live-post]');
    if (!art) return;
    var h1 = $('.post-title', art);
    if (h1) h1.textContent = '글을 찾을 수 없습니다';
    var meta = $('[data-post-meta]', art);
    if (meta) meta.innerHTML = '';
    var sumBox = $('[data-post-summary]', art);
    if (sumBox) sumBox.hidden = true;
    var bodyEl = $('[data-post-body]', art);
    if (bodyEl) bodyEl.innerHTML = '<p>지워졌거나 아직 발행되지 않은 글입니다.</p><p><a class="btn btn--dark" href="news.html">이민법 소식 목록</a> <a class="btn btn--ghost" href="column.html">전문가 칼럼 목록</a></p>';
  }

  /* ---------- 시작 ---------- */
  var postId = parseInt(params.get('id') || '', 10);
  var needsList = $('[data-live-board], [data-live-home], [data-live-hub-count], [data-live-hub-related], [data-live-hub-cases], [data-ticker], [data-live-post]');
  if (!needsList && !postId) return;
  var listQ = sb.from('posts').select(LIST_FIELDS).order('published_at', { ascending: false }).limit(500);
  var postQ = postId && $('[data-live-post]') ? sb.from('posts').select('*').eq('id', postId).maybeSingle() : Promise.resolve(null);
  var guard = setTimeout(done, 6000);
  Promise.all([listQ, postQ]).then(function (res) {
    var list = res[0], one = res[1];
    if (list.error) throw list.error;
    var all = list.data || [];
    fillTicker(all.filter(function (p) { return p.board === 'news'; }));
    fillBoards(all);
    fillHome(all);
    fillHubs(all);
    if (one) {
      if (one.error) throw one.error;
      if (one.data) renderPost(one.data, all); else notFound();
    }
  }).catch(function (err) {
    if (window.console) console.warn('[시연판] 글을 불러오지 못해 시안 내용을 그대로 보여 줍니다.', err && err.message);
    if (postId) notFound();
  }).then(function () { clearTimeout(guard); done(); });
})();
