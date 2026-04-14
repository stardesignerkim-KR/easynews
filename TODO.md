# EasyNews (이지뉴스) - 작업 현황 및 TODO

## 프로젝트 개요

특수교육 대상 아동(초등학교 저학년 수준)을 위한 쉬운 뉴스 카드 앱.
네이버 뉴스 API로 기사를 수집하고, Claude AI가 쉬운 말로 변환하며, Pollinations AI로 삽화를 생성한다.

**기술 스택:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Claude API · 네이버 검색 API · Pollinations AI

---

## 완료된 작업

### 핵심 기능 구현
- [x] **네이버 뉴스 API 연동** (`src/app/api/news/route.ts`)
  - 환경, 문화, 동물, 건강, 축제, 영화, 스포츠, 여행 8개 카테고리 검색
  - 범죄·폭력·사고 등 부정적 키워드 필터링
  - 카테고리당 5개 기사 조회 후 1개 선별
- [x] **Claude AI 변환** (`src/app/api/news/route.ts`)
  - 기사를 초등 저학년 수준의 쉬운 말로 변환
  - 헤드라인(5단어 이내), 슬라이드(3~5개, 20자 이내) 생성
  - JSON 구조화 출력 (headline, slides, thumbnailPrompt)
- [x] **Pollinations AI 이미지 생성** (`src/app/api/news/route.ts`)
  - 카와이 스타일, 파스텔 컬러 어린이 삽화 생성
  - 썸네일 및 슬라이드별 이미지 URL 생성
  - 랜덤 seed로 매번 새로운 이미지 생성

### UI 컴포넌트
- [x] **메인 페이지** (`src/app/page.tsx`)
  - 노란색 헤더 + 그라디언트 배경
  - "새 뉴스 불러오기" 버튼 (로딩 중 비활성화)
  - 2열(모바일) / 4열(데스크탑) 반응형 그리드
  - 로딩 스켈레톤 애니메이션 (8개)
  - 에러 메시지 + 재시도 버튼
  - 초기 안내 화면
- [x] **뉴스 카드** (`src/components/NewsCard.tsx`)
  - 썸네일 이미지 + 헤드라인 오버레이
  - 호버 시 scale-up 애니메이션
  - 접근성(포커스 링) 처리
- [x] **카드뉴스 뷰어** (`src/components/CardNewsViewer.tsx`)
  - 슬라이드 이미지 풀스크린 모달
  - 이전/다음 버튼 + 점(dot) 네비게이션
  - TTS(Web Speech API) 읽어주기 기능 (한국어, 속도 0.85)
  - 이미지 로드 실패 시 컬러 배경 폴백
  - 홈 버튼으로 모달 닫기

### 설정 및 인프라
- [x] **타입 정의** (`src/types/news.ts`) — `NewsItem`, `NewsSlide` 인터페이스
- [x] **Next.js 이미지 설정** (`next.config.ts`) — Pollinations AI 도메인 허용
- [x] **환경변수 구조** (`.env.local`) — ANTHROPIC_API_KEY, NAVER_CLIENT_ID, NAVER_CLIENT_SECRET

---

## 현재 문제점

### 긴급 (앱이 동작하지 않음)
- [ ] **환경변수 미설정** — `.env.local`에 실제 API 키가 입력되지 않아 뉴스 로드 불가
  - `ANTHROPIC_API_KEY` → https://console.anthropic.com 에서 발급
  - `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` → https://developers.naver.com 에서 검색 API 앱 등록 후 발급

---

## 다음 단계 TODO

### 1단계 — 즉시 해결 (API 키 설정)
- [ ] 네이버 개발자센터에서 앱 등록 및 검색 API 활성화
- [ ] `.env.local`에 실제 키 입력 후 `npm run dev`로 동작 확인

### 2단계 — 안정성 개선
- [ ] **이미지 로딩 UX** — Pollinations AI는 응답이 느릴 수 있어 스켈레톤/스피너 추가
- [ ] **API 응답 캐싱** — 동일 요청 반복 방지를 위해 Next.js `revalidate` 또는 Redis 캐싱 도입
- [ ] **에러 세분화** — 네이버 API 오류 / Claude 오류 / 이미지 오류를 사용자에게 구분하여 안내
- [ ] **재시도 로직** — 네이버 API 개별 쿼리 실패 시 다른 쿼리로 자동 보완

### 3단계 — 기능 확장
- [ ] **카테고리 선택** — 사용자가 관심 카테고리를 선택할 수 있는 필터 UI
- [ ] **즐겨찾기** — LocalStorage를 활용한 뉴스 저장/북마크 기능
- [ ] **공유 기능** — 카드뉴스를 이미지로 저장하거나 링크로 공유
- [ ] **날짜별 뉴스** — 오늘의 뉴스를 날짜 기준으로 보관하는 히스토리
- [ ] **폰트 크기 조절** — 접근성 강화를 위한 텍스트 크기 조절 버튼

### 4단계 — 배포
- [ ] **Vercel 배포** — `vercel deploy`로 프로덕션 배포
  - Vercel 대시보드에서 환경변수 설정 필요
- [ ] **도메인 연결** — 커스텀 도메인 설정 (선택)
- [ ] **모니터링** — API 호출 실패율 및 응답시간 트래킹

---

## 파일 구조

```
EasyNews/
├── src/
│   ├── app/
│   │   ├── api/news/route.ts     # 뉴스 수집·변환 API 엔드포인트
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── page.tsx              # 메인 페이지
│   ├── components/
│   │   ├── NewsCard.tsx          # 뉴스 썸네일 카드
│   │   └── CardNewsViewer.tsx    # 슬라이드 뷰어 모달
│   └── types/
│       └── news.ts               # TypeScript 타입 정의
├── .env.local                    # API 키 (Git 제외)
├── next.config.ts                # Next.js 설정 (이미지 도메인)
└── TODO.md                       # 이 파일
```
