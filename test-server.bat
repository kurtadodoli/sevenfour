@echo off
echo Testing if server is running on port 3001...
curl -s http://localhost:3001/api/test
if %ERRORLEVEL% NEQ 0 (
  echo Server not responding on port 3001
  echo Make sure to start server with: cd server && npm start
) else (
  echo Server is running correctly
)
pause
