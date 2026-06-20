(function () {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    if (navToggle && nav) {
        navToggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    const filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
        const keywordInput = filterRoot.querySelector("[data-filter-keyword]");
        const yearSelect = filterRoot.querySelector("[data-filter-year]");
        const typeSelect = filterRoot.querySelector("[data-filter-type]");
        const cards = Array.from(filterRoot.querySelectorAll("[data-title]"));
        const emptyState = filterRoot.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            const keyword = normalize(keywordInput ? keywordInput.value : "");
            const year = yearSelect ? yearSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.tags,
                    card.dataset.type,
                    card.dataset.year
                ].join(" "));
                const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchYear = !year || card.dataset.year === year;
                const matchType = !type || card.dataset.type === type;
                const matched = matchKeyword && matchYear && matchType;

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    }
})();
