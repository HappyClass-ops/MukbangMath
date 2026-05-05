@echo off
echo ========================================================
echo Starting Mr. Hemnell's Learning Arcade Local Dev Server
echo ========================================================
echo.
echo Your browser restricts loading modular React/Babel files 
echo directly from the file system (file:///) for security.
echo.
echo This server mimics GitHub Pages locally to bypass those 
echo restrictions and allow your compartmentalized code to run.
echo.
echo To stop the server, press CTRL+C.
echo.

start http://localhost:8000
python -m http.server 8000
pause
