// src/services/sheetsService.js
// Google Sheets como base de datos (modo público, sin API key)
// Para usar: el spreadsheet debe ser público ("Cualquiera con el link puede ver")

const SHEET_ID = process.env.REACT_APP_SHEET_ID || '1MmsqO01u4y6W3SeBN5gxLzSs1OeoMgtwmj33PhHBZQY';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Parsea el formato de respuesta extraño de Google Sheets gviz
function parseGvizResponse(raw) {
  const json = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  return JSON.parse(json);
}

// Convierte fila gviz a objeto
function rowToObject(cols, row) {
  const obj = {};
  cols.forEach((col, i) => {
    const cell = row.c[i];
    obj[col] = cell ? (cell.v !== null && cell.v !== undefined ? String(cell.v) : '') : '';
  });
  return obj;
}

export async function fetchSheet(sheetName) {
  const url = `${BASE_URL}&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const data = parseGvizResponse(text);
  
  if (!data.table || !data.table.rows) return [];
  
  const cols = data.table.cols.map((c, i) => c.label || `col${i}`);
  return data.table.rows
    .filter(row => row.c && row.c.some(c => c && c.v !== null))
    .map(row => rowToObject(cols, row));
}

// Escribe datos via Google Apps Script Web App (requiere deployar script)
// Si no hay Apps Script, los datos se guardan localmente en localStorage como fallback
export async function writeToSheet(sheetName, rowData) {
  const appsScriptUrl = process.env.REACT_APP_APPS_SCRIPT_URL;
  
  if (!appsScriptUrl) {
    // Fallback: guardar en localStorage
    const key = `sheet_${sheetName}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ ...rowData, id: Date.now(), timestamp: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    return { success: true, local: true };
  }

  const res = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet: sheetName, data: rowData }),
    mode: 'no-cors'
  });
  return { success: true };
}

export function getLocalData(sheetName) {
  const key = `sheet_${sheetName}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function saveLocalData(sheetName, data) {
  localStorage.setItem(`sheet_${sheetName}`, JSON.stringify(data));
}
