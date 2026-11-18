/**
 * Mi perfil en datos — versión Google Apps Script (1.1.0)
 * Proyecto “¿Quién soy yo? Datos para decidir”, Colegio Brasilia Bosa IED.
 *
 * Archivos del proyecto de Apps Script:
 *   Code.gs      este archivo
 *   Index.html   el aplicativo (versión para Apps Script, sin la fuente incrustada)
 *   Fuente.html  la tipografía Montserrat
 *
 * Primera vez:
 *   1. Cambia el PIN en la línea PIN_INICIAL y guarda.
 *   2. Elige la función configurar en la barra superior y pulsa Ejecutar. Autoriza los permisos.
 *   3. Implementar > Nueva implementación > Aplicación web.
 *
 * Los datos se guardan en la hoja de cálculo vinculada:
 *   Estudiantes: una fila por código (sin nombres).
 *   Ocupaciones: la lista de perfiles de ocupaciones en la celda A1.
 * Las descargas (CSV y copias JSON) se guardan en la carpeta de Drive
 * “Mi perfil en datos - exportaciones”.
 */

const PIN_INICIAL = 'cambia-este-pin';   // escribe aquí el PIN del panel docente antes de ejecutar configurar
const HEAD_ = ['codigo', 'curso', 'profundizacion', 'R', 'I', 'A', 'S', 'E', 'C', 'actualizado', 'registro_json'];
const CARPETA_ = 'Mi perfil en datos - exportaciones';

/* ---------- aplicación web ---------- */
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Mi perfil en datos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(nombre) {
  return HtmlService.createHtmlOutputFromFile(nombre).getContent();
}

/* ---------- configuración (se ejecuta una vez desde el editor) ---------- */
function configurar() {
  if (PIN_INICIAL === 'cambia-este-pin' || String(PIN_INICIAL).length < 4) {
    throw new Error('Escribe un PIN de al menos 4 caracteres en PIN_INICIAL y vuelve a ejecutar configurar.');
  }
  PropertiesService.getScriptProperties().setProperty('PIN_DOCENTE', String(PIN_INICIAL));
  sheet_('Estudiantes', HEAD_);
  sheet_('Ocupaciones');
  carpeta_();
  Logger.log('Listo. Hoja: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
}

/* ---------- utilidades ---------- */
function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header) { sh.appendRow(header); sh.setFrozenRows(1); }
  }
  return sh;
}

function carpeta_() {
  const it = DriveApp.getFoldersByName(CARPETA_);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_);
}

function pinOk_(pin) {
  const p = PropertiesService.getScriptProperties().getProperty('PIN_DOCENTE');
  return !!p && String(pin) === p;
}

function exigirPin_(pin) {
  if (!pinOk_(pin)) throw new Error('PIN del panel docente incorrecto.');
}

function scores_(resp) {
  const s = [0, 0, 0, 0, 0, 0];
  (resp || []).forEach(function (v, k) { s[k % 6] += Number(v) || 0; });
  return s;
}

function rowFor_(st) {
  const sc = st.resp && st.resp.length === 30 ? scores_(st.resp) : ['', '', '', '', '', ''];
  return [st.code, st.curso, st.prof || ''].concat(sc).concat([new Date(), JSON.stringify(st)]);
}

function codigos_(sh) {
  return sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues().map(function (r) { return r[0]; });
}

/* ---------- API que llama el aplicativo ---------- */
function api_checkPin(pin) {
  return pinOk_(pin);
}

function api_getAll() {
  const sh = sheet_('Estudiantes', HEAD_);
  const values = sh.getDataRange().getValues();
  const students = [];
  for (let i = 1; i < values.length; i++) {
    const raw = values[i][10];
    if (raw) { try { students.push(JSON.parse(raw)); } catch (e) {} }
  }
  const occRaw = sheet_('Ocupaciones').getRange('A1').getValue();
  let occ = null;
  if (occRaw) { try { occ = JSON.parse(occRaw); } catch (e) {} }
  return { students: students, occ: occ };
}

// Los estudiantes guardan su propio registro sin PIN (respuestas, semáforos, tablero).
function api_saveStudent(json) {
  const st = JSON.parse(json);
  if (!st || !st.code || !/^[\w-]{3,20}$/.test(st.code)) throw new Error('Código no válido.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_('Estudiantes', HEAD_);
    const idx = codigos_(sh).indexOf(st.code);
    const row = rowFor_(st);
    if (idx > 0) sh.getRange(idx + 1, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
  } finally { lock.releaseLock(); }
  return true;
}

// Lo que borra o reemplaza datos de varios estudiantes exige el PIN docente.
function api_deleteStudent(code, pin) {
  exigirPin_(pin);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_('Estudiantes', HEAD_);
    const idx = codigos_(sh).indexOf(code);
    if (idx > 0) sh.deleteRow(idx + 1);
  } finally { lock.releaseLock(); }
  return true;
}

function api_saveOcc(json, pin) {
  exigirPin_(pin);
  sheet_('Ocupaciones').getRange('A1').setValue(json === 'null' ? '' : json);
  return true;
}

function api_replaceAll(json, pin) {
  exigirPin_(pin);
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

// Descargas: el archivo se guarda en Drive y se devuelve su enlace.
function api_export(name, content, mime, pin) {
  if (!pinOk_(pin)) throw new Error('Las descargas en línea son solo para el panel docente.');
  const sello = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmm');
  const limpio = String(name).replace(/[^\w.\- ]/g, '_');
  const f = carpeta_().createFile(sello + '_' + limpio, content, mime || 'text/plain');
  return f.getUrl();
}
