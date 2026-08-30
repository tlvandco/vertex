$token = Get-Content -Raw "C:\Users\user\Desktop\anantha-design-group\backend\design\token.txt"
$response = Invoke-RestMethod -Uri 'http://localhost:8080/api/design-suggestions/similar?style=Minimalist&roomType=Living%20Room' -Headers @{ Authorization = "Bearer $token" } -Method Get -UseBasicParsing
$response | ConvertTo-Json -Depth 6 | Out-File -FilePath "C:\Users\user\Desktop\anantha-design-group\backend\design\similar_response.json" -Encoding utf8
Get-Content "C:\Users\user\Desktop\anantha-design-group\backend\design\similar_response.json" -Raw
