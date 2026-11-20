# -*- coding: utf-8 -*-
"""시연판 데이터베이스에 넣을 기존 글(content.py)을 SQL로 만든다.

실행: python3 design/mockup/_build/seed.py  →  _build/supabase/seed.sql
- 블로그 글: 원문 링크(external_url)와 한 줄 요약만 넣는다(본문은 네이버에 있다).
- 카페 글: 원문 링크 없이 한 줄 요약만.
- '영주권 카드를 분실했다면'은 홈페이지에서 쓴 글처럼 본문과 3줄 요약을 넣는다.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from content import BLOG, POSTS  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "supabase", "seed.sql")

ADIT_SUMMARY = [
    "미국 안에서 영주권 카드를 잃어버렸다면 Form I-90으로 재발급을 신청합니다.",
    "새 카드를 기다리는 동안 해외여행이나 취업 확인이 필요하면 임시 영주권 증명(ADIT)을 요청할 수 있습니다. 이제 이민국 방문 없이 우편으로 받을 수도 있습니다.",
    "해외에서 잃어버렸다면 미국으로 돌아오기 위한 여행 서류(Form I-131A)가 필요할 수 있습니다.",
]
ADIT_BODY = """<p>영주권 카드를 잃어버리면 당황스럽지만, 순서대로 처리하면 어렵지 않습니다. 다만 <strong>어디에서 잃어버렸는지</strong>, <strong>가까운 시일 안에 해외여행 계획이 있는지</strong>에 따라 필요한 절차가 달라집니다.</p>
<h2>1. 미국 안에서 분실했을 때</h2>
<p>미국 안에서 카드를 잃어버리거나 도난당했다면 Form I-90(영주권 카드 교체 신청)을 제출해 새 카드를 받습니다. 온라인으로도 접수할 수 있습니다.</p>
<ol class="steps">
<li><strong>경위 정리</strong><br>언제, 어디서 잃어버렸는지 정리합니다. 도난이라면 경찰 신고 기록을 남겨 두면 신분 도용에 대비하는 데 도움이 됩니다.</li>
<li><strong>Form I-90 제출</strong><br>신청서를 작성해 제출합니다. 수수료는 자주 바뀌므로 USCIS 공식 페이지에서 확인하세요.</li>
<li><strong>접수증 보관</strong><br>접수 후 받는 접수증(I-797C)을 잘 보관하고, 생체정보(지문) 예약 통지를 확인합니다.</li>
</ol>
<h2>2. 새 카드를 기다리는 동안: 임시 증명(ADIT)</h2>
<p>새 카드가 나오기 전에 해외여행을 하거나 고용주에게 신분을 증명해야 한다면, 영주권자임을 보여 주는 임시 증명(흔히 ‘ADIT 스탬프’라고 부릅니다)을 요청할 수 있습니다. USCIS 고객센터에 요청하면 상황에 따라 우편으로 받거나, 현지 사무소 방문 예약을 잡게 됩니다.</p>
<blockquote><strong>여행 계획이 있다면 먼저 확인하세요</strong><br>유효한 영주권 증명 없이 출국하면 다시 들어올 때 절차가 복잡해질 수 있습니다.</blockquote>
<h2>3. 해외에서 분실했을 때</h2>
<p>해외에 머무는 동안 카드를 잃어버렸다면, 미국행 항공기에 탑승하기 위한 여행 서류(Form I-131A)를 신청해야 할 수 있습니다. 해외 체류 기간이 길었다면 영주권 유지와 관련한 검토가 함께 필요할 수 있으니 미리 상담을 받는 것이 좋습니다.</p>
<h2>4. 상황별로 한눈에 보기</h2>
<table><thead><tr><th>상황</th><th>필요한 절차</th><th>참고</th></tr></thead><tbody>
<tr><td>미국 안에서 분실·도난</td><td>Form I-90으로 재발급 신청</td><td>도난이라면 경찰 신고 기록 보관</td></tr>
<tr><td>새 카드 전에 여행·취업 증빙 필요</td><td>임시 증명(ADIT) 요청</td><td>USCIS 고객센터에 요청 (우편 또는 방문)</td></tr>
<tr><td>해외에서 분실</td><td>Form I-131A(탑승용 여행 서류) 검토</td><td>장기 체류였다면 사전 상담 권장</td></tr>
</tbody></table>
<p>평소에 여권 사본, 영주권 카드 사본, 영주권 승인 통지서처럼 신분을 확인할 수 있는 서류를 따로 보관해 두면 분실했을 때 훨씬 수월합니다.</p>
<h3>공식 정보 확인</h3>
<ul>
<li><a href="https://www.uscis.gov/i-90">USCIS · Form I-90 (영주권 카드 교체)</a></li>
<li><a href="https://www.uscis.gov/i-131a">USCIS · Form I-131A (해외 분실 시 여행 서류)</a></li>
<li><a href="https://www.uscis.gov/contactcenter">USCIS 고객센터</a></li>
<li><a href="https://egov.uscis.gov/processing-times/">USCIS 처리 기간</a></li>
</ul>"""


def q(s):
    return "'" + s.replace("'", "''") + "'"


def arr(items):
    return "array[%s]::text[]" % ", ".join(q(i) for i in items) if items else "'{}'::text[]"


def main():
    rows = []
    seen = {}
    for p in POSTS:
        n = seen.get(p["date"], 0)
        seen[p["date"]] = n + 1
        when = "(timestamp %s at time zone 'America/Los_Angeles') - interval '%d minutes'" % (
            q(p["date"].replace(".", "-") + " 09:00"), n)
        src = p["src"]
        if src == "post":
            source, ext, summary, body = "site", "null", ADIT_SUMMARY, ADIT_BODY
        elif src.startswith("blog:"):
            source, ext, summary, body = "blog", q(BLOG + src[5:]), [p["sum"]], ""
        else:
            source, ext, summary, body = "cafe", "null", [p["sum"]], ""
        rows.append("  (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'published', %s, %s)" % (
            q(p["board"]), q(p["type"]), q(p["title"]), arr(summary), q(body), arr(p["hubs"]), arr(p["tags"]),
            ext, q(source), when, when))
    sql = ("-- 기존 글 %d편 (_build/seed.py 가 content.py 에서 만든다)\n"
           "insert into public.posts (board, type, title, summary, body_html, hubs, tags, external_url, source, status, published_at, updated_at)\nvalues\n"
           % len(rows)) + ",\n".join(rows) + ";\n"
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print("%s (%d rows, %d bytes)" % (OUT, len(rows), len(sql.encode("utf-8"))))


if __name__ == "__main__":
    main()
