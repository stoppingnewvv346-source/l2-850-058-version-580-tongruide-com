(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5800);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var search = scope.querySelector("[data-search-input]");
            var year = scope.querySelector("[data-year-filter]");
            var type = scope.querySelector("[data-type-filter]");
            var category = scope.querySelector("[data-category-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            if (!cards.length) {
                return;
            }

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var categoryValue = category ? category.value : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
                    var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesYear && matchesType && matchesCategory));
                });
            }

            [search, year, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function playVideo(video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".js-play-button");
            var stream = player.getAttribute("data-stream");
            var initialized = false;
            if (!video || !stream) {
                return;
            }

            function init() {
                if (initialized) {
                    playVideo(video);
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        autoStartLoad: true,
                        maxBufferLength: 30
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hlsPlayer = hls;
                    if (window.Hls.Events && hls.on) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            playVideo(video);
                        });
                    }
                    window.setTimeout(function () {
                        playVideo(video);
                    }, 350);
                } else {
                    video.src = stream;
                    video.load();
                    playVideo(video);
                }
            }

            if (button) {
                button.addEventListener("click", function () {
                    init();
                    player.classList.add("is-playing");
                });
            }
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
