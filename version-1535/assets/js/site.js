(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setMobileNav() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 6500);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function applyCards(targetSelector) {
        var target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }
        var input = document.querySelector('[data-card-search="' + targetSelector + '"]');
        var activeButton = document.querySelector('[data-filter-target="' + targetSelector + '"].is-active');
        var query = input ? input.value.trim().toLowerCase() : "";
        var filterValue = activeButton ? activeButton.getAttribute("data-filter-value").toLowerCase() : "";
        var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchFilter = !filterValue || text.indexOf(filterValue) !== -1;
            var show = matchQuery && matchFilter;
            card.classList.toggle("is-hidden", !show);
            if (show) {
                visible += 1;
            }
        });

        var empty = document.querySelector('[data-empty-state="' + targetSelector + '"]');
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setCardTools() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
        inputs.forEach(function (input) {
            var targetSelector = input.getAttribute("data-card-search");
            input.addEventListener("input", function () {
                applyCards(targetSelector);
            });
            applyCards(targetSelector);
        });

        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var targetSelector = button.getAttribute("data-filter-target");
                buttons
                    .filter(function (item) {
                        return item.getAttribute("data-filter-target") === targetSelector;
                    })
                    .forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                button.classList.add("is-active");
                applyCards(targetSelector);
            });
        });
    }

    window.initMoviePlayer = function (source) {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var playButton = player.querySelector("[data-play-button]");
        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            attached = true;
        }

        function playVideo() {
            attachSource();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            video.controls = true;
            var request = video.play();

            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        if (playButton) {
            playButton.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setMobileNav();
        setHero();
        setCardTools();
    });
})();
