param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"

Write-Host "Fuerza UPT static architecture gate check" -ForegroundColor Cyan

$targets = @(
    "$Root/src/main/java",
    "$Root/src/main/resources",
    "$Root/pom.xml"
) | Where-Object { Test-Path $_ }

$forbiddenPatterns = @(
    "JdbcTemplate",
    "NamedParameterJdbcTemplate",
    "JdbcClient",
    "org.springframework.jdbc",
    "java.sql.",
    "RowMapper",
    "ResultSet",
    "DriverManager",
    "spring-session-jdbc",
    "store-type: jdbc",
    "flyway-core",
    "flyway-database-postgresql"
)

$violations = @()
foreach ($pattern in $forbiddenPatterns) {
    $matches = Select-String -Path ($targets | ForEach-Object {
        if (Test-Path $_ -PathType Container) { Get-ChildItem $_ -Recurse -File | Select-Object -ExpandProperty FullName }
        else { $_ }
    }) -Pattern $pattern -SimpleMatch -ErrorAction SilentlyContinue
    if ($matches) { $violations += $matches }
}

if ($violations.Count -gt 0) {
    Write-Host "`n[FAIL] JDBC or Flyway forbidden patterns found:" -ForegroundColor Red
    $violations | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
    exit 1
}

Write-Host "[PASS] Zero explicit JDBC and zero Flyway dependencies." -ForegroundColor Green

$unsafeFiles = Get-ChildItem "$Root" -Recurse -File -Include "migration-script-supabase.sql", "generate_backend.ps1", "generate_service.ps1" -ErrorAction SilentlyContinue
if ($unsafeFiles) {
    Write-Host "`n[FAIL] Temporary or generator scripts found:" -ForegroundColor Red
    $unsafeFiles | ForEach-Object { Write-Host $_.FullName }
    exit 1
}

Write-Host "[PASS] Zero temporary database scripts or legacy generators." -ForegroundColor Green

$legacyPatterns = @("noticias", "migrationStatus", "originalSource")
$legacy = @()
$sourceFiles = @()
if (Test-Path "$Root/src/main") { $sourceFiles = Get-ChildItem "$Root/src/main" -Recurse -File | Select-Object -ExpandProperty FullName }
foreach ($pattern in $legacyPatterns) {
    $matches = Select-String -Path $sourceFiles -Pattern $pattern -SimpleMatch -ErrorAction SilentlyContinue
    if ($matches) { $legacy += $matches }
}

if ($legacy.Count -gt 0) {
    Write-Host "`n[WARN] Legacy/residual terms found:" -ForegroundColor Yellow
    $legacy | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
} else {
    Write-Host "[PASS] Zero legacy terms (noticias, migrationStatus, originalSource) found." -ForegroundColor Green
}

Write-Host "`n[SUMMARY] Architecture Gate PASSED. No tests were run or created." -ForegroundColor Green
