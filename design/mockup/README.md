# 홈페이지 디자인 시안 (반응형 HTML)

김형걸 이민법 변호사(Law Offices of Vincent Kim) 홈페이지 시안 두 가지입니다. A는 정보 중심, B는 변호사 1인 브랜드 중심으로 구성부터 다릅니다. 변호사님이 의뢰 메일에서 요청한 메뉴 6개(홈·변호사 소개·업무분야·이민법소식·전문가칼럼·상담안내)를 모두 실제 페이지로 만들었고, 영문 페이지와 관리자 글쓰기 화면도 들어 있습니다. 기획 근거는 [docs/website-plan.md](../../docs/website-plan.md), 참고 사이트 분석은 [docs/benchmark-sites.md](../../docs/benchmark-sites.md), B안의 근거인 jkparklaw.com·kfreemanlawoffice.com 상세 분석은 [docs/benchmark-jkpark-kfreeman.md](../../docs/benchmark-jkpark-kfreeman.md)에 있습니다.

## 보는 방법

- `index.html`을 브라우저로 열면 두 시안을 비교하는 표지가 나옵니다. 각 시안의 페이지 목록과 글쓰기 화면으로 이동할 수 있습니다.
- 글꼴(Pretendard, Noto Serif KR)과 지도는 인터넷에서 불러옵니다. 오프라인에서는 기본 글꼴로 보입니다.
- 의뢰인에게 링크로 보내려면 이 폴더를 그대로 웹 서버에 올리면 됩니다(`_build/`는 빼도 됩니다). 모든 페이지에 `noindex`가 들어 있어 검색엔진에 노출되지 않습니다.

## 구성

```
design/mockup/
├─ index.html                      표지: 두 시안 비교, 페이지 목록, 공통 기능, 확인 요청 사항
├─ write.html                      관리자 글쓰기 화면 (두 시안 공통)
├─ a/  시안 A · Wilshire Editorial (네이비·골드, 큰 명조 제목, LA 야경 모션)
│  ├─ index.html                   홈 (손으로 관리)
│  ├─ about.html                   변호사 소개: 인사말, 약력, 일하는 방식, 미디어·기고, 커뮤니티
│  ├─ practice.html                업무분야 개요: 상황별 안내, 분야 카드 4개, 자동 연결 설명
│  ├─ practice-green-card.html     업무분야 허브 ① 이민비자·영주권
│  ├─ practice-nonimmigrant-visa.html  ② 비이민비자
│  ├─ practice-citizenship.html    ③ 시민권
│  ├─ practice-removal-defense.html    ④ 추방재판·이민구제
│  ├─ news.html                    이민법 소식 게시판 (분류·업무분야·검색·페이지)
│  ├─ column.html                  전문가 칼럼 게시판
│  ├─ post.html                    게시글 상세 (전문가 칼럼 › 실무 가이드)
│  ├─ contact.html                 상담 안내: 방법, 절차, 상담료, 신청서, 오시는 길, FAQ, 필수 링크
│  ├─ en.html                      English (실제 사이트에서는 4페이지로 나눔)
│  └─ style.css
├─ b/  시안 B · Personal Counsel (크림·딥그린·테라코타, 변호사 1인 브랜드형) — 파일 이름은 a/와 같고 구성이 다름
│  ├─ index.html                   홈 (생성기가 만든다): 전체 폭 인물 히어로, 주요 업무·영상 칼럼, 두 갈래 업무분야,
│  │                               수치 타일, 영상 칼럼, 소식 띠, 칼럼 아카이브, 일하는 방식, 승인 사례 슬라이드, 간단 문의
│  ├─ about.html                   사진·직통 연락처 카드 + 1인칭 인사말 + 프로필 목록 + 연혁, 일하는 방식, 미디어, 커뮤니티
│  ├─ practice.html                두 갈래(신분을 얻는 일 / 지키는 일), 비자·서류 번호 카탈로그 20개, 상황별 안내
│  └─ (나머지)                     a/와 같은 구조 + 업무분야 상세의 본문 속 상담 줄, 상담 안내의 큰 전화번호 카드
├─ assets/
│  ├─ base.css      공통 레이아웃·컴포넌트 (테마 변수는 각 시안 style.css에서 정의)
│  ├─ pages.css     서브 페이지 공통 컴포넌트 (색은 시안 변수 --ph-*, --band-* 등을 씀)
│  ├─ mockup.js     공통 인터랙션 (외부 라이브러리 없음)
│  ├─ admin.css, admin.js  글쓰기 화면
│  ├─ icons.js      SVG 아이콘 (file://에서도 보이도록 스크립트로 삽입)
│  └─ attorney.jpg, attorney-face.jpg  변호사 사진 (임시)
└─ _build/          서브 페이지 생성기 (아래 참고)
```

## 페이지 다시 만들기

A 홈(`a/index.html`)을 뺀 나머지 23페이지(A 서브 11개, B 홈 + 서브 11개)는 생성기로 만듭니다. 헤더·푸터·빠른 상담 버튼이 모든 페이지에서 같게 유지됩니다. B 전용 화면은 `build.py`의 ‘시안 B 전용’ 구역(`page_home_b`, `about_b`, `practice_b`, `header_b`, `footer_b` 등)에 있습니다.

