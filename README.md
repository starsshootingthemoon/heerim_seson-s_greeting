# HEERIM 2027 Digital Greeting

React + Vite로 구현한 정적 모바일 웹 연하장입니다. 백엔드·DB 없이 수신자·기업명·언어·발신자에 맞는 링크를 생성합니다. Figma 파일은 변경하지 않습니다.

## 실행

Node.js 22.12 이상 (권장: 24 LTS).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

진입 화면은 루트 주소, 인사 화면은 `#greeting`, 링크 생성기는 `#generator`입니다. 관리자 페이지는 생성용 화면이며 로그인·비공개 관리 기능은 없습니다. 해시로 화면을 전환하므로 Pages에서 새로고침해도 별도 라우팅 설정이 필요하지 않습니다.

## 개인화

루트 주소에 `?to=Kim&company=ABC&lang=en&from=heerim`을 붙입니다. 생성기가 현재 브라우저의 실제 origin과 Vite base를 사용하므로 개발 서버·GitHub Pages·사용자 도메인에서 각각 올바른 주소를 생성합니다.

| 값 | 내용 |
| --- | --- |
| `to` | 수신자, 최대 60자 |
| `company` | 회사명, 최대 100자 |
| `lang` | `ko`, `en`, `ru`, `vi`, `az` |
| `from` | `src/data/senders.js`의 발신자 코드 또는 `custom` |
| `senderName`, `senderTitle` | 직접 입력 발신자일 때만 사용 |
| `message` | `standard` 또는 `brief` |

React 텍스트 출력과 URLSearchParams 인코딩을 사용하며 HTML을 삽입하지 않습니다. 제어문자를 제거하고 길이·언어·발신자 코드를 검증합니다. URL은 누구나 읽고 수정할 수 있습니다. 비밀 정보·민감한 개인정보를 넣지 마세요. 입력값은 DB, localStorage, 쿠키에 저장하지 않습니다. 서버 접근 로그와 메신저에는 URL이 남을 수 있습니다.

## 문구·서명·언어 수정

- `src/data/translations.js`: 인사말과 UI 문구, 출처, 검수 상태를 수정합니다. 객체에 언어를 추가하면 메뉴에도 자동 반영됩니다.
- 한국어는 제공된 Figma 문구를 사용하며 시안의 2026 표기를 2027로 수정했습니다.
- 영어·러시아어·베트남어·아제르바이잔어는 사용자가 제공한 기존 공식 연하장 이미지·GIF의 문구를 옮기고 연도만 변경했습니다. 2027년용 최종 검수가 필요합니다. 번역이 제공되지 않은 UI는 한국어로 표시하고 화면에 안내합니다.
- 베트남어 원문의 ‘Mã Đáo Thành Công’은 원문대로 보존합니다. 말과 관련된 표현이므로 2027년 붉은 양 콘셉트와의 적합성 검수가 필요합니다.
- 승인된 번역을 받은 뒤 해당 항목의 `headline`, `year`, `greeting`, `ui`를 채우고 `status`를 `provided`로 변경하세요. UI 키 목록은 한국어 항목을 참조합니다.
- `src/data/senders.js`: 발신자 코드별 성명·소속·직책과 메시지를 관리합니다. 제공된 서명은 `public/assets/`에 저장하고 `signature: 'assets/signature-name.png'`처럼 설정합니다. 현재 공식 서명 파일이 없어 임의 서명을 넣지 않았습니다.
- 자동 번역, 자동 발송, 수신자 목록 저장, 발송 추적은 포함하지 않습니다.

## 디자인·에셋

Figma의 양, 봉투, 하프톤 건축 이미지, 공유 아이콘과 공통 링크 썸네일을 그대로 다운로드했습니다. 대응 관계는 `design/assets.json`에 기록했습니다. `design/reference-*.png`는 비교용이며 웹 화면의 배경으로 사용하지 않습니다. 폰트는 디자인과 같은 Cormorant Garamond, Noto Serif KR, Noto Sans KR를 패키지로 포함하므로 외부 폰트 서버가 필요하지 않습니다.

건축 이미지는 WebP 약 240KB를 우선 사용하고 PNG 폴백을 제공합니다. 이미지 아래쪽의 흰색 페이드와 마스크는 Figma에 맞췄습니다. 공유 썸네일은 `public/assets/og-card-wide.png`입니다.

## GitHub Pages 배포

대상 저장소: https://github.com/starsshootingthemoon/heerim_seson-s_greeting

기본 배포 경로는 `/heerim_seson-s_greeting/`입니다. `vite.config.js`는 실제 저장소의 예상 Pages 주소를 기본값으로 사용합니다. 실제 배포 완료 URL은 Actions의 `Deploy` 결과와 저장소 Pages 설정에서 확인하세요.

