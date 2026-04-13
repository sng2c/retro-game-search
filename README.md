# retro-game-search

[game.gslump.com](https://game.gslump.com) 서비스의 소스코드입니다.
월광보합 시리즈(4S, H4S, 5S, XS, 7) 게임번호찾기 서비스로, 소스를 공개합니다.

<img src="sc.png" style="width:30%;">

## 구성

- 순수 HTML + Vanilla JS 단일 파일 (`index.html`)
- 빌더, 서버, 의존성 없음 — 브라우저에서 바로 열기 가능
- 게임 데이터: CSV에서 빌드 시 `index.html`에 인라인 삽입

## 검색 기능

| 검색 유형 | 예시 | 설명 |
|---|---|---|
| 한글 직접 입력 | `킹오브` | 대소문자 무시, 공백 무시 |
| 자모 분해 검색 | `파잍` → `파이터` | 조합 중인 글자도 완성형과 매칭 |
| 초성 검색 | `ㅋㅇㅂ` → `킹오브파이터즈` | 한글 초성만으로 검색 |
| 영문 직접 입력 | `king` | 대소문자·공백 무시 (`thelast` → `The Last`) |
| 영문 이니셜 검색 | `kof` → `King of Fighters` | 각 단어 첫 글자로 검색 |

- 타이핑하는 즉시 실시간 필터링
- 매칭된 글자는 파란색으로 하이라이트 (가장 긴 매치 우선 채택)

## 데이터 관리

게임 데이터는 CSV를 직접 수정한 뒤 `build.py`로 빌드합니다.

```
games.csv / models.csv 수정 → python3 build.py → index.html 갱신
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

> `build.py`는 두 CSV의 모델 코드가 일치하는지 정합성 검사를 수행합니다.

### CSV 인코딩

두 CSV 파일 모두 **UTF-8**로 저장해야 합니다.
Excel에서 편집 시 "다른 이름으로 저장 → CSV UTF-8(쉼표로 분리)"을 선택하세요. 일반 "CSV"는 CP949로 저장되어 한글이 깨집니다.

### 빌드

```bash
python3 build.py
```

`template.html`을 읽어 게임 데이터를 인라인 삽입한 `index.html`을 생성합니다.
