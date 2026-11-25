// Example city-center locations, not actual stores. Replace with verified branches before publishing.
const demoStores = [
    {name:'Matcha Studio — Bacoor', city:'Bacoor', address:'Bacoor, Cavite', hours:'8:00 AM – 9:00 PM', lat:14.4590, lon:120.9645},
    {name:'Matcha Studio — Imus', city:'Imus', address:'Imus, Cavite', hours:'9:00 AM – 8:00 PM', lat:14.4297, lon:120.9368},
    {name:'Matcha Studio — Dasmariñas', city:'Dasmariñas', address:'Dasmariñas, Cavite', hours:'9:00 AM – 9:00 PM', lat:14.3294, lon:120.9399}
];

function initializeStoreLocator() {
    const search = document.getElementById('store-search');
    const list = document.getElementById('store-list');
    const count = document.getElementById('store-count');
    const map = document.getElementById('store-map');
    const mapName = document.getElementById('map-name');
    const mapAddress = document.getElementById('map-address');
    const mapLink = document.getElementById('map-link');
    let selected = null;

    function select(store) {
        if (selected === store) return;
        selected = store;
        const {lat, lon} = store;
        const bbox = [lon-.022, lat-.014, lon+.022, lat+.014].join(',');
        map.src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
        mapName.textContent = store.name;
        mapAddress.textContent = `${store.address} · approximate sample area`;
        mapLink.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
        mapLink.hidden = false;
        list.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.city === store.city)));
    }

    function render() {
        const query = search.value.trim().toLocaleLowerCase();
        const stores = demoStores.filter(store => `${store.name} ${store.address}`.toLocaleLowerCase().includes(query));
        count.textContent = `${stores.length} sample ${stores.length === 1 ? 'location' : 'locations'}`;
        list.replaceChildren();
        if (!stores.length) {
            const message = document.createElement('p'); message.className = 'locator-empty';
            message.textContent = 'No matching stores. Try Bacoor, Imus, or Dasmariñas.'; list.append(message);
            selected = null; map.removeAttribute('src'); mapName.textContent = 'No matching locations'; mapAddress.textContent = ''; mapLink.hidden = true;
            return;
        }
        for (const store of stores) {
            const card = document.createElement('button'); card.type = 'button'; card.className = 'locator-store-card'; card.dataset.city = store.city;
            card.setAttribute('aria-pressed', String(selected === store));
            const pin = document.createElement('span'); pin.className = 'store-pin'; pin.setAttribute('aria-hidden','true'); pin.textContent = '●';
            const body = document.createElement('span'); body.className = 'store-card-body';
            const name = document.createElement('strong'); name.textContent = store.name;
            const address = document.createElement('span'); address.textContent = store.address;
            const hours = document.createElement('span'); hours.className = 'store-hours'; hours.textContent = `◷  ${store.hours} (sample)`;
            const action = document.createElement('span'); action.className = 'store-card-action'; action.textContent = 'View on map →';
            body.append(name,address,hours,action); card.append(pin,body); list.append(card);
            card.addEventListener('click', () => select(store));
        }
        if (!stores.includes(selected)) select(stores[0]);
    }
    search.addEventListener('input', render);
    render();
}
initializeStoreLocator();
