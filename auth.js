'use strict';
// Public, fictional demo accounts. This client-side role simulation is not security.
const MatchaAuth = (() => {
    const SESSION_KEY = 'matcha-studio-demo-session';
    const accounts = {
        customer: {email:'customer@example.test', password:'MatchaCustomer123', name:'Customer', role:'customer'},
        admin: {email:'admin@example.test', password:'MatchaAdmin123', name:'Admin', role:'admin'}
    };
    function current() {
        try {
            const role = sessionStorage.getItem(SESSION_KEY);
            return role && Object.hasOwn(accounts,role) ? {name:accounts[role].name, role} : null;
        } catch (_) { return null; }
    }
    function signIn(email,password) {
        const account = Object.values(accounts).find(item=>item.email===email.trim().toLowerCase() && item.password===password);
        if (!account) return {error:'Incorrect demo email or password.'};
        try { sessionStorage.setItem(SESSION_KEY,account.role); }
        catch (_) { return {error:'Browser session storage is unavailable. Please use a local web server.'}; }
        return {role:account.role};
    }
    function logout() { try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {} location.href='login.html'; }
    function requireAdmin() {
        if(current()?.role==='admin') return true;
        location.replace('login.html?admin=required'); return false;
    }
    function renderHistory() {
        const list=document.getElementById('history-list');
        if(!list||current()?.role!=='customer')return;
        const orders=MatchaData.load().orders.filter(order=>order.account==='customer');
        list.replaceChildren();
        if(!orders.length){const empty=document.createElement('p');empty.textContent='No orders yet. Explore the menu to place your first demo order.';list.append(empty);return;}
        for(const order of orders){
            const card=document.createElement('article');card.className='history-card';
            const header=document.createElement('div');header.className='history-card-header';
            const id=document.createElement('strong');id.textContent=order.id;
            const status=document.createElement('span');status.className='availability-badge';status.textContent=order.status;
            header.append(id,status);
            const items=document.createElement('p');items.textContent=order.items;
            const meta=document.createElement('small');meta.textContent=`${order.orderType||'Order'} · ₱${Number(order.total).toFixed(2)}`;
            card.append(header,items,meta);list.append(card);
        }
    }
    function init() {
        const user=current(), account=document.getElementById('account-link'), drawer=document.getElementById('site-drawer'), toggle=document.getElementById('nav-toggle');
        if(account) {
            document.getElementById('account-name').textContent=user?user.name:'Log In';
            account.setAttribute('aria-label',user?`${user.name} account`:'Log In');
            document.getElementById('drawer-greeting').textContent=user?`Welcome, ${user.name}.`:'Welcome to Matcha Studio.';
            const drawerAccount=document.getElementById('drawer-account');
            if(user)drawerAccount.textContent='My Account →';
            document.getElementById('drawer-admin').hidden=user?.role!=='admin';
            const signout=document.getElementById('drawer-signout');signout.hidden=!user;signout.addEventListener('click',logout);
        }
        if(drawer&&toggle) {
            toggle.addEventListener('click',()=>{drawer.showModal();toggle.setAttribute('aria-expanded','true');});
            document.getElementById('drawer-close').addEventListener('click',()=>drawer.close());
            drawer.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>drawer.close()));
            drawer.addEventListener('click',event=>{if(event.target===drawer)drawer.close();});
            drawer.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus();});
        }
        const adminSignout=document.getElementById('admin-signout');if(adminSignout){adminSignout.addEventListener('click',logout);window.addEventListener('pageshow',()=>{if(!requireAdmin())document.body.hidden=true;});}
        const form=document.getElementById('login-form');
        if(!form)return;
        const error=document.getElementById('login-error'),email=document.getElementById('login-email'),password=document.getElementById('login-password');
        const adminRequired=new URLSearchParams(location.search).get('admin')==='required';
        if(user && !(adminRequired&&user.role!=='admin')) {
            document.getElementById('login-heading').textContent='My Account';form.hidden=true;document.getElementById('demo-accounts').hidden=true;
            document.getElementById('account-panel').hidden=false;document.getElementById('profile-name').textContent=user.name;document.getElementById('profile-role').textContent=user.role==='admin'?'Demo Admin account':'Demo Customer account';
            const destination=document.getElementById('profile-destination');destination.href=user.role==='admin'?'admin.html':'index.html';destination.textContent=user.role==='admin'?'Open Admin Dashboard':'Continue Shopping';
            document.getElementById('profile-signout').addEventListener('click',logout);
            if(user.role==='customer'){document.getElementById('order-history').hidden=false;renderHistory();window.addEventListener('storage',event=>{if(event.key===MatchaData.KEY)renderHistory();});window.addEventListener('pageshow',()=>renderHistory());}
            return;
        }
        if(adminRequired){error.textContent='Please sign in with the demo Admin account to open the dashboard.';error.hidden=false;}
        form.querySelector('button[type="submit"]').disabled=false;
        document.querySelectorAll('[data-fill-account]').forEach(button=>button.addEventListener('click',()=>{const selected=accounts[button.dataset.fillAccount];email.value=selected.email;password.value=selected.password;error.hidden=true;email.focus();}));
        form.addEventListener('submit',event=>{event.preventDefault();const result=signIn(email.value,password.value);if(result.error){error.textContent=result.error;error.hidden=false;return;}location.href=result.role==='admin'?'admin.html':'index.html';});
    }
    init();
    return {current,requireAdmin,logout};
})();
