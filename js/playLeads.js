
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxPi5gdFMZINccwqtp2z73rhtcyEiQzftkkoNkOajWg4aM_cS-n1lB4pLpNTrxc4c8CUQ/exec';

async function claim() {
    const name = $('name').value.trim();
    const email = $('email').value.trim();
    const phoneNumber = $('phone').value.trim();

    const error = $('formError');
    const submitButton = $('screenContent').querySelector('[data-action="claim"]');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = phoneNumber.replace(/\D/g, '');

    if (!name || !emailPattern.test(email) || phoneDigits.length < 10) {
        error.textContent = 'Please enter a valid name, email and 10-digit phone number.';
        return;
    }

    if (!GOOGLE_SHEETS_WEB_APP_URL) {
        error.textContent = 'Lead form is not configured yet. Please try again later.';
        return;
    }

    error.textContent = 'Submitting your details...';
    submitButton.disabled = true;

    try {
        await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams({
                name: name,
                email: email,
                phoneNumber: phoneNumber
            })
        });

        // no-cors cannot confirm whether the lead was saved.
        S.coins = 100;
        S.screen = 16;
        render();

    } catch (err) {
        console.error('Unable to send lead details:', err);

        error.textContent = 'Unable to submit your details. Please try again.';
        submitButton.disabled = false;
    }
}
