(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setImageFallbacks() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                image.removeAttribute("src");
            });
        });
    }

    function bindMenus() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function bindGlobalSearch() {
        document.querySelectorAll("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var url = form.getAttribute("data-search-url") || "search.html";
                var query = input ? input.value.trim() : "";
                window.location.href = query ? url + "?q=" + encodeURIComponent(query) : url;
            });
        });
    }

    function bindFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var select = scope.querySelector("[data-filter-select]");
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (input && input.hasAttribute("data-query-input") && initialQuery) {
                input.value = initialQuery;
            }
            function applyFilter() {
                var text = input ? input.value.trim().toLowerCase() : "";
                var selected = select ? select.value.trim().toLowerCase() : "";
                list.querySelectorAll("[data-filter-item]").forEach(function (item) {
                    var haystack = ((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "")).toLowerCase();
                    var matchedText = !text || haystack.indexOf(text) !== -1;
                    var matchedSelect = !selected || haystack.indexOf(selected) !== -1;
                    item.classList.toggle("hidden", !(matchedText && matchedSelect));
                });
            }
            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (select) {
                select.addEventListener("change", applyFilter);
            }
            applyFilter();
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
    }

    window.initMoviePlayer = function (streamUrl) {
        ready(function () {
            var video = document.getElementById("moviePlayer");
            var cover = document.querySelector(".player-cover");
            var button = document.querySelector("[data-play-button]");
            var hlsInstance = null;
            if (!video || !streamUrl) {
                return;
            }
            function attachStream() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                video.setAttribute("data-ready", "1");
            }
            function start() {
                attachStream();
                if (cover) {
                    cover.classList.add("hidden");
                }
                video.controls = true;
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {
                        if (cover) {
                            cover.classList.remove("hidden");
                        }
                    });
                }
            }
            if (button) {
                button.addEventListener("click", start);
            }
            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        setImageFallbacks();
        bindMenus();
        bindGlobalSearch();
        bindFilters();
        bindHero();
    });
})();
