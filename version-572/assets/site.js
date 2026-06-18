(function () {
  var navButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (navButton && mobilePanel) {
    navButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function bindSearchForms() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var query = input ? input.value.trim() : '';
        var target = './movies.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function runFilters() {
    var filterRoot = document.querySelector('[data-filter-root]');
    if (!filterRoot) {
      return;
    }

    var queryInput = filterRoot.querySelector('[data-filter-query]');
    var typeInput = filterRoot.querySelector('[data-filter-type]');
    var yearInput = filterRoot.querySelector('[data-filter-year]');
    var regionInput = filterRoot.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var page = document.documentElement;

    var initialQuery = new URLSearchParams(window.location.search).get('q') || '';
    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function apply() {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var t = typeInput ? typeInput.value : '';
      var y = yearInput ? yearInput.value : '';
      var r = regionInput ? regionInput.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var hay = (card.getAttribute('data-search') || '').toLowerCase();
        var ok = true;
        if (q && hay.indexOf(q) === -1) {
          ok = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (r && (card.getAttribute('data-region') || '').indexOf(r) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (shown === 0) {
        page.classList.add('no-results');
      } else {
        page.classList.remove('no-results');
      }
    }

    [queryInput, typeInput, yearInput, regionInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });

    apply();
  }

  function runHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer;

    function show(next) {
      index = next % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        schedule();
      });
    });

    if (slides.length > 1) {
      show(0);
      schedule();
    }
  }

  function setupPlayers() {
    document.querySelectorAll('[data-play-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        var box = button.closest('[data-player]');
        if (!box) {
          return;
        }

        var video = box.querySelector('video');
        var src = button.getAttribute('data-stream');
        if (!video || !src) {
          return;
        }

        if (!video.getAttribute('data-ready')) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
          video.setAttribute('data-ready', '1');
        }

        box.classList.add('is-playing');
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      });
    });
  }

  bindSearchForms();
  runFilters();
  runHero();
  setupPlayers();
})();
