/**
 * Google Sheets API 서비스 모듈
 * Google Cloud Console > 'My First Project' 의 API 키를 사용합니다.
 * (Sheets API v4 - 읽기 전용, API 키 방식)
 *
 * API 키:       .env.local > VITE_GOOGLE_API_KEY
 * 스프레드시트 ID: .env.local > VITE_GOOGLE_SHEET_ID
 * 범위:          .env.local > VITE_GOOGLE_SHEET_RANGE
 *
 * 사전 조건:
 * - Google Cloud Console에서 'Google Sheets API' 활성화 필요
 * - 스프레드시트 공유 설정이 '링크가 있는 모든 사용자' 또는 공개여야 합니다.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const DEFAULT_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID
const DEFAULT_RANGE = import.meta.env.VITE_GOOGLE_SHEET_RANGE || '시트1!A2:Z'
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

/**
 * API 키 유효성 검사
 */
function validateApiKey() {
  if (!API_KEY || API_KEY === '여기에_구글_API_키_입력') {
    throw new Error('[Sheets] API 키가 설정되지 않았습니다. .env.local 파일의 VITE_GOOGLE_API_KEY를 확인하세요.')
  }
}

/**
 * 스프레드시트에서 데이터를 읽어옵니다.
 * @param {string} [sheetId] - 스프레드시트 ID (미입력 시 .env.local 값 사용)
 * @param {string} [range] - 읽을 범위 (예: 'Sheet1!A1:D10')
 * @returns {Promise<Array<Array<string>>>} - 2차원 배열 형태의 셀 데이터
 */
export async function getSheetData(sheetId = DEFAULT_SHEET_ID, range = DEFAULT_RANGE) {
  validateApiKey()

  if (!sheetId || sheetId === '여기에_스프레드시트_ID_입력') {
    throw new Error('[Sheets] 스프레드시트 ID가 설정되지 않았습니다. .env.local 파일의 VITE_GOOGLE_SHEET_ID를 확인하세요.')
  }

  const url = `${BASE_URL}/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`[Sheets] API 오류 ${response.status}: ${error?.error?.message || response.statusText}`)
  }

  const data = await response.json()

  // 데이터가 없으면 빈 배열 반환
  return data.values || []
}

/**
 * 스프레드시트 데이터를 헤더 기반 객체 배열로 변환합니다.
 * 첫 번째 행을 헤더(키)로 사용합니다.
 *
 * 예시:
 *   원본: [['이름', '나이'], ['홍길동', '30'], ['김철수', '25']]
 *   결과: [{ 이름: '홍길동', 나이: '30' }, { 이름: '김철수', 나이: '25' }]
 *
 * @param {string} [sheetId]
 * @param {string} [range]
 * @returns {Promise<Array<Object>>}
 */
export async function getSheetAsObjects(sheetId = DEFAULT_SHEET_ID, range = DEFAULT_RANGE) {
  const rows = await getSheetData(sheetId, range)

  if (rows.length < 2) return []

  const [headers, ...dataRows] = rows

  return dataRows.map((row) =>
    headers.reduce((obj, header, index) => {
      obj[header] = row[index] ?? ''
      return obj
    }, {})
  )
}

/**
 * 스프레드시트의 메타데이터(시트 목록 등)를 가져옵니다.
 * @param {string} [sheetId]
 * @returns {Promise<Object>}
 */
export async function getSheetMetadata(sheetId = DEFAULT_SHEET_ID) {
  validateApiKey()

  const url = `${BASE_URL}/${sheetId}?key=${API_KEY}&fields=properties,sheets.properties`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`[Sheets] API 오류 ${response.status}: ${error?.error?.message || response.statusText}`)
  }

  return response.json()
}
