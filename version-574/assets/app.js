(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('.hero-slider').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) return;
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    });

    document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
        var rail = wrap.querySelector('.rail');
        var prev = wrap.querySelector('.rail-prev');
        var next = wrap.querySelector('.rail-next');
        if (!rail) return;

        function move(dir) {
            rail.scrollBy({ left: dir * Math.max(280, rail.clientWidth * 0.82), behavior: 'smooth' });
        }

        if (prev) prev.addEventListener('click', function () { move(-1); });
        if (next) next.addEventListener('click', function () { move(1); });
    });

    document.querySelectorAll('[data-filterable]').forEach(function (scope) {
        var root = scope.closest('main') || document;
        var input = root.querySelector('.movie-search');
        var chips = Array.prototype.slice.call(root.querySelectorAll('.filter-chip'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = root.querySelector('.empty-state');
        var activeFilter = 'all';

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
        }

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;
            cards.forEach(function (card) {
                var hay = textOf(card);
                var okSearch = !q || hay.indexOf(q) !== -1;
                var okFilter = activeFilter === 'all' || hay.indexOf(activeFilter.toLowerCase()) !== -1;
                var visible = okSearch && okFilter;
                card.style.display = visible ? '' : 'none';
                if (visible) shown += 1;
            });
            if (empty) empty.classList.toggle('show', shown === 0);
        }

        if (input) input.addEventListener('input', apply);
        chips.forEach(function (chip, i) {
            if (i === 0) chip.classList.add('active');
            chip.addEventListener('click', function () {
                chips.forEach(function (item) { item.classList.remove('active'); });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });
        apply();
    });

    function activatePlayer(box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');
        if (!video) return;
        var src = video.getAttribute('data-stream') || '';
        if (!src) return;

        if (!video.dataset.ready) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = src;
            }
            video.dataset.ready = '1';
        }

        if (overlay) overlay.hidden = true;
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    document.querySelectorAll('.player-box').forEach(function (box) {
        var overlay = box.querySelector('.player-overlay');
        if (overlay) {
            overlay.addEventListener('click', function () {
                activatePlayer(box);
            });
        }
        box.addEventListener('click', function (event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') return;
            activatePlayer(box);
        });
    });
})();
