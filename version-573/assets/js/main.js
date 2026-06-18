(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var year = panel.querySelector("[data-year-filter]");
      var type = panel.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var empty = document.querySelector("[data-empty-state]");
      var filterButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-category]"));
      var activeCategory = "";

      function match(card) {
        var keyword = text(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.textContent
        ].map(text).join(" ");
        var okKeyword = !keyword || haystack.indexOf(keyword) > -1;
        var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var okType = !typeValue || card.getAttribute("data-type") === typeValue;
        var okCategory = !activeCategory || card.getAttribute("data-category") === activeCategory;
        return okKeyword && okYear && okType && okCategory;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = match(card);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-filter-category") || "";
          filterButtons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function bindStream(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function initPlayer(id, url) {
    ready(function () {
      var root = document.getElementById(id);
      if (!root) {
        return;
      }
      var video = root.querySelector("video");
      var button = root.querySelector(".player-button");
      var cover = root.querySelector(".player-cover");
      if (!video) {
        return;
      }
      function start() {
        if (!video.getAttribute("data-ready")) {
          bindStream(video, url);
          video.setAttribute("data-ready", "1");
        }
        root.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  window.MoviePlayer = {
    boot: initPlayer
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
