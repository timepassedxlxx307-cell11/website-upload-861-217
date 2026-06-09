
import { H as Hls } from './hls-dru42stk.js';

(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

    shells.forEach(function (shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-play-button]');
        var started = false;
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function attachSource() {
            var source = video.getAttribute('data-src');

            if (!source || started) {
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();
            shell.classList.add('is-playing');

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
