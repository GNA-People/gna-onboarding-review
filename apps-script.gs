/**
 * GNA 온보딩 리뷰 — 응답 수집 + 온보딩 대상자 + 대시보드
 *
 * 탭 구성 (자동 생성)
 *  - 셀프리뷰        : 셀프 응답 누적
 *  - 리드·동료평가    : 리드/동료 응답 누적
 *  - 온보딩대상자     : 마스터시트 기준 최근 3개월 입사자 + 개별 코드
 *  - 대시보드        : 대상자별 응답 현황·점수 요약
 *
 * 설치
 *  1) script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기 → 저장
 *  2) MASTER_SHEET_ID 가 올바른지 확인 (현재 인명부 시트 ID 입력됨)
 *  3) 함수 'setup' 실행 → 권한 승인 → 응답 스프레드시트 자동 생성
 *  4) 함수 'refreshOnboarding' 실행 → 대상자/대시보드 채워짐
 *  5) (선택) 트리거: refreshOnboarding 을 매일 자동 실행하도록 설정
 *  6) 배포 > 웹 앱(실행:나 / 액세스:모든 사용자) → /exec URL 을 두 HTML에 입력
 */

var PROP_KEY = 'SPREADSHEET_ID';
var SELF_SHEET = '셀프리뷰';
var EVAL_SHEET = '리드·동료평가';
var ROSTER_SHEET = '온보딩대상자';
var DASH_SHEET = '대시보드';
var CODE_SHEET = '평가자코드';

// 마스터 인명부 스프레드시트 ID & 탭 이름
var MASTER_SHEET_ID = '1Y8P_SmeaHk6NBcWfTQ_tljKQzyQSJb63v-LtE5fDsh8';
var MASTER_TAB = '(신)인명부';
var ONBOARDING_MONTHS = 3; // 입사 후 N개월 이내 = 수습 대상

// 이메일 → 개별 인증 코드 (HTML AUTH 와 동일)
var AUTH = {
"wb@gna.company":"BP7IQS","kai.kim@gna.company":"5TS5PI","jay.heo@gna.company":"RYW7EW",
"eddakim@gna.company":"L2MLVR","lina.diaz@gna.company":"71ROWE","min@gna.company":"58UDDF",
"lou@gna.company":"6CFKQ3","julie@gna.company":"CME6HT","eve@gna.company":"OQO8SJ",
"chloe@gna.company":"EKY4J8","kane@gna.company":"9MJ58X","tommy.kim@gna.company":"U6ZO6O",
"ellie@gna.company":"6YNDUD","ina@gna.company":"UK8H12","veronica.park@gna.company":"WS5MI9",
"jimmy@gna.company":"DNSOOC","eddie.kim@gna.company":"D66N7K","senna.jeong@gna.company":"99QGUY",
"hyman.park@gna.company":"C3EZJA","yosef@gna.company":"W59JYS","angie.han@gna.company":"0UCUWG",
"flicia@gna.company":"XMME70","selene.park@gna.company":"UNIOOM","mary.choi@gna.company":"3T6ZHH",
"seny@gna.company":"ZV74WU","angelique.li@gna.company":"ZM0OCC","kesper.ng@gna.company":"K0TO0A",
"sonya.hong@gna.company":"AOZC9L","liang.wang@gna.company":"151VW7","mac.han@gna.company":"I36DBB",
"ted.yang@gna.company":"P6PPCW","hailey.jeong@gna.company":"8YSSAS","randi.ko@gna.company":"IAWO7D",
"becky.bae@gna.company":"HP1XF1","luka.kim@gna.company":"SYTL8G","rocket.oh@gna.company":"FPT74O",
"ruqe.seo@gna.company":"HXV892","erica.kim@gna.company":"6MY825","liora@gna.company":"JOQ59Q",
"luvon.lee@gna.company":"D3NXIS","victor.kim@gna.company":"MTL20U","eren.jang@gna.company":"5QSO6A",
"josh.sho@gna.company":"0V9V6D","marisol.kim@gna.company":"YUF3DU","simon.lee@gna.company":"4Q73MS",
"boyle.seo@gna.company":"B8G6KX","hayden@gna.company":"24EJT0","joy@gna.company":"0SYB9L",
"may@gna.company":"ILORL8","sophia@gna.company":"6K700M","nate.yoo@gna.company":"19QDXP",
"moon@gna.company":"EDGGRE","teo.park@gna.company":"C9B55I","noah.lee@gna.company":"98CPZM",
"yuna.pan@gna.company":"T1M6HJ","lexi.sa@gna.company":"2B3GYD","vana.i@gna.company":"WN1HYA",
"rosea.li@gna.company":"0V14FZ","rhea.syn@gna.company":"6RE5J4","faye.kang@gna.company":"X1738Z",
"mima.kang@gna.company":"PU4B3O","lucy.kim@gna.company":"J9P0A4","claire.tran@gna.company":"7T8W6Q",
"maverick.seo@gna.company":"YMZ7K5","lumi.ko@gna.company":"QE03AZ","sammy.lee@gna.company":"R29W8G"
};

