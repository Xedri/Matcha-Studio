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
    bookingForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!choices.some(choice => choice.checked)) {
            error.hidden = false;
            choices[0].focus();
            return;
        }
        error.hidden = true;
        await MatchaAuth.ready;
        if(MatchaAuth.current()?.role!=='customer'){status.textContent='Please sign in as a customer before submitting your test inquiry.';status.hidden=false;return;}
        if(submit.disabled)return;
        submit.disabled=true;
        let inquiry;
        try { inquiry=await MatchaData.addBooking(choices.filter(item=>item.checked).map(item=>item.value), document.getElementById('booking-details').value); }
        catch(error) { status.textContent=`Unable to save this test inquiry: ${error.message}`; status.hidden=false; return; }
        finally {submit.disabled=false;}
        bookingForm.reset();
        status.textContent = `Test inquiry ${inquiry.id.slice(0,8).toUpperCase()} recorded in Supabase. No real booking has been made.`;
        status.hidden = false;
    });
}