1. 저장소의 **Settings → Pages → Source**에서 **GitHub Actions**를 선택합니다.
2. 이 프로젝트를 저장소 루트에 넣고 `main` 브랜치에 push합니다.
3. `.github/workflows/deploy.yml`이 테스트·빌드·배포를 수행합니다.
4. 워크플로는 `configure-pages`의 실제 `base_url`을 빌드에 전달합니다. 사용자 도메인도 같은 방식으로 반영됩니다.

다른 저장소·도메인에서 수동 빌드할 때는 `.env.local`의 `VITE_SITE_URL`을 실제 최종 주소로 설정합니다. 이 값으로 Vite base와 OG 절대 주소를 함께 생성합니다. `.env.local`은 커밋하지 않습니다.

```sh
VITE_SITE_URL=https://your-actual-domain/path/ npm run build
```

참고: [Vite 공식 GitHub Pages 가이드](https://vite.dev/guide/static-deploy.html#github-pages).

## Cloudflare Pages에 연결

개인 GitHub 아이디가 포함되지 않는 `프로젝트명.pages.dev` 기본 주소로 배포할 수 있습니다. 아직 생성되지 않은 주소를 실제 배포 주소로 사용하지 않습니다.

1. Cloudflare에 로그인한 뒤 **Workers & Pages → Create application → Pages → Connect to Git**에서 GitHub를 연결합니다.
2. `starsshootingthemoon/heerim_seson-s_greeting` 저장소를 선택합니다. 권한을 요청하면 해당 저장소만 선택합니다.
3. 프로젝트 이름은 사용 가능한 희림 연하장용 이름을 지정합니다. Production branch는 `main`입니다.
4. Build command는 `npm run build`, Build output directory는 `dist`, Root directory는 저장소 루트로 둡니다.
5. Node.js는 `.node-version`의 24를 사용합니다. 이전에 GitHub Pages 주소로 설정한 `VITE_SITE_URL`이 있으면 제거합니다.
6. Cloudflare가 제공하는 `CF_PAGES_URL`을 자동으로 읽어 루트 에셋 경로와 공통 OG를 생성합니다. 공식 도메인이 생기면 `VITE_SITE_URL`에 그 도메인을 지정할 수 있습니다.
7. 배포 후 발급된 실제 주소에서 연하장·링크 생성기·언어 전환·대표 이미지를 검증합니다.

기존 GitHub Pages 배포와 설정은 유지됩니다. GitHub에 수정 사항을 push하면 연결된 Cloudflare Pages에서도 다시 빌드합니다. Cloudflare 계정 로그인과 최초 GitHub 연결 권한 승인이 필요합니다.

참고: [Cloudflare Git integration 가이드](https://developers.cloudflare.com/pages/get-started/git-integration/).

## 공유·OG

모든 링크는 빌드 시 HTML에 포함한 공통 OG 이미지·제목·설명을 사용합니다. 수신자별 문구는 JavaScript가 화면 안에서 변경합니다. 메신저 크롤러가 JavaScript를 실행하지 않아도 공통 OG를 읽을 수 있습니다. 개인별 미리보기·캐시 갱신·메신저별 표시를 보장하지 않습니다. 배포 후 실제 카카오톡·문자·이메일에서 확인하세요.

Clipboard API가 막히면 수동 복사 안내를 제공합니다. Web Share를 지원하지 않으면 링크 복사를 시도합니다. 모달은 native dialog로 포커스를 가두고 Escape로 닫습니다.

## 브라우저 검증

```sh
npx playwright install chromium
npm run dev
# 다른 터미널에서
npm run test:browser
# 프로덕션 미리보기에 대해 실행
TEST_URL=http://127.0.0.1:4173/heerim_seson-s_greeting/ npm run test:browser
```

이미 설치된 Chrome을 사용할 때는 `PLAYWRIGHT_CHANNEL=chrome npm run test:browser`로 실행할 수 있습니다.

375·390·430px 및 데스크톱, URL 개인화·검증·언어 폴백·봉투 전환·생성 모달·키보드·복사/공유 폴백을 확인합니다. 스크린샷과 결과는 `test-results/`에 저장합니다.

실제 도입 전 공식 다국어 문구, 직책·성명·서명, 해외 접속 속도, 실제 모바일 기기와 메신저 미리보기의 검수가 필요합니다.

## 버전 2: 건축 빛 연출
`/v2/`에서 원본 희림33 PSD를 WebP로 최적화한 이미지와 SVG 윤곽 조명, CSS 카메라 확대를 자동 재생합니다. 영상 파일이나 실제 공사 영상이 아닌 웹 모션 시안입니다. URL 개인화 및 언어 전환을 지원하며, 모션 일시정지와 동작 감소 설정을 제공합니다. 기존 루트 연하장은 유지됩니다.

로고: 희림 공식 홈페이지 https://www.heerim.com/kr/ 의 정적 SVG 로고를 사용합니다. 사진 배경이 없는 벡터이며, 밝은 배경에는 검정·야경에는 흰색으로 표시합니다.
