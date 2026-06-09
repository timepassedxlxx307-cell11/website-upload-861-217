const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.heroDot));
    });
  });

  if (slides.length > 1) {
    setInterval(() => showSlide(current + 1), 5200);
  }
}

const normalizeText = (value) => (value || "").toString().trim().toLowerCase();

const applyCardFilter = (keyword) => {
  const words = normalizeText(keyword).split(/\s+/).filter(Boolean);
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  let visible = 0;

  cards.forEach((card) => {
    const haystack = normalizeText(card.dataset.search || card.textContent);
    const matched = words.length === 0 || words.some((word) => haystack.includes(word));
    card.classList.toggle("hidden-by-filter", !matched);
    if (matched) {
      visible += 1;
    }
  });

  const status = document.querySelector("[data-search-status]");
  if (status) {
    status.textContent = words.length === 0 ? "输入关键词后将自动筛选结果。" : `已筛选出 ${visible} 条相关内容。`;
  }
};

const pageSearch = document.querySelector("[data-page-search]");

if (pageSearch) {
  pageSearch.addEventListener("input", () => {
    applyCardFilter(pageSearch.value);
  });
}

const filterPanel = document.querySelector("[data-filter-panel]");

if (filterPanel) {
  const chips = Array.from(filterPanel.querySelectorAll("[data-filter-value]"));
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      applyCardFilter(chip.dataset.filterValue || "");
      if (pageSearch) {
        pageSearch.value = "";
      }
    });
  });
}

const globalSearch = document.querySelector("[data-global-search]");
const query = new URLSearchParams(window.location.search).get("q") || "";

if (globalSearch) {
  globalSearch.value = query;
  applyCardFilter(query);
  globalSearch.addEventListener("input", () => {
    applyCardFilter(globalSearch.value);
  });
}

const backTop = document.querySelector("[data-back-top]");

if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("visible", window.scrollY > 520);
  });
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const player = document.querySelector("[data-player]");

if (player) {
  const video = player.querySelector("video");
  const playButton = player.querySelector("[data-play-button]");
  let hlsInstance = null;
  let loading = false;

  const startVideo = async () => {
    if (!video || loading) {
      return;
    }

    const source = video.dataset.src;
    if (!source) {
      return;
    }

    loading = true;
    player.classList.add("playing");

    try {
      const module = await import("./hls-dru42stk.js");
      const Hls = module.H;

      if (Hls && Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else {
          video.play().catch(() => {});
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = source;
        }
        await video.play();
      } else {
        if (!video.src) {
          video.src = source;
        }
        await video.play();
      }
    } catch (error) {
      if (!video.src) {
        video.src = source;
      }
      video.play().catch(() => {});
    } finally {
      loading = false;
    }
  };

  if (playButton) {
    playButton.addEventListener("click", startVideo);
  }

  video.addEventListener("click", () => {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener("play", () => {
    player.classList.add("playing");
  });

  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended) {
      player.classList.remove("playing");
    }
  });
}
