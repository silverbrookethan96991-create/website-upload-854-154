(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-site-nav]');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      navigation.classList.toggle('open');
    });
  }

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 420);
    });

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const previous = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(current + 1), 6000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', () => {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const queryPage = document.querySelector('[data-query-page]');

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const reset = scope.querySelector('[data-filter-reset]');
    const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
    const items = Array.from(scope.querySelectorAll('.filter-item'));

    const apply = () => {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const selected = new Map();

      selects.forEach((select) => {
        selected.set(select.dataset.filterSelect, select.value.trim().toLowerCase());
      });

      items.forEach((item) => {
        const text = [
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.year,
          item.dataset.tags
        ].join(' ').toLowerCase();
        let visible = keyword === '' || text.includes(keyword);

        selected.forEach((value, key) => {
          if (value && (item.dataset[key] || '').toLowerCase() !== value) {
            visible = false;
          }
        });

        item.classList.toggle('is-hidden', !visible);
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    selects.forEach((select) => {
      select.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) {
          input.value = '';
        }
        selects.forEach((select) => {
          select.value = '';
        });
        apply();
      });
    }

    if (queryPage && input) {
      const params = new URLSearchParams(window.location.search);
      const term = params.get('q');
      if (term) {
        input.value = term;
      }
    }

    apply();
  });
})();
