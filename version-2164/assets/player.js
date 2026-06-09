(function () {
  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var hls = null;

    if (!video || !button || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function play() {
      attach();
      button.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function () {
      if (!attached) {
        play();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
