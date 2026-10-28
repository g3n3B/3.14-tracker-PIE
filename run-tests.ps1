# Clock Tracker: automatic checks, then the manual checklist.
# Run from PowerShell in this folder:
#   powershell -ExecutionPolicy Bypass -File .\run-tests.ps1

$ErrorActionPreference = "Continue"
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed." -ForegroundColor Yellow
    Write-Host "Install the LTS version from https://nodejs.org, close PowerShell, and run this again."
    Write-Host "Opening the page so you can still do the manual checklist."
    Start-Process ".\index.html"
    Start-Process ".\manual-checklist.txt"
    exit 1
}

Write-Host ""
Write-Host "== 1. Clock, counter, and faction rules ==" -ForegroundColor Cyan
node --test clock.test.js
$rulesResult = $LASTEXITCODE

Write-Host ""
Write-Host "== 2. Page code and element check ==" -ForegroundColor Cyan
node check-page.js
$pageResult = $LASTEXITCODE

Write-Host ""
if ($rulesResult -eq 0 -and $pageResult -eq 0) {
    Write-Host "Automatic checks passed." -ForegroundColor Green
} else {
    Write-Host "Some automatic checks failed. Copy everything above this line and send it to Claude." -ForegroundColor Red
}

Write-Host ""
Write-Host "== 3. Manual checklist ==" -ForegroundColor Cyan
Write-Host "Opening index.html and manual-checklist.txt. Work through the checklist in the browser."
Start-Process ".\index.html"
Start-Process ".\manual-checklist.txt"
