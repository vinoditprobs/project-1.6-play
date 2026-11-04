function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('playLeads');
    if (!sheet) {
      throw new Error('The playLeads tab was not found.');
    }

    const parameters = e && e.parameter ? e.parameter : {};
    const name = String(parameters.name || '').trim();
    const email = String(parameters.email || '').trim();
    const phone = String(parameters.phoneNumber || '').trim();

    if (!name || !email || !phone) {
      return textResponse('Name, email, and phone are required.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return textResponse('A valid email address is required.');
    }
    if (phone.replace(/\D/g, '').length < 10) {
      return textResponse('A valid phone number is required.');
    }

    if (!lock.tryLock(10000)) {
      throw new Error('Could not lock the sheet. Please try again.');
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Name', 'Email', 'Phone', 'Timestamp']);
    }

    sheet.appendRow([
      safeCellText(name),
      safeCellText(email),
      safeCellText(phone),
      new Date()
    ]);
    return textResponse('Success');
  } catch (error) {
    console.error(error);
    return textResponse('Error: ' + error.message);
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function safeCellText(value) {
  return /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}

function textResponse(message) {
  return ContentService.createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT);
}
