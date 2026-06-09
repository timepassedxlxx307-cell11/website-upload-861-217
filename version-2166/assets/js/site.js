(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('.hero-slide', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var cards = all('.movie-card');
        if (!cards.length) {
            return;
        }
        var searchInput = document.querySelector('[data-search-input]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var regionFilter = document.querySelector('[data-region-filter]');
        var categoryFilter = document.querySelector('[data-category-filter]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        function matchText(card, value) {
            if (!value) {
                return true;
            }
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' ').toLowerCase();
            return haystack.indexOf(value) !== -1;
        }

        function apply() {
            var text = normalize(searchInput && searchInput.value);
            var type = normalize(typeFilter && typeFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var category = normalize(categoryFilter && categoryFilter.value);

            cards.forEach(function (card) {
                var visible = matchText(card, text);
                if (visible && type) {
                    visible = normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                }
                if (visible && region) {
                    visible = normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                }
                if (visible && category) {
                    visible = normalize(card.getAttribute('data-category')) === category;
                }
                card.classList.toggle('is-hidden', !visible);
            });
        }

        [searchInput, typeFilter, regionFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    function setupPlayer() {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.play-cover');
        var stream = shell.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function prepare() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            prepare();
            if (cover) {
                cover.hidden = true;
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (cover) {
                        cover.hidden = false;
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.hidden = true;
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
