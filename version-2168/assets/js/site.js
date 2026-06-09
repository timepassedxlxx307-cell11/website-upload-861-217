(function () {
  var ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var searchBox = scope.querySelector("[data-search-box]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-pill]"));
      var activeFilter = "all";

      var applyFilter = function () {
        var query = searchBox ? searchBox.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
        });
      };

      if (searchBox) {
        searchBox.addEventListener("input", applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-pill") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilter();
        });
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
          if (!Number.isNaN(index)) {
            showSlide(index);
          }
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }

      var stream = video.getAttribute("data-stream");
      var attached = false;
      var hlsPlayer = null;

      var attachStream = function () {
        if (attached || !stream) {
          return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsPlayer.loadSource(stream);
          hlsPlayer.attachMedia(video);
        } else {
          video.src = stream;
        }
      };

      var startPlay = function () {
        attachStream();
        player.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      };

      button.addEventListener("click", startPlay);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    });
  });
})();
