#!/usr/bin/env node
/**
 * CSV → index.html builder
 * Usage: node build.js
 */
const fs = require('fs');
const path = require('path');

const CHOSUNG  = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'];
const JUNGSUNG = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'];
const JONGSUNG = [...' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];

function chosungOnly(text) {
  const result = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      result.push(CHOSUNG[Math.floor((code - 0xAC00) / (21 * 28))]);
    } else if (CHOSUNG.includes(ch)) {
      result.push(ch);
    }
  }
  return result.join('');
}

function decompose(text) {
  const result = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const offset = code - 0xAC00;
      const cho  = Math.floor(offset / (21 * 28));
      const jung = Math.floor((offset % (21 * 28)) / 28);
      const jong = offset % 28;
      result.push(CHOSUNG[cho], JUNGSUNG[jung]);
      if (jong) result.push(JONGSUNG[jong]);
    } else {
      result.push(ch);
    }
  }
  return result.join('');
}

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.length > 0);
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  });
}

function parseCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuote = false;
      else cur += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
  }
  cells.push(cur);
  return cells;
}

const BASE       = __dirname;
const MODELS_SRC = path.join(BASE, 'models.csv');
const GAMES_SRC  = path.join(BASE, 'games.csv');
const TEMPLATE   = path.join(BASE, 'template.html');
const OUT        = path.join(BASE, 'index.html');
const MARKER     = '<!-- @@GAMES_DATA@@ -->';

const models = {};
for (const row of parseCsv(fs.readFileSync(MODELS_SRC, 'utf-8'))) {
  models[row.model] = row.label;
}

const groups = {};
for (const row of parseCsv(fs.readFileSync(GAMES_SRC, 'utf-8'))) {
  (groups[row.model] ||= []).push({
    id: row.id,
    title: row.title,
    title_ko: row.title_ko,
    jamo: decompose(row.title_ko).replace(/ /g, ''),
    chosung: chosungOnly(row.title_ko),
    initials: row.title.split(/\s+/).filter(Boolean).map(w => w[0].toLowerCase()).join(''),
  });
}

const errors = [];
const gamesModels  = new Set(Object.keys(groups));
const modelsModels = new Set(Object.keys(models));
for (const m of [...gamesModels].filter(x => !modelsModels.has(x)).sort()) {
  errors.push(`  games.csv에는 있으나 models.csv에 없음: ${m}`);
}
for (const m of [...modelsModels].filter(x => !gamesModels.has(x)).sort()) {
  errors.push(`  models.csv에는 있으나 games.csv에 없음: ${m}`);
}
if (errors.length) {
  console.error('[오류] 정합성 검사 실패:');
  for (const e of errors) console.error(e);
  process.exit(1);
}

const dataScript =
  '<script>\n' +
  'const MODELS = ' + JSON.stringify(models) + ';\n' +
  'const GAMES = ' + JSON.stringify(groups) + ';\n' +
  '</script>';

const template = fs.readFileSync(TEMPLATE, 'utf-8');
if (!template.includes(MARKER)) {
  console.error(`[오류] template.html에 삽입 마커(${MARKER})가 없습니다.`);
  process.exit(1);
}

fs.writeFileSync(OUT, template.replace(MARKER, dataScript));

const total = Object.values(groups).reduce((a, v) => a + v.length, 0);
console.log(`  ${OUT} (${total} games, ${Object.keys(models).length} models)`);
console.log('Done.');
