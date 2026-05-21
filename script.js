document.addEventListener('DOMContentLoaded', function () {
  // Asegurar que al recargar la página se vea siempre el inicio (no saltar a secciones)
  window.scrollTo(0, 0);

  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const onHeaderScroll = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 32);
    };
    onHeaderScroll();
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
  }

  // Animación de entrada del hero
  if (window.anime) {
    window.anime
      .timeline({ easing: 'easeOutQuad', duration: 500 })
      .add({
        targets: '.hero-title',
        translateY: [20, 0],
        opacity: [0, 1]
      })
      .add({
        targets: '.hero-subtitle',
        translateY: [15, 0],
        opacity: [0, 1]
      }, '-=300')
      .add({
        targets: '.hero-actions > *',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: window.anime.stagger(60),
        complete: () => {
          document.querySelectorAll('.hero-actions > *').forEach(el => {
            el.style.opacity = '';
            el.style.transform = '';
          });
        }
      }, '-=200')
      .add({
        targets: '.hero-tag',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: window.anime.stagger(40)
      }, '-=350')
      .add({
        targets: '.hero-text-viewport',
        opacity: [0, 1],
        scale: [0.96, 1],
        duration: 500
      }, '-=350')
      .add({
        targets: '.hero-intro-circle',
        opacity: [0, 1],
        translateX: [120, 0],
        scale: [0.9, 1],
        duration: 700,
        easing: 'easeOutCubic'
      }, '+=150')

      .add({
        targets: '.hero-intro-cake',
        opacity: [0, 1],
        translateX: [160, 0],
        duration: 800,
        easing: 'easeOutCubic'
      }, '-=350')

      .add({
        targets: '.circle-label.hero-intro-hidden',
        opacity: [0, 1],
        duration: 700,
        delay: window.anime.stagger(120),
        easing: 'easeOutCubic'
      }, '-=450')

      .finished.then(() => {
        document.querySelectorAll('.hero-intro-hidden').forEach(el => {
          el.classList.remove('hero-intro-hidden');
        });

        document.querySelector('.hero-intro-circle')?.classList.remove('hero-intro-circle');
        document.querySelector('.hero-intro-cake')?.classList.remove('hero-intro-cake');
      });
  }

  // Scroll hero interceptado: animación primero, scroll real después (solo desktop)
  const cakeWrapper = document.querySelector('.hero-cake-wrapper');
  const cakeImage = document.querySelector('.hero-cake-image');
  const mainCircle = document.querySelector('.main-circle');
  const circleLabels = mainCircle
    ? Array.from(mainCircle.querySelectorAll('.circle-label'))
    : [];

  if (cakeWrapper && cakeImage && mainCircle && circleLabels.length) {
    const SCROLL_BUDGET = 820;
    const LIST_SLOTS = [27, 39, 51, 63];

    let heroProgress = 0;
    let heroScrollLocked = false;
    let labelStarts = null;
    let touchStartY = null;
    let cakeLiftMax = -400;

    const isDesktopHero = () => window.innerWidth >= 769;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const computeCakeLiftMax = () => {
      const prevProgress = heroProgress;
      cakeImage.style.setProperty('--cake-lift', '0px');
      const rect = cakeImage.getBoundingClientRect();
      cakeLiftMax = -(rect.top + rect.height + 80);
      if (prevProgress > 0) {
        applyHeroProgress(prevProgress);
      }
    };

    const shouldCaptureScroll = (delta) => {
      if (!isDesktopHero()) return false;
      if (window.scrollY > 8) return false;
      if (heroProgress <= 0 && delta < 0) return false;
      if (heroProgress < 1) return true;
      if (heroProgress >= 1 && delta < 0) return true;
      return false;
    };

    const captureLabelStarts = () => {
      const circleRect = mainCircle.getBoundingClientRect();
      if (!circleRect.width || !circleRect.height) return;

      labelStarts = circleLabels.map((label) => {
        const rect = label.getBoundingClientRect();
        return {
          top: ((rect.top + rect.height / 2 - circleRect.top) / circleRect.height) * 100,
          left: ((rect.left + rect.width / 2 - circleRect.left) / circleRect.width) * 100,
        };
      });
    };

    const resetHeroScrollFx = () => {
      heroProgress = 0;
      heroScrollLocked = false;
      touchStartY = null;
      labelStarts = null;
      document.documentElement.classList.remove('hero-scroll-locked');
      cakeImage.style.removeProperty('--cake-lift');
      cakeImage.style.opacity = '';
      cakeWrapper.classList.remove('is-lifting', 'is-lifted');
      mainCircle.classList.remove('is-stacking', 'is-stacked');
      circleLabels.forEach((label) => {
        label.style.top = '';
        label.style.left = '';
        label.style.right = '';
        label.style.transform = '';
        label.style.textAlign = '';
        label.style.opacity = '';
      });
    };

    const applyHeroProgress = (progress) => {
      const cakeProgress = easeOutCubic(Math.min(progress / 0.42, 1));
      const stackProgress = easeOutCubic(
        Math.min(Math.max((progress - 0.28) / 0.72, 0), 1)
      );

      cakeImage.style.setProperty('--cake-lift', `${cakeProgress * cakeLiftMax}px`);
      cakeImage.style.opacity = progress > 0 ? String(Math.max(0, 1 - cakeProgress * 1.15)) : '';

      cakeWrapper.classList.toggle('is-lifting', progress > 0 && progress < 1);
      cakeWrapper.classList.toggle('is-lifted', progress >= 1);
      mainCircle.classList.toggle('is-stacking', stackProgress > 0 && stackProgress < 1);
      mainCircle.classList.toggle('is-stacked', progress >= 1);

      if (progress === 0) {
        circleLabels.forEach((label) => {
          label.style.top = '';
          label.style.left = '';
          label.style.right = '';
          label.style.transform = '';
          label.style.textAlign = '';
          label.style.opacity = '';
        });
        return;
      }

      if (!labelStarts) captureLabelStarts();
      if (!labelStarts) return;

      circleLabels.forEach((label, index) => {
        const start = labelStarts[index];
        const endTop = LIST_SLOTS[index];
        const top = start.top + (endTop - start.top) * stackProgress;
        const left = start.left + (50 - start.left) * stackProgress;

        label.style.top = `${top}%`;
        label.style.left = `${left}%`;
        label.style.right = 'auto';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.textAlign = stackProgress > 0.4 ? 'center' : 'left';
        label.style.opacity = String(0.85 + stackProgress * 0.15);
      });
    };

    const unlockHeroScroll = () => {
      if (!heroScrollLocked) return;
      heroScrollLocked = false;
      document.documentElement.classList.remove('hero-scroll-locked');
    };

    const lockHeroScroll = () => {
      heroScrollLocked = true;
      document.documentElement.classList.add('hero-scroll-locked');
      if (window.scrollY > 0) window.scrollTo(0, 0);
    };

    const consumeScrollDelta = (delta) => {
      if (!isDesktopHero()) return;

      const smoothDelta = delta * 0.35;

      const next = Math.min(
        Math.max(heroProgress + smoothDelta / SCROLL_BUDGET, 0),
        1
      ); if (next === heroProgress) return;

      heroProgress = next;
      applyHeroProgress(heroProgress);

      if (heroProgress >= 1) {
        unlockHeroScroll();
      
        document.querySelector('.page-content')?.classList.remove('is-waiting-hero');
        document.querySelector('.page-content')?.classList.add('sections-ready');
      } else {
        lockHeroScroll();
      }
    };

    const onWheel = (e) => {
      if (!shouldCaptureScroll(e.deltaY)) return;
      e.preventDefault();
      lockHeroScroll();
      consumeScrollDelta(e.deltaY);
    };

    const onTouchStart = (e) => {
      if (!isDesktopHero()) return;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!isDesktopHero() || touchStartY === null) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartY - currentY;
      touchStartY = currentY;
      if (delta === 0 || !shouldCaptureScroll(delta)) return;
      e.preventDefault();
      lockHeroScroll();
      consumeScrollDelta(delta);
    };

    const onKeyDown = (e) => {
      if (!isDesktopHero()) return;

      const scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '];
      if (!scrollKeys.includes(e.key)) return;

      const step = {
        ArrowDown: 90,
        ArrowUp: -90,
        PageDown: 220,
        PageUp: -220,
        ' ': e.shiftKey ? -140 : 140,
      }[e.key];

      if (!shouldCaptureScroll(step)) return;

      e.preventDefault();
      lockHeroScroll();
      consumeScrollDelta(step);
    };

    const onScrollLock = () => {
      if (heroScrollLocked && isDesktopHero() && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const initHeroScrollLock = () => {
      if (!isDesktopHero()) {
        resetHeroScrollFx();
        return;
      }

      if (heroProgress === 0) {
        labelStarts = null;
        computeCakeLiftMax();
        captureLabelStarts();
      }

      applyHeroProgress(heroProgress);

      if (heroProgress < 1 && window.scrollY <= 8) {
        lockHeroScroll();
      } else {
        unlockHeroScroll();
      }
    };

    initHeroScrollLock();

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScrollLock, { passive: true });
    window.addEventListener('resize', () => {
      if (!isDesktopHero()) {
        resetHeroScrollFx();
        return;
      }
      if (window.scrollY <= 8 && heroProgress === 0) {
        labelStarts = null;
        computeCakeLiftMax();
        captureLabelStarts();
      } else {
        computeCakeLiftMax();
      }
      initHeroScrollLock();
    });
  }

  // Carrusel vertical de textos superpuestos sobre la tarta (componente propio)
  const heroTrack = document.querySelector('.hero-text-track');
  const heroViewport = document.querySelector('.hero-text-viewport');
  const heroBlocks = heroTrack ? heroTrack.querySelectorAll('.hero-text-block') : [];

  if (heroTrack && heroViewport && heroBlocks.length > 0) {
    let index = 0;
    let slideHeight = 0;

    const updateLayout = () => {
      if (!heroBlocks.length) return;

      // Calculamos la altura máxima natural SOLO la primera vez (para que no "crezca" en cada ciclo)
      if (!slideHeight) {
        const naturalMax = Array.from(heroBlocks).reduce((max, block) => {
          const h = block.scrollHeight || block.offsetHeight || 0;
          return h > max ? h : max;
        }, 0);

        if (!naturalMax) return;

        // Damos un poco de aire extra y usamos esa altura fija para TODOS los slides
        slideHeight = naturalMax + 12; // ajusta 12px si quieres más o menos padding vertical

        heroBlocks.forEach(block => {
          block.style.height = `${slideHeight}px`;
          block.style.display = 'flex';
          block.style.flexDirection = 'column';
          block.style.justifyContent = 'center';
        });

        // El viewport tiene exactamente la altura del slide para no mostrar restos de otros
        heroViewport.style.height = `${slideHeight}px`;
      }

      // Posicionamos el track en el bloque actual usando la altura del slide
      heroTrack.style.transform = `translateY(-${index * slideHeight}px)`;
    };

    // Layout inicial
    updateLayout();

    if (heroBlocks.length > 1) {
      window.addEventListener('resize', updateLayout);

      setInterval(() => {
        index = (index + 1) % heroBlocks.length;
        updateLayout();
      }, 4000);
    }
  }

  // Animaciones al hacer scroll en secciones
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

  // "Abanico" de productos en mobile: solo la card centrada en pantalla se despliega
  (function () {
    const cards = Array.from(document.querySelectorAll('#productos .product-card'));
    if (!cards.length) return;

    const isMobile = () => window.innerWidth <= 768;

    const updateActiveCard = () => {
      if (!isMobile()) {
        cards.forEach(card => card.classList.remove('is-active'));
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      let bestCard = null;
      let bestDistance = Infinity;

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestCard = card;
        }
      });

      if (!bestCard) return;
      cards.forEach(card => card.classList.toggle('is-active', card === bestCard));
    };

    let ticking = false;
    const onScroll = () => {
      if (!isMobile()) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveCard();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateActiveCard);

    // Estado inicial
    updateActiveCard();
  })();

  // Carrusel de galería (3 en desktop, swipe en mobile)
  (function () {
    const wrapper = document.querySelector('#galeria .gallery-wrapper');
    if (!wrapper) return;

    const viewport = wrapper.querySelector('.gallery-viewport');
    const track = wrapper.querySelector('#demo-gallery-track');
    const prevBtn = wrapper.querySelector('.gallery-prev');
    const nextBtn = wrapper.querySelector('.gallery-next');

    if (!viewport || !track || !prevBtn || !nextBtn) return;

    // Cargamos la lista de imágenes generada por tools/generate-gallery.js
    fetch('./assets/gallery/index.json')
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar index.json de la galería');
        return response.json();
      })
      .then(galleryImages => {
        if (!Array.isArray(galleryImages) || galleryImages.length === 0) return;

        // Elementos del modal de imagen
        const modal = document.getElementById('gallery-modal');
        const modalImg = document.getElementById('gallery-modal-image');
        const modalCaption = document.getElementById('gallery-modal-caption');
        const modalClose = document.getElementById('gallery-modal-close');

        const openModal = (src, alt) => {
          if (!modal || !modalImg) return;
          modalImg.src = src;
          modalImg.alt = alt || '';
          if (modalCaption) {
            modalCaption.textContent = alt || '';
          }
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        };

        const closeModal = () => {
          if (!modal) return;
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        };

        if (modalClose) {
          modalClose.addEventListener('click', closeModal);
        }
        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
          });
        }
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') closeModal();
        });

        // Limpiamos el track y generamos las figuras en base a ese JSON
        track.innerHTML = '';
        galleryImages.forEach(img => {
          const figure = document.createElement('figure');
          figure.className = 'gallery-item overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer';

          const imageEl = document.createElement('img');
          imageEl.src = img.src;
          imageEl.alt = img.alt || '';
          imageEl.className = 'w-[88%] h-56 object-contain md:object-cover';

          figure.appendChild(imageEl);
          figure.addEventListener('click', () => openModal(imageEl.src, imageEl.alt));
          track.appendChild(figure);
        });

        const items = Array.from(track.querySelectorAll('.gallery-item'));
        if (!items.length) return;

        let page = 0;

        const isDesktop = () => window.innerWidth >= 768;
        const getItemsPerPage = () => (isDesktop() ? 3 : 1);
        const getPagesCount = () => {
          const perPage = getItemsPerPage();
          return Math.max(1, Math.ceil(items.length / perPage));
        };

        const update = () => {
          const pages = getPagesCount();
          if (!isDesktop()) {
            // mobile: sin transform fijo (swipe manual)
            track.style.transform = 'translateX(0)';
            return;
          }

          if (page >= pages) page = 0;
          if (page < 0) page = pages - 1;

          const viewportWidth = viewport.clientWidth;
          track.style.transform = `translateX(-${page * viewportWidth}px)`;
        };

        prevBtn.addEventListener('click', () => {
          page -= 1;
          update();
        });

        nextBtn.addEventListener('click', () => {
          page += 1;
          update();
        });

        window.addEventListener('resize', update);
        update();
      })
      .catch(err => {
        console.error('Error inicializando la galería:', err);
      });
  })();

  // Formulario de contacto — envío AJAX vía Web3Forms (sin backend, sin redirección)
  (function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('contact-submit');
    const successMsg = document.getElementById('contact-success');
    const errorMsg = document.getElementById('contact-error');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Validación nativa del navegador
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Ocultar mensajes anteriores
      successMsg.classList.add('hidden');
      errorMsg.classList.add('hidden');

      // Estado de carga en el botón
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      try {
        const payload = {
          Nombre: form.Nombre.value,
          Email: form.Email.value,
          Mensaje: form.Mensaje.value,
        };

        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data && data.success) {
          successMsg.classList.remove('hidden');
          form.reset();
        } else {
          errorMsg.classList.remove('hidden');
        }
      } catch (_) {
        errorMsg.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  })();

  // Scroll suave para enlaces internos (nav y CTA hero)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const headerOffset = 72; // altura aproximada del header
      const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
});


