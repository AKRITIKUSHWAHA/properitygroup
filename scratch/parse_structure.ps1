Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'd:\Kiaan Work\oct\propertygroup\client_requirements\CHANGES TO BE MADE - CRM.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

# Read rels
$entryRels = $zip.GetEntry('word/_rels/document.xml.rels')
$reader = New-Object System.IO.StreamReader($entryRels.Open())
$relsXml = [xml]$reader.ReadToEnd()
$reader.Close()

$relMap = @{}
foreach ($rel in $relsXml.Relationships.Relationship) {
    $relMap[$rel.Id] = $rel.Target
}

# Read document.xml
$entryDoc = $zip.GetEntry('word/document.xml')
$reader = New-Object System.IO.StreamReader($entryDoc.Open())
$docXml = [xml]$reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

$ns = New-Object System.Xml.XmlNamespaceManager($docXml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$ns.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
$ns.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

$pNodes = $docXml.SelectNodes('//w:p', $ns)
$output = @()
$idx = 0
foreach ($p in $pNodes) {
    $idx++
    $text = ($p.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join ''
    $blips = $p.SelectNodes('.//a:blip', $ns)
    $imgs = @()
    foreach ($blip in $blips) {
        $embedId = $blip.GetAttribute('embed', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        if ($embedId -and $relMap.ContainsKey($embedId)) {
            $imgs += $relMap[$embedId]
        }
    }
    if ($text.Trim() -or $imgs.Count -gt 0) {
        $output += "P${idx}: Text = '$text'"
        if ($imgs.Count -gt 0) {
            $output += "      Images = $($imgs -join ', ')"
        }
    }
}

$output | Out-File -FilePath 'scratch/doc_structure.txt' -Encoding utf8
Get-Content 'scratch/doc_structure.txt'
