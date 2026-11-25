'use strict';
const MatchaData = (()=>{
    const client=window.supabase?.createClient(MATCHA_SUPABASE_URL,MATCHA_SUPABASE_PUBLISHABLE_KEY);
    let state={products:[],orders:[],bookings:[]};
    let available=false;
    function db(){if(!client)throw Error('Supabase could not load. Check your internet connection.');return client;}
    function result(response){if(response.error)throw Error(response.error.message);return response.data;}
    async function refreshProducts(){
        const rows=result(await db().from('products').select('*').order('created_at').order('name'));
        state.products=rows;available=true;return rows;
    }
    function normalizeOrder(row){return {...row,customer:row.customer_name,orderType:row.order_type,items:(row.order_items||[]).map(i=>`${i.product_name} × ${i.quantity}`).join(', ')};}
    async function fetchOrders(){const rows=result(await db().from('orders').select('id,customer_id,customer_name,total,status,order_type,created_at,order_items(product_name,unit_price,quantity)').order('created_at',{ascending:false}));return rows.map(normalizeOrder);}
    async function refreshAdmin(){
        const [products,orders,bookings]=await Promise.all([refreshProducts(),fetchOrders(),db().from('bookings').select('*').order('created_at',{ascending:false}).then(result)]);
        state={products,orders,bookings:bookings.map(b=>({...b,customer:b.customer_name}))};return state;
    }
    async function placeOrder(cart,orderType){
        await refreshProducts();
        const items=cart.map(item=>{const p=state.products.find(x=>x.name===item.name&&x.status==='Available');if(!p)throw Error(`${item.name} is not available.`);if(p.price!==item.price)throw Error('Prices changed. Review your updated cart.');return {product_id:p.id,quantity:item.quantity,expected_price:item.price};});
        return result(await db().rpc('place_matcha_order',{p_items:items,p_order_type:orderType}));
    }
    async function addBooking(occasions,details){const id=result(await db().rpc('submit_matcha_booking',{p_occasion:occasions.join(', '),p_details:details.trim().slice(0,500)}));return {id};}
    async function updateProduct(id,fields){result(await db().from('products').update(fields).eq('id',id).select('id').single());}
    async function addProduct(fields){result(await db().from('products').insert(fields).select('id').single());}
    async function removeProduct(id){result(await db().from('products').delete().eq('id',id).select('id').single());}
    async function setStatus(table,id,status){if(!['orders','bookings'].includes(table))throw Error('Invalid table');result(await db().from(table).update({status}).eq('id',id).select('id').single());}
    const ready=refreshProducts().catch(error=>{console.warn('Catalog unavailable:',error.message);return [];});
    return {client,ready,load:()=>state,isAvailable:()=>available,refreshProducts,refreshAdmin,fetchOrders,placeOrder,addBooking,updateProduct,addProduct,removeProduct,setStatus};
})();
