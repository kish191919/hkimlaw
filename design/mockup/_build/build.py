# -*- coding: utf-8 -*-
"""시안 서브 페이지 생성기 (외부 라이브러리 없음, Python 3.9+).

실행: python3 design/mockup/_build/build.py

a/, b/ 두 시안에 아래 페이지를 같은 구조로 만든다. 색·글꼴·모양은 각 시안의 style.css가 정한다.
  about.html, practice.html, practice-*.html(허브 4개), news.html, column.html,
  contact.html, post.html(게시글 상세), en.html
홈(index.html)은 시안마다 구성이 달라 손으로 관리한다.
"""
import html
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from content import (BLOG, COLUMN_ART, COLUMN_TYPES, HUB_ORDER, HUBS, KBS_POST,  # noqa: E402
                     LA_CONSULATE, NEWS_TYPES, POSTS, SITUATIONS, TYPE_LABEL, VB_URL,
                     VISA_CHIPS)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REVIEWED = "2026.11.19"

PHONE, TEL, EMAIL = "(213) 703-6828", "tel:+12137036828", "vinkimlaw@gmail.com"
ADDR1, ADDR2 = "3600 Wilshire Blvd. Suite 412", "Los Angeles, CA 90010"
MAP_Q = "3600+Wilshire+Blvd+Suite+412,+Los+Angeles,+CA+90010"
KAKAO = 'data-toast="카카오톡 ID: hkimlaw16 (실제 사이트에서는 카카오톡 채팅이 열립니다)"'

THEMES = {
    "a": dict(key="a", label="시안 A · Wilshire Editorial", color="#0B1B33",
              font="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600&display=swap",
              header="site-header site-header--solid", cta="상담 신청", book=False, aside_btn="btn--dark"),
    "b": dict(key="b", label="시안 B · Warm Boutique", color="#F5EFE6",
              font="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600&display=swap",
              header="site-header", cta="상담 예약", book=True, aside_btn="btn--primary"),
}

NAV = [("index.html", "홈", "home"), ("about.html", "변호사 소개", "about"),
       ("practice.html", "업무분야", "practice"), ("news.html", "이민법소식", "news"),
       ("column.html", "전문가칼럼", "column"), ("contact.html", "상담안내", "contact")]


def E(s):
    return html.escape(s, quote=True)


def ic(name):
    return '<svg class="ic" aria-hidden="true"><use href="#i-%s"/></svg>' % name


def iso(d):
    return d.replace(".", "-")


def hub_url(key, anchor=""):
    return HUBS[key]["slug"] + ("#" + anchor if anchor else "")


def post_link(p):
    """게시글 링크. 블로그 원문은 새 창, 카페 글은 안내 토스트, 시안 게시글은 post.html."""
    src = p["src"]
    if src == "post":
        return "post.html", ""
    if src.startswith("blog:"):
        return BLOG + src[5:], ' target="_blank" rel="noopener"'
    return "#", ' data-toast="네이버 카페에 올리신 글입니다. 실제 사이트에서는 이 사이트 안의 글 화면으로 열립니다."'


def new_win(p):
    return '<span class="sr-only"> (새 창)</span>' if p["src"].startswith("blog:") else ""


def search_text(p):
    words = [p["title"], p["sum"], TYPE_LABEL[p["type"]]] + p["tags"] + [HUBS[h]["name"] for h in p["hubs"]]
    return E(" ".join(words).lower())


def posts(board=None, hub=None, typ=None):
    out = POSTS
    if board:
        out = [p for p in out if p["board"] == board]
    if hub:
        out = [p for p in out if hub in p["hubs"]]
    if typ:
        out = [p for p in out if p["type"] == typ]
    return out


# ---------------------------------------------------------------------------
# 공통 조각
# ---------------------------------------------------------------------------
def head(t, title, desc, html_cls="", lang="ko", site="김형걸 이민법 변호사"):
    cls = ' class="%s"' % html_cls if html_cls else ""
    return """<!doctype html>
<html lang="{lang}"{cls}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} | {label} · {site}</title>
<meta name="description" content="{desc} (디자인 시안)">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="{color}">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{font}">
<link rel="stylesheet" href="../assets/base.css">
<link rel="stylesheet" href="../assets/pages.css">
<link rel="stylesheet" href="style.css">
</head>
<body>
<script src="../assets/icons.js"></script>
""".format(lang=lang, cls=cls, title=E(title), label=t["label"], site=site, desc=E(desc),
           color=t["color"], font=t["font"])


def skip(label="본문으로 건너뛰기"):
    return '<a class="skip-link" href="#main">%s</a>\n' % label


def ticker():
    return """<div class="ticker" data-ticker>
  <div class="container">
    <span class="ticker__label">NEW</span>
    <div class="ticker__viewport">
      <a class="ticker__item" href="news.html"><span class="ticker__date">2026.11.17</span><span class="ticker__title">연방법원, 유학생 체류기간 제한 규칙 전면 취소</span></a>
      <a class="ticker__item" href="news.html"><span class="ticker__date">2026.11.11</span><span class="ticker__title">승인된 취업비자, 연장 심사 강화 움직임</span></a>
      <a class="ticker__item" href="news.html?cat=bulletin"><span class="ticker__date">2026.10.27</span><span class="ticker__title">2026년 11월 영주권 문호 정리</span></a>
    </div>
    <a class="ticker__more" href="news.html">이민법 소식 전체 {arrow}</a>
  </div>
</div>
""".format(arrow=ic("arrow"))


LANG_KO = ('<div class="lang" role="group" aria-label="언어 선택"><a href="index.html" aria-current="true">KO</a>'
           '<a href="en.html" lang="en" hreflang="en">EN</a></div>')
LANG_EN = ('<div class="lang" role="group" aria-label="Language"><a href="index.html" lang="ko" hreflang="ko">KO</a>'
           '<a href="en.html" aria-current="true">EN</a></div>')


def logo(ko="김형걸 이민법 변호사", en="Law Offices of Vincent Kim", label="김형걸 이민법 변호사 홈", href="index.html"):
    return ('<a class="logo" href="%s" aria-label="%s"><span class="logo__mark">VK</span>'
            '<span class="logo__text"><span class="logo__ko">%s</span><span class="logo__en">%s</span></span></a>'
            % (href, label, ko, en))


def current(key, active, section):
    if key == active:
        return ' aria-current="page"'
    if key == section:
        return ' aria-current="true"'
    return ""


def header(t, active, section=None):
    items = "".join('<li><a href="%s"%s>%s</a></li>' % (h, current(k, active, section), l) for h, l, k in NAV)
    book = '<a class="btn btn--sm btn--primary" href="contact.html#form">상담 예약</a>' if t["book"] else ""
    return """<header class="{cls}" data-header>
  <div class="container">
    {logo}
    <nav class="gnav" aria-label="주 메뉴"><ul>{items}</ul></nav>
    <div class="h-actions">
      {lang}
      <a class="btn btn--sm btn--ghost btn--call" href="{tel}">{phone_ic}{phone}</a>
      {book}
      <button class="nav-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mnav" data-nav-toggle>{menu}</button>
    </div>
  </div>
</header>
""".format(cls=t["header"], logo=logo(), items=items, lang=LANG_KO, tel=TEL, phone_ic=ic("phone"), phone=PHONE,
           book=book, menu=ic("menu"))


def mnav(active, section=None):
    links = "".join('<a class="mnav__link" href="%s"%s>%s %s</a>' % (h, current(k, active, section), l, ic("arrow"))
                    for h, l, k in NAV)
    return """<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="모바일 메뉴">
  <button class="mnav__close" type="button" aria-label="메뉴 닫기" data-nav-close>{close}</button>
  {links}
  {lang}
  <div class="mnav__cta">
    <a class="btn btn--kakao btn--lg" href="#" {kakao}>{chat}카카오톡 상담</a>
    <a class="btn btn--primary btn--lg" href="{tel}">{phone_ic}{phone}</a>
  </div>
</div>
""".format(close=ic("close"), links=links, lang=LANG_KO, kakao=KAKAO, chat=ic("chat"), tel=TEL,
           phone_ic=ic("phone"), phone=PHONE)


def footer(page_note):
    menu = "".join('<li><a href="%s">%s</a></li>' % (h, l) for h, l, k in NAV[1:])
    return """<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        {logo}
        <p>로스앤젤레스 윌셔에서 20년 동안 이민법 한길. 영주권·비자·시민권·추방재판을 직접 상담합니다.</p>
        <div class="socials">
          <a href="https://cafe.naver.com/hkimlaw" target="_blank" rel="noopener" aria-label="네이버 카페 (새 창)">{naver}</a>
          <a href="#" aria-label="유튜브" data-toast="유튜브 채널은 개설 예정입니다.">{yt}</a>
          <a href="#" aria-label="인스타그램" data-toast="인스타그램은 개설 예정입니다.">{ig}</a>
          <a href="#" aria-label="스레드" data-toast="스레드는 개설 예정입니다.">{th}</a>
          <a href="#" aria-label="페이스북" data-toast="페이스북 페이지는 개설 예정입니다.">{fb}</a>
        </div>
      </div>
      <div>
        <p class="footer-title">MENU</p>
        <ul class="footer-links">{menu}<li><a href="en.html" lang="en">English</a></li></ul>
      </div>
      <div>
        <p class="footer-title">이민 필수 링크</p>
        <ul class="footer-links">
          <li><a href="https://egov.uscis.gov/casestatus/landing.do" target="_blank" rel="noopener">USCIS 케이스 조회</a></li>
          <li><a href="https://egov.uscis.gov/processing-times/" target="_blank" rel="noopener">USCIS 처리 기간</a></li>
          <li><a href="{vb}" target="_blank" rel="noopener">국무부 Visa Bulletin</a></li>
          <li><a href="https://kr.usembassy.gov/ko/" target="_blank" rel="noopener">주한미국대사관</a></li>
          <li><a href="{la}" target="_blank" rel="noopener">주LA 대한민국 총영사관</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-title">CONTACT</p>
        <ul class="footer-contact">
          <li>{phone_ic}<a href="{tel}">{phone}</a></li>
          <li>{chat}<span>카카오톡 ID hkimlaw16</span></li>
          <li>{mail}<a href="mailto:{email}">{email}</a></li>
          <li>{pin}<span>{a1}<br>{a2}</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <nav aria-label="정책">
        <a href="#" data-toast="시안: 개인정보처리방침 페이지">개인정보처리방침</a>
        <a href="#" data-toast="시안: 면책 고지 페이지">면책 고지</a>
        <a href="#" data-toast="시안: 접근성 안내 페이지">접근성 안내</a>
      </nav>
      <p>본 웹사이트의 정보는 일반적인 법률 정보이며 법률 자문이 아닙니다. 웹사이트 이용이나 문의만으로 변호사-의뢰인 관계가 성립하지 않습니다. 게시글은 작성일 기준이며 이후 법령과 정책이 바뀌었을 수 있습니다.</p>
      <p>Law Offices of Vincent Kim · 책임 변호사 Vincent Kim · {a1}, {a2}</p>
      <p>© <span data-year>2026</span> Law Offices of Vincent Kim. All rights reserved.</p>
      <p class="mock-note">{pen}<span>{note} · <a href="../write.html">변호사님 글쓰기 화면 보기</a></span></p>
    </div>
  </div>
</footer>
""".format(logo=logo(), naver=ic("naver"), yt=ic("youtube"), ig=ic("instagram"), th=ic("threads"),
           fb=ic("facebook"), menu=menu, vb=VB_URL, la=LA_CONSULATE, phone_ic=ic("phone"), tel=TEL, phone=PHONE,
           chat=ic("chat"), mail=ic("mail"), email=EMAIL, pin=ic("pin"), a1=ADDR1, a2=ADDR2, pen=ic("pen"),
           note=page_note)


def floating(t, form_href="contact.html#form"):
    return """<nav class="quick" aria-label="빠른 상담">
  <a class="is-kakao" href="#" {kakao}>{chat}카톡 상담</a>
  <a href="{form}">{pen}{cta}</a>
  <a href="{tel}">{phone}전화</a>
  <button type="button" data-quiz-open>{compass}비자 진단</button>
  <button type="button" data-top>{up}TOP</button>
</nav>
<nav class="mbar" aria-label="모바일 빠른 상담">
  <a class="is-kakao" href="#" {kakao}>{chat}카톡 상담</a>
  <a class="is-main" href="{form}">{pen}빠른 상담</a>
  <a class="is-call" href="{tel}">{phone}전화</a>
</nav>
<div class="modal" id="quiz" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
  <div class="modal__panel">
    <button class="modal__close" type="button" aria-label="닫기" data-quiz-dismiss>{close}</button>
    <div class="quiz__progress"><span></span></div>
    <div data-quiz-body></div>
  </div>
</div>
""".format(kakao=KAKAO, chat=ic("chat"), form=form_href, pen=ic("pen"), cta=t["cta"], tel=TEL, phone=ic("phone"),
           compass=ic("compass"), up=ic("up"), close=ic("close"))


