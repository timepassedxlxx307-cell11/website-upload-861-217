(function () {
  const body = document.body;
  const menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      const opened = body.classList.toggle('nav-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        showSlide(position);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  const filterGrid = document.querySelector('[data-filter-grid]');

  if (filterGrid) {
    const input = document.querySelector('[data-filter-search]');
    const sort = document.querySelector('[data-sort-select]');
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));

    function applyFilters() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' ').toLowerCase();
        card.style.display = !keyword || haystack.includes(keyword) ? '' : 'none';
      });
    }

    function applySort() {
      if (!sort) {
        return;
      }

      const value = sort.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (value === 'rating') {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }
        if (value === 'views') {
          return Number(b.dataset.views) - Number(a.dataset.views);
        }
        if (value === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return 0;
      });

      sorted.forEach(function (card) {
        filterGrid.appendChild(card);
      });
      applyFilters();
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (sort) {
      sort.addEventListener('change', applySort);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults && typeof SEARCH_MOVIES !== 'undefined') {
    const regionFilter = document.querySelector('[data-region-filter]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const summary = document.querySelector('[data-search-summary]');
    const params = new URLSearchParams(window.location.search);

    function uniqueValues(key) {
      return Array.from(new Set(SEARCH_MOVIES.map(function (movie) {
        return movie[key];
      }).filter(Boolean))).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-CN');
      });
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function movieTemplate(movie) {
      return [
        '<a class="movie-card" href="details/' + movie.filename + '">',
        '  <figure class="card-cover">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
        '    <span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
        '    <span class="play-mark">▶</span>',
        '  </figure>',
        '  <div class="card-body">',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>★ ' + escapeHtml(movie.rating) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '    </div>',
        '  </div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch() {
      const keyword = searchInput.value.trim().toLowerCase();
      const region = regionFilter ? regionFilter.value : '';
      const type = typeFilter ? typeFilter.value : '';
      const year = yearFilter ? yearFilter.value : '';

      const matches = SEARCH_MOVIES.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' ').toLowerCase();
        return (!keyword || haystack.includes(keyword)) &&
          (!region || movie.region === region) &&
          (!type || movie.type === type) &&
          (!year || movie.year === year);
      }).slice(0, 120);

      searchResults.innerHTML = matches.map(movieTemplate).join('');
      if (summary) {
        summary.textContent = matches.length ? '已找到相关影片' : '暂无匹配影片';
      }
    }

    fillSelect(regionFilter, uniqueValues('region'));
    fillSelect(typeFilter, uniqueValues('type'));
    fillSelect(yearFilter, uniqueValues('year'));
    searchInput.value = params.get('q') || '';

    [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', renderSearch);
        control.addEventListener('change', renderSearch);
      }
    });

    renderSearch();
  }
})();
