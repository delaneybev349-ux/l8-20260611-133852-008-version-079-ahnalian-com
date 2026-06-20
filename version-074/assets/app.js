(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle("is-active", pos === index);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle("is-active", pos === index);
        });
      }

      function schedule() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          schedule();
        });
      });

      schedule();
    });

    function filterCards(container, value) {
      var query = String(value || "").trim().toLowerCase();
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-filter]"));
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-filter") || "";
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    }

    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var scope = input.closest("main") || document;
      var target = scope.querySelector("[data-filter-target]");
      if (!target) {
        return;
      }
      input.addEventListener("input", function () {
        filterCards(target, input.value);
      });
      scope.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          input.value = chip.getAttribute("data-filter-chip") || chip.textContent || "";
          filterCards(target, input.value);
        });
      });
    });

    var searchInput = document.getElementById("site-search-input");
    var searchResults = document.getElementById("search-results");
    var searchTitle = document.querySelector("[data-search-title]");

    if (searchInput && searchResults) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      searchInput.value = query;

      function applySearch() {
        var value = searchInput.value.trim();
        filterCards(searchResults, value);
        if (searchTitle) {
          searchTitle.textContent = value ? "搜索：" + value : "日韩在线视频搜索";
        }
      }

      searchInput.addEventListener("input", applySearch);
      applySearch();
    }
  });
})();
