/**
 * Google Sheet Logging Service
 * Connects the web app to Google Sheet:
 * https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing
 * Columns: timestamp, play_account (or play_count), wrong_account (or wrong_count), tap_average, tap_frequency
 */

export const SPREADSHEET_ID = '1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE';
export const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing';

export const DEFAULT_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwnmtM_UXrn6juEuCxPskBc9ZQg6reV200EVSfyb2mZ04QR6duhnhb6C7d-7h4UkD8J/exec';

const GAS_URL_KEY = 'gyv_gas_url';
const LOCAL_LOGS_KEY = 'gyv_sheet_logs';

export interface SheetLogRecord {
  id: string;
  timestamp: string;
  play_account: number;
  wrong_account: number;
  tap_average?: number;
  tap_frequency?: string;
  total_taps?: number;
  sentence_details?: string;
  synced: boolean;
  statusMessage?: string;
}

export const GAS_CODE_SNIPPET = `/**
 * Google Apps Script for Verb Garden Game
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing
 */
const SPREADSHEET_ID = '1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (err) { payload = e.parameter || {}; }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    const saved = appendLogToSheet(payload);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', record: saved }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const payload = (e && e.parameter) ? e.parameter : {};
    const saved = appendLogToSheet(payload);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', record: saved }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendLogToSheet(data) {
  let ss;
  try {
    ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  } catch(e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['timestamp', 'play_count', 'wrong_count', 'tap_average', 'tap_frequency', 'sentence_details']);
  }
  let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const headerKeys = headers.map(function(h) { return String(h || '').trim().toLowerCase(); });

  const requiredCols = [
    { key: 'tap_average', name: 'tap_average' },
    { key: 'tap_frequency', name: 'tap_frequency' },
    { key: 'sentence_details', name: 'sentence_details' }
  ];
  let added = false;
  requiredCols.forEach(function(col) {
    if (headerKeys.indexOf(col.key) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col.name);
      added = true;
    }
  });
  if (added) {
    headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  }

  const now = new Date();
  const timestampVal = data.timestamp || Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  
  let playVal = 1;
  if (data.play_account !== undefined && data.play_account !== '') playVal = Number(data.play_account);
  else if (data.play_count !== undefined && data.play_count !== '') playVal = Number(data.play_count);

  let wrongVal = 0;
  if (data.wrong_account !== undefined && data.wrong_account !== '') wrongVal = Number(data.wrong_account);
  else if (data.wrong_count !== undefined && data.wrong_count !== '') wrongVal = Number(data.wrong_count);

  const tapAvgVal = data.tap_average !== undefined ? Number(data.tap_average) : 0;
  const tapFreqVal = data.tap_frequency !== undefined ? data.tap_frequency : '';
  const detailsVal = data.sentence_details !== undefined ? data.sentence_details : '';

  const rowValues = headers.map(function(col) {
    const key = String(col || '').trim().toLowerCase();
    if (key === 'timestamp') return timestampVal;
    if (key === 'play_account' || key === 'play_count' || key === 'play count' || key === 'plays') return playVal;
    if (key === 'wrong_account' || key === 'wrong_count' || key === 'wrong count' || key === 'wrongs') return wrongVal;
    if (key === 'tap_average' || key === 'tap average' || key === 'average_taps') return tapAvgVal;
    if (key === 'tap_frequency' || key === 'tap frequency' || key === 'frequencies') return tapFreqVal;
    if (key === 'sentence_details' || key === 'sentence details' || key === 'details') return detailsVal;
    return data[col] !== undefined ? data[col] : '';
  });

  sheet.appendRow(rowValues);
  return {
    timestamp: timestampVal,
    play_account: playVal,
    wrong_account: wrongVal,
    tap_average: tapAvgVal,
    tap_frequency: tapFreqVal,
    sentence_details: detailsVal,
    row: sheet.getLastRow()
  };
}

function testAppendRow() {
  const res = appendLogToSheet({
    timestamp: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    play_account: 1,
    wrong_account: 0,
    tap_average: 2.5,
    tap_frequency: '1번(grow): 2회, 2번(drink): 3회',
    sentence_details: '[Q1] The sprout grew (2회)'
  });
  Logger.log('Success: ' + JSON.stringify(res));
}`;

