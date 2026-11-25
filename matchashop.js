let cart = []; try { const saved = JSON.parse(localStorage.getItem("matcha-studio-cart") || "[]"); if (Array.isArray(saved)) cart = saved.filter(item => item && typeof item.name === "string" && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0); } catch (_) {}

const siteConfig = {
    businessName: "Matcha Studio",
    tagline: "A Fresh Take on Matcha",
    description: "Handcrafted matcha drinks and delicate pastries, made for peaceful moments.",
    menuHeading: "Explore our Menu",
    aboutHeading: "About Matcha Studio",
    aboutText: "Matcha Studio is a fictional specialty café concept focused on premium matcha drinks, pastries, and a relaxing atmosphere.",
    contactEmail: "hello@matchastudio.example",
    location: "Bacoor, Cavite, Philippines (fictional)",
    currency: "PHP",
    footerText: "© 2026 Matcha Studio — Demo Website"
};

function applyBranding() {
    const elements = {
        "site-brand": siteConfig.businessName,
        "site-tagline": siteConfig.tagline,
        "site-description": siteConfig.description,
        "site-menu-heading": siteConfig.menuHeading,
        "site-about-heading": siteConfig.aboutHeading,
        "site-about-text": siteConfig.aboutText,
        "site-footer": siteConfig.footerText
    };

    // Update branding text
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });

    // Update location
    const locationElement =
        document.getElementById("site-location");

    if (locationElement) {
        locationElement.textContent = siteConfig.location;
    }

    // Update contact email
    const emailElement =
        document.getElementById("site-email");

    if (emailElement) {
        emailElement.textContent = siteConfig.contactEmail;
        emailElement.removeAttribute("href");
    }

    // Update browser title
    document.title =
        document.getElementById("login-form") ? `Log In | ${siteConfig.businessName}` : document.getElementById("booking-form") ? `Book Us | ${siteConfig.businessName}` : document.getElementById("store-map") ? `Store Locator | ${siteConfig.businessName}` : document.getElementById("menu-grid") ? `Menu | ${siteConfig.businessName}` : `${siteConfig.businessName} | Café Website Demo`;
}

let products = MatchaData.load().products;
function reconcileCart() {
    if (!MatchaData.isAvailable()) return false;
    const latest = MatchaData.load().products;
    const before = JSON.stringify(cart);
    cart = cart.flatMap(item => {
        const product = latest.find(p => p.name === item.name && p.status === 'Available');
        return product ? [{...item, price:product.price}] : [];
    });
    products = latest;
    return before !== JSON.stringify(cart);
}


// Open shopping cart
function openCart() {
    const cartDrawer = document.getElementById("cart-drawer");
    const cartBackdrop = document.getElementById("cart-backdrop");

    // Make the drawer interactive
    cartDrawer.removeAttribute("inert");
    cartDrawer.setAttribute("aria-hidden", "false");

    // Open the cart and backdrop
    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("open");

    // Move keyboard focus into the cart
    cartDrawer.querySelector(".close-cart-btn").focus();
}

// Close shopping cart
function closeCart() {
    const cartDrawer = document.getElementById("cart-drawer");
    const cartBackdrop = document.getElementById("cart-backdrop");

    // Return focus to the basket button
    document.getElementById("header-cart-btn").focus();

    // Close the cart and backdrop
    cartDrawer.classList.remove("open");
    cartBackdrop.classList.remove("open");

    // Prevent interaction with the closed cart
    cartDrawer.setAttribute("inert", "");
    cartDrawer.setAttribute("aria-hidden", "true");
}

// Animate cart button
function pulseCartBadge() {
    const cartBtn = document.getElementById("header-cart-btn");

    cartBtn.classList.remove("pulse");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("pulse");
}

// Add item to cart
function addToOrder(itemName, price) {
    const available = MatchaData.load().products.find(p => p.name === itemName && p.status === 'Available');
    if (!available) { alert('This item is no longer available.'); return; }
    price = available.price;
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: 1
        });
    }

    renderCart();
    pulseCartBadge();
}

// Increase quantity
function increaseQuantity(index) {
    if (cart[index]) {
        cart[index].quantity += 1;
    }

    renderCart();
}

// Decrease quantity
function decreaseQuantity(index) {
    if (!cart[index]) return;

    cart[index].quantity -= 1;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    renderCart();
}

// Remove item
function removeFromOrder(index) {
    cart.splice(index, 1);
    renderCart();
}

