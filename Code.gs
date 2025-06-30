const INPUT_SHEET_ID = '1OBn4hksubMEshkPKx176i15h9CCNuh10Dk-KO6F21oc';
const JOB_CARD_SHEET_ID = '14dYfbKNgv72vGIRzUp_jqap0r2jQBPvBTUw6gQcWYKs';
const JOB_CARD_SHEET = 'Job Card';

function doGet(e) {
  if (e.parameter.page === 'dashboard') {
    return HtmlService.createHtmlOutputFromFile('Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createHtmlOutputFromFile('Form')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function getDropdownValues(sheetName) {
  const sheet = SpreadsheetApp.openById(INPUT_SHEET_ID).getSheetByName(sheetName);
  const last = sheet.getLastRow();
  if (last < 2) {
    return [];
  }
  return sheet
    .getRange(2, 1, last - 1)
    .getValues()
    .flat()
    .filter(Boolean)
    .sort();
}

function saveJobCard(data) {
  const sheet = SpreadsheetApp.openById(JOB_CARD_SHEET_ID).getSheetByName(JOB_CARD_SHEET);

  // Add logging
  Logger.log("Saving job card data: " + JSON.stringify(data));

  // Optional: validate length
  if (data.length !== 21) {
    throw new Error(`Expected 21 values but got ${data.length}. Check form fields.`);
  }

  sheet.appendRow(data);
}

function getJobCards() {
  const sheet = SpreadsheetApp.openById(JOB_CARD_SHEET_ID).getSheetByName(JOB_CARD_SHEET);
  const data = sheet.getDataRange().getValues();
  return data.map((row, i) => ({ row: i + 1, data: row }));
}

function getJobCardByRow(row) {
  const sheet = SpreadsheetApp.openById(JOB_CARD_SHEET_ID).getSheetByName(JOB_CARD_SHEET);
  return sheet.getRange(row, 1, 1, 30).getValues()[0];
}

function updateJobCard(row, data) {
  const sheet = SpreadsheetApp.openById(JOB_CARD_SHEET_ID).getSheetByName(JOB_CARD_SHEET);
  sheet.getRange(row, 1, 1, data.length).setValues([data]);
}

function generatePDF(row) {
  const template = HtmlService.createTemplateFromFile('PdfTemplate');
  const data = getJobCardByRow(row);
  template.job = data;
  const html = template.evaluate().getContent();
  const blob = Utilities.newBlob(html, 'text/html', 'JobCard.html');
  const pdf = blob.getAs(MimeType.PDF).setName('JobCard.pdf');
  const folder = DriveApp.getRootFolder();
  const file = folder.createFile(pdf);
  return file.getUrl();
}
