/* 변호사님 글쓰기 바로가기
   - 모든 페이지 맨 아래 '변호사 로그인' 링크(data-admin-link)가 글쓰기 화면으로 간다.
   - 이 브라우저에서 글쓰기 화면에 한 번 로그인해 두면(로그인 상태가 유지된다) 사이트 어디서나
     왼쪽 아래에 글쓰기 버튼이 나타난다. 휴대폰(폭 640px 이하)에서는 base.css가 숨기고,
     푸터 링크('글쓰기 화면')로 들어간다.
       게시판 화면: 그 게시판에 바로 쓰기 / 글 화면(?id=): 이 글 고치기 / 그 밖의 화면: 새 글 쓰기
   - 로그인 여부는 Supabase가 이 사이트 주소에 남겨 둔 로그인 정보가 있는지만 본다. 서버에 묻지 않으므로
     방문자 화면이 느려지지 않는다. 실제 권한은 글쓰기 화면과 데이터베이스(행 수준 보안)가 확인한다.
   - 로그인하지 않은 방문자에게는 아무것도 바뀌지 않는다. */
(function () {
  'use strict';
  var cfg = window.VK_CONFIG || {};
  var link = document.querySelector('[data-admin-link]');
  if (!link || !cfg.supabaseUrl) return;
  if (/(^|[?&])embed/.test(location.search)) return;  /* 표지의 미리보기 창 */

  function signedIn() {
    try {
      var ref = new URL(cfg.supabaseUrl).hostname.split('.')[0];
      var s = JSON.parse(window.localStorage.getItem('sb-' + ref + '-auth-token') || 'null');
      if (s && s.currentSession) s = s.currentSession;  /* 예전 저장 형식 */
      return !!(s && s.refresh_token && s.user);
    } catch (e) { return false; }
  }
  if (!signedIn()) return;

  var BOARD = { news: '이민법 소식', column: '전문가 칼럼' };
  var base = link.getAttribute('href');
  var to = function (q) { return base + (base.indexOf('?') >= 0 ? '&' : '?') + q; };
  var id = parseInt(new URLSearchParams(location.search).get('id') || '', 10);
  var boardEl = document.querySelector('[data-live-board]');
  var board = boardEl ? boardEl.getAttribute('data-live-board') : '';

  var buttons = [];
  if (id > 0 && document.querySelector('[data-live-post]')) {
    buttons.push(['이 글 고치기', to('id=' + id), true]);
    buttons.push(['새 글', base, false]);
  } else if (BOARD[board]) {
    buttons.push([BOARD[board] + ' 쓰기', to('board=' + board), true]);
  } else {
    buttons.push(['새 글 쓰기', base, true]);
  }

  var bar = document.createElement('nav');
  bar.className = 'editbar';
  bar.setAttribute('aria-label', '변호사님 글쓰기 바로가기');
  bar.setAttribute('lang', 'ko');
  var who = document.createElement('span');
  who.className = 'editbar__who';
  who.textContent = '로그인 중';
  bar.appendChild(who);
  buttons.forEach(function (b) {
    var a = document.createElement('a');
    a.className = 'editbar__btn' + (b[2] ? ' editbar__btn--main' : '');
    a.setAttribute('href', b[1]);
    a.innerHTML = b[2] ? '<svg class="ic" aria-hidden="true"><use href="#i-pen"/></svg>' : '';
    a.appendChild(document.createTextNode(b[0]));
    bar.appendChild(a);
  });
  document.body.appendChild(bar);
  document.documentElement.classList.add('has-editbar');
  link.textContent = '글쓰기 화면';
})();
