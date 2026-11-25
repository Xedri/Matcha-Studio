'use strict';
// Browser-local portfolio data only. There is no server or private database.
const MatchaData = (() => {
    const KEY = 'matcha-studio-admin-demo-v1';
    const catalog = [
        ['Ceremonial Matcha Latte','Matcha',165,'Ceremonial matcha whisked with silky milk.','https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=500&q=80'],
        ['Iced Strawberry Matcha','Matcha',185,'Fresh strawberry sweetness layered with creamy milk and matcha.','https://i.pinimg.com/736x/2f/54/1a/2f541a46d086d366dd3f226a6eec7291.jpg'],
        ['Matcha Espresso Fusion','Matcha',195,'Earthy matcha and bold espresso layered over creamy milk.','https://i.pinimg.com/736x/96/a1/9d/96a19d4353c8eebf2c96dbb023a9fd1a.jpg'],
        ['Hojicha Latte','Tea',160,'Rich roasted Japanese green tea blended with creamy milk.','https://i.pinimg.com/1200x/f8/4b/e7/f84be7206baddc3d0132d0aa61a62adb.jpg'],
        ['Yuzu Green Tea','Tea',155,'Refreshing green tea brightened with fragrant Japanese yuzu.','https://i.pinimg.com/1200x/24/e7/f1/24e7f1797bcdc99d67ba297fe8d90435.jpg'],
        ['Matcha Basque Cheesecake','Pastries',190,'Creamy matcha cheesecake with a caramelized Basque-style top.','https://i.pinimg.com/736x/55/ad/76/55ad76687970be4e4d4fc7ca81086029.jpg'],
        ['Matcha White Chocolate Cookie','Pastries',95,'Soft-baked matcha cookie with creamy white chocolate.','https://i.pinimg.com/1200x/ff/5b/40/ff5b407faff74f628c146d87ceacd45d.jpg'],
        ['Butter Croissant','Pastries',105,'Flaky, buttery golden croissant.','https://i.pinimg.com/736x/30/98/b3/3098b37993867ed5b37bd686d463ca4b.jpg']
    ].map(([name,category,price,description,image],i)=>({id:`P-${i+1}`,name,category,price,description,image,status:'Available'}));
    function seed() {return {
        orders:[
            {id:'MS-1008',customer:'Guest A',items:'Iced Strawberry Matcha × 2',total:370,status:'Pending'},
            {id:'MS-1007',customer:'Guest B',items:'Matcha Espresso Fusion × 1',total:195,status:'Preparing'},
            {id:'MS-1006',customer:'Guest C',items:'Matcha Basque Cheesecake × 2',total:380,status:'Completed'},
            {id:'MS-1005',customer:'Guest D',items:'Hojicha Latte × 2',total:320,status:'Completed'},
            {id:'MS-1004',customer:'Guest E',items:'Ceremonial Matcha Latte × 3',total:495,status:'Completed'},
            {id:'MS-1003',customer:'Guest F',items:'Yuzu Green Tea × 1',total:155,status:'Cancelled'}
        ],
        products:catalog.map(p=>({...p})),
        bookings:[{id:'BK-101',customer:'Sample Client A',occasion:'Corporate Event',details:'40 guests · beverage cart',status:'Pending'},{id:'BK-102',customer:'Sample Client B',occasion:'Birthday',details:'20 guests · matcha bar',status:'Pending'},{id:'BK-103',customer:'Sample Client C',occasion:'Wedding, Party',details:'60 guests · drinks & pastries',status:'Confirmed'}]
    };}
    function load(){
        try {const data=JSON.parse(localStorage.getItem(KEY));if(data && ['orders','products','bookings'].every(k=>Array.isArray(data[k]))) {
            data.products=data.products.map(p=>({...catalog.find(item=>item.name===p.name),...p,description:p.description||catalog.find(item=>item.name===p.name)?.description||'A new addition to the Matcha Studio collection.',image:p.image||catalog.find(item=>item.name===p.name)?.image||'product-placeholder.svg'}));
            return data;
        }}catch(_){}return seed();
    }
    function save(data){localStorage.setItem(KEY,JSON.stringify(data));}
    function update(action){const data=load();const result=action(data);save(data);return result;}
    function id(prefix){return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;}
    function placeOrder(cart,user,orderType){return update(data=>{
        if(!cart.length)throw Error('Your cart is empty.');
        const items=cart.map(item=>{const product=data.products.find(p=>p.name===item.name);if(!product||product.status!=='Available')throw Error(`${item.name} is no longer available.`);return {name:product.name,price:product.price,quantity:item.quantity};});
        const order={id:id('MS'),customer:user?.name||'Guest',account:user?.role==='customer'?'customer':null,items:items.map(i=>`${i.name} × ${i.quantity}`).join(', '),total:items.reduce((sum,i)=>sum+i.price*i.quantity,0),orderType,status:'Pending',createdAt:new Date().toISOString()};
        data.orders.unshift(order);return order;
    });}
    function addBooking(user,occasions,details){return update(data=>{const booking={id:id('BK'),customer:user?.name||'Guest',occasion:occasions.join(', '),details:details.trim().slice(0,500)||'No additional details.',status:'Pending',createdAt:new Date().toISOString()};data.bookings.unshift(booking);return booking;});}
    return {KEY,seed,load,save,update,placeOrder,addBooking};
})();