def end(t, page_label):
    return """<a class="mock-tag" href="../index.html">{back}{label} · {page}</a>
<script src="../assets/mockup.js"></script>
</body>
</html>
""".format(back=ic("arrow-left"), label=t["label"], page=page_label)


def page_hero(crumbs, eyebrow, title, lead, actions="", side="", meta="", hid="ph-title"):
    trail = '<a href="index.html">홈</a>'
    for href, label in crumbs[:-1]:
        trail += '<span class="sep" aria-hidden="true">›</span><a href="%s">%s</a>' % (href, label)
    trail += '<span class="sep" aria-hidden="true">›</span><span aria-current="page">%s</span>' % crumbs[-1][1]
    inner_cls = "page-hero__inner" if side else "page-hero__inner page-hero__inner--single"
    acts = '<div class="page-hero__actions">%s</div>' % actions if actions else ""
    return """<section class="page-hero" aria-labelledby="{hid}">
  <div class="container {inner_cls}">
    <div>
      <nav class="crumbs" aria-label="현재 위치">{trail}</nav>
      <p class="eyebrow">{eyebrow}</p>
      <h1 class="page-hero__title" id="{hid}">{title}</h1>
      <p class="page-hero__lead">{lead}</p>
      {acts}
      {meta}
    </div>
    {side}
  </div>
</section>
""".format(hid=hid, inner_cls=inner_cls, trail=trail, eyebrow=eyebrow, title=title, lead=lead, acts=acts,
           meta=meta, side=side)


def subnav(items, label="페이지 내 메뉴"):
    links = "".join('<a href="#%s">%s</a>' % (i, l) for i, l in items)
    return '<nav class="subnav" aria-label="%s" data-subnav><div class="container">%s</div></nav>\n' % (label, links)


def sec_head(eyebrow, title, hid, desc="", right=""):
    extra = right or ('<p class="sec-head__desc">%s</p>' % desc if desc else "")
    return ('<div class="sec-head"><div><p class="eyebrow">%s</p><h2 class="sec-head__title" id="%s">%s</h2></div>%s</div>'
            % (eyebrow, hid, title, extra))


def mini_head(eyebrow, title, hid, right=""):
    return ('<div class="mini-head"><div><p class="eyebrow">%s</p><h2 class="sec-title" id="%s">%s</h2></div>%s</div>'
            % (eyebrow, hid, title, right))


def memo(text):
    return '<p class="mock-memo">%s<span><b>시안 메모</b> %s</span></p>' % (ic("pen"), text)


def tbd(label="확인 필요"):
    return '<span class="tbd-chip">%s</span>' % label


def cta_strip(t, title="내 상황에 맞는 길이 궁금하다면", text="사실관계를 들어 보고 가능한 방법과 위험을 정직하게 말씀드립니다. 한국에 계셔도 전화·화상·카카오톡으로 상담할 수 있습니다.",
              href="contact.html#form"):
    return """<section class="cta-strip" aria-labelledby="cta-title">
  <div class="container">
    <div class="cta-strip__card">
      <div>
        <h2 id="cta-title">{title}</h2>
        <p>{text}</p>
      </div>
      <div class="btns">
        <a class="btn btn--primary btn--lg" href="{href}">{cta}하기 {arrow}</a>
        <a class="btn btn--kakao btn--lg" href="#" {kakao}>{chat}카톡 상담</a>
        <a class="btn btn--ghost btn--lg" href="{tel}">{phone_ic}{phone}</a>
      </div>
    </div>
  </div>
</section>
""".format(title=title, text=text, href=href, cta=t["cta"], arrow=ic("arrow"), kakao=KAKAO, chat=ic("chat"),
           tel=TEL, phone_ic=ic("phone"), phone=PHONE)


def ph_card(title, items, extra=""):
    lis = "".join("<li>%s<span>%s</span></li>" % (ic(i), txt) for i, txt in items)
    return '<aside class="ph-card"><p class="ph-card__title">%s</p><ul>%s</ul>%s</aside>' % (title, lis, extra)


# ---------------------------------------------------------------------------
# 게시글 표시 조각
# ---------------------------------------------------------------------------
def col_card(t, p, data=False):
    art, icon, kicker = COLUMN_ART[p["type"]]
    href, attrs = post_link(p)
    flag = '<span class="demo-flag">상세 화면 예시</span>' if p["src"] == "post" else ""
    attrs += (' data-item data-cat="%s" data-area="%s" data-text="%s"' % (p["type"], " ".join(p["hubs"]), search_text(p))
              if data else "")
    chip = '<span class="chip">%s</span>' % TYPE_LABEL[p["type"]]
    h3 = "<h3>%s%s</h3>" % (E(p["title"]), new_win(p))
    summ = '<p class="col-card__sum">%s</p>' % E(p["sum"])
    when = '<time datetime="%s">%s</time>' % (iso(p["date"]), p["date"])
    if t["key"] == "a":
        inner = ('<div class="col-card__art %s">%s%s<span class="col-card__kicker">%s</span></div>'
                 '<div class="col-card__body">%s%s%s%s</div>' % (art, flag, ic(icon), kicker, chip, h3, summ, when))
    else:
        inner = ('<div class="col-card__art %s">%s<span class="col-card__kicker">%s</span>%s</div>%s%s%s%s'
                 % (art, flag, kicker, ic(icon), chip, h3, summ, when))
    return '<a class="col-card" href="%s"%s>%s</a>' % (href, attrs, inner)


def board_row(p, n):
    href, attrs = post_link(p)
    hubs = "".join('<span class="chip chip--line">%s</span>' % HUBS[h]["name"] for h in p["hubs"][:2])
    arrow = ic("arrow-ur") if p["src"].startswith("blog:") else ic("arrow")
    return """<li class="brow" data-item data-cat="{cat}" data-area="{area}" data-text="{text}">
  <a href="{href}"{attrs}>
    <span class="brow__no">{n}</span>
    <time datetime="{iso}">{date}</time>
    <div class="brow__body">
      <div class="brow__head"><span class="chip">{label}</span>{hubs}</div>
      <h3>{title}{nw}</h3>
      <p>{sum}</p>
    </div>
    {arrow}
  </a>
</li>""".format(cat=p["type"], area=" ".join(p["hubs"]), text=search_text(p), href=href, attrs=attrs, n=n,
                iso=iso(p["date"]), date=p["date"], label=TYPE_LABEL[p["type"]], hubs=hubs, title=E(p["title"]),
                nw=new_win(p), sum=E(p["sum"]), arrow=arrow)


def case_card(p):
    href, attrs = post_link(p)
    return ('<a class="case" href="%s"%s><div class="case__top"><span class="chip">%s</span>'
            '<span class="case__approved">%sAPPROVED</span></div><h3>%s%s</h3><p>%s</p><time datetime="%s">%s</time></a>'
            % (href, attrs, p["tags"][0], ic("check"), E(p["title"]), new_win(p), E(p["sum"]), iso(p["date"]), p["date"]))


def post_row(p):
    href, attrs = post_link(p)
    return ('<li><a href="%s"%s><time datetime="%s">%s</time><span class="chip">%s</span><strong>%s%s</strong>%s</a></li>'
            % (href, attrs, iso(p["date"]), p["date"], TYPE_LABEL[p["type"]], E(p["title"]), new_win(p), ic("arrow")))


CASE_DISCLAIMER = ('<p class="disclaim">%s개별 사건의 결과는 사실관계와 법적 상황에 따라 다르며, 과거의 결과가 향후 유사한 사건의 결과를 보장하지 않습니다. '
                   '사례는 의뢰인 동의를 받아 식별 정보를 지운 뒤 싣습니다.</p>' % ic("shield"))


