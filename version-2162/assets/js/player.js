(function () {
    function attachSource(video, source) {
        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    window.createMoviePlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !cover || !source) {
            return;
        }
        var box = video.closest('[data-player-box]');
        var loaded = false;

        function start() {
            if (!loaded) {
                attachSource(video, source);
                loaded = true;
            }
            if (box) {
                box.classList.add('is-playing');
            }
            cover.style.display = 'none';
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('is-playing');
            }
            cover.style.display = 'none';
        });
        video.addEventListener('ended', function () {
            if (box) {
                box.classList.remove('is-playing');
            }
        });
    };
})();
