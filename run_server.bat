@echo off
echo.
echo ========================================
echo   OshEstate - Локальный веб-сервер
echo ========================================
echo.
echo Запуск сервера на http://localhost:8000
echo.
echo Нажми Ctrl+C чтобы остановить сервер
echo.
pause

python -m http.server 8000

pause
