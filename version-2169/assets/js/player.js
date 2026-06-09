(function () {
  const shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  const video = shell.querySelector('video');
  const overlay = shell.querySelector('[data-play-button]');
  const source = video ? video.getAttribute('data-hls') : '';
  let mounted = false;
  let hlsInstance = null;
  let pending = null;

  function mount() {
    if (!video || !source) {
      return Promise.resolve();
    }

    if (mounted) {
      return pending || Promise.resolve();
    }

    mounted = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      pending = Promise.resolve();
      return pending;
    }

    if (window.Hls && window.Hls.isSupported()) {
      pending = new Promise(function (resolve) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1200);
      });
      return pending;
    }

    video.src = source;
    pending = Promise.resolve();
    return pending;
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function playVideo() {
    hideOverlay();
    mount().then(function () {
      const playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          showOverlay();
        });
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', showOverlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
