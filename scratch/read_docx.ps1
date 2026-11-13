Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('client_requirements/CHANGES TO BE MADE - CRM.docx')
$entry = $zip.GetEntry('word/document.xml')
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$zip.Dispose()
$text = [regex]::Replace($xml, '<[^>]+>', ' ')
$text | Set-Content -Path 'scratch/docx_text.txt'
Write-Host "Extracted length: $($text.Length)"

