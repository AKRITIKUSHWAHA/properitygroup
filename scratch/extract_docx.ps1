Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'd:\Kiaan Work\oct\propertygroup\client_requirements\CHANGES TO BE MADE - CRM.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlText
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

$paragraphs = $xml.SelectNodes('//w:p', $ns)
$lines = @()
foreach ($p in $paragraphs) {
    $tNodes = $p.SelectNodes('.//w:t', $ns)
    $pText = ''
    foreach ($t in $tNodes) {
        $pText += $t.InnerText
    }
    if ($pText.Trim().Length -gt 0) {
        $lines += $pText
    }
}
$lines | Out-File -FilePath 'scratch\docx_extracted_text.txt' -Encoding utf8
Write-Host "Total paragraphs extracted: $($lines.Count)"

