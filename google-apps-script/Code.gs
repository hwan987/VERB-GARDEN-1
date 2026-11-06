/**
 * ==============================================================================
 * Google Apps Script for Verb Garden Game (초등 영어 동사 학습 게임)
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing
 *
 * Target Columns:
 * - timestamp        : 게임 완료 일시 (한국 시간 KST: YYYY-MM-DD HH:mm:ss)
 * - play_account     : 사용자 누적 플레이 횟수 (play_count 호환)
 * - wrong_account    : 해당 게임에서 틀린 문제 개수 (wrong_count 호환)
 * - tap_average      : 각 문장별 평균 탭 수 (Average taps per sentence)
 * - tap_frequency    : 각 문장별 탭 빈도 요약 (Tap frequency per sentence)
 * - sentence_details : 문장별 상세 탭 내역
 * ==============================================================================
 */

// 연결할 구글 스프레드시트 ID
const SPREADSHEET_ID = '1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE';

// 대상 시트 이름 (비워두면 첫 번째 시트 사용)
const SHEET_NAME = 'Sheet1';

/**
 * 웹 앱 POST 요청 수신 처리 (React 앱에서 게임 종료 시 자동 전송)
 */
function doPost(e) {
  try {
    let payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseError) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const savedRecord = appendLogToSheet(payload);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Log successfully saved to Google Sheet',
        record: savedRecord,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 웹 앱 GET 요청 수신 처리 (브라우저 주소창 테스트 및 GET 핑 지원)
 */
function doGet(e) {
  try {
    const payload = (e && e.parameter) ? e.parameter : {};
    const savedRecord = appendLogToSheet(payload);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Log successfully saved via GET',
        record: savedRecord,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 스프레드시트에 행을 추가하는 핵심 함수
 * timestamp, play_account(play_count), wrong_account(wrong_count), tap_average, tap_frequency 컬럼 자동 매핑
 */
function appendLogToSheet(data) {
  let ss;
  try {
    ss = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error('스프레드시트를 열 수 없습니다. SPREADSHEET_ID 또는 권한을 확인하세요.');
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  // 시트가 완전히 비어있을 경우 기본 헤더 행 생성
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp',
      'play_count',
      'wrong_count',
      'tap_average',
      'tap_frequency',
      'sentence_details'
    ]);
  }

  // 현재 시트의 1행 헤더 목록 읽기
  let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const headerKeys = headers.map(function (h) {
    return String(h || '').trim().toLowerCase();
  });

  // 필요한 추가 헤더가 없는 경우 기존 시트의 오른쪽에 자동 추가 (기존 데이터 보존)
  const requiredColumns = [
    { key: 'tap_average', name: 'tap_average' },
    { key: 'tap_frequency', name: 'tap_frequency' },
    { key: 'sentence_details', name: 'sentence_details' }
  ];

  let addedNewHeaders = false;
  requiredColumns.forEach(function (col) {
    if (headerKeys.indexOf(col.key) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col.name);
      addedNewHeaders = true;
    }
  });

  if (addedNewHeaders) {
    headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  }

  // 1. timestamp 값 생성 (한국 시간 기준)
  const now = new Date();
  const defaultTimestamp = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  const timestampVal = data.timestamp || defaultTimestamp;

  // 2. play_account / play_count 값 추출
  let playCountVal = 1;
  if (data.play_account !== undefined && data.play_account !== '') {
    playCountVal = Number(data.play_account);
  } else if (data.play_count !== undefined && data.play_count !== '') {
    playCountVal = Number(data.play_count);
  }

  // 3. wrong_account / wrong_count 값 추출
  let wrongCountVal = 0;
  if (data.wrong_account !== undefined && data.wrong_account !== '') {
    wrongCountVal = Number(data.wrong_account);
  } else if (data.wrong_count !== undefined && data.wrong_count !== '') {
    wrongCountVal = Number(data.wrong_count);
  }

  // 4. tap_average (문장별 평균 탭 수) 값 추출
  let tapAverageVal = 0;
  if (data.tap_average !== undefined && data.tap_average !== '') {
    tapAverageVal = Number(data.tap_average);
  }

  // 5. tap_frequency (문장별 탭 빈도 요약) 값 추출
  const tapFrequencyVal = data.tap_frequency || '';

  // 6. sentence_details (문장별 상세 탭) 값 추출
  const sentenceDetailsVal = data.sentence_details || '';

  // 헤더 이름에 따라 올바른 열에 값 매핑
  const rowValues = headers.map(function (colHeader) {
    const key = String(colHeader || '').trim().toLowerCase();
    if (key === 'timestamp') {
      return timestampVal;
    }
    if (key === 'play_account' || key === 'play_count' || key === 'play count' || key === 'plays') {
      return playCountVal;
    }
    if (key === 'wrong_account' || key === 'wrong_count' || key === 'wrong count' || key === 'wrongs') {
      return wrongCountVal;
    }
    if (key === 'tap_average' || key === 'tap average' || key === 'average_taps') {
      return tapAverageVal;
    }
    if (key === 'tap_frequency' || key === 'tap frequency' || key === 'frequencies') {
      return tapFrequencyVal;
    }
    if (key === 'sentence_details' || key === 'sentence details' || key === 'details') {
      return sentenceDetailsVal;
    }
    if (data[colHeader] !== undefined) {
      return data[colHeader];
    }
    return '';
  });

  sheet.appendRow(rowValues);

  return {
    timestamp: timestampVal,
    play_account: playCountVal,
    wrong_account: wrongCountVal,
    tap_average: tapAverageVal,
    tap_frequency: tapFrequencyVal,
    sentence_details: sentenceDetailsVal,
    savedRow: sheet.getLastRow(),
  };
}

/**
 * Apps Script 편집기에서 '실행' 버튼을 눌러 테스트할 수 있는 함수
 */
function testAppendRow() {
  const result = appendLogToSheet({
    timestamp: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    play_account: 1,
    wrong_account: 0,
    tap_average: 2.5,
    tap_frequency: '1번(grow): 2회, 2번(drink): 3회',
    sentence_details: '[Q1] The sprout grew (2회) | [Q2] The balsam drank (3회)',
  });
  Logger.log('테스트 기록 완료: ' + JSON.stringify(result));
}
