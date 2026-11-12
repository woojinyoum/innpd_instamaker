# Insta Card News Maker (innpd_instamaker)

인스타그램 카드뉴스 / 릴스 제작 웹앱. **모든 코드는 `index.html` 한 파일**에 들어있습니다. (인라인 HTML/CSS/JS)

🌐 배포 주소: https://woojinyoum.github.io/innpd_instamaker/

---

## 다른 컴퓨터에서 이어서 작업하기

### 1. 저장소 복제 (한 번만)
```bash
git clone https://github.com/woojinyoum/innpd_instamaker.git
cd innpd_instamaker
```
이 한 줄이면 전체 앱(`index.html`)과 참고자료가 전부 받아집니다. **다른 폴더나 파일은 필요 없습니다.**

### 2. Claude(Claude Code)로 작업
- Claude Code에서 이 폴더(`innpd_instamaker`)를 열고 작업하면 됩니다.
- 수정 대상은 거의 항상 `index.html` 입니다.

### 3. 배포 (수정 → 반영)
```bash
git add -A
git commit -m "변경 내용"
git push
```
→ GitHub Pages가 1~2분 내 자동으로 사이트를 갱신합니다. 별도 배포 스크립트 불필요.

로컬에서 미리 보려면 `index.html`을 브라우저로 그냥 열면 됩니다.

---

## 파일 설명
| 파일 | 역할 |
|---|---|
| `index.html` | **전체 앱** (HTML+CSS+JS 전부 인라인). 수정은 여기서. |
| `title_hooking_guide.md` | 후킹 제목 생성 기능의 참고 지침 (가이드 원문) |
| `.nojekyll` | GitHub Pages가 Jekyll 처리 안 하도록 (건드리지 말 것) |
| `README.md` | 이 설명서 |

---

## 주요 기능 메모 (Claude가 맥락 파악용)
- **모드**: 게시물(1080×1350) / 🔥핫뉴스 탭 전환 (예전 "릴스" 탭은 핫뉴스 탭으로 대체)
- **핫뉴스 탭** (`#hotPanel`, JS는 `/* ===== 🔥 핫뉴스` 블록)
  - 나라 선택 `S.hotCountry` kr/jp/us (`HOT_CC` 설정, `applyHotCountry`): 한국=네이버 랭킹, 일본=Yahoo!ニュース 아크세스 랭킹(`fetchRankJPYahoo`, `yjItemFromAnchor`)+라이브도어(`fetchRankJPLivedoor`), 미국=Google Trends RSS(`fetchRankUSTrends`)+Yahoo News 홈(`fetchRankUSYahoo`). 기사 파서는 호스트별 디스패치(`parseArticle` → Naver/YJ/LD/Generic), 검색은 `searchNews` → 네이버/Yahoo!ニュース/Yahoo News. 미국 차단 언론사는 `hotFetchArticle`이 Yahoo News 검색으로 같은 기사 Yahoo 게재본을 대체 수집. 출력 언어 `hotOutLang()`(일본·미국은 기사 언어 그대로/한국어 선택), 일본어면 `hotFontFix`로 Noto Sans JP.
  - 출력 형식 선택: 🎬 릴스 영상(1080×1920, N초 MP4 — 기본 7초, 천천히 확대 효과 선택) / 📰 게시물(1080×1350 PNG)
  - 네이버 뉴스 랭킹(많이 본 `popularDay` / 댓글 많은 `popularMemo`)을 `r.jina.ai` 리더 프록시(CORS 허용, EUC-KR 변환)로 수집 → Claude가 핫 주제 10개 선별(키 없으면 휴리스틱) → "다른 뉴스 10개"로 교체 가능
  - 기사 클릭 → 본문/사진 파싱 → 카드 생성(기존 제목 스타일·로고·오버레이·그라데이션 유지) → 후킹 제목 5개 자동 생성·최고점 적용 (제목 다시 뽑기 섹션으로 교체 가능)
  - 배경 사진: 기사 사진 / 유사 기사 사진(네이버 뉴스 검색 썸네일) / AI 생성(OpenAI) / 직접 업로드. 외부 이미지는 `images.weserv.nl` 프록시로 받아 data URL화(캔버스 내보내기 가능)
  - 부가: 키워드 검색·기사 URL 직접 입력, 인스타 캡션+해시태그 생성(복사), 번역 버튼 그대로 사용 가능
  - 릴스 형식 다운로드 시 정지 이미지 카드도 MP4로 렌더(`renderStillVideoCard`, 무음 오디오 트랙 포함)
  - ⚡ 자동 생성(`autoHot`): 랭킹 수집 → 주제 N개 선별 → 기사별 카드 생성(프리셋 스타일 `applyStyle` 일괄 적용, 대표 사진, 후킹 제목·기승전결 요약 `hotTitlePrompt`) → 각 카드에 `c.hotArt` 연결(카드 이동 시 `syncHotCard`가 기사 패널·제목 후보 동기화)
  - 여러 장은 기사 사진이 2장 이상일 때만(게시물 형식): 1장 제목 카드 + 나머지 사진 카드(`makePhotoCards`, 제목·그라데이션 없음, `fitPhotoToCard`로 블러 배경 채움 또는 AI 채우기). `c.hotSlide`/`c.hotTotal`, 교체는 `hotGroupIdx`로 그룹 통째, 목록·메모장은 표지(`!c.hotSlide`) 기준
  - 다운로드 ZIP(`hotnews_YYYY-MM-DD.zip`)에 본문 메모장 `본문메모_YYYY-MM-DD.txt` 동봉(`buildHotMemo`: 카드별 제목·출처·원문·제목 후보·본문(참고용)·해시태그·캡션, UTF-8 BOM + CRLF)
  - 스타일 프리셋은 우측 ⭐ 프리셋(`icnm_presets`)과 동일 목록(제목 스타일 t·본문 스타일 b·로고·그라데이션), 핫뉴스 선택값은 `hot_ps`
