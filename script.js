document.addEventListener('DOMContentLoaded', function () {
  // Asegurar que al recargar la página se vea siempre el inicio (no saltar a secciones)
  window.scrollTo(0, 0);

  // Animación de entrada del hero
  if (window.anime) {
    window.anime
      .timeline({ easing: 'easeOutQuad', duration: 700 })
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
        targets: '.hero-tags .tag',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: window.anime.stagger(40)
      }, '-=250')
      .add({
        targets: '.hero-actions > *',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: window.anime.stagger(60)
      }, '-=200')
      .add({
        // Aparición suave del cuadro del carrusel para integrarse con el resto del hero
        // Sin tocar la posición final: solo opacidad y una ligera escala
        targets: '.hero-text-viewport',
        opacity: [0, 1],
        scale: [0.96, 1],
        duration: 500
      }, '-=350');
  }

  // Efecto parallax suave en el pastel al hacer scroll
  const cakeWrapper = document.querySelector('.hero-cake-wrapper');
  if (cakeWrapper) {
    window.addEventListener('scroll', function () {
      const rect = cakeWrapper.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = 1 - Math.min(Math.max(rect.top / vh, 0), 1);
      cakeWrapper.style.transform = `translateY(${(1 - visible) * 15}px)`;
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
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
        });

        const data = await res.json();

        if (res.ok && data.success) {
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
