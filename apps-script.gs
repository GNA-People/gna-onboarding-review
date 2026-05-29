/**
 * GNA 온보딩 리뷰 — 통합 응답 수집 (셀프 + 리드/동료)
 *
 * 사용법
 * 1) 구글 시트를 새로 만든다 (응답이 쌓일 시트).
 * 2) 확장 프로그램 > Apps Script 에 이 코드를 붙여넣는다.
 * 3) 배포 > 새 배포 > 유형: 웹 앱
 *      - 실행: 나
 *      - 액세스 권한: 모든 사용자
 *    배포 후 나오는 /exec URL 을 복사한다.
 * 4) self-review.html, eval-review.html 두 파일의
 *    SHEET_WEBHOOK_URL 에 "같은" URL 을 붙여넣는다.
 *    → 셀프와 평가자 응답이 이 하나의 시트로 모인다.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('responses') || ss.insertSheet('responses');

    // 헤더가 없으면 1회 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '제출시각', '폼(self/eval)', '작성주체(type)', '시점(phase)', '작성자이메일',
        '총점(평가자)',
        '성과점수', '문제해결점수', '협업점수', '학습점수', '핵심가치점수',
        '대상자/닉네임', '소속', '입사일',
        '수습목표', '목표-무엇을했나',
        '성과-서술', '문제해결-서술', '협업-서술', '학습-서술', '핵심가치-서술',
        '종합의견', '본채용의견',
        '원본JSON'
      ]);
    }

    var sc = data._scores || {};
    sheet.appendRow([
      data._timestamp || new Date().toISOString(),
      data._form || '',
      data._type || '',
      data._phase || '',
      data._email || '',
      (data._total != null ? data._total : ''),
      sc.perf != null ? sc.perf : '',
      sc.prob != null ? sc.prob : '',
      sc.collab != null ? sc.collab : '',
      sc.learn != null ? sc.learn : '',
      sc.value != null ? sc.value : '',
      data.name || data.targetName || '',
      data.team || data.targetTeam || '',
      data.joinDate || '',
      data.goalText || data.goalRef || '',
      data.goalReason || '',
      data.perf_text || '',
      data.prob_text || '',
      data.collab_text || '',
      data.learn_text || '',
      data.value_text || '',
      data.f9q1 || '',
      data.hire || '',
      JSON.stringify(data)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
