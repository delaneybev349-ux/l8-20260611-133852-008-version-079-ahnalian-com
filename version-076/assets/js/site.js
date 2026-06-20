(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var hero = document.querySelector(".hero");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        if (slides.length > 0) {
            showSlide(0);
            startHero();
        }
    }

    var filterForm = document.querySelector(".filters");

    if (filterForm) {
        var keywordInput = filterForm.querySelector("[data-filter='keyword']");
        var yearSelect = filterForm.querySelector("[data-filter='year']");
        var typeSelect = filterForm.querySelector("[data-filter='type']");
        var genreSelect = filterForm.querySelector("[data-filter='genre']");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function normalize(value) {
            return (value || "").toString().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region")
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                var matchesType = !type || card.getAttribute("data-type") === type;
                var matchesGenre = !genre || normalize(card.getAttribute("data-genre")).indexOf(normalize(genre)) !== -1;

                card.style.display = matchesKeyword && matchesYear && matchesType && matchesGenre ? "" : "none";
            });
        }

        [keywordInput, yearSelect, typeSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }
})();
