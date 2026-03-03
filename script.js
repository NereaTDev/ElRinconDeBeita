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
      }, '-=200');
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

    const updateLayout = () => {
      const first = heroBlocks[0];
      if (!first) return;
      // Fijamos la altura de la "ventana" al alto del primer bloque
      heroViewport.style.height = first.offsetHeight + 'px';
      // Posicionamos el track en el bloque actual
      heroTrack.style.transform = `translateY(-${index * first.offsetHeight}px)`;
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

  // Galería: auto-scroll horizontal y flechas en desktop
  const galleryTrack = document.querySelector('#galeria .gallery-track');
  const galleryItems = galleryTrack ? galleryTrack.querySelectorAll('figure') : [];
  const galleryPrev = document.querySelector('#galeria .gallery-prev');
  const galleryNext = document.querySelector('#galeria .gallery-next');

  if (galleryTrack && galleryItems.length > 0) {
    let galleryIndex = 0;

    const getItemsPerPage = () => (window.innerWidth >= 768 ? 3 : 1);
    const getPagesCount = () => Math.max(1, Math.ceil(galleryItems.length / getItemsPerPage()));

    const clampIndex = () => {
      const pages = getPagesCount();
      if (galleryIndex >= pages) galleryIndex = 0;
      if (galleryIndex < 0) galleryIndex = pages - 1;
    };

    const updateGallery = () => {
      clampIndex();
      const width = galleryTrack.clientWidth;
      galleryTrack.style.transform = `translateX(-${galleryIndex * width}px)`;
    };

    // Auto-scroll cada 5 segundos
    setInterval(() => {
      const pages = getPagesCount();
      galleryIndex = (galleryIndex + 1) % pages;
      updateGallery();
    }, 5000);

    // Flechas solo en desktop
    if (galleryPrev && galleryNext) {
      galleryPrev.addEventListener('click', () => {
        galleryIndex -= 1;
        updateGallery();
      });

      galleryNext.addEventListener('click', () => {
        galleryIndex += 1;
        updateGallery();
      });
    }

    window.addEventListener('resize', updateGallery);
    updateGallery();
  }

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
