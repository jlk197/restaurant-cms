# PowerShell script to refresh Ethereal test email credentials

Write-Host "`n🔄 Refreshing test email credentials...`n" -ForegroundColor Cyan

# Step 1: Generate new credentials and update config files
Write-Host "Step 1: Generating new Ethereal account..." -ForegroundColor Yellow
Set-Location backend
node setup-test-email.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to generate new credentials" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Step 2: Rebuild and restart backend
Write-Host "`nStep 2: Rebuilding and restarting backend..." -ForegroundColor Yellow
docker-compose up -d --build backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ All done! Backend is running with new email credentials.`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to restart backend" -ForegroundColor Red
    exit 1
}

