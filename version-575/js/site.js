(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      const open = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const input = document.querySelector('.movie-filter-input');
  const regionSelect = document.querySelector('[data-filter-region]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const emptyState = document.querySelector('[data-empty-state]');

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query && input) {
    input.value = query;
  }

  const filterCards = function () {
    if (!cards.length) {
      return;
    }

    const keyword = input ? input.value.trim().toLowerCase() : '';
    const region = regionSelect ? regionSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = card.getAttribute('data-search') || '';
      const regionValue = card.getAttribute('data-region') || '';
      const typeValue = card.getAttribute('data-type') || '';
      const yearValue = card.getAttribute('data-year') || '';
      const matched = (!keyword || haystack.includes(keyword)) &&
        (!region || regionValue.includes(region)) &&
        (!type || typeValue.includes(type)) &&
        (!year || yearValue === year);

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  [input, regionSelect, typeSelect, yearSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterCards);
      element.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();

function initVideoPlayer(streamUrl) {
  const video = document.getElementById('movie-video');
  const startButton = document.getElementById('player-start');
  let ready = false;
  let hls = null;

  if (!video || !streamUrl) {
    return;
  }

  const attachStream = function () {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    ready = true;
  };

  const startPlayback = function () {
    attachStream();
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  };

  if (startButton) {
    startButton.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('error', function () {
    if (hls) {
      hls.destroy();
      hls = null;
      ready = false;
    }
  });
}
