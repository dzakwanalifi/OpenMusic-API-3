# create_submission.ps1
# Script untuk membuat file submission OpenMusic API v3

Write-Host "Membuat submission OpenMusic API v3..." -ForegroundColor Green

# Nama file output
$outputFile = "open-music-api-v3.zip"

# Hapus file zip lama jika ada
if (Test-Path $outputFile) {
    Remove-Item $outputFile
    Write-Host "File zip lama berhasil dihapus" -ForegroundColor Yellow
}

# Daftar file/folder yang WAJIB ada
$requiredItems = @(
    "src",
    "migrations", 
    "package.json",
    "package-lock.json",
    ".env.example",
    "eslint.config.mjs",
    ".gitignore",
    "README.md",
    "TESTING_GUIDE.md",
    "openmusic-consumer"
)

# Daftar file/folder yang TIDAK BOLEH ada
$excludedItems = @(
    "node_modules",
    ".env",
    ".git",
    "database_cleanup.sql",
    "openmusic-consumer/node_modules",
    "openmusic-consumer/.env",
    "src/api/albums/file"
)

Write-Host "Memeriksa file yang diperlukan..." -ForegroundColor Cyan

# Cek semua file wajib
$missingItems = @()
foreach ($item in $requiredItems) {
    if (Test-Path $item) {
        Write-Host "✓ $item" -ForegroundColor Green
    } else {
        Write-Host "✗ $item TIDAK DITEMUKAN" -ForegroundColor Red
        $missingItems += $item
    }
}

# Cek file spesifik dalam consumer
$consumerRequiredItems = @(
    "openmusic-consumer/package.json",
    "openmusic-consumer/src",
    "openmusic-consumer/src/listener.js",
    "openmusic-consumer/.env.example"
)

foreach ($item in $consumerRequiredItems) {
    if (Test-Path $item) {
        Write-Host "✓ $item" -ForegroundColor Green
    } else {
        Write-Host "✗ $item TIDAK DITEMUKAN" -ForegroundColor Red
        $missingItems += $item
    }
}

# Cek file yang tidak boleh ada
$foundExcluded = @()
foreach ($item in $excludedItems) {
    if (Test-Path $item) {
        Write-Host "⚠ $item ditemukan (akan diabaikan)" -ForegroundColor Yellow
        $foundExcluded += $item
    }
}

if ($missingItems.Count -gt 0) {
    Write-Host "ERROR: File wajib tidak lengkap!" -ForegroundColor Red
    Write-Host "File yang hilang: $($missingItems -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "Membuat file zip..." -ForegroundColor Cyan

# Buat folder temp untuk menyiapkan file
$tempFolder = "temp_submission"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy file utama
foreach ($item in $requiredItems) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            # Jika folder, copy dengan exclusions
            if ($item -eq "src") {
                Copy-Item $item -Destination $tempFolder -Recurse -Force
                # Hapus folder file upload jika ada
                if (Test-Path "$tempFolder/src/api/albums/file") {
                    Remove-Item "$tempFolder/src/api/albums/file" -Recurse -Force
                }
            } elseif ($item -eq "openmusic-consumer") {
                Copy-Item $item -Destination $tempFolder -Recurse -Force
                # Hapus node_modules dan .env dari consumer
                if (Test-Path "$tempFolder/openmusic-consumer/node_modules") {
                    Remove-Item "$tempFolder/openmusic-consumer/node_modules" -Recurse -Force
                }
                if (Test-Path "$tempFolder/openmusic-consumer/.env") {
                    Remove-Item "$tempFolder/openmusic-consumer/.env" -Force
                }
            } else {
                Copy-Item $item -Destination $tempFolder -Recurse -Force
            }
        } else {
            # Jika file, copy langsung
            Copy-Item $item -Destination $tempFolder -Force
        }
    }
}

try {
    # Compress folder temp
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $outputFile -Force
    
    # Hapus folder temp
    Remove-Item $tempFolder -Recurse -Force
    
    Write-Host "✓ File zip berhasil dibuat: $outputFile" -ForegroundColor Green
    
    # Tampilkan informasi ukuran file
    $fileSize = (Get-Item $outputFile).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "Ukuran file: $fileSizeMB MB" -ForegroundColor Cyan
    
    Write-Host "Submission siap untuk dikirim!" -ForegroundColor Green
    Write-Host "File: $outputFile" -ForegroundColor Green
    
} catch {
    Write-Host "ERROR: Gagal membuat zip file" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force
    }
    exit 1
}

Write-Host ""
Write-Host "CHECKLIST FINAL OPENMUSIC API V3:" -ForegroundColor Green
Write-Host "✓ Folder node_modules TIDAK disertakan" -ForegroundColor Green
Write-Host "✓ File .env TIDAK disertakan" -ForegroundColor Green
Write-Host "✓ File .env.example DISERTAKAN" -ForegroundColor Green
Write-Host "✓ File package.json dan package-lock.json DISERTAKAN" -ForegroundColor Green
Write-Host "✓ Folder src dan migrations DISERTAKAN" -ForegroundColor Green
Write-Host "✓ File README.md DISERTAKAN" -ForegroundColor Green
Write-Host "✓ File TESTING_GUIDE.md DISERTAKAN" -ForegroundColor Green
Write-Host "✓ Folder openmusic-consumer DISERTAKAN" -ForegroundColor Green
Write-Host "✓ Consumer node_modules TIDAK disertakan" -ForegroundColor Green
Write-Host "✓ Consumer .env TIDAK disertakan" -ForegroundColor Green
Write-Host "✓ Consumer .env.example DISERTAKAN" -ForegroundColor Green
Write-Host "✓ Upload folder (src/api/albums/file) TIDAK disertakan" -ForegroundColor Green
Write-Host ""
Write-Host "FITUR V3 YANG DISERTAKAN:" -ForegroundColor Cyan
Write-Host "Album Cover Upload" -ForegroundColor Cyan
Write-Host "Album Likes dengan Caching" -ForegroundColor Cyan
Write-Host "Playlist Export (Asynchronous)" -ForegroundColor Cyan
Write-Host "Consumer Service untuk Email" -ForegroundColor Cyan
Write-Host "Redis Caching" -ForegroundColor Cyan
Write-Host "RabbitMQ Message Queue" -ForegroundColor Cyan
