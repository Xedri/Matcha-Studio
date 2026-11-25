'use strict';
const MatchaAuth=(()=>{
    const client=MatchaData.client;
    let account=null;
    async function loadAccount(){
        account=null;if(!client)return null;
        const {data,error}=await client.auth.getUser();if(error||!data.user)return null;
        const profile=await client.from('profiles').select('id,display_name,role').eq('id',data.user.id).single();
        if(profile.error)throw Error('Account profile is not available. Check database setup.');
        account={id:profile.data.id,name:profile.data.display_name,role:profile.data.role};return account;
    }
    const ready=loadAccount().catch(error=>{console.warn(error.message);return null;});
    function current(){return account;}
    async function requireAdmin(){await ready;if(account?.role==='admin')return true;location.replace('login.html?admin=required');return false;}
    async function logout(){if(!client)return;const {error}=await client.auth.signOut();if(error){alert('Unable to sign out. Please try again.');return;}account=null;location.href='login.html';}
    async function renderHistory(){
        const list=document.getElementById('history-list');if(!list||account?.role!=='customer')return;list.textContent='Loading your orders…';
        try{const orders=await MatchaData.fetchOrders();list.replaceChildren();if(!orders.length){list.textContent='No orders yet. Explore the menu to place your first test order.';return;}
            for(const order of orders){const card=document.createElement('article');card.className='history-card';const header=document.createElement('div');header.className='history-card-header';const id=document.createElement('strong');id.textContent=order.id.slice(0,8).toUpperCase();const status=document.createElement('span');status.className='availability-badge';status.textContent=order.status;header.append(id,status);const items=document.createElement('p');items.textContent=order.items;const meta=document.createElement('small');meta.textContent=`${order.orderType} · ₱${Number(order.total).toFixed(2)}`;card.append(header,items,meta);list.append(card);}
        }catch(error){list.textContent='Unable to load order history. Try refreshing.';}
    }
    async function init(){
        const drawer=document.getElementById('site-drawer'),toggle=document.getElementById('nav-toggle');
        if(drawer&&toggle){toggle.addEventListener('click',()=>{drawer.showModal();toggle.setAttribute('aria-expanded','true');});document.getElementById('drawer-close').addEventListener('click',()=>drawer.close());drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.close()));drawer.addEventListener('click',e=>{if(e.target===drawer)drawer.close();});drawer.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus();});}
        await ready;
        const link=document.getElementById('account-link');
        if(link){document.getElementById('account-name').textContent=account?account.name:'Log In';link.setAttribute('aria-label',account?`${account.name} account`:'Log In');document.getElementById('drawer-greeting').textContent=account?`Welcome, ${account.name}.`:'Welcome to Matcha Studio.';if(account)document.getElementById('drawer-account').textContent='My Account →';document.getElementById('drawer-admin').hidden=account?.role!=='admin';const signout=document.getElementById('drawer-signout');signout.hidden=!account;signout.addEventListener('click',logout);}
        const adminSignout=document.getElementById('admin-signout');if(adminSignout){adminSignout.addEventListener('click',logout);document.getElementById('admin-account-name').textContent=account?.name||'Admin';window.addEventListener('pageshow',async event=>{if(event.persisted){await loadAccount();if(account?.role!=='admin'){document.body.hidden=true;location.replace('login.html?admin=required');}}});}
        const form=document.getElementById('login-form');if(!form)return;
        const error=document.getElementById('login-error'),email=document.getElementById('login-email'),password=document.getElementById('login-password'),submit=form.querySelector('button[type="submit"]'),signup=document.getElementById('signup-btn');
        const adminRequired=new URLSearchParams(location.search).get('admin')==='required';
        if(account&&!(adminRequired&&account.role!=='admin')){document.getElementById('login-heading').textContent='My Account';form.hidden=true;document.getElementById('account-panel').hidden=false;document.getElementById('profile-name').textContent=account.name;document.getElementById('profile-role').textContent=account.role==='admin'?'Administrator':'Customer';const dest=document.getElementById('profile-destination');dest.href=account.role==='admin'?'admin.html':'index.html';dest.textContent=account.role==='admin'?'Open Admin Dashboard':'Continue Shopping';document.getElementById('profile-signout').addEventListener('click',logout);if(account.role==='customer'){document.getElementById('order-history').hidden=false;renderHistory();document.getElementById('refresh-history').addEventListener('click',renderHistory);}return;}
        function message(text){error.textContent=text;error.hidden=false;}
        if(adminRequired)message('Please sign in with an administrator account.');
        if(!client){message('Database connection unavailable. Check your internet connection.');return;}
        submit.disabled=false;signup.disabled=false;
        form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;signup.disabled=true;error.hidden=true;try{const response=await client.auth.signInWithPassword({email:email.value.trim(),password:password.value});if(response.error)throw Error(response.error.message);await loadAccount();if(!account)throw Error('Account profile not found.');location.href=account.role==='admin'?'admin.html':'index.html';}catch(e){message(e.message);}finally{submit.disabled=false;signup.disabled=false;}});
        signup.addEventListener('click',async()=>{if(!form.reportValidity())return;if(password.value.length<8){message('Use a password of at least eight characters.');return;}submit.disabled=true;signup.disabled=true;try{const response=await client.auth.signUp({email:email.value.trim(),password:password.value,options:{emailRedirectTo:new URL('login.html',location.href).href}});if(response.error)throw Error(response.error.message);if(response.data.session){await loadAccount();location.href='index.html';}else{message('Check your email for a confirmation link, then sign in.');}}catch(e){message(e.message);}finally{submit.disabled=false;signup.disabled=false;}});
    }
    init();return {ready,current,requireAdmin,logout};
})();

const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("login-password");

togglePassword?.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePassword.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
    );
});