export const sheetLogger = {
  /**
   * Retrieves the configured Web App URL.
   * Priority:
   * 1. import.meta.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL (from .env.local)
   * 2. import.meta.env.VITE_GOOGLE_SCRIPT_URL
   * 3. localStorage custom override
   * 4. DEFAULT_WEB_APP_URL
   */
  getWebAppUrl(): string {
    const envUrl =
      (import.meta.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL as string | undefined) ||
      (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined);

    if (envUrl && envUrl.trim()) {
      return envUrl.trim();
    }

    try {
      const stored = localStorage.getItem(GAS_URL_KEY);
      if (stored && stored.trim()) {
        return stored.trim();
      }
    } catch {
      // ignore
    }

    return DEFAULT_WEB_APP_URL;
  },

  getEnvUrl(): string {
    return (
      (import.meta.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL as string | undefined) ||
      (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined) ||
      ''
    ).trim();
  },

  setWebAppUrl(url: string) {
    try {
      localStorage.setItem(GAS_URL_KEY, url.trim());
    } catch {
      // ignore
    }
  },

  getLocalLogs(): SheetLogRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  formatCurrentTime(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  },

  async logGamePlay(params: {
    playCount: number;
    wrongCount: number;
    tapAverage?: number;
    tapFrequency?: string;
    totalTaps?: number;
    sentenceDetails?: string;
  }): Promise<SheetLogRecord> {
    const timestamp = this.formatCurrentTime();
    const url = this.getWebAppUrl();

    const record: SheetLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      play_account: params.playCount,
      wrong_account: params.wrongCount,
      tap_average: params.tapAverage ?? 0,
      tap_frequency: params.tapFrequency || '',
      total_taps: params.totalTaps ?? 0,
      sentence_details: params.sentenceDetails || '',
      synced: false,
    };

    const payload = {
      timestamp,
      play_account: params.playCount,
      play_count: params.playCount,
      wrong_account: params.wrongCount,
      wrong_count: params.wrongCount,
      tap_average: params.tapAverage ?? 0,
      tap_frequency: params.tapFrequency || '',
      total_taps: params.totalTaps ?? 0,
      sentence_details: params.sentenceDetails || '',
    };

    if (url) {
      try {
        // Send request with no-cors to prevent cross-origin preflight issues with Google Apps Script
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });
        record.synced = true;
        record.statusMessage = '구글 시트 전송 완료';
      } catch (err: unknown) {
        record.synced = false;
        record.statusMessage = err instanceof Error ? err.message : '전송 실패';
      }
    } else {
      record.synced = false;
      record.statusMessage = '웹앱 URL 미설정 (로컬 저장됨)';
    }

    // Save to local storage history
    try {
      const logs = this.getLocalLogs();
      logs.unshift(record);
      // Keep recent 50 logs
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
    } catch {
      // ignore
    }

    return record;
  },

  async testSend(testUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = (testUrl || this.getWebAppUrl()).trim();
    if (!url) {
      return { success: false, message: '배포된 웹 앱(Web App) URL을 먼저 입력해주세요.' };
    }

    const testPayload = {
      timestamp: this.formatCurrentTime(),
      play_account: 1,
      play_count: 1,
      wrong_account: 0,
      wrong_count: 0,
      tap_average: 2.4,
      tap_frequency: '테스트(1번: 2회, 2번: 3회)',
      total_taps: 5,
      sentence_details: '연동 테스트 데이터',
    };

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(testPayload),
      });
      return {
        success: true,
        message: '테스트 데이터(탭 빈도/평균 포함)가 구글 시트로 성공적으로 전송되었습니다!',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : '전송 중 오류가 발생했습니다.',
      };
    }
  },
};
