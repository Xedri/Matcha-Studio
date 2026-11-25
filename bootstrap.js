'use strict';
// Wait for the catalog before the existing storefront renders.
MatchaData.ready.then(()=>{
    if(!MatchaData.isAvailable()){
        const note=document.createElement('p');note.className='database-notice';note.textContent='Database unavailable. Finish the Supabase setup or try refreshing.';document.querySelector('header.navbar')?.insertAdjacentElement('afterend',note);
    }
    const script=document.createElement('script');script.src='matchashop.js';
    document.body.append(script);
});
