param(
  [string]$ZipPath = "C:/Users/Admin/Downloads/ezgif-3c5f50d9f80428b1-jpg.zip",
  [string]$OutputDir = "public/assets/frames"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $OutputDir) {
  Remove-Item -LiteralPath $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
[System.IO.Compression.ZipFile]::ExtractToDirectory($ZipPath, $OutputDir)

$files = Get-ChildItem -LiteralPath $OutputDir -Filter "*.jpg" | Sort-Object Name
for ($i = 0; $i -lt $files.Count; $i++) {
  $targetName = "frame-{0:D3}.jpg" -f ($i + 1)
  Rename-Item -LiteralPath $files[$i].FullName -NewName $targetName
}