# ---------------------------------------------------------------------------
# 변호사 소개
# ---------------------------------------------------------------------------
def page_about(t):
    photo = """<figure class="ph-photo">
      <div class="ph-photo__img"><img src="../assets/attorney.jpg" alt="사무실에서 업무 중인 김형걸 변호사" width="1230" height="1121">
        <figcaption><strong>김형걸 · Vincent Kim</strong><span>ATTORNEY AT LAW</span></figcaption></div>
    </figure>"""
    actions = ('<a class="btn btn--primary btn--lg" href="contact.html#form">%s하기 %s</a>'
               '<a class="btn btn--ghost btn--lg" href="#media">%s방송 출연 보기</a>' % (t["cta"], ic("arrow"), ic("tv")))
    meta = ('<p class="page-hero__meta"><span>%s이민법 20년</span><span>%s한국어·영어 상담</span><span>%s로스앤젤레스 윌셔</span></p>'
            % (ic("check"), ic("check"), ic("check")))
    hero = page_hero([("about.html", "변호사 소개")], "About the attorney", "김형걸 변호사<br><em>Vincent Kim</em>",
                     "로스앤젤레스 윌셔에서 20년 동안 이민법 한 분야만 다뤄 왔습니다. 첫 상담부터 결과까지 변호사가 직접 챙깁니다.",
                     actions, photo, meta)
    sub = subnav([("greeting", "인사말"), ("career", "약력"), ("principles", "일하는 방식"),
                  ("media", "미디어·기고"), ("community", "커뮤니티")])

    greeting = """<section class="section" id="greeting" aria-labelledby="greet-title">
  <div class="container greet">
    <div>
      <p class="eyebrow">Greeting</p>
      <h2 class="sr-only" id="greet-title">인사말</h2>
      <blockquote class="greet__quote">{quote}이민 서류 한 장에는<br>한 가족의 몇 년이<br>걸려 있습니다.</blockquote>
    </div>
    <div class="greet__body">
      <p>안녕하세요, 이민법 변호사 김형걸입니다.</p>
      <p>이민 서류 한 장에는 한 가족의 몇 년이 걸려 있습니다. 그래서 저는 20년 동안 로스앤젤레스 윌셔의 한 자리에서, 상담부터 결과까지 제가 직접 챙기는 방식을 지켜 왔습니다.</p>
      <p>이민법은 자주 바뀝니다. 2015년부터 네이버 카페와 블로그에 새 소식을 정리해 온 것도 그 때문입니다. 바뀐 규정이 내 상황에 어떤 의미인지 정확히 아는 것이 좋은 결정의 시작이라고 믿습니다.</p>
      <p>가능한 길과 위험을 정직하게 말씀드리겠습니다. 처음 연락하시는 순간부터 끝까지 함께하겠습니다.</p>
      <div class="greet__sign"><img src="../assets/attorney-face.jpg" alt="" width="64" height="64" loading="lazy"><div><strong>김형걸 Vincent Kim</strong><span>ATTORNEY AT LAW</span></div></div>
      {memo}
    </div>
  </div>
</section>
""".format(quote=ic("quote"), memo=memo("인사말은 예시 문안입니다. 킥오프 인터뷰에서 변호사님께 직접 들은 이야기로 다시 씁니다."))

    cred = [("이름", "김형걸 (Vincent Kim)"), ("직함", "Attorney at Law · 이민법"),
            ("변호사 자격", "등록 주·연도 " + tbd()), ("학력", "학교·학위 " + tbd()),
            ("소속 단체", "예: 미국이민변호사협회(AILA) " + tbd()), ("상담 언어", "한국어 · 영어"),
            ("사무실", ADDR1 + ", Los Angeles")]
    cred_html = "".join("<div><dt>%s</dt><dd>%s</dd></div>" % (a, b) for a, b in cred)
    timeline = [
        ("시작 연도 " + tbd(), "로스앤젤레스에서 이민법 실무 시작", "그 뒤 20년 동안 이민법 한 분야만 다뤄 왔습니다.", ""),
        ("2015", "네이버 카페 ‘김형걸 변호사의 미국 비자 미국 이민’ 개설", "질문답변, 이민법 소식, 비자 유형별 게시판에서 질문에 직접 답해 왔습니다.", ""),
        ("2019.06", "KBS America News 출연", "이민 정책의 변화를 설명했습니다.", ""),
        ("2026.05", "KBS America News 출연", "방송에서 이민법 소식을 해설했습니다.", ""),
        ("2027 (예정)", "홈페이지 오픈 · 유튜브 ‘1분 이민법’ 시작", "카페·블로그에 쓰던 글을 홈페이지에 먼저 싣습니다.", " is-future"),
    ]
    tl_html = "".join('<li class="tl%s"><time>%s</time><strong>%s</strong><p>%s</p></li>' % (c, a, b, d)
                      for a, b, d, c in timeline)
    career = """<section class="section sec-alt" id="career" aria-labelledby="career-title">
  <div class="container">
    {head}
    <div class="career">
      <dl class="cred">{cred}</dl>
      <ol class="timeline">{tl}</ol>
    </div>
    {memo}
  </div>
</section>
""".format(head=sec_head("Profile", "약력", "career-title", "학력과 자격 사항은 변호사님께 받은 뒤 채웁니다. 구조화 데이터(검색엔진용 변호사 정보)에도 같은 내용이 들어갑니다."),
           cred=cred_html, tl=tl_html, memo=memo("‘확인 필요’ 표시는 변호사님께 여쭤볼 항목입니다. 표시는 실제 사이트에서 빠집니다."))

    principles = [
        ("01", "변호사가 직접 상담합니다", "첫 상담부터 인터뷰 준비까지 김형걸 변호사가 직접 듣고 설명합니다."),
        ("02", "가능성과 위험을 정직하게 말씀드립니다", "될 일과 어려운 일을 처음부터 구분해 말씀드립니다. 결과를 장담하지 않고, 근거를 보여 드립니다."),
        ("03", "끝까지 소통합니다", "진행 상황을 먼저 알려 드리고, 규정이 바뀌면 내 케이스에 어떤 영향이 있는지 바로 설명합니다."),
    ]
    pr_html = "".join('<article class="principle"><span class="principle__no">%s</span><h3>%s</h3><p>%s</p></article>' % p
                      for p in principles)
    principles_sec = """<section class="section sec-band" id="principles" aria-labelledby="pr-title">
  <div class="container">
    {head}
    <div class="principles">{items}</div>
    {memo}
  </div>
</section>
""".format(head=sec_head("How I work", "이렇게 일합니다", "pr-title", "20년 동안 지켜 온 원칙을 세 가지로 정리했습니다."),
           items=pr_html, memo=memo("세 가지 원칙은 예시입니다. 인터뷰에서 변호사님 표현으로 확정합니다."))

    media = """<section class="section" id="media" aria-labelledby="media-title">
  <div class="container">
    {head}
    <div class="media-grid">
      <article class="video-card">
        <button type="button" class="video-card__thumb" data-toast="방송 영상은 사용 허락을 받은 뒤 이 자리에서 바로 재생됩니다."><span class="video-card__label">KBS AMERICA NEWS</span><span class="video-card__play">{play}</span><span class="video-card__date">2026.05.15</span><span class="sr-only">영상 재생</span></button>
        <h3>KBS America News 출연</h3>
        <p>방송 날짜 2026.05.15 · <a href="{kbs}" target="_blank" rel="noopener">블로그 게시글 보기<span class="sr-only"> (새 창)</span></a></p>
      </article>
      <article class="video-card">
        <button type="button" class="video-card__thumb video-card__thumb--alt" data-toast="방송 영상은 사용 허락을 받은 뒤 이 자리에서 바로 재생됩니다."><span class="video-card__label">KBS AMERICA NEWS</span><span class="video-card__play">{play}</span><span class="video-card__date">2019.06.12</span><span class="sr-only">영상 재생</span></button>
        <h3>KBS America News 출연</h3>
        <p>이민법 해설 · 방송 날짜 2019.06.12</p>
      </article>
    </div>
    <ul class="press-list">
      <li><b>칼럼 기고</b><span>미주 한인 언론 이민법 칼럼</span><em>매체명·기간 {tbd}</em></li>
      <li><b>Q&amp;A 답변</b><span>이민 상담 코너 답변</span><em>매체명 {tbd}</em></li>
      <li><b>방송·라디오</b><span>그 밖의 출연 이력</span><em>목록 {tbd}</em></li>
    </ul>
    {memo}
  </div>
</section>
""".format(head=sec_head("Media", "미디어 출연·기고", "media-title", "방송에서, 신문에서, 그리고 매주 카페와 블로그에서 이민법 소식을 전해 왔습니다."),
           play=ic("play"), kbs=KBS_POST, tbd=tbd(),
           memo=memo("방송 화면은 KBS America의 사용 허락을 받은 뒤 영상으로 넣습니다. 언론 로고를 띠로 보여 주는 방식도 가능합니다."))

    channels = [
        ("users", "네이버 카페", "2,100+", "회원", "2015년부터 운영합니다. 질문답변, 이민법 소식, 비자 유형별 게시판에서 질문에 직접 답합니다.",
         '<a class="link-arrow" href="https://cafe.naver.com/hkimlaw" target="_blank" rel="noopener">카페 가기<span class="sr-only"> (새 창)</span> %s</a>' % ic("arrow-ur")),
        ("pen", "네이버 블로그", "1,500+", "편", "미국 이민 소식, 김형걸 이민법 칼럼, 미국생활 이야기를 꾸준히 씁니다.",
         '<a class="link-arrow" href="https://blog.naver.com/hkimlaw" target="_blank" rel="noopener">블로그 가기<span class="sr-only"> (새 창)</span> %s</a>' % ic("arrow-ur")),
        ("chat", "오픈 카카오톡", "새 글", "알림", "새 글이 올라오면 제목과 링크를 바로 알려 드립니다.",
         '<a class="link-arrow" href="#" data-toast="오픈채팅 링크는 확인 후 연결합니다.">참여하기 %s</a>' % ic("arrow")),
        ("youtube", "유튜브 · 인스타그램", "1분", "이민법", "이민법 소식을 1분 영상과 카드뉴스로 전합니다. 개설 예정입니다.",
         '<a class="link-arrow" href="#" data-toast="유튜브 채널은 개설 예정입니다.">알림 받기 %s</a>' % ic("arrow")),
    ]
    ch_html = "".join('<article class="channel"><span class="channel__icon">%s</span><h3>%s</h3><p class="channel__stat">%s<small>%s</small></p><p>%s</p>%s</article>'
                      % (ic(i), n, s, u, d, l) for i, n, s, u, d, l in channels)
    community = """<section class="section sec-alt" id="community" aria-labelledby="com-title">
  <div class="container">
    {head}
    <div class="channel-grid">{items}</div>
  </div>
</section>
""".format(head=sec_head("Community", "카페·블로그에서도 만나요", "com-title", "홈페이지에 먼저 올린 글은 카페·블로그·오픈카톡에도 요약과 링크로 함께 올라갑니다."),
           items=ch_html)

    body = (head(t, "변호사 소개", "김형걸(Vincent Kim) 변호사 소개. 인사말, 약력, 일하는 방식, 방송 출연, 커뮤니티.", "has-subnav")
            + skip() + ticker() + header(t, "about") + mnav("about")
            + '<main id="main">\n' + hero + sub + greeting + career + principles_sec + media + community
            + cta_strip(t, "궁금한 점이 있다면 편하게 물어보세요") + "</main>\n"
            + footer("디자인 시안입니다. 약력·인사말·원칙은 예시이며 확인 후 반영합니다.") + floating(t) + end(t, "변호사 소개"))
    return body


# ---------------------------------------------------------------------------
# 업무분야 개요
# ---------------------------------------------------------------------------
def page_practice(t):
    side_links = "".join('<li><a href="%s"><span><b>%s</b> %s</span>%s</a></li>' % (h["slug"], h["no"], h["name"], ic("arrow"))
                         for h in (HUBS[k] for k in HUB_ORDER))
    side = ('<aside class="ph-card"><p class="ph-card__title">네 개의 분야</p><ul class="ph-card__links">%s</ul></aside>'
            % side_links)
    actions = ('<button class="btn btn--primary btn--lg" type="button" data-quiz-open>%s1분 비자 진단</button>'
               '<a class="btn btn--ghost btn--lg" href="contact.html#form">%s하기</a>' % (ic("compass"), t["cta"]))
    hero = page_hero([("practice.html", "업무분야")], "Practice Areas", "업무분야",
                     "영주권, 비이민비자, 시민권, 추방재판·이민구제. 네 개 분야로 정리했습니다. 비자 이름을 몰라도 지금 상황에서 시작하세요.",
                     actions, side)

    sit = "".join('<li><a href="%s"><strong>%s</strong><span>%s › %s</span>%s</a></li>'
                  % (hub_url(k, a), q, HUBS[k]["name"], lab, ic("arrow")) for q, k, a, lab in SITUATIONS)
    situations = """<section class="section" aria-labelledby="sit-title">
  <div class="container">
    {head}
    <ul class="sit-list">{items}</ul>
  </div>
</section>
""".format(head=sec_head("Where to start", "어떤 상황이신가요?", "sit-title", "가장 가까운 상황을 고르면 해당 업무분야의 안내로 바로 이동합니다. 잘 모르겠다면 1분 비자 진단을 해 보세요."),
           items=sit)

    cards = ""
    for k in HUB_ORDER:
        h = HUBS[k]
        chips = "".join("<li>%s</li>" % ty[1] for ty in h["types"][:6])
        n = len(posts(hub=k))
        cards += """<a class="hub-card" href="{slug}">
  <div class="hub-card__top"><span class="hub-card__icon">{icon}</span><span class="hub-card__no">{no}</span></div>
  <h3>{name}</h3>
  <p>{card}</p>
  <ul>{chips}</ul>
  <div class="hub-card__foot"><span class="hub-card__count">관련 소식·칼럼 <b>{n}</b>편</span><span class="link-arrow">자세히 보기 {arrow}</span></div>
</a>""".format(slug=h["slug"], icon=ic(h["icon"]), no=h["no"], name=h["name"], card=h["card"], chips=chips, n=n,
               arrow=ic("arrow"))
    hubs = """<section class="section sec-alt" aria-labelledby="hubs-title">
  <div class="container">
    {head}
    <div class="hub-cards">{cards}</div>
  </div>
</section>
""".format(head=sec_head("Four practice areas", "네 개의 분야", "hubs-title", "각 분야 페이지에는 대상, 세부 유형, 절차, 준비 서류, 자주 묻는 질문, 관련 글이 정리돼 있습니다."),
           cards=cards)

    how = """<section class="section sec-band" aria-labelledby="how-title">
  <div class="container">
    {head}
    <ol class="how">
      <li><b>STEP 1</b><h3>지금처럼 글을 씁니다</h3><p>이민법 소식이나 칼럼을 카페에 쓰시던 것처럼 홈페이지에 씁니다.</p></li>
      <li><b>STEP 2</b><h3>업무분야를 체크합니다</h3><p>글쓰기 화면 오른쪽에서 ‘가족이민’, ‘시민권’처럼 해당 분야를 고릅니다.</p></li>
      <li><b>STEP 3</b><h3>분야 페이지에 자동으로 쌓입니다</h3><p>해당 업무분야 페이지의 ‘관련 소식·칼럼’에 바로 실립니다. 따로 고칠 필요가 없습니다.</p></li>
    </ol>
    {memo}
  </div>
</section>
""".format(head=sec_head("How it works", "업무분야 페이지는<br>이렇게 채워집니다", "how-title", "고정 페이지로 구조를 잡고, 변호사님이 쓰시는 글로 깊이를 더합니다. 1년이면 분야마다 관련 글이 수십 편 쌓입니다."),
           memo='<p class="mock-memo">%s<span><b>시안 메모</b> 지금 각 분야 페이지의 관련 글은 블로그 실제 글(2026년 3~11월)을 분야별로 나눠 넣은 것입니다. <a href="../write.html">글쓰기 화면 시안 보기</a></span></p>' % ic("pen"))

    chips = "".join('<a href="%s">%s</a>' % (hub_url(k, a), lab) for lab, k, a in VISA_CHIPS)
    finder = """<section class="section" aria-labelledby="finder-title">
  <div class="container">
    {head}
    <div class="chips-cloud">{chips}</div>
  </div>
</section>
""".format(head=sec_head("Quick find", "비자·서류 이름으로 찾기", "finder-title"), chips=chips)

    return (head(t, "업무분야", "영주권·비이민비자·시민권·추방재판 등 김형걸 변호사의 업무분야 안내.")
            + skip() + ticker() + header(t, "practice") + mnav("practice")
            + '<main id="main">\n' + hero + situations + hubs + how + finder + cta_strip(t) + "</main>\n"
            + footer("디자인 시안입니다. 업무분야 범위는 변호사님 확인 후 확정합니다.") + floating(t) + end(t, "업무분야"))


