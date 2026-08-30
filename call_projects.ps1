$token = Get-Content -Raw "C:\Users\user\Desktop\anantha-design-group\backend\design\token.txt"
$response = Invoke-RestMethod -Uri 'http://localhost:8080/api/projects?scope=my' -Headers @{ Authorization = "Bearer $token" } -Method Get -UseBasicParsing
$response | ConvertTo-Json -Depth 5 | Out-File -FilePath "C:\Users\user\Desktop\anantha-design-group\backend\design\projects_response.json" -Encoding utf8
Get-Content "C:\Users\user\Desktop\anantha-design-group\backend\design\projects_response.json" -Raw
