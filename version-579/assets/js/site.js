(() => {
    const ready = (fn) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    };

    const textOf = (value) => String(value || '').toLowerCase();

    const htmlEscape = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[char]));

    const getRoot = () => document.body.getAttribute('data-root-prefix') || '';

    ready(() => {
        const root = getRoot();
        const toggle = document.querySelector('[data-menu-toggle]');
        const panel = document.querySelector('[data-mobile-panel]');

        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                panel.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-search-form]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                const input = form.querySelector('input[name="q"]');
                const q = input ? input.value.trim() : '';
                if (!q) {
                    return;
                }
                event.preventDefault();
                window.location.href = `${root}search.html?q=${encodeURIComponent(q)}`;
            });
        });

        document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
            const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
            const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
            const prev = slider.querySelector('[data-hero-prev]');
            const next = slider.querySelector('[data-hero-next]');
            let active = 0;
            let timer = null;

            const show = (index) => {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
                dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
            };

            const start = () => {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(() => show(active + 1), 5200);
            };

            if (prev) {
                prev.addEventListener('click', () => {
                    show(active - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', () => {
                    show(active + 1);
                    start();
                });
            }

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    show(index);
                    start();
                });
            });

            show(0);
            start();
        });

        document.querySelectorAll('[data-player]').forEach((box) => {
            const video = box.querySelector('video[data-hls]');
            const trigger = box.querySelector('[data-player-trigger]');
            let initialized = false;

            const startVideo = () => {
                if (!video) {
                    return;
                }
                const src = video.getAttribute('data-hls');
                if (!initialized && src) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        const hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        box._hls = hls;
                    } else {
                        video.src = src;
                    }
                    initialized = true;
                }
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
                video.controls = true;
                const promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(() => {
                        if (trigger) {
                            trigger.classList.remove('is-hidden');
                        }
                    });
                }
            };

            if (trigger) {
                trigger.addEventListener('click', startVideo);
            }

            if (video) {
                video.addEventListener('click', () => {
                    if (video.paused) {
                        startVideo();
                    }
                });
            }
        });

        document.querySelectorAll('[data-local-filter]').forEach((panel) => {
            const keyword = panel.querySelector('[data-filter-keyword]');
            const region = panel.querySelector('[data-filter-region]');
            const year = panel.querySelector('[data-filter-year]');
            const category = panel.querySelector('[data-filter-category]');
            const grid = document.querySelector('[data-filter-grid]');
            const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];

            const run = () => {
                const q = textOf(keyword && keyword.value).trim();
                const r = region && region.value;
                const y = year && year.value;
                const c = category && category.value;
                cards.forEach((card) => {
                    const haystack = textOf(card.innerText);
                    const matched = (!q || haystack.includes(q)) &&
                        (!r || card.getAttribute('data-region') === r) &&
                        (!y || card.getAttribute('data-year') === y) &&
                        (!c || card.getAttribute('data-category') === c);
                    card.style.display = matched ? '' : 'none';
                });
            };

            [keyword, region, year, category].forEach((el) => {
                if (el) {
                    el.addEventListener('input', run);
                    el.addEventListener('change', run);
                }
            });
        });

        const searchApp = document.querySelector('[data-search-app]');
        if (searchApp) {
            const keyword = searchApp.querySelector('[data-search-keyword]');
            const region = searchApp.querySelector('[data-search-region]');
            const year = searchApp.querySelector('[data-search-year]');
            const category = searchApp.querySelector('[data-search-category]');
            const results = document.querySelector('[data-search-results]');
            const summary = searchApp.querySelector('[data-search-summary]');
            const params = new URLSearchParams(window.location.search);
            let movies = [];

            if (keyword && params.get('q')) {
                keyword.value = params.get('q');
            }

            const render = () => {
                const q = textOf(keyword && keyword.value).trim();
                const r = region && region.value;
                const y = year && year.value;
                const c = category && category.value;
                const matched = movies.filter((movie) => {
                    const haystack = textOf([movie.title, movie.region, movie.type, movie.year, movie.genreRaw, movie.oneLine, movie.summary, (movie.tags || []).join(' ')].join(' '));
                    return (!q || haystack.includes(q)) &&
                        (!r || movie.region === r) &&
                        (!y || String(movie.year) === y) &&
                        (!c || movie.categorySlug === c);
                }).slice(0, 120);

                if (summary) {
                    summary.textContent = matched.length ? `已匹配 ${matched.length} 条内容` : '没有匹配内容';
                }

                if (!results) {
                    return;
                }

                results.innerHTML = matched.map((movie) => {
                    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${htmlEscape(tag)}</span>`).join('');
                    return `<article class="movie-card" data-title="${htmlEscape(movie.title)}" data-region="${htmlEscape(movie.region)}" data-year="${htmlEscape(movie.year)}" data-category="${htmlEscape(movie.categorySlug)}">
    <a class="poster" href="${htmlEscape(movie.url)}" aria-label="${htmlEscape(movie.title)}">
        <img src="${htmlEscape(movie.cover)}" alt="${htmlEscape(movie.title)}" loading="lazy" onerror="this.style.display='none';">
        <span class="poster-title">${htmlEscape(movie.title)}</span>
    </a>
    <div class="movie-info">
        <div class="movie-meta">
            <span>${htmlEscape(movie.region)}</span>
            <span>${htmlEscape(movie.year)}</span>
            <span>${htmlEscape(movie.type)}</span>
        </div>
        <h3><a href="${htmlEscape(movie.url)}">${htmlEscape(movie.title)}</a></h3>
        <p>${htmlEscape(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
    </div>
</article>`;
                }).join('');
            };

            fetch(searchApp.getAttribute('data-json'))
                .then((response) => response.json())
                .then((data) => {
                    movies = data;
                    render();
                })
                .catch(() => {
                    if (summary) {
                        summary.textContent = '搜索暂不可用';
                    }
                });

            [keyword, region, year, category].forEach((el) => {
                if (el) {
                    el.addEventListener('input', render);
                    el.addEventListener('change', render);
                }
            });
        }
    });
})();