- **API**: Claude(Anthropic) — 이미지 분석·후킹 제목·번역 / OpenAI — AI 배경 이미지 생성·캡처 정리·고화질 변환
  - API 키는 사용자가 좌측 패널에 입력, 브라우저 localStorage에 저장 (코드에 하드코딩 안 됨)
- **라이선스 게이트**: Supabase로 키 검증 + 기기 2개 제한 (SB_URL/SB_KEY는 공개 anon 키)
- **편집**: 제목 스타일(폰트/색/강조/테두리/그림자/배경박스), 로고, 오버레이(원형/테두리/내부 패닝), 그라데이션, 크롭/확대/이동
- **🛍 쇼핑 탭** (`#shopPanel`, `S.mode==='shop'`, JS `/* ===== 🛍 쇼핑 제안`): 핫뉴스 자동 생성 끝에(`#hotAutoShop`) 기사마다 `shopForArticle` → Claude `web_search_20260209`(allowed_domains coupang.com, `apiTools`가 pause_turn 이어가기)로 실제 쿠팡 상품 URL(`CP_PROD_RE` 검증) + 링크트리 후킹 제목. 검색 끄면 검색 링크만. 쿠팡 페이지 직접 수집·파트너스 API는 브라우저에서 불가. 결과는 `art.shop`(메모장 수록) / 직접 입력은 `S.shop.textGroups`; 쇼핑 모드는 `body.mode-shop`으로 카드·편집 패널 숨김.
- **🔗 쿠팡 파트너스 자동 링크**: 파트너스 Open API 딥링크(`POST /v2/providers/affiliate_open_api/apis/openapi/v1/deeplink`). 서명(`cpSign`: signed-date yyMMddTHHmmssZ(UTC)+method+path+query → HMAC-SHA256 hex, `CEA algorithm=HmacSHA256, access-key=…, signed-date=…, signature=…`)은 브라우저 WebCrypto로 생성하고, CORS 때문에 `proxy/cloudflare-worker.js`(Cloudflare Worker, 키 미저장·경로 제한)가 api-gateway.coupang.com 에 전달. 키·프록시 URL은 localStorage(`cp_ak`/`cp_sk`/`cp_proxy`/`cp_sub`), `cpAttachLinks`가 상품 URL → `shortenUrl`(link.coupang.com/a/…)로 `it.link` 채움(`linkAuto`). 쇼핑 제안 생성 시 자동(`cp_auto`), 수동은 "🔗 파트너스 링크 만들기".
- **출력**: PNG(canvas), MP4(MediaRecorder — 동영상 카드 또는 핫뉴스 릴스 형식), 모바일은 Web Share로 사진첩 저장
- **자동 저장**: IndexedDB에 작업 복원
- **프리셋**: 제목스타일/로고/그라데이션 저장·불러오기 (localStorage)
- **반응형**: 모바일에서 카드 상단 고정 + 세로 스택

## 참고
- 렌더링 라이브러리: html2canvas, JSZip (CDN)
- 폰트: Google Fonts + Pretendard + 여기어때 잘난체 (CDN)
- 이전 개발 환경(원래 맥)에서는 `Desktop/인스타컨텐츠제작메이커/` 개발폴더 + `deploy.sh`로 이 저장소에 복사해 push 했지만, **이제는 이 저장소에서 직접 수정 → push** 하는 방식이 더 간단합니다.
