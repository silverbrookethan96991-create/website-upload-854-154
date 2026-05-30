(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      showSlide(0);
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var urlKeyword = "";
    try {
      urlKeyword = new URLSearchParams(window.location.search).get("q") || "";
    } catch (error) {
      urlKeyword = "";
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    filterInputs.forEach(function (input) {
      if (urlKeyword && !input.value) {
        input.value = urlKeyword;
      }

      var scope = document.querySelector(input.getAttribute("data-card-filter")) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = document.querySelector(input.getAttribute("data-empty-target"));

      function filterCards() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      input.addEventListener("input", filterCards);
      filterCards();
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.closest("[data-filter-group]");
        if (!group) {
          return;
        }
        var target = document.querySelector(group.getAttribute("data-filter-group"));
        if (!target) {
          return;
        }
        var value = button.getAttribute("data-filter-button");
        var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
        group.querySelectorAll("[data-filter-button]").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        cards.forEach(function (card) {
          var text = [card.getAttribute("data-kind"), card.getAttribute("data-region"), card.getAttribute("data-year")].join(" ");
          card.style.display = value === "all" || text.indexOf(value) !== -1 ? "" : "none";
        });
      });
    });
  });
})();