var SELF_HEADER = [
  '제출시각','시점(phase)','작성자이메일','총점',
  '성과','오너십','협업','용기·성장','핵심가치',
  '닉네임','소속','입사일',
  '수습목표','목표-진행(중간)','목표-실행(마무리)',
  '성과-서술','오너십-서술','협업-서술','용기·성장-서술','핵심가치-서술',
  '종합/회고','원본JSON'
];
var EVAL_HEADER = [
  '제출시각','작성주체','시점(phase)','작성자이메일','총점',
  '성과','오너십','협업','용기·성장','핵심가치',
  '대상자닉네임','대상자소속',
  '수습목표','목표-진행(중간)','목표-실행(마무리)',
  '성과-서술','오너십-서술','협업-서술','용기·성장-서술','핵심가치-서술',
  '종합의견','본채용의견','원본JSON'
];
var ROSTER_HEADER = ['닉네임','이름','팀','회사이메일','입사일','수습종료일','셀프링크','평가자링크'];
var DASH_HEADER = ['닉네임','팀','입사일','셀프(중간)','셀프(마무리)','리드/동료 수','평가 평균총점','본채용 의견'];
var CODE_HEADER = ['이메일','개별코드'];

function getSS_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(PROP_KEY), ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch(e){ ss=null; } }
  if (!ss) { ss = SpreadsheetApp.create('GNA 온보딩 리뷰 응답'); props.setProperty(PROP_KEY, ss.getId()); }
  ensure_(ss, SELF_SHEET, SELF_HEADER);
  ensure_(ss, EVAL_SHEET, EVAL_HEADER);
  ensure_(ss, ROSTER_SHEET, ROSTER_HEADER);
  ensure_(ss, DASH_SHEET, DASH_HEADER);
  ensure_(ss, CODE_SHEET, CODE_HEADER);
  return ss;
}
function ensure_(ss, name, header) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(header);
  return sh;
}

function setup() {
  var ss = getSS_();
  ['Sheet1','시트1','responses'].forEach(function(n){
    var sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow()===0 && ss.getSheets().length>1) { try{ ss.deleteSheet(sh); }catch(e){} }
  });
  Logger.log('응답 스프레드시트 URL: ' + ss.getUrl());
  return ss.getUrl();
}

// 마스터시트에서 최근 N개월 입사자 → 온보딩대상자 탭 채우기 + 대시보드 갱신
function refreshOnboarding() {
  var ss = getSS_();
  var master = SpreadsheetApp.openById(MASTER_SHEET_ID).getSheetByName(MASTER_TAB);
  var data = master.getDataRange().getValues();
  // 헤더 행 찾기 (‘이름’ ‘닉네임’ ‘입사일’ 포함 행)
  var hdrRow = -1, col = {};
  for (var i=0;i<Math.min(5,data.length);i++){
    var row = data[i].map(function(c){return String(c).replace(/\s/g,'');});
    if (row.indexOf('닉네임')>=0 && row.indexOf('입사일')>=0){ hdrRow=i;
      row.forEach(function(name,idx){ col[name]=idx; }); break; }
  }
  if (hdrRow<0) throw new Error('마스터시트 헤더(닉네임/입사일)를 찾지 못했습니다.');

  var cNick=col['닉네임'], cName=col['이름'], cTeam=col['팀'],
      cEmail=col['회사이메일']!=null?col['회사이메일']:col['회사이메일'],
      cJoin=col['입사일'], cEnd=col['수습종료일'], cStatus=col['재직상태'];
  // 회사 이메일 열 이름이 줄바꿈 포함일 수 있어 보정
  if (cEmail==null){ Object.keys(col).forEach(function(k){ if(k.indexOf('회사')>=0&&k.indexOf('이메일')>=0) cEmail=col[k]; }); }

  var now = new Date();
  var cutoff = new Date(now.getFullYear(), now.getMonth()-ONBOARDING_MONTHS, now.getDate());

  var baseUrl = ''; // 배포 후 GitHub Pages 주소를 넣으면 링크 자동 생성 (선택)
  baseUrl = 'https://gna-people.github.io/gna-onboarding-review/';

  var rows = [];
  for (var r=hdrRow+1; r<data.length; r++){
    var d = data[r];
    var nick = d[cNick], join = d[cJoin], status = cStatus!=null?d[cStatus]:'재직';
    if (!nick || !join) continue;
    var jd = (join instanceof Date) ? join : new Date(join);
    if (isNaN(jd.getTime())) continue;
    if (jd < cutoff) continue;                 // 최근 3개월 이내만
    if (status && String(status).indexOf('퇴사')>=0) continue;
    var email = cEmail!=null ? String(d[cEmail]||'').trim().toLowerCase() : '';
    rows.push([
      nick,
      cName!=null?d[cName]:'',
      cTeam!=null?d[cTeam]:'',
      email,
      fmt_(jd),
      cEnd!=null?fmt_(d[cEnd]):'',
      baseUrl+'self-review.html',
      baseUrl+'eval-review.html'
    ]);
  }

  // 온보딩대상자 탭 다시 쓰기
  var rs = ss.getSheetByName(ROSTER_SHEET);
  rs.clearContents(); rs.appendRow(ROSTER_HEADER);
  if (rows.length) rs.getRange(2,1,rows.length,ROSTER_HEADER.length).setValues(rows);

  buildDashboard_(ss, rows);
  fillCodes_(ss);
  Logger.log('온보딩 대상자 ' + rows.length + '명 갱신 완료');
  return rows.length;
}

