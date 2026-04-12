# retro-game-search

[game.gslump.com](https://game.gslump.com) 서비스의 소스코드입니다.
월광보합 시리즈(4S, H4S, 5S, XS, 7) 게임 검색엔진으로, 소스를 공개합니다.

<img src="sc.png" style="width:30%;">

## 구성

- 순수 HTML + Vanilla JS 단일 파일 (`index.html`)
- 빌더, 서버, 의존성 없음 — 브라우저에서 바로 열기 가능
- 게임 데이터: `games.js` (CSV에서 생성)

## 검색 기능

- 영문 대소문자 무시
- 한글 자소 분리 검색 — 조합 중인 글자(`파잍`)도 완성형(`파이터`)과 동일하게 매칭
- 초성 검색 (`ㅋㅇㅂ` → `킹오브...`)
- 공백 무시 (`킹 오브` = `킹오브`)
- 타이핑하는 즉시 실시간 필터링

## 데이터 관리

게임 데이터는 CSV를 직접 수정한 뒤 `convert.py`로 변환합니다.

```
games.csv / models.csv 수정 → python3 convert.py → games.js 갱신
```

### games.csv 포맷

```
model,id,title,title_ko
4S-680,1,The King of Fighters '97,킹오브파이터즈97
```

| 컬럼 | 설명 |
|---|---|
| `model` | 기기 모델 코드 |
| `id` | 게임 번호 (정수) |
| `title` | 영문 타이틀 (없으면 빈 값) |
| `title_ko` | 한글 타이틀 (없으면 빈 값) |

### models.csv 포맷

```
model,label
4S-680,월광보합4S (680)
```

| 컬럼 | 설명 |
|---|---|
| `model` | 기기 모델 코드 (`games.csv`와 일치해야 함) |
| `label` | 셀렉트박스에 표시할 이름 |

> `convert.py`는 두 CSV의 모델 코드가 일치하는지 정합성 검사를 수행합니다.

### 변환

```bash
python3 convert.py
```
