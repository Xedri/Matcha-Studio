Matcha Studio — Café Website Template
A responsive, fictional specialty matcha café website built with HTML, CSS, and vanilla JavaScript. This project is a portfolio demonstration adapted from the Brew & Co. café template to show how a reusable website can be customized for a different business.
Demo only: Matcha Studio is not an operating café. The cart and checkout demonstrate an ordering interface; they do not submit real orders, accept payments, or connect to a backend. Contact details and the location shown in the demonstration are fictional.

Features
- Responsive café landing page with hero, menu, about, and contact sections
- Configurable business name, tagline, copy, and other display text using siteConfig
- Product menu rendered from a JavaScript products array
- Category filters (for example, All, Matcha, Tea, and Pastries)
- Interactive shopping cart: add items, change quantity, remove items, and see totals
- Native HTML <dialog> demo checkout with form fields and order summary
- Reusable CSS custom properties (:root) for brand colors
- Basic on-page SEO and accessibility improvements
Built with
- HTML5
- CSS3
- Vanilla JavaScript (no framework required)
- GitHub Pages for static hosting
Project structure
The main page in the current Matcha Studio project is named matchashop.html. Keep your real CSS/JS filenames as they are; update the sample names below only if they match the filenames in your folder.
matcha-studio/
├── index.html                 # Optional redirect to matchashop.html for GitHub Pages
├── matchashop.html            # Main website
├── brewandcompany.css         # Example: existing stylesheet name (verify)
├── brewandcompany.js          # Example: existing script name (verify)
├── Images/                    # Local assets, if used (case-sensitive on GitHub Pages)
├── README.md
└── CUSTOMIZATION.md
In matchashop.html, check the <link rel="stylesheet" href="..."> and <script src="..."></script> paths. They must match the actual filenames and capitalization in your repository.

Run locally
1. Download or clone this repository.
2. Keep matchashop.html, the referenced CSS and JavaScript, and any local assets together in their expected folders.
3. Open matchashop.html in a browser. For more reliable local testing, use a local development server such as VS Code Live Server.
4. Test category filters, the cart, and the demo checkout.
No build step, package installation, or API keys are required for the demonstrated static site.
Publish with GitHub Pages
1. Create a separate public GitHub repository for Matcha Studio.
2. Upload the website files to the repository root, preserving local image folders.
3. Add an index.html entry page if you want to keep matchashop.html as the main filename. A simple redirect option:
   <!doctype html>
   <html lang="en">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <meta http-equiv="refresh" content="0; url=matchashop.html">
     <title>Matcha Studio — Website Demo</title>
   </head>
   <body><p><a href="matchashop.html">Open Matcha Studio</a></p></body>
   </html>
4. In the repository, open Settings → Pages.
5. Choose Deploy from a branch, select main, and choose /(root) (assuming files are in the root).
6. Save, then open the Visit site link when GitHub Pages reports a successful deployment.
7. Verify images, styling, cart, filters, and checkout on the published URL. GitHub Pages paths are case-sensitive.
Customization
See [CUSTOMIZATION.md](CUSTOMIZATION.md) for instructions on changing the client branding, menu items, contact information, theme colors, image assets, and SEO metadata.
Quality assurance checklist
Before sharing the public demo or delivering a customized copy, check:
- [ ] Brand name, headings, About text, and footer are consistent
- [ ] Every product name, category, price, description, and image is correct
- [ ] All category filters work, and switching filters does not duplicate products
- [ ] Cart add/increase/decrease/remove actions and totals work
- [ ] Checkout shows an accurate demo order summary; it does not imply a real order was placed
- [ ] Checkout keyboard navigation, Escape behavior, and focus restoration work
- [ ] Test phone (375px/430px), tablet (768px), and desktop (1440px) layouts
- [ ] No important text or controls fail color contrast checks
- [ ] No unexpected errors appear in the browser Console
- [ ] All included media and other third-party assets have appropriate usage and redistribution rights
- [ ] Recheck SEO title, description, page headings, and image alternative text
Limitations
- This is a front-end demonstration, not a production ordering service.
- Orders are not stored, emailed, sent to a kitchen, or processed for payment.
- Product data and client branding are edited in source code; there is no admin dashboard or content management system.
- A Lighthouse score does not guarantee rankings, accessibility compliance, or flawless real-world behavior.
- Some early development versions used third-party-hosted photos. Replace these with assets you are licensed to use and redistribute before selling the template.
Licensing and attribution
No commercial license is granted by this README. Before offering the project for sale, add your intended code/template license and document any third-party image, font, icon, or library licenses. Do not assume an image may be redistributed simply because it is publicly accessible.
Project status
Portfolio / practice client simulation. Original base: Brew & Co. Customized concept: Matcha Studio. Final independent code review, licensed asset review, and release packaging should be completed before commercial delivery.