// 평가자 코드만 단독으로 채우기 (마스터시트 못 읽어도 동작)
function fillCodesOnly() {
  var ss = getSS_();
  fillCodes_(ss);
  Logger.log('평가자코드 ' + Object.keys(AUTH).length + '건 기록 완료');
}

function fillCodes_(ss) {
  var sh = ss.getSheetByName(CODE_SHEET);
  sh.clearContents(); sh.appendRow(CODE_HEADER);
  var rows = Object.keys(AUTH).sort().map(function(email){ return [email, AUTH[email]]; });
  if (rows.length) sh.getRange(2,1,rows.length,2).setValues(rows);
}

function buildDashboard_(ss, rosterRows) {
  var selfData = getRows_(ss, SELF_SHEET);
  var evalData = getRows_(ss, EVAL_SHEET);
  var dash = ss.getSheetByName(DASH_SHEET);
  dash.clearContents(); dash.appendRow(DASH_HEADER);

  var out = [];
  rosterRows.forEach(function(r){
    var nick=r[0], team=r[2], join=r[4];
    // 셀프: 닉네임 매칭 (셀프 응답의 '닉네임' = idx9)
    var selfMid='', selfFinal='';
    selfData.forEach(function(s){
      if (String(s[9]).trim()===String(nick).trim()){
        if (s[1]==='mid') selfMid = s[3];      // 총점(내부)
        if (s[1]==='final') selfFinal = s[3];
      }
    });
    // 평가자: 대상자닉네임 매칭 (idx10), 총점 idx4, 본채용 idx21
    var cnt=0, sum=0, hires=[];
    evalData.forEach(function(e){
      if (String(e[10]).trim()===String(nick).trim()){
        cnt++; var t=parseFloat(e[4]); if(!isNaN(t)) sum+=t;
        if (e[21]) hires.push(e[21]);
      }
    });
    var avg = cnt? Math.round(sum/cnt) : '';
    out.push([nick, team, join, selfMid, selfFinal, cnt, avg, hires.join(', ')]);
  });
  if (out.length) dash.getRange(2,1,out.length,DASH_HEADER.length).setValues(out);
}

function getRows_(ss, name){
  var sh = ss.getSheetByName(name); if(!sh) return [];
  var v = sh.getDataRange().getValues(); return v.slice(1);
}
function fmt_(d){
  if (!d) return '';
  var x = (d instanceof Date)? d : new Date(d);
  if (isNaN(x.getTime())) return String(d);
  return Utilities.formatDate(x, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// ===== 응답 수신 =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getSS_();
    var sc = data._scores || {};
    var isSelf = (data._form === 'self');
    var sheet = ss.getSheetByName(isSelf ? SELF_SHEET : EVAL_SHEET);
    if (isSelf) {
      sheet.appendRow([
        data._timestamp||new Date().toISOString(), data._phase||'', data._email||'',
        data._total!=null?data._total:'',
        sc.perf||'', sc.prob||'', sc.collab||'', sc.learn||'', sc.value||'',
        data.name||'', data.team||'', data.joinDate||'',
        data.goalText||data.goalRef||'', data.goalProgress||'', data.goalReason||'',
        data.perf_text||'', data.prob_text||'', data.collab_text||'', data.learn_text||'', data.value_text||'',
        data.f9q1||'', JSON.stringify(data)
      ]);
    } else {
      sheet.appendRow([
        data._timestamp||new Date().toISOString(), data._type||'', data._phase||'', data._email||'',
        data._total!=null?data._total:'',
        sc.perf||'', sc.prob||'', sc.collab||'', sc.learn||'', sc.value||'',
        data.targetName||'', data.targetTeam||'',
        data.goalText||data.goalRef||'', data.goalProgress||'', data.goalReason||'',
        data.perf_text||'', data.prob_text||'', data.collab_text||'', data.learn_text||'', data.value_text||'',
        data.f9q1||'', data.hire||'', JSON.stringify(data)
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