// Render cart
function renderCart() {
    try { localStorage.setItem("matcha-studio-cart", JSON.stringify(cart)); } catch (_) {}
    const cartList = document.getElementById("cart-list");
    const itemCountEl = document.getElementById("item-count");
    const totalPriceEl = document.getElementById("total-price");
    const proceedBtn = document.getElementById("proceed-checkout-btn");

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalAmount = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    itemCountEl.textContent = totalItems;
    itemCountEl.classList.toggle("hidden", totalItems === 0);

    totalPriceEl.textContent = totalAmount.toFixed(2);
    proceedBtn.disabled = cart.length === 0;

    cartList.innerHTML = "";

    if (cart.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-msg";
        emptyMessage.textContent = "Your cart is empty.";

        cartList.appendChild(emptyMessage);
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");

        // Item name and price
        const itemInfo = document.createElement("div");
        itemInfo.className = "cart-item-info";

        const itemName = document.createElement("span");
        itemName.textContent = item.name;

        const itemPrice = document.createElement("span");
        itemPrice.textContent =
            "₱" + (item.price * item.quantity).toFixed(2);

        itemInfo.append(itemName, itemPrice);

        // Controls
        const controls = document.createElement("div");
        controls.className = "cart-item-controls";

        const quantityControls = document.createElement("div");
        quantityControls.className = "quantity-controls";

        // Decrease button
        const decreaseBtn = document.createElement("button");
        decreaseBtn.type = "button";
        decreaseBtn.className = "quantity-btn";
        decreaseBtn.textContent = "−";
        decreaseBtn.setAttribute(
            "aria-label",
            "Decrease " + item.name + " quantity"
        );
        decreaseBtn.addEventListener("click", () => {
            decreaseQuantity(index);
        });

        // Quantity number
        const quantityNumber = document.createElement("span");
        quantityNumber.className = "quantity-number";
        quantityNumber.textContent = item.quantity;

        // Increase button
        const increaseBtn = document.createElement("button");
        increaseBtn.type = "button";
        increaseBtn.className = "quantity-btn";
        increaseBtn.textContent = "+";
        increaseBtn.setAttribute(
            "aria-label",
            "Increase " + item.name + " quantity"
        );
        increaseBtn.addEventListener("click", () => {
            increaseQuantity(index);
        });

        quantityControls.append(
            decreaseBtn,
            quantityNumber,
            increaseBtn
        );

        // Remove button
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => {
            removeFromOrder(index);
        });

        controls.append(quantityControls, removeBtn);
        li.append(itemInfo, controls);

        cartList.appendChild(li);
    });
}

// Open checkout
// Open checkout
async function openCheckout() {
    await MatchaAuth.ready;
    if(MatchaAuth.current()?.role!=='customer'){alert('Please sign in as a customer to place a test order.');location.href='login.html';return;}
    try { await MatchaData.refreshProducts(); } catch(error) { alert('Could not load the current catalog. Try again.'); return; }
    if (reconcileCart()) { renderCart(); alert('Your cart was updated to reflect current prices and availability. Please review it.'); return; }
    if (cart.length === 0) {
        alert("Please add an item to your order first.");
        return;
    }

    // Update the order summary
    renderCheckoutSummary();

    // Close the shopping cart
    closeCart();

    // Get the checkout dialog
    const modal = document.getElementById("checkout-modal");

    // Open the native dialog
    if (!modal.open) {
        modal.showModal();
    }

    // Move focus to the first input
    document.getElementById("full-name").focus();
}

// Close checkout
function closeCheckout() {
    const modal = document.getElementById("checkout-modal");

    // Close the native dialog
    if (modal.open) {
        modal.close();
    }

    // Return focus to the basket button
    document.getElementById("header-cart-btn").focus();
}

let checkoutReturnFocus = null;

function showCheckoutDialog() {
    const dialog = document.getElementById("checkout-modal");

    checkoutReturnFocus = document.activeElement;

    if (!dialog.open) {
        dialog.showModal();
    }

    document.getElementById("full-name").focus();
}

function hideCheckoutDialog() {
    const dialog = document.getElementById("checkout-modal");

    if (dialog.open) {
        dialog.close();
    }

    if (checkoutReturnFocus &&
        checkoutReturnFocus.isConnected &&
        !checkoutReturnFocus.closest("[inert]")) {
        checkoutReturnFocus.focus();
    } else {
        document.getElementById("header-cart-btn").focus();
    }
}

// Render checkout summary
function renderCheckoutSummary() {
    const summaryList = document.getElementById("checkout-summary");
    const checkoutTotal = document.getElementById("checkout-total");

    summaryList.innerHTML = "";

    const totalAmount = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    cart.forEach(item => {
        const li = document.createElement("li");

        const description = document.createElement("span");
        description.textContent =
            item.name + " × " + item.quantity;

        const price = document.createElement("span");
        price.textContent =
            "₱" + (item.price * item.quantity).toFixed(2);

        li.append(description, price);
        summaryList.appendChild(li);
    });

    checkoutTotal.textContent = totalAmount.toFixed(2);
}

