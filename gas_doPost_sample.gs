// 1. 準備你要傳送的資料 (請對應你網頁上的輸入框 ID 來取值)
// 這裡的屬性名稱 (word, translation...) 必須跟你 Apps Script 裡寫的完全一樣
const wordData = {
  word: document.getElementById('你的英文單字輸入框ID').value,
  translation: document.getElementById('你的中文翻譯輸入框ID').value,
  root: document.getElementById('你的字根分析輸入框ID').value,
  example: document.getElementById('你的例句輸入框ID').value,
  partOfSpeech: document.getElementById('你的詞性輸入框ID').value
};

// 2. 這是你 Google Apps Script 的網頁應用程式網址
// ⚠️ 極度重要：請務必換成你「重新部署」後拿到的最新 URL！
const scriptURL = 'https://script.google.com/macros/s/AKfycbzlkfEE0DaePLKHakJ52gZtXATctSz5HAT6di4hVEdAIxWjlMsUMoaiG_FzJr4bmEee/exec';

// 3. 發送 POST 請求給 Google Apps Script
fetch(scriptURL, {
  method: 'POST',
  // ⚠️ 關鍵設定：這裡必須用 text/plain 才能避開 GitHub Pages 呼叫 Google API 的 CORS 阻擋
  headers: {
    'Content-Type': 'text/plain;charset=utf-8', 
  },
  body: JSON.stringify(wordData)
})
.then(response => response.json())
.then(data => {
  // 這裡接收來自 Apps Script 的回傳值
  if (data.status === 'success') {
    alert('單字已成功同步到試算表！');
    // 你可以在這裡加上清空輸入框的代碼，例如：
    // document.getElementById('...').value = '';
  } else {
    alert('同步失敗，請稍後再試：' + data.message);
  }
})
.catch(error => {
  console.error('Fetch 發生錯誤:', error);
  alert('無法連接到試算表，請按 F12 檢查 Console 的錯誤訊息。');
});