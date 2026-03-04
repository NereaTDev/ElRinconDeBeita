# El Rincón de Beita

Static landing page for **El Rincón de Beita**, a small creative bakery project.  
The site showcases services, sample work and a contact form based on `mailto:`.

## Stack

- **Static HTML**
- **Custom CSS** + [Tailwind CSS](https://tailwindcss.com/) via CDN
- **Vanilla JavaScript** for:
  - Entry animations (with [Anime.js](https://animejs.com/))
  - Hero text carousel
  - Responsive gallery carousel
  - Scroll reveal effects
- **Node.js** (optional) to automatically generate the gallery from an image folder

## Project structure

```text
el-rincon-de-beita/
├─ index.html          # Main page
├─ styles.css          # Custom styles
├─ script.js           # Animations, carousels and behavior
├─ assets/
│  ├─ cake-hero.png    # Main hero image
│  ├─ logo-*.png/svg   # Logo variations
│  └─ gallery/         # Gallery images
│     └─ index.json    # (generated) image list for the gallery carousel
└─ tools/
   └─ generate-gallery.js   # Node script to generate assets/gallery/index.json

Requirements

    Modern browser (Chrome, Firefox, Safari, Edge…).
    For basic usage (viewing the page) no Node or server is required.
    To auto-generate the gallery from assets/gallery:
        Node.js (any modern LTS version).

Basic usage (viewing the landing)

    Clone or download the project.
    Open index.html directly in your browser (double-click or “Open with…”).

You can also serve it with any static server (Live Server, python -m http.server, etc.) if you prefer a local URL.
Automatic gallery system

The “Gallery” section shows a carousel with images generated from the assets/gallery folder.
1. Add images to the gallery

    Copy your images into:

    el-rincon-de-beita/assets/gallery/

    Supported formats:
        .png, .jpg, .jpeg, .gif, .webp, .avif, .svg.

2. Generate index.json (image list)

This step uses Node.js to read the folder contents and build a JSON file consumed by the front-end.

From the project root:

cd el-rincon-de-beita
node tools/generate-gallery.js

This will create or update:

assets/gallery/index.json

with one entry per image, e.g.:

[
  {
    "src": "./assets/gallery/my-photo.png",
    "alt": "my photo"
  },
  {
    "src": "./assets/gallery/other-photo.jpg",
    "alt": "other photo"
  }
]

    ⚠️ Important:
    Whenever you add, remove or rename images inside assets/gallery, run:

    node tools/generate-gallery.js

3. How the JSON is used

In script.js, the gallery logic:

    Fetches ./assets/gallery/index.json.
    Dynamically creates the cards (<figure> + <img>) inside the carousel track.
    Applies the slider behavior:
        Desktop: 3 images per “page”.
        Mobile: 1 image, horizontal swipe (scroll) without arrows.
        Desktop arrows to go to previous/next page.

You do not need to touch index.html or script.js to add/remove images: the only manual step is running the generator script.
Hero – Text carousel

The hero block includes:

    Main cake image (assets/cake-hero.png).
    Vertical text carousel (.hero-text-viewport → .hero-text-track → .hero-text-block).

How it works

    In index.html you have several blocks:

    <div class="hero-text-track">
      <div class="hero-text-block">
        <div class="hero-card-title">Celebration cakes</div>
        <p class="hero-card-text">...</p>
      </div>
      <!-- more blocks -->
    </div>

    In script.js:
        It computes the maximum height among all blocks.
        Uses that as the fixed slide height for every block.
        Moves the track in fixed steps (translateY) to show one block at a time.
        Adjusts the viewport so only one full block is visible (no partial next/previous slide).
        Adds a subtle animation (opacity + scale) so the carousel appears smoothly with the rest of the hero.

To add more texts to the carousel:

    Add another .hero-text-block inside .hero-text-track in index.html.
    The JS will automatically recalculate heights and include it in the carousel loop.

“Fan” effect for products (mobile)

In the “What I can prepare for you” section (#productos):

    On desktop:
        Cards are fully visible and have a soft hover (lift, shadow, accent border).
    On mobile:
        Only the title of each product-card is visible (cards appear “folded”).
        As the user scrolls, the card whose center is closest to the center of the viewport expands:
            Shows the description and badge.
            All other cards collapse.

This behavior is implemented in script.js (the “fan” effect block).

No extra configuration is needed: just keep the product-card structure in index.html.
Animations & scroll effects

    Anime.js (CDN script in index.html):
        Hero entry animation: title, subtitle, tags, CTA and the text carousel.
    IntersectionObserver:
        Adds .in-view to elements with .reveal-on-scroll for a simple fade/slide-in when they enter the viewport.
    Smooth scroll:
        Internal links (a[href^="#"]) are intercepted in script.js for smooth scrolling with a header offset, so anchored sections don’t hide behind the sticky header.

Contact form

The contact form uses mailto::

<form action="mailto:YOUR_EMAIL_HERE" method="post" enctype="text/plain">
  ...
</form>

    On submit, it opens the user’s default mail client with the form data prefilled.
    There is no backend or data storage in this project (it’s just a static landing).

    If this repo is public, make sure you don’t commit any email or data you don’t want to expose.

Useful commands (summary)

From the project root (el-rincon-de-beita):

# Regenerate gallery image list after adding/removing files
node tools/generate-gallery.js

There are no other mandatory build steps: Tailwind and Anime.js are loaded via CDN, and the page can be opened directly in the browser.
