function startMoviePlayer(sourceUrl) {
    var video = document.querySelector('.movie-player');
    var overlay = document.querySelector('.player-overlay');
    var started = false;

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    function attach() {
        if (started) {
            return;
        }

        started = true;
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        overlay.classList.add('is-hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    overlay.addEventListener('click', attach);
    video.addEventListener('click', function () {
        if (started && video.paused) {
            video.play();
        }
    });
}
