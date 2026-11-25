// Frontend-only inquiry preview. No personal details are stored or transmitted.
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    const choices = [...bookingForm.querySelectorAll('input[name="occasion"]')];
    const error = document.getElementById('occasion-error');
    const status = document.getElementById('booking-status');
    const submit = bookingForm.querySelector('button[type="submit"]');
    submit.disabled = false;
    choices.forEach(choice => choice.addEventListener('change', () => {
        if (choices.some(item => item.checked)) error.hidden = true;
    }));
    bookingForm.addEventListener('input', () => { status.hidden = true; });
    bookingForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!choices.some(choice => choice.checked)) {
            error.hidden = false;
            choices[0].focus();
            return;
        }
        error.hidden = true;
        status.textContent = 'Your demo inquiry is complete! No booking has been made and no information has been sent.';
        status.hidden = false;
    });
}