# ---------------------------------------------------------------------------
# 업무분야 허브
# ---------------------------------------------------------------------------
def page_hub(t, key):
    h = HUBS[key]
    related = posts(hub=key)
    cases = [p for p in related if p["type"] == "case"]
    rel = [p for p in related if p["type"] != "case"][:6]
    forms = "".join('<span class="chip">%s</span>' % f for f in h["forms"])
    side = ph_card("한눈에 보기", [
        ("doc", "대표 서식 <span class=\"ph-chips\">%s</span>" % forms),
        ("pen", "관련 소식·칼럼 <b>%d</b>편 (자동 연결)" % len(related)),
        ("calendar", "최종 검토 %s · 김형걸 변호사" % REVIEWED),
    ])
    actions = ('<a class="btn btn--primary btn--lg" href="contact.html?area=%s#form">이 분야 %s %s</a>'
               '<a class="btn btn--ghost btn--lg" href="%s">%s%s</a>' % (key, t["cta"], ic("arrow"), TEL, ic("phone"), PHONE))
    hero = page_hero([("practice.html", "업무분야"), (h["slug"], h["name"])], "Practice Area %s · %s" % (h["no"], h["en"]),
                     h["name"], h["lead"], actions, side)
    nav_items = [("who", "대상"), ("types", "세부 유형"), ("process", "진행 절차"), ("docs", "준비 서류"), ("faq", "자주 묻는 질문")]
    if cases:
        nav_items.append(("cases", "승인 사례"))
    nav_items += [("related", "관련 글"), ("links", "공식 링크")]
    sub = subnav(nav_items)

    urgent = ""
    if h["urgent"]:
        urgent = ('<div class="urgent" role="note">%s<div><strong>%s</strong><p>%s</p></div>'
                  '<a class="btn btn--primary" href="%s">%s지금 전화하기</a></div>' % (ic("clock"), h["urgent"][0], h["urgent"][1], TEL, ic("phone")))
    who = "".join("<li>%s<span>%s</span></li>" % (ic("check"), w) for w in h["who"])
    types = ""
    for tid, title, body, tforms in h["types"]:
        fchips = "".join('<span class="chip chip--line">%s</span>' % f for f in tforms)
        fhtml = '<div class="type__forms">%s</div>' % fchips if fchips else ""
        types += ('<article class="type" id="%s"><h3>%s</h3><p>%s</p>%s<a class="link-arrow" href="contact.html?area=%s#form">이 유형 상담하기 %s</a></article>'
                  % (tid, title, body, fhtml, key, ic("arrow")))
    flow = "".join("<li><strong>%s</strong><span>%s</span></li>" % f for f in h["flow"])
    docs = "".join("<li>%s</li>" % d for d in h["docs"])
    faq = "".join("<details%s><summary>%s</summary><p>%s</p></details>" % (" open" if i == 0 else "", q, a)
                  for i, (q, a) in enumerate(h["faq"]))
    links = "".join('<li><a href="%s" target="_blank" rel="noopener">%s<span class="sr-only"> (새 창)</span> %s</a></li>'
                    % (u, l, ic("arrow-ur")) for l, u in h["links"])
    cases_html = ""
    if cases:
        cases_html = """<section id="cases" aria-labelledby="cases-title">
      {head}
      <div class="case-grid">{cards}</div>
      {disc}
    </section>""".format(head=mini_head("Case results", "관련 승인 사례", "cases-title", '<span class="auto-badge">%s자동 연결</span>' % ic("link")),
                         cards="".join(case_card(p) for p in cases[:4]), disc=CASE_DISCLAIMER)
    area_nav = "".join('<a href="%s"%s>%s<span>%s</span></a>' % (HUBS[k]["slug"], ' aria-current="page"' if k == key else "",
                                                               HUBS[k]["name"], HUBS[k]["no"]) for k in HUB_ORDER)

    main = """<section class="section hub-sec">
  <div class="container hub-layout">
    <div class="hub-main">
      {urgent}
      <section id="who" aria-labelledby="who-title">
        {who_head}
        <ul class="who">{who}</ul>
      </section>
      <section id="types" aria-labelledby="types-title">
        {types_head}
        <div class="types">{types}</div>
      </section>
      <section id="process" aria-labelledby="process-title">
        {process_head}
        <ol class="flow">{flow}</ol>
        <p class="note-line">{clock}대표적인 흐름입니다. 사안에 따라 순서와 기간이 달라집니다. 처리 기간은 USCIS 공식 페이지에서 확인하세요.</p>
      </section>
      <section id="docs" aria-labelledby="docs-title">
        {docs_head}
        <ul class="docs">{docs}</ul>
        <p class="note-line">{doc}사안에 따라 필요한 서류가 다릅니다. 정확한 목록은 상담 후 안내해 드립니다.</p>
      </section>
      <section id="faq" aria-labelledby="faq-title">
        {faq_head}
        <div class="faq">{faq}</div>
      </section>
      {cases}
      <section id="related" aria-labelledby="related-title">
        {related_head}
        <ul class="post-rows">{rows}</ul>
        <div class="more-links"><a class="link-arrow" href="news.html?area={key}">이 분야 이민법 소식 전체 {arrow}</a><a class="link-arrow" href="column.html?area={key}">이 분야 칼럼 전체 {arrow}</a></div>
      </section>
      <section id="links" aria-labelledby="links-title">
        {links_head}
        <aside class="official" aria-label="공식 정보 링크"><ul>{links}</ul></aside>
        <p class="review-line">{cal}최종 검토 {reviewed} · 김형걸 변호사. 수수료나 처리 기간처럼 자주 바뀌는 숫자는 적지 않고 공식 페이지로 연결합니다.</p>
        <p class="disclaimer">이 페이지는 일반적인 정보이며 법률 자문이 아닙니다. 개별 사안은 사실관계에 따라 달라질 수 있으니 상담으로 확인하세요.</p>
      </section>
    </div>
    <aside class="hub-aside" aria-label="업무분야 메뉴와 상담">
      <nav class="area-nav" aria-label="업무분야"><p class="area-nav__title">업무분야</p>{area_nav}</nav>
      <div class="help-card">
        <h3>이 분야 상담</h3>
        <p>상황을 들어 보고 가능한 길을 정리해 드립니다.</p>
        <a class="btn btn--primary" href="contact.html?area={key}#form">{cta}하기</a>
        <a class="btn btn--kakao" href="#" {kakao}>{chat}카톡 상담</a>
        <a class="btn btn--ghost" href="{tel}">{phone_ic}{phone}</a>
      </div>
      <button class="aside-quiz" type="button" data-quiz-open>{compass}<span><b>내 상황에 맞는 분야가 맞을까?</b>1분 비자 진단 해 보기</span></button>
    </aside>
  </div>
</section>
""".format(urgent=urgent, who_head=mini_head("Who it's for", "이런 분께 해당합니다", "who-title"), who=who,
           types_head=mini_head("Services", "세부 유형", "types-title"), types=types,
           process_head=mini_head("Process", "진행 절차", "process-title"), flow=flow, clock=ic("clock"),
           docs_head=mini_head("Documents", "대표 준비 서류", "docs-title"), docs=docs, doc=ic("doc"),
           faq_head=mini_head("FAQ", "자주 묻는 질문", "faq-title"), faq=faq, cases=cases_html,
           related_head=mini_head("Latest", "관련 소식·칼럼", "related-title",
                                  '<span class="auto-badge">%s업무분야 체크로 자동 연결</span>' % ic("link")),
           rows="".join(post_row(p) for p in rel), key=key, arrow=ic("arrow"),
           links_head=mini_head("Official", "공식 정보 확인", "links-title"), links=links, cal=ic("calendar"),
           reviewed=REVIEWED, area_nav=area_nav, cta=t["cta"], kakao=KAKAO, chat=ic("chat"), tel=TEL,
           phone_ic=ic("phone"), phone=PHONE, compass=ic("compass"))

    return (head(t, h["name"], h["lead"], "has-subnav") + skip() + ticker() + header(t, None, "practice") + mnav(None, "practice")
            + '<main id="main">\n' + hero + sub + main + "</main>\n"
            + footer("디자인 시안입니다. 업무분야 원고는 초안이며 변호사님 검수 후 게시합니다.") + floating(t, "contact.html?area=%s#form" % key)
            + end(t, h["name"]))


# ---------------------------------------------------------------------------
# 게시판 (이민법 소식 / 전문가 칼럼)
# ---------------------------------------------------------------------------
def board_tools(types, items, label):
    counts = {ty: len([p for p in items if p["type"] == ty]) for ty in types}
    btns = '<button type="button" class="filter" data-filter="all" aria-pressed="true">전체 <small>%d</small></button>' % len(items)
    btns += "".join('<button type="button" class="filter" data-filter="%s" aria-pressed="false">%s <small>%d</small></button>'
                    % (ty, TYPE_LABEL[ty], counts[ty]) for ty in types)
    opts = '<option value="all">전체 업무분야</option>' + "".join('<option value="%s">%s</option>' % (k, HUBS[k]["name"]) for k in HUB_ORDER)
    return """<div class="board-tools">
  <div class="filters" role="group" aria-label="{label} 분류">{btns}</div>
  <div class="board-search">
    <label class="sr-only" for="f-area-filter">업무분야</label>
    <select id="f-area-filter" data-filter-area>{opts}</select>
    <label class="sr-only" for="f-q">글 검색</label>
    <input id="f-q" type="search" placeholder="제목·내용 검색 (예: I-751)" data-filter-q>
  </div>
</div>
<p class="board-count"><span aria-live="polite" data-board-count>총 <b>{n}</b>개 글</span><span>최신순</span></p>""".format(
        label=label, btns=btns, opts=opts, n=len(items))


def page_news(t):
    items = posts(board="news")
    this_month = len([p for p in items if p["date"].startswith("2026.11")])
    side = ph_card("이민법 소식 한눈에", [
        ("calendar", "이번 달 새 글 <b>%d</b>편 · 마지막 업데이트 %s" % (this_month, items[0]["date"])),
        ("doc", "매달 국무부 발표 직후 ‘영주권 문호’ 정리"),
        ("check", "모든 글에 작성일과 최종 업데이트일 표시"),
    ])
    hero = page_hero([("news.html", "이민법 소식")], "Immigration News", "이민법 소식",
                     "정책·판결·이민국 공지를 발표 직후 정리합니다. 바뀐 규정이 누구에게 어떤 영향을 주는지, 지금 무엇을 해야 하는지까지 짚습니다.",
                     "", side)
    vb = posts(board="news", typ="bulletin")[0]
    vb_href, vb_attrs = post_link(vb)
    rows = "".join(board_row(p, len(items) - i) for i, p in enumerate(items))
    board = """<section class="section board-sec" aria-label="이민법 소식 목록">
  <div class="container" data-board data-per="10">
    <div class="board-pin">
      <p class="board-pin__month">11<span>월</span></p>
      <div>
        <p class="eyebrow">고정 · 이달의 영주권 문호</p>
        <h2>{vb_title}</h2>
        <p>{vb_sum}</p>
      </div>
      <div class="btns">
        <a class="btn btn--primary" href="{vb_href}"{vb_attrs}>이번 달 문호 보기<span class="sr-only"> (새 창)</span> {arrow}</a>
        <button class="btn btn--ghost" type="button" data-set-filter="bulletin">지난 문호 모아 보기</button>
      </div>
    </div>
    {tools}
    <ol class="brows">{rows}</ol>
    <p class="board-empty" data-board-empty hidden>조건에 맞는 글이 없습니다. 검색어나 분류를 바꿔 보세요.</p>
    <nav class="pager" aria-label="페이지" data-pager></nav>
    {memo}
  </div>
</section>
""".format(vb_title=E(vb["title"]), vb_sum=E(vb["sum"]), vb_href=vb_href, vb_attrs=vb_attrs, arrow=ic("arrow-ur"),
           tools=board_tools(NEWS_TYPES, items, "이민법 소식"), rows=rows,
           memo=memo("목록은 네이버 블로그(2026년 3~11월)와 카페에 올리신 실제 글입니다. 제목을 누르면 블로그 원문이 새 창으로 열립니다. 실제 홈페이지에서는 <a href=\"post.html\">게시글 화면</a>처럼 이 사이트 안에서 열립니다."))
    follow = """<section class="section sec-alt follow-sec" aria-labelledby="follow-title">
  <div class="container follow">
    <div>
      <p class="eyebrow">Stay updated</p>
      <h2 class="sec-title" id="follow-title">새 소식을 가장 먼저 받아 보세요</h2>
      <p>새 글이 올라오면 오픈 카카오톡과 네이버 카페에 제목과 링크를 바로 올립니다.</p>
    </div>
    <div class="btns">
      <a class="btn btn--kakao btn--lg" href="#" data-toast="오픈채팅 링크는 확인 후 연결합니다.">{chat}오픈채팅 참여</a>
      <a class="btn btn--dark btn--lg" href="https://cafe.naver.com/hkimlaw" target="_blank" rel="noopener">{naver}네이버 카페<span class="sr-only"> (새 창)</span></a>
    </div>
  </div>
</section>
""".format(chat=ic("chat"), naver=ic("naver"))
    return (head(t, "이민법 소식", "영주권 문호, 정책·규정, 법원 판결, 이민국 공지. 김형걸 변호사가 직접 정리하는 이민법 소식.")
            + skip() + ticker() + header(t, "news") + mnav("news") + '<main id="main">\n' + hero + board + follow
            + cta_strip(t, "이 변화가 내 케이스에 어떤 영향이 있을까요?", "바뀐 규정이 내 상황에 어떤 의미인지 상담에서 확인하세요. 한국에 계셔도 상담할 수 있습니다.")
            + "</main>\n" + footer("디자인 시안입니다. 목록의 요약은 원문 첫 문단을 바탕으로 줄였습니다.") + floating(t) + end(t, "이민법 소식"))