const productTabs = document.querySelectorAll('.product-tab');
const productImage = document.getElementById('product-image');
const productTitle = document.getElementById('product-title');
const productBadge = document.getElementById('product-badge');
const productText = document.getElementById('product-text');
const productsAccordion = document.querySelector('.products-accordion');
const productCard = document.querySelector('.product-feature-card');
let productChangeTimeout = null;
const products = [
  {
    title: 'Tartas Personalizadas',
    badge: 'Desde 6 porciones',
    text: 'Diseñadas a partir de tu idea: personajes, temática, colores o estilo. Ideal para cumpleaños, aniversarios y eventos familiares.',
    image: 'assets/gallery/personal-cake.png'
  },
  {
    title: 'Tartas Clásicas',
    badge: 'Perfectas para llevar de invitado',
    text: 'Sabores de siempre: chocolate, vainilla, red velvet, zanahoria, etc. Decoración sencilla pero cuidada.',
    image: 'assets/gallery/birthday-cake.png'
  },
  {
    title: 'Cookies Decoradas',
    badge: 'Empaquetadas individualmente',
    text: 'Galletas de mantequilla o cacao decoradas a mano. Ideales como detalles para invitados o para mesas dulces.',
    image: 'assets/gallery/barbie-cookies.png'
  },
  {
    title: 'Mesas dulces pequeñas',
    badge: 'Dulces coordinados',
    text: 'Selección de dulces coordinados para eventos íntimos. Podemos combinar tartas, cookies, cupcakes y otros detalles.',
    image: 'assets/gallery/sweets-table.png'
  },
  {
    title: 'Cupcakes especiales',
    badge: 'Bocados dulces',
    text: 'Mini tartas, cupcakes y otros bocados dulces para acompañar tu tarta principal o montar una mesa dulce.',
    image: 'assets/gallery/sweets-box.png'
  },
  {
    title: 'Detalles dulces personalizados',
    badge: 'Cajitas regalo y packs',
    text: 'Cajitas regalo, packs temáticos y detalles dulces personalizados para sorprender a quien tú quieras.',
    image: 'assets/gallery/minnie-pops.png'
  }
];

