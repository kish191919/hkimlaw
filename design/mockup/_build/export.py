# -*- coding: utf-8 -*-
"""Vercel 배포용 폴더 만들기 (외부 라이브러리 없음, Python 3.9+).

실행: python3 design/mockup/_build/export.py [--cover URL] [--a URL] [--b URL]

design/mockup/dist/ 아래에 사이트 3개를 만든다. 원본 시안 폴더는 건드리지 않는다.
  vk-proposal/    표지(두 시안 비교) + 글쓰기 화면
  vk-proposal-a/  시안 A (주소 첫 화면이 홈)
  vk-proposal-b/  시안 B
폴더 이름이 그대로 Vercel 프로젝트 이름이 된다.

발표용으로 바꾸는 것
- 시안 사이트에서 '시안' 배지, 시안 메모, '상세 화면 예시' 표시, 히어로 영상 안내 문구를 숨긴다.
  ('확인 필요' 표시, 푸터의 '디자인 시안' 한 줄, 상담 신청서의 '전송되지 않음' 안내는 남긴다.)
- 서로를 가리키는 링크(표지 ↔ 시안, 글쓰기 화면)를 배포 주소로 바꾼다.
- 모든 응답에 X-Robots-Tag: noindex 헤더를 붙이고, 주소에서 .html을 뺀다(cleanUrls).
"""
import argparse
import json
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
NAMES = {"cover": "vk-proposal", "a": "vk-proposal-a", "b": "vk-proposal-b"}

PRESENT_CSS = ("<style>/* 발표용: 시안 배지·메모 숨김 (export.py) */"
               ".mock-tag,.mock-memo,.demo-flag,.hero__caption,.aside-card--memo{display:none!important}</style>\n")

VERCEL_JSON = {
    "cleanUrls": True,
    "trailingSlash": False,
    "headers": [{
        "source": "/(.*)",
        "headers": [
            {"key": "X-Robots-Tag", "value": "noindex, nofollow"},
            {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
            {"key": "X-Content-Type-Options", "value": "nosniff"},
        ],
    }],
}


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)


def must_sub(pattern, repl, s, where, min_count=1):
    new, n = re.subn(pattern, repl, s)
    if n < min_count:
        raise SystemExit("%s: %r 를 찾지 못했습니다" % (where, pattern))
    return new


def reset(dirname):
    """폴더 안의 .vercel(프로젝트 연결 정보)은 남기고 나머지를 지운다."""
    os.makedirs(dirname, exist_ok=True)
    for name in os.listdir(dirname):
        if name == ".vercel":
            continue
        path = os.path.join(dirname, name)
        shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)


def finish(dirname):
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(dirname, "assets"))
    write(os.path.join(dirname, "vercel.json"), json.dumps(VERCEL_JSON, ensure_ascii=False, indent=2) + "\n")


def export_site(key, urls):
    src = os.path.join(ROOT, key)
    out = os.path.join(DIST, NAMES[key])
    reset(out)
    pages = sorted(f for f in os.listdir(src) if f.endswith(".html"))
    for name in pages:
        s = read(os.path.join(src, name))
        where = "%s/%s" % (key, name)
        s = must_sub(r'(href|src)="\.\./assets/', r'\1="assets/', s, where)
        s = must_sub(r'href="\.\./write\.html"', 'href="%s/write"' % urls["cover"], s, where, 0)
        s = must_sub(r'href="\.\./index\.html"', 'href="%s/"' % urls["cover"], s, where, 0)
        if "../" in s.replace("://", ""):
            raise SystemExit("%s: 바꾸지 못한 상위 폴더 링크가 남았습니다" % where)
        s = must_sub(r"</head>", PRESENT_CSS + "</head>", s, where)
        write(os.path.join(out, name), s)
    shutil.copy(os.path.join(src, "style.css"), os.path.join(out, "style.css"))
    finish(out)
    return out, len(pages)


def export_cover(urls):
    out = os.path.join(DIST, NAMES["cover"])
    reset(out)
    s = read(os.path.join(ROOT, "index.html"))
    for key in ("a", "b"):
        s = must_sub(r'src="%s/index\.html\?embed"' % key, 'src="%s/?embed"' % urls[key], s, "index.html")
        s = must_sub(r'href="%s/index\.html"' % key, 'href="%s/"' % urls[key], s, "index.html")
        s = must_sub(r'href="%s/([a-z-]+)\.html"' % key, r'href="%s/\1"' % urls[key], s, "index.html")
    write(os.path.join(out, "index.html"), s)

    w = read(os.path.join(ROOT, "write.html"))
    w = must_sub(r'href="index\.html"', 'href="/"', w, "write.html")
    for key in ("a", "b"):
        w = must_sub(r'href="%s/index\.html"' % key, 'href="%s/"' % urls[key], w, "write.html")
        w = must_sub(r'href="%s/([a-z-]+)\.html(#[a-z-]+)?"' % key, r'href="%s/\1\2"' % urls[key], w, "write.html", 0)
    write(os.path.join(out, "write.html"), w)
    finish(out)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for key in ("cover", "a", "b"):
        ap.add_argument("--" + key, default="https://%s.vercel.app" % NAMES[key], help="%s 사이트 주소" % NAMES[key])
    args = ap.parse_args()
    urls = {k: getattr(args, k).rstrip("/") for k in ("cover", "a", "b")}
    print("표지  ", export_cover(urls))
    for key in ("a", "b"):
        out, n = export_site(key, urls)
        print("시안 %s" % key.upper(), out, "(%d쪽)" % n)
    print("주소:", json.dumps(urls, ensure_ascii=False))


if __name__ == "__main__":
    main()
