(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    var start = function () {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    if (slides.length > 0) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  }

  var applyFilter = function (value) {
    var query = (value || '').trim().toLowerCase();
    var shown = 0;

    filterItems.forEach(function (item) {
      var haystack = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
      var matched = !query || haystack.indexOf(query) !== -1;
      item.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', shown === 0);
    }
  };

  if (filterInput && filterItems.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      filterInput.value = initial;
    }
    applyFilter(filterInput.value);
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector('[data-video]');
    var trigger = document.querySelector('[data-play-trigger]');
    var scrollPlay = document.querySelector('[data-scroll-play]');
    var hls = null;
    var loaded = false;

    if (!video || !url) {
      return;
    }

    var load = function () {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    };

    var play = function () {
      load();

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    if (scrollPlay) {
      scrollPlay.addEventListener('click', function () {
        window.setTimeout(play, 120);
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
