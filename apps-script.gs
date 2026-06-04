/**
 * GNA 온보딩 리뷰 — 응답 수집 (셀프 / 리드·동료 탭 분리)
 *
 * ★ 구글 시트를 미리 만들 필요 없습니다. 이 스크립트가 자동으로 만듭니다.
 *
 * 설치 방법
 * 1) https://script.google.com 접속 → "새 프로젝트"
 * 2) 기존 코드를 모두 지우고 이 코드를 전부 붙여넣은 뒤 저장
 * 3) 상단 함수 목록에서 'setup' 선택 → ▶ 실행 → 권한 승인(최초 1회)
 *      → "GNA 온보딩 리뷰 응답" 스프레드시트가 자동 생성됩니다.
 *        (셀프리뷰 / 리드·동료평가 두 탭이 함께 생성됩니다)
 * 4) 배포 > 새 배포 > 유형: 웹 앱
 *      - 실행: 나
 *      - 액세스 권한: 모든 사용자
 *    → 배포 후 나오는 웹 앱 URL(.../exec)을 복사
 * 5) self-review.html, eval-review.html 두 파일의
 *    SHEET_WEBHOOK_URL 에 "같은" /exec URL 을 넣으면
 *    셀프 응답은 '셀프리뷰' 탭, 리드·동료 응답은 '리드·동료평가' 탭에 기록됩니다.
 */

var PROP_KEY = 'SPREADSHEET_ID';
var SELF_SHEET = '셀프리뷰';
var EVAL_SHEET = '리드·동료평가';

// 셀프 탭 헤더 (점수 비공개라 점수 열은 참고용으로 포함)
var SELF_HEADER = [
  '제출시각', '시점(phase)', '작성자이메일',
  '총점', '성과점수', '오너십점수', '협업점수', '용기·성장점수', '핵심가치점수',
  '닉네임', '소속', '입사일',
  '수습목표', '목표-진행상황(중간)', '목표-무엇을했나(마무리)',
  '성과-서술', '오너십-서술', '협업-서술', '용기·성장-서술', '핵심가치-서술',
  '종합/회고', '원본JSON'
];

// 리드·동료 탭 헤더
var EVAL_HEADER = [
  '제출시각', '작성주체(type)', '시점(phase)', '작성자이메일',
  '총점', '성과점수', '오너십점수', '협업점수', '용기·성장점수', '핵심가치점수',
  '대상자닉네임', '대상자소속',
  '수습목표', '목표-진행상황(중간)', '목표-무엇을했나(마무리)',
  '성과-서술', '오너십-서술', '협업-서술', '용기·성장-서술', '핵심가치-서술',
  '종합의견', '본채용의견', '원본JSON'
];

// 스프레드시트를 (없으면) 만들고, 탭을 보장한 뒤 반환
function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(PROP_KEY);
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('GNA 온보딩 리뷰 응답');
    props.setProperty(PROP_KEY, ss.getId());
  }
  ensureSheet_(ss, SELF_SHEET, SELF_HEADER);
  ensureSheet_(ss, EVAL_SHEET, EVAL_HEADER);
  return ss;
}

function ensureSheet_(ss, name, header) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
  return sheet;
}

// 최초 1회 실행: 스프레드시트 + 두 탭 생성, URL 로그 출력
function setup() {
  var ss = getSpreadsheet_();
  // 기본 'Sheet1' 'responses' 등 불필요한 탭이 있으면 정리 (비어 있을 때만)
  var trash = ['Sheet1', '시트1', 'responses'];
  ss.getSheets().forEach(function (sh) {
    if (trash.indexOf(sh.getName()) >= 0 && sh.getLastRow() === 0 && ss.getSheets().length > 1) {
      try { ss.deleteSheet(sh); } catch (e) {}
    }
  });
  Logger.log('응답 스프레드시트 URL: ' + ss.getUrl());
  return ss.getUrl();
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet_();
    var sc = data._scores || {};
    var isSelf = (data._form === 'self');
    var sheet = ss.getSheetByName(isSelf ? SELF_SHEET : EVAL_SHEET);

    if (isSelf) {
      sheet.appendRow([
        data._timestamp || new Date().toISOString(),
        data._phase || '',
        data._email || '',
        (data._total != null ? data._total : ''),
        sc.perf != null ? sc.perf : '',
        sc.prob != null ? sc.prob : '',
        sc.collab != null ? sc.collab : '',
        sc.learn != null ? sc.learn : '',
        sc.value != null ? sc.value : '',
        data.name || '',
        data.team || '',
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
        JSON.stringify(data)
      ]);
    } else {
      sheet.appendRow([
        data._timestamp || new Date().toISOString(),
        data._type || '',
        data._phase || '',
        data._email || '',
        (data._total != null ? data._total : ''),
        sc.perf != null ? sc.perf : '',
        sc.prob != null ? sc.prob : '',
        sc.collab != null ? sc.collab : '',
        sc.learn != null ? sc.learn : '',
        sc.value != null ? sc.value : '',
        data.targetName || '',
        data.targetTeam || '',
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
    }
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
