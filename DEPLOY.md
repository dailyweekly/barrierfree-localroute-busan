# 배포 가이드 — GitHub + Vercel

## 0. 사전 준비
- GitHub 계정
- Vercel 계정 (GitHub 로그인 가능)
- Git 설치된 로컬 PC (Windows: Git for Windows)
- Node.js 20+ (로컬 dev 검증용)

## 1. 로컬에서 의존성·잔여 폴더 정리

PowerShell (관리자 권한 권장):
```powershell
cd "$env:USERPROFILE\Desktop\부산 AI\barrierfree-localroute-busan"

# Cowork 작업 환경에서 권한 한계로 일부 .git/node_modules 잔여물이 남아 있을 수 있습니다.
# 사용자 PC에서는 정상적으로 삭제 가능합니다 (첫 1회만 필요).
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 깨끗한 install
npm install

# 정합성 검증 (typecheck + test + check-forbidden 일괄)
npm run verify
```

## 2. GitHub 저장소 만들기 + push

### A. GitHub 웹에서 새 저장소 생성
1. https://github.com/new 접속
2. Repository name: `barrierfree-localroute-busan`
3. Private 권장 (공모전 제출 전 비공개)
4. README, .gitignore, license 추가하지 마세요 (이미 있음)
5. Create

### B. 로컬에서 push
```powershell
cd "$env:USERPROFILE\Desktop\부산 AI\barrierfree-localroute-busan"

git init -b main
git config user.name  "당신의 이름"
git config user.email "당신의이메일@example.com"

git add -A
git commit -m "feat: 배리어프리 로컬루트 부산 — 초기 시제품 (Next.js + Vercel)"

# YOUR_USERNAME 부분만 GitHub 사용자명으로 바꾸세요
git remote add origin https://github.com/YOUR_USERNAME/barrierfree-localroute-busan.git

git push -u origin main
```

> 인증을 묻는다면: GitHub 비밀번호 대신 **Personal Access Token (PAT)** 을 사용합니다. https://github.com/settings/tokens → Generate new token (classic) → repo 권한 체크 → 발급된 토큰을 비밀번호 칸에 입력.

## 3. Vercel 배포

1. https://vercel.com 접속 → GitHub 로그인
2. **Add New → Project** → 방금 만든 저장소 import
3. Framework Preset: **Next.js** (자동 인식)
4. **Environment Variables** 추가:
   | 변수 | 값 | 메모 |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | sk-ant-... | Claude API 키 |
   | `BUSAN_API_KEY` | 공공데이터포털 Decoded 키 | 5종 데이터 |
   | `PREVIEW_PASSWORD` | `test1234` | 초기 화면 비밀번호 (변경 권장) |
   | (선택) `ANTHROPIC_MODEL` | claude-sonnet-4-6 | 기본값 사용시 생략 |
   | (선택) `LLM_ENABLED` | true | false면 결정론적 폴백 |
   | (선택) `PREVIEW_AUTH_DISABLED` | false | true면 비밀번호 보호 해제 |
   | (선택) `NEXT_PUBLIC_BASE_URL` | https://your-project.vercel.app | sitemap/robots용 |
5. **Deploy** 클릭. 약 1~3분 후 배포 URL 발급.

## 4. 비밀번호 동작 검증

배포 URL 접속 → `/login` 화면으로 자동 리다이렉트 → `test1234` 입력 → `/` 로 입장.

쿠키 `preview-pass=ok` 가 7일간 유지됩니다. 비밀번호 변경은 Vercel Environment Variables의 `PREVIEW_PASSWORD` 값을 바꾸고 재배포(또는 Redeploy)합니다.

비밀번호 보호 완전 해제는 `PREVIEW_AUTH_DISABLED=true` 로 설정.

## 5. 시제품 캡처 및 QR

발표 자료용:
- `/api/qr?text=<배포 URL>` 호출하면 SVG 자리표시자 응답 (실제 QR은 발표 자료의 QR 위젯에서 변환).
- 캡처 화면 5종: `/`, `/routes?start=서면역&end=남포역...`, `/local?...`, `/admin`, `/about`.

## 6. 트러블슈팅

| 증상 | 조치 |
|---|---|
| `git push` 시 권한 거부 | Personal Access Token으로 인증. SSH key 대안 가능 |
| Vercel 빌드 실패 (한글 폴더) | 로컬에서 `npm run build` 가 통과하는지 먼저 확인. 한글 경로 자체는 Vercel에서 문제 없음 |
| 로그인 후에도 /login 으로 다시 튕김 | 쿠키 차단 환경. 시크릿 모드/다른 브라우저로 시도 |
| `ANTHROPIC_API_KEY` 없이도 동작? | 네, 결정론적 폴백 설명을 사용합니다 (LLM 호출 없음) |
| `BUSAN_API_KEY` 없이도 동작? | 네, 폴백 샘플 데이터를 사용합니다 (실데이터는 키 등록 후) |

## 7. 추가 배포 옵션 (선택)

- **Custom Domain**: Vercel Project Settings → Domains
- **Preview Branch**: `main` 외에 `dev` 브랜치를 만들면 자동 preview 배포
- **Analytics**: Vercel Analytics 활성화 (옵션)

## 8. 자동화 한 줄
PowerShell 또는 bash:
```bash
git add -A && git commit -m "chore: update" && git push
```
push 즉시 Vercel이 자동 재배포합니다.
