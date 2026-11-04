const GOOGLE_SHEETS_WEB_APP_URL='https://script.google.com/macros/s/AKfycbytD__3RVtIrjYmtfG4-4fgLO-Qoj4-4Ks8_olxDXRyVOorsFqOtdK71C_MbX9V4tzf9A/exec'; // Set this to the deployed Apps Script web app URL.

async function claim(){
  const name=$('name').value.trim();
  const email=$('email').value.trim();
  const phoneNumber=$('phone').value.trim();
  const error=$('formError');
  const submitButton=$('screenContent').querySelector('[data-action="claim"]');

  if(!name||!email||!email.includes('@')||!phoneNumber||phoneNumber.replace(/\D/g,'').length<10){
    error.textContent='Please enter a valid name, email and 10-digit phone number.';
    return;
  }
  if(!GOOGLE_SHEETS_WEB_APP_URL){
    error.textContent='Lead form is not configured yet. Please try again later.';
    return;
  }

  error.textContent='Submitting your details...';
  submitButton.disabled=true;
  try{
    await fetch(GOOGLE_SHEETS_WEB_APP_URL,{
      method:'POST',
      mode:'no-cors',
      body:new URLSearchParams({name,email,phoneNumber})
    });
    S.coins=100;
    S.screen=16;
    render();
  }catch(err){
    console.error('Unable to send lead details to Google Sheets.',err);
    error.textContent='We could not send your details. Please check your connection and try again.';
    submitButton.disabled=false;
  }
}
