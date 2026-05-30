(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    window.setInterval(function () {
      showSlide(active + 1);
    }, 6200);
  }

  var filterBox = qs('[data-filter-box]');
  var cardGrid = qs('[data-card-grid]');

  if (filterBox && cardGrid) {
    var searchInput = qs('[data-local-search]', filterBox);
    var typeSelect = qs('[data-type-filter]', filterBox);
    var regionInput = qs('[data-region-filter]', filterBox);
    var cards = qsa('[data-card]', cardGrid);

    function applyFilters() {
      var searchValue = normalize(searchInput && searchInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var regionValue = normalize(regionInput && regionInput.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var typeText = normalize(card.getAttribute('data-type'));
        var regionText = normalize(card.getAttribute('data-region'));
        var matched = true;

        if (searchValue && text.indexOf(searchValue) === -1) {
          matched = false;
        }
        if (typeValue && typeText.indexOf(typeValue) === -1) {
          matched = false;
        }
        if (regionValue && regionText.indexOf(regionValue) === -1) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    }

    [searchInput, typeSelect, regionInput].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  var searchResults = qs('[data-search-results]');

  if (searchResults && window.MOVIES_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var input = qs('[data-search-input]');

    if (input) {
      input.value = params.get('q') || '';
    }

    function createCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="poster-wrap" href="' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
        '</a>',
        '<div class="movie-info">',
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    var source = window.MOVIES_INDEX.slice();
    var results;

    if (query) {
      results = source.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ')).indexOf(query) !== -1;
      }).slice(0, 120);
    } else {
      results = source.slice(0, 48);
    }

    if (results.length) {
      searchResults.innerHTML = results.map(createCard).join('');
    } else {
      searchResults.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试其他关键词。</div>';
    }
  }
})();
