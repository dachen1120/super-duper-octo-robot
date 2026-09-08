[Windows.Media.SpeechSynthesis.SpeechSynthesizer,Windows.Media.SpeechSynthesis,ContentType=WindowsRuntime] | Out-Null
$s = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::new()
$s.AllVoices | ForEach-Object { Write-Output ($_.DisplayName + ' | ' + $_.Language + ' | ' + $_.Gender) }
