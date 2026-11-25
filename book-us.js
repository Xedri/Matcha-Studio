// Demo inquiry is recorded in browser-local dashboard data; contact details are not saved.
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
        let inquiry;
        try { inquiry=MatchaData.addBooking(MatchaAuth.current(), choices.filter(item=>item.checked).map(item=>item.value), document.getElementById('booking-details').value); }
        catch(error) { status.textContent='Unable to save this demo inquiry. Please check browser storage.'; status.hidden=false; return; }
        bookingForm.reset();
        status.textContent = `Demo inquiry ${inquiry.id} recorded! It is visible in the Admin Dashboard. No real booking has been made.`;
        status.hidden = false;
    });
}
