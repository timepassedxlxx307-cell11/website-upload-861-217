(function () {
  function initMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);

    if (!video || !streamUrl) {
      return;
    }

    var shell = video.closest('[data-player]');
    var trigger = shell ? shell.querySelector('[data-play-trigger]') : null;
    var hls = null;
    var ready = false;

    function attachStream() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function beginPlayback() {
      attachStream();

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