// Place demo order
async function placeOrder(event) {
    event.preventDefault();
    const submit=event.currentTarget.querySelector('button[type="submit"]');
    if(submit.disabled)return;
    submit.disabled=true;
    try {
    await MatchaAuth.ready;
    if(MatchaAuth.current()?.role!=='customer'){alert('Sign in as a customer first.');return;}
    await MatchaData.refreshProducts();

    if (cart.length === 0) {
        alert("Please add an item to your order first.");
        closeCheckout();
        return;
    }

    const orderType = document.getElementById("order-type").value;
    if (reconcileCart()) { renderCart(); renderCheckoutSummary(); alert('The catalog changed. Please review your updated order.'); return; }
    let order;
    order = await MatchaData.placeOrder(cart, orderType);
    alert(`Test order ${order.id.slice(0,8).toUpperCase()} recorded!\nTotal: ₱${Number(order.total).toFixed(2)}\nIt is saved in the database. No payment or real purchase was made.`);

    cart = [];

    renderCart();

    document.getElementById("checkout-form").reset();

    closeCheckout();
    } catch(error) { reconcileCart();renderCart();renderCheckoutSummary();alert(`Unable to record order: ${error.message}`); }
    finally {submit.disabled=false;}
}

// Close checkout when clicking outside
document.getElementById("checkout-modal").addEventListener(
    "click",
    function(event) {
        if (event.target === this) {
            closeCheckout();
        }
    }
);


// Initial cart display
reconcileCart();
renderCart();


function renderProducts() {
    const menuGrid = document.getElementById("menu-grid");

    if (!menuGrid) return;

    menuGrid.replaceChildren();

  const visibleProducts = products.filter(product => {
    return activeCategory === "All" ||
           product.category === activeCategory;
});

visibleProducts.forEach(product => {
        // Create card
        const card = document.createElement("div");
        card.className = "menu-card";

        // Create image
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.width = 600;
        image.height = 600;
        image.loading = "lazy";
        image.decoding = "async";

        // Create product name
        const title = document.createElement("h3");
        title.textContent = product.name;

        // Create description
        const description = document.createElement("p");
        description.textContent = product.description;

        // Create price row
        const priceRow = document.createElement("div");
        priceRow.className = "price-row";

        const price = document.createElement("strong");
        price.textContent = `₱${product.price}`;

        // Create Add to Order button
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = product.status === 'Available' ? "Add to Order" : "Sold Out";
        button.disabled = product.status !== 'Available';
        if (button.disabled) card.classList.add('sold-out-card');

        button.addEventListener("click", () => {
            addToOrder(product.name, product.price);
        });

        // Assemble the product card
        priceRow.append(price, button);
        card.append(image, title, description, priceRow);

        // Add the completed card to the menu
        menuGrid.appendChild(card);
    });

}

let activeCategory = "All";

function renderCategoryFilters() {
    const container =
        document.getElementById("category-filters");

    if (!container) return;

    const categories = [
        "All",
        ...new Set(products.map(product => product.category))
    ];

    container.replaceChildren();

    categories.forEach(category => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = category;

        const isActive = category === activeCategory;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));

        button.addEventListener("click", () => {
            activeCategory = category;
            renderCategoryFilters();
            renderProducts();
        });

        container.appendChild(button);
    });
}

// Initialize the complete menu
function initializeMenu() {
    applyBranding();
    renderCategoryFilters();
    renderProducts();
}
async function refreshStorefront(){try{await MatchaData.refreshProducts();reconcileCart();renderCart();renderCategoryFilters();renderProducts();if(document.getElementById('checkout-modal').open)renderCheckoutSummary();window.dispatchEvent(new Event('matcha-catalog-updated'));}catch(error){console.warn('Catalog refresh failed:',error.message);}}
window.addEventListener('focus',refreshStorefront);
window.addEventListener('pageshow',event=>{if(event.persisted)refreshStorefront();});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMenu);
} else {
    initializeMenu();
}



/* =====================================
   MATCHA STUDIO — SHRINKING NAVBAR FIX
===================================== */