def page_column(t):
    items = posts(board="column")
    counts = [(ty, len([p for p in items if p["type"] == ty])) for ty in COLUMN_TYPES]
    side = ph_card("칼럼 분류", [(COLUMN_ART[ty][1], "%s <b>%d</b>편" % (TYPE_LABEL[ty], n)) for ty, n in counts])
    hero = page_hero([("column.html", "전문가 칼럼")], "Expert Column", "전문가 칼럼",
                     "실무 가이드, Q&amp;A 해설, 승인 사례, 변호사의 시선. 6개월 뒤에도 도움이 되는 글을 모읍니다.", "", side)
    feat = [p for p in items if p["src"] == "post"][0]
    art, icon, kicker = COLUMN_ART[feat["type"]]
    feature = """<article class="col-feature">
      <a class="col-feature__art {art}" href="post.html" tabindex="-1" aria-hidden="true">{icon}<span class="col-card__kicker">{kicker}</span></a>
      <div>
        <p class="eyebrow">추천 칼럼</p>
        <div class="post-tags"><span class="chip">{label}</span><span class="chip chip--line">이민비자·영주권</span></div>
        <h2><a href="post.html">{title}</a></h2>
        <p>{sum}</p>
        <p class="col-feature__meta"><img src="../assets/attorney-face.jpg" alt="" width="36" height="36" loading="lazy"><span>김형걸 변호사 · {date} · 읽는 시간 4분</span></p>
        <a class="btn btn--dark" href="post.html">글 읽기 {arrow}</a>
      </div>
    </article>""".format(art=art, icon=ic(icon), kicker=kicker, label=TYPE_LABEL[feat["type"]], title=E(feat["title"]),
                         sum=E(feat["sum"]), date=feat["date"], arrow=ic("arrow"))
    cards = "".join(col_card(t, p, data=True) for p in items)
    board = """<section class="section board-sec" aria-label="전문가 칼럼 목록">
  <div class="container" data-board data-per="9">
    {feature}
    {tools}
    <div class="col-board">{cards}</div>
    <p class="board-empty" data-board-empty hidden>조건에 맞는 글이 없습니다. 검색어나 분류를 바꿔 보세요.</p>
    <nav class="pager" aria-label="페이지" data-pager></nav>
    {disc}
    {memo}
  </div>
</section>
""".format(feature=feature, tools=board_tools(COLUMN_TYPES, items, "전문가 칼럼"), cards=cards, disc=CASE_DISCLAIMER,
           memo=memo("블로그에서 ‘미국 이민 소식’에 있던 승인 사례도 여기 ‘승인 사례’로 모았습니다. 분류 규칙은 하나입니다. 6개월 뒤에도 유효한 글이면 칼럼, 아니면 소식."))
    return (head(t, "전문가 칼럼", "실무 가이드, Q&A 해설, 승인 사례, 변호사의 시선. 김형걸 변호사의 이민법 칼럼.")
            + skip() + ticker() + header(t, "column") + mnav("column") + '<main id="main">\n' + hero + board
            + cta_strip(t) + "</main>\n" + footer("디자인 시안입니다. 목록은 블로그·카페의 실제 글이며 요약은 시안용으로 줄였습니다.")
            + floating(t) + end(t, "전문가 칼럼"))


# ---------------------------------------------------------------------------
# 상담 안내
# ---------------------------------------------------------------------------
def consult_form(t):
    areas = "".join('<option value="%s">%s</option>' % (k, HUBS[k]["name"]) for k in HUB_ORDER)
    return """<form data-mock-form data-prefill novalidate>
  <div class="form-grid">
    <div class="field"><label for="c-name">이름 <span class="req">*</span></label><input id="c-name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="c-phone">전화번호 <span class="req">*</span></label>
      <div class="phone-row"><label class="sr-only" for="c-cc">국가 번호</label><select id="c-cc" name="cc"><option value="+1">미국 +1</option><option value="+82">한국 +82</option></select><input id="c-phone" name="phone" type="tel" autocomplete="tel-national" placeholder="(213) 000-0000" required></div></div>
    <div class="field"><label for="c-email">이메일 <span class="req">*</span></label><input id="c-email" name="email" type="email" autocomplete="email" required><span class="hint">접수 확인 메일을 보내 드립니다.</span></div>
    <fieldset class="field"><legend>선호 연락 방법 <span class="req">*</span></legend>
      <div class="seg"><label><input type="radio" name="contact" value="phone" required><span>전화</span></label><label><input type="radio" name="contact" value="kakao" required><span>카카오톡</span></label><label><input type="radio" name="contact" value="email" required><span>이메일</span></label></div></fieldset>
    <div class="field full" data-show-if="contact=kakao" hidden><label for="c-kakao">카카오톡 ID</label><input id="c-kakao" name="kakao" placeholder="카카오톡으로 연락드릴 ID"></div>
    <div class="field"><label for="c-country">현재 계신 곳 <span class="req">*</span></label><select id="c-country" name="country" required><option value="">선택해 주세요</option><option>미국</option><option>한국</option><option>기타</option></select></div>
    <div class="field"><label for="c-area">상담 분야 <span class="req">*</span></label><select id="c-area" name="area" required><option value="">선택해 주세요</option>{areas}<option value="etc">기타·잘 모르겠어요</option></select></div>
    <fieldset class="field"><legend>희망 상담 방식</legend>
      <div class="seg"><label><input type="radio" name="mode" value="visit"><span>방문</span></label><label><input type="radio" name="mode" value="phone"><span>전화</span></label><label><input type="radio" name="mode" value="video"><span>화상</span></label></div></fieldset>
    <div class="field"><label for="c-when">희망 일시</label><input id="c-when" name="when" placeholder="예: 다음 주 화요일 오후 / 한국 시간 오전"></div>
    <div class="field full"><label for="c-msg">상담 내용 <span class="req">*</span></label><textarea id="c-msg" name="message" maxlength="1000" placeholder="현재 상황을 간단히 적어 주세요." required data-maxcount></textarea>
      <span class="hint hint--row"><span>여권번호·A-Number·SSN 같은 민감한 정보는 적지 마세요.</span><span class="counter" data-counter-for="c-msg">0 / 1,000</span></span></div>
    <div class="field full"><label for="c-from">알게 된 경로</label><select id="c-from" name="from"><option value="">선택해 주세요</option><option>네이버 카페</option><option>네이버 블로그</option><option>구글 검색</option><option>지인 소개</option><option>SNS·유튜브</option><option>업소록</option><option>기타</option></select></div>
    <label class="check full"><input type="checkbox" name="agree1" required><span>(필수) 개인정보 수집·이용에 동의합니다. 수집 항목: 이름·연락처·이메일·상담 내용 / 목적: 상담 연락 / 보유 기간: 12개월 후 삭제</span></label>
    <label class="check full"><input type="checkbox" name="agree2" required><span>(필수) 문의만으로 변호사-의뢰인 관계가 성립하지 않는다는 점을 확인했습니다.</span></label>
    <p class="turnstile full">{shield}<span>스팸 방지: 실제 사이트에는 눈에 보이지 않는 자동 확인(Cloudflare Turnstile)이 적용됩니다.</span></p>
    <button class="btn btn--primary btn--lg btn--block full" type="submit">상담 신청 보내기 {arrow}</button>
    <p class="form-note full">시안 화면이라 실제로 전송되지는 않습니다.</p>
  </div>
</form>""".format(areas=areas, shield=ic("shield"), arrow=ic("arrow"))


def contact_list():
    return """<ul class="contact-list">
  <li><a href="{tel}"><span class="ic-wrap">{phone_ic}</span><span><small>전화</small><strong>{phone}</strong></span></a></li>
  <li><a href="#" {kakao}><span class="ic-wrap">{chat}</span><span><small>카카오톡</small><strong>ID hkimlaw16</strong></span></a></li>
  <li><a href="mailto:{email}"><span class="ic-wrap">{mail}</span><span><small>이메일</small><strong>{email}</strong></span></a></li>
  <li><div class="row"><span class="ic-wrap">{pin}</span><span><small>사무실</small><strong>{a1}<br>{a2}</strong></span></div></li>
  <li><div class="row"><span class="ic-wrap">{clock}</span><span><small>운영 시간</small><strong>월–금 오전 9시 – 오후 6시<em class="tbd">확인 필요</em></strong></span></div></li>
</ul>""".format(tel=TEL, phone_ic=ic("phone"), phone=PHONE, kakao=KAKAO, chat=ic("chat"), email=EMAIL, mail=ic("mail"),
                pin=ic("pin"), a1=ADDR1, a2=ADDR2, clock=ic("clock"))