let activeProduct = 0;
let productInterval = null;

const showProduct = (index) => {
  if (index === activeProduct) return;

  activeProduct = index;

  clearTimeout(productChangeTimeout);

  productTabs.forEach((tab, i) => {
    tab.classList.toggle('is-active', i === index);
  });

  productCard.classList.add('is-changing');

  productChangeTimeout = setTimeout(() => {
    const product = products[index];

    productImage.src = product.image;
    productTitle.textContent = product.title;
    productBadge.textContent = product.badge;
    productText.textContent = product.text;

    productCard.classList.remove('is-changing');
  }, 160);
};

const startProductsAutoPlay = () => {
  clearInterval(productInterval);

  productInterval = setInterval(() => {
    const nextProduct = (activeProduct + 1) % products.length;
    showProduct(nextProduct);
  }, 4200);
};
const stopProductsAutoPlay = () => {
  clearInterval(productInterval);
};

productTabs.forEach((tab, index) => {
  tab.addEventListener('mouseenter', () => {
    stopProductsAutoPlay();
    showProduct(index);
  });

  tab.addEventListener('focus', () => {
    stopProductsAutoPlay();
    showProduct(index);
  });
});

productsAccordion.addEventListener('mouseenter', stopProductsAutoPlay);
productsAccordion.addEventListener('mouseleave', startProductsAutoPlay);

const productsSection = document.querySelector('#productos');
let productsStarted = false;

const startProductsWhenVisible = () => {
  if (productsStarted) return;

  const sectionTop = productsSection.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (sectionTop < windowHeight * 0.65) {
    productsStarted = true;

    activeProduct = -1;
    showProduct(0);
    startProductsAutoPlay();

    window.removeEventListener('scroll', startProductsWhenVisible);
  }
};

window.addEventListener('scroll', startProductsWhenVisible);
startProductsWhenVisible();