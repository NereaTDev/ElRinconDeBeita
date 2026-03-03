document.addEventListener('DOMContentLoaded', function () {
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

  // Carrusel vertical de textos superpuestos sobre la tarta
  const heroBlocks = document.querySelectorAll('.hero-text-carousel .hero-text-block');
  if (heroBlocks.length > 0) {
    let index = 0;
    heroBlocks[index].classList.add('is-active');

    if (heroBlocks.length > 1) {
      setInterval(() => {
        heroBlocks[index].classList.remove('is-active');
        index = (index + 1) % heroBlocks.length;
        heroBlocks[index].classList.add('is-active');
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