def page_contact(t):
    side = ph_card("운영 시간", [
        ("clock", "월–금 오전 9시 – 오후 6시 " + tbd()),
        ("calendar", "토·일·공휴일 휴무 " + tbd()),
        ("chat", "문의는 영업일 기준 1일 안에 연락드립니다 " + tbd()),
    ], '<a class="btn btn--primary" href="%s">%s%s</a>' % (TEL, ic("phone"), PHONE))
    actions = ('<a class="btn btn--primary btn--lg" href="#form">%s상담 신청서 쓰기</a>'
               '<a class="btn btn--kakao btn--lg" href="#" %s>%s카톡 상담</a>' % (ic("pen"), KAKAO, ic("chat")))
    hero = page_hero([("contact.html", "상담 안내")], "Consultation", "첫 상담,<br><em>편하게</em> 시작하세요",
                     "방문·전화·화상·카카오톡 중 편한 방법을 고르세요. 한국에 계셔도 상담할 수 있습니다.", actions, side)
    sub = subnav([("methods", "상담 방법"), ("steps", "진행 절차"), ("prepare", "상담료·준비물"), ("form", "상담 신청"),
                  ("visit", "오시는 길"), ("faq", "자주 묻는 질문"), ("links", "이민 필수 링크")])
    methods = [
        ("", "pin", "방문 상담", "윌셔 사무실에서 서류를 함께 보며 이야기합니다. 예약 후 방문해 주세요.",
         '<a class="btn btn--ghost" href="#visit">오시는 길 %s</a>' % ic("arrow")),
        ("", "phone", "전화 상담", "가장 빠른 방법입니다. 급한 일이라면 먼저 전화 주세요.",
         '<a class="btn btn--ghost" href="%s">%s</a>' % (TEL, PHONE)),
        ("", "globe", "화상 상담", "한국 등 해외에 계신 분은 화상으로 상담합니다. 시차를 맞춰 일정을 잡습니다. 사용 도구 " + tbd(),
         '<a class="btn btn--ghost" href="#form">화상 상담 신청</a>'),
        (" method--kakao", "chat", "카카오톡 상담", "간단한 문의와 일정 조율은 카카오톡으로 편하게 하세요. ID hkimlaw16",
         '<a class="btn btn--kakao" href="#" %s>카톡 열기</a>' % KAKAO),
    ]
    m_html = "".join('<article class="method%s"><span class="method__icon">%s</span><h3>%s</h3><p>%s</p>%s</article>'
                     % (c, ic(i), n, d, b) for c, i, n, d, b in methods)
    steps = [("01", "상담 신청", "전화·카카오톡·온라인 폼 중 편한 방법으로 신청하세요."),
             ("02", "연락·일정 확정", "내용을 확인한 뒤 연락드려 상담 방식과 일정을 정합니다."),
             ("03", "변호사 직접 상담", "김형걸 변호사가 상황을 듣고 가능한 길과 위험을 정직하게 설명합니다."),
             ("04", "수임·진행", "진행을 결정하시면 계약 후 서류 준비부터 결과까지 함께합니다.")]
    s_html = "".join('<li class="step"><span class="step__dot">%s</span><h3>%s</h3><p>%s</p></li>' % s for s in steps)
    fee = [("첫 상담료", tbd()), ("수임 시 상담료 차감", tbd()), ("결제 방법", tbd()), ("상담 시간", "30분 기준 " + tbd())]
    fee_html = "".join("<div><dt>%s</dt><dd>%s</dd></div>" % f for f in fee)
    prep_docs = ["여권과 현재 비자·I-94 기록", "영주권 카드(영주권자)", "이민국에서 받은 통지서(I-797, RFE, 거절 통지 등)",
                 "이민법원 서류(해당 시)", "궁금한 점을 적은 메모"]
    faq = [
        ("상담료가 있나요?", "상담 방식과 사안에 따라 다릅니다. 상담료와 수임 시 차감 여부는 상담 신청 후 안내해 드립니다. <em>(시안: 사무실 정책 확인 후 반영)</em>"),
        ("한국에 있어도 상담할 수 있나요?", "네. 전화·화상·카카오톡으로 상담할 수 있습니다. 시차를 고려해 일정을 잡아 드립니다."),
        ("한국어로 상담하나요?", "네. 김형걸 변호사가 한국어와 영어로 직접 상담합니다."),
        ("상담 전에 무엇을 준비하면 좋을까요?", "여권, 현재 신분 서류, 이민국에서 받은 통지서가 있다면 준비해 주세요. 정확한 목록은 상담 예약 때 안내해 드립니다."),
        ("신청하면 언제 연락이 오나요?", "영업일 기준 1일 안에 연락드리는 것을 목표로 합니다. 급한 일은 전화가 가장 빠릅니다. <em>(시안: 응답 시간 확인 후 반영)</em>"),
        ("문의만 해도 변호사-의뢰인 관계가 생기나요?", "아닙니다. 웹사이트 문의나 상담 신청만으로는 변호사-의뢰인 관계가 성립하지 않습니다. 수임 계약을 맺은 뒤 관계가 시작됩니다."),
    ]
    faq_html = "".join("<details%s><summary>%s</summary><p>%s</p></details>" % (" open" if i == 0 else "", q, a)
                       for i, (q, a) in enumerate(faq))
    links = [("USCIS 케이스 조회", "접수번호로 진행 상황 확인", "https://egov.uscis.gov/casestatus/landing.do"),
             ("USCIS 처리 기간", "서식·센터별 처리 기간", "https://egov.uscis.gov/processing-times/"),
             ("국무부 Visa Bulletin", "매달 영주권 문호 발표", VB_URL),
             ("주한미국대사관", "비자 인터뷰·영사 업무", "https://kr.usembassy.gov/ko/"),
             ("주LA 대한민국 총영사관", "국적·여권·영사 업무", LA_CONSULATE),
             ("이민법원 케이스 조회", "A-Number로 재판 일정 확인", "https://acis.eoir.justice.gov/en/")]
    l_html = "".join('<a href="%s" target="_blank" rel="noopener"><span>%s<small>%s</small></span><span class="sr-only"> (새 창)</span>%s</a>'
                     % (u, n, d, ic("arrow-ur")) for n, d, u in links)

    main = """<section class="section" id="methods" aria-labelledby="methods-title">
  <div class="container">
    {methods_head}
    <div class="methods">{methods}</div>
  </div>
</section>
<section class="section sec-alt" id="steps" aria-labelledby="steps-title">
  <div class="container">
    {steps_head}
    <div class="process" data-process>
      <svg class="process__svg" aria-hidden="true"><path class="process__track"/><path class="process__line"/></svg>
      <ol class="steps-grid">{steps}</ol>
    </div>
  </div>
</section>
<section class="section" id="prepare" aria-labelledby="prep-title">
  <div class="container">
    {prep_head}
    <div class="prep">
      <div class="prep__card"><h3>상담료</h3><dl class="fee">{fee}</dl><p class="note-line">{shield}상담료 정책은 변호사님 확인 후 그대로 적습니다. 투명하게 공개할수록 상담 문의가 늘어나는 편입니다.</p></div>
      <div class="prep__card"><h3>준비하면 좋은 것</h3><ul class="docs docs--one">{docs}</ul></div>
    </div>
  </div>
</section>
<section class="section sec-alt" id="form" aria-labelledby="form-title">
  <div class="container">
    {form_head}
    <div class="cform">
      <div class="form-card">
        <h3>상담 신청서</h3>
        <p class="form-card__sub">필수 항목(*)만 적어 주셔도 됩니다.</p>
        <p class="notice">{shield}<span>여권번호·A-Number·SSN 같은 민감한 정보는 적지 마세요. 문의만으로 변호사-의뢰인 관계가 성립하지는 않습니다.</span></p>
        {form}
      </div>
      <aside class="cform__aside" aria-label="바로 연락하기">
        <h3>바로 연락하기</h3>
        {contacts}
        <p class="cform__note">{clock}<span>신청서가 접수되면 변호사님과 직원에게 알림 메일이 가고, 신청하신 분께는 접수 확인 메일이 자동으로 갑니다.</span></p>
      </aside>
    </div>
  </div>
</section>
<section class="section" id="visit" aria-labelledby="visit-title">
  <div class="container">
    {visit_head}
    <div class="visit">
      <div class="visit__map">
        <a class="map-fallback" href="https://maps.google.com/?q={q}" target="_blank" rel="noopener">{pin}Google 지도에서 보기</a>
        <iframe title="사무실 위치 지도" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q={q}&amp;output=embed"></iframe>
      </div>
      <div>
        <dl class="info-list">
          <div><dt>주소</dt><dd>{a1}<br>{a2}</dd></div>
          <div><dt>운영 시간</dt><dd>월–금 오전 9시 – 오후 6시 {tbd}</dd></div>
          <div><dt>주차</dt><dd>건물 주차장 이용 {tbd}</dd></div>
          <div><dt>대중교통</dt><dd>메트로 D라인 Wilshire/Normandie 역 인근 {tbd}</dd></div>
          <div><dt>전화</dt><dd><a href="{tel}">{phone}</a></dd></div>
        </dl>
        <div class="btns">
          <a class="btn btn--dark" href="https://www.google.com/maps/dir/?api=1&amp;destination={q}" target="_blank" rel="noopener">{pin}길찾기<span class="sr-only"> (새 창)</span></a>
          <a class="btn btn--ghost" href="{tel}">{phone_ic}전화하기</a>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section sec-alt" id="faq" aria-labelledby="faq-title">
  <div class="container">
    {faq_head}
    <div class="faq faq-narrow">{faq}</div>
  </div>
</section>
<section class="section" id="links" aria-labelledby="links-title">
  <div class="container">
    {links_head}
    <div class="link-grid">{links}</div>
  </div>
</section>
""".format(methods_head=sec_head("How to reach us", "상담 방법", "methods-title", "어떤 방법이든 김형걸 변호사가 직접 상담합니다."),
           methods=m_html, steps_head=sec_head("How it works", "상담은 이렇게 진행됩니다", "steps-title"), steps=s_html,
           prep_head=sec_head("Before you come", "상담료와 준비물", "prep-title"), fee=fee_html, shield=ic("shield"),
           docs="".join("<li>%s</li>" % d for d in prep_docs),
           form_head=sec_head("Request", "상담 신청", "form-title", "남겨 주시면 확인 후 연락드립니다. 급한 일은 전화나 카카오톡이 가장 빠릅니다."),
           form=consult_form(t), contacts=contact_list(), clock=ic("clock"),
           visit_head=sec_head("Office", "오시는 길", "visit-title"), q=MAP_Q, pin=ic("pin"), a1=ADDR1, a2=ADDR2,
           tbd=tbd(), tel=TEL, phone=PHONE, phone_ic=ic("phone"),
           faq_head=sec_head("FAQ", "상담 전에 자주 묻는 질문", "faq-title"), faq=faq_html,
           links_head=sec_head("Useful links", "이민 필수 링크", "links-title", "자주 찾는 공식 사이트를 모았습니다."), links=l_html)

    return (head(t, "상담 안내", "방문·전화·화상·카카오톡 상담. 상담 절차, 상담료, 오시는 길, 상담 신청서.", "has-subnav")
            + skip() + ticker() + header(t, "contact") + mnav("contact") + '<main id="main">\n' + hero + sub + main + "</main>\n"
            + footer("디자인 시안입니다. 운영 시간·상담료·주차 정보는 확인 후 반영합니다.") + floating(t, "#form") + end(t, "상담 안내"))


