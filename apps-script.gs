/**
 * GNA 온보딩 리뷰 — 통합 응답 수집 (셀프 + 리드/동료)
 *
 * ★ 구글 시트를 미리 만들 필요 없습니다. 이 스크립트가 자동으로 만듭니다.
 *
 * 설치 방법
 * 1) https://script.google.com 접속 → "새 프로젝트"
 * 2) 기존 코드를 모두 지우고 이 코드를 전부 붙여넣은 뒤 저장
 * 3) 상단 함수 목록에서 'setup' 선택 → ▶ 실행 → 권한 승인(최초 1회)
 *      → "GNA 온보딩 리뷰 응답" 스프레드시트가 자동 생성됩니다.
 *        (실행 로그 또는 본인 구글 드라이브에서 확인)
 * 4) 배포 > 새 배포 > 유형: 웹 앱
 *      - 실행: 나
 *      - 액세스 권한: 모든 사용자
 *    → 배포 후 나오는 웹 앱 URL(.../exec)을 복사
 * 5) self-review.html, eval-review.html 두 파일의
 *    SHEET_WEBHOOK_URL 에 "같은" /exec URL 을 넣으면
 *    셀프·평가자 응답이 이 하나의 시트로 모입니다.
 */

var SHEET_NAME = 'responses';
var PROP_KEY = 'SPREADSHEET_ID';

var HEADER = [
  '제출시각', '폼(self/eval)', '작성주체(type)', '시점(phase)', '작성자이메일',
  '총점(평가자)',
  '성과점수', '오너십점수', '협업점수', '용기·성장점수', '핵심가치점수',
  '대상자/닉네임', '소속', '입사일',
  '수습목표', '목표-진행상황(중간)', '목표-무엇을했나(마무리)',
  '성과-서술', '오너십-서술', '협업-서술', '용기·성장-서술', '핵심가치-서술',
  '종합의견/회고', '본채용의견',
  '원본JSON'
];

// 스프레드시트를 (없으면) 만들고 응답 시트를 반환
function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(PROP_KEY);
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('GNA 온보딩 리뷰 응답');
    props.setProperty(PROP_KEY, ss.getId());
  }
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADER);
  return sheet;
}

// 최초 1회 실행: 스프레드시트 생성 + URL 로그 출력
function setup() {
  var sheet = getSheet_();
  var url = sheet.getParent().getUrl();
  Logger.log('응답 스프레드시트 URL: ' + url);
  return url;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
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
      data.goalProgress || '',
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
