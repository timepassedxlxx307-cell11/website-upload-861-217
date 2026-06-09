(function () {
    var form = document.querySelector('.search-form');
    var keyword = document.querySelector('#search-keyword');
    var typeFilter = document.querySelector('#search-type');
    var yearFilter = document.querySelector('#search-year');
    var results = document.querySelector('#search-results');
    var empty = document.querySelector('#search-empty');

    if (!form || !keyword || !results || !window.MOVIES) {
        return;
    }

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '    <a class="poster-link" href="' + movie.url + '">',
            '        <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
            '        <span class="poster-badge">' + movie.type + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line">',
            '            <span>' + movie.year + '</span>',
            '            <span>' + movie.region + '</span>',
            '            <span>' + movie.genre + '</span>',
            '        </div>',
            '        <h2><a href="' + movie.url + '">' + movie.title + '</a></h2>',
            '        <p>' + movie.oneLine + '</p>',
            '        <a class="watch-link" href="' + movie.url + '">立即观看</a>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function render() {
        var q = normalize(keyword.value);
        var selectedType = normalize(typeFilter ? typeFilter.value : '');
        var selectedYear = normalize(yearFilter ? yearFilter.value : '');
        var list = window.MOVIES.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(' '));
            var matchKeyword = !q || haystack.indexOf(q) !== -1;
            var matchType = !selectedType || normalize(movie.type).indexOf(selectedType) !== -1 || normalize(movie.genre).indexOf(selectedType) !== -1;
            var matchYear = !selectedYear || normalize(movie.year) === selectedYear;
            return matchKeyword && matchType && matchYear;
        }).slice(0, 120);

        results.innerHTML = list.map(card).join('');

        if (empty) {
            empty.style.display = list.length ? 'none' : 'block';
        }
    }

    var initial = params().get('q') || '';
    keyword.value = initial;

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var next = new URLSearchParams();

        if (keyword.value.trim()) {
            next.set('q', keyword.value.trim());
        }

        history.replaceState(null, '', window.location.pathname + (next.toString() ? '?' + next.toString() : ''));
        render();
    });

    [keyword, typeFilter, yearFilter].forEach(function (input) {
        if (input) {
            input.addEventListener('input', render);
            input.addEventListener('change', render);
        }
    });

    render();
})();
