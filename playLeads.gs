function doPost(e) {
  try {
    console.log('PlayLeads POST received');

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('PlayLeads');

    if (!sheet) {
      throw new Error('PlayLeads sheet not found');
    }

    if (!e || !e.parameter) {
      throw new Error('POST parameters missing');
    }

    const name = String(e.parameter.name || '').trim();
    const email = String(e.parameter.email || '').trim();
    const phone = String(e.parameter.phoneNumber || '').trim();

    console.log(JSON.stringify({ name, email, phone }));

    if (!name || !email || !phone) {
      throw new Error('All fields are required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email');
    }

    if (phone.replace(/\D/g, '').length < 10) {
      throw new Error('Invalid phone number');
    }

    const nextRow = Math.max(sheet.getLastRow() + 1, 2);

    sheet.getRange(nextRow, 1, 1, 4).setValues([[
      safeCellText(name),
      safeCellText(email),
      safeCellText(phone),
      new Date()
    ]]);

    SpreadsheetApp.flush();

    console.log('Lead saved successfully at row ' + nextRow);

    return ContentService.createTextOutput('Success');

  } catch (error) {
    console.error('PlayLeads error: ' + error.message);

    return ContentService.createTextOutput(
      'Error: ' + error.message
    );
  }
}

function safeCellText(value) {
  return /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}