Matcha Studio — Customization Guide
This guide explains how to adapt the Matcha Studio café website for a different fictional concept or a real client. It assumes your site uses the siteConfig object, the products array, applyBranding(), renderCategoryFilters(), and renderProducts() from the Brew & Co. lessons.
Before editing: Commit or copy a known-working version. Keep the current filenames unchanged unless you deliberately update every reference. Test locally before pushing to GitHub Pages.

1. Locate your project files
- HTML: matchashop.html (the main page visible in your screenshot)
- JavaScript: the file referenced by <script src="..."> near the end of matchashop.html
- CSS: the file referenced by <link rel="stylesheet" href="..."> in its <head>
- Images: whatever local asset directory your HTML/JavaScript/CSS references (for example, Images/)
In earlier Brew & Co. work the filenames were brewandcompany.js and brewandcompany.css, but verify your Matcha Studio copy rather than assuming they are identical. GitHub Pages is case-sensitive.
2. Change business branding in siteConfig
Find the single const siteConfig = { ... }; object in your JavaScript. Edit its values, not the property names:
const siteConfig = {
    businessName: "Matcha Studio",
    tagline: "A Fresh Take on Matcha",
    description: "Handcrafted matcha drinks and delicate pastries, made for peaceful moments.",
    menuHeading: "Explore Our Menu",
    aboutHeading: "About Matcha Studio",
    aboutText: "Matcha Studio is a fictional specialty café concept.",
    contactEmail: "hello@matchastudio.example",
    location: "Bacoor, Cavite, Philippines — fictional",
    currency: "PHP",
    footerText: "© 2026 Matcha Studio — Demo Website"
};
The .example address is illustrative and is not a real inbox. For an actual client, replace fictional contact information with verified client-provided details.

Your applyBranding() should update elements identified by these HTML IDs:
Configuration field	HTML element ID
businessName	site-brand
tagline	site-tagline
description	site-description
menuHeading	site-menu-heading
aboutHeading	site-about-heading
aboutText	site-about-text
footerText	site-footer
location	site-location
contactEmail	site-email


These IDs must exist once each in your HTML for the related text to update. Browser title changes may also be handled inside applyBranding().

Note: Simply adding a field to siteConfig does not automatically display it. It must be connected to HTML by JavaScript. Also, the currency field will not change price formatting unless renderProducts(), renderCart(), and checkout totals are updated to use it consistently.
3. Edit menu items in products
Find the one const products = [ ... ]; array. Each object should contain:
{
    id: "ceremonial-matcha-latte",
    name: "Ceremonial Matcha Latte",
    price: 165,
    category: "Matcha",
    description: "Smooth matcha blended with creamy milk.",
    image: "Images/ceremonial-matcha-latte.webp"
}
- id: unique machine-readable identifier; do not reuse the same ID for two items.
- name: label displayed on the card and passed to the existing cart.
- price: numeric amount without the ₱ symbol or quotes.
- category: exact category label used for filtering (case-sensitive comparisons).
- description: short, accurate description of this product.
- image: existing local path or a properly licensed remote asset URL.
Separate objects with commas. The last property in an object may omit a trailing comma. Keep a comma between adjacent objects.
Sample Matcha Studio inventory
Category	Product	Price (PHP)
Matcha	Ceremonial Matcha Latte	165
Matcha	Iced Strawberry Matcha	185
Matcha	Matcha Espresso Fusion	195
Tea	Hojicha Latte	160
Tea	Yuzu Green Tea	155
Pastries	Matcha Basque Cheesecake	190
Pastries	Matcha White Chocolate Cookie	95
Pastries	Butter Croissant	105


These were the eight items in the fictional exercise. You may change them to match a real client's approved menu.
Categories
renderCategoryFilters() reads categories from products (typically using new Set(products.map(...))). To add a new category, assign that category name to at least one product. renderProducts() filters cards using the chosen category.

Make sure the HTML contains two separate, empty containers:
<div id="category-filters" class="category-filters" aria-label="Filter menu by category"></div>
<div id="menu-grid" class="menu-grid"></div>
Do not place old static .menu-card elements inside #menu-grid. JavaScript generates the product cards, and leaving old cards can create confusion or duplicates.
4. Change brand colors in CSS
Find the existing :root block near the top of the stylesheet:
:root {
    --color-primary: #304b35;
    --color-secondary: #536c50;
    --color-accent: #d8e2b1;
    --color-background: #f5f5e9;
    --color-surface: #ffffff;
    --color-text: #304b35;
    --color-text-light: #ffffff;
    --color-border: #d2ddc9;
}
Change the variable values for a new client. Existing selectors must use var(--color-...) for the change to affect them. Hard-coded colors elsewhere, including hover states, icons, or the hero image overlay, may still require manual edits.

