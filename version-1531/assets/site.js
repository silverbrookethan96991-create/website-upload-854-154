(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      });
    });

    var menuButton = document.querySelector("[data-menu-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");
    var topSearch = document.querySelector(".top-search");

    if (menuButton && mainNav) {
      menuButton.addEventListener("click", function () {
        var expanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!expanded));
        mainNav.classList.toggle("open", !expanded);
        if (topSearch) {
          topSearch.classList.toggle("open", !expanded);
        }
      });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./all.html";
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    }

    document.querySelectorAll("[data-hero-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        setSlide(currentSlide + 1);
      });
    });

    document.querySelectorAll("[data-hero-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        setSlide(currentSlide - 1);
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setSlide(currentSlide + 1);
      }, 6200);
    }

    setSlide(0);

    var filterGrid = document.querySelector("[data-filter-grid]");
    if (filterGrid) {
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll("[data-card]"));
      var searchInput = document.querySelector("[data-filter-search]");
      var sortSelect = document.querySelector("[data-filter-sort]");
      var typeSelect = document.querySelector("[data-filter-type]");
      var regionSelect = document.querySelector("[data-filter-region]");
      var yearSelect = document.querySelector("[data-filter-year]");
      var tagButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tag-filter]"));
      var clearButton = document.querySelector("[data-filter-clear]");
      var noResults = document.querySelector("[data-no-results]");
      var params = new URLSearchParams(window.location.search);
      var activeTag = normalize(params.get("tag"));

      if (searchInput && params.get("q")) {
        searchInput.value = params.get("q");
      }
      if (sortSelect && params.get("sort")) {
        sortSelect.value = params.get("sort");
      }
      if (typeSelect && params.get("type")) {
        typeSelect.value = params.get("type");
      }
      if (regionSelect && params.get("region")) {
        regionSelect.value = params.get("region");
      }
      if (yearSelect && params.get("year")) {
        yearSelect.value = params.get("year");
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.genre,
          card.dataset.type,
          card.dataset.region,
          card.dataset.year
        ].join(" "));
      }

      function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : "");
        var sortBy = sortSelect ? sortSelect.value : "hot";
        var typeValue = typeSelect ? typeSelect.value : "";
        var regionValue = regionSelect ? regionSelect.value : "";
        var yearValue = yearSelect ? yearSelect.value : "";
        var visibleCards = cards.filter(function (card) {
          var matchQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchType = !typeValue || card.dataset.type === typeValue;
          var matchRegion = !regionValue || card.dataset.region === regionValue;
          var matchYear = !yearValue || card.dataset.year === yearValue;
          var matchTag = !activeTag || normalize(card.dataset.tags).indexOf(activeTag) !== -1 || normalize(card.dataset.genre).indexOf(activeTag) !== -1;
          return matchQuery && matchType && matchRegion && matchYear && matchTag;
        });

        visibleCards.sort(function (a, b) {
          if (sortBy === "latest") {
            return Number(b.dataset.yearnum || 0) - Number(a.dataset.yearnum || 0);
          }
          if (sortBy === "views") {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          if (sortBy === "title") {
            return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
          }
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });

        cards.forEach(function (card) {
          card.style.display = "none";
        });

        visibleCards.forEach(function (card) {
          card.style.display = "";
          filterGrid.appendChild(card);
        });

        if (noResults) {
          noResults.style.display = visibleCards.length ? "none" : "block";
        }
      }

      [searchInput, sortSelect, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      tagButtons.forEach(function (button) {
        if (activeTag && normalize(button.dataset.tagFilter) === activeTag) {
          button.classList.add("active");
        }
        button.addEventListener("click", function () {
          var tag = normalize(button.dataset.tagFilter);
          activeTag = activeTag === tag ? "" : tag;
          tagButtons.forEach(function (item) {
            item.classList.toggle("active", normalize(item.dataset.tagFilter) === activeTag);
          });
          applyFilters();
        });
      });

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          activeTag = "";
          if (searchInput) {
            searchInput.value = "";
          }
          if (sortSelect) {
            sortSelect.value = "hot";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          tagButtons.forEach(function (button) {
            button.classList.remove("active");
          });
          applyFilters();
        });
      }

      applyFilters();
    }

    document.querySelectorAll("[data-share]").forEach(function (button) {
      button.addEventListener("click", function () {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = "链接已复制";
            setTimeout(function () {
              button.textContent = "分享";
            }, 1600);
          });
        }
      });
    });

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      window.addEventListener("scroll", function () {
        backTop.classList.toggle("show", window.scrollY > 600);
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
})();