```
python3 design/mockup/_build/build.py
```

- 글 목록, 업무분야 원고, 상황별 안내는 `_build/content.py`에 있습니다. 글을 추가하거나 분류를 바꾸려면 여기만 고치고 다시 실행합니다.
- 페이지 구조는 `_build/build.py`에 있습니다. 생성된 HTML을 직접 고치면 다음 실행 때 덮어써집니다.
- Python 3.9 이상, 외부 패키지 없음.

## 시연판: 변호사님이 직접 쓰는 글 (Supabase)

- 글쓰기: https://vk-proposal.vercel.app/write 에서 로그인하면 이민법 소식·전문가 칼럼에 글을 발행·임시 저장·예약·수정·삭제할 수 있습니다. 사진은 브라우저에서 1600px WebP로 줄여 올립니다.
- 발행한 글은 게시판, 홈의 최신 소식·칼럼, 상단 소식 띠, 업무분야 페이지 '관련 글', 게시글 상세(`/post?id=번호`)에 바로 나타납니다(`assets/live.js`).
- 데이터베이스: Supabase 프로젝트 `vk-proposal-demo` (ref `inkaxcxdgrsluikccsln`, us-west-1, kish1919 조직). 설계는 `_build/supabase/schema.sql`, 기존 글 53편은 `_build/seed.py` → `_build/supabase/seed.sql`.
- 권한: 누구나 발행된 글만 읽기. 쓰기·고치기·지우기·사진 올리기는 `editors` 표에 등록된 계정만(행 수준 보안). `assets/config.js`의 키는 공개용(anon) 키입니다.
- 시연 계정 2개(변호사님용 `vincent`, 제작사용 `agency`)는 저장소에 넣지 않았습니다. 비밀번호는 Supabase 대시보드 Authentication에서 바꿀 수 있습니다.
- 비용: 이 프로젝트가 켜져 있는 동안 Supabase 사용료가 붙습니다. 시연이 끝나면 대시보드에서 프로젝트를 일시 정지(Pause)하거나 삭제하세요. 그러면 사이트는 자동으로 정적 시안 내용으로 돌아갑니다.

## Vercel 배포 (발표용 사이트 3개)

| 주소 | 내용 |
|---|---|
| https://vk-proposal.vercel.app | 표지(두 시안 비교) · `/write` 글쓰기 화면 |
| https://vk-proposal-a.vercel.app | 시안 A (첫 화면이 홈) |
| https://vk-proposal-b.vercel.app | 시안 B |

배포용 폴더는 `_build/export.py`가 `dist/` 아래에 따로 만듭니다(원본은 그대로). 발표용으로 '시안' 배지, 시안 메모, '상세 화면 예시' 표시를 숨기고, 주소에서 `.html`을 빼며, 모든 응답에 `X-Robots-Tag: noindex` 헤더를 붙입니다. '확인 필요' 표시와 푸터의 '디자인 시안' 한 줄은 남깁니다.

시안을 고친 뒤 다시 올리기:

```
python3 design/mockup/_build/build.py      # 서브 페이지를 고쳤다면
python3 design/mockup/_build/export.py
D=$(mktemp -d) && cp -R design/mockup/dist/. "$D"/
for d in vk-proposal-a vk-proposal-b vk-proposal; do npx vercel@latest deploy --prod --yes --cwd "$D/$d"; done
```

- **반드시 git 저장소 밖에서 배포하세요(위의 임시 폴더 복사).** 저장소 안에서 `--yes`로 배포하면 Vercel CLI가 프로젝트를 GitHub 저장소에 자동으로 연결합니다. 그러면 `master`에 push할 때마다 저장소 전체(기획서·회신 초안 포함)가 이 주소에 배포됩니다. 2026-11-20에 실제로 이 문제가 생겨 연결을 끊었습니다. 프로젝트 설정의 Git Repository가 `Not connected`인지 확인하세요.
- `dist/`와 각 폴더의 `.vercel/`(프로젝트 연결 정보)은 git에 올리지 않습니다(`.gitignore`). `.vercel/`이 없으면 같은 이름의 프로젝트에 다시 연결하거나 새로 만듭니다.
- Vercel 무료 주소는 링크를 아는 사람 누구나 볼 수 있습니다. 검색엔진에는 노출되지 않습니다.

## 들어 있는 인터랙션

