#!/usr/bin/env python3
"""CSV → index.html builder
Usage: python3 build.py
"""
import csv
import json
import os
import sys
from collections import defaultdict

CHOSUNG  = list('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ')
JUNGSUNG = list('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ')
JONGSUNG = list(' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ')

def chosung_only(text):
    result = []
    for ch in text:
        code = ord(ch)
        if 0xAC00 <= code <= 0xD7A3:
            offset = code - 0xAC00
            result.append(CHOSUNG[offset // (21 * 28)])
        elif ch in CHOSUNG:
            result.append(ch)
    return ''.join(result)

def decompose(text):
    result = []
    for ch in text:
        code = ord(ch)
        if 0xAC00 <= code <= 0xD7A3:
            offset = code - 0xAC00
            cho  = offset // (21 * 28)
            jung = (offset % (21 * 28)) // 28
            jong = offset % 28
            result.append(CHOSUNG[cho])
            result.append(JUNGSUNG[jung])
            if jong:
                result.append(JONGSUNG[jong])
        else:
            result.append(ch)
    return ''.join(result)

BASE         = os.path.dirname(__file__)
MODELS_SRC   = os.path.join(BASE, 'models.csv')
GAMES_SRC    = os.path.join(BASE, 'games.csv')
TEMPLATE     = os.path.join(BASE, 'template.html')
OUT          = os.path.join(BASE, 'index.html')
MARKER       = '<!-- @@GAMES_DATA@@ -->'

# models.csv 로드
models = {}
with open(MODELS_SRC, newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        models[row['model']] = row['label']

# games.csv 로드
groups = defaultdict(list)
with open(GAMES_SRC, newline='', encoding='utf-8') as f:
    for i, row in enumerate(csv.DictReader(f), start=2):
        groups[row['model']].append({
            'id': row['id'],
            'title': row['title'],
            'title_ko': row['title_ko'],
            'jamo': decompose(row['title_ko']).replace(' ', ''),
            'chosung': chosung_only(row['title_ko']),
            'initials': ''.join(w[0].lower() for w in row['title'].split() if w),
        })

# 정합성 검사
errors = []
games_models  = set(groups.keys())
models_models = set(models.keys())

for m in sorted(games_models - models_models):
    errors.append(f'  games.csv에는 있으나 models.csv에 없음: {m}')
for m in sorted(models_models - games_models):
    errors.append(f'  models.csv에는 있으나 games.csv에 없음: {m}')

if errors:
    print('[오류] 정합성 검사 실패:')
    for e in errors:
        print(e)
    sys.exit(1)

# 데이터 스크립트 블록 생성
data_script = '<script>\n'
data_script += 'const MODELS = '
data_script += json.dumps(models, ensure_ascii=False)
data_script += ';\n'
data_script += 'const GAMES = '
data_script += json.dumps(dict(groups), ensure_ascii=False)
data_script += ';\n'
data_script += '</script>'

# template.html 로드 후 마커 치환 → index.html 출력
with open(TEMPLATE, encoding='utf-8') as f:
    template = f.read()

if MARKER not in template:
    print(f'[오류] template.html에 삽입 마커({MARKER})가 없습니다.')
    sys.exit(1)

output = template.replace(MARKER, data_script)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(output)

total = sum(len(v) for v in groups.values())
print(f'  {OUT} ({total} games, {len(models)} models)')
print('Done.')
