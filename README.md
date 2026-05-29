# GNA 온보딩 리뷰

수습 기간 온보딩 리뷰 폼입니다. 셀프와 리드/동료 평가가 **링크(파일)는 분리**되어 있지만, 응답은 **하나의 구글 시트로 통합** 수집됩니다.

## 링크 (GitHub Pages)

- 셀프 리뷰: `https://gna-people.github.io/gna-onboarding-review/self-review.html`
- 리드/동료 평가: `https://gna-people.github.io/gna-onboarding-review/eval-review.html`
- 진입 페이지: `https://gna-people.github.io/gna-onboarding-review/`

> 셀프 작성자에게는 self 링크만, 평가자에게는 eval 링크만 공유하면 서로의 구성을 보지 않습니다.

## 구성

- **중간 / 마무리** 두 시점 선택 (각 파일 안에서)
- **셀프**: 이메일만 입력, 점수는 보이지 않음 (단계 설명으로 선택)
- **리드/동료**: 인증 코드 필요, 5개 축 × 20점 = 100점 + 본채용 의견
- **중간 → 마무리** 점수 변화 자동 표시 (같은 브라우저 기준)

## 응답을 하나의 시트로 모으기

1. 구글 시트 새로 생성 → 확장 프로그램 > Apps Script
2. `apps-script.gs` 내용을 붙여넣고 저장
3. 배포 > 새 배포 > 웹 앱 (실행: 나 / 액세스: 모든 사용자) → `/exec` URL 복사
4. `self-review.html`, `eval-review.html` 두 파일의 `SHEET_WEBHOOK_URL` 에 **같은 URL** 입력
5. 두 폼의 응답이 시트의 `responses` 탭에 `폼(self/eval)`·`작성주체`·`시점` 열로 구분되어 누적됩니다.

## 인증 코드 (eval-review)

`eval-review.html` 상단의 `AUTH` 객체에 이메일:코드를 넣습니다. (연봉재계약 리뷰와 동일 테이블 사용 가능)
