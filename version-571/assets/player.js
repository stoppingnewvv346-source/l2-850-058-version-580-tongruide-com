(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initPlayer(card) {
        var video = card.querySelector('.hls-player');
        var startButton = card.querySelector('[data-player-start]');
        var status = card.querySelector('[data-player-status]');
        if (!video || !startButton) {
            return;
        }
        var source = video.getAttribute('data-src');
        var initialized = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;

            if (!source) {
                setStatus('未检测到播放源。');
                return Promise.reject(new Error('missing source'));
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('已使用浏览器原生 HLS 播放。');
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('HLS 播放源加载完成。');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放加载失败，请刷新页面或稍后重试。');
                    }
                });
                return Promise.resolve();
            }

            video.src = source;
            setStatus('当前浏览器不支持 HLS.js，已尝试直接播放源。');
            return Promise.resolve();
        }

        startButton.addEventListener('click', function () {
            attachSource().then(function () {
                startButton.classList.add('is-hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
                    });
                }
            }).catch(function () {
                startButton.classList.remove('is-hidden');
            });
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player-card]')).forEach(initPlayer);
    });
}());
