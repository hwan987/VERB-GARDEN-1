# Google Apps Script 배포 및 설정 가이드

본 가이드는 **초등 3~4학년 영어 불규칙 동사 정원 게임**의 플레이 횟수, 오답 수, 그리고 **각 문장별 탭 빈도(tap_frequency) 및 평균(tap_average)**을 구글 스프레드시트에 자동 기록하기 위한 구글 앱스 스크립트(Google Apps Script) 배포 안내서입니다.

---

## 1. 대상 구글 시트 정보
- **스프레드시트 링크**: [https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE/edit?usp=sharing)
- **시트 ID**: `1SDJ0ohfnTJoucojmVsHc6uTkzPPrp1kqMA_5co138zE`
- **1행 헤더 컬럼**:
  - `timestamp`: 기록된 일시 (한국 시간 KST: `YYYY-MM-DD HH:mm:ss`)
  - `play_account` (또는 `play_count`): 누적 플레이 횟수
  - `wrong_account` (또는 `wrong_count`): 해당 게임 오답 수
  - `tap_average`: 각 문장별 평균 탭 수
  - `tap_frequency`: 각 문장별 탭 빈도 요약 (`1번(grow): 2회, 2번(drink): 3회...`)
  - `sentence_details`: 문장별 상세 내역

---

## 2. 웹 앱 URL 환경 변수 (.env.local) 설정
본 프로젝트의 `.env.local` 파일에 지정된 웹 앱 URL:
```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwnmtM_UXrn6juEuCxPskBc9ZQg6reV200EVSfyb2mZ04QR6duhnhb6C7d-7h4UkD8J/exec
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwnmtM_UXrn6juEuCxPskBc9ZQg6reV200EVSfyb2mZ04QR6duhnhb6C7d-7h4UkD8J/exec
```
클라이언트 앱은 `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` 환경 변수 키를 통해 위 구글 스크립트 웹 앱으로 학습 로그와 문장별 탭 통계를 자동 전송합니다.

---

## 3. 구글 시트에 스크립트 등록 및 배포하는 방법

1. 위 **구글 스프레드시트** 링크를 브라우저로 엽니다.
2. 상단 메뉴에서 **[확장 프로그램 (Extensions)] ➜ [Apps Script]**를 클릭합니다.
3. 열린 코드 편집기에 `google-apps-script/Code.gs` 파일의 전체 코드를 붙여넣습니다.
4. 상단의 **💾 저장 (Ctrl+S 또는 Cmd+S)** 아이콘을 누릅니다.
5. 상단 파란색 **[배포 (Deploy)] ➜ [새 배포 (New deployment)]** (또는 기존 배포 관리 ➜ 새 버전 배포)를 클릭합니다.
6. 설정을 다음과 같이 지정합니다:
   - **유형**: 웹 앱 (Web app)
   - **다음 사용자로 실행 (Execute as)**: `나 (Me)`
   - **액세스할 수 있는 사용자 (Who has access)**: **`모든 사용자 (Anyone)`** *(중요)*
7. 배포 후 발급된 **웹 앱 URL**이 `.env.local`의 `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`과 일치하는지 확인합니다.

---

## 4. 데이터 전송 포맷 (API 명세)

- **Method**: `POST` (또는 `GET`)
- **Payload 예시**:
```json
{
  "timestamp": "2026-10-30 11:45:00",
  "play_account": 3,
  "play_count": 3,
  "wrong_account": 1,
  "wrong_count": 1,
  "tap_average": 2.4,
  "tap_frequency": "1번(grow): 2회, 2번(drink): 3회, 3번(see): 2회...",
  "total_taps": 24,
  "sentence_details": "[Q1] The sprout grew (2회) | [Q2] The balsam drank (3회)"
}
```
- **응답 (JSON)**:
```json
{
  "status": "success",
  "message": "Log successfully saved to Google Sheet",
  "record": {
    "timestamp": "2026-10-30 11:45:00",
    "play_account": 3,
    "wrong_account": 1,
    "tap_average": 2.4,
    "tap_frequency": "1번(grow): 2회, 2번(drink): 3회...",
    "savedRow": 4
  }
}
```
