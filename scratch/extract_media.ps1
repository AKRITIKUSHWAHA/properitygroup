Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'd:\Kiaan Work\oct\propertygroup\client_requirements\CHANGES TO BE MADE - CRM.docx'
$destDir = 'd:\Kiaan Work\oct\propertygroup\scratch\docx_media'
if (Test-Path $destDir) { Remove-Item -Recurse -Force $destDir }
New-Item -ItemType Directory -Path $destDir -Force | Out-Null

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($entry in $zip.Entries) {
    if ($entry.FullName.StartsWith('word/media/')) {
        $fileName = [System.IO.Path]::GetFileName($entry.FullName)
        $targetPath = Join-Path $destDir $fileName
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetPath, $true)
        Write-Host "Extracted: $fileName"
    }
}
$zip.Dispose()

