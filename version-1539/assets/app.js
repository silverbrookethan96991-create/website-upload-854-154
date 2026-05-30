(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = selectAll('.hero-slide');
        var dots = selectAll('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var cards = selectAll('[data-card]');
        var chips = selectAll('[data-filter-value]');
        var empty = document.querySelector('[data-empty-filter]');
        if (!cards.length) {
            return;
        }

        var state = {
            text: '',
            chip: ''
        };

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var text = normalize(state.text);
            var chip = normalize(state.chip);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matchesText = !text || haystack.indexOf(text) !== -1;
                var matchesChip = !chip || haystack.indexOf(chip) !== -1;
                var shouldShow = matchesText && matchesChip;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (query) {
                input.value = query;
                state.text = query;
            }
            input.addEventListener('input', function () {
                state.text = input.value;
                apply();
            });
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                state.chip = chip.getAttribute('data-filter-value') || '';
                apply();
            });
        });

        apply();
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function attachStream(video, url) {
        if (!video || !url) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }
        loadHlsLibrary(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (video._hlsPlayer) {
                    video._hlsPlayer.destroy();
                }
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                video._hlsPlayer = hls;
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = url;
                video.play().catch(function () {});
            }
        });
    }

    function setupPlayers() {
        selectAll('[data-player]').forEach(function (panel) {
            var button = panel.querySelector('[data-play-button]');
            var video = panel.querySelector('video');
            if (!button || !video) {
                return;
            }
            button.addEventListener('click', function () {
                panel.classList.add('playing');
                video.setAttribute('controls', 'controls');
                attachStream(video, video.getAttribute('data-stream'));
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
