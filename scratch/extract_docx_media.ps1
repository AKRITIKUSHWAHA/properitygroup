Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('client_requirements/CHANGES TO BE MADE - CRM.docx')
foreach ($entry in $zip.Entries) {
    if ($entry.FullName.StartsWith('word/media/')) {
        $dest = Join-Path 'scratch' ([System.IO.Path]::GetFileName($entry.FullName))
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
        Write-Host "$($entry.FullName) -> $dest ($($entry.Length) bytes)"
    }
}
$zip.Dispose()