# ---------------------------------------------------------------------------
# 게시글 상세 (전문가 칼럼 › 실무 가이드)
# ---------------------------------------------------------------------------
def page_post(t):
    cols = posts(board="column")
    rel_titles = ["이민비자·영주권 인터뷰, 공적부조 관련 준비사항", "영구영주권(정식영주권) 승인 없이 시민권 신청?", "영주권 신체검사는 이민국 지정 병원에서"]
    related = "".join(col_card(t, p) for p in cols if p["title"] in rel_titles)
    idx = [i for i, p in enumerate(cols) if p["src"] == "post"][0]
    newer, older = cols[idx - 1], cols[idx + 1]
    n_href, n_attrs = post_link(newer)
    o_href, o_attrs = post_link(older)
    body = """<div class="progress" data-progress aria-hidden="true"></div>
{ticker}{header}{mnav}
<main id="main">
  <article data-article>
    <header class="post-hero">
      <div class="container">
        <nav class="crumbs" aria-label="현재 위치">
          <a href="index.html">홈</a><span class="sep" aria-hidden="true">›</span>
          <a href="column.html">전문가 칼럼</a><span class="sep" aria-hidden="true">›</span>
          <a href="column.html?cat=guide">실무 가이드</a>
        </nav>
        <div class="post-tags">
          <span class="chip">실무 가이드</span>
          <a class="chip chip--line" href="practice-green-card.html">이민비자·영주권</a>
          <span class="chip chip--line">I-90</span>
          <span class="chip chip--line">ADIT</span>
        </div>
        <h1 class="post-title">영주권 카드를 분실했다면: 재발급(I-90)과 임시 증명(ADIT)</h1>
        <div class="post-meta">
          <span class="author"><img src="../assets/attorney-face.jpg" alt="" width="38" height="38">김형걸 변호사</span>
          <span>작성 2026.11.10</span><span class="dot" aria-hidden="true"></span>
          <span>최종 업데이트 2026.11.10</span><span class="dot" aria-hidden="true"></span>
          <span>읽는 시간 4분</span>
        </div>
      </div>
    </header>

    <div class="container post-main">
      <div class="post-layout">
        <div class="prose">
          <section class="summary" aria-labelledby="sum-title">
            <p class="summary__title" id="sum-title">3줄 요약</p>
            <ol>
              <li>미국 안에서 영주권 카드를 잃어버렸다면 Form I-90으로 재발급을 신청합니다.</li>
              <li>새 카드를 기다리는 동안 해외여행이나 취업 확인이 필요하면 임시 영주권 증명(ADIT)을 요청할 수 있습니다. 이제 이민국 방문 없이 우편으로 받을 수도 있습니다.</li>
              <li>해외에서 잃어버렸다면 미국으로 돌아오기 위한 여행 서류(Form I-131A)가 필요할 수 있습니다.</li>
            </ol>
          </section>

          <p>영주권 카드를 잃어버리면 당황스럽지만, 순서대로 처리하면 어렵지 않습니다. 다만 <strong>어디에서 잃어버렸는지</strong>, <strong>가까운 시일 안에 해외여행 계획이 있는지</strong>에 따라 필요한 절차가 달라집니다.</p>

          <h2 id="s1">1. 미국 안에서 분실했을 때</h2>
          <p>미국 안에서 카드를 잃어버리거나 도난당했다면 Form I-90(영주권 카드 교체 신청)을 제출해 새 카드를 받습니다. 온라인으로도 접수할 수 있습니다.</p>
          <ol class="steps">
            <li><strong>경위 정리</strong><br>언제, 어디서 잃어버렸는지 정리합니다. 도난이라면 경찰 신고 기록을 남겨 두면 신분 도용에 대비하는 데 도움이 됩니다.</li>
            <li><strong>Form I-90 제출</strong><br>신청서를 작성해 제출합니다. 수수료는 자주 바뀌므로 USCIS 공식 페이지에서 확인하세요.</li>
            <li><strong>접수증 보관</strong><br>접수 후 받는 접수증(I-797C)을 잘 보관하고, 생체정보(지문) 예약 통지를 확인합니다.</li>
          </ol>

          <h2 id="s2">2. 새 카드를 기다리는 동안: 임시 증명(ADIT)</h2>
          <p>새 카드가 나오기 전에 해외여행을 하거나 고용주에게 신분을 증명해야 한다면, 영주권자임을 보여 주는 임시 증명(흔히 ‘ADIT 스탬프’라고 부릅니다)을 요청할 수 있습니다. USCIS 고객센터에 요청하면 상황에 따라 우편으로 받거나, 현지 사무소 방문 예약을 잡게 됩니다.</p>
          <div class="callout">{clock}<div><strong>여행 계획이 있다면 먼저 확인하세요</strong>유효한 영주권 증명 없이 출국하면 다시 들어올 때 절차가 복잡해질 수 있습니다.</div></div>

          <h2 id="s3">3. 해외에서 분실했을 때</h2>
          <p>해외에 머무는 동안 카드를 잃어버렸다면, 미국행 항공기에 탑승하기 위한 여행 서류(Form I-131A)를 신청해야 할 수 있습니다. 해외 체류 기간이 길었다면 영주권 유지와 관련한 검토가 함께 필요할 수 있으니 미리 상담을 받는 것이 좋습니다.</p>

          <h2 id="s4">4. 상황별로 한눈에 보기</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th scope="col">상황</th><th scope="col">필요한 절차</th><th scope="col">참고</th></tr></thead>
              <tbody>
                <tr><td>미국 안에서 분실·도난</td><td>Form I-90으로 재발급 신청</td><td>도난이라면 경찰 신고 기록 보관</td></tr>
                <tr><td>새 카드 전에 여행·취업 증빙 필요</td><td>임시 증명(ADIT) 요청</td><td>USCIS 고객센터에 요청 (우편 또는 방문)</td></tr>
                <tr><td>해외에서 분실</td><td>Form I-131A(탑승용 여행 서류) 검토</td><td>장기 체류였다면 사전 상담 권장</td></tr>
              </tbody>
            </table>
          </div>
          <p>평소에 여권 사본, 영주권 카드 사본, 영주권 승인 통지서처럼 신분을 확인할 수 있는 서류를 따로 보관해 두면 분실했을 때 훨씬 수월합니다.</p>

          <aside class="official" aria-labelledby="off-title">
            <p class="official__title" id="off-title">공식 정보 확인</p>
            <ul>
              <li><a href="https://www.uscis.gov/i-90" target="_blank" rel="noopener">USCIS · Form I-90 (영주권 카드 교체) {ur}</a></li>
              <li><a href="https://www.uscis.gov/i-131a" target="_blank" rel="noopener">USCIS · Form I-131A (해외 분실 시 여행 서류) {ur}</a></li>
              <li><a href="https://www.uscis.gov/contactcenter" target="_blank" rel="noopener">USCIS 고객센터 {ur}</a></li>
              <li><a href="https://egov.uscis.gov/processing-times/" target="_blank" rel="noopener">USCIS 처리 기간 {ur}</a></li>
            </ul>
          </aside>

          <p class="disclaimer">이 글은 일반적인 정보이며 법률 자문이 아닙니다. 개별 사안은 사실관계에 따라 달라질 수 있으니 상담으로 확인하세요. 작성일 기준 정보이며 이후 규정이 바뀌었을 수 있습니다.</p>

          <div class="share" aria-label="공유하기">
            <span class="share__label">공유</span>
            <button class="share__btn share__btn--kakao" type="button" aria-label="카카오톡으로 공유" data-toast="시안: 카카오톡 공유 창이 열립니다.">{chat}</button>
            <button class="share__btn" type="button" aria-label="페이스북으로 공유" data-toast="시안: 페이스북 공유 창이 열립니다.">{fb}</button>
            <button class="share__btn" type="button" aria-label="스레드로 공유" data-toast="시안: 스레드 공유 창이 열립니다.">{th}</button>
            <button class="share__btn" type="button" aria-label="링크 복사" data-copy-link>{link}</button>
          </div>

          <section class="post-cta" aria-labelledby="cta-title">
            <div>
              <h2 id="cta-title">내 상황에 맞는 절차가 궁금하다면</h2>
              <p>분실 장소, 여행 계획, 체류 기간에 따라 준비할 서류가 달라집니다.</p>
            </div>
            <div class="btns">
              <a class="btn btn--primary" href="contact.html?area=green#form">{cta} {arrow}</a>
              <a class="btn btn--kakao" href="#" {kakao}>{chat}카톡 상담</a>
            </div>
          </section>

          <div class="author-box">
            <img src="../assets/attorney-face.jpg" alt="김형걸 변호사" width="92" height="92" loading="lazy">
            <div>
              <h3>김형걸 변호사 · Vincent Kim</h3>
              <p>로스앤젤레스 윌셔에서 20년 동안 이민법을 다뤄 왔습니다. 2015년부터 네이버 카페를 운영하며 이민자들의 질문에 직접 답하고 있습니다. <a href="about.html">변호사 소개</a></p>
            </div>
          </div>

          <nav class="prevnext" aria-label="이전 글, 다음 글">
            <a href="{o_href}"{o_attrs}><span>이전 글</span><strong>{o_title}</strong></a>
            <a href="{n_href}"{n_attrs}><span>다음 글</span><strong>{n_title}</strong></a>
          </nav>
        </div>

        <aside class="post-aside">
          <nav class="toc" data-toc aria-label="목차">
            <p class="toc__title">목차</p>
            <a href="#s1">1. 미국 안에서 분실했을 때</a>
            <a href="#s2">2. 새 카드를 기다리는 동안</a>
            <a href="#s3">3. 해외에서 분실했을 때</a>
            <a href="#s4">4. 상황별로 한눈에 보기</a>
            <div class="aside-card">
              <h3>바로 상담하기</h3>
              <p>여행 일정이 가깝다면 빨리 확인하는 것이 좋습니다.</p>
              <a class="btn {aside_btn} btn--sm" href="contact.html?area=green#form">{cta}</a>
              <a class="btn btn--kakao btn--sm" href="#" {kakao}>카톡 상담</a>
            </div>
            <div class="aside-card aside-card--memo" style="border-style:dashed">
              <h3>시안 메모</h3>
              <p style="margin:0">작성 후 12개월이 지나면 글 맨 위에 “최신 정보를 확인하세요” 안내가 자동으로 붙습니다. 글을 쓸 때 ‘이민비자·영주권’을 체크했기 때문에 <a href="practice-green-card.html#related">업무분야 페이지</a>에도 이 글이 자동으로 실립니다.</p>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  </article>

  <section class="section related-sec" aria-labelledby="rel-title">
    <div class="container">
      <div class="sec-head">
        <div>
          <p class="eyebrow">Related</p>
          <h2 class="sec-head__title" id="rel-title">함께 읽으면 좋은 글</h2>
        </div>
        <a class="link-arrow" href="column.html">전문가 칼럼 전체 {arrow}</a>
      </div>
      <div class="related">{related}</div>
    </div>
  </section>
</main>
""".format(ticker=ticker(), header=header(t, None, "column"), mnav=mnav(None, "column"), clock=ic("clock"), ur=ic("arrow-ur"),
           chat=ic("chat"), fb=ic("facebook"), th=ic("threads"), link=ic("link"), cta=t["cta"], arrow=ic("arrow"),
           kakao=KAKAO, aside_btn=t["aside_btn"], o_href=o_href, o_attrs=o_attrs, o_title=E(older["title"]),
           n_href=n_href, n_attrs=n_attrs, n_title=E(newer["title"]), related=related)
    return (head(t, "영주권 카드를 분실했다면: 재발급(I-90)과 임시 증명(ADIT)",
                 "미국 안에서 영주권 카드를 잃어버렸을 때의 재발급(I-90), 새 카드를 기다리는 동안의 임시 증명(ADIT), 해외 분실 시 여행 서류(I-131A)를 정리했습니다.")
            + skip() + body + footer("디자인 시안입니다. 예시 글은 실제 게시 전 변호사 검수를 거칩니다.") + floating(t) + end(t, "게시글 상세"))


