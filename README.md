# FHIR

## Bundle MVP

第一版交付層 MVP 已新增在 [app/fhirBundleBuilder.js](C:/Users/閻星澄/Desktop/FHIR-main/FHIR-main/app/fhirBundleBuilder.js)。

測試可直接執行：

```powershell
node app\fhirBundleBuilder.test.js
```

如果要直接用 sample input 產生 Bundle：

```powershell
node app\buildBundleDemo.js
```

輸入範例在 [sampleSessionExport.json](C:/Users/閻星澄/Desktop/FHIR-main/FHIR-main/app/sampleSessionExport.json)，輸出會寫到：

`app\sampleBundleOutput.json`

目前輸出也會包含：
- `validation_report`
- `validation_errors`
- `blocking_reasons`

## Delivery API MVP

如果要啟動本地交付層 API：

```powershell
node app\fhirDeliveryServer.js
```

預設會開在：

`http://localhost:8787`

健康檢查：

```powershell
Invoke-WebRequest http://localhost:8787/health
```

本地 dry run 交付：

```powershell
Get-Content app\sampleSessionExport.json -Raw | Invoke-RestMethod `
  -Uri http://localhost:8787/api/fhir/bundle `
  -Method Post `
  -ContentType "application/json"
```

如果要真的送 transaction Bundle 到外部 FHIR server，可先設定：

```powershell
$env:FHIR_SERVER_URL="https://your-fhir-server.example/fhir"
node app\fhirDeliveryServer.js
```

交付層測試：

```powershell
node app\fhirDeliveryServer.test.js
```
