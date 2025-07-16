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

# 버전 호환성 확인 가이드

## 필수 환경 버전

### Node.js
- **권장**: 18.x 이상
- **최소**: 16.x
- **확인**: `node --version`

### React Native
- **코드 기준**: 0.72.x (Expo 49 기준)
- **확인**: `npx react-native --version`

### Expo SDK
- **사용 버전**: 49.0.0
- **확인**: `expo --version`

### Android
- **Compile SDK**: 34 이상
- **Target SDK**: 34
- **Min SDK**: 23 (Android 6.0)
- **Build Tools**: 34.0.0
- **Gradle**: 8.0 이상
- **AGP**: 8.0 이상

### Java/JDK
- **권장**: JDK 17
- **최소**: JDK 11
- **확인**: `java -version`

## 의존성 버전 확인

### 주요 패키지 버전
```json
{
  "react": "18.2.0",
  "react-native": "0.72.x",
  "expo": "~49.0.0",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/native-stack": "^6.x.x",
  "@react-native-community/datetimepicker": "^7.x.x",
  "react-native-safe-area-context": "^4.x.x",
  "react-native-screens": "^3.x.x"
}
```

## 환경별 설정

### macOS
```bash
# Xcode Command Line Tools
xcode-select --install

# Homebrew 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# Watchman 설치
brew install watchman

# CocoaPods 설치
sudo gem install cocoapods
```

### Windows
```bash
# Chocolatey를 통한 설치
choco install nodejs
choco install openjdk17
choco install android-sdk

# 또는 직접 다운로드
# Node.js: https://nodejs.org/
# Android Studio: https://developer.android.com/studio
```

### Linux (Ubuntu/Debian)
```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# JDK 설치
sudo apt install openjdk-17-jdk

# Android SDK 설치
sudo apt install android-sdk
```

## 트러블슈팅

### 자주 발생하는 문제들

1. **Metro bundler 오류**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android 빌드 오류**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **네이티브 모듈 오류**
   ```bash
   rm -rf node_modules
   npm install
   cd android && ./gradlew clean && cd ..
   ```

4. **Expo 버전 불일치**
   ```bash
   expo install --fix
   ```

## 회사 환경 특수 고려사항

### 방화벽/프록시 설정
```bash
# npm 프록시 설정
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 또는 .npmrc 파일에 설정
echo "proxy=http://proxy.company.com:8080" >> ~/.npmrc
echo "https-proxy=http://proxy.company.com:8080" >> ~/.npmrc
```

### 내부 패키지 레지스트리
```bash
# 회사 내부 npm 레지스트리 사용시
npm config set registry http://internal-npm-registry.company.com
```

### 보안 정책 확인
- Android 빌드에 필요한 키스토어 설정
- 코드 서명 인증서 요구사항
- 네트워크 접근 권한 정책

