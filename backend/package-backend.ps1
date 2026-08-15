# Script de empaquetado seguro para Backend Fuerza UPT
# Garantiza que archivos .env, .git, target, logs y scripts de migración NUNCA se incluyan en el archivo ZIP.

$ErrorActionPreference = "Stop"

$BackendDir = "d:\ProyectoWebFuerzaUPT\backend"
$UserDesktop = [Environment]::GetFolderPath("Desktop")
$DestinationZip = Join-Path $UserDesktop "backend-fuerza-upt.zip"

Write-Host "Iniciando empaquetado seguro desde: $BackendDir" -ForegroundColor Cyan

if (Test-Path $DestinationZip) {
    Remove-Item $DestinationZip -Force
    Write-Host "Archivo ZIP anterior removido." -ForegroundColor Yellow
}

# Excluir explicitamente patrones sensibles, carpetas de logs y temporales
$ExcludePatterns = @(
    "*.env*",
    "*.log",
    "logs",
    "target",
    ".git",
    ".idea",
    ".vscode",
    "boot_*.txt",
    "backend-*.log",
    "migration-script-supabase.sql",
    "generate_*.ps1"
)

$FilesToCompress = Get-ChildItem -Path $BackendDir -Exclude $ExcludePatterns

Compress-Archive -Path $FilesToCompress.FullName -DestinationPath $DestinationZip -Force

Write-Host "Empaquetado exitoso!" -ForegroundColor Green
Write-Host "Archivo generado en: $DestinationZip" -ForegroundColor Green

# Verificación estricta de seguridad en ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($DestinationZip)
$hasViolations = $false
foreach ($entry in $zip.Entries) {
    if ($entry.FullName -like "*.env*" -or $entry.FullName -like "logs/*" -or $entry.FullName -like "*.log") {
        $hasViolations = $true
        Write-Host "ALERTA DE SEGURIDAD: Se detecto $($entry.FullName) dentro del ZIP!" -ForegroundColor Red
    }
}
$zip.Dispose()

if (-not $hasViolations) {
    Write-Host "Verificacion de seguridad: OK (Ningun archivo .env ni logs fueron incluidos)." -ForegroundColor Green
} else {
    Throw "Empaquetado cancelado debido a deteccion de artefactos no autorizados."
}
