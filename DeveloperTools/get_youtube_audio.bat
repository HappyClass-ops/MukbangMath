@echo off
echo ==========================================
echo YouTube Audio Downloader (No Ads!)
echo ==========================================
echo.
echo Checking for updates...
python -m pip install -q -U yt-dlp

echo.
set /p url="1. Enter YouTube URL: "
set /p filename="2. Enter output filename (e.g., retro-start): "
set /p folder="3. Which game? (Type 'pacmath' or 'mathbang'): "

echo.
echo Downloading audio from YouTube...
:: We download as .m4a because it plays perfectly in modern browsers without needing FFmpeg to convert to mp3!
python -m yt_dlp -f "bestaudio[ext=m4a]" -o "%folder%\assets\%filename%.m4a" "%url%"

echo.
echo ==========================================
echo ✅ Done! The file is saved at:
echo %folder%\assets\%filename%.m4a
echo ==========================================
echo Make sure to update your assets.js file to point to this new file!
pause
