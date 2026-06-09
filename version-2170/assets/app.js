(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-search]');
    var select = scope.querySelector('[data-filter-select]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
    var container = scope.nextElementSibling;
    var empty = scope.querySelector('[data-filter-empty]');
    var activeChip = '';

    function cards() {
      if (!container) {
        return [];
      }

      return Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectValue = select ? select.value.trim().toLowerCase() : '';
      var visible = 0;

      cards().forEach(function (card) {
        var text = (card.getAttribute('data-search-index') || '').toLowerCase();
        var type = (card.getAttribute('data-type') || '').toLowerCase();
        var channel = (card.getAttribute('data-channel') || '').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchSelect = !selectValue || text.indexOf(selectValue) !== -1 || type.indexOf(selectValue) !== -1;
        var chipValue = activeChip.toLowerCase();
        var matchChip = !chipValue || text.indexOf(chipValue) !== -1 || channel === chipValue;
        var isVisible = matchKeyword && matchSelect && matchChip;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeChip = chip.value || '';
        applyFilter();
      });
    });
  });
})();
