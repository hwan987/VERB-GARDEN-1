/**
 * =========================================================================
 * Growing Your Verbs - Google Apps Script (구글 시트 연동 로깅 스크립트)
 * =========================================================================
 * 
 * 스프레드시트 링크:
 * https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing
 * 
 * 기록 열(Columns):
 * - timestamp     : 게임 완료 일시 (예: 2026-10-30 11:27:00)
 * - play_account  : 사용자의 누적 플레이 횟수 (예: 1, 2, 3...)
 * - wrong_account : 이번 게임에서 틀린 횟수/단어 개수 (예: 0, 2...)
 * 
 * [배포 방법]
 * 1. 위 구글 시트 링크로 이동합니다.
 * 2. 상단 메뉴에서 [확장 프로그램] > [Apps Script] 클릭
 * 3. 기존 코드를 모두 지우고 이 스크립트 전체를 붙여넣기 후 [저장(Ctrl+S)]
 * 4. 상단 [배포] 버튼 클릭 > [새 배포] 선택
 * 5. 유형 선택(톱니바퀴) > [웹 앱] 선택
 *    - 설명: Verb Game Logger
 *    - 다음 사용자로 실행: 나(내 계정)
 *    - 액세스 권한이 있는 사용자: 모든 사용자(Anyone)  <-- 중요!
 * 6. [배포] 클릭 후 생성된 '웹 앱 URL'을 복사하여 웹앱 설정에 등록합니다.
 */

// 연결할 구글 스프레드시트 ID (링크에서 추출)
var SPREADSHEET_ID = '1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE';

/**
 * 활성 시트 또는 지정 ID의 첫 번째 시트를 가져옵니다.
 */
function getTargetSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }
  } catch (err) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  
  var sheet = ss.getSheets()[0];
  
  // 첫 번째 행에 헤더가 없는 경우 자동으로 생성
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['timestamp', 'play_account', 'wrong_account']);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#e6f4ea');
  } else {
    // 혹시 1행이 비어있는지 확인
    var firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell) {
      sheet.getRange(1, 1, 1, 3).setValues([['timestamp', 'play_account', 'wrong_account']]);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#e6f4ea');
    }
  }
  
  return sheet;
}

/**
 * 웹앱 POST 요청 처리 (게임 완료 시 게임 로그 전송 수신)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // 동시 요청 충돌 방지를 위해 최대 10초 대기
  lock.tryLock(10000);
  
  try {
    var sheet = getTargetSheet();
    var data = {};
    
    // 1. JSON Body 파싱 시도
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    // 2. 값 지정 및 정제
    // (1) timestamp 지정 (요청값이 없으면 현재 시각 서울 표준시로 자동 지정)
    var timestamp = data.timestamp;
    if (!timestamp) {
      timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    }
    
    // (2) play_account 지정 (누적 플레이 횟수)
    var playAccount = data.play_account !== undefined ? data.play_account : (data.playCount !== undefined ? data.playCount : 1);
    
    // (3) wrong_account 지정 (오답 개수 / 틀린 단어 수)
    var wrongAccount = data.wrong_account !== undefined ? data.wrong_account : (data.wrongCount !== undefined ? data.wrongCount : 0);
    
    // 3. 헤더 위치에 맞추어 열 위치 자동 맵핑 (헤더 순서가 바뀌어도 안전)
    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 3)).getValues()[0];
    var colTimestamp = headers.indexOf('timestamp');
    var colPlay = headers.indexOf('play_account');
    var colWrong = headers.indexOf('wrong_account');
    
    var rowValues = [];
    if (colTimestamp >= 0 && colPlay >= 0 && colWrong >= 0) {
      var maxCols = Math.max(colTimestamp, colPlay, colWrong) + 1;
      for (var i = 0; i < maxCols; i++) {
        if (i === colTimestamp) rowValues.push(timestamp);
        else if (i === colPlay) rowValues.push(playAccount);
        else if (i === colWrong) rowValues.push(wrongAccount);
        else rowValues.push('');
      }
      sheet.appendRow(rowValues);
    } else {
      // 기본 순서: timestamp, play_account, wrong_account
      sheet.appendRow([timestamp, playAccount, wrongAccount]);
    }
    
    var result = {
      status: 'success',
      message: 'Log successfully recorded',
      timestamp: timestamp,
      play_account: playAccount,
      wrong_account: wrongAccount,
      rowNumber: sheet.getLastRow()
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

/**
 * 웹앱 GET 요청 처리 (브라우저 또는 연결 테스트용)
 */
function doGet(e) {
  var sheet = getTargetSheet();
  var lastRow = sheet.getLastRow();
  
  // 파라미터로 log 기록 요청도 허용 (GET 테스트용: ?play_account=1&wrong_account=2)
  if (e && e.parameter && (e.parameter.play_account !== undefined || e.parameter.playCount !== undefined)) {
    return doPost(e);
  }
  
  var info = {
    status: 'online',
    app: 'Growing Your Verbs Logger',
    spreadsheetId: SPREADSHEET_ID,
    totalLogsRecorded: Math.max(0, lastRow - 1),
    supportedColumns: ['timestamp', 'play_account', 'wrong_account'],
    serverTime: Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss")
  };
  
  return ContentService.createTextOutput(JSON.stringify(info, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * [Apps Script 편집기에서 바로 테스트할 수 있는 함수]
 * Apps Script 상단 함수 선택에서 'testLog'를 선택하고 [실행]을 누르면
 * 구글 시트에 즉시 테스트 행이 1줄 추가됩니다.
 */
function testLog() {
  var sheet = getTargetSheet();
  var now = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
  var samplePlayCount = Math.max(1, sheet.getLastRow()); // 현재 행 수를 플레이 횟수 예시로 활용
  var sampleWrongCount = Math.floor(Math.random() * 3);  // 0~2회 오답 예시
  
  sheet.appendRow([now, samplePlayCount, sampleWrongCount]);
  Logger.log("성공! 구글 시트에 테스트 행이 추가되었습니다: " + now + " | play: " + samplePlayCount + " | wrong: " + sampleWrongCount);
}
