Project Structure
=================

Project: The Elevator Pitch Game

Directory Layout:
-----------------

Play/
├── index.html              Main HTML file
├── css/
│   └── style.css           All stylesheets
├── js/
│   └── script.js           All JavaScript logic
├── images/                 Image assets folder
│   ├── character-1.svg     Character SVG
│   └── lift-lobby-background.svg  Lobby background SVG
└── README.md               This file

Key Features:
-------------
- Separated CSS into css/style.css
- Separated JavaScript into js/script.js
- Organized images in images/ folder
- Clean HTML with external references
- Easy to maintain and update

Files Description:
------------------

1. index.html
   - Clean HTML markup
   - References external CSS and JS
   - Minimal inline code

2. css/style.css
   - All styling and responsive design
   - CSS variables for theme colors
   - Minified for performance

3. js/script.js
   - Game logic and functionality
   - DOM manipulation
   - Event handlers and state management
   - Image paths point to images/ folder

4. images/
   - SVG assets for characters and backgrounds
   - Note: Move SVG files here from root if needed






playLeads.gs
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('playLeads');
    const name = e.parameter.name;
    const email = e.parameter.email;
    const phone = e.parameter.phoneNumber;
    const timestamp = new Date();

    if (!name || !email || !phone) {
      return ContentService.createTextOutput("Name and Email are required")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Check duplicate by email (Column B)
    const data = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues().flat();
    if (data.includes(email)) {
      return ContentService.createTextOutput("Lead Already Exists")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Append row [Name, Email, Phone, Timestamp]
    sheet.appendRow([name, email, phone, timestamp]);

    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
