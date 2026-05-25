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
        duration: 600,
        // easing: 'easeOutCubic'
      }, '0')

      .add({
        targets: '.hero-intro-cake',
        opacity: [0, 1],
        translateX: [160, 0],
        duration: 700,
        // easing: 'easeOutCubic'
      }, '120')

      .add({
        targets: '.circle-label.hero-intro-hidden',
        opacity: [0, 1],
        duration: 800,
        delay: window.anime.stagger(200),
        easing: 'easeOutCubic'
      }, '250')

      .finished.then(() => {
        document.querySelectorAll('.hero-intro-hidden').forEach(el => {
          el.classList.remove('hero-intro-hidden');
        });

        document.querySelector('.hero-intro-circle')?.classList.remove('hero-intro-circle');
        document.querySelector('.hero-intro-cake')?.classList.remove('hero-intro-cake');

        typeHeroTitle();
      });
  }

  const typeHeroTitle = () => {
    const typeHeroTitle = document.querySelectorAll('.hero-title');

    typeHeroTitle.forEach((label, labelIndex) => {
      const originalText = label.textContent.trim();

      label.textContent = '';

      let letterIndex = 0;

      setTimeout(() => {
        const typing = setInterval(() => {
          label.textContent += originalText.charAt(letterIndex);
          letterIndex++;

          if (letterIndex >= originalText.length) {
            clearInterval(typing);
          }
        }, 45);
      }, labelIndex * 700);
    });
  };

  typeHeroTitle();

  // Scroll hero interceptado: animación primero, scroll real después (solo desktop)
  // const showPageSections = () => {
  //   const showSections = document.querySelectorAll('.page-content');

  //   showSections.forEach((item) => {
  //     item.classList.remove('is-waiting-hero');
  //   });

  // };
  // window.addEventListener('wheel', showPageSections, { once: true });
  // window.addEventListener('touchmove', showPageSections, { once: true });
  // window.addEventListener('keydown', showPageSections, { once: true });

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
});


// Acordeón de Productos
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

let activeProduct = 1;
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

    activeProduct = 1;
    showProduct(0);
    startProductsAutoPlay();

    window.removeEventListener('scroll', startProductsWhenVisible);
  }
};

window.addEventListener('scroll', startProductsWhenVisible);
startProductsWhenVisible();


// Colors Animation
const animateColor = () => {

  const animatedElements = [
    {
      element: document.querySelector('.site-logo'),
      property: 'color'
    },
    {
      element: document.querySelector('.hero-title'),
      property: 'color'
    },

    {
      element: document.querySelector('.order-button'),
      property: 'backgroundColor'
    },

    {
      element: document.querySelector('.main-circle'),
      property: 'backgroundColor'
    }
  ];

  const colors = [
    'var(--purple)',
    'var(--orange)',
    'var(--blue)'
  ];

  let colorIndex = 0;

  setInterval(() => {

    colorIndex = (colorIndex + 1) % colors.length;

    animatedElements.forEach((item) => {

      if (!item.element) return;

      item.element.style[item.property] = colors[colorIndex];

    });

  }, 7000);

};

animateColor();