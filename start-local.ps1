$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$backendLog = Join-Path $backend "backend-dev.out.log"
$backendErrorLog = Join-Path $backend "backend-dev.err.log"
$frontendLog = Join-Path $frontend "next-dev.out.log"
$frontendErrorLog = Join-Path $frontend "next-dev.err.log"

$backendPort = 8080
$backendEnv = Join-Path $backend ".env"
if (Test-Path $backendEnv) {
    $portLine = Get-Content $backendEnv | Where-Object { $_ -match '^SERVER_PORT=' } | Select-Object -First 1
    if ($portLine) {
        $backendPort = [int]($portLine -replace '^SERVER_PORT=', '')
    }
}

function Test-ListeningPort([int]$Port) {
    return [bool](Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
}

if (-not (Test-ListeningPort $backendPort)) {
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList '/c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local"' `
        -WorkingDirectory $backend `
        -RedirectStandardOutput $backendLog `
        -RedirectStandardError $backendErrorLog `
        -WindowStyle Hidden
    Write-Host "Backend iniciando en el puerto $backendPort."
} else {
    Write-Host "El puerto $backendPort ya esta ocupado; no se inicio otro backend."
}

if (-not (Test-ListeningPort 3000)) {
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList '/c "npm run dev"' `
        -WorkingDirectory $frontend `
        -RedirectStandardOutput $frontendLog `
        -RedirectStandardError $frontendErrorLog `
        -WindowStyle Hidden
    Write-Host "Frontend iniciando en http://localhost:3000."
} else {
    Write-Host "El puerto 3000 ya esta ocupado; no se inicio otro frontend."
}
