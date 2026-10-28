@echo off
rem Double-click to open Clock Tracker in its own window (no tabs or address bar).
set "PAGE=%~dp0index.html"
set "URL=file:///%PAGE:\=/%"

where msedge >nul 2>nul && (start "" msedge --app="%URL%" & exit /b)
where chrome >nul 2>nul && (start "" chrome --app="%URL%" & exit /b)

rem Neither was found, so use the default browser.
start "" "%PAGE%"
