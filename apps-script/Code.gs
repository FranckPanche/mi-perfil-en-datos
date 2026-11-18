/**
 * Mi perfil en datos — versión Google Apps Script
 * Proyecto “¿Quién soy yo? Datos para decidir”, Colegio Brasilia Bosa IED.
 *
 * Instalación:
 * 1. Crea una hoja de cálculo nueva en Google Drive.
 * 2. Menú Extensiones > Apps Script.
 * 3. Pega este archivo como Code.gs.
 * 4. Crea un archivo HTML llamado exactamente Index y pega el contenido de Index.html.
 * 5. Implementar > Nueva implementación > Aplicación web.
 *    Ejecutar como: yo. Quién tiene acceso: según la política del colegio.
 *
 * Los datos se guardan en dos pestañas que el script crea solo:
 *   Estudiantes: una fila por código (sin nombres).
 *   Ocupaciones: la lista de perfiles de ocupaciones en la celda A1.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Mi perfil en datos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header) sh.appendRow(header);
  }
  return sh;
}

const HEAD_ = ['codigo', 'curso', 'profundizacion', 'R', 'I', 'A', 'S', 'E', 'C', 'actualizado', 'registro_json'];
const TYPES_ = ['R', 'I', 'A', 'S', 'E', 'C'];

function scores_(resp) {
  const s = [0, 0, 0, 0, 0, 0];
  (resp || []).forEach(function (v, k) { s[k % 6] += Number(v) || 0; });
  return s;
}

function rowFor_(st) {
  const sc = st.resp && st.resp.length === 30 ? scores_(st.resp) : ['', '', '', '', '', ''];
  return [st.code, st.curso, st.prof || ''].concat(sc).concat([new Date(), JSON.stringify(st)]);
}

function api_getAll() {
  const sh = sheet_('Estudiantes', HEAD_);
  const values = sh.getDataRange().getValues();
  const students = [];
  for (let i = 1; i < values.length; i++) {
    const raw = values[i][10];
    if (raw) { try { students.push(JSON.parse(raw)); } catch (e) {} }
  }
  const occSh = sheet_('Ocupaciones');
  const occRaw = occSh.getRange('A1').getValue();
  let occ = null;
  if (occRaw) { try { occ = JSON.parse(occRaw); } catch (e) {} }
  return { students: students, occ: occ };
}

function api_saveStudent(json) {
  const st = JSON.parse(json);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_('Estudiantes', HEAD_);
    const codes = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues().map(function (r) { return r[0]; });
    const idx = codes.indexOf(st.code);
    const row = rowFor_(st);
    if (idx > 0) sh.getRange(idx + 1, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
  } finally { lock.releaseLock(); }
  return true;
}

function api_deleteStudent(code) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_('Estudiantes', HEAD_);
    const codes = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues().map(function (r) { return r[0]; });
    const idx = codes.indexOf(code);
    if (idx > 0) sh.deleteRow(idx + 1);
  } finally { lock.releaseLock(); }
  return true;
}

function api_saveOcc(json) {
  const sh = sheet_('Ocupaciones');
  sh.getRange('A1').setValue(json === 'null' ? '' : json);
  return true;
}

function api_replaceAll(json) {
  const d = JSON.parse(json);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_('Estudiantes', HEAD_);
    sh.clearContents();
    sh.appendRow(HEAD_);
    const rows = (d.students || []).map(rowFor_);
    if (rows.length) sh.getRange(2, 1, rows.length, HEAD_.length).setValues(rows);
    sheet_('Ocupaciones').getRange('A1').setValue(d.occ ? JSON.stringify(d.occ) : '');
  } finally { lock.releaseLock(); }
  return true;
}
