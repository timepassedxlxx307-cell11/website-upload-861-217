
(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var backToTop = document.querySelector('[data-back-to-top]');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backToTop.classList.add('is-visible');
            } else {
                backToTop.classList.remove('is-visible');
            }
        });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var cardFilter = document.querySelector('[data-card-filter]');

    if (cardFilter) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        cardFilter.addEventListener('input', function () {
            var query = cardFilter.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region')
                ].join(' ').toLowerCase();

                card.style.display = haystack.indexOf(query) >= 0 ? '' : 'none';
            });
        });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchStatus = document.querySelector('[data-search-status]');

    if (searchInput && searchResults && searchStatus && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        function renderSearch(query) {
            var normalized = query.trim().toLowerCase();
            searchResults.innerHTML = '';

            if (!normalized) {
                searchStatus.textContent = '请输入关键词开始搜索。';
                return;
            }

            var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();

                return text.indexOf(normalized) >= 0;
            }).slice(0, 120);

            searchStatus.textContent = '找到 ' + results.length + ' 条相关影片。';

            results.forEach(function (movie) {
                var card = document.createElement('article');
                card.className = 'movie-card';
                card.innerHTML = [
                    '<a class="movie-poster" href="./' + movie.url + '">',
                    '    <img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '    <span class="play-chip">播放</span>',
                    '    <span class="score-chip">' + movie.rating + '</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '    <div class="movie-meta-line">',
                    '        <span>' + escapeHtml(movie.year) + '</span>',
                    '        <span>' + escapeHtml(movie.region) + '</span>',
                    '        <span>' + escapeHtml(movie.type) + '</span>',
                    '    </div>',
                    '    <h2><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
                    '    <p>' + escapeHtml(movie.oneLine) + '</p>',
                    '</div>'
                ].join('');
                searchResults.appendChild(card);
            });
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        searchInput.addEventListener('input', function () {
            renderSearch(searchInput.value);
        });

        renderSearch(initialQuery);
    }
})();
