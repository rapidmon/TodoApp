@echo off
echo ===== Android 개발 환경 확인 =====
echo.

echo 1. ANDROID_HOME 확인:
if defined ANDROID_HOME (
    echo ANDROID_HOME: %ANDROID_HOME%
    if exist "%ANDROID_HOME%" (
        echo SDK 폴더 존재: O
    ) else (
        echo SDK 폴더 존재: X
    )
) else (
    echo ANDROID_HOME 환경변수가 설정되지 않았습니다.
)
echo.

echo 2. JAVA_HOME 확인:
if defined JAVA_HOME (
    echo JAVA_HOME: %JAVA_HOME%
) else (
    echo JAVA_HOME 환경변수가 설정되지 않았습니다.
)
echo.

echo 3. Java 버전 확인:
java -version 2>nul
if %errorlevel% neq 0 (
    echo Java가 설치되지 않았거나 PATH에 없습니다.
)
echo.

echo 4. ADB 확인:
adb version 2>nul
if %errorlevel% neq 0 (
    echo ADB가 설치되지 않았거나 PATH에 없습니다.
)
echo.

echo 5. Android SDK 폴더 확인:
if exist "%USERPROFILE%\AppData\Local\Android\Sdk" (
    echo 기본 SDK 위치에 폴더 존재: %USERPROFILE%\AppData\Local\Android\Sdk
) else (
    echo 기본 SDK 위치에 폴더 없음
)
echo.

echo 6. Android Studio 설치 확인:
if exist "%PROGRAMFILES%\Android\Android Studio" (
    echo Android Studio 설치됨: %PROGRAMFILES%\Android\Android Studio
) else (
    echo Android Studio가 기본 위치에 설치되지 않았습니다.
)
echo.

echo 7. 현재 프로젝트 Gradle 확인:
if exist "android\gradlew.bat" (
    echo Gradle Wrapper 존재: O
    cd android
    echo Gradle 버전:
    gradlew.bat --version 2>nul
    if %errorlevel% neq 0 (
        echo Gradle 실행 실패
    )
    cd ..
) else (
    echo Gradle Wrapper가 없습니다.
)
echo.

echo ===== 확인 완료 =====
pause