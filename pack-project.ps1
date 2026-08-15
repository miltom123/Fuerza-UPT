$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$destination = Join-Path (Split-Path -Parent $root) "FuerzaUPT-seguro.zip"

if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Force
}

tar.exe -a -c -f $destination `
    --exclude=FuerzaUPT/frontend/node_modules `
    --exclude=FuerzaUPT/frontend/.next `
    --exclude=FuerzaUPT/frontend/.git `
    --exclude=FuerzaUPT/frontend/logs `
    --exclude=FuerzaUPT/frontend/.env.local `
    --exclude=FuerzaUPT/frontend/.env.*.local `
    --exclude=FuerzaUPT/frontend/.env.production `
    --exclude=FuerzaUPT/frontend/.env.development `
    --exclude=FuerzaUPT/frontend/.env.test `
    --exclude=FuerzaUPT/backend/target `
    --exclude=FuerzaUPT/backend/logs `
    --exclude=FuerzaUPT/backend/.env `
    --exclude=FuerzaUPT/backend/.env.*.local `
    --exclude=FuerzaUPT/backend/.env.production `
    --exclude=FuerzaUPT/backend/.env.development `
    --exclude=FuerzaUPT/backend/.env.test `
    --exclude=FuerzaUPT/.tools `
    --exclude='*.log' `
    -C (Split-Path -Parent $root) `
    (Split-Path -Leaf $root)

if ($LASTEXITCODE -ne 0) {
    throw "No se pudo crear el paquete seguro."
}

$entries = @(tar.exe -tf $destination)
if ($LASTEXITCODE -ne 0) {
    Remove-Item -LiteralPath $destination -Force
    throw "No se pudo inspeccionar el paquete creado."
}

$unsafeEntries = @($entries | Where-Object {
    $_ -match '(^|/)(node_modules|\.next|target|\.git|\.tools|logs)(/|$)' -or
    $_ -match '\.log$' -or
    ($_ -match '(^|/)\.env($|\.)' -and $_ -notmatch '\.env\.example$')
})

if ($unsafeEntries.Count -gt 0) {
    Remove-Item -LiteralPath $destination -Force
    throw "El paquete contenia archivos privados o generados y fue eliminado."
}

Write-Host "Paquete seguro creado en $destination"
