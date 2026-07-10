# PowerShell script to compress large images using .NET classes
Add-Type -AssemblyName System.Drawing

function Compress-Image {
    param(
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$MaxWidth = 1600,
        [int]$Quality = 80
    )
    
    if (-not (Test-Path $SourcePath)) {
        Write-Host "Source image not found: $SourcePath"
        return
    }

    Write-Host "Compressing $SourcePath..."
    
    # Load image
    $img = [System.Drawing.Image]::FromFile($SourcePath)
    
    # Calculate new dimensions
    $width = $img.Width
    $height = $img.Height
    
    if ($width -gt $MaxWidth) {
        $ratio = $MaxWidth / $width
        $width = $MaxWidth
        $height = [int]($height * $ratio)
    }
    
    # Create new bitmap
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Set high quality rendering settings
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw original image onto the resized canvas
    $g.DrawImage($img, 0, 0, $width, $height)
    
    # Set JPEG encoder & quality parameter
    $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
    $jpegEncoder = $encoders | Where-Object { $_.FormatDescription -eq "JPEG" }
    
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality, 
        [int64]$Quality
    )
    
    # Save image
    $bmp.Save($TargetPath, $jpegEncoder, $encoderParams)
    
    # Clean up resources
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    
    $oldSize = (Get-Item $SourcePath).Length / 1MB
    $newSize = (Get-Item $TargetPath).Length / 1MB
    Write-Host "Saved to $TargetPath. Compressed from $($oldSize.ToString('F2')) MB to $($newSize.ToString('F2')) MB."
}

# Compress our images
Compress-Image -SourcePath "C:\Cake Factory\assets\062A6469.jpg" -TargetPath "C:\Cake Factory\assets\062A6469_opt.jpg" -MaxWidth 1600 -Quality 80
Compress-Image -SourcePath "C:\Cake Factory\assets\062A6916.jpg" -TargetPath "C:\Cake Factory\assets\062A6916_opt.jpg" -MaxWidth 1600 -Quality 80
