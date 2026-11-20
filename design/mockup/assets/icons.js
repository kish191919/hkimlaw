/* 시안 공통 SVG 아이콘 스프라이트.
   file:// 로 열어도 동작하도록 HTML 대신 스크립트로 삽입한다. <body> 바로 아래에서 불러올 것. */
(function () {
  function sym(id, body, fill) {
    return '<symbol id="' + id + '" viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') +
      '" stroke="' + (fill ? 'none' : 'currentColor') +
      '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + body + '</symbol>';
  }
  var s = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">' +
    sym('i-phone', '<path d="M5.6 3.5h3.1l1.6 4.1-2.1 1.3a11.6 11.6 0 0 0 5.9 5.9l1.3-2.1 4.1 1.6v3.1a2 2 0 0 1-2.1 2A16.4 16.4 0 0 1 3.5 5.6a2 2 0 0 1 2.1-2.1z"/>') +
    sym('i-chat', '<path d="M12 3.6c-5 0-9 3.2-9 7.1 0 2.5 1.7 4.8 4.3 6l-1 3.7 4.2-2.7c.5.1 1 .1 1.5.1 5 0 9-3.2 9-7.1S17 3.6 12 3.6z"/>', true) +
    sym('i-mail', '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>') +
    sym('i-pin', '<path d="M12 21s-6.8-6-6.8-11.2a6.8 6.8 0 0 1 13.6 0C18.8 15 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>') +
    sym('i-clock', '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>') +
    sym('i-arrow', '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>') +
    sym('i-arrow-left', '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>') +
    sym('i-arrow-ur', '<path d="M7 17L17 7M9 7h8v8"/>') +
    sym('i-up', '<path d="M12 19V5M6 11l6-6 6 6"/>') +
    sym('i-play', '<path d="M8 5.2v13.6L19.2 12z"/>', true) +
    sym('i-pause', '<rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/>', true) +
    sym('i-family', '<circle cx="8" cy="7.5" r="3"/><circle cx="16.5" cy="9" r="2.4"/><path d="M2.8 20a5.2 5.2 0 0 1 10.4 0M12.8 20a3.8 3.8 0 0 1 7.6 0"/>') +
    sym('i-briefcase', '<rect x="3" y="7" width="18" height="13" rx="2.2"/><path d="M8.5 7V5.4A1.9 1.9 0 0 1 10.4 3.5h3.2a1.9 1.9 0 0 1 1.9 1.9V7M3 12.5h18M10.5 12.5v1.8h3v-1.8"/>') +
    sym('i-cap', '<path d="M2.5 9.2L12 4.5l9.5 4.7L12 14z"/><path d="M6.5 11.3v4.6c0 1.4 2.5 2.9 5.5 2.9s5.5-1.5 5.5-2.9v-4.6M21.5 9.2v5"/>') +
    sym('i-flag', '<path d="M5.5 21V4M5.5 4.5h11l-2.2 4 2.2 4h-11"/>') +
    sym('i-shield', '<path d="M12 3.2l7.6 2.9v5.6c0 4.4-3.2 8.2-7.6 9.1-4.4-.9-7.6-4.7-7.6-9.1V6.1z"/><path d="M8.8 12.1l2.2 2.2 4.3-4.4"/>') +
    sym('i-doc', '<path d="M7 3.5h7l4.5 4.5v12.5H7z"/><path d="M14 3.5V8h4.5M9.8 12.5h5.8M9.8 16h5.8"/>') +
    sym('i-calendar', '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.8h17M8 3v4M16 3v4"/>') +
    sym('i-check', '<path d="M5 12.6l4.4 4.4L19 7.4"/>') +
    sym('i-link', '<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1.2 1.2"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1.2-1.2"/>') +
    sym('i-menu', '<path d="M4 7h16M4 12h16M4 17h10"/>') +
    sym('i-close', '<path d="M6 6l12 12M18 6L6 18"/>') +
    sym('i-compass', '<circle cx="12" cy="12" r="8.8"/><path d="M15.6 8.4l-2 5.2-5.2 2 2-5.2z"/>') +
    sym('i-star', '<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>', true) +
    sym('i-star-line', '<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>') +
    sym('i-tv', '<rect x="3" y="6" width="18" height="12.5" rx="2.2"/><path d="M8.5 21h7M9 2.8l3 3.2 3-3.2"/>') +
    sym('i-globe', '<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2M12 3.2c2.4 2.4 3.6 5.4 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.4-3.6-8.8S9.6 5.6 12 3.2z"/>') +
    sym('i-plane', '<path d="M21 3.2L3.2 10.6l6.9 2.6 2.6 6.9z"/><path d="M10.1 13.2L21 3.2"/>') +
    sym('i-search', '<circle cx="11" cy="11" r="6.8"/><path d="M16 16l4.5 4.5"/>') +
    sym('i-quote', '<path d="M9.6 6.5C6.4 7.6 4.5 10 4.5 13.4V18h5.6v-5.6H7.4c0-2 1-3.3 2.9-4.1zM19.1 6.5c-3.2 1.1-5.1 3.5-5.1 6.9V18h5.6v-5.6h-2.7c0-2 1-3.3 2.9-4.1z"/>', true) +
    sym('i-pen', '<path d="M4 20l4.2-1 10.2-10.2a2.1 2.1 0 0 0-3-3L5.2 16z"/><path d="M13.8 7.4l2.9 2.9"/>') +
    sym('i-users', '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M16 4.8a3.4 3.4 0 0 1 0 6.4M18 14.2a6 6 0 0 1 3.2 5.8"/>') +
    sym('i-youtube', '<rect x="2.5" y="5.5" width="19" height="13" rx="3.6"/><path d="M10.2 9.3v5.4l4.7-2.7z" fill="currentColor"/>') +
    sym('i-instagram', '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>') +
    sym('i-facebook', '<path d="M14.5 8.2h2.4V4.6h-2.6c-2.7 0-4.2 1.6-4.2 4.3v2.2H7.6v3.5h2.5v6.8h3.6v-6.8h2.7l.5-3.5h-3.2V9.4c0-.8.3-1.2.8-1.2z"/>') +
    sym('i-threads', '<path d="M16.6 11.1c-.4-2.6-2.2-3.9-4.6-3.9-2.6 0-4.4 1.8-4.4 4.4M16.6 11.1c2.7.9 3.6 2.8 3 4.9-.8 3-3.8 4.5-7.6 4.5-4.9 0-8-3.3-8-8.5s3.1-8.5 8-8.5c3.4 0 6 1.5 7.2 4.3M16.6 11.1c-1.1-.4-2.4-.5-3.9-.4-2.4.2-3.7 1.4-3.6 2.9.1 1.4 1.5 2.3 3.3 2.2 2.4-.2 3.9-1.8 4.2-4.7z"/>') +
    sym('i-naver', '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M9 16V8l6 8V8"/>') +
    '</svg>';
  document.body.insertAdjacentHTML('afterbegin', s);
})();
