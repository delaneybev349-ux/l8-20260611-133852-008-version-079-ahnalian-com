(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  document.querySelectorAll("[data-list-filter]").forEach(function (scope) {
    var keyword = scope.querySelector("[data-filter-keyword]");
    var type = scope.querySelector("[data-filter-type]");
    var year = scope.querySelector("[data-filter-year]");
    var empty = scope.querySelector("[data-empty]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    function match(card) {
      var key = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.tags].join(" ").toLowerCase();
      var byKeyword = !key || text.indexOf(key) !== -1;
      var byType = !selectedType || card.dataset.type === selectedType;
      var byYear = !selectedYear || card.dataset.year === selectedYear;
      return byKeyword && byType && byYear;
    }
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [keyword, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });
  });

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage && typeof MOVIES_INDEX !== "undefined") {
    var searchInput = searchPage.querySelector("[data-search-keyword]");
    var searchType = searchPage.querySelector("[data-search-type]");
    var searchYear = searchPage.querySelector("[data-search-year]");
    var results = searchPage.querySelector("[data-search-results]");
    var emptySearch = searchPage.querySelector("[data-empty]");

    function card(movie) {
      return [
        '<a class="movie-card" href="' + movie.href + '">',
        '<span class="card-cover">',
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '<span class="type-badge">' + movie.type + '</span>',
        '<span class="score-badge">' + movie.score + '</span>',
        '</span>',
        '<span class="movie-card-body">',
        '<h2 class="movie-title">' + movie.title + '</h2>',
        '<span class="movie-line">' + movie.oneLine + '</span>',
        '<span class="movie-meta"><b>' + movie.year + '</b><i>' + movie.region + '</i></span>',
        '<span class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</span>',
        '</span>',
        '</a>'
      ].join('');
    }

    function applySearch() {
      var key = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var selectedType = searchType ? searchType.value : "";
      var selectedYear = searchYear ? searchYear.value : "";
      var list = MOVIES_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
        return (!key || text.indexOf(key) !== -1) && (!selectedType || movie.type === selectedType) && (!selectedYear || movie.year === selectedYear);
      }).slice(0, 120);
      results.innerHTML = list.map(card).join("");
      if (emptySearch) {
        emptySearch.classList.toggle("is-visible", list.length === 0);
      }
    }

    [searchInput, searchType, searchYear].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applySearch);
        field.addEventListener("change", applySearch);
      }
    });
    applySearch();
  }
}());