# ---------------------------------------------------------------------------
# English
# ---------------------------------------------------------------------------
def page_en(t):
    en_nav = [("en.html", "Home"), ("#about", "About"), ("#practice", "Practice Areas"), ("#contact", "Contact")]
    items = "".join('<li><a href="%s"%s>%s</a></li>' % (h, ' aria-current="page"' if i == 0 else "", l)
                    for i, (h, l) in enumerate(en_nav))
    m_links = "".join('<a class="mnav__link" href="%s">%s %s</a>' % (h, l, ic("arrow")) for h, l in en_nav)
    book = '<a class="btn btn--sm btn--primary" href="#contact">Book a consultation</a>' if t["book"] else ""
    header_en = """<header class="{cls}" data-header>
  <div class="container">
    {logo}
    <nav class="gnav" aria-label="Main"><ul>{items}</ul></nav>
    <div class="h-actions">
      {lang}
      <a class="btn btn--sm btn--ghost btn--call" href="{tel}">{phone_ic}{phone}</a>
      {book}
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav" data-nav-toggle>{menu}</button>
    </div>
  </div>
</header>
<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Menu">
  <button class="mnav__close" type="button" aria-label="Close menu" data-nav-close>{close}</button>
  {m_links}
  {lang}
  <div class="mnav__cta"><a class="btn btn--primary btn--lg" href="{tel}">{phone_ic}{phone}</a></div>
</div>
""".format(cls=t["header"], logo=logo("Law Offices of Vincent Kim", "Immigration Attorney · Los Angeles", "Law Offices of Vincent Kim home", "en.html"),
           items=items, lang=LANG_EN, tel=TEL, phone_ic=ic("phone"), phone=PHONE, book=book, menu=ic("menu"),
           close=ic("close"), m_links=m_links)

    photo = """<figure class="ph-photo">
      <div class="ph-photo__img"><img src="../assets/attorney.jpg" alt="Attorney Vincent Kim at his office" width="1230" height="1121">
        <figcaption><strong>Vincent Kim</strong><span>ATTORNEY AT LAW</span></figcaption></div>
    </figure>"""
    hero = """<section class="page-hero page-hero--en" aria-labelledby="ph-title">
  <div class="container page-hero__inner">
    <div>
      <p class="eyebrow">Los Angeles · Immigration Law</p>
      <h1 class="page-hero__title" id="ph-title">Twenty years of guiding immigrants in <em>Los Angeles</em></h1>
      <p class="page-hero__lead">Immigration counsel in Korean and English. Attorney Vincent Kim personally handles every consultation, from the first call to the final decision.</p>
      <div class="page-hero__actions"><a class="btn btn--primary btn--lg" href="#contact">Request a consultation {arrow}</a><a class="btn btn--ghost btn--lg" href="{tel}">{phone_ic}{phone}</a></div>
      <p class="page-hero__meta"><span>{check}Korean &amp; English</span><span>{check}20 years in immigration law</span><span>{check}Wilshire Blvd., Los Angeles</span></p>
    </div>
    {photo}
  </div>
</section>
""".format(arrow=ic("arrow"), tel=TEL, phone_ic=ic("phone"), phone=PHONE, check=ic("check"), photo=photo)

    areas = [
        ("green", "Family-based petitions for spouses, parents and children of U.S. citizens and permanent residents; employment-based green cards (EB-2, EB-3, NIW and registered nurses); EB-5 investment; adjustment of status, consular processing and removal of conditions (I-751).",
         ["Family", "EB-2 / EB-3", "NIW", "Nurses", "EB-5", "I-751"]),
        ("nonimm", "H-1B specialty occupation, L-1 intracompany transfer, E-2 treaty investor (Korea is a treaty country), O-1 extraordinary ability, F-1 students and OPT, and visitor and ESTA issues.",
         ["H-1B", "L-1", "E-2", "O-1", "F-1 / OPT", "B / ESTA"]),
        ("citizen", "Naturalization (N-400) eligibility review, interview and civics test preparation, certificates of citizenship (N-600), and issues such as long trips abroad or past arrests.",
         ["N-400", "Interview prep", "N-600"]),
        ("defense", "Immigration court defense, bond hearings, waivers (I-601, I-601A, I-212), asylum, and responses to denials, RFEs and NOIDs.",
         ["Removal defense", "Bond", "Waivers", "Asylum"]),
    ]
    cards = ""
    for k, text, chips in areas:
        h = HUBS[k]
        cards += """<article class="hub-card hub-card--static">
  <div class="hub-card__top"><span class="hub-card__icon">{icon}</span><span class="hub-card__no">{no}</span></div>
  <h3 lang="en">{name}</h3>
  <p>{text}</p>
  <ul>{chips}</ul>
  <div class="hub-card__foot"><a class="link-arrow" href="#contact">Ask about this {arrow}</a><a class="hub-card__ko" href="{slug}" lang="ko" hreflang="ko">한국어 안내</a></div>
</article>""".format(icon=ic(h["icon"]), no=h["no"], name=h["en"], text=text, chips="".join("<li>%s</li>" % c for c in chips),
                     arrow=ic("arrow"), slug=h["slug"])
    personas = [
        ("For spouses of U.S. citizens", "We guide U.S. citizens through sponsoring a spouse, from the I-130 petition to the interview, explaining each step in English for you and in Korean for your family."),
        ("For employers and HR teams", "We prepare H-1B, L-1, E-2 and employment-based green card filings and keep your team informed about deadlines and policy changes."),
        ("For clients in Korea", "Consultations by phone, video call or KakaoTalk, scheduled around the time difference between Seoul and Los Angeles."),
    ]
    pr = "".join('<article class="principle"><span class="principle__no">0%d</span><h3>%s</h3><p>%s</p></article>' % (i + 1, a, b)
                 for i, (a, b) in enumerate(personas))
    form = """<form data-mock-form novalidate data-msg-bad="Please check the required fields." data-msg-ok="This is a design mockup, so nothing was sent. The live site sends a confirmation email.">
  <div class="form-grid">
    <div class="field"><label for="e-name">Name <span class="req">*</span></label><input id="e-name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="e-phone">Phone <span class="req">*</span></label><input id="e-phone" name="phone" type="tel" autocomplete="tel" required></div>
    <div class="field"><label for="e-email">Email <span class="req">*</span></label><input id="e-email" name="email" type="email" autocomplete="email" required></div>
    <fieldset class="field"><legend>Preferred contact <span class="req">*</span></legend>
      <div class="seg"><label><input type="radio" name="contact" value="phone" required><span>Phone</span></label><label><input type="radio" name="contact" value="email" required><span>Email</span></label><label><input type="radio" name="contact" value="kakao" required><span>KakaoTalk</span></label></div></fieldset>
    <div class="field"><label for="e-where">Where are you now? <span class="req">*</span></label><select id="e-where" name="country" required><option value="">Select</option><option>United States</option><option>Korea</option><option>Other</option></select></div>
    <div class="field"><label for="e-area">Matter <span class="req">*</span></label><select id="e-area" name="area" required><option value="">Select</option><option value="green">Green card / immigrant visa</option><option value="nonimm">Nonimmigrant visa</option><option value="citizen">Citizenship</option><option value="defense">Removal defense &amp; waivers</option><option value="etc">Not sure</option></select></div>
    <div class="field full"><label for="e-msg">How can we help? <span class="req">*</span></label><textarea id="e-msg" name="message" maxlength="1000" required></textarea><span class="hint">Please do not include passport numbers, A-Numbers, Social Security numbers or other sensitive information.</span></div>
    <label class="check full"><input type="checkbox" name="agree1" required><span>I agree that the information above may be used to respond to my inquiry and will be deleted after 12 months.</span></label>
    <label class="check full"><input type="checkbox" name="agree2" required><span>I understand that contacting the firm does not create an attorney-client relationship.</span></label>
    <button class="btn btn--primary btn--lg btn--block full" type="submit">Send request {arrow}</button>
    <p class="form-note full">Design mockup: the form does not send anything.</p>
  </div>
</form>""".format(arrow=ic("arrow"))
    main = """<section class="section" id="practice" aria-labelledby="pa-title">
  <div class="container">
    <div class="sec-head"><div><p class="eyebrow">Practice areas</p><h2 class="sec-head__title" id="pa-title">How we can help</h2></div><p class="sec-head__desc">Four areas of U.S. immigration law, handled personally by Attorney Vincent Kim.</p></div>
    <div class="hub-cards">{cards}</div>
  </div>
</section>
<section class="section sec-band" aria-labelledby="who-title">
  <div class="container">
    <div class="sec-head"><div><p class="eyebrow">Who we work with</p><h2 class="sec-head__title" id="who-title">Clear answers in your language</h2></div></div>
    <div class="principles">{pr}</div>
  </div>
</section>
<section class="section" id="about" aria-labelledby="about-title">
  <div class="container greet">
    <div>
      <p class="eyebrow">About the attorney</p>
      <h2 class="sec-head__title" id="about-title">Vincent Kim</h2>
      <ul class="en-facts">
        <li>{check}20 years in U.S. immigration law</li>
        <li>{check}1,500+ articles on immigration law (Naver Blog, in Korean)</li>
        <li>{check}KBS America News appearances (2019, 2026)</li>
        <li>{check}Consultations in Korean and English</li>
      </ul>
    </div>
    <div class="greet__body">
      <p>Attorney Vincent Kim (김형걸) has practiced U.S. immigration law for twenty years from his office on Wilshire Boulevard in Los Angeles.</p>
      <p>Since 2015 he has answered immigration questions in a Korean-language online community with more than 2,100 members, and he has appeared on KBS America News to explain changes in immigration policy.</p>
      <p>He believes good decisions start with knowing exactly what a new rule means for your own case, so he explains both the options and the risks before you decide.</p>
      <dl class="cred cred--en"><div><dt>Bar admission</dt><dd>To be confirmed</dd></div><div><dt>Education</dt><dd>To be confirmed</dd></div><div><dt>Memberships</dt><dd>To be confirmed</dd></div></dl>
      {memo}
    </div>
  </div>
</section>
<section class="section sec-alt" id="contact" aria-labelledby="contact-title">
  <div class="container">
    <div class="sec-head"><div><p class="eyebrow">Contact</p><h2 class="sec-head__title" id="contact-title">Request a consultation</h2></div><p class="sec-head__desc">Tell us briefly about your situation. We will contact you to schedule an in-person, phone or video consultation.</p></div>
    <div class="cform">
      <div class="form-card">
        <h3 lang="en">Consultation request</h3>
        <p class="form-card__sub">Fields marked * are required.</p>
        {form}
      </div>
      <aside class="cform__aside" aria-label="Contact details">
        <h3>Contact us directly</h3>
        <ul class="contact-list">
          <li><a href="{tel}"><span class="ic-wrap">{phone_ic}</span><span><small>Phone</small><strong>{phone}</strong></span></a></li>
          <li><a href="mailto:{email}"><span class="ic-wrap">{mail}</span><span><small>Email</small><strong>{email}</strong></span></a></li>
          <li><div class="row"><span class="ic-wrap">{pin}</span><span><small>Office</small><strong>{a1}<br>{a2}</strong></span></div></li>
          <li><div class="row"><span class="ic-wrap">{clock}</span><span><small>Hours</small><strong>Mon–Fri, 9 a.m. – 6 p.m.<em class="tbd">TBC</em></strong></span></div></li>
        </ul>
        <a class="btn btn--light btn--block" href="https://www.google.com/maps/dir/?api=1&amp;destination={q}" target="_blank" rel="noopener">{pin}Get directions<span class="sr-only"> (opens in a new window)</span></a>
      </aside>
    </div>
  </div>
</section>
""".format(cards=cards, pr=pr, check=ic("check"),
           memo=memo("영문 원고는 제작사가 초안을 쓰고 변호사님이 검수합니다. 실제 사이트에서는 Home·About·Practice Areas·Contact 네 페이지로 나눕니다."),
           form=form, tel=TEL, phone_ic=ic("phone"), phone=PHONE, email=EMAIL, mail=ic("mail"), pin=ic("pin"),
           a1=ADDR1, a2=ADDR2, clock=ic("clock"), q=MAP_Q)
    footer_en = """<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        {logo}
        <p>Immigration counsel in Korean and English from Wilshire Boulevard, Los Angeles, for twenty years.</p>
      </div>
      <div>
        <p class="footer-title">MENU</p>
        <ul class="footer-links"><li><a href="#about">About</a></li><li><a href="#practice">Practice Areas</a></li><li><a href="#contact">Contact</a></li><li><a href="index.html" lang="ko">한국어 홈페이지</a></li></ul>
      </div>
      <div>
        <p class="footer-title">USEFUL LINKS</p>
        <ul class="footer-links">
          <li><a href="https://egov.uscis.gov/casestatus/landing.do" target="_blank" rel="noopener">USCIS Case Status</a></li>
          <li><a href="https://egov.uscis.gov/processing-times/" target="_blank" rel="noopener">USCIS Processing Times</a></li>
          <li><a href="{vb}" target="_blank" rel="noopener">Visa Bulletin</a></li>
          <li><a href="https://acis.eoir.justice.gov/en/" target="_blank" rel="noopener">Immigration Court Case Status</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-title">CONTACT</p>
        <ul class="footer-contact">
          <li>{phone_ic}<a href="{tel}">{phone}</a></li>
          <li>{mail}<a href="mailto:{email}">{email}</a></li>
          <li>{pin}<span>{a1}<br>{a2}</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <nav aria-label="Policies"><a href="#" data-toast="시안: Privacy Policy 페이지">Privacy Policy</a><a href="#" data-toast="시안: Disclaimer 페이지">Disclaimer</a><a href="#" data-toast="시안: Accessibility 페이지">Accessibility</a></nav>
      <p>This website provides general information and is not legal advice. Contacting the firm through this website does not create an attorney-client relationship.</p>
      <p>Attorney responsible for this website: Vincent Kim · Law Offices of Vincent Kim · {a1}, {a2}</p>
      <p>© <span data-year>2026</span> Law Offices of Vincent Kim. All rights reserved.</p>
      <p class="mock-note" lang="ko">{pen}<span>디자인 시안 · 영문 페이지 예시입니다. 문구는 변호사님 검수 후 확정합니다.</span></p>
    </div>
  </div>
</footer>
<nav class="quick" aria-label="Quick contact">
  <a href="#contact">{pen}Request</a>
  <a href="{tel}">{phone_ic}Call</a>
  <a href="mailto:{email}">{mail}Email</a>
  <button type="button" data-top>{up}TOP</button>
</nav>
<nav class="mbar" aria-label="Quick contact">
  <a class="is-call" href="mailto:{email}">{mail}Email</a>
  <a class="is-main" href="#contact">{pen}Request</a>
  <a class="is-call" href="{tel}">{phone_ic}Call</a>
</nav>
""".format(logo=logo("Law Offices of Vincent Kim", "Immigration Attorney · Los Angeles", "Law Offices of Vincent Kim home", "en.html"),
           vb=VB_URL, phone_ic=ic("phone"), tel=TEL, phone=PHONE, mail=ic("mail"), email=EMAIL, pin=ic("pin"),
           a1=ADDR1, a2=ADDR2, pen=ic("pen"), up=ic("up"))
    return (head(t, "Immigration Attorney in Los Angeles", "Law Offices of Vincent Kim. Immigration counsel in Korean and English in Los Angeles.",
                 lang="en", site="Law Offices of Vincent Kim")
            + skip("Skip to content") + header_en + '<main id="main">\n' + hero + main + "</main>\n" + footer_en + end(t, "English"))


# ---------------------------------------------------------------------------
PAGES = [
    ("about.html", page_about), ("practice.html", page_practice), ("news.html", page_news),
    ("column.html", page_column), ("contact.html", page_contact), ("post.html", page_post), ("en.html", page_en),
]


def main():
    written = []
    for t in THEMES.values():
        out_dir = os.path.join(ROOT, t["key"])
        jobs = [(name, fn) for name, fn in PAGES]
        jobs += [(HUBS[k]["slug"], (lambda key: (lambda th: page_hub(th, key)))(k)) for k in HUB_ORDER]
        for name, fn in jobs:
            path = os.path.join(out_dir, name)
            with open(path, "w", encoding="utf-8") as f:
                f.write(fn(t))
            written.append(os.path.relpath(path, ROOT))
    print("%d pages written:" % len(written))
    for w in written:
        print("  " + w)


if __name__ == "__main__":
    main()
