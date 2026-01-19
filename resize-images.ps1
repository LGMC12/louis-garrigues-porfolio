# Image Resizer Script for Portfolio
# Creates web-optimized versions of images for better performance

Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [int]$MaxWidth,
        [int]$MaxHeight,
        [int]$Quality = 85
    )
    
    try {
        # Load the image
        $srcImage = [System.Drawing.Image]::FromFile($SourcePath)
        
        # Calculate new dimensions maintaining aspect ratio
        $ratioX = $MaxWidth / $srcImage.Width
        $ratioY = $MaxHeight / $srcImage.Height
        $ratio = [Math]::Min($ratioX, $ratioY)
        
        $newWidth = [int]($srcImage.Width * $ratio)
        $newHeight = [int]($srcImage.Height * $ratio)
        
        # Create new bitmap
        $destImage = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($destImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw resized image
        $graphics.DrawImage($srcImage, 0, 0, $newWidth, $newHeight)
        
        # Ensure destination directory exists
        $destDir = Split-Path -Parent $DestPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        # Save with quality settings
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
        
        # Check file extension and save accordingly
        $ext = [System.IO.Path]::GetExtension($DestPath).ToLower()
        if ($ext -eq ".jpg" -or $ext -eq ".jpeg") {
            $destImage.Save($DestPath, $jpegCodec, $encoderParams)
        } else {
            $destImage.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        
        # Cleanup
        $graphics.Dispose()
        $destImage.Dispose()
        $srcImage.Dispose()
        
        $srcSize = (Get-Item $SourcePath).Length / 1KB
        $destSize = (Get-Item $DestPath).Length / 1KB
        Write-Host "OK: $SourcePath -> $DestPath ($([int]$srcSize)KB -> $([int]$destSize)KB)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: Failed to resize $SourcePath - $_" -ForegroundColor Red
        return $false
    }
}

$basePath = "c:\Users\louis\Desktop\Portfolio"
$optimizedPath = "$basePath\optimized"

# Create optimized folder
if (-not (Test-Path $optimizedPath)) {
    New-Item -ItemType Directory -Path $optimizedPath -Force | Out-Null
}

Write-Host "=== Creating Thumbnails for Main Page (800x450) ===" -ForegroundColor Cyan

# Main page thumbnail images
$thumbnails = @(
    @{ Src = "Gifs & Pics/Solar Leap/AFFICHE_CRITERIUM_A0_PAYSAGE.jpg"; Dest = "optimized/thumbnails/solar-leap.jpg" },
    @{ Src = "Gifs & Pics/A Wobbly Alchemy/Level Art/AWA_Room.png"; Dest = "optimized/thumbnails/woobly-alchemy.jpg" },
    @{ Src = "Gifs & Pics/The Last Train/TLT_Title.png"; Dest = "optimized/thumbnails/iron-express.jpg" },
    @{ Src = "Gifs & Pics/Miw's Legacy/ML_Title.png"; Dest = "optimized/thumbnails/miws-legacy.jpg" },
    @{ Src = "Gifs & Pics/Magic Slimes/MS_screen.png"; Dest = "optimized/thumbnails/magic-slimes.jpg" },
    @{ Src = "Gifs & Pics/Sokochess/Screen.png"; Dest = "optimized/thumbnails/sokochess.jpg" }
)

foreach ($img in $thumbnails) {
    $srcPath = Join-Path $basePath $img.Src
    $destPath = Join-Path $basePath $img.Dest
    if (Test-Path $srcPath) {
        Resize-Image -SourcePath $srcPath -DestPath $destPath -MaxWidth 800 -MaxHeight 450 -Quality 85
    } else {
        Write-Host "SKIP: Source not found - $srcPath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Creating Banner Images for Project Pages (1920x1080) ===" -ForegroundColor Cyan

# Banner images (hero backgrounds)
$banners = @(
    @{ Src = "Gifs & Pics/Solar Leap/AFFICHE_CRITERIUM_A0_PAYSAGE.jpg"; Dest = "optimized/banners/solar-leap.jpg" }
)

foreach ($img in $banners) {
    $srcPath = Join-Path $basePath $img.Src
    $destPath = Join-Path $basePath $img.Dest
    if (Test-Path $srcPath) {
        Resize-Image -SourcePath $srcPath -DestPath $destPath -MaxWidth 1920 -MaxHeight 1080 -Quality 90
    } else {
        Write-Host "SKIP: Source not found - $srcPath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Optimized images saved to: $optimizedPath"