function initializeNavbarEffects() {
    const navbar = document.querySelector("header");

    if (!navbar) return;

    let isCompact = false;

    function updateNavbar() {
        const scrollPosition = window.scrollY;

        // Shrink early
        if (!isCompact && scrollPosition > 15) {
            isCompact = true;
        }

        // Expand only when near the top
        else if (isCompact && scrollPosition < 5) {
            isCompact = false;
        }

        navbar.classList.toggle(
            "is-scrolled",
            isCompact
        );
    }

    updateNavbar();

    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );
}

/* IMPORTANT: Initialize the navbar */
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeNavbarEffects
    );
} else {
    initializeNavbarEffects();
}



/* =========================================
   MATCHA STUDIO — SECTION REVEAL EFFECTS
========================================= */

function initializeSectionReveals() {
    const sections = document.querySelectorAll(
        "#menu, #about, #contact"
    );

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        prefersReducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.05,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    sections.forEach((section) => {
        observer.observe(section);
        section.classList.add("reveal-ready");
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeSectionReveals
    );
} else {
    initializeSectionReveals();
}


// ==========================================
// MATCHA STUDIO — BESTSELLERS CAROUSEL
// ==========================================


const bestsellerNames = ['Matcha Espresso Fusion','Matcha Basque Cheesecake','Iced Strawberry Matcha','Hojicha Latte'];

function initializeBestsellers() {
    const stage = document.getElementById('bestsellers-track');
    if (!stage) return;
    const details = document.getElementById('bestseller-details');
    const dots = document.getElementById('bestseller-dots');
    const featured = bestsellerNames.map(name => products.find(p => p.name === name)).filter(Boolean);
    if (!featured.length) { details.textContent='No featured products available right now.'; document.getElementById('bestsellers-prev').disabled=true; document.getElementById('bestsellers-next').disabled=true; return; }
    let active = 0, gesture = null, suppressClick = false;
    const cards = featured.map((product, index) => {
        const card = document.createElement('button');
        card.type = 'button'; card.className = 'featured-card';
        card.setAttribute('aria-label', `Feature ${product.name}`);
        const img = document.createElement('img');
        img.src = product.image; img.alt = product.name; img.draggable = false;
        card.append(img); stage.append(card);
        card.addEventListener('click', () => { if (!suppressClick) select(index); });
        return card;
    });
    const indicators = featured.map((product, index) => {
        const dot = document.createElement('button'); dot.type = 'button';
        dot.setAttribute('aria-label', `Show ${product.name}`);
        dot.addEventListener('click', () => select(index)); dots.append(dot); return dot;
    });
    function select(index) {
        active = (index + featured.length) % featured.length;
        cards.forEach((card, i) => {
            let offset = (i-active+featured.length)%featured.length;
            if (offset > 0 && offset === featured.length-1) offset = -1;
            card.dataset.position = offset;
            card.tabIndex = offset === 0 ? 0 : -1;
            card.setAttribute('aria-hidden', String(Math.abs(offset)>1));
            indicators[i].setAttribute('aria-current', String(i===active));
        });
        const original = featured[active];
        const product = MatchaData.load().products.find(p=>p.name===original.name) || {...original,status:'Unavailable'};
        const name = document.createElement('h3'); name.textContent = product.name;
        const description = document.createElement('p'); description.textContent = product.description;
        const row = document.createElement('div'); row.className = 'price-row';
        const price = document.createElement('strong'); price.textContent = `₱${product.price}`;
        row.append(price);
        if(product.status!=='Available'){const badge=document.createElement('span');badge.className='availability-badge';badge.textContent=product.status==='Sold-out'?'Sold Out':'Unavailable';row.append(badge);}
        details.replaceChildren(name,description,row);
    }
    document.getElementById('bestsellers-prev').addEventListener('click', () => select(active-1));
    document.getElementById('bestsellers-next').addEventListener('click', () => select(active+1));
    stage.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); select(active+(event.key==='ArrowLeft'?-1:1)); stage.focus(); }
    });
    stage.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        gesture = {id:event.pointerId,x:event.clientX,y:event.clientY}; suppressClick=false;
        stage.classList.add('dragging');
    });
    window.addEventListener('pointerup', event => {
        if (!gesture || event.pointerId!==gesture.id) return;
        const dx=event.clientX-gesture.x, dy=event.clientY-gesture.y;
        if (Math.abs(dx)>35 && Math.abs(dx)>Math.abs(dy)) { suppressClick=true; select(active+(dx<0?1:-1)); setTimeout(()=>suppressClick=false,100); }
        gesture=null; stage.classList.remove('dragging');
    });
    stage.addEventListener('pointercancel', () => { gesture=null; stage.classList.remove('dragging'); });
    select(0);
    window.addEventListener('matcha-catalog-updated',()=>select(active));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeBestsellers);
else initializeBestsellers();


