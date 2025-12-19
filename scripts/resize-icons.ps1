# PowerShell Icon Resizer Script
# Resizes PNG icons to 256x256 for Linux builds
# Usage: .\scripts\resize-icons.ps1

Write-Host "🎨 Icon Resizer for Linux Builds" -ForegroundColor Cyan
Write-Host ""

# Check if ImageMagick is installed
$magickExists = Get-Command "magick" -ErrorAction SilentlyContinue

if (-not $magickExists) {
    Write-Host "⚠️  ImageMagick not found. Installing via Chocolatey..." -ForegroundColor Yellow
    
    # Check if Chocolatey is installed
    $chocoExists = Get-Command "choco" -ErrorAction SilentlyContinue
    
    if (-not $chocoExists) {
        Write-Host "❌ Chocolatey not found. Please install ImageMagick manually:" -ForegroundColor Red
        Write-Host "   Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
        Write-Host "   Or install Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternative: Run 'node scripts/resize-icons.js' instead" -ForegroundColor Cyan
        exit 1
    }
    
    choco install imagemagick -y
    $magickExists = Get-Command "magick" -ErrorAction SilentlyContinue
    
    if (-not $magickExists) {
        Write-Host "❌ Failed to install ImageMagick" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ ImageMagick found" -ForegroundColor Green
Write-Host ""

# Define icons to resize
$icons = @(
    @{
        Input = "assets\icon.png"
        Output = "assets\icon-256.png"
        Size = 256
    },
    @{
        Input = "public\icon.png"
        Output = "public\icon-256.png"
        Size = 256
    }
)

$successCount = 0
$failCount = 0

foreach ($icon in $icons) {
    $inputPath = Join-Path $PSScriptRoot "..\$($icon.Input)"
    $outputPath = Join-Path $PSScriptRoot "..\$($icon.Output)"
    
    if (-not (Test-Path $inputPath)) {
        Write-Host "⚠️  Not found: $($icon.Input)" -ForegroundColor Yellow
        $failCount++
        continue
    }
    
    Write-Host "📸 Processing: $($icon.Input)" -ForegroundColor Cyan
    
    try {
        # Resize with ImageMagick
        $size = "$($icon.Size)x$($icon.Size)"
        magick convert "$inputPath" -resize $size -background none -gravity center -extent $size "$outputPath"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Created: $($icon.Output)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ Failed to resize: $($icon.Input)" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

Write-Host "📊 Summary: $successCount successful, $failCount failed" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "💡 Tip: Update package.json linux.icon to 'assets/icon-256.png'" -ForegroundColor Yellow
}

exit $failCount
