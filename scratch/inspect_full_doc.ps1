Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'd:\Kiaan Work\oct\propertygroup\client_requirements\CHANGES TO BE MADE - CRM.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($entry in $zip.Entries) {
    Write-Host "$($entry.FullName) ($($entry.Length) bytes)"
}
$entryDoc = $zip.GetEntry('word/document.xml')
$reader = New-Object System.IO.StreamReader($entryDoc.Open())
$docXml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

# Save entire docXml formatted
[System.IO.File]::WriteAllText('scratch/full_document.xml', $docXml)
Write-Host "Length of document.xml: $($docXml.Length)"

