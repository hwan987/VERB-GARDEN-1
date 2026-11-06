import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Send,
  HelpCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Database,
} from 'lucide-react';
import {
  sheetLogger,
  SPREADSHEET_URL,
  SPREADSHEET_ID,
  GAS_CODE_SNIPPET,
} from '../services/sheetLogger';
import { sound } from '../services/sound';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose }) => {
  const [webAppUrl, setWebAppUrl] = useState(sheetLogger.getWebAppUrl());
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [showCode, setShowCode] = useState(false);
  const [logs, setLogs] = useState(sheetLogger.getLocalLogs());

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    sheetLogger.setWebAppUrl(webAppUrl);
    sound.play('click');
    setTestStatus({
      loading: false,
      success: true,
      message: '웹 앱 URL이 저장되었습니다!',
    });
    setTimeout(() => {
      setTestStatus({ loading: false });
    }, 3000);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GAS_CODE_SNIPPET);
      setCopied(true);
      sound.play('click');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTestSend = async () => {
    setTestStatus({ loading: true });
    sound.play('click');
    const res = await sheetLogger.testSend(webAppUrl);
    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
    setLogs(sheetLogger.getLocalLogs());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">구글 시트 연동 및 로그 기록</h3>
                <p className="text-[11px] text-emerald-700 font-medium">
                  플레이 횟수(play_account) & 오답 수(wrong_account) 자동 저장
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.play('click');
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-600">
            {/* Target Google Sheet Information */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  연결된 구글 시트
                </span>
                <a
                  href={SPREADSHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/70 px-2.5 py-1 rounded-lg transition-all"
                >
                  <span>구글 시트 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>
                  <span className="font-semibold text-slate-600">저장 열: </span>
                  <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                    timestamp
                  </code>
                  ,{' '}
                  <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                    play_account
                  </code>
                  ,{' '}
                  <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                    wrong_account
                  </code>
                  ,{' '}
                  <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                    tap_average
                  </code>
                  ,{' '}
                  <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                    tap_frequency
                  </code>
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  ID: {SPREADSHEET_ID}
                </div>
              </div>
            </div>

            {/* Web App URL Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">
                  배포된 웹 앱 URL (Web App URL)
                </label>
                {sheetLogger.getEnvUrl() && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    .env.local [NEXT_PUBLIC_GOOGLE_SCRIPT_URL] 연동됨
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500 bg-white"
                />
                <button
                  onClick={handleSaveUrl}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl active:scale-95 transition-all text-xs shrink-0"
                >
                  저장
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                .env.local의 NEXT_PUBLIC_GOOGLE_SCRIPT_URL로 설정된 URL이 기본 적용됩니다.
              </p>
            </div>

            {/* Test Send Button & Feedback */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleTestSend}
                disabled={testStatus.loading}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 font-bold text-slate-700 rounded-xl transition-all text-xs"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>{testStatus.loading ? '전송 중...' : '테스트 데이터 전송'}</span>
              </button>
              {testStatus.message && (
                <div
                  className={`text-[11px] font-semibold flex items-center gap-1 flex-1 ${
                    testStatus.success ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {testStatus.success ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>

            {/* Step-by-step Apps Script Guide */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  구글 앱스 스크립트 설정 가이드 (1분 소요)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100/70 px-2.5 py-1 rounded-lg transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-amber-700" />
                      <span>스크립트 코드 복사</span>
                    </>
                  )}
                </button>
              </div>

              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 leading-relaxed">
                <li>
                  <a
                    href={SPREADSHEET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-amber-800"
                  >
                    구글 시트
                  </a>
                  로 이동하여 상단 메뉴의 <strong>[확장 프로그램] ➜ [Apps Script]</strong>를 엽니다.
                </li>
                <li>
                  편집기 창에 <strong>[스크립트 코드 복사]</strong> 버튼을 눌러 복사한 코드를 그대로 붙여넣고 저장(Ctrl+S)합니다.
                </li>
                <li>
                  우측 상단 <strong>[배포] ➜ [새 배포] ➜ [웹 앱]</strong>을 선택하고, 액세스 권한을 <strong>[모든 사용자 (Anyone)]</strong>로 설정하여 배포합니다.
                </li>
                <li>생성된 <strong>웹 앱 URL</strong>을 위 입력란에 붙여넣고 [저장]하면 연동이 완료됩니다!</li>
              </ol>

              <button
                onClick={() => setShowCode(!showCode)}
                className="text-[11px] font-semibold text-amber-800 hover:underline pt-1 block"
              >
                {showCode ? '▲ 생성된 Apps Script 코드 숨기기' : '▼ 생성된 Apps Script 코드 미리보기'}
              </button>

              {showCode && (
                <div className="relative mt-2">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 leading-normal">
                    {GAS_CODE_SNIPPET}
                  </pre>
                </div>
              )}
            </div>

            {/* Recent Recorded Logs */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  최근 학습 기록 로그 ({logs.length}건)
                </span>
                <span className="text-[10px] text-slate-400">게임 완료 시 자동 기록</span>
              </div>

              {logs.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-[11px]">
                  <div className="grid grid-cols-4 bg-slate-50 p-2 font-bold text-slate-600 text-[10px]">
                    <span>일시 (timestamp)</span>
                    <span className="text-center">플레이 수 (play)</span>
                    <span className="text-center">오답 수 (wrong)</span>
                    <span className="text-right">상태</span>
                  </div>
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="grid grid-cols-4 p-2 items-center bg-white">
                      <span className="font-mono text-[10px] text-slate-600 truncate">
                        {log.timestamp}
                      </span>
                      <span className="text-center font-bold text-emerald-700">
                        {log.play_account}회
                      </span>
                      <span className="text-center font-bold text-rose-600">
                        {log.wrong_account}개
                      </span>
                      <span className="text-right">
                        {log.synced ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Check className="w-2.5 h-2.5" /> 시트 전송됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            로컬 저장
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-2xl text-[11px] text-slate-400">
                  아직 완료된 게임 기록이 없습니다. 게임을 완료하면 자동으로 시트에 기록됩니다.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              💡 초등 3~4학년 학생들의 학습 현황을 교과 진도에 맞춰 확인해보세요.
            </span>
            <button
              onClick={() => {
                sound.play('click');
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