Accessibility: Verify normal-sized text has at least a 4.5:1 contrast ratio and large text at least 3:1 under WCAG AA. Recheck buttons and hover states after every theme change.
5. Replace the hero and product images
1. Obtain assets the client owns or you have permission to use and redistribute, if sold as part of a template.
2. Optimize dimensions and formats as appropriate (WebP is often useful for photographs).
3. Place images in the correct local folder, preserving case-sensitive names.
4. Edit each product's image property in products.
5. If the hero image is set in CSS via .hero { background-image: ... }, update it in the CSS rather than in the product array.
6. Use truthful, descriptive alt text in product rendering. Do not keyword-stuff.
7. Test every image in the deployed site, not only on your computer.
Do not assume an image from search results or another publication's CDN is licensed for inclusion in a paid template.
6. Contact details
The contact section uses site-location and site-email element IDs if they were added in the HTML. Check that applyBranding() populates both.

For a real email address, the display element can be an anchor with a mailto: URL:
const emailLink = document.getElementById("site-email");
if (emailLink && siteConfig.contactEmail) {
    emailLink.textContent = siteConfig.contactEmail;
    emailLink.href = `mailto:${siteConfig.contactEmail}`;
}
For a fictional .example address, display it as demo text rather than suggesting a working contact method. Never publish a private client address or phone number without permission.
7. Update SEO metadata
In matchashop.html, review:
<title>Matcha Studio | Café Website Demo</title>
<meta name="description" content="Explore Matcha Studio, a fictional matcha café website concept with a categorized menu and demo ordering interface.">
Also check the on-page H1/H2/H3 headings, image alt text, and any location wording. A JavaScript-updated browser title does not automatically update the static HTML meta description. For a real client, use accurate claims and the client's actual service area. Do not publish fake reviews or real-business listings for a fictional project.
8. Preserve the cart and checkout
When modifying products or visual styling, do not remove the existing addToOrder(), renderCart(), quantity, checkout summary, or demo checkout functions.

The native HTML checkout <dialog> should be opened with showModal() and closed with close(); class toggles alone are not a substitute. Test Tab, Shift+Tab, Escape, and focus restoration. Check that an empty cart can't proceed to checkout.

Demo limitation: There is no server-side order submission, payment processing, email notification, inventory synchronization, or client dashboard. Never describe the demo as a fully operational online ordering system.
9. Verify your customization
- [ ] Business name and content are correct in navbar, hero, About, and footer
- [ ] HTML page title and meta description match the new business
- [ ] Product counts and category filters work
- [ ] Images load and accurately represent the products
- [ ] Add-to-cart, quantities, removal, totals, and checkout summary are correct
- [ ] Checkout is clearly labeled demo-only and keyboard accessible
- [ ] Contact data is correct and authorized for publishing
- [ ] Color contrast and button states pass checks
- [ ] Layout works on narrow mobile, tablet, and desktop widths
- [ ] Browser Console has no new errors
- [ ] GitHub Pages deployment shows the latest version
- [ ] Every redistributed asset has a suitable license
10. Deploy updates
1. Save your changes.
2. Test locally, including at mobile widths.
3. Commit and push your changes to the Matcha Studio repository.
4. Ensure GitHub Pages is publishing from the correct branch and folder.
5. Once deployment succeeds, hard refresh and test the public URL.
Troubleshooting
Problem	Check
No products display	Script path, JavaScript Console, #menu-grid, and menu initialization
Product filter is missing	#category-filters, renderCategoryFilters(), and category on every product
',' expected	Missing comma between product object properties or configuration fields
Brand text doesn't change	Matching HTML IDs, applyBranding(), and its initialization
Cart does not open	Exact script filename and availability of openCart()
Checkout doesn't show	Native <dialog>, showModal(), and any old conflicting modal CSS
Works locally but not on GitHub Pages	Case-sensitive image/file paths, commit/push status, and Pages source settings


Commercial delivery reminder
This customization guide is an editing manual, not a software license. Add actual commercial license terms, list third-party assets and required attribution, and specify which services (hosting, domain, maintenance, genuine ordering integrations) are and are not included in your client agreement.
