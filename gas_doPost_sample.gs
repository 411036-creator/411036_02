function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('1rRmiuhBUG-gQXmZ-M5l7rMsYMiZx24h_Fp9CGtmPgbE').getSheetByName('單字表');
    if (!sheet) {
      throw new Error('找不到名稱為 單字表 的工作表');
    }

    const row = [
      new Date(),
      data.word || '',
      data.translation || '',
      data.root || '',
      data.example || '',
      data.partOfSpeech || ''
    ];
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
