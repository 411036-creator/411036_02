# 單字資料管理 + Google Apps Script 後端整合指南

## 目的
建立一個管理者專用的單字資料表單，填完資料後按「儲存單字」，前端會把資料送到 Google Apps Script（GAS）後端，後端再把資料寫入 Google 試算表。

---

## 1. 前端：新增表單欄位

1. 打開 `index.html`
2. 將原本的單字卡表單改成五個欄位：
   - 英文單字 (`inputWord`)
   - 中文翻譯 (`inputTranslation`)
   - 字根分析 (`inputRoot`)
   - 例句 (`inputExample`)
   - 詞性 (`inputPOS`)
3. 新增兩個狀態顯示區：
   - `translateStatus`：顯示自動翻譯狀態
   - `submitStatus`：顯示送出後端狀態
4. 儲存按鈕標題改成 `儲存單字`

---

## 2. 前端：設定資料模型與送出邏輯

1. 打開 `script.js`
2. 調整 DOM 資料綁定：
   - `document.getElementById('inputWord')`
   - `document.getElementById('inputTranslation')`
   - `document.getElementById('inputRoot')`
   - `document.getElementById('inputExample')`
   - `document.getElementById('inputPOS')`
   - `document.getElementById('submitStatus')`
3. 在 `saveCard()` 方法中，改為保存以下欄位：
   - `word`
   - `translation`
   - `root`
   - `example`
   - `partOfSpeech`
4. 儲存後仍保留本機 LocalStorage 功能，確保資料先存在使用者端。
5. 新增 `postWordEntry(entry)` 方法，使用 `fetch()` 將 JSON POST 到 GAS API：
   - `Content-Type: application/json`
   - `body: JSON.stringify(entry)`
6. 如果後端送出成功，顯示成功狀態；若失敗，仍保留本機資料並顯示錯誤提醒。

---

## 3. 前端：自動翻譯功能

1. `lookupTranslation()` 會讀取 `inputWord` 的內容
2. 如果欄位是字母，則呼叫翻譯 API
3. 取得翻譯後，自動填入 `inputTranslation`
4. 管理者仍可以自行修改翻譯內容

---

## 4. 後端：建立 Google Apps Script（已填入你的試算表 ID）

1. 你提供的試算表 ID：

   `1rRmiuhBUG-gQXmZ-M5l7rMsYMiZx24h_Fp9CGtmPgbE`

2. 在 Google Drive 中建立新的 Apps Script 專案，或在 https://script.google.com 新增專案
3. 在 script 編輯器裡貼上以下程式碼（範例已替換為你的試算表 ID）：

```js
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const sheet = SpreadsheetApp.openById('1rRmiuhBUG-gQXmZ-M5l7rMsYMiZx24h_Fp9CGtmPgbE').getSheetByName('單字表')
    if (!sheet) {
      throw new Error('找不到名稱為 單字表 的工作表')
    }

    const row = [
      new Date(),
      data.word || '',
      data.translation || '',
      data.root || '',
      data.example || '',
      data.partOfSpeech || ''
    ]
    sheet.appendRow(row)

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
```

4. 在試算表中建立工作表，名稱設定為 `單字表`
5. 建議欄位順序：
   - 時間
   - 英文單字
   - 中文翻譯
   - 字根分析
   - 例句
   - 詞性

---

## 5. 後端：部署為網頁應用程式

1. 點選 Apps Script 編輯器右上角的「部署」
2. 選擇「新增部署」
3. 部署類型選「網頁應用程式（Web app）」或類似名稱
4. 存取權限設定：
   - 若要讓前端直接呼叫，臨時可選「任何人，包括匿名使用者」；若要安全，可用 OAuth 或授權帳號代理
5. 完成部署後，複製部署的網址（類似 `https://script.google.com/macros/s/ABCDEFG.../exec`）
6. 將 `script.js` 裡的 `GAS_API_URL` 改成此部署網址

---

## 6. 測試流程

1. 開啟 `index.html`（或在本機開啟 `index.html`）
2. 輸入：英文單字、中文翻譯、字根分析、例句、詞性
3. 按下 `儲存單字`
4. 若部署正確，`postWordEntry()` 會向 Apps Script 發出 POST，Apps Script 會把資料寫入你提供的試算表
5. 你也可以用 `curl` 測試已部署的 URL：

```bash
curl -X POST 'https://script.google.com/macros/s/AKfycbzT2TSdYZ38QHoXAoPoZ4siKRQY7jhA6o4H1zNCDtqy0GKqXu9awnwt89Lv1Naq216Q/exec' \
  -H 'Content-Type: application/json' \
  -d '{"word":"test","translation":"測試","root":"test-root","example":"This is a test.","partOfSpeech":"noun"}'
```

---

## 7. 注意事項

- `GAS_API_URL` 必須替換成你實際部署出的 Apps Script 網址。
- 若後端仍無法連線，請檢查 Apps Script 部署權限、試算表 ID、以及是否啟用了 `doPost()`。
- 若你想要更完整的安全控管，可以在 GAS 端加入驗證機制或設定 OAuth。

---

## 8. 進階建議

- 若要在後端加上欄位驗證，可在 `doPost()` 裡增加 `data.word` 與 `data.translation` 的檢查。
- 若要取得更穩定翻譯，建議改用自己申請的翻譯 API 或 Google Translate API。
- 若要將資料轉成正式字庫，建議在試算表中再新增 `來源`、`難度`、`標籤`。
