# 할 일 목록 앱

React Native와 Expo를 사용하여 만든 할 일 관리 앱입니다.

## 주요 기능

- **카테고리별 할 일 관리**: 카테고리를 만들어 할 일을 분류할 수 있습니다
- **날짜 기반 관리**: 마감일을 설정하고 남은 날짜를 확인할 수 있습니다
- **직관적인 UI**: 간단하고 사용하기 쉬운 인터페이스
- **편집 기능**: 카테고리와 할 일을 수정할 수 있습니다

## 설치 및 실행

### 필요 조건
- Node.js (v16 이상)
- npm 또는 yarn
- Expo CLI

### 설치
```bash
# 패키지 설치
npm install

# 또는 yarn 사용
yarn install
```

### 실행
```bash
# 개발 서버 시작
npm start

# 또는 yarn 사용
yarn start
```

### 플랫폼별 실행
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 프로젝트 구조

```
src/
├── components/
│   ├── AddCategory.tsx    # 카테고리 추가 컴포넌트
│   ├── AddTodo.tsx        # 할 일 추가 컴포넌트
│   ├── Category.tsx       # 카테고리 컴포넌트
│   └── Todo.tsx           # 할 일 컴포넌트
├── screens/
│   └── HomeScreen.tsx     # 홈 화면
├── state/
│   ├── actions.ts         # 액션 타입 정의
│   └── reducer.ts         # 리듀서 함수
└── types.ts               # 타입 정의
```

## 사용 방법

1. **카테고리 생성**: "새 카테고리" 버튼을 눌러 카테고리를 만듭니다
2. **할 일 추가**: 카테고리 내에서 "새 할 일" 버튼을 눌러 할 일을 추가합니다
3. **날짜 설정**: 할 일을 추가할 때 마감일을 선택합니다
4. **남은 날짜 확인**: 각 할 일 옆에 남은 날짜가 색깔로 표시됩니다
   - 🔴 빨간색: 마감일이 지남
   - 🟠 주황색: 오늘 또는 3일 이내
   - 🟢 초록색: 여유있음
5. **편집 및 삭제**: 카테고리와 할 일을 수정하거나 삭제할 수 있습니다

## 기술 스택

- React Native
- Expo
- TypeScript
- React Navigation
- React Native DateTimePicker

## 상태 관리

useReducer를 사용하여 상태를 관리합니다:
- 카테고리 생성, 수정, 삭제
- 할 일 생성, 수정, 삭제
- 날짜 기반 남은 시간 계산