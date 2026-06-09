(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                play();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = selectAll('[data-filter-card]', list);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            input.value = initial;
        }

        function applyFilter(value) {
            var keyword = normalize(value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.year
                ].join(' '));
                card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
            });
        }

        input.addEventListener('input', function () {
            applyFilter(input.value);
        });
        selectAll('[data-filter-key]').forEach(function (button) {
            button.addEventListener('click', function () {
                input.value = button.dataset.filterKey || button.textContent || '';
                applyFilter(input.value);
                input.focus();
            });
        });
        applyFilter(input.value);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
