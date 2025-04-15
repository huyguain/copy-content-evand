@echo off
chcp 65001 >nul

echo 📚 Đang chạy tool Playwright...

REM Lấy đường dẫn thư mục hiện tại (nơi chứa run.bat)
set "DIR=%~dp0"
cd /d "%DIR%"

REM Kiểm tra file cấu hình
if not exist config.env (
    echo ❌ Không tìm thấy file config.env!
    pause
    exit /b
)

REM Đọc biến từ file config.env
for /f "tokens=1,* delims==" %%A in (config.env) do (
    set "%%A=%%B"
)

REM Chạy Node.js script với tham số
node scrape.js %ITERATIONS% %TARGET_URL% %TARGET_PROFILE%

echo.
echo ✅ Xong!
pause
