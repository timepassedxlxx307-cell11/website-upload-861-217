(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });

        thumbs.forEach(function (thumb, i) {
          thumb.classList.toggle('is-active', i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
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
          start();
        });
      });

      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
      var targetSelector = panel.getAttribute('data-target');
      var target = document.querySelector(targetSelector);
      var input = panel.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (!target) {
        return;
      }

      var cards = Array.prototype.slice.call(target.querySelectorAll('[data-filter]'));

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
          var matched = true;
          var haystack = (card.getAttribute('data-filter') || '').toLowerCase();

          if (text && haystack.indexOf(text) === -1) {
            matched = false;
          }

          selects.forEach(function (select) {
            var key = select.getAttribute('data-filter-key');
            var value = select.value;

            if (value && card.getAttribute('data-' + key) !== value) {
              matched = false;
            }
          });

          card.classList.toggle('filter-hidden', !matched);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      apply();
    });
  });
})();
