(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileNav() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var grid = panel.nextElementSibling ? panel.nextElementSibling.querySelector('[data-card-grid]') : document.querySelector('[data-card-grid]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
            var input = panel.querySelector('[data-filter-input]');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
            var count = panel.querySelector('[data-result-count]');
            var params = new URLSearchParams(window.location.search);

            if (input && params.get('q')) {
                input.value = params.get('q');
            }
            selects.forEach(function (select) {
                var key = select.getAttribute('data-filter-select');
                var value = params.get(key === 'keywords' ? 'genre' : key);
                if (value) {
                    select.value = value;
                }
            });

            function matches(card) {
                var q = normalize(input ? input.value : '');
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.keywords,
                    card.textContent
                ].join(' '));
                if (q && haystack.indexOf(q) === -1) {
                    return false;
                }
                for (var i = 0; i < selects.length; i += 1) {
                    var select = selects[i];
                    var key = select.getAttribute('data-filter-select');
                    var expected = normalize(select.value);
                    if (!expected) {
                        continue;
                    }
                    var actual = normalize(card.dataset[key] || card.dataset.keywords || '');
                    if (actual.indexOf(expected) === -1) {
                        return false;
                    }
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.classList.toggle('is-hidden-card', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    ready(function () {
        initMobileNav();
        initHeroSlider();
        initFilters();
    });
}());