| 기능 | 위치 | 참고 사이트 |
|---|---|---|
| 최신 소식 띠(자동 전환, 마우스를 올리거나 포커스하면 멈춤) | 맨 위 | Fragomen, Lincoln-Goldfinch |
| LA 야경 모션과 움직임 멈춤 버튼 (실제 사이트에서는 영상) | A 홈 히어로 | Boundless, WR Immigration |
| 업무분야 두 갈래 드롭다운(이민·비자 / 추방·구제), 이민법소식·칼럼 분류 드롭다운, 활성 메뉴 막대 | B 공통 헤더 | jkparklaw, kfreeman |
| 숫자 카운터 | 신뢰 지표 | Boundless |
| 1분 비자 진단 (3문항 → 결과 → 업무분야 페이지 또는 상담 신청서 자동 채움) | 모든 한국어 페이지 | SimVisa, Alma |
| 승인 사례 슬라이드(이전·다음 버튼, 면책 문구) | B 홈 | jkparklaw 후기 띠 |
| 자주 찾는 주제 태그(업무분야 안내나 게시판 검색 결과로 바로 이동) | B 푸터 | jkparklaw 태그 |
| 스크롤에 따라 그려지는 상담 절차 경로 | 홈, 상담 안내 | Alma |
| 게시판 분류·업무분야·검색·페이지 나누기 (`?cat=`, `?area=`, `?q=` 주소로 바로 열기) | 이민법 소식, 전문가 칼럼 | Fragomen |
| 페이지 안 메뉴(현재 위치 표시) | 변호사 소개, 업무분야 허브, 상담 안내 | — |
| 상담 신청서: 필수 항목 검사, 카카오톡 선택 시 ID 칸 표시, 글자 수 | 홈, 상담 안내, English | 대륜, Herman |
| 데스크톱 오른쪽 빠른 메뉴, 모바일 하단 고정 상담 바 | 공통 | 대륜 |
| 읽기 진행 막대, 목차 따라가기, 링크 복사 | 게시글 상세 | — |
| 글쓰기: 게시판·유형 선택, 글 템플릿 4종, 사진 끌어다 놓기, 발행 전 확인, SNS 공유 키트 | write.html | 기획서 §8 |
| 모바일 메뉴·비자 진단 창의 포커스 가두기, Esc로 닫기 | 공통 | 접근성 |
| 동작 줄이기 설정을 켠 사용자에게는 애니메이션 끄기 | 공통 | 접근성 |

## 예시·임시 내용 (의뢰인 확인 필요)

- **사진:** `assets/attorney.jpg`는 의뢰인 네이버 카페에 공개된 사무실 사진을 시안용으로 잘라 쓴 것입니다. 의뢰인에게 보내기 전에 사용해도 될지 확인하세요. 같은 파일 이름으로 바꾸면 모든 화면에 반영됩니다.
- **게시판 글:** 네이버 블로그 RSS(2026-11-20 수집)의 실제 제목·날짜 50편 중 미국생활 글 2편과 방송 글 1편을 뺀 47편, 그리고 기존 시안에 쓰던 카페 글 6편입니다. 요약은 원문 첫 문단을 바탕으로 줄였습니다. 제목을 누르면 블로그 원문이 새 창으로 열립니다(카페 글은 안내 문구만 나옵니다).
- **업무분야 원고:** 일반 정보 수준의 초안입니다. 실제 게시 전 변호사 검수가 필요합니다. 수수료·처리 기간 같은 숫자는 적지 않고 공식 페이지로 연결했습니다.
- **변호사 소개:** 인사말과 ‘이렇게 일합니다’ 세 가지는 예시 문안입니다. 학력·자격·소속 단체·기고 매체는 ‘확인 필요’로 비워 두었습니다.
- **운영 시간, 상담료, 상담 방식, 주차·대중교통:** 확인이 필요합니다. 화면에 ‘확인 필요’로 표시해 두었습니다.
- **수치(20년, 1,500+, 2,100+):** 카페·블로그 기준 값입니다. 홈페이지에 써도 되는지 확인하세요.
- **후기·숏츠:** 자리만 잡아 둔 예시입니다. 후기를 지어내지 않도록 ‘연동 예정’ 문구로 두었습니다.
- **글쓰기 화면의 도메인:** 공유 문구 속 `vincentkimlaw.com`은 기획서가 권장한 후보로, 확정되지 않았습니다.
- **게시글 본문:** 상세 화면 예시(영주권 카드 분실)는 일반 정보로 썼습니다. 실제 게시 전에 변호사 검수를 받아야 합니다.

## 실제 구축(WordPress + Elementor)으로 옮길 때

- 시안의 섹션이 그대로 Elementor 템플릿 단위가 됩니다. 홈·소개·업무분야는 섹션별 컨테이너로, 게시판 목록은 Loop Grid와 필터로, 게시글 상세는 Theme Builder 단일 글 템플릿으로 옮깁니다.
- 업무분야 허브의 ‘관련 소식·칼럼’은 글의 업무분야 분류(taxonomy)로 거르는 Loop Grid입니다. `_build/content.py`의 `hubs` 값이 그 분류에 해당합니다.
- 색·글꼴·둥근 정도는 `a/style.css`, `b/style.css` 맨 위 `:root` 변수에 모여 있습니다. Elementor 사이트 설정(Global Colors/Fonts)에 그대로 옮기면 됩니다.
- 비자 진단, 경로 타임라인, 스카이라인 모션은 `assets/mockup.js`의 해당 블록을 차일드 테마 스크립트로 옮기면 됩니다.
- 글쓰기 화면의 바로가기 버튼, 발행 전 확인, SNS 공유 키트는 사이트 전용 플러그인(기획서 §9.2)으로 WordPress 편집기에 붙입니다.
